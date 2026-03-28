import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import reservasServices from '@/services/reservas/reservas-services';

const MinhasReservas = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuario) fetchReservas();
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

  const STATUS_CONFIG = {
    pendente:   { label: 'Pendente',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    aceita:     { label: 'Aprovada',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
    confirmada: { label: 'Confirmada', color: 'bg-green-100 text-green-700 border-green-200' },
    cancelada:  { label: 'Cancelada',  color: 'bg-red-100 text-red-700 border-red-200' },
  };

  const getStatusCfg = (status) => STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };

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
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-2">
                                {(() => {
                                  const cfg = getStatusCfg(reserva.status);
                                  return (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${cfg.color}`}>
                                      {cfg.label}
                                    </span>
                                  );
                                })()}
                                <span className="text-xs text-gray-400">#{reserva.id.slice(0, 8)}</span>
                             </div>
                             <h3 className="text-lg font-bold text-[#0E3A2F]">{reserva.cars?.marca} {reserva.cars?.nome}</h3>
                             <p className="text-sm text-gray-500 mt-1">
                                {new Date(reserva.data_retirada).toLocaleDateString('pt-BR')} às {reserva.hora_retirada || <span className="italic">a definir</span>}
                                {' — '}
                                {new Date(reserva.data_devolucao).toLocaleDateString('pt-BR')} às {reserva.hora_devolucao || <span className="italic">a definir</span>}
                             </p>
                             {reserva.hora_retirada_solicitada && reserva.hora_retirada && reserva.hora_retirada !== reserva.hora_retirada_solicitada && (
                               <p className="text-xs text-amber-600 mt-1">
                                 ⚠ Horário alterado: você pediu {reserva.hora_retirada_solicitada}, confirmado {reserva.hora_retirada}
                               </p>
                             )}
                        </div>
                        <ChevronRight className="text-gray-300 shrink-0" />
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