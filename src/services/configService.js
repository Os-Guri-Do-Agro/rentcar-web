import { supabase } from '@/lib/supabaseClient';

// --- General Configs (Existing) ---
const DEFAULTS = {
  whatsapp: '5511913123870',
  email: 'adm@jlrentacar.com.br',
  telefone: '(11) 91312-3870',
  endereco: 'Rua Fernando Falcão, 54 - Mooca, São Paulo - SP',
  horario: 'Segunda a Sexta: 08h às 18h',
  instagram: 'https://www.instagram.com/jlrentacarsp/',
  facebook: 'https://www.facebook.com/profile.php?id=61584407205265',
  maps_url: 'https://maps.google.com/?q=Rua+Fernando+Falcão+54'
};

export const getConfig = async (chave, fallback) => {
  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', chave)
      .maybeSingle();

    if (error) {
       // Fallback for legacy tables if needed
       const { data: adminData, error: adminError } = await supabase
        .from('admin_configs')
        .select('valor')
        .eq('chave', chave)
        .maybeSingle();
        
       if (adminError || !adminData) {
         return fallback;
       }
       return adminData.valor;
    }

    if (!data || !data.valor) {
      return fallback;
    }

    return data.valor;

  } catch (error) {
    console.error(`[ConfigService] Unexpected error fetching '${chave}':`, error);
    return fallback;
  }
};

export const getWhatsAppNumber = async () => getConfig('whatsapp', DEFAULTS.whatsapp);
export const getEmailSuporte = async () => getConfig('email', DEFAULTS.email);
export const getTelefoneSuporte = async () => getConfig('telefone', DEFAULTS.telefone);
export const getEnderecoEmpresa = async () => getConfig('endereco', DEFAULTS.endereco);
export const getHorarioFuncionamento = async () => getConfig('horario', DEFAULTS.horario);
export const getInstagram = async () => getConfig('instagram', DEFAULTS.instagram);
export const getFacebook = async () => getConfig('facebook', DEFAULTS.facebook);
export const getMapsUrl = async () => getConfig('maps_url', DEFAULTS.maps_url);

export const updateConfig = async (chave, valor) => {
  try {
    const { error } = await supabase
      .from('configuracoes')
      .upsert({ 
        chave, 
        valor,
        atualizado_em: new Date().toISOString()
      }, { onConflict: 'chave' });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`[ConfigService] Error updating '${chave}':`, error);
    return { success: false, error: error.message };
  }
};

// --- New Pricing Functions (Requested) ---

// 1. Car Pricing
export const getCarPricing = async () => {
    console.log("[ConfigService] Fetching car pricing...");
    try {
        const { data, error } = await supabase
            .from('cars')
            .select('id, nome, marca, placa, preco_diaria_particular, preco_diaria_motorista, preco_km_extra_particular, preco_km_extra_motorista')
            .order('nome');

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("[ConfigService] Error fetching car pricing:", error);
        return { success: false, error: error.message };
    }
};

export const updateCarPricing = async (carId, pricingData) => {
    console.log(`[ConfigService] Updating pricing for car ${carId}`, pricingData);
    try {
        const { error } = await supabase
            .from('cars')
            .update(pricingData)
            .eq('id', carId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("[ConfigService] Error updating car pricing:", error);
        return { success: false, error: error.message };
    }
};

// 2. Rental Plans
export const getPlanPricing = async () => {
    console.log("[ConfigService] Fetching rental plans...");
    try {
        const { data, error } = await supabase
            .from('planos')
            .select('*')
            .order('created_at');

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("[ConfigService] Error fetching plans:", error);
        return { success: false, error: error.message };
    }
};

export const createPlanPricing = async (planData) => {
    console.log("[ConfigService] Creating plan:", planData);
    try {
        const { data, error } = await supabase
            .from('planos')
            .insert([planData])
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("[ConfigService] Error creating plan:", error);
        return { success: false, error: error.message };
    }
};

export const updatePlanPricing = async (planId, planData) => {
    console.log(`[ConfigService] Updating plan ${planId}:`, planData);
    try {
        const { error } = await supabase
            .from('planos')
            .update(planData)
            .eq('id', planId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("[ConfigService] Error updating plan:", error);
        return { success: false, error: error.message };
    }
};

export const deletePlanPricing = async (planId) => {
    console.log(`[ConfigService] Deleting plan ${planId}`);
    try {
        const { error } = await supabase
            .from('planos')
            .delete()
            .eq('id', planId);
            
        if(error) throw error;
        return { success: true };
    } catch (error) {
        console.error("[ConfigService] Error deleting plan:", error);
        return { success: false, error: error.message };
    }
};

// 3. KM Pricing (Global fallback if not specific to car)
export const getKmPricing = async () => {
    console.log("[ConfigService] Fetching KM pricing...");
    return { success: true, data: { preco_km_extra: await getConfig('global_km_price', '0.50') } };
};

export const updateKmPricing = async (data) => {
    console.log("[ConfigService] Updating KM pricing:", data);
    const result = await updateConfig('global_km_price', data.preco_km_extra);
    return result;
};