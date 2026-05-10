import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import { ALIMENTOS } from '../utils/constants';
import { PackageOpen, AlertCircle, Loader2, Calendar, ShoppingBasket, X } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // State for the modal
  const [selectedBasket, setSelectedBasket] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/cestas/${selectedMonth}`);
        if (response && response.status >= 200 && response.status < 300) {
          setData(response.data);
        } else {
          throw new Error('Falha na resposta da API');
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Não foi possível carregar os dados do dashboard. Verifique a API.');
      } finally {
        setLoading(false);
      }
    };
    if (selectedMonth) {
      fetchData();
    }
  }, [selectedMonth]);

  const estoqueTotal = data?.estoque_total || {};
  const listaCestas = data?.lista_cestas || [];

  const getEstoque = (nome) => {
    return estoqueTotal[nome] || 0;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard de Progresso</h1>
          <p className="mt-2 text-sm text-gray-500">Resumo das cestas e inventário para o período selecionado.</p>
        </div>

        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="outline-none text-gray-700 font-medium bg-transparent cursor-pointer"
          />
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <PackageOpen className="w-5 h-5 mr-3 text-primary-500" />
              Cestas do Mês ({listaCestas.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {listaCestas.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 text-center p-6 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  Nenhuma cesta formada neste mês.
                </div>
              ) : (
                listaCestas.map((cesta, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedBasket({ ...cesta, index: idx + 1 })}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group cursor-pointer hover:shadow-md hover:border-primary-300 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-2 left-2 text-xs font-bold text-gray-400">#{idx + 1}</span>

                    <div className={`relative p-4 rounded-full mb-4 transition-transform duration-500 group-hover:scale-110 z-10 ${cesta.completa ? 'bg-primary-50 text-primary-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                      <ShoppingBasket className="w-10 h-10" strokeWidth={1.5} />
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider z-10 shadow-sm ${cesta.completa ? 'bg-primary-100 text-primary-700 border border-primary-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                      {cesta.completa ? 'Completa' : 'Parcial'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <PackageOpen className="w-6 h-6 mr-3 text-primary-500" />
                Estoque Restante do Mês
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {ALIMENTOS.map((alimento) => {
                const estoque = getEstoque(alimento.nome);
                const meta = alimento.meta_cesta;
                const percent = Math.min((estoque / meta) * 100, 100);

                let colorClass = 'bg-gray-100';
                let barClass = 'bg-gray-400';
                if (estoque >= meta) {
                  barClass = 'bg-primary-500';
                } else if (estoque > 0) {
                  barClass = 'bg-yellow-400';
                } else {
                  barClass = 'bg-red-400';
                }

                return (
                  <div key={alimento.id} className="space-y-2 group">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 group-hover:text-primary-600 transition-colors">{alimento.nome}</span>
                      <span className="text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        {estoque} / {meta} <span className="text-xs text-gray-400">{alimento.unidade}</span>
                      </span>
                    </div>
                    <div className={`h-2.5 w-full rounded-full overflow-hidden shadow-inner ${colorClass}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${barClass}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Cesta Details */}
      {selectedBasket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedBasket(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className={`px-6 py-4 flex items-center justify-between border-b ${selectedBasket.completa ? 'bg-primary-50 border-primary-100' : 'bg-yellow-50 border-yellow-100'
              }`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${selectedBasket.completa ? 'bg-primary-100 text-primary-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                  <ShoppingBasket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Cesta #{selectedBasket.index}</h3>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${selectedBasket.completa ? 'text-primary-600' : 'text-yellow-600'
                    }`}>
                    {selectedBasket.completa ? 'Cesta Completa' : 'Cesta Parcial'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBasket(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Conteúdo da Cesta</h4>
              <div className="space-y-3">
                {Object.entries(selectedBasket.itens || {}).map(([nome, quantidade]) => {
                  const alimentoRef = ALIMENTOS.find(a => a.nome === nome);
                  const unidade = alimentoRef ? alimentoRef.unidade : '';
                  const meta = alimentoRef ? alimentoRef.meta_cesta : 0;
                  
                  const isComplete = quantidade >= meta && meta > 0;
                  const isEmpty = quantidade === 0;
                  const isPartial = !isComplete && !isEmpty;

                  let borderClass = 'bg-gray-50 border-transparent opacity-60';
                  let dotClass = 'bg-gray-300';
                  let textClass = 'text-gray-500 line-through';

                  if (isComplete) {
                    borderClass = 'bg-white border-gray-200 shadow-sm hover:border-primary-200';
                    dotClass = 'bg-primary-500 shadow-sm shadow-primary-200';
                    textClass = 'text-gray-700';
                  } else if (isPartial) {
                    borderClass = 'bg-white border-yellow-200 shadow-sm hover:border-yellow-300';
                    dotClass = 'bg-yellow-400 shadow-sm shadow-yellow-200';
                    textClass = 'text-gray-700';
                  }

                  return (
                    <div key={nome} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${borderClass}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${dotClass}`} />
                        <span className={`font-medium ${textClass}`}>
                          {nome}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg text-sm">
                        {quantidade} / {meta} <span className="text-gray-500 text-xs font-normal">{unidade}</span>
                      </span>
                    </div>
                  );
                })}

                {Object.keys(selectedBasket.itens || {}).length === 0 && (
                  <div className="text-center text-gray-500 py-4">Nenhum item registrado.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
