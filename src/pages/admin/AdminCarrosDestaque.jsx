import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
    Loader2, Star, Plus, Trash2, ArrowUp, ArrowDown,
    Search, Car, AlertCircle, Eye
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import carDestaqueService from '@/services/cars/destaques/carsDestaque-service';
import carService from '@/services/cars/carService';
import CarCard from '@/components/CarCard';

const AdminCarrosDestaque = () => {
    const { toast } = useToast();
    const [featuredCars, setFeaturedCars] = useState([]);
    const [availableCars, setAvailableCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [destaqueRes, carsRes] = await Promise.all([
                carDestaqueService.getCarsDestaque(),
                carService.getCars('false', ''),
            ]);
            const featured = destaqueRes?.data ?? [];
            const allCars = carsRes?.data ?? [];
            const featuredIds = new Set(featured.map(c => c.id));
            setFeaturedCars(featured);
            setAvailableCars(allCars.filter(c => !featuredIds.has(c.id)));
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao carregar dados.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (carId) => {
        setActionLoadingId(`add-${carId}`);
        try {
            await carDestaqueService.postCarsDestaque({ carro_id: carId });
            toast({ title: "Sucesso", description: "Carro adicionado aos destaques.", className: "bg-green-600 text-white" });
            fetchData();
        } catch (error) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setActionLoadingId(null);
        }
    };

    const moveCar = async (index, direction) => {
        const newCars = [...featuredCars];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newCars.length) return;

        [newCars[index], newCars[targetIndex]] = [newCars[targetIndex], newCars[index]];
        setFeaturedCars(newCars);

        try {
            await carDestaqueService.patchCarsReorder({ carros: newCars.map(c => ({ id: c.id })) });
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao reordenar.", variant: "destructive" });
            fetchData();
        }
    };

    const handleRemove = async (carId) => {
        setActionLoadingId(`remove-${carId}`);
        try {
            await carDestaqueService.deleteCarsDestaque(carId);
            toast({ title: "Sucesso", description: "Carro removido dos destaques.", className: "bg-green-600 text-white" });
            fetchData();
        } catch (error) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredAvailable = availableCars.filter(car =>
        car.nome?.toLowerCase().includes(filter.toLowerCase()) ||
        car.placa?.toLowerCase().includes(filter.toLowerCase()) ||
        car.ano?.toString().includes(filter)
    );

    return (
        <div className="p-6 md:p-10 max-w-[1920px] mx-auto min-h-screen bg-gray-50">
            <Helmet title="Admin | Carros em Destaque" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0E3A2F] flex items-center gap-2">
                        <Star className="text-yellow-400 fill-yellow-400" /> Destaques da Home
                    </h1>
                    <p className="text-gray-500">Gerencie os veículos que aparecem na página inicial.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Left Column: Management */}
                <div className="space-y-8">

                    {/* Featured List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-[#0E3A2F] mb-4 flex items-center gap-2">
                            <Star size={20} className="text-[#00D166]" /> Carros em Destaque
                        </h2>

                        {loading ? (
                            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#00D166]" /></div>
                        ) : featuredCars.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <Star className="mx-auto mb-2 opacity-20" size={32} />
                                <p>Nenhum carro em destaque.</p>
                                <p className="text-sm">Adicione carros da lista abaixo.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {featuredCars.map((car, index) => (
                                    <div key={car.id} className="flex items-center gap-4 p-3 bg-white border rounded-lg shadow-sm hover:border-[#00D166] transition-colors group">
                                        <div className="flex flex-col gap-1 text-gray-400">
                                            <button
                                                disabled={index === 0}
                                                onClick={() => moveCar(index, 'up')}
                                                className="hover:text-[#0E3A2F] disabled:opacity-30 transition-colors"
                                            >
                                                <ArrowUp size={16} />
                                            </button>
                                            <button
                                                disabled={index === featuredCars.length - 1}
                                                onClick={() => moveCar(index, 'down')}
                                                className="hover:text-[#0E3A2F] disabled:opacity-30 transition-colors"
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                        </div>
                                        <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            <img src={car.imagem_url} alt={car.nome} className="w-full h-full object-cover" />
                                        </div>

                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-900 text-sm">{car.nome}</p>
                                            <p className="text-xs text-gray-500">{car.placa} • {car.ano}</p>
                                        </div>

                                        <button
                                            onClick={() => handleRemove(car.id)}
                                            disabled={actionLoadingId === `remove-${car.id}`}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Remover dos destaques"
                                        >
                                            {actionLoadingId === `remove-${car.id}`
                                                ? <Loader2 size={18} className="animate-spin" />
                                                : <Trash2 size={18} />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Available List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-[#0E3A2F] flex items-center gap-2">
                                <Car size={20} className="text-gray-400" /> Disponíveis
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Filtrar..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="pl-8 pr-3 py-1 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-[#00D166] w-48"
                                />
                            </div>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#00D166]" /></div>
                            ) : filteredAvailable.length === 0 ? (
                                <p className="text-center text-gray-400 py-4 text-sm">Nenhum carro disponível encontrado.</p>
                            ) : (
                                filteredAvailable.map(car => (
                                    <div key={car.id} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                        <div className="w-12 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            <img src={car.imagem_url} alt={car.nome} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-700 text-sm">{car.nome}</p>
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{car.categoria}</span>
                                        </div>
                                        <button
                                            onClick={() => handleAdd(car.id)}
                                            disabled={actionLoadingId === `add-${car.id}`}
                                            className="p-1.5 bg-[#0E3A2F] text-white rounded hover:bg-[#165945] transition-colors disabled:opacity-50"
                                        >
                                            {actionLoadingId === `add-${car.id}`
                                                ? <Loader2 size={16} className="animate-spin" />
                                                : <Plus size={16} />}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[#0E3A2F] flex items-center gap-2">
                            <Eye size={20} className="text-[#00D166]" /> Preview - Como ficará na Home
                        </h2>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 md:p-8 border border-gray-200">
                        {featuredCars.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <AlertCircle className="mx-auto mb-2" size={32} />
                                <p>Adicione carros para visualizar o preview.</p>
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {featuredCars.map(car => (
                                    <div key={`preview-${car.id}`} className="flex-shrink-0 w-64">
                                        <CarCard car={car} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCarrosDestaque;
