import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2, DollarSign, Save, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { getPrecosAllCars, updatePreco } from '@/services/precosService';

const AdminPrecos = () => {
    const [cars, setCars] = useState([]);
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState('');
    const { toast } = useToast();

    // Definitions
    const plans = [
        { id: 'particular_diario', label: 'Particular Diário', franchises: ['livre', '100', '60', '150'] },
        { id: 'particular_trimestral', label: 'Part. Trimestral', franchises: ['1500', '2500', '3500'] },
        { id: 'particular_semestral', label: 'Part. Semestral', franchises: ['1500', '2500', '3500'] },
        { id: 'motorista_trimestral', label: 'Mot. Trimestral', franchises: ['2500', '5000', '6000'] },
        { id: 'motorista_semestral', label: 'Mot. Semestral', franchises: ['2500', '5000', '6000'] },
        { id: 'motorista_anual', label: 'Mot. Anual', franchises: ['2500', '5000', '6000'] },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        console.log("Carregando tabela de preços...");
        const { data: carsData } = await supabase.from('cars').select('id, nome, placa, imagem_url').order('nome');
        const pricesData = await getPrecosAllCars();
        
        setCars(carsData || []);
        setPrices(pricesData || []);
        setLoading(false);
    };

    const getPriceValue = (carId, planId, franchise) => {
        const p = prices.find(x => x.carro_id === carId && x.plano === planId && x.franquia_km === franchise);
        return p ? p.valor : '';
    };

    const handlePriceChange = (carId, planId, franchise, newVal) => {
        // Optimistic update in state
        const newPrices = [...prices];
        const idx = newPrices.findIndex(x => x.carro_id === carId && x.plano === planId && x.franquia_km === franchise);
        if (idx >= 0) {
            newPrices[idx].valor = newVal;
        } else {
            newPrices.push({ carro_id: carId, plano: planId, franquia_km: franchise, valor: newVal });
        }
        setPrices(newPrices);
    };

    const saveChanges = async () => {
        setSaving(true);
        console.log("Salvando todas as alterações de preços...");
        try {
            // In a real app, track dirty state. Here, simplistic approach: save all visible (or loop all)
            // To avoid spamming, let's just save what we have in 'prices' state
            // Better yet, just specific ones. For now, prompt user logic:
            // Let's iterate only current filtered view to save, or all.
            // Simplified: Save ALL distinct entries in 'prices' state array
            
            for (const p of prices) {
                if (p.valor !== '' && p.valor !== null) {
                    await updatePreco(p.carro_id, p.plano, p.franquia_km, p.valor);
                }
            }
            toast({ title: "Preços atualizados!", className: "bg-green-600 text-white" });
        } catch (error) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const filteredCars = cars.filter(c => c.nome.toLowerCase().includes(filter.toLowerCase()) || c.placa?.toLowerCase().includes(filter));

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Helmet title="Admin | Tabela de Preços" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#0E3A2F] flex items-center gap-2"><DollarSign /> Tabela de Preços</h1>
                <button 
                    onClick={saveChanges}
                    disabled={saving}
                    className="bg-[#0E3A2F] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#165945]"
                >
                    {saving && <Loader2 className="animate-spin" size={18}/>} <Save size={18}/> Salvar Tudo
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input 
                        placeholder="Filtrar carro..." 
                        value={filter} 
                        onChange={e => setFilter(e.target.value)}
                        className="w-full pl-10 p-2 border rounded-lg"
                    />
                </div>
            </div>

            {loading ? <div className="text-center p-10"><Loader2 className="animate-spin mx-auto"/></div> : (
                <div className="space-y-8">
                    {filteredCars.map(car => (
                        <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-100 p-4 border-b flex items-center gap-4">
                                <img src={car.imagem_url} alt="" className="w-16 h-10 object-cover rounded"/>
                                <div>
                                    <h3 className="font-bold text-lg">{car.nome}</h3>
                                    <p className="text-xs text-gray-500">{car.placa}</p>
                                </div>
                            </div>
                            <div className="p-4 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-2 w-40">Plano</th>
                                            {['livre', '60', '100', '150', '1500', '2500', '3500', '5000', '6000'].map(km => (
                                                <th key={km} className="text-center p-2 min-w-[80px] bg-gray-50 text-gray-600 border-x">{km} km</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {plans.map(plan => (
                                            <tr key={plan.id} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="p-2 font-bold text-gray-700">{plan.label}</td>
                                                {['livre', '60', '100', '150', '1500', '2500', '3500', '5000', '6000'].map(km => {
                                                    const valid = plan.franchises.includes(km);
                                                    if (!valid) return <td key={km} className="bg-gray-100 border-x"></td>;
                                                    
                                                    return (
                                                        <td key={km} className="p-1 border-x">
                                                            <div className="relative">
                                                                <span className="absolute left-2 top-1.5 text-xs text-gray-400">R$</span>
                                                                <input 
                                                                    type="number" 
                                                                    className="w-full pl-6 p-1 rounded border border-gray-200 focus:border-[#00D166] outline-none text-right font-medium"
                                                                    value={getPriceValue(car.id, plan.id, km)}
                                                                    onChange={e => handlePriceChange(car.id, plan.id, km, e.target.value)}
                                                                />
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPrecos;