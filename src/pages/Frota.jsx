import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Loader2, Car, Users, Building2, Check, ArrowRight, Info } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useReserva } from '@/context/ReservaContext';
import { cn } from '@/lib/utils';
import { getColumnName } from '@/services/carPricingService';

const Frota = () => {
    const navigate = useNavigate();
    const { setTipoReserva, setDadosCarro, setDadosReserva } = useReserva();
    
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter/Calculator States
    const [tipoLocacao, setTipoLocacao] = useState('particular');
    const [tipoPlano, setTipoPlano] = useState('');
    const [usoKm, setUsoKm] = useState(60); 

    const fetchCars = async () => {
        // Only show loading spinner on initial load, but fetch runs on background updates too
        // We can check if cars is empty to decide whether to show loading, 
        // or rely on the loading state which is managed by the caller if needed.
        // For simplicity, we'll keep setLoading(true) here but it might cause a brief flash on update.
        // To avoid flash on realtime updates, we could check if cars.length === 0
        if (cars.length === 0) setLoading(true);

        try {
            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .eq('disponivel', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCars(data);
        } catch (error) {
            console.error("Erro ao carregar frota:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();

        // Real-time subscription for car updates
        const channel = supabase
            .channel('frota-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'cars'
                },
                (payload) => {
                    console.log('Alteração na frota detectada:', payload);
                    fetchCars();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Set default plans when locacao type changes, but allow manual override
    // And ensure sensible defaults are set
    useEffect(() => {
        if (tipoLocacao === 'motorista') {
            if (!['trimestral', 'semestral', 'anual', 'semanal'].includes(tipoPlano)) {
                setTipoPlano('trimestral');
                setUsoKm(2500);
            }
        } else if (tipoLocacao === 'particular') {
             if (!['diario', 'semanal', 'franquia', 'trimestral', 'semestral'].includes(tipoPlano)) {
                 setTipoPlano('diario');
                 setUsoKm(60);
             }
        } else if (tipoLocacao === 'corporativo') {
             if (!['diario', 'trimestral', 'semestral', 'franquia'].includes(tipoPlano)) {
                 setTipoPlano('diario');
                 setUsoKm(60);
             }
        }
    }, [tipoLocacao]);

    const handleReserve = (car, price) => {
        if (!price || price <= 0) return;
        
        setDadosCarro(car);
        // Force the user's selected rental type
        setTipoReserva(tipoLocacao);
        
        setDadosReserva({
            tipo_locacao: tipoLocacao,
            plano: tipoPlano,
            franquia_km: usoKm,
            estimatedPrice: price
        });

        navigate(`/carro/${car.id}`);
    };

    const getPrice = (car) => {
        // This function needs to safely check if the car supports the selected options
        // For instance, if user selected "Motorista" but car only supports "Particular", return 0
        if (tipoLocacao === 'particular' && !car.disponivel_particular) return 0;
        if (tipoLocacao === 'motorista' && !car.disponivel_motorista) return 0;
        
        // Then get price from column mapping
        const col = getColumnName(tipoLocacao, tipoPlano, usoKm);
        if (col && car[col]) return parseFloat(car[col]);
        return 0;
    };

    const getKmOptions = () => {
        if (tipoLocacao === 'particular') {
            if (tipoPlano === 'diario') {
                return [
                    { value: 60, label: '60km' },
                    { value: 100, label: '100km' },
                    { value: 120, label: '120km' }
                ];
            }
            if (tipoPlano === 'semanal') {
                 return [
                    { value: 1500, label: '1500km' },
                    { value: 2000, label: '2000km' },
                    { value: 3000, label: '3000km' }
                ];
            }
            if (tipoPlano === 'franquia') {
                 return [
                    { value: 1500, label: '1500km' },
                    { value: 2000, label: '2000km' },
                    { value: 3000, label: '3000km' }
                ];
            }
        }
        
        if (tipoLocacao === 'motorista') {
            if (['trimestral', 'semestral', 'anual'].includes(tipoPlano)) {
                 return [
                    { value: 2500, label: '2500km' },
                    { value: 5000, label: '5000km' },
                    { value: 6000, label: '6000km' }
                ];
            }
             if (tipoPlano === 'semanal') {
                return [
                    { value: 1250, label: '1250km' },
                    { value: 1500, label: '1500km' }
                ];
            }
        }

        return [];
    };

    const kmOptions = getKmOptions();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet title="Frota | JL RENT A CAR" />
            
            <div className="bg-[#0E3A2F] pt-12 pb-24 text-white text-center rounded-b-[3rem] shadow-lg">
                <h1 className="text-4xl font-bold mb-4">Escolha seu Veículo</h1>
                <p className="text-gray-300 max-w-xl mx-auto">Configure sua locação e veja o preço ideal para você.</p>
            </div>

            <div className="container mx-auto px-4 -mt-16">
                
                {/* 1. Global Filters / Calculator */}
                <div className="bg-white rounded-xl shadow-xl p-6 mb-10 border border-gray-100 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold text-[#0E3A2F] mb-4 flex items-center gap-2">
                        <Info size={20}/> Simule sua Locação
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Rental Type Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500">Tipo de Locação</label>
                            <div className="flex rounded-lg overflow-hidden border border-gray-200 p-1 bg-gray-50 gap-1">
                                {[
                                    { id: 'particular', label: 'Particular', icon: Users, color: 'bg-blue-600 text-white shadow-md' },
                                    { id: 'motorista', label: 'Motorista', icon: Car, color: 'bg-green-600 text-white shadow-md' },
                                    { id: 'corporativo', label: 'Corp.', icon: Building2, color: 'bg-purple-600 text-white shadow-md' }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setTipoLocacao(type.id)}
                                        className={cn(
                                            "flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all",
                                            tipoLocacao === type.id 
                                                ? type.color
                                                : "text-gray-500 hover:bg-gray-200"
                                        )}
                                    >
                                        <type.icon size={14}/> {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Plan Type Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500">Plano</label>
                            <select 
                                value={tipoPlano} 
                                onChange={(e) => setTipoPlano(e.target.value)}
                                className="w-full h-11 px-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0E3A2F] focus:border-transparent outline-none font-medium"
                            >
                                {tipoLocacao === 'motorista' ? (
                                    <>
                                        <option value="trimestral">Trimestral (90 dias)</option>
                                        <option value="semestral">Semestral (180 dias)</option>
                                        <option value="anual">Anual (365 dias)</option>
                                        <option value="semanal">Semanal (7 dias)</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="diario">Diário</option>
                                        <option value="semanal">Semanal</option>
                                        <option value="franquia">Pacote Mensal</option>
                                        <option value="trimestral">Trimestral (90 dias)</option>
                                        <option value="semestral">Semestral (180 dias)</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Usage/KM Selector (Conditional) */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500">
                                {tipoPlano === 'diario' ? 'Franquia Diária' : 'Pacote/Franquia'}
                            </label>
                            {kmOptions.length > 0 ? (
                                <select 
                                    value={usoKm || ''} 
                                    onChange={(e) => setUsoKm(parseInt(e.target.value))}
                                    className="w-full h-11 px-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0E3A2F] focus:border-transparent outline-none font-medium"
                                >
                                    {kmOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="h-11 px-3 border border-gray-200 rounded-lg bg-gray-100 flex items-center text-gray-400 text-sm italic">
                                    Padrão (Fixo)
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Car Grid */}
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0E3A2F]" size={48} /></div>
                ) : cars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cars.map(car => {
                            const price = getPrice(car);
                            const hasPrice = price > 0;

                            return (
                                <div key={car.id} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-shadow border border-gray-100 group">
                                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                                        <img 
                                            src={car.foto_principal || car.imagem_url} 
                                            alt={car.nome} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-[#0E3A2F] text-xs font-bold px-2 py-1 rounded shadow-sm">
                                            {car.ano}
                                        </div>
                                    </div>

                                    <div className="p-6 flex-grow flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{car.marca} {car.nome}</h3>
                                        <p className="text-sm text-gray-500 mb-4">{car.categoria} • {car.cambio}</p>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {car.especificacoes?.slice(0, 3).map((spec, i) => (
                                                <span key={i} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-100 flex items-center">
                                                    <Check size={10} className="mr-1 text-[#00D166]"/> {spec}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                                                        {tipoPlano === 'diario' ? 'Diária' : 'Valor Total'}
                                                    </p>
                                                    {hasPrice ? (
                                                        <p className="text-2xl font-extrabold text-[#0E3A2F]">
                                                            R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            {tipoPlano === 'diario' && <span className="text-sm font-normal text-gray-500">/dia</span>}
                                                            {tipoPlano === 'semanal' && <span className="text-sm font-normal text-gray-500">/semana</span>}
                                                        </p>
                                                    ) : (
                                                        <p className="text-lg font-bold text-gray-400">Indisponível</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                                                        tipoLocacao === 'particular' ? 'bg-blue-100 text-blue-700' :
                                                        tipoLocacao === 'motorista' ? 'bg-green-100 text-green-700' :
                                                        'bg-purple-100 text-purple-700'
                                                    }`}>
                                                        {tipoLocacao}
                                                    </span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => handleReserve(car, price)}
                                                disabled={!hasPrice}
                                                className={cn(
                                                    "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                                                    hasPrice 
                                                        ? "bg-[#00D166] text-[#0E3A2F] hover:bg-[#00F178] hover:shadow-lg" 
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                )}
                                            >
                                                {hasPrice ? (
                                                    <>Reservar Agora <ArrowRight size={18} /></>
                                                ) : (
                                                    "Consulte Disponibilidade"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">Nenhum veículo disponível no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Frota;