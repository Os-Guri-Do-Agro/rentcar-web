import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
    Loader2, ArrowLeft, Check, Shield, Settings, Tag, Users, Car as CarIcon, Building2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ReservaForm from '@/components/ReservaForm';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import carService from '@/services/cars/carService';
import carPlanosService from '@/services/cars/carPlanosService';
import { CATEGORIAS, KM_OPCOES } from '@/constants/carPlanos';
import { cn } from '@/lib/utils';

const TIPO_CONFIG = {
    particular:  { label: 'Particular',    icon: Users,     headerClass: 'bg-blue-600',   badgeClass: 'bg-blue-100 text-blue-700',   borderClass: 'border-blue-200' },
    motorista:   { label: 'Motorista App', icon: CarIcon,   headerClass: 'bg-green-600',  badgeClass: 'bg-green-100 text-green-700', borderClass: 'border-green-200' },
    corporativo: { label: 'Corporativo',   icon: Building2, headerClass: 'bg-purple-600', badgeClass: 'bg-purple-100 text-purple-700', borderClass: 'border-purple-200' },
};

const KM_LABEL_MAP = Object.fromEntries(KM_OPCOES.map(o => [o.value, o.label]));
const kmLabel = (km) => KM_LABEL_MAP[km] ?? (km === 0 ? 'KM Livre' : `${Number(km).toLocaleString('pt-BR')} KM`);

const PlanosTable = ({ tipo, planos }) => {
    const cfg = TIPO_CONFIG[tipo];
    const Icon = cfg.icon;

    // categorias presentes neste tipo (em ordem de CATEGORIAS)
    const cats = useMemo(() => {
        const present = new Set(planos.map(p => p.categoria));
        return CATEGORIAS.filter(c => present.has(c.value));
    }, [planos]);

    // kms presentes (ordenados)
    const kms = useMemo(() => [...new Set(planos.map(p => p.km_franquia))].sort((a, b) => a - b), [planos]);

    if (!planos.length) return null;

    return (
        <div className={cn('rounded-xl border overflow-hidden shadow-sm', cfg.borderClass)}>
            {/* Header */}
            <div className={cn('flex items-center gap-2 px-4 py-3 text-white text-sm font-bold', cfg.headerClass)}>
                <Icon size={16} /> {cfg.label}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-4 py-2 text-xs text-gray-500 font-semibold uppercase">Plano</th>
                            {kms.map(km => (
                                <th key={km} className="text-center px-3 py-2 text-xs text-gray-500 font-semibold uppercase whitespace-nowrap">
                                    {kmLabel(km)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {cats.map(cat => (
                            <tr key={cat.value} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-700">{cat.label}</td>
                                {kms.map(km => {
                                    const plano = planos.find(p => p.categoria === cat.value && p.km_franquia === km);
                                    return (
                                        <td key={km} className="px-3 py-3 text-center">
                                            {plano ? (
                                                <span className={cn(
                                                    'font-bold text-[#0E3A2F]',
                                                    !plano.ativo && 'opacity-40 line-through'
                                                )}>
                                                    R$ {Number(plano.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            ) : (
                                                <span className="text-gray-200">—</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CarDetail = () => {
    const { carroId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const topRef = useRef(null);

    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [planosAgrupados, setPlanosAgrupados] = useState(null);

    useEffect(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });

        const fetchCar = async () => {
            const { data, error } = await carService.getCarById(carroId);
            if (error) {
                toast({ title: 'Erro', description: 'Veículo não encontrado', variant: 'destructive' });
                return;
            }
            setCar(data);
            setLoading(false);
        };

        const fetchPlanos = async () => {
            try {
                const results = await Promise.all(
                    Object.keys(TIPO_CONFIG).map(tipo =>
                        carPlanosService.getPlanosFiltro(tipo, undefined, carroId)
                            .then(res => ({ tipo, planos: (res?.data ?? []).filter(p => p.ativo) }))
                            .catch(() => ({ tipo, planos: [] }))
                    )
                );
                const agrupado = Object.fromEntries(results.map(r => [r.tipo, r.planos]));
                setPlanosAgrupados(agrupado);
            } catch {
                // planos são opcionais na exibição estática
            }
        };

        fetchCar();
        fetchPlanos();
    }, [carroId]);

    const tiposComPlanos = useMemo(() => {
        if (!planosAgrupados) return [];
        return Object.keys(TIPO_CONFIG).filter(t => planosAgrupados[t]?.length > 0);
    }, [planosAgrupados]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#00D166]" size={48} />
        </div>
    );

    return (
        <>
            <Helmet><title>{car.nome} | Reserva</title></Helmet>
            <div ref={topRef} className="min-h-screen bg-[#F9FAFB] pb-24">

                {/* Header */}
                <div className="bg-[#0E3A2F] text-white pt-8 pb-32">
                    <div className="container mx-auto px-4">
                        <button
                            onClick={() => navigate('/frota')}
                            className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 font-medium"
                        >
                            <ArrowLeft size={18} /> Voltar para Frota
                        </button>
                        <h1 className="text-3xl md:text-5xl font-bold mb-2">{car.nome}</h1>
                        <p className="text-lg text-gray-300 flex items-center gap-2">
                            <span className="bg-[#00D166] text-[#0E3A2F] text-xs font-bold px-2 py-1 rounded uppercase">{car.categoria}</span>
                            {car.marca} • {car.ano}
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left column */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Gallery */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                {car.fotos_galeria && car.fotos_galeria.length > 0 ? (
                                    <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} className="w-full aspect-video">
                                        <SwiperSlide>
                                            <img src={car.foto_principal || car.imagem_url} alt="Principal" className="w-full h-full object-cover" />
                                        </SwiperSlide>
                                        {car.fotos_galeria.map((url, i) => (
                                            <SwiperSlide key={i}>
                                                <img src={url} alt={`Galeria ${i}`} className="w-full h-full object-cover" />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                ) : (
                                    <img src={car.foto_principal || car.imagem_url} alt={car.nome} className="w-full aspect-video object-cover" />
                                )}
                            </motion.div>
{/* 
                            Tabela de Planos
                            {tiposComPlanos.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-lg p-8">
                                    <h3 className="text-xl font-bold text-[#0E3A2F] mb-6 flex items-center gap-2">
                                        <Tag className="text-[#00D166]" /> Planos e Preços
                                    </h3>
                                    <div className="space-y-4">
                                        {tiposComPlanos.map(tipo => (
                                            <PlanosTable
                                                key={tipo}
                                                tipo={tipo}
                                                planos={planosAgrupados[tipo].filter(p => p.ativo)}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4">* Preços para o período completo do plano. Plano Diário cobrado por dia.</p>
                                </motion.div>
                            )} */}

                            {/* Specs */}
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h3 className="text-xl font-bold text-[#0E3A2F] mb-6 flex items-center gap-2">
                                    <Settings className="text-[#00D166]" /> Especificações
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {car.especificacoes && car.especificacoes.length > 0 ? (
                                        car.especificacoes.map((spec, i) => (
                                            <div key={i} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                <Check size={16} className="text-[#00D166]" />
                                                <span className="text-sm font-medium">{spec}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 italic">Sem especificações cadastradas.</p>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h3 className="text-xl font-bold text-[#0E3A2F] mb-6 flex items-center gap-2">
                                    <Shield className="text-[#00D166]" /> Informações Importantes
                                </h3>
                                <ul className="space-y-3 text-gray-600">
                                    <li className="flex gap-2"><Check size={18} className="text-[#00D166]" /> Seguro Roubo, Furto e Assistência 24 Horas incluso.</li>
                                    <li className="flex gap-2"><Check size={18} className="text-[#00D166]" /> Processo de documentação 100% Transparente.</li>
                                    <li className="flex gap-2"><Check size={18} className="text-[#00D166]" /> Manutenção preventiva inclusa.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Sidebar — Reserva */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border-t-4 border-[#00D166]">
                                <h3 className="text-xl font-bold text-[#0E3A2F] mb-6">Simular Reserva</h3>
                                <ReservaForm car={car} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CarDetail;
