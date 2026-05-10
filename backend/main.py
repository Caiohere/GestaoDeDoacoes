from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from pathlib import Path
from typing import Any, List
from datetime import datetime

class ItemDoado(BaseModel):
    alimento_id: int
    quantidade: float

class Doacao(BaseModel):
    doador_id: int
    data_hora: str
    doacoes: List[ItemDoado]  # Lista de objetos doados, cada um com alimento, quantidade e unidade

class Doador(BaseModel):
    nome: str
    sobrenome: str
    telefone: str

Alimentos = [{
    "Arroz": "kg",
    "Feijão": "kg",
    "Leite": "L",
    "Manteiga": "kg",
    "Margarina": "kg",
    "Raízes e Tubérculos": "kg",
    "Cocos": "un",
    "Café": "kg",
    "Óleo de soja": "L",
    "Farinha de mandioca": "kg",
    "Farinha de trigo": "kg",
    "Açúcar": "kg",
    "Macarrão": "kg",
    "Pão comum": "kg"
}]

CESTA_PADRAO = {
    "Arroz": 3.0,
    "Feijão": 4.5,
    "Leite": 7.5,
    "Manteiga": 0.75,
    "Margarina": 1.6,
    "Raízes e Tubérculos": 6.0,
    "Cocos": 1.0,
    "Café": 0.6,
    "Óleo de soja": 1.0,
    "Farinha de mandioca": 1.5,
    "Farinha de trigo": 1.5,
    "Açúcar": 3.0,
    "Macarrão": 1.0,
    "Pão comum": 1.0
}



# Criar banco SQLite na inicialização
def init_db(db_path='data.db'):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Criar tabela de alimentos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alimentos (
            id INTEGER PRIMARY KEY,
            nome TEXT NOT NULL,
            unidade TEXT NOT NULL
        )
    ''')

    # Inserir alimentos na tabela
    for idx, (nome, unidade) in enumerate(Alimentos[0].items(), start=1):
        cursor.execute('''
            INSERT OR IGNORE INTO alimentos (id, nome, unidade) VALUES (?, ?, ?)
        ''', (idx, nome, unidade))
  
    
    # Criar tabela doadores
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doadores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            sobrenome TEXT NOT NULL,
            telefone TEXT NOT NULL
        )
    ''')
    
    # Criar tabela doacoes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doador_id INTEGER NOT NULL,
            alimento_id TEXT NOT NULL,
            quantidade REAL NOT NULL,
            data_hora TEXT NOT NULL,
            FOREIGN KEY (doador_id) REFERENCES doadores(id)
            FOREIGN KEY (alimento_id) REFERENCES alimentos(id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Inicializar banco ao iniciar
init_db()

app = FastAPI(title="Cesta API")

# Habilitar CORS para frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique domínios reais
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conectar ao banco para consultas
def get_conn():
    conn = sqlite3.connect('data.db')
    conn.row_factory = sqlite3.Row  # Para retornar dicionários
    return conn

# Rota principal
@app.get("/")
async def root():
    return {
        "mensagem": "API Cesta - Mais que Basica",
        "status": "rodando",
        "banco": "SQLite real"
    }

# Rota: Listar doadores
@app.get("/doadores")
async def get_doadores():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM doadores LIMIT 50")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Rota: Listar doações
@app.get("/doacoes")
async def get_doacoes():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM doacoes LIMIT 100")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Rota: Ranking
@app.get("/ranking")
async def get_ranking():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""SELECT doador_id, count(id) as Doacoes, SUM(quantidade) as Alimentos 
                        FROM doacoes group by doador_id 
                       ORDER BY doador_id, SUM(quantidade) LIMIT 10;""")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Rota: Relatório por alimento
@app.get("/relatorio/{alimento}")
async def get_relatorio(alimento: int):
    conn = get_conn()
    cursor = conn.cursor()
    try:
        cursor.execute("""SELECT COUNT(quantidade) AS Quantidade 
                            FROM doacoes 
                           WHERE alimento_id = ?""", (alimento,))
        rows = cursor.fetchall()
    except Exception as e:
        return {"mensagem": "Erro ao buscar relatório", "status": 500, "erro": str(e)}                   
    finally:
        conn.close()

    return {
        "alimento": alimento,
        "doacoes": [dict(row) for row in rows]
    }

@app.get("/cestas/{data}")
async def get_cestas(data: str):
    estoque_total = {alimento: 0 for alimento in CESTA_PADRAO.keys()}
    cestas_por_alimento = {alimento: 0 for alimento in CESTA_PADRAO.keys()}

    conn = get_conn()

    data_periodo = data[0:7] #Slicing da data timestamp ISO 8601

    # Busca pelo estoque mensal
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT ali.nome as alimento, SUM(doa.quantidade) as quantidade
                FROM doacoes doa
                INNER join alimentos ali
                ON ali.id = doa.alimento_id
                WHERE doa.data_hora like ?
                GROUP BY doa.alimento_id
        """, ('%' + data_periodo + '%',))
        rows = cursor.fetchall()
        
        estoque_mensal = [dict[Any, Any](row) for row in rows] 

        print(estoque_mensal)

        # Preenche o estoque com a quantidade de doações do mês
        for registro in estoque_mensal:
            alimento = registro['alimento']
            quantidade = registro['quantidade']
            if alimento in estoque_total:
                estoque_total[alimento] = quantidade

        # Determina quantas cestas serão criadas
        for alimento, quantidade in estoque_total.items():
            cestas_por_alimento[alimento] = estoque_total[alimento] // CESTA_PADRAO[alimento]

        quantidade_cestas = max(cestas_por_alimento.values())


        #Lista de Cestas
        lista_cestas = []


        for i in range(int(quantidade_cestas)):
            cesta_atual = {"completa": bool, "itens": {}}
            for alimento in CESTA_PADRAO.keys():
                # verifica quanto ainda tem do alimento no estoque
                qtd_estoque = estoque_total.get(alimento, 0)
                qtd_necessaria = CESTA_PADRAO[alimento]
                
                # Se ainda tem suficiente pra colocar na cesta, tira do estoque e põe na cesta
                if qtd_estoque >= qtd_necessaria:
                    cesta_atual["itens"][alimento] = qtd_necessaria
                    estoque_total[alimento] -= qtd_necessaria
                elif qtd_estoque > 0:
                    # Não tem o suficiente, coloca o que tem e zera o estoque
                    cesta_atual["itens"][alimento] = qtd_estoque
                    estoque_total[alimento] = 0 
                else:
                    # Não tem nada          
                    cesta_atual["itens"][alimento] = 0
         

                COMPLETO = True
                for alimento in cesta_atual["itens"].keys():
                    if cesta_atual["itens"][alimento] == CESTA_PADRAO[alimento]:
                        COMPLETO = True
                    else:
                        COMPLETO = False
                        break
                
                cesta_atual["completa"] = COMPLETO  

            lista_cestas.append(cesta_atual)
            

        return {"quantidade": quantidade_cestas,"lista_cestas":lista_cestas, "estoque_total":estoque_total}
    except Exception as e:
        return {"mensagem": "Erro ao buscar cestas", "status": 500, "erro": str(e)}                   
    finally:
        conn.close()
    
# Rota: Adicionar doador (exemplo de escrita)
@app.post("/doadores/")
async def add_doador(doador: Doador):
    conn = get_conn()
    cursor = conn.cursor()
    try:
        # Validar se já existe
        cursor.execute("SELECT * FROM doadores WHERE upper(nome) = ? AND upper(sobrenome) = ?", (doador.nome.upper(), doador.sobrenome.upper()))
        if cursor.fetchone():
            return {"mensagem": "Doador já existe", "status": 400}
        
        cursor.execute(
            "INSERT INTO doadores (nome, sobrenome, telefone) VALUES (?, ?, ?)",
            (doador.nome.upper(), doador.sobrenome.upper(), doador.telefone)
        )
        conn.commit()
        doador_id = cursor.lastrowid
    except Exception as e:
        conn.rollback()
        return {"mensagem": "Erro ao adicionar doador", "status": 500}
    finally:
        conn.close()

    return {"mensagem": "Doador adicionado", "doador": doador}

# Rota: Adicionar doação
@app.post("/doacoes/")
async def add_doacao(doacao: Doacao):
    conn = get_conn()
    cursor = conn.cursor() 
    
    try:
        # Validar doador
        cursor.execute("SELECT id FROM doadores WHERE id = ?", (doacao.doador_id,))
        if not cursor.fetchone():
            return {"mensagem": "Doador não encontrado", "status": 404}
        
        # Supondo que doacao.doacoes é uma lista de objetos com os campos alimento_id e quantidade
        for doacao_item in doacao.doacoes:
            # Validar alimento
            cursor.execute("SELECT id FROM alimentos WHERE id = ?", (doacao_item.alimento_id,))
            if not cursor.fetchone():
                return {"mensagem": f"Alimento com id {doacao_item.alimento_id} não encontrado", "status": 404}

            cursor.execute(
                "INSERT INTO doacoes (doador_id, alimento_id, quantidade, data_hora) VALUES (?, ?, ?, ?)",
                (doacao.doador_id, doacao_item.alimento_id, doacao_item.quantidade, doacao.data_hora)
            )
            
        conn.commit()
        doacao_id = cursor.lastrowid

    except Exception as e:
        conn.rollback()
        return {"mensagem": f"Erro ao adicionar doação: {str(e)}", "status": 500, "erro": str(e)}
   
    finally:
        conn.close()
    return {"mensagem": "Doação adicionada", "doacao": doacao}




    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

