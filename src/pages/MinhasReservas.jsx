import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import reservasServices from '@/services/reservas/reservas-services';

const MinhasReservas = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuario) {
      fetchReservas();
      const sub = supabase.channel(`my_reservas_${usuario.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas', filter: `usuario_id=eq.${usuario.id}` }, () => {
            fetchReservas();
        })
        .subscribe();
      return () => sub.unsubscribe();
    }
  }, [usuario]);

  const fetchReservas = async () => {
    try {
      const res = await reservasServices.getMyReservas();
      setReservas(res.data || []);
    } catch (error) {
      console.error("[MINHAS_RESERVAS] Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#0E3A2F]" size={40} /></div>;

  return (
    <>
      <Helmet title="Minhas Reservas | JL Rent a Car" />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#0E3A2F] mb-8 flex items-center gap-3">
             <Calendar className="text-[#00D166]" /> Minhas Reservas
          </h1>

          {reservas.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
               <p className="text-gray-500 mb-6">Você ainda não tem reservas.</p>
               <button onClick={() => navigate('/frota')} className="bg-[#0E3A2F] text-white px-6 py-3 rounded-lg font-bold">Ver Frota</button>
            </div>
          ) : (
            <div className="space-y-4">
               {reservas.map((reserva) => (
                 <div 
                    key={reserva.id} 
                    onClick={() => navigate(`/reserva/${reserva.id}`)}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                 >
                    <div className="flex justify-between items-center">
                        <div>
                             <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(reserva.status)}`}>
                                   {reserva.status.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-gray-400">#{reserva.id.slice(0,8)}</span>
                             </div>
                             <h3 className="text-lg font-bold text-[#0E3A2F]">{reserva.cars?.marca} {reserva.cars?.nome}</h3>
                             <p className="text-sm text-gray-500 mt-1">
                                {new Date(reserva.data_retirada).toLocaleDateString()} - {new Date(reserva.data_devolucao).toLocaleDateString()}
                             </p>
                        </div>
                        <ChevronRight className="text-gray-300" />
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MinhasReservas;