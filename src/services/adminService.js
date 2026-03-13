import { supabase } from '@/lib/supabaseClient';
import { fetchWithRetry } from '@/lib/requestUtils';

export const getDashboardStats = async () => {
  console.log("[DB] getDashboardStats - Fetching stats with explicit FK syntax");
  return fetchWithRetry(async () => {
    // Parallelize requests
    const [carsRes, usersRes, reservasRes, recentRes] = await Promise.all([
       supabase.from('cars').select('*', { count: 'exact', head: true }),
       supabase.from('users').select('*', { count: 'exact', head: true }),
       supabase.from('reservas').select('*', { count: 'exact', head: true }),
       // Explicit Foreign Key Syntax
       supabase.from('reservas')
         .select('*, users:users!reservas_usuario_id_fkey(nome, email), cars:cars!reservas_carro_id_fkey(nome)')
         .order('created_at', { ascending: false })
         .limit(5)
    ]);

    if (carsRes.error) throw carsRes.error;
    if (usersRes.error) throw usersRes.error;
    if (reservasRes.error) throw reservasRes.error;
    if (recentRes.error) throw recentRes.error;

    return {
      stats: {
        totalCars: carsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalReservas: reservasRes.count || 0,
      },
      recentReservas: recentRes.data || []
    };
  }, 'admin_stats');
};

export const getAdminConfigs = async () => {
  return fetchWithRetry(async () => {
    const { data, error } = await supabase
      .from('admin_configs')
      .select('*');
      
    if (error) throw error;
    
    // Transform array to object for easier usage
    const configMap = {};
    data?.forEach(item => {
      configMap[item.chave] = item.valor;
    });
    
    return configMap;
  }, 'admin_configs');
};

export const updateAdminConfig = async (key, value) => {
  return fetchWithRetry(async () => {
    // Check if exists first (upsert behavior)
    const { data: existing } = await supabase
      .from('admin_configs')
      .select('id')
      .eq('chave', key)
      .single();
      
    let query;
    if (existing) {
       query = supabase.from('admin_configs').update({ valor: value, updated_at: new Date() }).eq('chave', key);
    } else {
       query = supabase.from('admin_configs').insert([{ chave: key, valor: value }]);
    }
    
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  }, null, false);
};