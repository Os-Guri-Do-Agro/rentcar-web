import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Save, Plus, Trash2, Edit2, Book, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import termosService from '@/services/termos/termos-services';
import regrasService from '@/services/regrasGerais/regras-service';

const AdminTermsAndRules = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('regras');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [regras, setRegras] = useState([]);
  const [termos, setTermos] = useState([]);

  const [editModal, setEditModal] = useState({ open: false, type: null, item: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, id: null, titulo: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [regrasRes, termosRes] = await Promise.all([
        regrasService.getRegras(),
        termosService.getTermos(),
      ]);
      setRegras(regrasRes?.data ?? []);
      setTermos(termosRes?.data ?? []);
    } catch (error) {
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (type, item = null) => {
    setEditModal({
      open: true,
      type,
      item: item
        ? { ...item }
        : { titulo: '', conteudo: '', secao: type === 'termos' ? '' : undefined },
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { id, ...payload } = editModal.item;
    setSaving(true);
    setLoadingId(id ? `${id}-save` : 'new-save');
    try {
      if (editModal.type === 'regras') {
        if (id) await regrasService.patchRegras(id, payload);
        else await regrasService.postRegas(payload);
      } else {
        if (id) await termosService.patchTermo(id, payload);
        else await termosService.postTermo(payload);
      }
      toast({ title: 'Salvo com sucesso!' });
      setEditModal({ open: false, type: null, item: null });
      fetchData();
    } catch (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
      setLoadingId(null);
    }
  };

  const openDelete = (e, type, id, titulo) => {
    e.stopPropagation();
    setDeleteModal({ open: true, type, id, titulo });
  };

  const handleDelete = async () => {
    setLoadingId(`${deleteModal.id}-delete`);
    try {
      if (deleteModal.type === 'regras') await regrasService.deleteRegras(deleteModal.id);
      else await termosService.deleteTermo(deleteModal.id);
      toast({ title: 'Item excluído' });
      setDeleteModal({ open: false, type: null, id: null, titulo: '' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#00D166]" size={40} /></div>;

  const items = activeTab === 'regras' ? regras : termos;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0E3A2F] mb-6">Editor de Termos e Regras</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-fit">
        <button
          onClick={() => setActiveTab('regras')}
          className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all font-medium ${
            activeTab === 'regras' ? 'bg-[#0E3A2F] text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Book size={18} /> Regras Gerais
        </button>
        <button
          onClick={() => setActiveTab('termos')}
          className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all font-medium ${
            activeTab === 'termos' ? 'bg-[#0E3A2F] text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Shield size={18} /> Termos e Condições
        </button>
      </div>

      {/* Add Button */}
      <button
        onClick={() => openEdit(activeTab)}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#00D166] text-[#0E3A2F] font-bold rounded-lg hover:bg-[#00F178] transition-colors shadow-sm mb-6"
      >
        <Plus size={18} /> Adicionar Novo
      </button>

      {/* Cards */}
      <div className="space-y-3">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#0E3A2F] mb-1">{item.titulo}</h3>
              {item.secao && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mb-2 inline-block">
                  {item.secao}
                </span>
              )}
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.conteudo}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openEdit(activeTab, item)}
                disabled={loadingId === `${item.id}-save`}
                className="p-2 text-gray-400 hover:text-[#0E3A2F] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Editar"
              >
                {loadingId === `${item.id}-save`
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Edit2 size={16} />}
              </button>
              <button
                onClick={(e) => openDelete(e, activeTab, item.id, item.titulo)}
                disabled={loadingId === `${item.id}-delete`}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Excluir"
              >
                {loadingId === `${item.id}-delete`
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Trash2 size={16} />}
              </button>
            </div>
          </motion.div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Edit2 size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum item cadastrado.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={editModal.open} onOpenChange={(v) => !v && setEditModal({ open: false, type: null, item: null })}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editModal.item?.id ? 'Editar Item' : 'Novo Item'}</DialogTitle>
          </DialogHeader>

          {editModal.item && (
            <form onSubmit={handleSave} className="space-y-5 py-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  required
                  type="text"
                  value={editModal.item.titulo}
                  onChange={(e) => setEditModal((prev) => ({ ...prev, item: { ...prev.item, titulo: e.target.value } }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"
                  placeholder="Ex: Condições de Pagamento"
                />
              </div>

              {editModal.type === 'termos' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seção / Categoria</label>
                  <input
                    type="text"
                    value={editModal.item.secao || ''}
                    onChange={(e) => setEditModal((prev) => ({ ...prev, item: { ...prev.item, secao: e.target.value } }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"
                    placeholder="Ex: Financeiro"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <textarea
                  required
                  rows={10}
                  value={editModal.item.conteudo}
                  onChange={(e) => setEditModal((prev) => ({ ...prev, item: { ...prev.item, conteudo: e.target.value } }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none text-sm leading-relaxed"
                  placeholder="Digite o conteúdo aqui..."
                />
                <p className="text-xs text-gray-400 mt-1">Quebras de linha serão respeitadas na exibição.</p>
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, type: null, item: null })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#00D166] text-[#0E3A2F] font-bold rounded-lg hover:bg-[#00b355] flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Salvar
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(v) => !v && setDeleteModal({ open: false, type: null, id: null, titulo: '' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} /> Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 py-2">
            Tem certeza que deseja excluir <span className="font-bold text-gray-900">"{deleteModal.titulo}"</span>? Essa ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <button
              onClick={() => setDeleteModal({ open: false, type: null, id: null, titulo: '' })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={!!loadingId}
              className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-60"
            >
              {loadingId?.endsWith('-delete') ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Excluir
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTermsAndRules;
