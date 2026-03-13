import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DateRangeSelector from './DateRangeSelector';
import FranquiaSelector from './FranquiaSelector';
import ResumoPrecoSimulacao from './ResumoPrecoSimulacao';
import { calcularDataDevolucao, calcularDuracao } from '@/services/reservaService';
import { calcularPrecoReserva } from '@/services/calculoPrecoService';
import { useReserva } from '@/context/ReservaContext';
import { useToast } from '@/components/ui/use-toast';

const ReservaForm = ({ car }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { setDadosReserva, setTipoReserva, dadosReserva } = useReserva();
    
    // --- State Management ---
    // If we have pre-filled data in context (from Frota page), use it.
    const [tipoLocacao, setTipoLocacao] = useState(dadosReserva?.tipo_locacao || 'particular');
    const [tipoPlano, setTipoPlano] = useState(dadosReserva?.plano || 'diario');
    const [usoKm, setUsoKm] = useState(dadosReserva?.franquia_km || 60); 

    const [dataRetirada, setDataRetirada] = useState('');
    const [dataDevolucao, setDataDevolucao] = useState('');

    // Price & Summary State
    const [preco, setPreco] = useState(0);      
    const [precoTotal, setPrecoTotal] = useState(0);
    const [precoSemanal, setPrecoSemanal] = useState(0);
    const [precoMensal, setPrecoMensal] = useState(0);
    const [duracaoDias, setDuracaoDias] = useState(0);
    const [calculating, setCalculating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // --- Validation and Defaults ---
    useEffect(() => {
        if (!car) {
            toast({ title: "Erro", description: "Veículo não encontrado.", variant: "destructive" });
            navigate('/frota');
            return;
        }

        // If context has data, respect it. Otherwise check availability.
        if (dadosReserva?.tipo_locacao) {
            setTipoLocacao(dadosReserva.tipo_locacao);
            if (dadosReserva.plano) setTipoPlano(dadosReserva.plano);
            if (dadosReserva.franquia_km) setUsoKm(parseInt(dadosReserva.franquia_km));
        } else {
            // Default fallbacks if no context
            if (car.disponivel_motorista && !car.disponivel_particular) {
                setTipoLocacao('motorista');
                setTipoPlano('trimestral'); 
                setUsoKm(2500); 
            } else if (car.disponivel_particular) {
                setTipoLocacao('particular');
                setTipoPlano('diario'); 
                setUsoKm(60); 
            }
        }
    }, [car, navigate, toast, dadosReserva]);

    // --- Price Calculation Logic ---
    const calcularPreco = async (vals) => {
        const { tLocacao, tPlano, tUsoKm, dRetirada, dDevolucao } = vals;

        if (!tLocacao || !tPlano || !dRetirada || !dDevolucao) return;
        
        setCalculating(true);
        setErrorMsg('');

        try {
            const dias = calcularDuracao(dRetirada, dDevolucao, tPlano);
            const res = await calcularPrecoReserva(car.id, tLocacao, tPlano, tUsoKm, dRetirada, dDevolucao);
            
            if (res.erro) {
                setErrorMsg(res.erro);
                setPreco(0);
                setPrecoTotal(0);
                setPrecoSemanal(0);
                setPrecoMensal(0);
                setDuracaoDias(dias);
            } else {
                setPreco(res.diario || res.valorBase || 0);
                setPrecoTotal(res.total);
                setPrecoSemanal(res.semanal || 0);
                setPrecoMensal(res.mensal || 0);
                setDuracaoDias(res.dias || dias);
            }

        } catch (error) {
            console.error(error);
            setErrorMsg("Erro ao calcular valores.");
        } finally {
            setCalculating(false);
        }
    };

    // --- Event Handlers ---

    const handleTipoLocacaoChange = (newType) => {
        setTipoLocacao(newType);
        // Reset plan to default for type
        setPreco(0);
        setPrecoTotal(0);
        setErrorMsg('');
        
        if (newType === 'motorista') {
             setTipoPlano('trimestral');
             setUsoKm(2500);
        } else if (newType === 'particular') {
            setTipoPlano('diario');
            setUsoKm(60);
        }
    };

    const handleTipoPlanoChange = (newPlan) => {
        setTipoPlano(newPlan);
        setPreco(0);
        setPrecoTotal(0);
        setErrorMsg('');
        
        let newDevolucao = '';
        let newUsoKm = '';

        if (newPlan !== 'diario' && dataRetirada) {
            newDevolucao = calcularDataDevolucao(dataRetirada, newPlan);
            setDataDevolucao(newDevolucao);
        } else if (newPlan === 'diario') {
             newUsoKm = 60; 
             // Keep existing end date if manually set, otherwise maybe clear? 
             // Usually manual set for daily
        } else if (newPlan === 'franquia') {
            newUsoKm = tipoLocacao === 'particular' ? 1500 : 2500;
        }

        // Set default KM for new plans if not set or switching plan types
        if (!newUsoKm) {
             if (tipoLocacao === 'particular' && newPlan === 'semanal') newUsoKm = 1500;
             else if (tipoLocacao === 'motorista' && ['trimestral', 'semestral', 'anual'].includes(newPlan)) newUsoKm = 2500;
        }

        if (newUsoKm !== '') setUsoKm(parseInt(newUsoKm));

        // If dates are valid, recalc immediately
        if (dataRetirada && (newDevolucao || dataDevolucao)) {
             calcularPreco({
                 tLocacao: tipoLocacao,
                 tPlano: newPlan,
                 tUsoKm: newUsoKm || usoKm,
                 dRetirada: dataRetirada,
                 dDevolucao: newDevolucao || dataDevolucao
             });
        }
    };

    const handleDataRetiradaChange = (e) => {
        const newVal = e.target.value;
        setDataRetirada(newVal);

        let newDevolucao = dataDevolucao;

        // Auto-calc end date if not daily
        if (tipoPlano !== 'diario') {
            newDevolucao = calcularDataDevolucao(newVal, tipoPlano);
            setDataDevolucao(newDevolucao);
        } else {
            // For daily, if start is after end, reset end
            if (dataDevolucao && new Date(newVal) > new Date(dataDevolucao)) {
                newDevolucao = '';
                setDataDevolucao('');
                setPreco(0);
                setPrecoTotal(0);
            }
        }

        if (newDevolucao) {
            calcularPreco({
                tLocacao: tipoLocacao,
                tPlano: tipoPlano,
                tUsoKm: usoKm,
                dRetirada: newVal,
                dDevolucao: newDevolucao
            });
        }
    };

    const handleDataDevolucaoChange = (e) => {
        const newVal = e.target.value;
        setDataDevolucao(newVal);

        calcularPreco({
            tLocacao: tipoLocacao,
            tPlano: tipoPlano,
            tUsoKm: usoKm,
            dRetirada: dataRetirada,
            dDevolucao: newVal
        });
    };

    const handleUsoKmChange = (val) => {
        setUsoKm(val);
        if (dataRetirada && dataDevolucao) {
            calcularPreco({
                tLocacao: tipoLocacao,
                tPlano: tipoPlano,
                tUsoKm: val,
                dRetirada: dataRetirada,
                dDevolucao: dataDevolucao
            });
        }
    };

    const handleContinuar = () => {
        const errors = [];
        if (!dataRetirada) errors.push("Data de retirada é obrigatória");
        if (!dataDevolucao) errors.push("Data de devolução é obrigatória");
        
        if (precoTotal === null || precoTotal === undefined || precoTotal <= 0) {
            errors.push("Erro no cálculo do preço. Verifique disponibilidade.");
        }
        
        if (!tipoPlano) errors.push("Plano não selecionado");

        if (errors.length > 0) {
            toast({ 
                title: "Atenção", 
                description: errors.join('. '), 
                variant: "destructive" 
            });
            return;
        }

        const reservaData = {
            carroId: car.id,
            tipo_locacao: tipoLocacao,
            plano: tipoPlano,
            franquia_km: usoKm,
            dataRetirada: dataRetirada,
            dataDevolucao: dataDevolucao,
            valorTotal: precoTotal,
            valorDiario: preco,
            km_contratado: parseInt(usoKm),
            duracaoDias,
            dataInicio: dataRetirada,
            dataFim: dataDevolucao,
            carro: car 
        };

        setTipoReserva(tipoLocacao);
        setDadosReserva(reservaData);
        
        navigate(`/documentos/${car.id}`, { 
            state: { 
                reserva: reservaData,
                carro: car 
            } 
        });
    };

    if (!car) return null;

    const showKmSelector = () => {
        if (tipoLocacao === 'particular' && tipoPlano === 'semanal') return true;
        if (tipoLocacao === 'motorista' && ['trimestral', 'semestral', 'anual'].includes(tipoPlano)) return true;
        if (tipoPlano === 'diario' || tipoPlano === 'franquia') return true;
        if (tipoPlano === 'semanal' && tipoLocacao === 'motorista') return true; 
        return false;
    };

    return (
        <div className="space-y-8">
            {/* Step 1: Rental Type & Plan */}
            <div>
                <h3 className="text-lg font-bold text-[#0E3A2F] mb-4">1. Escolha o Plano</h3>
                
                <div className="flex gap-4 mb-6">
                    {car.disponivel_particular && (
                        <button 
                            onClick={() => handleTipoLocacaoChange('particular')}
                            className={`flex-1 p-3 rounded-lg border-2 font-bold transition-all ${tipoLocacao === 'particular' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-500'}`}
                        >
                            Particular
                        </button>
                    )}
                    {car.disponivel_motorista && (
                        <button 
                            onClick={() => handleTipoLocacaoChange('motorista')}
                            className={`flex-1 p-3 rounded-lg border-2 font-bold transition-all ${tipoLocacao === 'motorista' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 text-gray-500'}`}
                        >
                            Motorista App
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tipoLocacao === 'particular' ? (
                        <>
                            <PlanOption id="diario" label="Diário" current={tipoPlano} set={(id) => handleTipoPlanoChange(id)}/>
                            <PlanOption id="semanal" label="Semanal (7d)" current={tipoPlano} set={(id) => handleTipoPlanoChange(id)}/>
                            <PlanOption id="franquia" label="Mensal (KM)" current={tipoPlano} set={(id) => handleTipoPlanoChange(id)}/>
                            <PlanOption id="trimestral" label="Trimestral (90d)" current={tipoPlano} set={(id) => handleTipoPlanoChange(id)}/>
                            <PlanOption id="semestral" label="Semestral (180d)" current={tipoPlano} set={(id) => handleTipoPlanoChange(id)}/>
                            <PlanOption id="anual" label="Anual (365d)" current={tipoPlano} set={(id) => handleTipoPlanoChange(id)}/>
                        </>
                    ) : (
                        <>
                            <PlanOption id="semanal" label="Semanal (7d)" current={tipoPlano} set={(id) => handleTipoPlanoChange(id)}/>
                            <PlanOption id="trimestral" label="Trimestral (90d)" current={tipoPlano} set={(id) => handleTipoPlanoChange(id)}/>
                            <PlanOption id="semestral" label="Semestral (180d)" current={tipoPlano} set={(id) => handleTipoPlanoChange(id)}/>
                            <PlanOption id="anual" label="Anual (365d)" current={tipoPlano} set={(id) => handleTipoPlanoChange(id)}/>
                        </>
                    )}
                </div>
            </div>

            {/* Step 2: Date Selection */}
            {tipoPlano && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="text-lg font-bold text-[#0E3A2F] mb-4">2. Período</h3>
                    <DateRangeSelector 
                        startDate={dataRetirada} 
                        endDate={dataDevolucao} 
                        onStartDateChange={handleDataRetiradaChange}
                        onEndDateChange={handleDataDevolucaoChange}
                        days={duracaoDias}
                        plan={tipoPlano}
                    />
                </div>
            )}

            {/* Step 3: Franchise Selection */}
            {showKmSelector() && tipoPlano && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                     <FranquiaSelector 
                        car={car}
                        carId={car.id}
                        rentalType={tipoLocacao} 
                        plan={tipoPlano} 
                        selectedFranchise={usoKm} 
                        onChange={handleUsoKmChange}
                    />
                </div>
            )}

            {errorMsg && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold text-center border border-red-200 animate-in fade-in">
                    {errorMsg}
                </div>
            )}

            {precoTotal > 0 && !errorMsg && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                     <ResumoPrecoSimulacao 
                        car={car}
                        tipoLocacao={tipoLocacao}
                        tipoPlano={tipoPlano}
                        usoKm={usoKm ? parseInt(usoKm) : (tipoPlano === 'diario' ? 0 : null)}
                        dataRetirada={dataRetirada}
                        dataDevolucao={dataDevolucao}
                        preco={preco}
                        precoTotal={precoTotal}
                        precoSemanal={precoSemanal}
                        precoMensal={precoMensal}
                        duracaoDias={duracaoDias}
                        onContinuar={handleContinuar}
                    />
                </div>
            )}
        </div>
    );
};

const PlanOption = ({ id, label, current, set }) => (
    <button 
        onClick={() => set(id)}
        className={`p-3 rounded-lg border font-medium text-sm transition-all ${current === id ? 'bg-[#0E3A2F] text-white border-[#0E3A2F] shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}
    >
        {label}
    </button>
);

export default ReservaForm;