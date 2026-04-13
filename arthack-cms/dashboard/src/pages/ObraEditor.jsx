import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../api';
import toast from 'react-hot-toast';

const CATEGORIAS = ['escultura', 'pintura', 'desenho', 'instalação', 'gravura', 'fotografia', 'misto', 'outro'];
const COLECOES = ['URUGUAY', 'Metamorphosis', 'Neurodivergência', 'Bonsai', 'Avulso'];

export default function ObraEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState({
    titulo: '', descricao: '', preco: '', imagem_url: '', thumbnail_url: '',
    imagem_secundaria: '',
    categoria: 'escultura', colecao: '', disponivel: true, destaque: false
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isNew) {
      api.get(`/obras/${id}`)
        .then(res => {
          const o = res.data;
          setForm({
            titulo: o.titulo || '',
            descricao: o.descricao || '',
            preco: o.preco || '',
            imagem_url: o.imagem_url || '',
            thumbnail_url: o.thumbnail_url || '',
            imagem_secundaria: o.imagem_secundaria || '',
            categoria: o.categoria || 'escultura',
            colecao: o.colecao || '',
            disponivel: Boolean(o.disponivel),
            destaque: Boolean(o.destaque)
          });
        })
        .catch(() => toast.error('Obra não encontrada'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({
        ...prev,
        imagem_url: res.data.url,
        thumbnail_url: res.data.thumbnail_url || res.data.url
      }));
      toast.success('Imagem enviada!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro no upload');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024
  });

  const onDropSecundaria = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, imagem_secundaria: res.data.url }));
      toast.success('Imagem secundária enviada!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro no upload');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps: getRootPropsSecundaria, getInputProps: getInputPropsSecundaria, isDragActive: isDragActiveSecundaria } = useDropzone({
    onDrop: onDropSecundaria,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim()) return toast.error('Título é obrigatório');
    setSaving(true);
    try {
      const payload = { ...form, preco: parseFloat(form.preco) || 0 };
      if (isNew) {
        const res = await api.post('/obras', payload);
        toast.success('Obra criada!');
        navigate(`/obras/${res.data.id}`);
      } else {
        await api.put(`/obras/${id}`, payload);
        toast.success('Obra atualizada!');
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/obras')} className="text-neutral-500 hover:text-white transition-colors text-sm">← Obras</button>
        <span className="text-neutral-700">/</span>
        <h1 className="text-xl font-bold text-white">{isNew ? 'Nova Obra' : 'Editar Obra'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Informações</h2>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Título *</label>
              <input type="text" value={form.titulo} onChange={set('titulo')} required
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Descrição</label>
              <textarea value={form.descricao} onChange={set('descricao')} rows={5}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Preço (R$)</label>
                <input type="number" value={form.preco} onChange={set('preco')} step="0.01" min="0"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Categoria</label>
                <select value={form.categoria} onChange={set('categoria')}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors">
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Coleção</label>
              <input type="text" value={form.colecao} onChange={set('colecao')} list="colecoes-list"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Ex: URUGUAY, Metamorphosis..." />
              <datalist id="colecoes-list">
                {COLECOES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.disponivel} onChange={setCheck('disponivel')} className="accent-amber-500" />
                <span className="text-sm text-neutral-300">Disponível para venda</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.destaque} onChange={setCheck('destaque')} className="accent-amber-500" />
                <span className="text-sm text-neutral-300">Destaque</span>
              </label>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">URL da Imagem (manual)</h2>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">URL da imagem principal</label>
              <input type="text" value={form.imagem_url} onChange={set('imagem_url')}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="https://... ou assets/art/obra.jpg" />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-semibold rounded-lg py-2.5 text-sm transition-colors">
              {saving ? 'Salvando...' : isNew ? 'Criar Obra' : 'Salvar Alterações'}
            </button>
            <button type="button" onClick={() => navigate('/obras')}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg px-4 py-2.5 text-sm transition-colors">
              Cancelar
            </button>
          </div>
        </div>

        {/* Right: Image upload + preview */}
        <div className="space-y-4">
          {/* Upload zone */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Upload de Imagem</h2>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-700 hover:border-neutral-600'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} disabled={uploading} />
              <div className="text-3xl mb-2">{uploading ? '⏳' : '📁'}</div>
              <p className="text-sm text-neutral-400">
                {uploading ? 'Enviando...' : isDragActive ? 'Solte aqui!' : 'Arraste uma imagem ou clique para selecionar'}
              </p>
              <p className="text-xs text-neutral-600 mt-1">JPG, PNG, WebP · Máx 15MB</p>
            </div>
          </div>

          {/* Upload secundária */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mt-4">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Imagem Secundária
            </h2>
            <p className="text-xs text-neutral-600 mb-4">Diploma, detalhe, certificado ou foto do processo</p>
            <div
              {...getRootPropsSecundaria()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActiveSecundaria ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-700 hover:border-neutral-600'}`}
            >
              <input {...getInputPropsSecundaria()} disabled={uploading} />
              <div className="text-2xl mb-2">{uploading ? '⏳' : '🏅'}</div>
              <p className="text-sm text-neutral-400">
                {uploading ? 'Enviando...' : isDragActiveSecundaria ? 'Solte aqui!' : 'Arraste diploma ou imagem secundária'}
              </p>
            </div>
            {form.imagem_secundaria && (
              <div className="mt-3 flex items-center gap-3">
                <img src={form.imagem_secundaria} alt="Secundária" className="w-20 h-20 rounded-lg object-cover border border-neutral-700" />
                <div>
                  <p className="text-xs text-green-400">✓ Imagem secundária carregada</p>
                  <button onClick={() => setForm(p => ({ ...p, imagem_secundaria: '' }))}
                    className="text-xs text-red-400 hover:text-red-300 mt-1">
                    Remover
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Preview</h2>
            {form.imagem_url ? (
              <div className="space-y-3">
                <img src={form.imagem_url} alt="Preview" className="w-full rounded-lg object-cover max-h-64" />
                <div className="bg-neutral-800 rounded-lg p-4">
                  <h3 className="font-bold text-white text-lg">{form.titulo || 'Título da Obra'}</h3>
                  <p className="text-green-400 font-bold text-xl mt-1">
                    R$ {form.preco ? Number(form.preco).toLocaleString('pt-BR') : '0'}
                  </p>
                  <p className="text-neutral-400 text-xs mt-2 line-clamp-3">{form.descricao}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-neutral-700 px-2 py-1 rounded text-neutral-300">{form.categoria}</span>
                    {form.colecao && <span className="text-xs bg-amber-500/10 px-2 py-1 rounded text-amber-400">{form.colecao}</span>}
                    <span className={`text-xs px-2 py-1 rounded ${form.disponivel ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {form.disponivel ? 'Disponível' : 'Vendida'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-neutral-600 text-sm border-2 border-dashed border-neutral-800 rounded-lg">
                Preview aparecerá aqui
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
