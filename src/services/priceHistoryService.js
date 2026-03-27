import { supabase } from '@/lib/supabaseClient';

export const fetchPriceHistory = async (carId = null) => {
    let query = supabase
        .from('price_history')
        .select('*, cars(marca, nome)')
        .order('data_alteracao', { ascending: false });

    if (carId) {
        query = query.eq('car_id', carId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const updateCarPrice = async (carId, newPrice, oldPrice) => {
    const { error: updateError } = await supabase
        .from('cars')
        .update({ preco_diaria: newPrice })
        .eq('id', carId);

    if (updateError) throw updateError;

    const { error: historyError } = await supabase
        .from('price_history')
        .insert([{
            car_id: carId,
            preco_anterior: oldPrice,
            preco_novo: newPrice,
            data_alteracao: new Date().toISOString()
        }]);

    if (historyError) {
        console.error('Error logging price history:', historyError);
    }

    return true;
};
