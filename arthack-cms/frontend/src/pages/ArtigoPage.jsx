import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ArtigoPage() {
  const { id } = useParams();
  const [artigo, setArtigo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/artigos/${id}`)
      .then(r => r.json())
      .then(setArtigo)
      .catch(() => setArtigo(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#0c0a09'}}>
      <p className="text-neutral-500">Carregando...</p>
    </div>
  );

  if (!artigo) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{background:'#0c0a09'}}>
      <p className="text-neutral-400">Artigo não encontrado</p>
      <Link to="/" className="text-amber-400 hover:text-amber-300">← Voltar ao início</Link>
    </div>
  );

  const getCatIcon = (cat) => ({
    'neurodivergência': '🧠', 'bonsai': '🌳', 'artes plásticas': '🎨', 'jiu-jitsu': '🥋'
  }[cat] || '✍️');

  return (
    <div className="min-h-screen" style={{background:'#0c0a09', color:'#e7e5e4'}}>
      {/* Header */}
      <div className="border-b border-stone-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold" style={{fontFamily:"'Playfair Display',serif"}}>
            Tales <span className="text-amber-400">Hack</span>
          </Link>
          <Link to="/" className="text-sm text-stone-500 hover:text-amber-400 transition-colors">
            ← Voltar
          </Link>
        </div>
      </div>

      {/* Capa */}
      {artigo.imagem_url && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img src={artigo.imagem_url} alt={artigo.titulo} className="w-full h-full object-cover opacity-70" />
        </div>
      )}

      {/* Conteúdo */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{getCatIcon(artigo.categoria)}</span>
            <span className="text-xs text-amber-400 uppercase tracking-widest">{artigo.categoria}</span>
            <span className="text-xs text-stone-600">·</span>
            <span className="text-xs text-stone-500">
              {new Date(artigo.data_publicacao || artigo.created_at).toLocaleDateString('pt-BR', {day:'numeric', month:'long', year:'numeric'})}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6" style={{fontFamily:"'Playfair Display',serif"}}>
            {artigo.titulo}
          </h1>
          {artigo.resumo && (
            <p className="text-lg text-stone-400 leading-relaxed border-l-2 border-amber-500 pl-4">
              {artigo.resumo}
            </p>
          )}
        </div>

        {/* Corpo do artigo */}
        <div
          className="prose prose-invert max-w-none"
          style={{
            lineHeight: '1.8',
            fontSize: '1.05rem',
            color: '#d6d3d1'
          }}
          dangerouslySetInnerHTML={{ __html: artigo.conteudo }}
        />

        {/* Footer do artigo */}
        <div className="mt-16 pt-8 border-t border-stone-800 flex items-center justify-between">
          <Link to="/" className="text-sm text-stone-500 hover:text-amber-400 transition-colors">
            ← Voltar ao início
          </Link>
          <span className="text-xs text-stone-700">Tales Hack © 2025</span>
        </div>
      </article>

      <style>{`
        .prose h1, .prose h2, .prose h3 { font-family: 'Playfair Display', serif; color: #f5f5f4; margin-top: 2em; margin-bottom: 0.5em; }
        .prose h2 { font-size: 1.6rem; }
        .prose h3 { font-size: 1.3rem; }
        .prose p { margin-bottom: 1.2em; }
        .prose strong { color: #fbbf24; }
        .prose blockquote { border-left: 3px solid #f59e0b; padding-left: 1em; color: #a8a29e; font-style: italic; }
        .prose ul, .prose ol { padding-left: 1.5em; margin-bottom: 1em; }
        .prose li { margin-bottom: 0.4em; }
        .prose a { color: #fbbf24; text-decoration: underline; }
        .prose code { background: #1c1917; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
      `}</style>
    </div>
  );
}
