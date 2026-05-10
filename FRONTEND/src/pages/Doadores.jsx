import { useState } from 'react';
import api from '../services/api';
import { UserPlus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function Doadores() {
  const [formData, setFormData] = useState({ nome: '', sobrenome: '', telefone: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post('/doadores/', formData);
      if (response && response.status >= 200 && response.status < 300) {
        setSuccess(true);
        setFormData({ nome: '', sobrenome: '', telefone: '' });
      } else {
        throw new Error('Status inesperado');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Doador já existe no sistema.');
      } else {
        setError(err.response?.data?.detail || 'Erro ao cadastrar doador. Verifique a conexão com a API.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cadastro de Doadores</h1>
        <p className="mt-2 text-sm text-gray-500">Adicione novos colaboradores ao nosso sistema.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center text-green-700 animate-in fade-in shadow-sm">
              <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
              <p className="font-medium text-sm">Doador cadastrado com sucesso!</p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-red-700 animate-in fade-in shadow-sm">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors outline-none shadow-sm"
                  placeholder="Ex: João"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sobrenome" className="block text-sm font-medium text-gray-700">Sobrenome</label>
                <input
                  type="text"
                  id="sobrenome"
                  name="sobrenome"
                  required
                  value={formData.sobrenome}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors outline-none shadow-sm"
                  placeholder="Ex: Silva"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                required
                value={formData.telefone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors outline-none shadow-sm"
                placeholder="(00) 00000-0000"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Cadastrar Doador
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
