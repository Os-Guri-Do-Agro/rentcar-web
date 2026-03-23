/**
 * Date Utility Functions
 * Consistent date formatting and handling across the application
 */
import { addDays, isValid } from 'date-fns';

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

    const isFixed = ['trimestral', 'semestral', 'anual', 'semanal'].includes(plano);

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

export const formatarData = (data) => {

  if (!data) {
    return "-";
  }

  try {
    const dataObj = new Date(data);

    // Validate if it's a valid date
    if (isNaN(dataObj.getTime())) {
      return "-";
    }

    // Options for formatting
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    // Check if it's just a date string (YYYY-MM-DD) to avoid timezone shifts or unwanted time
    // If original input matches YYYY-MM-DD exactly, we might want to skip time or force UTC handling
    // For now, using standard locale string with pt-BR
    const formatted = dataObj.toLocaleDateString('pt-BR', options);
    
    // If the time is 00:00, sometimes users prefer just the date, but requirement says "DD/MM/YYYY HH:mm"
    // Let's stick to the requested format.
    
    return formatted;

  } catch (error) {
    console.error(`[DATE_UTILS] Erro ao formatar data:`, error);
    return "-";
  }
};