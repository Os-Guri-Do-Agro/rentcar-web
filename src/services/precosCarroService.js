import { supabase } from '@/lib/supabaseClient';

export const getPrecosCarro = async (carroId) => {
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

export const updatePrecoCarro = async (carroId, tipoPlano, tipoFranquia, valor) => {
    console.log(`[PrecosService] Atualizando: ${carroId}, ${tipoPlano}, ${tipoFranquia}, ${valor}`);
    
    // Check if exists
    const { data: existing } = await supabase
        .from('car_prices')
        .select('id')
        .eq('carro_id', carroId)
        .eq('tipo_plano', tipoPlano)
        .eq('tipo_franquia', tipoFranquia)
        .maybeSingle();

    if (existing) {
        const { error } = await supabase
            .from('car_prices')
            .update({ valor, atualizado_em: new Date().toISOString() })
            .eq('id', existing.id);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('car_prices')
            .insert({
                carro_id: carroId,
                tipo_plano: tipoPlano,
                tipo_franquia: tipoFranquia,
                valor,
                // Map legacy fields for compatibility if needed, though schema updated to use new cols primarily
                plano: tipoPlano,
                franquia_km: tipoFranquia
            });
        if (error) throw error;
    }
    return { success: true };
};

export const updateKmAdicionalValor = async (carroId, valor) => {
    console.log(`[PrecosService] Atualizando KM Adicional: ${carroId}, ${valor}`);
    // Update all entries for this car or a specific config entry. 
    // Usually, excess km price might be global per car or per plan. 
    // Assuming simple model: update all records for this car to have same excess km value, 
    // or insert a specific config record if you prefer separate table.
    // Given the prompt asks to update columns in car_prices, likely we update all rows for that car
    
    const { error } = await supabase
        .from('car_prices')
        .update({ km_adicional_valor: valor })
        .eq('carro_id', carroId);
        
    if (error) throw error;
    return { success: true };
};

export const getPrecoPorPlanoFranquia = async (carroId, tipoPlano, tipoFranquia) => {
    console.log(`[PrecosService] Buscando preço específico: ${carroId}, ${tipoPlano}, ${tipoFranquia}`);
    const { data, error } = await supabase
        .from('car_prices')
        .select('*')
        .eq('carro_id', carroId)
        .eq('tipo_plano', tipoPlano)
        .eq('tipo_franquia', tipoFranquia)
        .maybeSingle();

    if (error) console.error(error);
    return data;
};