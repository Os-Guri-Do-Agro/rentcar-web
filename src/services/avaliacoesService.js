import { supabase } from '@/lib/supabaseClient';

export const getAvaliacoes = async () => {
    console.log("[avaliacoesService] Fetching active avaliacoes");
    const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching active reviews:", error);
        throw error;
    }
    return data;
};

export const getAllAvaliacoesAdmin = async () => {
    console.log("[avaliacoesService] Fetching ALL reviews (admin)");
    const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error("Error fetching admin reviews:", error);
        throw error;
    }
    return data;
};

export const createAvaliacao = async (dados) => {
    console.log("[avaliacoesService] Creating review", dados);
    const { data, error } = await supabase
        .from('avaliacoes')
        .insert([{...dados, created_at: new Date()}])
        .select()
        .single();
        
    if (error) {
        console.error("Error creating review:", error);
        throw error;
    }
    return data;
};

export const updateAvaliacao = async (id, dados) => {
    console.log("[avaliacoesService] Updating review", id);
    // Remove id from dados to avoid updating primary key
    const { id: _, ...updateData } = dados;
    
    const { data, error } = await supabase
        .from('avaliacoes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
    if (error) {
        console.error("Error updating review:", error);
        throw error;
    }
    return data;
};

export const deleteAvaliacao = async (id) => {
    console.log("[avaliacoesService] Deleting review", id);
    const { error } = await supabase
        .from('avaliacoes')
        .delete()
        .eq('id', id);
        
    if (error) {
        console.error("Error deleting review:", error);
        throw error;
    }
    return true;
};

export const toggleAvaliacao = async (id, currentStatus) => {
    console.log("[avaliacoesService] Toggling review", id);
    const { error } = await supabase
        .from('avaliacoes')
        .update({ ativo: !currentStatus })
        .eq('id', id);
        
    if (error) {
        console.error("Error toggling review:", error);
        throw error;
    }
    return !currentStatus;
};

export const reorderAvaliacoes = async (avaliacoes) => {
    console.log("[avaliacoesService] Reordering reviews");
    // Update each item with its new index
    // Note: In a production app with many items, a batch update or different strategy might be better
    for (let i = 0; i < avaliacoes.length; i++) {
        const { error } = await supabase
            .from('avaliacoes')
            .update({ ordem: i })
            .eq('id', avaliacoes[i].id);
        if (error) console.error(`Error reordering item ${avaliacoes[i].id}:`, error);
    }
    return true;
};