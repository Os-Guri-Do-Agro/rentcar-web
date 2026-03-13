import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { getAllCarsPricing } from '@/services/carPricingService';
import { Loader2, Search, Car, Tag, Edit, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import CarPricingModal from '@/components/admin/CarPricingModal';
import { motion } from 'framer-motion';

const PricingCard = ({ title, data, color, type, onEdit }) => {
    // Check if any price is set (> 0)
    const hasData = data && (
        (data.diario && data.diario.some(p => p.preco_diaria > 0)) || 
        (data.trimestral && data.trimestral.preco_total > 0) || 
        (data.semestral && data.semestral.preco_total > 0) || 
        (data.franquia && data.franquia.some(p => p.preco_total > 0))
    );
    
    // Count configured daily options
    const dailyCount = data?.diario?.filter(p => p.preco_diaria > 0).length || 0;
    const franquiaCount = data?.franquia?.filter(p => p.preco_total > 0).length || 0;
    
    return (
        <div className={`rounded-xl border p-4 flex flex-col h-full bg-white ${color} shadow-sm hover:shadow-md transition-all`}>
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-sm uppercase opacity-80">{title}</h4>
                <button onClick={() => onEdit(type)} className="text-xs font-bold hover:underline flex items-center gap-1">
                    <Edit size={12}/> Editar
                </button>
            </div>
            
            <div className="flex-grow space-y-2 text-xs">
                {!hasData && <span className="text-gray-400 italic">Sem preços configurados</span>}
                
                {dailyCount > 0 && (
                    <div className="flex justify-between">
                        <span>Diário:</span>
                        <span className="font-bold">{dailyCount} opções</span>
                    </div>
                )}
                {franquiaCount > 0 && (
                    <div className="flex justify-between">
                        <span>Franquia Mensal:</span>
                        <span className="font-bold">{franquiaCount} planos</span>
                    </div>
                )}
                {data?.trimestral?.preco_total > 0 && (
                    <div className="flex justify-between text-green-700">
                        <span>Trimestral:</span>
                        <span className="font-bold">R$ {data.trimestral.preco_total}</span>
                    </div>
                )}
                {data?.semestral?.preco_total > 0 && (
                    <div className="flex justify-between text-purple-700">
                        <span>Semestral:</span>
                        <span className="font-bold">R$ {data.semestral.preco_total}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminCarPricing = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCar, setSelectedCar] = useState(null);
    const [modalType, setModalType] = useState('particular');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        console.log("[AdminCarPricing] Buscando preços de todos os carros...");
        try {
            const res = await getAllCarsPricing();
            if (res.success) {
                console.log(`[AdminCarPricing] Carregado ${res.data.length} carros`);
                setCars(res.data);
                setFilteredCars(res.data);
            } else {
                console.error("[AdminCarPricing] Fetch error:", res.error);
                setError(res.error || "Falha desconhecida ao carregar dados.");
            }
        } catch (err) {
            console.error("[AdminCarPricing] Erro fatal:", err);
            setError(err.message || "Erro de conexão ao buscar dados.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        let result = cars.filter(c => 
            c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.marca.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCars(result);
    }, [searchTerm, cars]);

    const openModal = (car, type) => {
        console.log(`[AdminCarPricing] Abrindo modal para ${car.nome} / ${type}`);
        setSelectedCar(car);
        setModalType(type);
        setIsModalOpen(true);
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
                    <button onClick={fetchData} className="px-4 py-2 bg-[#00D166] text-white rounded-lg hover:bg-[#00F178] font-bold">
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
                        Tabela de Preços (Nova)
                    </h1>
                    <p className="text-gray-500 mt-1">Gerencie preços diretamente no cadastro do veículo.</p>
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
                <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-[#0E3A2F]" size={48}/></div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredCars.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                            <p className="text-gray-500">Nenhum veículo encontrado.</p>
                        </div>
                    ) : (
                        filteredCars.map((car, index) => (
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
                                        {car.imagem_url ? <img src={car.imagem_url} className="w-full h-full object-cover" alt={car.nome}/> : <Car className="m-auto mt-6 text-gray-300" size={32}/>}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-[#0E3A2F]">{car.marca} {car.nome}</h3>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono">{car.placa}</span>
                                    </div>
                                </div>

                                {/* Pricing Sections */}
                                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <PricingCard 
                                        title="Particular" 
                                        data={car.pricing.particular} 
                                        color="border-blue-100 bg-blue-50/30 text-blue-900" 
                                        type="particular"
                                        onEdit={(t) => openModal(car, t)}
                                    />
                                    <PricingCard 
                                        title="Motorista App" 
                                        data={car.pricing.motorista} 
                                        color="border-green-100 bg-green-50/30 text-green-900" 
                                        type="motorista"
                                        onEdit={(t) => openModal(car, t)}
                                    />
                                    <PricingCard 
                                        title="Corporativo" 
                                        data={car.pricing.corporativo} 
                                        color="border-purple-100 bg-purple-50/30 text-purple-900" 
                                        type="corporativo"
                                        onEdit={(t) => openModal(car, t)}
                                    />
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            <CarPricingModal 
                car={selectedCar} 
                isOpen={isModalOpen} 
                initialRentalType={modalType}
                onClose={() => setIsModalOpen(false)}
                onUpdate={fetchData}
            />
        </div>
    );
};

export default AdminCarPricing;