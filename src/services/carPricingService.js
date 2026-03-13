import { supabase } from '@/lib/supabaseClient';

/**
 * DEBUGGING UTILITIES
 */
const log = (func, message, data = null) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logMsg = `[${timestamp}] [carPricingService] [${func}] ${message}`;
    if (data) {
        console.log(logMsg, data);
    } else {
        console.log(logMsg);
    }
};

const logError = (func, message, error) => {
    console.error(`[carPricingService] [${func}] ERROR: ${message}`, error);
};

/**
 * Helper to determine the column name in the cars table
 */
export const getColumnName = (tipo_locacao, tipo_plano, km = null) => {
    const type = tipo_locacao?.toLowerCase() || 'particular';
    const plan = tipo_plano?.toLowerCase() || 'diario';

    let columnName = null;

    // Particular Plans
    if (type === 'particular') {
        if (plan === 'diario' && km) {
            columnName = `${type}_diario_${km}km`;
        } else if (plan === 'semanal' && km) {
            columnName = `${type}_semanal_${km}`; // e.g. particular_semanal_1500
        } else if (plan === 'franquia' && km) {
            columnName = `${type}_franquia_${km}km`;
        } else if (plan === 'trimestral') {
            columnName = `${type}_trimestral`;
        } else if (plan === 'semestral') {
            columnName = `${type}_semestral`;
        }
    } 
    // Motorista Plans
    else if (type === 'motorista') {
        if (plan === 'semanal') {
            // Logic for old motorista weekly structure or new structure if needed
            // Assuming old structure `motorista_semanal_1250km` etc exists, but here we focus on the new ones requested
            if (km) columnName = `${type}_semanal_${km}km`;
            else columnName = `${type}_semanal`;
        } else if (plan === 'trimestral' && km) {
            columnName = `${type}_trimestral_${km}`; // e.g. motorista_trimestral_2500
        } else if (plan === 'semestral' && km) {
            columnName = `${type}_semestral_${km}`; // e.g. motorista_semestral_5000
        } else if (plan === 'anual' && km) {
            columnName = `${type}_anual_${km}`; // e.g. motorista_anual_6000
        } else if (plan === 'franquia' && km) {
            columnName = `${type}_franquia_${km}km`;
        }
    }
    // Corporativo or other fallback
    else {
        if (plan === 'diario' && km) {
            columnName = `${type}_diario_${km}km`;
        } else if (plan === 'franquia' && km) {
            columnName = `${type}_franquia_${km}km`;
        }
    }

    log('getColumnName', `Generated: ${columnName}`, { tipo_locacao, tipo_plano, km });
    return columnName;
};

/**
 * Helper to structure flat car columns into nested pricing object for UI
 */
const structureCarPricing = (car) => {
    if (!car) return null;

    const buildSection = (type) => {
        let pricing = {};

        if (type === 'particular') {
            pricing = {
                diario: [
                    { id: '60km', uso_km: 60, preco_diaria: car[`${type}_diario_60km`] || 0, label: '60 KM' },
                    { id: '100km', uso_km: 100, preco_diaria: car[`${type}_diario_100km`] || 0, label: '100 KM' },
                    { id: '120km', uso_km: 120, preco_diaria: car[`${type}_diario_120km`] || 0, label: '120 KM' }
                ],
                semanal: [
                    { id: '1500', plano_km: 1500, preco_total: car[`${type}_semanal_1500`] || 0 },
                    { id: '2000', plano_km: 2000, preco_total: car[`${type}_semanal_2000`] || 0 },
                    { id: '3000', plano_km: 3000, preco_total: car[`${type}_semanal_3000`] || 0 }
                ],
                franquia: [
                    { id: '1500km', plano_km: 1500, preco_total: car[`${type}_franquia_1500km`] || 0 },
                    { id: '2000km', plano_km: 2000, preco_total: car[`${type}_franquia_2000km`] || 0 },
                    { id: '3000km', plano_km: 3000, preco_total: car[`${type}_franquia_3000km`] || 0 }
                ],
                trimestral: { preco_total: car[`${type}_trimestral`] || 0 },
                semestral: { preco_total: car[`${type}_semestral`] || 0 }
            };
        } else if (type === 'motorista') {
            pricing = {
                semanal: [ // Old motorista weekly structure might be different, keeping compatibility or updating
                    { id: '1250km', plano_km: 1250, preco_total: car[`${type}_semanal_1250km`] || 0 },
                    { id: '1500km', plano_km: 1500, preco_total: car[`${type}_semanal_1500km`] || 0 }
                ],
                trimestral: [
                    { id: '2500', plano_km: 2500, preco_total: car[`${type}_trimestral_2500`] || 0 },
                    { id: '5000', plano_km: 5000, preco_total: car[`${type}_trimestral_5000`] || 0 },
                    { id: '6000', plano_km: 6000, preco_total: car[`${type}_trimestral_6000`] || 0 }
                ],
                semestral: [
                    { id: '2500', plano_km: 2500, preco_total: car[`${type}_semestral_2500`] || 0 },
                    { id: '5000', plano_km: 5000, preco_total: car[`${type}_semestral_5000`] || 0 },
                    { id: '6000', plano_km: 6000, preco_total: car[`${type}_semestral_6000`] || 0 }
                ],
                anual: [
                    { id: '2500', plano_km: 2500, preco_total: car[`${type}_anual_2500`] || 0 },
                    { id: '5000', plano_km: 5000, preco_total: car[`${type}_anual_5000`] || 0 },
                    { id: '6000', plano_km: 6000, preco_total: car[`${type}_anual_6000`] || 0 }
                ],
                franquia: [
                    { id: '2500km', plano_km: 2500, preco_total: car[`${type}_franquia_2500km`] || 0 },
                    { id: '5000km', plano_km: 5000, preco_total: car[`${type}_franquia_5000km`] || 0 },
                    { id: '6000km', plano_km: 6000, preco_total: car[`${type}_franquia_6000km`] || 0 }
                ]
            };
        } else {
            // Corporativo defaults
            pricing = {
                diario: [
                    { id: '60km', uso_km: 60, preco_diaria: car[`${type}_diario_60km`] || 0, label: '60 KM' },
                    { id: '100km', uso_km: 100, preco_diaria: car[`${type}_diario_100km`] || 0, label: '100 KM' },
                    { id: '120km', uso_km: 120, preco_diaria: car[`${type}_diario_120km`] || 0, label: '120 KM' }
                ],
                franquia: [
                    { id: '1000km', plano_km: 1000, preco_total: car[`${type}_franquia_1000km`] || 0 },
                    { id: '2500km', plano_km: 2500, preco_total: car[`${type}_franquia_2500km`] || 0 },
                    { id: '5000km', plano_km: 5000, preco_total: car[`${type}_franquia_5000km`] || 0 }
                ],
                trimestral: { preco_total: car[`${type}_trimestral`] || 0 },
                semestral: { preco_total: car[`${type}_semestral`] || 0 }
            };
        }

        return pricing;
    };

    return {
        particular: buildSection('particular'),
        motorista: buildSection('motorista'),
        corporativo: buildSection('corporativo')
    };
};

/**
 * Fetch complete pricing structure for a car from cars table
 */
export const getCarPricing = async (carId) => {
    log('getCarPricing', `Fetching columns for carId: ${carId}`);
    try {
        const { data, error } = await supabase
            .from('cars')
            .select('*')
            .eq('id', carId)
            .single();

        if (error) {
            logError('getCarPricing', 'DB Fetch Error', error);
            return { success: false, error: error.message };
        }

        const structuredData = structureCarPricing(data);
        
        log('getCarPricing', `Success.`, structuredData);
        return { success: true, data: structuredData };
    } catch (error) {
        logError('getCarPricing', 'Exception', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update a specific pricing column in the cars table
 */
export const updateCarPricing = async (carId, tipo_locacao, tipo_plano, data) => {
    // data should contain { price: X, km: Y } or similar
    const price = parseFloat(data.price || data.preco_diaria || data.preco_total || 0);
    const km = data.km || data.uso_km || data.plano_km || 0;

    const columnName = getColumnName(tipo_locacao, tipo_plano, km);

    log('updateCarPricing', `Update Request`, { carId, tipo_locacao, tipo_plano, data, columnName, price });

    if (!columnName) {
        const msg = `Could not determine column name for ${tipo_locacao} / ${tipo_plano} / ${km}`;
        logError('updateCarPricing', 'Invalid Column', msg);
        return { success: false, error: msg };
    }

    try {
        const updates = { [columnName]: price };

        const { data: updatedCar, error } = await supabase
            .from('cars')
            .update(updates)
            .eq('id', carId)
            .select()
            .single();

        if (error) {
            logError('updateCarPricing', 'DB Error', error);
            return { success: false, error: error.message };
        }

        log('updateCarPricing', 'Success', { coluna_atualizada: columnName, novo_valor: price });
        return { success: true, data: updatedCar };
    } catch (error) {
        logError('updateCarPricing', 'Exception', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch all cars with comprehensive pricing from cars table
 */
export const getAllCarsPricing = async () => {
    log('getAllCarsPricing', 'Fetching all cars with columns...');
    try {
        const { data: cars, error } = await supabase
            .from('cars')
            .select('*')
            .order('marca');

        if (error) {
            logError('getAllCarsPricing', 'DB Error', error);
            return { success: false, error: error.message };
        }

        const merged = cars.map(car => ({
            ...car,
            pricing: structureCarPricing(car)
        }));

        log('getAllCarsPricing', `Success. Processed ${merged.length} cars.`);
        return { success: true, data: merged };

    } catch (error) {
        logError('getAllCarsPricing', 'Exception', error);
        return { success: false, error: error.message };
    }
};

export const deleteCarPricing = async (carId, tipo_locacao, tipo_plano, km) => {
    log('deleteCarPricing', `Setting to 0`, { carId, tipo_locacao, tipo_plano, km });
    return updateCarPricing(carId, tipo_locacao, tipo_plano, { price: 0, km });
};

export const createCarPricing = async (carId, tipo_locacao, tipo_plano, data) => {
    log('createCarPricing', `Delegating to update`, { carId, tipo_locacao, tipo_plano, data });
    return updateCarPricing(carId, tipo_locacao, tipo_plano, data);
};