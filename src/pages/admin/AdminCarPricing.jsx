import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2, Search, Car, Tag, Edit, AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CarPricingModal from '@/components/admin/CarPricingModal';
import { motion } from 'framer-motion';
import carService from '@/services/cars/carService';
import carPlanosService from '@/services/cars/carPlanosService';
import { parseCarPlanosResponse } from '@/utils/carPlanosHelpers';

const CATEGORIA_LABEL = {
    diario: 'Diário',
    semanal: 'Semanal',
    trimestral: 'Trimestral',
    semestral: 'Semestral',
    anual: 'Anual',
};

const CATEGORIA_COLORS = {
    diario: 'bg-sky-100 text-sky-600',
    semanal: 'bg-teal-100 text-teal-600',
    trimestral: 'bg-amber-100 text-amber-600',
    semestral: 'bg-orange-100 text-orange-600',
    anual: 'bg-rose-100 text-rose-600',
};

const PricingCard = ({ title, planos = [], color, type, onEdit }) => {
    const ativos = planos.filter(p => p.ativo);
    const categorias = [...new Set(planos.map(p => p.categoria))];

    const precoMin = ativos.length > 0
        ? Math.min(...ativos.map(p => Number(p.preco)))
        : null;
    const precoMax = ativos.length > 0
        ? Math.max(...ativos.map(p => Number(p.preco)))
        : null;

    return (
        <div className={`rounded-xl border p-4 flex flex-col h-full bg-white ${color} shadow-sm hover:shadow-md transition-all`}>
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-sm uppercase opacity-80">{title}</h4>
                <button onClick={() => onEdit(type)} className="text-xs font-bold hover:underline flex items-center gap-1">
                    <Edit size={12} /> Editar
                </button>
            </div>

            <div className="flex-grow space-y-2 text-xs">
                {planos.length === 0 ? (
                    <span className="text-gray-400 italic">Sem planos configurados</span>
                ) : (
                    <>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total de planos:</span>
                            <span className="font-bold">{planos.length} ({ativos.length} ativos)</span>
                        </div>

                        {precoMin !== null && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Faixa de preço:</span>
                                <span className="font-bold">
                                    {precoMin === precoMax
                                        ? `R$ ${precoMin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                        : `R$ ${precoMin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} – ${precoMax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                    }
                                </span>
                            </div>
                        )}

                        {categorias.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                                {categorias.map(cat => (
                                    <span key={cat} className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORIA_COLORS[cat] ?? 'bg-gray-100 text-gray-500'}`}>
                                        {CATEGORIA_LABEL[cat] ?? cat}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const ITEMS_PER_PAGE = 20;

const AdminCarPricing = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [planosMap, setPlanosMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingPlanos, setLoadingPlanos] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCar, setSelectedCar] = useState(null);
    const [modalType, setModalType] = useState('particular');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const skipPageEffect = useRef(false);

    const fetchPlanos = useCallback(async (carIds) => {
        if (!carIds.length) return;
        setLoadingPlanos(true);
        const results = await Promise.allSettled(
            carIds.map(id => carPlanosService.getPlanosByCarroId(id))
        );
        const map = {};
        carIds.forEach((id, idx) => {
            const result = results[idx];
            map[id] = result.status === 'fulfilled'
                ? parseCarPlanosResponse(result.value)
                : { particular: [], motorista: [], corporativo: [] };
        });
        setPlanosMap(map);
        setLoadingPlanos(false);
    }, []);

    const fetchData = useCallback(async (page = currentPage, search = searchTerm) => {
        setLoading(true);
        setError(null);
        try {
            const result = await carService.getCarsPagination(search, String(page), String(ITEMS_PER_PAGE));
            const raw = result?.data?.data ?? [];
            const total = result?.data?.total ?? raw.length;
            setCars(raw);
            setTotalPages(Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)));
            fetchPlanos(raw.map(c => c.id));
        } catch (err) {
            setError(err.message || 'Erro de conexão ao buscar dados.');
        } finally {
            setLoading(false);
        }
    }, [fetchPlanos]);

    useEffect(() => {
        const timer = setTimeout(() => {
            skipPageEffect.current = true;
            setCurrentPage(1);
            fetchData(1, searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (skipPageEffect.current) { skipPageEffect.current = false; return; }
        fetchData(currentPage, searchTerm);
    }, [currentPage]);

    const openModal = (car, type) => {
        setSelectedCar(car);
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleModalUpdate = () => {
        fetchPlanos(cars.map(c => c.id));
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar preços</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/admin')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                        Voltar
                    </button>
                    <button onClick={() => fetchData()} className="px-4 py-2 bg-[#00D166] text-white rounded-lg hover:bg-[#00F178] font-bold">
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50">
            <Helmet title="Admin | Preços dos Carros" />

            <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-gray-500 hover:text-[#0E3A2F] mb-6 transition-colors font-medium"
            >
                <ArrowLeft size={20} /> Voltar para Dashboard
            </button>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#0E3A2F] flex items-center gap-3">
                        <Tag className="text-[#00D166]" size={32} />
                        Planos de Preços
                    </h1>
                    <p className="text-gray-500 mt-1">Gerencie planos de locação por veículo: particular, motorista e corporativo.</p>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar carro..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center h-64 items-center">
                    <Loader2 className="animate-spin text-[#0E3A2F]" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {cars.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                            <p className="text-gray-500">Nenhum veículo encontrado.</p>
                        </div>
                    ) : (
                        cars.map((car, index) => {
                            const carPlanos = planosMap[car.id] ?? { particular: [], motorista: [], corporativo: [] };
                            return (
                                <motion.div
                                    key={car.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col lg:flex-row gap-6"
                                >
                                    {/* Car Info */}
                                    <div className="flex lg:flex-col items-center gap-4 lg:w-48 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-4">
                                        <div className="w-20 h-20 lg:w-32 lg:h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                            {car.imagem_url
                                                ? <img src={car.imagem_url} className="w-full h-full object-cover" alt={car.nome} />
                                                : <Car className="m-auto mt-6 text-gray-300" size={32} />}
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-bold text-[#0E3A2F]">{car.nome}</h3>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono">{car.placa}</span>
                                            {loadingPlanos && (
                                                <div className="mt-2 flex justify-center">
                                                    <Loader2 size={14} className="animate-spin text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pricing Sections */}
                                    <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <PricingCard
                                            title="Particular"
                                            planos={carPlanos.particular}
                                            color="border-blue-100 bg-blue-50/30 text-blue-900"
                                            type="particular"
                                            onEdit={(t) => openModal(car, t)}
                                        />
                                        <PricingCard
                                            title="Motorista App"
                                            planos={carPlanos.motorista}
                                            color="border-green-100 bg-green-50/30 text-green-900"
                                            type="motorista"
                                            onEdit={(t) => openModal(car, t)}
                                        />
                                        <PricingCard
                                            title="Corporativo"
                                            planos={carPlanos.corporativo}
                                            color="border-purple-100 bg-purple-50/30 text-purple-900"
                                            type="corporativo"
                                            onEdit={(t) => openModal(car, t)}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-4">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                «
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                                .reduce((acc, page, idx, arr) => {
                                    if (idx > 0 && page - arr[idx - 1] > 1) acc.push('...');
                                    acc.push(page);
                                    return acc;
                                }, [])
                                .map((item, idx) =>
                                    item === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">...</span>
                                    ) : (
                                        <button
                                            key={item}
                                            onClick={() => setCurrentPage(item)}
                                            className={`w-9 h-9 rounded-lg border text-sm font-bold transition-colors ${
                                                item === currentPage
                                                    ? 'bg-[#0E3A2F] text-white border-[#0E3A2F]'
                                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    )
                                )
                            }
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                »
                            </button>
                        </div>
                    )}
                </div>
            )}

            <CarPricingModal
                car={selectedCar}
                isOpen={isModalOpen}
                initialRentalType={modalType}
                onClose={() => setIsModalOpen(false)}
                onUpdate={handleModalUpdate}
            />
        </div>
    );
};

export default AdminCarPricing;
