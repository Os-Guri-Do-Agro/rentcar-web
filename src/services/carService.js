import { supabase } from '@/lib/supabaseClient';
import { fetchWithRetry } from '@/lib/requestUtils';

export const fetchAllCars = async (onlyAvailable = true) => {
  let query = supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false });

  if (onlyAvailable) {
    query = query.eq('disponivel', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Alias for backward compatibility
export const getAllCars = fetchAllCars;

export const fetchFeaturedCars = async () => {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('destaque', true)
    .eq('disponivel', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const fetchCarById = async (id) => {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const createCar = async (carData) => {
  const payload = {
    ...carData,
    planos_km: carData.planos_km || []
  };
  
  const { data, error } = await supabase
    .from('cars')
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateCar = async (id, updates) => {
  const payload = {
    ...updates,
    planos_km: updates.planos_km || []
  };

  const { data, error } = await supabase
    .from('cars')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteCar = async (id) => {
  const { error } = await supabase.from('cars').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const updateCarAvailability = async (carId, type, isAvailable) => {
  const field = type === 'particular' ? 'disponivel_particular' : 'disponivel_motorista';
  const { data, error } = await supabase
    .from('cars')
    .update({ [field]: isAvailable })
    .eq('id', carId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateGeneralAvailability = async (carId, isAvailable) => {
  const { data, error } = await supabase
    .from('cars')
    .update({ disponivel: isAvailable })
    .eq('id', carId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const fetchPriceHistory = async (carId = null) => {
  // Query corrigida com coluna marca
  let query = supabase
    .from('price_history')
    .select('*, cars(marca, nome)')
    .order('data_alteracao', { ascending: false });

  if (carId) {
    query = query.eq('car_id', carId);
  }

  const { data, error } = await query;
  if (error) throw error;
  console.log("Histórico de preços carregado com marca");
  return data;
};

export const updateCarPrice = async (carId, newPrice, oldPrice) => {
  // Update the car's current price
  const { error: updateError } = await supabase
    .from('cars')
    .update({ preco_diaria: newPrice })
    .eq('id', carId);

  if (updateError) throw updateError;

  // Log the price change in history
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