import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import carService from '@/services/cars/carService';

const AdminFleetParticular = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('tipo_frota', 'particular')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCars(data);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao buscar frota particular.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
    const channel = supabase
      .channel('admin-cars-particular')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cars', filter: "tipo_frota=eq.particular" }, () => {
        fetchCars();
        toast({ title: "Atualizado", description: "Lista atualizada em tempo real." });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir este veículo?")) return;
    try {
      await carService.deleteCarById(id);
      setCars(cars.filter(c => c.id !== id));
      toast({ title: "Carro excluído" });
    } catch (e) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0E3A2F]">Frota Particular</h1>
          <p className="text-gray-500">Veículos destinados a uso particular.</p>
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

export default AdminFleetParticular;