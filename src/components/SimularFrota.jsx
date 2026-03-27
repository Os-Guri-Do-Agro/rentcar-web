import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Car } from 'lucide-react';
import { useReserva } from '@/context/ReservaContext';
import { calcularDataDevolucao } from '@/lib/dateUtils';
import { calcularPrecoReserva } from '@/services/calculoPrecoService';
import ResumoPrecoSimulacao from './ResumoPrecoSimulacao';
import { cn } from '@/lib/utils';

const SimularFrota = ({ car, carId }) => {
    const navigate = useNavigate();
    const { setDadosReserva, setTipoReserva, setDadosCarro } = useReserva();

    // --- State ---
    const [activeCar, setActiveCar] = useState(car || null);
    const [loadingCar, setLoadingCar] = useState(false);
    
    // Form State
    const [tipoLocacao, setTipoLocacao] = useState('particular');
    const [tipoPlano, setTipoPlano] = useState('');
    const [usoKm, setUsoKm] = useState('');
    const [dataRetirada, setDataRetirada] = useState('');
    const [dataDevolucao, setDataDevolucao] = useState('');
    
    // Result State
    const [preco, setPreco] = useState(0); 
    const [precoTotal, setPrecoTotal] = useState(0);
    const [precoSemanal, setPrecoSemanal] = useState(0);
    const [precoMensal, setPrecoMensal] = useState(0);
    const [duracaoDias, setDuracaoDias] = useState(0);
    const [calculating, setCalculating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // --- Load Car ---
    useEffect(() => {
        if (!car && carId) {
            setLoadingCar(true);
            const fetchCar = async () => {
                const { data } = await supabase.from('cars').select('*').eq('id', carId).single();
                if (data) setActiveCar(data);
                setLoadingCar(false);
            };
            fetchCar();
        } else if (car) {
            setActiveCar(car);
        }
    }, [car, carId]);

    // --- Handlers ---

    const handleTipoLocacaoChange = (type) => {
        setTipoLocacao(type);
        setTipoPlano('');
        setUsoKm('');
        setPreco(0);
        setPrecoTotal(0);
        setErrorMsg('');
    };

    const handleTipoPlanoChange = (e) => {
        const newPlan = e.target.value;
        setTipoPlano(newPlan);
        
        setPreco(0);
        setPrecoTotal(0);
        setErrorMsg('');
        
        let newKm = '';

        // Default KM Selection logic
        if (newPlan === 'diario') newKm = '60';
        else if (newPlan === 'semanal' && tipoLocacao === 'particular') newKm = '1500';
        else if (['trimestral', 'semestral', 'anual'].includes(newPlan) && tipoLocacao === 'motorista') newKm = '2500';
        else if (newPlan === 'franquia') newKm = tipoLocacao === 'particular' ? '1500' : '2500';

        setUsoKm(newKm);

        if (['trimestral', 'semestral', 'anual', 'semanal'].includes(newPlan) && dataRetirada) {
            const autoDate = calcularDataDevolucao(dataRetirada, newPlan);
            setDataDevolucao(autoDate);
        }
    };

    const handleUsoKmChange = (e) => {
        setUsoKm(e.target.value);
    };

    const handleDataRetiradaChange = (e) => {
        const val = e.target.value;
        setDataRetirada(val);
        
        if (['trimestral', 'semestral', 'anual', 'semanal'].includes(tipoPlano)) {
            const autoDate = calcularDataDevolucao(val, tipoPlano);
            setDataDevolucao(autoDate);
        } else {
            if (dataDevolucao && new Date(val) >= new Date(dataDevolucao)) {
                setDataDevolucao(''); 
            }
        }
    };

    const handleDataDevolucaoChange = (e) => {
        setDataDevolucao(e.target.value);
    };

    // --- Price Calculation Effect ---
    useEffect(() => {
        const calcularPreco = async () => {
            if (!activeCar || !tipoLocacao || !tipoPlano || !dataRetirada || !dataDevolucao || !usoKm) return;

            setCalculating(true);
            setErrorMsg('');

            const res = await calcularPrecoReserva(
                activeCar.id, 
                tipoLocacao, 
                tipoPlano, 
                usoKm, 
                dataRetirada, 
                dataDevolucao
            );

            if (res.erro) {
                setErrorMsg(res.erro);
                setPreco(0); setPrecoTotal(0);
            } else {
                setPreco(res.diario || res.valorBase || 0);
                setPrecoTotal(res.total);
                setPrecoSemanal(res.semanal || 0);
                setPrecoMensal(res.mensal || 0);
                setDuracaoDias(res.dias);
            }
            setCalculating(false);
        };

        const timer = setTimeout(calcularPreco, 300);
        return () => clearTimeout(timer);
    }, [activeCar, tipoLocacao, tipoPlano, usoKm, dataRetirada, dataDevolucao]);

    const shouldRenderCard = () => {
        return activeCar && tipoLocacao && tipoPlano && usoKm && dataRetirada && dataDevolucao && precoTotal > 0 && !errorMsg;
    };

    const handleContinuar = () => {
        if (!shouldRenderCard()) return;
        setTipoReserva(tipoLocacao);
        setDadosCarro(activeCar);
        setDadosReserva({
            tipo_locacao: tipoLocacao,
            plano: tipoPlano,
            franquia_km: usoKm,
            franquia: usoKm,
            dataInicio: dataRetirada,
            dataFim: dataDevolucao,
            valorTotal: precoTotal,
            valorDiario: preco,
            km_contratado: parseInt(usoKm),
            duracaoDias
        });
        navigate('/dados-usuario');
    };

    if (loadingCar) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#0E3A2F]" size={32}/></div>;
    if (!activeCar) return null;

    const isDevolucaoDisabled = ['trimestral', 'semestral', 'anual', 'semanal'].includes(tipoPlano);

    // Dynamic Options Logic
    const kmOptions = () => {
        if (tipoLocacao === 'particular') {
            if (tipoPlano === 'diario') return [{v:60, l:'60km'}, {v:100, l:'100km'}, {v:120, l:'120km'}];
            if (tipoPlano === 'semanal') return [{v:1500, l:'1500km'}, {v:2000, l:'2000km'}, {v:3000, l:'3000km'}];
            if (tipoPlano === 'franquia') return [{v:1500, l:'1500km'}, {v:2000, l:'2000km'}, {v:3000, l:'3000km'}];
        } else {
            if (['trimestral', 'semestral', 'anual'].includes(tipoPlano)) return [{v:2500, l:'2500km'}, {v:5000, l:'5000km'}, {v:6000, l:'6000km'}];
            if (tipoPlano === 'franquia') return [{v:2500, l:'2500km'}, {v:5000, l:'5000km'}, {v:6000, l:'6000km'}];
             if (tipoPlano === 'semanal') return [{v:1250, l:'1250km'}, {v:1500, l:'1500km'}];
        }
        return [];
    };

    const availablePlans = tipoLocacao === 'particular' 
        ? [
            {v:'diario', l:'Diário'}, 
            {v:'semanal', l:'Semanal (7 dias)'},
            {v:'franquia', l:'Mensal'},
            {v:'trimestral', l:'Trimestral'},
            {v:'semestral', l:'Semestral'}
          ]
        : [
            {v:'semanal', l:'Semanal (7 dias)'},
            {v:'trimestral', l:'Trimestral'},
            {v:'semestral', l:'Semestral'},
            {v:'anual', l:'Anual'},
            {v:'franquia', l:'Mensal'}
        ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-[#0E3A2F] mb-4">Configure sua Locação</h3>
                    <div className="space-y-5">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Uso</label>
                            <div className="flex gap-2">
                                {['particular', 'motorista'].map((type) => (
                                    <button key={type} onClick={() => handleTipoLocacaoChange(type)}
                                        className={cn("flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-all capitalize",
                                            tipoLocacao === type ? "bg-[#0E3A2F] text-white border-[#0E3A2F]" : "bg-gray-50 text-gray-500 border-gray-200")}
                                    >
                                        {type === 'motorista' ? 'Motorista App' : type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Plan */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Plano</label>
                            <select value={tipoPlano} onChange={handleTipoPlanoChange} className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white">
                                <option value="" disabled>Selecione um plano...</option>
                                {availablePlans.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
                            </select>
                        </div>

                        {/* KM */}
                        {tipoPlano && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Franquia/Pacote</label>
                                <select value={usoKm} onChange={handleUsoKmChange} className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white">
                                     {kmOptions().map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                                </select>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Retirada</label>
                                <input type="date" min={new Date().toISOString().split('T')[0]} value={dataRetirada} onChange={handleDataRetiradaChange} className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white"/>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{isDevolucaoDisabled ? 'Devolução (Auto)' : 'Devolução'}</label>
                                <input type="date" min={dataRetirada} value={dataDevolucao} onChange={handleDataDevolucaoChange} disabled={isDevolucaoDisabled} className={cn("w-full h-12 px-3 border rounded-lg", isDevolucaoDisabled ? "bg-gray-100" : "bg-white")}/>
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                <AlertCircle size={16}/> {errorMsg}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-5">
                {shouldRenderCard() ? (
                    <ResumoPrecoSimulacao 
                        car={activeCar} tipoLocacao={tipoLocacao} tipoPlano={tipoPlano} usoKm={usoKm}
                        dataRetirada={dataRetirada} dataDevolucao={dataDevolucao} preco={preco}
                        precoTotal={precoTotal} precoSemanal={precoSemanal} precoMensal={precoMensal}
                        duracaoDias={duracaoDias} onContinuar={handleContinuar}
                    />
                ) : (
                    <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center p-8 text-gray-400 min-h-[300px]">
                        <Car size={48} className="mb-4 text-gray-300" />
                        <p className="font-medium">Preencha todos os dados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimularFrota;