import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const getSecao = async (slug) => {
    console.log("[secoesService] Getting secao:", slug);
    const { data, error } = await supabase
        .from('secoes_home')
        .select('*')
        .eq('slug', slug)
        .single();
        
    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching secao:", error);
        throw error;
    }
    return data;
};

export const getAllSecoes = async () => {
    console.log("[secoesService] Getting all secoes");
    const { data, error } = await supabase
        .from('secoes_home')
        .select('*')
        .order('criado_em', { ascending: true });
        
    if (error) {
        console.error("Error fetching all secoes:", error);
        throw error;
    }
    return data;
};

export const updateSecao = async (slug, dados) => {
    console.log("[secoesService] Updating secao:", slug, dados);
    const { data, error } = await supabase
        .from('secoes_home')
        .update({ ...dados, atualizado_em: new Date() })
        .eq('slug', slug)
        .select()
        .single();
        
    if (error) {
        console.error("Error updating secao:", error);
        throw error;
    }
    return data;
};

const updateCardsInSecao = async (slug, cards) => {
    console.log("[secoesService] Updating cards array for:", slug);
    const { error } = await supabase
        .from('secoes_home')
        .update({ cards, atualizado_em: new Date() })
        .eq('slug', slug);
        
    if (error) {
        console.error("Error updating cards:", error);
        throw error;
    }
    return true;
};

export const addCard = async (slug, cardData) => {
    console.log("[secoesService] Adding card to:", slug);
    const secao = await getSecao(slug);
    if (!secao) throw new Error("Seção não encontrada");
    
    // Ensure cards is an array
    const currentCards = Array.isArray(secao.cards) ? secao.cards : [];
    const newCards = [...currentCards, { ...cardData, id: uuidv4(), ordem: currentCards.length }];
    return updateCardsInSecao(slug, newCards);
};

export const updateCard = async (slug, cardId, cardData) => {
     console.log("[secoesService] Updating card:", cardId);
     const secao = await getSecao(slug);
     if (!secao) throw new Error("Seção não encontrada");

     const currentCards = Array.isArray(secao.cards) ? secao.cards : [];
     const newCards = currentCards.map(c => c.id === cardId ? { ...c, ...cardData } : c);
     return updateCardsInSecao(slug, newCards);
};

export const deleteCard = async (slug, cardId) => {
    console.log("[secoesService] Deleting card:", cardId);
    const secao = await getSecao(slug);
    if (!secao) throw new Error("Seção não encontrada");

    const currentCards = Array.isArray(secao.cards) ? secao.cards : [];
    const newCards = currentCards.filter(c => c.id !== cardId);
    return updateCardsInSecao(slug, newCards);
};

export const reorderCards = async (slug, cards) => {
    console.log("[secoesService] Reordering cards for:", slug);
    // Update 'ordem' property based on index
    const indexedCards = cards.map((c, idx) => ({ ...c, ordem: idx }));
    return updateCardsInSecao(slug, indexedCards);
};