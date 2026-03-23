import { supabase } from '@/lib/supabaseClient';
import { calcularDuracao } from '@/lib/dateUtils';
import { getColumnName } from './carPricingService';

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

export const calcularPrecoReserva = async (carroId, tipoLocacao, tipoPlano, usoKm, dataInicio, dataFim) => {
    if (!dataInicio || !dataFim) return { total: 0, dias: 0, diario: 0, semanal: 0, mensal: 0 };

    const dias = calcularDuracao(dataInicio, dataFim, tipoPlano);
    
    try {
        const { data: car, error } = await supabase
            .from('cars')
            .select('*')
            .eq('id', carroId)
            .single();

        if (error || !car) return { total: 0, dias, erro: 'Erro ao consultar veículo.' };

        let total = 0;
        let diario = 0;
        let semanal = 0;
        let mensal = 0;
        let columnName = '';

        const normalizedType = tipoLocacao || 'particular';
        
        // Use the centralized getColumnName from carPricingService to ensure consistency
        columnName = getColumnName(normalizedType, tipoPlano, usoKm);

        if (columnName && car[columnName]) {
            const priceVal = parseFloat(car[columnName]);
            
            if (tipoPlano === 'diario') {
                diario = priceVal;
                total = diario * dias;
            } else {
                // Fixed Plans (Semanal, Trimestral, Semestral, Anual, Franquia)
                total = priceVal;
                
                // Calculate display values
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
                    semanal = total / 4; // Approx
                    diario = total / 30; // Approx
                }
            }
        } else {
             return { total: 0, dias, erro: `Plano ${tipoPlano} (${usoKm}km) indisponível ou não configurado.` };
        }

        if (total <= 0) return { total: 0, dias, erro: 'Preço não configurado (R$ 0,00).' };

        return { 
            total, 
            dias, 
            diario, 
            semanal, 
            mensal,
            valorBase: diario 
        };

    } catch (err) {
        console.error(err);
        return { total: 0, dias, erro: 'Erro interno de cálculo.' };
    }
};