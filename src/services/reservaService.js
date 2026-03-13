import { supabase } from '@/lib/supabaseClient';
import { addDays, isValid } from 'date-fns';

/**
 * Calculates the return date based on the plan type.
 */
export const calcularDataDevolucao = (dataRetirada, plano) => {
    if (!dataRetirada) return '';
    const date = new Date(dataRetirada);
    if (!isValid(date)) return '';

    let dias = 0;
    if (plano === 'trimestral') dias = 90;
    else if (plano === 'semestral') dias = 180;
    else if (plano === 'anual') dias = 365;
    else if (plano === 'semanal') dias = 7;
    else return ''; 

    const result = addDays(date, dias);
    return result.toISOString().split('T')[0];
};

/**
 * Calculates duration in days.
 */
export const calcularDuracao = (dataRetirada, dataDevolucao, plano) => {
    if (plano === 'trimestral') return 90;
    if (plano === 'semestral') return 180;
    if (plano === 'anual') return 365;
    if (plano === 'semanal') return 7;

    if (!dataRetirada || !dataDevolucao) return 0;

    const start = new Date(dataRetirada);
    const end = new Date(dataDevolucao);

    if (!isValid(start) || !isValid(end)) return 0;

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays === 0 ? 1 : diffDays;
};

export const validarDatas = (dataRetirada, dataDevolucao, plano) => {
    const errors = [];
    if (!dataRetirada) errors.push("Data de retirada é obrigatória.");

    const isFixed = plano === 'trimestral' || plano === 'semestral' || plano === 'anual' || plano === 'semanal';

    if (!isFixed) {
        if (!dataDevolucao) {
            errors.push("Data de devolução é obrigatória.");
        } else if (dataRetirada && dataDevolucao) {
            const start = new Date(dataRetirada);
            const end = new Date(dataDevolucao);
            if (end <= start) errors.push("Data de devolução deve ser após a data de retirada.");
        }
    }
    return { isValid: errors.length === 0, errors };
};

export const createReserva = async (arg1, arg2, arg3, arg4, arg5) => {
  let reservaData = {};

  if (typeof arg1 === 'object' && arg1 !== null) {
     const dados = arg1;
     const valorTotalRaw = dados.valorTotal || dados.valor_total || dados.reserva?.valorTotal;

     if (valorTotalRaw === null || valorTotalRaw === undefined) {
         throw new Error("O valor total da reserva é obrigatório e não foi recebido.");
     }

     const retiradaFinal = dados.dataRetirada || dados.dataInicio || dados.reserva?.dataRetirada || dados.data_retirada;
     const devolucaoFinal = dados.dataDevolucao || dados.dataFim || dados.reserva?.dataDevolucao || dados.data_devolucao;

     if (!retiradaFinal) {
         throw new Error("Data de retirada não encontrada nos dados da reserva.");
     }

     reservaData = {
        usuario_id: dados.usuario?.id || dados.usuario_id,
        carro_id: dados.carro?.id || dados.carro_id,
        data_retirada: retiradaFinal,
        data_devolucao: devolucaoFinal,
        valor_total: valorTotalRaw,
        status: 'pendente_documentos', // Initial status waiting for docs
        tipo_reserva: dados.tipoReserva,
        plano: dados.plano || dados.planoSelecionado,
        franquia_km: dados.franquia_km || dados.franquiaSelecionada,
        valor_diario: dados.valorDiario || dados.valorDiaria,
        km_contratado: dados.kmContratado || (dados.franquia_km ? parseInt(dados.franquia_km) : null),
        km_adicional_valor: dados.kmExcedente || dados.km_adicional_valor || 0,
        origem_frota: 'site'
     };
  } else {
     reservaData = {
        usuario_id: arg1,
        carro_id: arg2,
        data_retirada: arg3,
        data_devolucao: arg4,
        valor_total: arg5,
        status: 'pendente_documentos',
        origem_frota: 'site'
     };
  }

  const { data, error } = await supabase
    .from('reservas')
    .insert([reservaData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserReservas = async (userId) => {
  const { data, error } = await supabase
    .from('reservas')
    .select(`*, cars:carro_id (*), users:usuario_id (*)`)
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getReservaById = async (id) => {
  const { data, error } = await supabase
    .from('reservas')
    .select(`*, cars:carro_id (*), users:usuario_id (*), reserva_documentos(*)`)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const updateReservaStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('reservas')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const cancelReserva = async (id) => {
  const { data, error } = await supabase
    .from('reservas')
    .update({ status: 'cancelada', motivo_cancelamento: 'Cancelado pelo usuário' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const listReservas = async () => {
  const { data, error } = await supabase
    .from('reservas')
    .select(`*, cars:carro_id (*), users:usuario_id (*)`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};