import { supabase } from '@/lib/supabaseClient';

export const getCarrosDestaque = async () => {
    console.log("Fetching featured cars...");
    const { data, error } = await supabase
        .from('carros_destaque')
        .select(`
            *,
            cars (*)
        `)
        .eq('ativo', true)
        .order('posicao', { ascending: true });
    
    if (error) {
        console.error("Error fetching featured cars:", error);
        return [];
    }
    
    // Flatten structure for easier usage
    return data.map(item => ({
        ...item.cars,
        destaque_id: item.id,
        posicao: item.posicao
    }));
};

export const getCarrosDisponiveis = async () => {
    console.log("Fetching available cars for feature...");
    
    // First get IDs of featured cars
    const { data: featured, error: featError } = await supabase
        .from('carros_destaque')
        .select('carro_id');
        
    if (featError) throw featError;
    
    const featuredIds = featured.map(f => f.carro_id);
    
    // Fetch cars NOT in featured list
    let query = supabase.from('cars').select('*').eq('disponivel', true);
    
    if (featuredIds.length > 0) {
        query = query.not('id', 'in', `(${featuredIds.join(',')})`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data;
};

export const addCarroDestaque = async (carroId) => {
    console.log(`Adding car ${carroId} to featured...`);
    
    // Check if already featured
    const { data: existing } = await supabase
        .from('carros_destaque')
        .select('id')
        .eq('carro_id', carroId)
        .maybeSingle();
        
    if (existing) throw new Error("Carro já está em destaque.");

    // Get max position
    const { data: maxPos } = await supabase
        .from('carros_destaque')
        .select('posicao')
        .order('posicao', { ascending: false })
        .limit(1)
        .maybeSingle();
        
    const newPos = (maxPos?.posicao || 0) + 1;
    
    const { error } = await supabase
        .from('carros_destaque')
        .insert({
            carro_id: carroId,
            posicao: newPos,
            ativo: true
        });
        
    if (error) throw error;
    console.log("Carro adicionado ao destaque com sucesso");
    return { success: true };
};

export const removeCarroDestaque = async (carroId) => {
    console.log(`Removing car ${carroId} from featured...`);
    const { error } = await supabase
        .from('carros_destaque')
        .delete()
        .eq('carro_id', carroId);
        
    if (error) throw error;
    console.log("Carro removido do destaque com sucesso");
    return { success: true };
};

export const reorderCarrosDestaque = async (carros) => {
    console.log("Reordering featured cars...");
    
    // This could be optimized with a stored procedure or batch update, 
    // but for small lists, sequential updates are acceptable
    for (let i = 0; i < carros.length; i++) {
        const { error } = await supabase
            .from('carros_destaque')
            .update({ posicao: i + 1 })
            .eq('carro_id', carros[i].id);
            
        if (error) {
            console.error("Error updating position:", error);
            throw error;
        }
    }
    console.log("Carros reordenados com sucesso");
    return { success: true };
};

export const getCarroDestaqueById = async (carroId) => {
    const { data, error } = await supabase
        .from('carros_destaque')
        .select('*')
        .eq('carro_id', carroId)
        .single();
        
    if (error) return null;
    return data;
};