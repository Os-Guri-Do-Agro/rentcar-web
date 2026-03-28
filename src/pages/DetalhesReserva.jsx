import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2, ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import DocumentosDisplay from '@/components/DocumentosDisplay';
import reservasServices from '@/services/reservas/reservas-services';

const DetalhesReserva = () => {
  const { reservaId } = useParams();
  const navigate = useNavigate();
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [reservaId]);

  const fetchData = async () => {
    try {
        const data = await reservasServices.getReservasById(reservaId);
        setReserva(data.data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={40}/></div>;
  if (!reserva) return <div className="p-10 text-center">Reserva não encontrada.</div>;

  const docs = (reserva.reserva_documentos || []).map(doc => ({
    id: doc.id,
    tipo: doc.tipo_documento,
    nome: doc.arquivo_nome,
    tamanho: doc.arquivo_tamanho,
    url: doc.url_documento,
    data_upload: doc.created_at,
  }));

  return (
    <>
      <Helmet title={`Reserva #${reservaId.slice(0,8)}`} />
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">
           <button onClick={() => navigate('/minhas-reservas')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-[#0E3A2F]"><ArrowLeft size={18} /> Voltar</button>

           <div className="bg-white rounded-2xl p-8 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                   <h1 className="text-2xl font-bold text-[#0E3A2F]">Detalhes da Reserva</h1>
                   <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase border ${
                     reserva.status === 'confirmada' ? 'bg-green-100 text-green-700 border-green-200' :
                     reserva.status === 'aceita'     ? 'bg-blue-100 text-blue-700 border-blue-200' :
                     reserva.status === 'cancelada'  ? 'bg-red-100 text-red-700 border-red-200' :
                                                       'bg-yellow-100 text-yellow-700 border-yellow-200'
                   }`}>
                     {reserva.status === 'aceita' ? 'Aprovada' : reserva.status}
                   </span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div>
                       <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Veículo</h3>
                       <div className="bg-gray-50 p-4 rounded-xl">
                            {reserva.cars && (
                                <>
                                    <p className="font-bold text-lg text-[#0E3A2F]">{reserva.cars.marca} {reserva.cars.nome}</p>
                                    <p className="text-gray-500">{reserva.cars.placa}</p>
                                </>
                            )}
                       </div>
                   </div>
                   <div>
                       <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Período</h3>
                       <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Retirada:</span>
                              <span className="text-right">
                                <b>{new Date(reserva.data_retirada).toLocaleDateString('pt-BR')}</b>
                                <span className="ml-1 text-gray-500">às {reserva.hora_retirada_solicitada || <span className="italic">a definir</span>}</span>
                              </span>
                            </div>
                            {reserva.hora_retirada_solicitada && reserva.hora_retirada && reserva.hora_retirada !== reserva.hora_retirada_solicitada && (
                              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                                <AlertTriangle size={12} />
                                Você pediu {reserva.hora_retirada_solicitada}, confirmado {reserva.hora_retirada}
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span>Devolução:</span>
                              <span className="text-right">
                                <b>{new Date(reserva.data_devolucao).toLocaleDateString('pt-BR')}</b>
                                <span className="ml-1 text-gray-500">às {reserva.hora_devolucao || <span className="italic">a definir</span>}</span>
                              </span>
                            </div>
                       </div>
                   </div>
               </div>

               <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                   <FileText size={18} /> Documentação
               </h3>
               
               <DocumentosDisplay documentos={docs} reservaId={reserva.id} />

               <div className="mt-8 pt-6 border-t flex justify-between items-center">
                   <span className="text-gray-500 font-bold">Valor Total</span>
                   <span className="text-2xl font-bold text-[#00D166]">R$ {parseFloat(reserva.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
               </div>
           </div>
        </div>
      </div>
    </>
  );
};

export default DetalhesReserva;