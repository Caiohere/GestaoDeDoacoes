export const ALIMENTOS = [
  { id: 1, nome: "Arroz", unidade: "kg", meta_cesta: 3.0 },
  { id: 2, nome: "Feijão", unidade: "kg", meta_cesta: 4.5 },
  { id: 3, nome: "Leite", unidade: "L", meta_cesta: 7.5 },
  { id: 4, nome: "Manteiga", unidade: "kg", meta_cesta: 0.75 },
  { id: 5, nome: "Margarina", unidade: "kg", meta_cesta: 1.6 },
  { id: 6, nome: "Raízes e Tubérculos", unidade: "kg", meta_cesta: 6.0 },
  { id: 7, nome: "Cocos", unidade: "un", meta_cesta: 1.0 },
  { id: 8, nome: "Café", unidade: "kg", meta_cesta: 0.6 },
  { id: 9, nome: "Óleo de soja", unidade: "L", meta_cesta: 1.0 },
  { id: 10, nome: "Farinha de mandioca", unidade: "kg", meta_cesta: 1.5 },
  { id: 11, nome: "Farinha de trigo", unidade: "kg", meta_cesta: 1.5 },
  { id: 12, nome: "Açúcar", unidade: "kg", meta_cesta: 3.0 },
  { id: 13, nome: "Macarrão", unidade: "kg", meta_cesta: 1.0 },
  { id: 14, nome: "Pão comum", unidade: "kg", meta_cesta: 1.0 }
];

export const getAlimentoNome = (id) => {
  const alimento = ALIMENTOS.find(a => a.id === parseInt(id));
  return alimento ? `${alimento.nome} (${alimento.unidade})` : "Desconhecido";
};
