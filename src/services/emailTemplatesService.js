import { supabase } from '@/lib/supabaseClient';

export const getTemplate = async (tipo) => {
    console.log(`[EmailTemplates] Buscando template: ${tipo}`);
    const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('tipo', tipo)
        .maybeSingle();
    
    if (error) console.error(error);
    return data;
};

export const updateTemplate = async (tipo, assunto, corpo) => {
    console.log(`[EmailTemplates] Atualizando template: ${tipo}`);
    // Upsert logic
    const { data: existing } = await supabase
        .from('email_templates')
        .select('id')
        .eq('tipo', tipo)
        .maybeSingle();

    if (existing) {
        await supabase
            .from('email_templates')
            .update({ assunto, corpo, atualizado_em: new Date().toISOString() })
            .eq('id', existing.id);
    } else {
        await supabase
            .from('email_templates')
            .insert({ tipo, assunto, corpo });
    }
    return { success: true };
};

export const getAllTemplates = async () => {
    const { data, error } = await supabase.from('email_templates').select('*');
    if (error) return [];
    return data;
};