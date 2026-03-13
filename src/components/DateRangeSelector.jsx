import React, { useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { addDays } from 'date-fns';

const DateRangeSelector = ({ startDate, endDate, onStartDateChange, onEndDateChange, days, plan }) => {
    
    // --- Disable Logic ---
    // Only 'diario' plan allows manual end date selection
    const isDevolucaoDisabled = () => {
        return plan !== 'diario';
    };

    const isDisabled = isDevolucaoDisabled();
    
    // --- Automatic End Date Calculation ---
    useEffect(() => {
        if (!startDate || plan === 'diario') return;
        
        let daysToAdd = 0;
        switch(plan) {
            case 'semanal': daysToAdd = 7; break;
            case 'franquia': daysToAdd = 30; break;
            case 'trimestral': daysToAdd = 90; break;
            case 'semestral': daysToAdd = 180; break;
            case 'anual': daysToAdd = 365; break;
            default: daysToAdd = 0;
        }

        if (daysToAdd > 0) {
            const date = new Date(startDate);
            // Ensure date is valid before adding
            if (!isNaN(date.getTime())) {
                const newEndDate = addDays(date, daysToAdd).toISOString().split('T')[0];
                console.log(`[DateRangeSelector] Calculando data final: ${newEndDate} (${plan} + ${daysToAdd} dias)`);
                
                // Only trigger update if it's different to prevent loops
                if (newEndDate !== endDate) {
                    const syntheticEvent = { target: { value: newEndDate } };
                    if(onEndDateChange) onEndDateChange(syntheticEvent);
                }
            }
        }
    }, [startDate, plan, endDate, onEndDateChange]); // Added onEndDateChange to dep array safely

    const handleStartChange = (e) => {
        console.log('[DateRangeSelector] Start Date Changed:', e.target.value);
        if (onStartDateChange) onStartDateChange(e);
    };

    const handleEndChange = (e) => {
        console.log('[DateRangeSelector] End Date Changed:', e.target.value);
        if (onEndDateChange) onEndDateChange(e);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Start Date */}
            <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Retirada</label>
                <div className="relative">
                    <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={startDate || ''} 
                        onChange={handleStartChange} 
                        className="w-full p-4 border rounded-xl focus:ring-[#00D166] outline-none bg-gray-50 focus:bg-white transition-colors text-lg font-medium" 
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
            </div>

            {/* End Date */}
            <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    {isDisabled ? 'Devolução (Automática)' : 'Data de Devolução'}
                </label>
                <div className="relative">
                    <input 
                        type="date" 
                        min={startDate || new Date().toISOString().split('T')[0]}
                        value={endDate || ''} 
                        onChange={handleEndChange} 
                        disabled={isDisabled}
                        placeholder={isDisabled ? '' : "Selecione a data de devolução"}
                        className={`w-full p-4 border rounded-xl outline-none transition-colors text-lg font-medium ${
                            isDisabled 
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' 
                                : 'bg-gray-50 focus:bg-white focus:ring-[#00D166] border-gray-300'
                        }`} 
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
                {isDisabled && (
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                        * Data calculada automaticamente para o plano selecionado.
                    </p>
                )}
            </div>

            {/* Duration Display */}
            {days > 0 && (
                <div className="col-span-1 md:col-span-2 text-center animate-in fade-in slide-in-from-top-1">
                    <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold border border-blue-100 shadow-sm inline-flex items-center gap-2">
                        <Calendar size={14}/>
                        {days} {days === 1 ? 'dia' : 'dias'} de locação
                    </span>
                </div>
            )}
        </div>
    );
};

export default DateRangeSelector;