import { supabase } from '@/lib/supabaseClient';
import { 
    sendConfirmationEmail, 
    sendRejectionEmail
} from '@/services/emailService';

/**
 * Confirms a reservation (Status: Confirmada)
 */
export const confirmReserva = async (reservaId, adminId) => {
    console.log(`[StatusService] Confirmando reserva ${reservaId}...`);
    
    try {
        const { data: reserva, error: fetchError } = await supabase
            .from('reservas')
            .select('*, cars(*), users(*)')
            .eq('id', reservaId)
            .single();

        if (fetchError || !reserva) throw new Error("Reserva não encontrada.");
        
        const oldStatus = reserva.status;
        const newStatus = 'confirmada';

        console.log(`[StatusService] Atualizando status para ${newStatus}...`);
        const { error: updateError } = await supabase
            .from('reservas')
            .update({ status: newStatus, motivo_cancelamento: null })
            .eq('id', reservaId);

        if (updateError) throw updateError;

        await supabase.from('reserva_historico').insert({
            reserva_id: reservaId,
            status_anterior: oldStatus,
            status_novo: newStatus,
            criado_por: adminId,
            motivo: 'Confirmação Administrativa',
            tipo_acao: 'status_reserva'
        });

        console.log(`[StatusService] Enviando email de confirmação...`);
        const userData = { nome: reserva.users.nome, email: reserva.users.email };
        const carData = { marca: reserva.cars.marca, nome: reserva.cars.nome, placa: reserva.cars.placa };
        
        await sendConfirmationEmail(reservaId, reserva.users.email, userData, carData);

        console.log(`[StatusService] Reserva confirmada com sucesso`);
        return { success: true };

    } catch (error) {
        console.error(`[StatusService] Erro ao confirmar:`, error);
        return { success: false, error: error.message };
    }
};

/**
 * Rejects/Cancels a reservation
 */
export const rejectReserva = async (reservaId, motivo, adminId) => {
    console.log(`[StatusService] Cancelando/Recusando reserva ${reservaId}...`);

    try {
        if (!motivo) throw new Error("Motivo do cancelamento é obrigatório.");

        const { data: reserva, error: fetchError } = await supabase
            .from('reservas')
            .select('*, users(*), cars(*)')
            .eq('id', reservaId)
            .single();

        if (fetchError || !reserva) throw new Error("Reserva não encontrada.");

        const oldStatus = reserva.status;
        const newStatus = 'cancelada';

        console.log(`[StatusService] Atualizando status para ${newStatus}...`);
        const { error: updateError } = await supabase
            .from('reservas')
            .update({ status: newStatus, motivo_cancelamento: motivo })
            .eq('id', reservaId);

        if (updateError) throw updateError;

        await supabase.from('reserva_historico').insert({
            reserva_id: reservaId,
            status_anterior: oldStatus,
            status_novo: newStatus,
            criado_por: adminId,
            motivo: motivo,
            tipo_acao: 'cancelamento'
        });

        console.log(`[StatusService] Enviando email de cancelamento...`);
        const userData = { nome: reserva.users.nome, email: reserva.users.email };
        
        await sendRejectionEmail(reservaId, reserva.users.email, userData, motivo);

        console.log(`[StatusService] Reserva cancelada com sucesso`);
        return { success: true };

    } catch (error) {
        console.error(`[StatusService] Erro ao cancelar:`, error);
        return { success: false, error: error.message };
    }
};

/**
 * Hard Deletes a reservation
 */
export const deleteReserva = async (reservaId) => {
    console.log(`[StatusService] EXCLUINDO reserva ${reservaId} permanentemente...`);
    try {
        // Cascade delete should handle relations if configured, otherwise might need manual cleanup
        // Assuming cascade or simple delete for now based on prompt req "removes from database"
        const { error } = await supabase
            .from('reservas')
            .delete()
            .eq('id', reservaId);

        if (error) throw error;
        
        console.log(`[StatusService] Reserva excluída.`);
        return { success: true };
    } catch (error) {
         console.error(`[StatusService] Erro ao excluir:`, error);
         return { success: false, error: error.message };
    }
};

export const getReservaHistorico = async (reservaId) => {
    const { data, error } = await supabase
        .from('reserva_historico')
        .select('*')
        .eq('reserva_id', reservaId)
        .order('criado_em', { ascending: false });

    if (error) throw error;
    return data;
};