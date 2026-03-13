import { supabase } from '@/lib/supabaseClient';
import { isValidEmail } from '@/lib/validationUtils';

// --- Internal Helper ---
const invokeEmailFunction = async (payload) => {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload
    });

    if (error) {
        console.error("Supabase Function Error:", error);
        throw error;
    }
    if (!data?.success) {
        console.error("API Error:", data?.error);
        throw new Error(data?.error || 'Unknown error');
    }
    return { success: true };
};

// --- Exported Functions ---

export const sendReservationEmailToRental = async (reservaId, rentalEmail, userData, carData) => {
  console.log(`[EMAIL] Enviando alerta para locadora: ${rentalEmail}`);
  try {
    return await invokeEmailFunction({ 
        type: 'reservation_admin_alert', 
        reservaId, 
        rentalEmail, 
        userData, 
        carData 
    });
  } catch (error) {
    console.error(`[EMAIL] Erro ao enviar email locadora: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const sendConfirmationEmailToUser = async (reservaId, userEmail, userData, carData) => {
  // Validate email first
  if (!userEmail) {
      console.log(`[EMAIL] Email não definido (undefined/null), abortando envio.`);
      return { success: false, error: 'Email não definido' };
  }

  if (!isValidEmail(userEmail)) {
      console.log(`[EMAIL] Email inválido: ${userEmail}`);
      return { success: false, error: 'Formato de email inválido' };
  }

  console.log(`[EMAIL] Email enviado para: ${userEmail}`);
  
  try {
    return await invokeEmailFunction({ 
        type: 'reservation_received', 
        reservaId, 
        userEmail, 
        userData, 
        carData 
    });
  } catch (error) {
    console.error(`[EMAIL] Erro ao enviar email usuário: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const sendConfirmationEmail = async (reservaId, userEmail, userData, carData) => {
  console.log(`[EMAIL] Enviando CONFIRMAÇÃO para usuário: ${userEmail}`);
  try {
    return await invokeEmailFunction({ 
        type: 'confirmation', 
        reservaId, 
        userEmail, 
        userData, 
        carData 
    });
  } catch (error) {
    console.error(`[EMAIL] Erro ao enviar confirmação: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const sendRejectionEmail = async (reservaId, userEmail, userData, motivo) => {
  console.log(`[EMAIL] Enviando CANCELAMENTO para usuário: ${userEmail}`);
  try {
    return await invokeEmailFunction({ 
        type: 'rejection', 
        reservaId, 
        userEmail, 
        userData, 
        motivo 
    });
  } catch (error) {
    console.error(`[EMAIL] Erro ao enviar cancelamento: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const testEmail = async (testEmail) => {
  console.log(`[EMAIL] Enviando email de teste para: ${testEmail}`);
  try {
    return await invokeEmailFunction({ type: 'test', testEmail });
  } catch (error) {
    console.error(`[EMAIL] Erro ao enviar teste: ${error.message}`);
    return { success: false, error: error.message };
  }
};