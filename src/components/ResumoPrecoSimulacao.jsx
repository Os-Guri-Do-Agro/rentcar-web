import React from 'react';
import { ArrowRight, Calendar, Check, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

const ResumoPrecoSimulacao = ({ 
    car, 
    tipoLocacao, 
    tipoPlano, 
    usoKm, 
    dataRetirada, 
    dataDevolucao, 
    preco, 
    precoTotal, 
    precoSemanal,
    precoMensal,
    duracaoDias,
    onContinuar 
}) => {

    if (!car) return null;

    const getRentalTypeLabel = (type) => {
        switch(type) {
            case 'particular': return 'Particular';
            case 'motorista': return 'Motorista App';
            case 'corporativo': return 'Corporativo';
            default: return type;
        }
    };

    const getRentalTypeColor = (type) => {
        switch(type) {
            case 'particular': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'motorista': return 'bg-green-100 text-green-700 border-green-200';
            case 'corporativo': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const formatMoney = (val) => {
        return val ? `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00';
    };

    const getPlanLabel = (plan) => {
        if (plan === 'semanal') return 'Semanal (7 dias)';
        if (plan === 'trimestral') return 'Trimestral (90 dias)';
        if (plan === 'semestral') return 'Semestral (180 dias)';
        if (plan === 'anual') return 'Anual (365 dias)';
        if (plan === 'franquia') return 'Pacote Mensal';
        return plan;
    };

    // Determine what price to highlight
    const showWeeklyHighlight = precoSemanal > 0;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            {/* Header / Car Info */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex gap-4 items-center">
                <div className="h-16 w-24 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                    <img 
                        src={car.foto_principal || car.imagem_url || "/placeholder-car.png"} 
                        alt={car.nome} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{car.marca} {car.nome}</h4>
                    <div className="flex gap-2 mt-1">
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded border uppercase", getRentalTypeColor(tipoLocacao))}>
                            {getRentalTypeLabel(tipoLocacao)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Simulation Details */}
            <div className="p-5 space-y-4">
                
                {/* Plan & Usage */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1">
                            <Check size={12} className="text-[#00D166]"/> Plano Escolhido
                        </p>
                        <p className="font-semibold text-gray-700 capitalize">{getPlanLabel(tipoPlano)}</p>
                    </div>
                    {usoKm !== null && (
                        <div className="space-y-1 text-right">
                            <p className="text-xs text-gray-500 uppercase font-bold flex items-center justify-end gap-1">
                                <Gauge size={12} className="text-[#00D166]"/> Franquia
                            </p>
                            <p className="font-semibold text-gray-700">
                                {usoKm === 0 ? 'Livre' : `${usoKm} km`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Highlighted Price Section */}
                {showWeeklyHighlight ? (
                    <div className="text-center py-2 bg-blue-50/50 rounded-lg border border-blue-100">
                        <p className="text-2xl font-bold text-blue-600">
                            {formatMoney(precoSemanal)}<span className="text-sm font-normal text-blue-400">/semana</span>
                        </p>
                        {precoMensal > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                ({formatMoney(precoMensal)}/mês)
                            </p>
                        )}
                    </div>
                ) : (
                     <div className="text-center py-2 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xl font-bold text-gray-700">
                             {tipoPlano === 'diario' ? `${formatMoney(preco)}/dia` : formatMoney(precoTotal)}
                        </p>
                     </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Retirada</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Calendar size={14} className="text-[#00D166]"/>
                            {formatDate(dataRetirada)}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">Devolução</p>
                        <div className="flex items-center justify-end gap-2 text-sm font-bold text-gray-700">
                            {formatDate(dataDevolucao)}
                            <Calendar size={14} className="text-[#00D166]"/>
                        </div>
                    </div>
                </div>

                {/* Duration */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {duracaoDias} {duracaoDias === 1 ? 'dia' : 'dias'}
                    </span>
                    <span className="text-gray-400 text-xs">
                        Valor total do período
                    </span>
                </div>

                {/* Total Price Footer */}
                <div className="bg-[#0E3A2F] -mx-5 -mb-5 p-5 text-white mt-4">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-xs text-gray-300 uppercase tracking-wider mb-1">Total Estimado</p>
                            <p className="text-3xl font-bold text-[#00D166] leading-none">
                                {formatMoney(precoTotal)}
                            </p>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                            <p>Taxas inclusas</p>
                        </div>
                    </div>

                    <button 
                        onClick={onContinuar}
                        className="w-full bg-[#00D166] text-[#0E3A2F] py-3 rounded-lg font-bold hover:bg-[#00F178] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 active:scale-[0.98]"
                    >
                        Continuar <ArrowRight size={20}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumoPrecoSimulacao;