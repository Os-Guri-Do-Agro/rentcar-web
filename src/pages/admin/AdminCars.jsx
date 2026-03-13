import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Plus, Edit2, Trash2, DollarSign, Search } from 'lucide-react';
import { fetchAllCars, deleteCar } from '@/services/carService';
import { useToast } from '@/components/ui/use-toast';

const AdminCars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        loadCars();
    }, []);

    const loadCars = async () => {
        try {
            const data = await fetchAllCars(false); // Fetch all, including unavailable
            setCars(data);
        } catch (error) {
            toast({ title: "Erro ao carregar carros", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir este carro?")) return;
        try {
            await deleteCar(id);
            toast({ title: "Carro excluído" });
            loadCars();
        } catch (error) {
            toast({ title: "Erro ao excluir", variant: "destructive" });
        }
    };

    const filteredCars = cars.filter(c => 
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.placa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
            <Helmet title="Admin | Lista de Carros" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-[#0E3A2F]">Gerenciar Carros</h1>
                <Link to="/admin/car/new" className="bg-[#00D166] text-[#0E3A2F] px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#00b355]">
                    <Plus size={20}/> Novo Carro
                </Link>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
                    <input 
                        className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#00D166]" 
                        placeholder="Buscar por nome ou placa..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? <div className="text-center p-10"><Loader2 className="animate-spin mx-auto text-[#00D166]"/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCars.map(car => (
                        <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            <div className="h-48 bg-gray-100 relative">
                                <img src={car.foto_principal || car.imagem_url} alt={car.nome} className="w-full h-full object-cover"/>
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${car.disponivel ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {car.disponivel ? 'Disponível' : 'Indisponível'}
                                </div>
                            </div>
                            <div className="p-4 flex-grow">
                                <h3 className="font-bold text-lg text-[#0E3A2F] mb-1">{car.nome}</h3>
                                <p className="text-sm text-gray-500 mb-4">{car.placa} • {car.ano}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {car.disponivel_particular && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Particular</span>}
                                    {car.disponivel_motorista && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">Motorista</span>}
                                </div>
                            </div>
                            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                                <Link to={`/admin/editar-precos-carro/${car.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1">
                                    <DollarSign size={16}/> Preços
                                </Link>
                                <div className="flex gap-3">
                                    <Link to={`/admin/car/${car.id}`} className="text-gray-600 hover:text-[#0E3A2F]">
                                        <Edit2 size={18}/>
                                    </Link>
                                    <button onClick={() => handleDelete(car.id)} className="text-red-400 hover:text-red-600">
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCars;