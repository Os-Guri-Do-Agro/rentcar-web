import { supabase } from '@/lib/supabaseClient';

export const getClienteAvaliacao = async (clienteId) => {
    try {
        const { data, error } = await supabase
            .from('cliente_avaliacoes')
            .select('*')
            .eq('cliente_id', clienteId)
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`[AvaliacaoService] Erro ao buscar avaliação:`, error);
        return null;
    }
};

export const updateClienteAvaliacao = async (clienteId, nota, notasPessoais, adminId) => {
    try {
        const { data: existing } = await supabase
            .from('cliente_avaliacoes')
            .select('*')
            .eq('cliente_id', clienteId)
            .maybeSingle();

        let avaliacaoId;

        if (existing) {
            avaliacaoId = existing.id;
            const { error: updateError } = await supabase
                .from('cliente_avaliacoes')
                .update({ nota, notas_pessoais: notasPessoais, atualizado_em: new Date().toISOString() })
                .eq('id', avaliacaoId);

            if (updateError) throw updateError;

            await supabase.from('cliente_avaliacoes_historico').insert({
                avaliacao_id: avaliacaoId,
                nota_anterior: existing.nota,
                nota_nova: nota,
                notas_anteriores: existing.notas_pessoais,
                notas_novas: notasPessoais,
                atualizado_por: adminId
            });
        } else {
            const { data: newAval, error: createError } = await supabase
                .from('cliente_avaliacoes')
                .insert({ cliente_id: clienteId, nota, notas_pessoais: notasPessoais, criado_por: adminId })
                .select()
                .single();

            if (createError) throw createError;
            avaliacaoId = newAval.id;

            await supabase.from('cliente_avaliacoes_historico').insert({
                avaliacao_id: avaliacaoId,
                nota_anterior: null,
                nota_nova: nota,
                notas_anteriores: null,
                notas_novas: notasPessoais,
                atualizado_por: adminId
            });
        }

        return { success: true };
    } catch (error) {
        console.error(`[AvaliacaoService] Erro ao atualizar:`, error);
        return { success: false, error: error.message };
    }
};

export const getClienteAvaliacaoHistorico = async (clienteId) => {
    try {
        const { data: aval } = await supabase
            .from('cliente_avaliacoes')
            .select('id')
            .eq('cliente_id', clienteId)
            .maybeSingle();

        if (!aval) return [];

        const { data: hist, error } = await supabase
            .from('cliente_avaliacoes_historico')
            .select('*, updated_by:atualizado_por(nome)')
            .eq('avaliacao_id', aval.id)
            .order('atualizado_em', { ascending: false });

        if (error) throw error;
        return hist;
    } catch (error) {
        console.error(`[AvaliacaoService] Erro ao buscar histórico:`, error);
        return [];
    }
};

export const getClienteReservas = async (clienteId) => {
    try {
        const { data, error } = await supabase
            .from('reservas')
            .select(`
                *,
                cars:cars!reservas_carro_id_fkey(marca, nome, placa, ano, cor),
                reserva_documentos(*)
            `)
            .eq('usuario_id', clienteId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`[AvaliacaoService] Erro ao buscar reservas:`, error);
        return [];
    }
};
