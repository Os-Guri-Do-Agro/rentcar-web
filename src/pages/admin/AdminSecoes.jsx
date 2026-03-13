import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2, Edit2, Plus, Trash2, Layout, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllSecoes, updateSecao, addCard, updateCard, deleteCard, reorderCards } from '@/services/secoesService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';

const AdminSecoes = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [secoes, setSecoes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [editSectionModal, setEditSectionModal] = useState(false);
    const [manageCardsModal, setManageCardsModal] = useState(false);
    const [editCardModal, setEditCardModal] = useState(false);
    
    // Selection States
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    
    // Forms
    const [sectionForm, setSectionForm] = useState({ titulo: '', descricao: '' });
    const [cardForm, setCardForm] = useState({ titulo: '', descricao: '', icone: 'Check' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllSecoes();
            setSecoes(data || []);
        } catch (error) {
            console.error(error);
            toast({ title: "Erro ao carregar seções", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // --- Section Editing ---
    const handleEditSection = (secao) => {
        setSelectedSection(secao);
        setSectionForm({ titulo: secao.titulo, descricao: secao.descricao });
        setEditSectionModal(true);
    };

    const saveSection = async () => {
        try {
            await updateSecao(selectedSection.slug, sectionForm);
            toast({ title: "Seção atualizada!" });
            setEditSectionModal(false);
            loadData();
        } catch (error) {
            toast({ title: "Erro ao salvar", variant: "destructive" });
        }
    };

    // --- Card Management ---
    const handleManageCards = (secao) => {
        setSelectedSection(secao);
        setManageCardsModal(true);
    };

    const handleAddCard = () => {
        setSelectedCard(null);
        setCardForm({ titulo: '', descricao: '', icone: 'Check' });
        setEditCardModal(true);
    };

    const handleEditCard = (card) => {
        setSelectedCard(card);
        setCardForm({ titulo: card.titulo, descricao: card.descricao, icone: card.icone });
        setEditCardModal(true);
    };

    const handleDeleteCard = async (cardId) => {
        if (!confirm("Tem certeza que deseja remover este card?")) return;
        try {
            await deleteCard(selectedSection.slug, cardId);
            // Update local state for immediate feedback
            const updatedCards = selectedSection.cards.filter(c => c.id !== cardId);
            setSelectedSection({ ...selectedSection, cards: updatedCards });
            toast({ title: "Card removido!" });
            loadData(); // Refresh background
        } catch (error) {
            toast({ title: "Erro ao remover", variant: "destructive" });
        }
    };

    const saveCard = async () => {
        try {
            if (selectedCard) {
                await updateCard(selectedSection.slug, selectedCard.id, cardForm);
            } else {
                await addCard(selectedSection.slug, cardForm);
            }
            toast({ title: "Card salvo!" });
            setEditCardModal(false);
            setManageCardsModal(false); // Close list to force refresh or fetch new data
            loadData();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro ao salvar card", variant: "destructive" });
        }
    };

    const handleReorderCard = async (cardIndex, direction) => {
        if (!selectedSection.cards) return;
        
        const cards = [...selectedSection.cards];
        const targetIndex = direction === 'up' ? cardIndex - 1 : cardIndex + 1;
        
        if (targetIndex < 0 || targetIndex >= cards.length) return;
        
        // Swap
        [cards[cardIndex], cards[targetIndex]] = [cards[targetIndex], cards[cardIndex]];
        
        // Optimistic update
        setSelectedSection({ ...selectedSection, cards });
        
        try {
            await reorderCards(selectedSection.slug, cards);
            loadData();
        } catch (error) {
            toast({ title: "Erro ao reordenar", variant: "destructive" });
        }
    };

    const iconOptions = [
        "Check", "Shield", "Clock", "Car", "FileCheck", "Banknote", "Sparkles", "Wrench", "Tool"
    ];

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#0E3A2F]" size={40}/></div>;

    const vantagensSection = secoes.find(s => s.slug === 'vantagens');

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
            <Helmet title="Admin | Seções Home" />
            <h1 className="text-3xl font-bold text-[#0E3A2F] mb-2">Gerenciar Home</h1>
            <p className="text-gray-500 mb-8">Personalize as seções principais da página inicial.</p>

            <div className="grid gap-8">
                {/* 1. Advantages Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-[#0E3A2F] flex items-center gap-2">
                                <Layout size={20} className="text-[#00D166]"/> Por que escolher a JL?
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Seção de vantagens e benefícios.</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleEditSection(vantagensSection || { slug: 'vantagens', titulo: '', descricao: '' })}
                                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm hover:bg-blue-100 flex items-center gap-2"
                            >
                                <Edit2 size={16}/> Editar Texto
                            </button>
                            <button 
                                onClick={() => handleManageCards(vantagensSection || { slug: 'vantagens', cards: [] })}
                                className="px-4 py-2 bg-[#0E3A2F] text-white rounded-lg font-bold text-sm hover:bg-[#165945] flex items-center gap-2"
                            >
                                <Layout size={16}/> Editar Cards
                            </button>
                        </div>
                    </div>
                    
                    {vantagensSection ? (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h3 className="font-bold text-gray-800">{vantagensSection.titulo}</h3>
                            <p className="text-gray-600 text-sm mt-1">{vantagensSection.descricao}</p>
                            <div className="mt-3 flex gap-2">
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600 font-bold">{vantagensSection.cards?.length || 0} cards ativos</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-red-500 text-sm">Seção 'vantagens' não encontrada no banco de dados.</div>
                    )}
                </div>

                {/* 2. Testimonials Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-[#0E3A2F] flex items-center gap-2">
                                <MessageSquare size={20} className="text-[#00D166]"/> O que dizem nossos clientes
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Gerencie os depoimentos exibidos no carrossel.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/admin/avaliacoes')}
                            className="px-4 py-2 bg-[#0E3A2F] text-white rounded-lg font-bold text-sm hover:bg-[#165945] flex items-center gap-2"
                        >
                            Gerenciar Avaliações
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal: Edit Section Text */}
            <Dialog open={editSectionModal} onOpenChange={setEditSectionModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Editar Seção</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                            <input 
                                className="w-full p-2 border rounded-lg" 
                                value={sectionForm.titulo}
                                onChange={e => setSectionForm({...sectionForm, titulo: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                            <textarea 
                                className="w-full p-2 border rounded-lg h-24" 
                                value={sectionForm.descricao}
                                onChange={e => setSectionForm({...sectionForm, descricao: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <button onClick={() => setEditSectionModal(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                        <button onClick={saveSection} className="px-4 py-2 bg-[#0E3A2F] text-white rounded-lg font-bold">Salvar</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Manage Cards */}
            <Dialog open={manageCardsModal} onOpenChange={setManageCardsModal}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex justify-between items-center">
                            <span>Gerenciar Cards</span>
                            <button onClick={handleAddCard} className="bg-[#00D166] text-[#0E3A2F] px-3 py-1 rounded text-sm font-bold flex items-center gap-1 hover:bg-[#00b355]">
                                <Plus size={16}/> Novo Card
                            </button>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        {selectedSection?.cards?.length === 0 && <p className="text-center text-gray-500">Nenhum card cadastrado.</p>}
                        {selectedSection?.cards?.map((card, idx) => (
                            <div key={card.id || idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => handleReorderCard(idx, 'up')} disabled={idx === 0} className="text-gray-400 hover:text-black disabled:opacity-20"><ArrowUp size={14}/></button>
                                    <button onClick={() => handleReorderCard(idx, 'down')} disabled={idx === selectedSection.cards.length - 1} className="text-gray-400 hover:text-black disabled:opacity-20"><ArrowDown size={14}/></button>
                                </div>
                                <div className="w-10 h-10 bg-white rounded flex items-center justify-center border text-[#00D166]">
                                    {/* Icon placeholder or dynamic render if possible */}
                                    <span className="text-xs font-bold">{card.icone?.substring(0,2)}</span>
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-sm text-[#0E3A2F]">{card.titulo}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-1">{card.descricao}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditCard(card)} className="p-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"><Edit2 size={16}/></button>
                                    <button onClick={() => handleDeleteCard(card.id)} className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal: Edit/Add Single Card */}
            <Dialog open={editCardModal} onOpenChange={setEditCardModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{selectedCard ? 'Editar Card' : 'Novo Card'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                            <input 
                                className="w-full p-2 border rounded-lg" 
                                value={cardForm.titulo}
                                onChange={e => setCardForm({...cardForm, titulo: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                            <textarea 
                                className="w-full p-2 border rounded-lg h-20" 
                                value={cardForm.descricao}
                                onChange={e => setCardForm({...cardForm, descricao: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Ícone</label>
                            <select 
                                className="w-full p-2 border rounded-lg bg-white"
                                value={cardForm.icone}
                                onChange={e => setCardForm({...cardForm, icone: e.target.value})}
                            >
                                {iconOptions.map(icon => (
                                    <option key={icon} value={icon}>{icon}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <button onClick={() => setEditCardModal(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                        <button onClick={saveCard} className="px-4 py-2 bg-[#0E3A2F] text-white rounded-lg font-bold">Salvar Card</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminSecoes;