import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import { ALIMENTOS } from '../utils/constants';
import { Plus, Trash2, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function Doacoes() {
  const [doadores, setDoadores] = useState([]);
  const [loadingDoadores, setLoadingDoadores] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [doacao, setDoacao] = useState({
    doador_id: '',
    data_hora: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    itens: [{ alimento_id: '', quantidade: 1 }]
  });

  useEffect(() => {
    const fetchDoadores = async () => {
      try {
        const response = await api.get('/doadores');
        if (response && response.status >= 200 && response.status < 300) {
          setDoadores(response.data);
        } else {
          throw new Error('Falha ao buscar doadores');
        }
      } catch (err) {
        console.error("Erro ao buscar doadores", err);
        setError('Não foi possível carregar a lista de doadores da API. O formulário não funcionará corretamente.');
      } finally {
        setLoadingDoadores(false);
      }
    };
    fetchDoadores();
  }, []);

  const handleAddItem = () => {
    setDoacao({
      ...doacao,
      itens: [...doacao.itens, { alimento_id: '', quantidade: 1 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItens = doacao.itens.filter((_, i) => i !== index);
    setDoacao({ ...doacao, itens: newItens });
  };

  const handleItemChange = (index, field, value) => {
    const newItens = [...doacao.itens];
    newItens[index][field] = value;
    setDoacao({ ...doacao, itens: newItens });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        doador_id: parseInt(doacao.doador_id),
        data_hora: new Date(doacao.data_hora).toISOString(),
        doacoes: doacao.itens.map(item => ({
          alimento_id: parseInt(item.alimento_id),
          quantidade: parseFloat(item.quantidade)
        }))
      };

      const response = await api.post('/doacoes/', payload);
      
      if (response && response.status >= 200 && response.status < 300) {
        setSuccess(true);
        setDoacao({
          doador_id: '',
          data_hora: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          itens: [{ alimento_id: '', quantidade: 1 }]
        });
      } else {
        throw new Error('Status de resposta inválido');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao registrar doação. Verifique os dados e a conexão com a API.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Registrar Doação</h1>
        <p className="mt-2 text-sm text-gray-500">Registre as entradas de alimentos no estoque com múltiplos itens.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center text-green-700 shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
              <p className="font-medium text-sm">Doação registrada com sucesso!</p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-red-700 shadow-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200/60 shadow-inner">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Doador</label>
                <select
                  required
                  value={doacao.doador_id}
                  onChange={(e) => setDoacao({ ...doacao, doador_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
                >
                  <option value="">Selecione um doador...</option>
                  {loadingDoadores ? (
                    <option disabled>Carregando...</option>
                  ) : (
                    doadores.map(d => (
                      <option key={d.id} value={d.id}>{d.nome} {d.sobrenome}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Data e Hora</label>
                <input
                  type="datetime-local"
                  required
                  value={doacao.data_hora}
                  onChange={(e) => setDoacao({ ...doacao, data_hora: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-800">Itens da Doação</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center bg-primary-50 px-4 py-2 rounded-xl transition-colors border border-primary-100 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Adicionar Item
                </button>
              </div>

              <div className="space-y-4">
                {doacao.itens.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start animate-in slide-in-from-left-4 duration-300">
                    <div className="flex-1 space-y-1">
                      <select
                        required
                        value={item.alimento_id}
                        onChange={(e) => handleItemChange(index, 'alimento_id', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm shadow-sm"
                      >
                        <option value="">Selecione o alimento</option>
                        {ALIMENTOS.map(a => (
                          <option key={a.id} value={a.id}>{a.nome} ({a.unidade})</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-32 space-y-1">
                      <input
                        type="number"
                        required
                        min="0.1"
                        step="0.1"
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm shadow-sm"
                        placeholder="Qtd"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={doacao.itens.length === 1}
                      className="mt-1 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 border border-transparent hover:border-red-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingSubmit || doacao.itens.length === 0}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 text-lg"
            >
              {loadingSubmit ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Send className="w-6 h-6 mr-2.5" />
                  Finalizar Registro
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
