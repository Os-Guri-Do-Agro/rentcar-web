import { supabase } from '@/lib/supabaseClient';

export const getWhatsAppNumber = async () => {
  try {
    const { data, error } = await supabase
      .from('admin_configs')
      .select('valor')
      .eq('chave', 'whatsapp_number')
      .single();
      
    if (error) return '5511913123870'; // Fallback to required default
    return data?.valor || '5511913123870';
  } catch (err) {
    return '5511913123870';
  }
};

export const setWhatsAppNumber = async (number) => {
  try {
    const { error } = await supabase
      .from('admin_configs')
      .upsert({ chave: 'whatsapp_number', valor: number }, { onConflict: 'chave' });
      
    if (error) throw error;
    return true;
  } catch (err) {
    throw err;
  }
};

export const validateWhatsAppNumber = (number) => {
  if (!number) return false;
  const regex = /^\d{10,15}$/;
  return regex.test(number);
};

export const sendConfirmationToUserWhatsApp = async (reservation, user, car, documentUrls) => {
  console.log(`Enviando confirmação de reserva via WhatsApp para: ${user.telefone}`);
  try {
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: { 
        type: 'confirmation', 
        reservaId: reservation.id,
        phoneNumber: user.telefone,
        userData: user,
        carData: car,
        documentUrls: documentUrls
      }
    });

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || 'Unknown error');

    return { success: true };
  } catch (error) {
    console.error(`Erro ao enviar confirmação via WhatsApp: ${error.message}`);
    return { success: false, error: error.message };
  }
};