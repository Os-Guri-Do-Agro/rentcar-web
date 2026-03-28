import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Save, Loader2, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import carService from '@/services/cars/carService';

const PLANS = [
    {
        id: 'particular_diario',
        label: 'Particular Diário',
        franchises: ['livre', '100', '60', '150'],
        suffix: 'dia'
    },
    {
        id: 'particular_trimestral',
        label: 'Particular Trimestral',
        franchises: ['1500', '2500', '3500'],
        suffix: 'mês'
    },
    {
        id: 'particular_semestral',
        label: 'Particular Semestral',
        franchises: ['1500', '2500', '3500'],
        suffix: 'mês'
    },
    {
        id: 'motorista_semanal',
        label: 'Motorista Semanal',
        franchises: ['1250', '1500'],
        suffix: 'semana'
    }
];

const AdminEditarPrecosCarro = () => {
    const { carroId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [car, setCar] = useState(null);
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [kmAdicional, setKmAdicional] = useState(0.50);

    useEffect(() => {
        fetchData();
    }, [carroId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await carService.getCarById(carroId);
            setCar(res?.data ?? res);
        } catch (error) {
            toast({ title: "Erro ao carregar", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (planId, franchise, value) => {
        const newPrices = [...prices];
        const index = newPrices.findIndex(p => p.tipo_plano === planId && p.tipo_franquia === franchise);
        
        if (index >= 0) {
            newPrices[index].valor = value;
        } else {
            newPrices.push({
                carro_id: carroId,
                tipo_plano: planId,
                tipo_franquia: franchise,
                valor: value
            });
        }
        setPrices(newPrices);
    };

    const getPriceValue = (planId, franchise) => {
        const p = prices.find(x => x.tipo_plano === planId && x.tipo_franquia === franchise);
        return p ? p.valor : '';
    };

    const handleSave = async () => {
        toast({ title: "Não disponível", description: "Salvar preços requer endpoint de API.", variant: "destructive" });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00D166]" size={40}/></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <Helmet title={`Preços - ${car?.nome || 'Admin'}`} />
            
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/carros')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-[#0E3A2F]">Editar Preços</h1>
                            <p className="text-gray-500">{car?.nome} - {car?.placa}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-[#0E3A2F] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#165945] transition-colors shadow-lg"
                    >
                        {saving && <Loader2 className="animate-spin" size={20}/>} <Save size={20}/> Salvar Alterações
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><DollarSign size={20} className="text-[#00D166]"/> Configurações Gerais</h3>
                    <div className="max-w-xs">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Valor KM Adicional (R$)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            value={kmAdicional} 
                            onChange={e => setKmAdicional(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PLANS.map(plan => (
                        <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b border-gray-100">
                                <h3 className="font-bold text-[#0E3A2F]">{plan.label}</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                {plan.franchises.map(franchise => (
                                    <div key={franchise} className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-600 w-1/2">
                                            {franchise === 'livre' ? 'KM Livre' : `${franchise} km`}
                                        </label>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-12 p-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none text-right font-bold text-gray-800"
                                                value={getPriceValue(plan.id, franchise)}
                                                onChange={e => handlePriceChange(plan.id, franchise, e.target.value)}
                                            />
                                            <span className="absolute right-3 top-2 text-gray-400 text-xs">/{plan.suffix}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminEditarPrecosCarro;