import { supabase } from '@/lib/supabaseClient';

export const getTemplates = async () => {
    console.log("[emailTemplateService] Fetching all templates");
    const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('nome');
    if (error) throw error;
    return data;
};

export const getTemplate = async (tipo) => {
    console.log(`[emailTemplateService] Fetching template: ${tipo}`);
    const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('tipo', tipo)
        .single();
    if (error) throw error;
    return data;
};

export const updateTemplate = async (tipo, assunto, corpo) => {
    console.log(`[emailTemplateService] Updating template: ${tipo}`);
    const { data, error } = await supabase
        .from('email_templates')
        .update({ assunto, corpo, atualizado_em: new Date() })
        .eq('tipo', tipo)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const renderTemplate = (corpo, variaveis) => {
    let rendered = corpo;
    Object.keys(variaveis).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        rendered = rendered.replace(regex, variaveis[key]);
    });
    return rendered;
};