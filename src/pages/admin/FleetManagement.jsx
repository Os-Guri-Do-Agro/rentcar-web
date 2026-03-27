import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import carService from '@/services/cars/carService';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const FleetManagement = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const { toast } = useToast();

  const loadCars = async () => {
    try {
      const res = await carService.getCars('false', ''); // Fetch all, including unavailable
      setCars(res?.data ?? res ?? []);
    } catch (error) {
      toast({ title: "Erro ao carregar frota", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    try {
      await carService.deleteCarById(deleteConfirmId);
      setCars(cars.filter(c => c.id !== deleteConfirmId));
      toast({ title: "Veículo excluído com sucesso", className: "bg-green-600 text-white border-none" });
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const toggleAvailability = async (car) => {
    try {
      const res = await carService.patchCarById(car.id, { disponivel: !car.disponivel });
      const updated = res?.data ?? res;
      setCars(cars.map(c => c.id === car.id ? updated : c));
      toast({ title: `Veículo ${!car.disponivel ? 'ativado' : 'desativado'}`, className: "bg-green-600 text-white border-none" });
    } catch (error) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div>
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir veículo?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O veículo será removido permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0E3A2F]">Gestão de Frota</h1>
        <Link 
          to="/admin/car/new" 
          className="bg-[#00D166] hover:bg-[#00b355] text-[#0E3A2F] px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Novo Veículo
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold">Veículo</th>
                <th className="p-4 font-semibold">Categoria</th>
                <th className="p-4 font-semibold">Placa</th>
                <th className="p-4 font-semibold">Preço/Dia</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={car.imagem_url} alt={car.nome} className="w-12 h-12 object-cover rounded-md" />
                      <div>
                        <p className="font-bold text-gray-900">{car.nome}</p>
                        <p className="text-xs text-gray-500">{car.ano}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{car.categoria}</td>
                  <td className="p-4 font-mono text-sm">{car.placa}</td>
                  <td className="p-4 font-bold text-[#0E3A2F]">R$ {car.preco_diaria}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleAvailability(car)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        car.disponivel 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {car.disponivel ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {car.disponivel ? 'Disponível' : 'Indisponível'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/admin/car/${car.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(car.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FleetManagement;