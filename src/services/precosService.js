import { supabase } from '@/lib/supabaseClient';

export const getPrecos = async (carroId) => {
    console.log(`[PrecosService] Buscando preços para carro ${carroId}`);
    const { data, error } = await supabase
        .from('car_prices')
        .select('*')
        .eq('carro_id', carroId);
    
    if (error) {
        console.error("[PrecosService] Erro:", error);
        return [];
    }
    return data;
};

export const updatePreco = async (carroId, plano, franquiaKm, valor) => {
    console.log(`[PrecosService] Atualizando preço: ${carroId}, ${plano}, ${franquiaKm}, ${valor}`);
    
    // Check if exists
    const { data: existing } = await supabase
        .from('car_prices')
        .select('id')
        .eq('carro_id', carroId)
        .eq('plano', plano)
        .eq('franquia_km', franquiaKm)
        .maybeSingle();

    let error;
    if (existing) {
        const { error: updError } = await supabase
            .from('car_prices')
            .update({ valor, atualizado_em: new Date().toISOString() })
            .eq('id', existing.id);
        error = updError;
    } else {
        const { error: insError } = await supabase
            .from('car_prices')
            .insert({
                carro_id: carroId,
                plano,
                franquia_km: franquiaKm,
                valor
            });
        error = insError;
    }

    if (error) {
        console.error("[PrecosService] Erro ao salvar:", error);
        throw error;
    }
    return { success: true };
};

export const getPrecosAllCars = async () => {
    console.log("[PrecosService] Buscando preços de todos os carros");
    const { data, error } = await supabase
        .from('car_prices')
        .select(`
            *,
            cars (id, nome, placa)
        `)
        .order('created_at');
        
    if (error) {
        console.error(error);
        return [];
    }
    return data;
};