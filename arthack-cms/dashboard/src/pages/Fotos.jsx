import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../api';
import toast from 'react-hot-toast';

export default function Fotos() {
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [legenda, setLegenda] = useState('');
  const [categoria, setCategoria] = useState('geral');

  useEffect(() => {
    loadFotos();
  }, []);

  async function loadFotos() {
    try {
      const res = await api.get('/fotos?limit=100');
      setFotos(res.data.fotos || []);
    } catch { toast.error('Erro ao carregar fotos'); }
    finally { setLoading(false); }
  }

  const onDrop = useCallback(async (files) => {
    setUploading(true);
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        const uploadRes = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await api.post('/fotos', {
          url: uploadRes.data.url,
          thumbnail_url: uploadRes.data.thumbnail_url,
          legenda,
          categoria
        });
        toast.success(`${file.name} enviada!`);
      } catch (err) {
        toast.error(`Erro: ${file.name}`);
      }
    }
    setUploading(false);
    loadFotos();
  }, [legenda, categoria]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 15 * 1024 * 1024
  });

  async function deleteFoto(foto) {
    if (!confirm('Deletar esta foto?')) return;
    try {
      await api.delete(`/fotos/${foto.id}`);
      setFotos(prev => prev.filter(f => f.id !== foto.id));
      toast.success('Foto deletada');
    } catch { toast.error('Erro ao deletar'); }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Fotos & Sessões</h1>

      {/* Upload zone */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Legenda (opcional)</label>
            <input type="text" value={legenda} onChange={e => setLegenda(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Descrição da foto..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Categoria</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors">
              {['geral', 'obra', 'atelier', 'exposição', 'processo', 'bonsai'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-700 hover:border-neutral-600'} ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} disabled={uploading} />
          <div className="text-4xl mb-3">{uploading ? '⏳' : '📁'}</div>
          <p className="text-sm text-neutral-300 font-medium">
            {uploading ? 'Enviando fotos...' : isDragActive ? 'Solte as imagens aqui!' : 'Arraste fotos ou clique para selecionar'}
          </p>
          <p className="text-xs text-neutral-600 mt-1">Múltiplos arquivos suportados · Máx 15MB cada</p>
        </div>
      </div>

      {/* Gallery grid */}
      {loading ? (
        <div className="text-center text-neutral-500 py-8 text-sm">Carregando...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {fotos.map(foto => (
            <div key={foto.id} className="group relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 aspect-square">
              <img src={foto.thumbnail_url || foto.url} alt={foto.legenda || ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                {foto.legenda && <p className="text-xs text-white text-center line-clamp-2">{foto.legenda}</p>}
                <span className="text-xs text-neutral-400 bg-neutral-900/80 px-2 py-0.5 rounded">{foto.categoria}</span>
                <button onClick={() => deleteFoto(foto)}
                  className="bg-red-500/80 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                  Deletar
                </button>
              </div>
            </div>
          ))}
          {fotos.length === 0 && (
            <div className="col-span-4 text-center py-16 text-neutral-600">
              <div className="text-4xl mb-3">📷</div>
              <p className="text-sm">Nenhuma foto. Faça o primeiro upload acima.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
