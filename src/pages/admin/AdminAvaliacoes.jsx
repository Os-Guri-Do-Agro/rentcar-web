import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2, Trash2, Edit2, Plus, Star, Eye, EyeOff, Search, Calendar, MoveUp, MoveDown, Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
    getAllAvaliacoesAdmin, createAvaliacao, updateAvaliacao, deleteAvaliacao, toggleAvaliacao, reorderAvaliacoes 
} from '@/services/avaliacoesService';
import { uploadFotoAvaliacao } from '@/services/uploadService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import avaliacoesService from '@/services/avaliacoes/avaliacoes-service';

const AdminAvaliacoes = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all'); // all, active, inactive
    
    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ 
        nome_cliente: '', 
        texto: '', 
        estrelas: 5, 
        foto_cliente_url: '', 
        ativo: true, 
        ordem: 0, 
        data_avaliacao: '' 
    });
    const [uploading, setUploading] = useState(false);
    
    const { toast } = useToast();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        console.log("Fetching reviews...");
        try {
            const data = await avaliacoesService.getAvaliacoes();
            setReviews(data.data || []);
        } catch (error) {
            console.error(error);
            toast({ title: "Erro ao carregar avaliações", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await uploadFotoAvaliacao(file);
            setForm(prev => ({ 
                ...prev, 
                foto_cliente_url: result.url,
                foto_cliente_arquivo: result.path 
            }));
            toast({ title: "Foto enviada com sucesso!" });
        } catch (error) {
            toast({ title: "Erro ao enviar foto", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.nome_cliente || !form.texto) {
            toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
            return;
        }

        try {
            // Map form fields to DB schema if needed (DB has both texto and texto_avaliacao in earlier tasks, sticking to 'texto' from schema in task 8)
            const submitData = {
                ...form,
                texto: form.texto,
                foto_cliente: form.foto_cliente_url // Backward compatibility
            };

            if (editing) {
                await updateAvaliacao(editing.id, submitData);
                toast({ title: "Avaliação atualizada", className: "bg-green-600 text-white" });
            } else {
                await createAvaliacao({ ...submitData, ordem: reviews.length });
                toast({ title: "Avaliação criada", className: "bg-green-600 text-white" });
            }
            setModalOpen(false);
            fetchReviews();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta avaliação?")) return;
        try {
            await deleteAvaliacao(id);
            toast({ title: "Avaliação excluída" });
            fetchReviews();
        } catch (e) {
            toast({ title: "Erro ao excluir", variant: "destructive" });
        }
    };

    const handleToggle = async (id, status) => {
        try {
            await toggleAvaliacao(id, status);
            fetchReviews();
            toast({ title: status ? "Avaliação desativada" : "Avaliação ativada" });
        } catch (e) {
            toast({ title: "Erro ao alterar status", variant: "destructive" });
        }
    };
    
    const handleMove = async (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === reviews.length - 1) return;
        
        const newReviews = [...reviews];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Swap
        [newReviews[index], newReviews[targetIndex]] = [newReviews[targetIndex], newReviews[index]];
        
        setReviews(newReviews); 
        try {
            await reorderAvaliacoes(newReviews);
        } catch(e) {
            toast({ title: "Erro ao reordenar", variant: "destructive" });
            fetchReviews(); 
        }
    };

    const openEdit = (review) => {
        setEditing(review);
        setForm({ 
            nome_cliente: review.nome_cliente, 
            texto: review.texto || review.texto_avaliacao, 
            estrelas: review.estrelas, 
            foto_cliente_url: review.foto_cliente_url || review.foto_cliente || '',
            ativo: review.ativo,
            ordem: review.ordem,
            data_avaliacao: review.data_avaliacao ? new Date(review.data_avaliacao).toISOString().split('T')[0] : ''
        });
        setModalOpen(true);
    };

    const openNew = () => {
        setEditing(null);
        setForm({ 
            nome_cliente: '', 
            texto: '', 
            estrelas: 5, 
            foto_cliente_url: '', 
            ativo: true, 
            ordem: reviews.length,
            data_avaliacao: new Date().toISOString().split('T')[0]
        });
        setModalOpen(true);
    };

    const filteredReviews = reviews.filter(r => {
        const matchesSearch = r.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterActive === 'all' 
            ? true 
            : filterActive === 'active' ? r.ativo 
            : !r.ativo;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
            <Helmet title="Admin | Avaliações" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-[#0E3A2F]">Gerenciar Avaliações</h1>
                <button onClick={openNew} className="bg-[#00D166] text-[#0E3A2F] px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-[#00b355] transition-colors">
                    <Plus size={20} /> Nova Avaliação
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
                    <input 
                        className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#00D166]" 
                        placeholder="Buscar por nome do cliente..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setFilterActive('all')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filterActive==='all' ? 'bg-[#0E3A2F] text-white' : 'bg-gray-100'}`}>Todas</button>
                    <button onClick={() => setFilterActive('active')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filterActive==='active' ? 'bg-[#0E3A2F] text-white' : 'bg-gray-100'}`}>Ativas</button>
                    <button onClick={() => setFilterActive('inactive')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filterActive==='inactive' ? 'bg-[#0E3A2F] text-white' : 'bg-gray-100'}`}>Inativas</button>
                </div>
            </div>

            {loading ? <div className="text-center p-10"><Loader2 className="animate-spin mx-auto text-[#00D166]" size={40}/></div> : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredReviews.map((review, index) => (
                        <div key={review.id} className={`bg-white p-6 rounded-xl shadow-sm border ${review.ativo ? 'border-gray-200' : 'border-red-200 bg-red-50/50'} flex flex-col md:flex-row items-start md:items-center gap-6 transition-all`}>
                            
                            <div className="flex flex-col items-center gap-2">
                                <button onClick={() => handleMove(index, 'up')} disabled={index===0} className="p-1 text-gray-400 hover:text-[#0E3A2F] disabled:opacity-30"><MoveUp size={16}/></button>
                                <span className="text-xs text-gray-400 font-mono">{index + 1}</span>
                                <button onClick={() => handleMove(index, 'down')} disabled={index===filteredReviews.length-1} className="p-1 text-gray-400 hover:text-[#0E3A2F] disabled:opacity-30"><MoveDown size={16}/></button>
                            </div>

                            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border-2 border-gray-100">
                                {review.foto_cliente || review.foto_cliente_url ? 
                                    <img src={review.foto_cliente_url || review.foto_cliente} className="w-full h-full object-cover" alt={review.nome_cliente}/> 
                                    : <div className="w-full h-full bg-[#0E3A2F] flex items-center justify-center text-white font-bold text-xl">{review.nome_cliente ? review.nome_cliente[0] : '?'}</div>
                                }
                            </div>
                            
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="font-bold text-lg text-[#0E3A2F]">{review.nome_cliente}</h3>
                                    {review.data_avaliacao && <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Calendar size={12}/> {new Date(review.data_avaliacao).toLocaleDateString()}</span>}
                                    {!review.ativo && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">Inativo</span>}
                                </div>
                                <div className="flex text-yellow-400 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < review.estrelas ? "currentColor" : "none"} className={i >= review.estrelas ? "text-gray-300" : ""} />
                                    ))}
                                </div>
                                <p className="text-gray-600 italic text-sm line-clamp-2">"{review.texto || review.texto_avaliacao}"</p>
                            </div>

                            <div className="flex gap-2 self-end md:self-center">
                                <button onClick={() => handleToggle(review.id, review.ativo)} className={`p-2 rounded-lg transition-colors ${review.ativo ? 'text-gray-400 hover:bg-gray-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`} title={review.ativo ? "Desativar" : "Ativar"}>
                                    {review.ativo ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                                <button onClick={() => openEdit(review)} className="p-2 text-blue-500 hover:text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100" title="Editar">
                                    <Edit2 size={18}/>
                                </button>
                                <button onClick={() => handleDelete(review.id)} className="p-2 text-red-500 hover:text-red-700 bg-red-50 rounded-lg hover:bg-red-100" title="Excluir">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>{editing ? 'Editar Avaliação' : 'Nova Avaliação'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-bold block mb-1">Nome do Cliente *</label>
                            <input className="w-full p-2 border rounded-lg" value={form.nome_cliente} onChange={e => setForm({...form, nome_cliente: e.target.value})} />
                        </div>
                        
                        <div>
                            <label className="text-sm font-bold block mb-1">Foto do Cliente</label>
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                                    {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>}
                                    <span className="text-sm">Upload Foto</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                </label>
                                <span className="text-xs text-gray-400">ou</span>
                                <input className="flex-grow p-2 border rounded-lg" placeholder="URL da imagem..." value={form.foto_cliente_url} onChange={e => setForm({...form, foto_cliente_url: e.target.value})} />
                            </div>
                            {form.foto_cliente_url && (
                                <div className="mt-2 w-16 h-16 rounded-full overflow-hidden border">
                                    <img src={form.foto_cliente_url} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-bold block mb-1">Depoimento *</label>
                            <textarea className="w-full p-2 border rounded-lg h-24" value={form.texto} onChange={e => setForm({...form, texto: e.target.value})} />
                        </div>

                        <div className="flex gap-6">
                            <div className="flex-1">
                                <label className="text-sm font-bold block mb-1">Estrelas</label>
                                <select className="w-full p-2 border rounded-lg bg-white" value={form.estrelas} onChange={e => setForm({...form, estrelas: parseInt(e.target.value)})}>
                                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Estrelas</option>)}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-bold block mb-1">Data</label>
                                <input type="date" className="w-full p-2 border rounded-lg" value={form.data_avaliacao} onChange={e => setForm({...form, data_avaliacao: e.target.value})} />
                            </div>
                        </div>
                        <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                <input type="checkbox" className="w-5 h-5 rounded text-[#00D166] focus:ring-[#00D166]" checked={form.ativo} onChange={e => setForm({...form, ativo: e.target.checked})} />
                                <span className="font-bold text-sm">Exibir no site (Ativo)</span>
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button onClick={handleSubmit} disabled={uploading} className="px-4 py-2 bg-[#0E3A2F] text-white rounded-lg font-bold hover:bg-[#165945] disabled:opacity-50">Salvar</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminAvaliacoes;