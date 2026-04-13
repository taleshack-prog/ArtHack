import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

function StatCard({ label, value, icon, to, color = 'amber' }) {
  const colors = {
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  };
  return (
    <Link to={to} className={`block p-5 rounded-xl border ${colors[color]} hover:opacity-80 transition-opacity`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <p className="text-sm font-medium">{label}</p>
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ obras: 0, artigos: 0, fotos: 0, disponivel: 0 });
  const [recentObras, setRecentObras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [obrasRes, artigosRes, fotosRes] = await Promise.all([
          api.get('/obras?limit=100'),
          api.get('/artigos?limit=100&publicado=true'),
          api.get('/fotos?limit=100')
        ]);
        const obras = obrasRes.data.obras || [];
        setStats({
          obras: obrasRes.data.total || 0,
          artigos: artigosRes.data.total || 0,
          fotos: fotosRes.data.total || 0,
          disponivel: obras.filter(o => o.disponivel).length
        });
        setRecentObras(obras.slice(0, 5));
      } catch {
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleExport() {
    try {
      const res = await api.get('/export/json', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arthack-data.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('JSON exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-500 text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Visão geral do seu portfólio</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm text-neutral-300 px-4 py-2 rounded-lg transition-colors"
        >
          <span>↓</span>
          Exportar JSON
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total de Obras" value={stats.obras} icon="🗿" to="/obras" color="amber" />
        <StatCard label="Disponíveis" value={stats.disponivel} icon="✅" to="/obras" color="green" />
        <StatCard label="Artigos" value={stats.artigos} icon="✍️" to="/artigos" color="blue" />
        <StatCard label="Fotos" value={stats.fotos} icon="📷" to="/fotos" color="purple" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/obras/nova" className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-amber-500/40 transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">+</div>
          <div>
            <p className="text-sm font-medium text-white">Nova Obra</p>
            <p className="text-xs text-neutral-500">Adicionar escultura ou arte</p>
          </div>
        </Link>
        <Link to="/artigos/novo" className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-blue-500/40 transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">+</div>
          <div>
            <p className="text-sm font-medium text-white">Novo Artigo</p>
            <p className="text-xs text-neutral-500">Escrever para o blog</p>
          </div>
        </Link>
        <Link to="/fotos" className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-purple-500/40 transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">↑</div>
          <div>
            <p className="text-sm font-medium text-white">Upload Fotos</p>
            <p className="text-xs text-neutral-500">Gerenciar galeria</p>
          </div>
        </Link>
      </div>

      {/* Recent obras */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-white">Obras Recentes</h2>
          <Link to="/obras" className="text-xs text-amber-400 hover:text-amber-300">Ver todas →</Link>
        </div>
        <div className="divide-y divide-neutral-800">
          {recentObras.length === 0 && (
            <div className="px-5 py-8 text-center text-neutral-600 text-sm">Nenhuma obra cadastrada</div>
          )}
          {recentObras.map(obra => (
            <Link key={obra.id} to={`/obras/${obra.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-800 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 overflow-hidden flex-shrink-0">
                {obra.thumbnail_url || obra.imagem_url ? (
                  <img src={obra.thumbnail_url || obra.imagem_url} alt={obra.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 text-lg">🗿</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{obra.titulo}</p>
                <p className="text-xs text-neutral-500">{obra.colecao || obra.categoria}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-green-400">
                  R$ {Number(obra.preco).toLocaleString('pt-BR')}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${obra.disponivel ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {obra.disponivel ? 'Disponível' : 'Vendida'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
