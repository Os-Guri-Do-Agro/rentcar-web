import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Loader2, Car, Users, Building2, ArrowRight, Info, SearchX } from 'lucide-react';
import { useReserva } from '@/context/ReservaContext';
import { cn } from '@/lib/utils';
import carPlanosService from '@/services/cars/carPlanosService';
import { CATEGORIAS as TODAS_CATEGORIAS, CATEGORIAS_POR_TIPO, KM_OPCOES as KM_BASE } from '@/constants/carPlanos';

const KM_OPCOES = [{ value: '', label: 'Todas as franquias' }, ...KM_BASE];

const SEGMENTO_BADGE = {
    particular:  'bg-blue-100 text-blue-700',
    motorista:   'bg-green-100 text-green-700',
    corporativo: 'bg-purple-100 text-purple-700',
};

const SEGMENTOS = [
    { id: 'particular',  label: 'Particular', icon: Users,     color: 'bg-blue-600 text-white shadow-md' },
    { id: 'motorista',   label: 'Motorista',  icon: Car,       color: 'bg-green-600 text-white shadow-md' },
    { id: 'corporativo', label: 'Corp.',      icon: Building2, color: 'bg-purple-600 text-white shadow-md' },
];

const Frota = () => {
    const navigate = useNavigate();
    const { setTipoReserva, setDadosCarro, setDadosReserva } = useReserva();

    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    const [segmento, setSegmento] = useState('particular');
    const [categoria, setCategoria] = useState('');
    const [kmFranquia, setKmFranquia] = useState('');

    const categoriasDisponiveis = useMemo(() => [
        { value: '', label: 'Todos os planos' },
        ...TODAS_CATEGORIAS.filter(c => CATEGORIAS_POR_TIPO[segmento]?.includes(c.value)),
    ], [segmento]);

    const handleSegmentoChange = (novo) => {
        setSegmento(novo);
        // reseta categoria se não for compatível com o novo segmento
        if (categoria && !CATEGORIAS_POR_TIPO[novo]?.includes(categoria)) {
            setCategoria('');
        }
    };

    const fetchCars = async () => {
        setLoading(true);
        try {
            // Usa o endpoint simplificado que não exige km_franquia obrigatório
            const res = await carPlanosService.getPlanosFiltro(segmento, categoria || undefined);
            let planosList = res?.data ?? [];

            // Filtra por ativo e km_franquia no client
            if (kmFranquia !== '') {
                planosList = planosList.filter(p => p.km_franquia === Number(kmFranquia));
            }
            planosList = planosList.filter(p => p.ativo);

            // Agrupa por carro, calcula preço mínimo
            const carMap = new Map();
            planosList.forEach(plano => {
                const carId = plano.carro_id;
                const preco = Number(plano.preco);
                if (!carMap.has(carId)) {
                    carMap.set(carId, {
                        ...(plano.cars ?? {}),
                        id: carId,
                        precoMinimo: preco,
                    });
                } else {
                    const existing = carMap.get(carId);
                    existing.precoMinimo = Math.min(existing.precoMinimo, preco);
                }
            });

            setCars([...carMap.values()]);
        } catch (e) {
            console.error('[Frota] Erro ao buscar planos:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, [segmento, categoria, kmFranquia]);

    const handleReserve = (car) => {
        setDadosCarro(car);
        setTipoReserva(segmento);
        setDadosReserva({ tipo_locacao: segmento, plano: categoria, km_franquia: kmFranquia });
        navigate(`/carro/${car.id}`);
    };

    const categoriaLabel = categoria
        ? TODAS_CATEGORIAS.find(c => c.value === categoria)?.label
        : null;

    const segmentoBadgeColor = SEGMENTO_BADGE[segmento];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet title="Frota | JL RENT A CAR" />

            <div className="bg-[#0E3A2F] pt-12 pb-24 text-white text-center rounded-b-[3rem] shadow-lg">
                <h1 className="text-4xl font-bold mb-4">Escolha seu Veículo</h1>
                <p className="text-gray-300 max-w-xl mx-auto">
                    Filtre por segmento, plano e franquia para encontrar o veículo ideal.
                </p>
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
                                {SEGMENTOS.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => handleSegmentoChange(type.id)}
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
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                className="w-full h-11 px-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0E3A2F] focus:border-transparent outline-none font-medium"
                            >
                                {categoriasDisponiveis.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Franquia KM */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-500">Franquia KM</label>
                            <select
                                value={kmFranquia}
                                onChange={(e) => setKmFranquia(e.target.value)}
                                className="w-full h-11 px-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0E3A2F] focus:border-transparent outline-none font-medium"
                            >
                                {KM_OPCOES.map(f => (
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
                            <div
                                key={car.id}
                                className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-shadow border border-gray-100 group"
                            >
                                <div className="relative h-48 bg-gray-100 overflow-hidden">
                                    {(car.foto_principal || car.imagem_url) ? (
                                        <img
                                            src={car.foto_principal || car.imagem_url}
                                            alt={car.nome}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <Car className="text-gray-200" size={64} />
                                        </div>
                                    )}
                                    {car.ano && (
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-[#0E3A2F] text-xs font-bold px-2 py-1 rounded shadow-sm">
                                            {car.ano}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {car.marca} {car.nome}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {[car.modelo, car.ano].filter(Boolean).join(' • ')}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                                                    {categoriaLabel ?? 'A partir de'}
                                                </p>
                                                <p className="text-2xl font-extrabold text-[#0E3A2F]">
                                                    R$ {car.precoMinimo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <span className={cn('text-xs px-2 py-1 rounded font-bold uppercase', segmentoBadgeColor)}>
                                                {segmento}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleReserve(car)}
                                            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-[#00D166] text-[#0E3A2F] hover:bg-[#00F178] hover:shadow-lg"
                                        >
                                            <span>Reservar Agora</span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 flex flex-col items-center gap-4 text-gray-400">
                        <SearchX size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">Nenhum veículo encontrado para os filtros selecionados.</p>
                        <p className="text-sm">Tente outros valores de plano ou franquia.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Frota;
