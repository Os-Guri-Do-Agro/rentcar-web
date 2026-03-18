import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, Search, Image as ImageIcon, RefreshCw, DollarSign, AlertTriangle, ArrowLeft, Check, X, Power, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import CarPricingModal from '@/components/admin/CarPricingModal';
import { cn } from '@/lib/utils';
import carService from '@/services/cars/carService';

const ITEMS_PER_PAGE = 20;

const AdminFleetManager = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [selectedCar, setSelectedCar] = useState(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchCars = async (page = currentPage, search = searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const result = await carService.getCarsPagination(search, String(page), String(ITEMS_PER_PAGE));
      const raw = Array.isArray(result) ? result : Array.isArray(result?.data?.data) ? result.data.data : [];
      const total = result?.data?.total ?? raw.length;
      setCars(raw);
      setFilteredCars(raw);
      setTotalPages(Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)));
    } catch (err) {
      setError(err.message);
      toast({ title: "Erro ao buscar frota", description: err.message, variant: "destructive" });
      setCars([]);
      setFilteredCars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchCars(1, searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => { fetchCars(currentPage, searchTerm); }, [currentPage]);

  const handleToggleGeneralAvailability = async (car) => {
    const newStatus = !car.disponivel;
    setTogglingId(car.id);
    try {
      setCars(prev => prev.map(c => c.id === car.id ? { ...c, disponivel: newStatus } : c));
      
      await carService.patchCarById(car.id, { disponivel: newStatus });
      
      toast({ 
        title: newStatus ? "Veículo ativado" : "Veículo desativado",
        description: `O veículo agora está ${newStatus ? 'visível' : 'oculto'} para clientes.`,
        className: "bg-green-600 text-white" 
      });
      fetchCars();
    } catch (error) {
      console.error("[AdminFleetManager] Erro ao atualizar status geral:", error);
      fetchCars();
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
      try {
          await carService.deleteCarById(deleteConfirmId);
          setCars(cars.filter(c => c.id !== deleteConfirmId));
          toast({ title: "Carro excluído", className: "bg-green-600 text-white" });
      } catch (error) {
          console.error("[AdminFleetManager] Erro ao excluir:", error);
          toast({ title: "Erro ao excluir", variant: "destructive" });
      } finally {
          setDeleteConfirmId(null);
      }
  }

  const handleEditPrices = (car) => {
      setSelectedCar(car);
      setIsPricingModalOpen(true);
  };

  const PricingBadge = ({ active, label, color }) => {
      if (!active) return <span className="text-gray-300 text-[10px] px-1 border border-transparent">{label}</span>;
      return <span className={`text-[10px] px-1.5 py-0.5 rounded border ${color} font-bold`}>{label}</span>;
  };

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar frota</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4">
                <button onClick={() => navigate('/admin')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                    Voltar
                </button>
                <button onClick={fetchCars} className="px-4 py-2 bg-[#00D166] text-white rounded-lg hover:bg-[#00F178] font-bold">
                    Tentar Novamente
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50">
      <button 
          onClick={() => navigate('/admin')} 
          className="flex items-center gap-2 text-gray-500 hover:text-[#0E3A2F] mb-6 transition-colors font-medium"
      >
          <ArrowLeft size={20} /> Voltar para Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0E3A2F]">Gestor de Frota</h1>
          <p className="text-gray-500">Controle total de veículos, disponibilidade e preços.</p>
        </div>
        <button onClick={() => navigate('/admin/car/new')} className="bg-[#00D166] text-[#0E3A2F] px-5 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#00F178] shadow-md transition-all">
          <Plus size={20} /> Adicionar Carro
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <div className="relative w-full md:w-80">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input type="text" placeholder="Buscar placa ou modelo..." className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-[#00D166] outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={fetchCars} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Atualizar">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#00D166]" size={40} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0E3A2F] text-white text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Veículo</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Partic.</th>
                  <th className="px-6 py-4 text-center">App</th>
                  <th className="px-6 py-4 text-center">Corp.</th>
                  <th className="px-6 py-4">Tabela de Preços</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {!filteredCars || filteredCars.length === 0 ? (
                   <tr><td colSpan="7" className="text-center py-10 text-gray-500">Nenhum veículo encontrado.</td></tr>
                ) : filteredCars.map(car => {
                  // Initialize pricing object with safe defaults
                  const pricing = car.pricing || {};
                  const particularPricing = pricing.particular || {};
                  const motoristaPricing = pricing.motorista || {};
                  const corporativoPricing = pricing.corporativo || {};

                  // Initialize arrays with defaults
                  const particularDiario = Array.isArray(particularPricing.diario) ? particularPricing.diario : [];
                  const motoristaDiario = Array.isArray(motoristaPricing.diario) ? motoristaPricing.diario : [];
                  const corporativoDiario = Array.isArray(corporativoPricing.diario) ? corporativoPricing.diario : [];

                  // Check if pricing exists for each type
                  const hasPart = particularDiario.length > 0 || (particularPricing.trimestral?.preco_total > 0);
                  const hasMot = motoristaDiario.length > 0 || (motoristaPricing.trimestral?.preco_total > 0);
                  const hasCorp = corporativoDiario.length > 0 || (corporativoPricing.trimestral?.preco_total > 0);

                  // Initialize tipos_aluguel with default empty array
                  const tiposAluguel = Array.isArray(car.tipos_aluguel) ? car.tipos_aluguel : [];

                  return (
                  <tr key={car.id} className={cn("hover:bg-gray-50 transition-colors", !car.disponivel && "bg-gray-50/50")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-14 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200 shadow-sm flex-shrink-0">
                             {car.imagem_url ? (
                                 <img src={car.imagem_url} alt={car.nome} className={cn("w-full h-full object-cover", !car.disponivel && "grayscale opacity-70")} />
                             ) : (
                                 <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={20}/></div>
                             )}
                        </div>
                        <div>
                          <p className={cn("font-bold text-base", car.disponivel ? "text-gray-900" : "text-gray-500")}>{car.nome}</p>
                          <p className="text-xs text-gray-500 font-mono uppercase bg-gray-100 inline-block px-1 rounded">{car.placa}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* New Status Column with Toggle */}
                    <td className="px-6 py-4 text-center">
                        <button 
                            onClick={() => handleToggleGeneralAvailability(car)}
                            disabled={togglingId === car.id}
                            className={cn(
                                "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border w-32 mx-auto",
                                car.disponivel 
                                    ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" 
                                    : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
                                togglingId === car.id && "opacity-70 cursor-wait"
                            )}
                        >
                            {togglingId === car.id ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : car.disponivel ? (
                                <><Check size={12} /> Disponível</>
                            ) : (
                                <><Power size={12} /> Indisponível</>
                            )}
                        </button>
                    </td>

                    <td className="px-6 py-4 text-center">
                       {car.disponivel_particular ? <Check size={18} className="mx-auto text-green-600" /> : <X size={18} className="mx-auto text-red-400" />}
                    </td>
                    <td className="px-6 py-4 text-center">
                       {car.disponivel_motorista ? <Check size={18} className="mx-auto text-green-600" /> : <X size={18} className="mx-auto text-red-400" />}
                    </td>
                    <td className="px-6 py-4 text-center">
                       {car.disponivel_corporativo ? <Check size={18} className="mx-auto text-green-600" /> : <X size={18} className="mx-auto text-red-400" />}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <PricingBadge active={hasPart} label="PART" color="bg-blue-50 text-blue-700 border-blue-200" />
                                <PricingBadge active={hasMot} label="APP" color="bg-green-50 text-green-700 border-green-200" />
                                <PricingBadge active={hasCorp} label="CORP" color="bg-purple-50 text-purple-700 border-purple-200" />
                            </div>
                            <button 
                                onClick={() => handleEditPrices(car)}
                                className="ml-2 text-gray-500 hover:text-[#0E3A2F] p-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs font-bold"
                                title="Editar Preços"
                            >
                                <DollarSign size={14}/> Editar
                            </button>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => navigate(`/admin/car/${car.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Edit2 size={18} /></button>
                          <button onClick={() => setDeleteConfirmId(car.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18} /></button>
                       </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">«</button>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
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
                <button key={item} onClick={() => setCurrentPage(item)} className={`w-9 h-9 rounded-lg border text-sm font-bold transition-colors ${item === currentPage ? 'bg-[#0E3A2F] text-white border-[#0E3A2F]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{item}</button>
              )
            )
          }
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronRight size={18} />
          </button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">»</button>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-full"><Trash2 size={20} className="text-red-600" /></div>
              <h2 className="text-lg font-bold text-gray-800">Excluir veículo</h2>
            </div>
            <p className="text-gray-600 mb-6">Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold">Excluir</button>
            </div>
          </div>
        </div>
      )}

      <CarPricingModal 
      className="w-full max-w-6xl"
        car={selectedCar} 
        isOpen={isPricingModalOpen} 
        onClose={() => {
            setIsPricingModalOpen(false);
            fetchCars();
        }}
      />
    </div>
  );
};

export default AdminFleetManager;