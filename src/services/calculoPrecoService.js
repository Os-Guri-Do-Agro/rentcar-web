import { calcularDuracao } from '@/lib/dateUtils';

export const calculateWeeklyPrice = (total, plan) => {
    if (!total || total <= 0) return 0;
    if (plan === 'trimestral') return total / 13;
    if (plan === 'semestral') return total / 26;
    if (plan === 'anual') return total / 52;
    if (plan === 'semanal') return total; // It's already weekly
    return 0;
};

export const calculateMonthlyPrice = (total, plan) => {
    if (!total || total <= 0) return 0;
    if (plan === 'trimestral') return total / 3;
    if (plan === 'semestral') return total / 6;
    if (plan === 'anual') return total / 12;
    if (plan === 'semanal') return total * 4; // Estimate
    return 0;
};

const getColumnName = (tipo_locacao, tipo_plano, km) => {
    const type = tipo_locacao?.toLowerCase() || 'particular';
    const plan = tipo_plano?.toLowerCase() || 'diario';
    if (type === 'particular') {
        if (plan === 'diario' && km) return `${type}_diario_${km}km`;
        if (plan === 'semanal' && km) return `${type}_semanal_${km}`;
        if (plan === 'franquia' && km) return `${type}_franquia_${km}km`;
        if (plan === 'trimestral') return `${type}_trimestral`;
        if (plan === 'semestral') return `${type}_semestral`;
    } else if (type === 'motorista') {
        if (plan === 'semanal' && km) return `${type}_semanal_${km}km`;
        if (plan === 'trimestral' && km) return `${type}_trimestral_${km}`;
        if (plan === 'semestral' && km) return `${type}_semestral_${km}`;
        if (plan === 'anual' && km) return `${type}_anual_${km}`;
        if (plan === 'franquia' && km) return `${type}_franquia_${km}km`;
    } else {
        if (plan === 'diario' && km) return `${type}_diario_${km}km`;
        if (plan === 'franquia' && km) return `${type}_franquia_${km}km`;
    }
    return null;
};

export const calcularPrecoReserva = (carro, tipoLocacao, tipoPlano, usoKm, dataInicio, dataFim) => {
    if (!dataInicio || !dataFim || !carro) return { total: 0, dias: 0, diario: 0, semanal: 0, mensal: 0 };
    const dias = calcularDuracao(dataInicio, dataFim, tipoPlano);
    const columnName = getColumnName(tipoLocacao, tipoPlano, usoKm);
    if (!columnName || !carro[columnName]) {
        return { total: 0, dias, erro: `Plano ${tipoPlano} (${usoKm}km) indisponível ou não configurado.` };
    }
    const priceVal = parseFloat(carro[columnName]);
    let total = 0, diario = 0, semanal = 0, mensal = 0;
    if (tipoPlano === 'diario') {
        diario = priceVal;
        total = diario * dias;
    } else {
        total = priceVal;
        if (tipoPlano === 'semanal') {
            semanal = total;
            diario = total / 7;
        } else if (tipoPlano === 'trimestral') {
            semanal = calculateWeeklyPrice(total, 'trimestral');
            mensal = calculateMonthlyPrice(total, 'trimestral');
            diario = total / 90;
        } else if (tipoPlano === 'semestral') {
            semanal = calculateWeeklyPrice(total, 'semestral');
            mensal = calculateMonthlyPrice(total, 'semestral');
            diario = total / 180;
        } else if (tipoPlano === 'anual') {
            semanal = calculateWeeklyPrice(total, 'anual');
            mensal = calculateMonthlyPrice(total, 'anual');
            diario = total / 365;
        } else if (tipoPlano === 'franquia') {
            mensal = total;
            semanal = total / 4;
            diario = total / 30;
        }
    }
    if (total <= 0) return { total: 0, dias, erro: 'Preço não configurado (R$ 0,00).' };
    return { total, dias, diario, semanal, mensal, valorBase: diario };
};
