import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, Send, FileText, Loader2 } from 'lucide-react';
import { getAdminConfigs } from '@/services/adminService';
import { generateWhatsAppMessage, generateWhatsAppURL } from '@/lib/whatsappUtils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import DocumentosDisplay from '@/components/DocumentosDisplay';
import reservasServices from '@/services/reservas/reservas-services';

const ReservationConfirmation = () => {
  const { reservaId } = useParams();
  const [reservation, setReservation] = useState(null);
  const [configs, setConfigs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reservaData, configsData] = await Promise.all([reservasServices.getReservasById(reservaId), getAdminConfigs()]);
      
      const reserva = reservaData?.data ?? reservaData;
      if (!reserva) throw new Error("Reserva não encontrada");

      setReservation(reserva);
      setConfigs(configsData);
      
    } catch (err) {
      setError(err.message || "Erro ao carregar dados da reserva.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservationData(); }, [reservaId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-[#00D166] mb-4" size={48} /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center p-4 text-center"><div><p className="text-red-600 mb-4">{error}</p><button onClick={fetchReservationData} className="underline text-blue-600">Tentar Novamente</button></div></div>;

  const car = reservation?.cars;
  const whatsappNumber = configs?.whatsapp_numero || '5511999999999';
  const whatsappUrl = generateWhatsAppURL(whatsappNumber, generateWhatsAppMessage(car, reservation, reservation.users, 'Particular'));
  
  const docs = (reservation.reserva_documentos || []).map(doc => ({
    id: doc.id,
    tipo: doc.tipo_documento,
    nome: doc.arquivo_nome,
    tamanho: doc.arquivo_tamanho,
    url: doc.url_documento,
    data_upload: doc.created_at,
  }));

  return (
    <>
      <Helmet><title>Confirmação de Reserva - JL RENT A CAR</title></Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center mb-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="text-[#00D166]" size={40} /></motion.div>
            <h1 className="text-3xl font-bold text-[#0E3A2F]">Reserva Pré-Agendada!</h1>
            <p className="text-gray-600 mt-2">Sua solicitação foi registrada com sucesso e os documentos estão em análise.</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-[#0E3A2F] px-6 py-4 flex justify-between items-center"><h3 className="text-white font-bold">Resumo #{reservation.id.slice(0, 8)}</h3><span className="bg-[#00D166] text-[#0E3A2F] text-xs font-bold px-3 py-1 rounded-full uppercase">{reservation.status}</span></div>
                
                <div className="p-6">
                  {/* ... Car Details ... */}
                  <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
                    <img src={car.imagem_url} alt={car.nome} className="w-full sm:w-32 h-24 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-1 space-y-2">
                       <h4 className="text-xl font-bold text-gray-900">{car.nome}</h4>
                       <p className="text-sm text-gray-500">{car.categoria}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-gray-500">Valor Total</p>
                       <p className="text-2xl font-bold text-[#00D166]">{parseFloat(reservation.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                  </div>

                  {/* Period & Times */}
                  <div className="border-t border-gray-100 pt-5 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-1">Retirada</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(reservation.data_retirada).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        às {reservation.hora_retirada_solicitada || '—'}
                        {reservation.hora_retirada && reservation.hora_retirada !== reservation.hora_retirada_solicitada && (
                          <span className="ml-1 text-amber-600">(confirmado: {reservation.hora_retirada})</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-1">Devolução</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(reservation.data_devolucao).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500">às {reservation.hora_devolucao || '—'}</p>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="border-t border-gray-100 pt-6 mt-6">
                      <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2"><FileText size={16}/> Documentos Enviados</h4>
                      <DocumentosDisplay documentos={docs} reservaId={reservation.id} />
                  </div>

                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl shadow-lg p-6 sticky top-8 border-t-4 border-[#00D166]">
                <h3 className="text-lg font-bold text-[#0E3A2F] mb-4">Falar com Atendente</h3>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#00D166] text-[#0E3A2F] font-bold py-4 rounded-lg hover:bg-[#00F178] shadow-md mb-4"><Send size={20} /> Enviar no WhatsApp</a>
              </motion.div>
            </div>
        </div>
      </div>
    </>
  );
};

export default ReservationConfirmation;