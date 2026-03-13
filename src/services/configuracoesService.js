import { supabase } from '@/lib/supabaseClient';

export const getConfiguracoes = async () => {
    console.log("[configuracoesService] Fetching all configs");
    const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .order('chave');
    
    if (error) {
        console.error("Error fetching configs:", error);
        throw error;
    }
    return data;
};

export const getConfiguracao = async (chave) => {
    console.log(`[configuracoesService] Fetching config: ${chave}`);
    const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('chave', chave)
        .single();
    
    if (error) {
        console.error(`Error fetching config ${chave}:`, error);
        return null;
    }
    return data;
};

export const getConfiguracaoOuPadrao = async (chave, valorPadrao) => {
    const config = await getConfiguracao(chave);
    return config ? config.valor : valorPadrao;
};

export const updateConfiguracao = async (chave, valor) => {
    console.log(`[configuracoesService] Updating ${chave} to ${valor}`);
    
    const { data, error } = await supabase
        .from('configuracoes')
        .update({ valor, atualizado_em: new Date() })
        .eq('chave', chave)
        .select()
        .single();

    if (error) {
        console.error(`Error updating config ${chave}:`, error);
        throw error;
    }
    return data;
};