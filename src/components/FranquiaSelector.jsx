import React from 'react';
import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

const FranquiaSelector = ({ car, carId, rentalType, plan, selectedFranchise, onChange }) => {
    
    // Determine available options based on Rental Type & Plan
    const getOptions = () => {
        if (plan === 'diario' && rentalType === 'particular') {
            return [
                { value: '60', label: '60 KM', desc: 'Curta distância' },
                { value: '100', label: '100 KM', desc: 'Média distância' },
                { value: '120', label: '120 KM', desc: 'Longa distância' }
            ];
        } 
        
        if (plan === 'semanal') {
            if (rentalType === 'particular') {
                return [
                    { value: '1500', label: '1500 KM', desc: 'Econômico' },
                    { value: '2000', label: '2000 KM', desc: 'Padrão' },
                    { value: '3000', label: '3000 KM', desc: 'Extra' }
                ];
            } else if (rentalType === 'motorista') {
                // Existing/Old motorista weekly or compatible
                return [
                    { value: '1250', label: '1250 KM', desc: 'Padrão' },
                    { value: '1500', label: '1500 KM', desc: 'Extra' }
                ];
            }
        }

        if (['trimestral', 'semestral', 'anual'].includes(plan) && rentalType === 'motorista') {
             return [
                { value: '2500', label: '2500 KM', desc: 'Básico' },
                { value: '5000', label: '5000 KM', desc: 'Profissional' },
                { value: '6000', label: '6000 KM', desc: 'Expert' }
            ];
        }

        if (plan === 'franquia' || plan === 'mensal') {
            if (rentalType === 'particular') {
                return [
                    { value: '1500', label: '1500 KM', desc: 'Econômico' },
                    { value: '2000', label: '2000 KM', desc: 'Padrão' },
                    { value: '3000', label: '3000 KM', desc: 'Intensivo' }
                ];
            }
            if (rentalType === 'motorista') {
                return [
                    { value: '2500', label: '2500 KM', desc: 'Básico' },
                    { value: '5000', label: '5000 KM', desc: 'Profissional' },
                    { value: '6000', label: '6000 KM', desc: 'Expert' }
                ];
            }
            // Corporativo fallback
            return [
                 { value: '1000', label: '1000 KM', desc: 'Econômico' },
                 { value: '2500', label: '2500 KM', desc: 'Padrão' },
                 { value: '5000', label: '5000 KM', desc: 'Livre' }
            ];
        }
        
        return [];
    };

    const options = getOptions();

    if (options.length === 0) return null;

    return (
        <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                <Gauge size={16} className="text-[#00D166]"/> 
                Selecione a Franquia de KM
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                            selectedFranchise === option.value
                                ? "border-[#00D166] bg-green-50 text-[#0E3A2F]"
                                : "border-gray-100 bg-white hover:border-gray-200 text-gray-600"
                        )}
                    >
                        <span className="font-bold text-lg">{option.label}</span>
                        <span className="text-xs opacity-70">{option.desc}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FranquiaSelector;