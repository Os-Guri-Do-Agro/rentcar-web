import { supabase } from '@/lib/supabaseClient';

export const getCarrosDestaque = async () => {
    const { data, error } = await supabase
        .from('carros_destaque')
        .select(`*, cars (*)`)
        .eq('ativo', true)
        .order('posicao', { ascending: true });

    if (error) {
        console.error("Error fetching featured cars:", error);
        return [];
    }

    return data.map(item => ({
        ...item.cars,
        destaque_id: item.id,
        posicao: item.posicao
    }));
};

export const getCarrosDisponiveis = async () => {
    const { data: featured, error: featError } = await supabase
        .from('carros_destaque')
        .select('carro_id');

    if (featError) throw featError;

    const featuredIds = featured.map(f => f.carro_id);

    let query = supabase.from('cars').select('*').eq('disponivel', true);

    if (featuredIds.length > 0) {
        query = query.not('id', 'in', `(${featuredIds.join(',')})`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
};

export const addCarroDestaque = async (carroId) => {
    const { data: existing } = await supabase
        .from('carros_destaque')
        .select('id')
        .eq('carro_id', carroId)
        .maybeSingle();

    if (existing) throw new Error("Carro já está em destaque.");

    const { data: maxPos } = await supabase
        .from('carros_destaque')
        .select('posicao')
        .order('posicao', { ascending: false })
        .limit(1)
        .maybeSingle();

    const newPos = (maxPos?.posicao || 0) + 1;

    const { error } = await supabase
        .from('carros_destaque')
        .insert({ carro_id: carroId, posicao: newPos, ativo: true });

    if (error) throw error;
    return { success: true };
};

export const removeCarroDestaque = async (carroId) => {
    const { error } = await supabase
        .from('carros_destaque')
        .delete()
        .eq('carro_id', carroId);

    if (error) throw error;
    return { success: true };
};

export const reorderCarrosDestaque = async (carros) => {
    for (let i = 0; i < carros.length; i++) {
        const { error } = await supabase
            .from('carros_destaque')
            .update({ posicao: i + 1 })
            .eq('carro_id', carros[i].id);

        if (error) throw error;
    }
    return { success: true };
};
