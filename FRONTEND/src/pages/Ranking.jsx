import { useState, useEffect } from 'react';
import api from '../services/api';
import { Trophy, Medal, Award, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankingAndDoadores = async () => {
      try {
        setLoading(true);
        const [rankingRes, doadoresRes] = await Promise.all([
          api.get('/ranking'),
          api.get('/doadores')
        ]);

        if (!rankingRes || !doadoresRes || rankingRes.status >= 300 || doadoresRes.status >= 300) {
          throw new Error('Falha na resposta da API');
        }

        const doadores = doadoresRes.data;
        const rankingData = rankingRes.data;

        const enrichedRanking = rankingData.map(item => {
          const doador = doadores.find(d => d.id === item.doador_id);
          return {
            ...item,
            nome_completo: doador ? `${doador.nome} ${doador.sobrenome}` : `Doador #${item.doador_id}`
          };
        });

        setRanking(enrichedRanking);
      } catch (err) {
        setError('Não foi possível carregar o ranking. Verifique a conexão com a API.');
      } finally {
        setLoading(false);
      }
    };
    fetchRankingAndDoadores();
  }, []);

  const getRowStyle = (index) => {
    switch (index) {
      case 0: return 'bg-amber-50/60 border-amber-200';
      case 1: return 'bg-slate-50 border-slate-200';
      case 2: return 'bg-orange-50/60 border-orange-200';
      default: return 'bg-white border-gray-100';
    }
  };

  const getIcon = (index) => {
    switch (index) {
      case 0: return <Trophy className="w-7 h-7 text-amber-500 drop-shadow-sm" />;
      case 1: return <Medal className="w-7 h-7 text-slate-400 drop-shadow-sm" />;
      case 2: return <Medal className="w-7 h-7 text-orange-400 drop-shadow-sm" />;
      default: return <Award className="w-5 h-5 text-gray-300" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ranking de Doadores</h1>
          <p className="mt-2 text-sm text-gray-500">Os maiores colaboradores da nossa causa.</p>
        </div>
        <div className="w-16 h-16 bg-primary-100 rounded-2xl shadow-sm flex items-center justify-center rotate-3">
          <Trophy className="w-8 h-8 text-primary-600" />
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start shadow-sm mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Posição</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Doador</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Qtd. Doações</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Itens Doados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ranking.slice(0, 10).map((doador, index) => (
                  <tr 
                    key={index} 
                    className={clsx(
                      'transition-all duration-200 hover:scale-[1.005] hover:shadow-sm relative z-0 hover:z-10',
                      getRowStyle(index)
                    )}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="w-10 flex justify-center mr-3">{getIcon(index)}</span>
                        <span className="font-black text-gray-700 text-lg">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="font-bold text-gray-900 text-base">{doador.nome_completo}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary-50 text-primary-700 border border-primary-200 shadow-sm">
                        {doador.Doacoes || 0}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-semibold text-gray-600">
                      {doador.Alimentos || 0} un.
                    </td>
                  </tr>
                ))}
                
                {ranking.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Award className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="font-medium text-lg">Nenhum dado de ranking disponível ainda.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
