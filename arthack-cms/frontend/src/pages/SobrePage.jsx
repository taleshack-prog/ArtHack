import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function SobrePage() {
  const [pagina, setPagina] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/paginas/sobre`)
      .then(r => r.json())
      .then(setPagina)
      .catch(() => setPagina(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#0c0a09'}}>
      <p className="text-neutral-500">Carregando...</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{background:'#0c0a09', color:'#e7e5e4'}}>
      <div className="border-b border-stone-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold" style={{fontFamily:"'Playfair Display',serif"}}>
            Tales <span className="text-amber-400">Hack</span>
          </Link>
          <Link to="/" className="text-sm text-stone-500 hover:text-amber-400 transition-colors">← Voltar</Link>
        </div>
      </div>

      {pagina?.imagem_url && (
        <div className="w-full h-64 md:h-80 overflow-hidden">
          <img src={pagina.imagem_url} alt={pagina.titulo} className="w-full h-full object-cover opacity-60" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-10" style={{fontFamily:"'Playfair Display',serif"}}>
          {pagina?.titulo || 'Minha História'}
        </h1>

        <div
          className="prose"
          style={{lineHeight:'1.8', fontSize:'1.05rem', color:'#d6d3d1'}}
          dangerouslySetInnerHTML={{ __html: pagina?.conteudo || '<p>Em breve...</p>' }}
        />

        <div className="mt-16 pt-8 border-t border-stone-800">
          <Link to="/" className="text-sm text-stone-500 hover:text-amber-400 transition-colors">← Voltar ao início</Link>
        </div>
      </article>

      <style>{`
        .prose h1,.prose h2,.prose h3{font-family:'Playfair Display',serif;color:#f5f5f4;margin-top:2em;margin-bottom:0.5em}
        .prose h2{font-size:1.6rem}.prose h3{font-size:1.3rem}
        .prose p{margin-bottom:1.2em}
        .prose strong{color:#fbbf24}
        .prose blockquote{border-left:3px solid #f59e0b;padding-left:1em;color:#a8a29e;font-style:italic}
        .prose ul,.prose ol{padding-left:1.5em;margin-bottom:1em}
        .prose li{margin-bottom:0.4em}
        .prose a{color:#fbbf24;text-decoration:underline}
      `}</style>
    </div>
  );
}
