import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import categoriaBlogService from '@/services/blog/categoria/categoriaBlog-service';

const CategoriaBlogModal = ({ open, onClose, onCreated }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ nome: '', ativo: true });
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await categoriaBlogService.postCategoriaBlog(form);
      toast({ title: 'Categoria criada!', className: 'bg-green-600 text-white' });
      setForm({ nome: '', ativo: true });
      onCreated?.(res?.data);
      onClose();
    } catch (err) {
      toast({ title: 'Erro ao criar categoria', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#0E3A2F]">Nova Categoria</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold block mb-1">Nome *</label>
            <input
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D166]"
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 rounded"
              checked={form.ativo}
              onChange={e => setForm({ ...form, ativo: e.target.checked })}
            />
            <span className="text-sm font-bold">Ativo</span>
          </label>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#0E3A2F] text-white rounded-lg font-bold text-sm hover:bg-[#165945] disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Criar categoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoriaBlogModal;
