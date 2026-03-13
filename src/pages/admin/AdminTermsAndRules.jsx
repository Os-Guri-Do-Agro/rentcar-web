import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Plus, Trash2, Edit2, Book, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminTermsAndRules = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('regras');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({ regras: [], termos: [] });
  const [editingItem, setEditingItem] = useState(null); // { type: 'regras'|'termos', item: {} }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [regrasRes, termosRes] = await Promise.all([
        supabase.from('regras_gerais').select('*').order('created_at'),
        supabase.from('termos_condicoes').select('*').order('secao')
      ]);
      
      setData({
        regras: regrasRes.data || [],
        termos: termosRes.data || []
      });
    } catch (error) {
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const table = editingItem.type === 'regras' ? 'regras_gerais' : 'termos_condicoes';
    
    try {
      const { id, ...payload } = editingItem.item;
      let result;

      if (id) {
        // Update
        result = await supabase.from(table).update(payload).eq('id', id).select();
      } else {
        // Insert
        result = await supabase.from(table).insert([payload]).select();
      }

      if (result.error) throw result.error;

      toast({ title: "Salvo com sucesso!" });
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    const table = type === 'regras' ? 'regras_gerais' : 'termos_condicoes';
    
    try {
      await supabase.from(table).delete().eq('id', id);
      toast({ title: "Item excluído" });
      fetchData();
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const openEditor = (type, item = null) => {
    setEditingItem({
      type,
      item: item || { titulo: '', conteudo: '', secao: type === 'termos' ? 'Geral' : undefined }
    });
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#00D166]" size={40} /></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0E3A2F] mb-6">Editor de Termos e Regras</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-fit">
        <button
          onClick={() => { setActiveTab('regras'); setEditingItem(null); }}
          className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all font-medium ${
            activeTab === 'regras' ? 'bg-[#0E3A2F] text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Book size={18} /> Regras Gerais
        </button>
        <button
          onClick={() => { setActiveTab('termos'); setEditingItem(null); }}
          className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all font-medium ${
            activeTab === 'termos' ? 'bg-[#0E3A2F] text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Shield size={18} /> Termos e Condições
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List Column */}
        <div className="lg:col-span-1 space-y-4">
          <button
            onClick={() => openEditor(activeTab)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#00D166] text-[#0E3A2F] font-bold rounded-lg hover:bg-[#00F178] transition-colors shadow-sm"
          >
            <Plus size={20} /> Adicionar Novo
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-h-[600px] overflow-y-auto">
            {data[activeTab].map((item) => (
              <div 
                key={item.id} 
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  editingItem?.item?.id === item.id ? 'bg-[#00D166]/10 border-l-4 border-l-[#00D166]' : ''
                }`}
                onClick={() => openEditor(activeTab, item)}
              >
                <h3 className="font-bold text-[#0E3A2F] text-sm mb-1">{item.titulo}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{item.conteudo}</p>
              </div>
            ))}
            {data[activeTab].length === 0 && (
              <p className="p-8 text-center text-gray-400 text-sm">Nenhum item cadastrado.</p>
            )}
          </div>
        </div>

        {/* Editor Column */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {editingItem ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#0E3A2F]">
                    {editingItem.item.id ? 'Editar Item' : 'Novo Item'}
                  </h2>
                  {editingItem.item.id && (
                    <button 
                      type="button"
                      onClick={() => handleDelete(editingItem.item.id, editingItem.type)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Excluir"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      required
                      type="text"
                      value={editingItem.item.titulo}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, titulo: e.target.value }
                      })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"
                      placeholder="Ex: Condições de Pagamento"
                    />
                  </div>

                  {editingItem.type === 'termos' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seção / Categoria</label>
                      <input
                        type="text"
                        value={editingItem.item.secao || ''}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, secao: e.target.value }
                        })}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"
                        placeholder="Ex: Financeiro"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                    <textarea
                      required
                      rows={12}
                      value={editingItem.item.conteudo}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, conteudo: e.target.value }
                      })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none font-sans text-sm leading-relaxed"
                      placeholder="Digite o conteúdo aqui..."
                    />
                    <p className="text-xs text-gray-400 mt-1">Quebras de linha serão respeitadas na exibição.</p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-[#00D166] text-[#0E3A2F] font-bold rounded-lg hover:bg-[#00b355] flex items-center gap-2"
                    >
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Salvar
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 h-[400px] flex flex-col items-center justify-center text-gray-400"
              >
                <Edit2 size={48} className="mb-4 opacity-50" />
                <p>Selecione um item para editar ou clique em "Adicionar Novo"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminTermsAndRules;