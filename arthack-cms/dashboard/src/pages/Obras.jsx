import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../api';
import toast from 'react-hot-toast';

function SortableObra({ obra, onToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: obra.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4 group hover:border-neutral-700 transition-colors"
    >
      {/* Drag handle */}
      <button {...attributes} {...listeners} className="text-neutral-600 hover:text-neutral-400 cursor-grab active:cursor-grabbing flex-shrink-0">
        ⠿
      </button>

      {/* Image */}
      <div className="w-16 h-16 rounded-lg bg-neutral-800 overflow-hidden flex-shrink-0">
        {obra.thumbnail_url || obra.imagem_url ? (
          <img src={obra.thumbnail_url || obra.imagem_url} alt={obra.titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🗿</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/obras/${obra.id}`} className="text-sm font-semibold text-white hover:text-amber-400 transition-colors truncate block">
          {obra.titulo}
        </Link>
        <p className="text-xs text-neutral-500 truncate mt-0.5">{obra.colecao || '—'} · {obra.categoria}</p>
        <p className="text-xs text-neutral-400 truncate mt-0.5 max-w-sm">{obra.descricao?.substring(0, 80)}...</p>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="text-base font-bold text-green-400">
          R$ {Number(obra.preco).toLocaleString('pt-BR')}
        </p>
        <button
          onClick={() => onToggle(obra)}
          className={`text-xs px-2 py-0.5 rounded-full mt-1 transition-colors ${obra.disponivel ? 'bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400' : 'bg-red-500/10 text-red-400 hover:bg-green-500/10 hover:text-green-400'}`}
        >
          {obra.disponivel ? 'Disponível' : 'Vendida'}
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Link to={`/obras/${obra.id}`} className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-neutral-300 transition-colors">
          Editar
        </Link>
        <button onClick={() => onDelete(obra)} className="text-xs bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-red-400 transition-colors">
          Deletar
        </button>
      </div>
    </div>
  );
}

export default function Obras() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadObras();
  }, []);

  async function loadObras() {
    try {
      const res = await api.get('/obras?sort=posicao&limit=100');
      setObras(res.data.obras || []);
    } catch {
      toast.error('Erro ao carregar obras');
    } finally {
      setLoading(false);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setObras(prev => {
      const oldIdx = prev.findIndex(o => o.id === active.id);
      const newIdx = prev.findIndex(o => o.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  }

  async function saveOrder() {
    setSaving(true);
    try {
      const items = obras.map((o, i) => ({ id: o.id, posicao: i }));
      await api.put('/obras/batch/reorder', { items });
      toast.success('Ordem salva com sucesso!');
    } catch {
      toast.error('Erro ao salvar ordem');
    } finally {
      setSaving(false);
    }
  }

  async function toggleDisponivel(obra) {
    try {
      const updated = await api.put(`/obras/${obra.id}`, { disponivel: !obra.disponivel });
      setObras(prev => prev.map(o => o.id === obra.id ? updated.data : o));
      toast.success(updated.data.disponivel ? 'Marcada como disponível' : 'Marcada como vendida');
    } catch {
      toast.error('Erro ao atualizar');
    }
  }

  async function deleteObra(obra) {
    if (!confirm(`Deletar "${obra.titulo}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/obras/${obra.id}`);
      setObras(prev => prev.filter(o => o.id !== obra.id));
      toast.success('Obra deletada');
    } catch {
      toast.error('Erro ao deletar');
    }
  }

  const filtered = obras.filter(o =>
    !filter || o.titulo.toLowerCase().includes(filter.toLowerCase()) || o.categoria?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-full text-neutral-500 text-sm">Carregando...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Obras</h1>
          <p className="text-sm text-neutral-500 mt-1">{obras.length} obras cadastradas · Arraste para reordenar</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveOrder} disabled={saving} className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm text-neutral-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Salvando...' : '💾 Salvar Ordem'}
          </button>
          <Link to="/obras/nova" className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
            + Nova Obra
          </Link>
        </div>
      </div>

      {/* Filter */}
      <input
        type="text"
        placeholder="Filtrar obras..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors mb-4"
      />

      {/* Sortable list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filtered.map(o => o.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {filtered.map(obra => (
              <SortableObra key={obra.id} obra={obra} onToggle={toggleDisponivel} onDelete={deleteObra} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-neutral-600">
          <div className="text-4xl mb-3">🗿</div>
          <p className="text-sm">Nenhuma obra encontrada</p>
          <Link to="/obras/nova" className="text-amber-400 text-sm hover:text-amber-300 mt-2 inline-block">Adicionar primeira obra →</Link>
        </div>
      )}
    </div>
  );
}
