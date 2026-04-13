import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const CATEGORIAS = ['neurodivergência', 'bonsai', 'artes plásticas', 'jiu-jitsu', 'geral'];

export default function ArtigoEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    titulo: '', resumo: '', imagem_url: '', categoria: 'geral', publicado: true
  });
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // 1. Carrega dados
  useEffect(() => {
    if (!isNew) {
      api.get(`/artigos/${id}`)
        .then(res => {
          const a = res.data;
          setForm({
            titulo: a.titulo || '',
            resumo: a.resumo || '',
            imagem_url: a.imagem_url || '',
            categoria: a.categoria || 'geral',
            publicado: Boolean(a.publicado)
          });
          setConteudo(a.conteudo || '');
        })
        .catch(() => toast.error('Artigo não encontrado'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  // 2. Inicia Quill após dados carregarem
  useEffect(() => {
    async function initQuill() {
      if (!loading && editorRef.current && !quillRef.current) {
        const Quill = (await import('quill')).default;
        quillRef.current = new Quill(editorRef.current, {
          theme: 'snow',
          placeholder: 'Escreva o conteúdo do artigo...',
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['blockquote', 'code-block'],
              ['link'],
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim()) return toast.error('Título obrigatório');
    setSaving(true);
    try {
      const payload = { ...form, conteudo };
      if (isNew) {
        const res = await api.post('/artigos', payload);
        toast.success('Artigo criado!');
        navigate(`/artigos/${res.data.id}`);
      } else {
        await api.put(`/artigos/${id}`, payload);
        toast.success('Artigo atualizado!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  function set(field) { return e => setForm(prev => ({ ...prev, [field]: e.target.value })); }
  function setCheck(field) { return e => setForm(prev => ({ ...prev, [field]: e.target.checked })); }

  if (loading) return <div className="flex items-center justify-center h-full text-neutral-500 text-sm">Carregando...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Quill CSS */}
      <link rel="stylesheet" href="https://cdn.quilljs.com/1.3.7/quill.snow.css" />
      <style>{`
        .ql-toolbar { background: #1a1a1a; border-color: #333 !important; border-radius: 8px 8px 0 0; }
        .ql-toolbar button, .ql-toolbar .ql-picker-label { color: #aaa !important; }
        .ql-toolbar button:hover, .ql-toolbar button.ql-active { color: #f59e0b !important; }
        .ql-toolbar .ql-stroke { stroke: #aaa !important; }
        .ql-toolbar button:hover .ql-stroke, .ql-toolbar button.ql-active .ql-stroke { stroke: #f59e0b !important; }
        .ql-container { background: #171717; border-color: #333 !important; border-radius: 0 0 8px 8px; color: #e5e5e5; font-size: 15px; min-height: 300px; }
        .ql-editor.ql-blank::before { color: #555 !important; font-style: normal; }
      `}</style>

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/artigos')} className="text-neutral-500 hover:text-white transition-colors text-sm">← Artigos</button>
        <span className="text-neutral-700">/</span>
        <h1 className="text-xl font-bold text-white">{isNew ? 'Novo Artigo' : 'Editar Artigo'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Título *</label>
            <input type="text" value={form.titulo} onChange={set('titulo')} required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Categoria</label>
            <select value={form.categoria} onChange={set('categoria')}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors">
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Resumo (aparece no blog)</label>
          <textarea value={form.resumo} onChange={set('resumo')} rows={2}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none" />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Imagem de capa (URL)</label>
          <input type="text" value={form.imagem_url} onChange={set('imagem_url')}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
            placeholder="https://..." />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Conteúdo</label>
          <div ref={editorRef} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.publicado} onChange={setCheck('publicado')} className="accent-amber-500" />
            <span className="text-sm text-neutral-300">Publicar no site</span>
          </label>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/artigos')}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg px-4 py-2.5 text-sm transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-semibold rounded-lg px-6 py-2.5 text-sm transition-colors">
              {saving ? 'Salvando...' : isNew ? 'Publicar Artigo' : 'Salvar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
