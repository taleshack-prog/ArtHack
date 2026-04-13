import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

export default function Artigos() {
  const [artigos, setArtigos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/artigos?limit=100&publicado=true')
      .then(res => setArtigos(res.data.artigos || []))
      .catch(() => toast.error('Erro ao carregar artigos'))
      .finally(() => setLoading(false));
  }, []);

  async function togglePublicado(artigo) {
    try {
      const res = await api.put(`/artigos/${artigo.id}`, { publicado: !artigo.publicado });
      setArtigos(prev => prev.map(a => a.id === artigo.id ? res.data : a));
      toast.success(res.data.publicado ? 'Artigo publicado' : 'Artigo despublicado');
    } catch { toast.error('Erro ao atualizar'); }
  }

  async function deleteArtigo(artigo) {
    if (!confirm(`Deletar "${artigo.titulo}"?`)) return;
    try {
      await api.delete(`/artigos/${artigo.id}`);
      setArtigos(prev => prev.filter(a => a.id !== artigo.id));
      toast.success('Artigo deletado');
    } catch { toast.error('Erro ao deletar'); }
  }

  if (loading) return <div className="flex items-center justify-center h-full text-neutral-500 text-sm">Carregando...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Artigos</h1>
          <p className="text-sm text-neutral-500 mt-1">{artigos.length} artigos</p>
        </div>
        <Link to="/artigos/novo" className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
          + Novo Artigo
        </Link>
      </div>

      <div className="space-y-3">
        {artigos.map(artigo => (
          <div key={artigo.id} className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4 group hover:border-neutral-700 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-xl flex-shrink-0">
              {artigo.categoria === 'neurodivergência' ? '🧠' : artigo.categoria === 'bonsai' ? '🌳' : artigo.categoria === 'jiu-jitsu' ? '🥋' : '✍️'}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/artigos/${artigo.id}`} className="text-sm font-semibold text-white hover:text-amber-400 transition-colors block truncate">
                {artigo.titulo}
              </Link>
              <p className="text-xs text-neutral-500 mt-0.5">{artigo.categoria} · {new Date(artigo.data_publicacao || artigo.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => togglePublicado(artigo)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${artigo.publicado ? 'bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400' : 'bg-neutral-800 text-neutral-400 hover:bg-green-500/10 hover:text-green-400'}`}>
                {artigo.publicado ? 'Publicado' : 'Rascunho'}
              </button>
              <Link to={`/artigos/${artigo.id}`} className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-neutral-300 transition-colors">
                Editar
              </Link>
              <button onClick={() => deleteArtigo(artigo)} className="text-xs bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-red-400 transition-colors">
                Deletar
              </button>
            </div>
          </div>
        ))}
        {artigos.length === 0 && (
          <div className="text-center py-16 text-neutral-600">
            <div className="text-4xl mb-3">✍️</div>
            <p className="text-sm">Nenhum artigo. <Link to="/artigos/novo" className="text-amber-400">Criar o primeiro →</Link></p>
          </div>
        )}
      </div>
    </div>
  );
}
