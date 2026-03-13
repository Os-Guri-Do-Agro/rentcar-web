import { supabase } from '@/lib/supabaseClient';

export const getAllConteudo = async () => {
    console.log("[conteudoService] Fetching all content");
    const { data, error } = await supabase
        .from('paginas_conteudo')
        .select('*')
        .order('titulo');
    
    if (error) {
        console.error("Error fetching content pages:", error);
        throw error;
    }
    return data;
};

export const getConteudo = async (slug) => {
    console.log(`[conteudoService] Fetching content for ${slug}`);
    const { data, error } = await supabase
        .from('paginas_conteudo')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
    
    if (error) {
        console.error(`Error fetching content ${slug}:`, error);
        throw error;
    }
    return data;
};

export const updateConteudo = async (slug, titulo, conteudo) => {
    console.log(`[conteudoService] Updating content for ${slug}`);
    
    // Check if exists
    const { data: existing } = await supabase
        .from('paginas_conteudo')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
    
    if (existing) {
        const { error } = await supabase
            .from('paginas_conteudo')
            .update({ titulo, conteudo, atualizado_em: new Date() })
            .eq('slug', slug);
        if (error) throw error;
    } else {
         const { error } = await supabase
            .from('paginas_conteudo')
            .insert({ slug, titulo, conteudo });
        if (error) throw error;
    }
    return true;
};