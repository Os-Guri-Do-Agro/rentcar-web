import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Loader2, Car, Users, Building2, Check, ArrowRight, Info } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useReserva } from '@/context/ReservaContext';
import { cn } from '@/lib/utils';
import carService from '@/services/cars/carService';

const PLANOS = [
    { value: '', label: 'Todos' },
    { value: 'diario', label: 'Diário' },
    { value: 'semanal', label: 'Semanal' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' },
];

const FRANQUIAS = [
    { value: '', label: 'Todas' },
    { value: 'livre', label: 'Livre' },
    { value: '60km', label: '60km' },
    { value: '100km', label: '100km' },
    { value: '120km', label: '120km' },
    { value: '1000km', label: '1000km' },
    { value: '1250km', label: '1250km' },
    { value: '1500km', label: '1500km' },
    { value: '2000km', label: '2000km' },
    { value: '2500km', label: '2500km' },
    { value: '3000km', label: '3000km' },
    { value: '5000km', label: '5000km' },
    { value: '6000km', label: '6000km' },
];

const Frota = () => {
    const navigate = useNavigate();
    const { setTipoReserva, setDadosCarro, setDadosReserva } = useReserva();

    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    const [segmento, setSegmento] = useState('particular');
    const [plano, setPlano] = useState('');
    const [franquia, setFranquia] = useState('');

    const fetchCars = async () => {
        setLoading(true);
        try {
            const res = await carService.getCarsSearch(segmento, plano, franquia);
            setCars(res.data ?? res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, [segmento, plano, franquia]);

    useEffect(() => {
        const channel = supabase
            .channel('frota-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, () => {
                fetchCars();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const handleReserve = (car) => {
        setDadosCarro(car);
        setTipoReserva(segmento || 'particular');
        setDadosReserva({
            tipo_locacao: segmento,
            plano,
            franquia_km: franquia,
        });
        navigate(`/carro/${car.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet title="Frota | JL RENT A CAR" />

            <div className="bg-[#0E3A2F] pt-12 pb-24 text-white text-center rounded-b-[3rem] shadow-lg">
                <h1 className="text-4xl font-bold mb-4">Escolha seu Veículo</h1>
                <p className="text-gray-300 max-w-xl mx-auto">Filtre por segmento, plano e franquia para encontrar o veículo ideal.</p>
            </div>

            <div className="container mx-auto px-4 -mt-16">

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-xl p-6 mb-10 border border-gray-100 max-w-5xl mx-auto">
                    <h3 className="text-lg font-bold text-[#0E3A2F] mb-4 flex items-center gap-2">
                        <Info size={20} /> Filtrar Frota
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Segmento */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500">Segmento</label>
                            <div className="flex rounded-lg overflow-hidden border border-gray-200 p-1 bg-gray-50 gap-1">
                                {[
                                    { id: 'particular', label: 'Particular', icon: Users, color: 'bg-blue-600 text-white shadow-md' },
                                    { id: 'motorista', label: 'Motorista', icon: Car, color: 'bg-green-600 text-white shadow-md' },
                                    { id: 'corporativo', label: 'Corp.', icon: Building2, color: 'bg-purple-600 text-white shadow-md' },
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setSegmento(type.id)}
                                        className={cn(
                                            'flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-all',
                                            segmento === type.id ? type.color : 'text-gray-500 hover:bg-gray-200'
                                        )}
                                    >
                                        <type.icon size={12} /> {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Plano */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500">Plano</label>
                            <select
                                value={plano}
                                onChange={(e) => setPlano(e.target.value)}
                                className="w-full h-11 px-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0E3A2F] focus:border-transparent outline-none font-medium"
                            >
                                {PLANOS.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Franquia */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500">Franquia</label>
                            <select
                                value={franquia}
                                onChange={(e) => setFranquia(e.target.value)}
                                className="w-full h-11 px-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0E3A2F] focus:border-transparent outline-none font-medium"
                            >
                                {FRANQUIAS.map(f => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Grid de carros */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-[#0E3A2F]" size={48} />
                    </div>
                ) : cars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cars.map(car => (
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
                                                <Check size={10} className="mr-1 text-[#00D166]" /> {spec}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                                                    {plano ? plano.charAt(0).toUpperCase() + plano.slice(1) : 'Valor Total'}
                                                </p>
                                                {car.preco_minimo ? (
                                                    <p className="text-2xl font-extrabold text-[#0E3A2F]">
                                                        R$ {parseFloat(car.preco_minimo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                ) : (
                                                    <p className="text-lg font-bold text-gray-400">Indisponível</p>
                                                )}
                                            </div>
                                            <span className={cn(
                                                'text-xs px-2 py-1 rounded font-bold uppercase',
                                                segmento === 'motorista' ? 'bg-green-100 text-green-700' :
                                                segmento === 'corporativo' ? 'bg-purple-100 text-purple-700' :
                                                'bg-blue-100 text-blue-700'
                                            )}>
                                                {segmento || 'particular'}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleReserve(car)}
                                            disabled={!car.preco_minimo}
                                            className={cn(
                                                'w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all',
                                                car.preco_minimo
                                                    ? 'bg-[#00D166] text-[#0E3A2F] hover:bg-[#00F178] hover:shadow-lg'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            )}
                                        >
                                            {car.preco_minimo ? <><span>Reservar Agora</span> <ArrowRight size={18} /></> : 'Consulte Disponibilidade'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">Nenhum veículo encontrado para os filtros selecionados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Frota;
