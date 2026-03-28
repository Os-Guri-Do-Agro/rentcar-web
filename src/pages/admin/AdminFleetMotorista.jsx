import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import carService from '@/services/cars/carService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const AdminFleetMotorista = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const { toast } = useToast();

  const fetchCars = async () => {
    try {
      const res = await carService.getCars('false', '*');
      const data = (res?.data ?? res ?? []).filter(c => c.tipo_frota === 'motorista');
      setCars(data);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao buscar frota de motoristas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    try {
      await carService.deleteCarById(deleteConfirmId);
      setCars(cars.filter(c => c.id !== deleteConfirmId));
      toast({ title: "Carro excluído", className: "bg-green-600 text-white border-none" });
    } catch (e) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0E3A2F]">Frota Motorista App</h1>
          <p className="text-gray-500">Veículos destinados a Uber/99.</p>
        </div>
        <Link to="/admin/car/new" className="bg-[#00D166] text-[#0E3A2F] font-bold px-4 py-2 rounded-lg hover:bg-[#00F178] transition flex items-center gap-2 shadow-md">
          <Plus size={20} /> Novo Carro
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#00D166]" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map(car => (
            <div key={car.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 group">
              <img src={car.imagem_url} alt={car.nome} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{car.nome}</h3>
                <p className="text-sm text-gray-500">{car.categoria} • {car.placa}</p>
                <div className="mt-4 flex justify-between items-center">
                   <Link to={`/admin/car/${car.id}`} className="text-blue-600 hover:underline flex items-center gap-1"><Edit2 size={16}/> Editar</Link>
                   <button onClick={() => handleDelete(car.id)} className="text-red-600 hover:underline flex items-center gap-1"><Trash2 size={16}/> Excluir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFleetMotorista;