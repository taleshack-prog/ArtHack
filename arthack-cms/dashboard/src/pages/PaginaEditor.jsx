import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const PAGINAS = {
  'sobre': 'Minha História',
  'contato': 'Contato'
};

export default function PaginaEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const [titulo, setTitulo] = useState('');
  const [imagem_url, setImagemUrl] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carrega dados primeiro
  useEffect(() => {
    api.get(`/paginas/${slug}`)
      .then(res => {
        setTitulo(res.data.titulo || PAGINAS[slug] || '');
        setImagemUrl(res.data.imagem_url || '');
        setConteudo(res.data.conteudo || '');
      })
      .catch(() => toast.error('Erro ao carregar página'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Inicia Quill só depois que os dados chegaram
  useEffect(() => {
    async function initQuill() {
      if (!loading && editorRef.current && !quillRef.current) {
        const Quill = (await import('quill')).default;
        quillRef.current = new Quill(editorRef.current, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['blockquote', 'link'],
              ['clean']
            ]
          }
        });
        quillRef.current.root.innerHTML = conteudo;
        quillRef.current.on('text-change', () => {
          setConteudo(quillRef.current.root.innerHTML);
        });
      }
    }
    initQuill();
  }, [loading]);

  async function handleSave() {
    setSaving(true);
    try {
      await api.put(`/paginas/${slug}`, { titulo, conteudo, imagem_url });
      toast.success('Página salva!');
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-full text-neutral-500 text-sm">Carregando...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <link rel="stylesheet" href="https://cdn.quilljs.com/1.3.7/quill.snow.css" />
      <style>{`
        .ql-toolbar { background: #1a1a1a; border-color: #333 !important; border-radius: 8px 8px 0 0; }
        .ql-toolbar button, .ql-toolbar .ql-picker-label { color: #aaa !important; }
        .ql-toolbar button:hover, .ql-toolbar button.ql-active { color: #f59e0b !important; }
        .ql-toolbar .ql-stroke { stroke: #aaa !important; }
        .ql-toolbar button:hover .ql-stroke, .ql-toolbar button.ql-active .ql-stroke { stroke: #f59e0b !important; }
        .ql-container { background: #171717; border-color: #333 !important; border-radius: 0 0 8px 8px; color: #e5e5e5; font-size: 15px; min-height: 400px; }
        .ql-editor.ql-blank::before { color: #555 !important; font-style: normal; }
      `}</style>

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-neutral-500 hover:text-white transition-colors text-sm">← Dashboard</button>
        <span className="text-neutral-700">/</span>
        <h1 className="text-xl font-bold text-white">{PAGINAS[slug] || slug}</h1>
      </div>

      <div className="space-y-5">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Título da Página</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Foto de capa (URL)</label>
            <input type="text" value={imagem_url} onChange={e => setImagemUrl(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="https://res.cloudinary.com/..." />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Conteúdo</label>
          <div ref={editorRef} />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-semibold rounded-xl py-3 text-sm transition-colors">
          {saving ? 'Salvando...' : '💾 Salvar Página'}
        </button>
      </div>
    </div>
  );
}
