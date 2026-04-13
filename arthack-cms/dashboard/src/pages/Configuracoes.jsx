import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../api';
import toast from 'react-hot-toast';

export default function Configuracoes() {
  const [config, setConfig] = useState({
    hero_foto: '',
    hero_titulo: '',
    hero_subtitulo: '',
    site_nome: '',
    site_descricao: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/configuracoes')
      .then(res => setConfig(prev => ({ ...prev, ...res.data })))
      .catch(() => toast.error('Erro ao carregar configurações'))
      .finally(() => setLoading(false));
  }, []);

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setConfig(prev => ({ ...prev, hero_foto: res.data.url }));
      toast.success('Foto enviada!');
    } catch {
      toast.error('Erro no upload');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  async function handleSave() {
    setSaving(true);
    try {
      await api.put('/configuracoes', config);
      toast.success('Configurações salvas!');
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-full text-neutral-500 text-sm">Carregando...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Configurações do Site</h1>
      <p className="text-sm text-neutral-500 mb-8">Gerencie as informações globais do portfólio</p>

      <div className="space-y-6">
        {/* Hero */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Seção Hero (página inicial)</h2>

          {/* Upload foto */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-2">Foto Principal</label>
            <div className="flex gap-4 items-start">
              {config.hero_foto && (
                <img src={config.hero_foto} alt="Hero" className="w-24 h-24 rounded-xl object-cover flex-shrink-0 border border-neutral-700" />
              )}
              <div {...getRootProps()} className={`flex-1 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActive ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-700 hover:border-neutral-600'}`}>
                <input {...getInputProps()} />
                <p className="text-sm text-neutral-400">{uploading ? 'Enviando...' : 'Arraste uma foto ou clique'}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Título</label>
            <input type="text" value={config.hero_titulo} onChange={e => setConfig(p => ({ ...p, hero_titulo: e.target.value }))}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Subtítulo</label>
            <textarea value={config.hero_subtitulo} onChange={e => setConfig(p => ({ ...p, hero_subtitulo: e.target.value }))} rows={2}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors resize-none" />
          </div>
        </div>

        {/* Site */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Informações Gerais</h2>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Nome do Site</label>
            <input type="text" value={config.site_nome} onChange={e => setConfig(p => ({ ...p, site_nome: e.target.value }))}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Descrição (SEO)</label>
            <textarea value={config.site_descricao} onChange={e => setConfig(p => ({ ...p, site_descricao: e.target.value }))} rows={2}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors resize-none" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-semibold rounded-xl py-3 text-sm transition-colors">
          {saving ? 'Salvando...' : '💾 Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}
