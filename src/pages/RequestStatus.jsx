import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2, CheckCircle, Clock, XCircle, FileText, ArrowLeft } from 'lucide-react';

const RequestStatus = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (!request) return <div className="text-center py-20">Solicitação não encontrada.</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aprovado': return 'text-green-600 bg-green-100';
      case 'Rejeitado': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Aprovado': return <CheckCircle size={32} />;
      case 'Rejeitado': return <XCircle size={32} />;
      default: return <Clock size={32} />;
    }
  };

  return (
    <>
      <Helmet><title>Status da Solicitação - JL RENT A CAR</title></Helmet>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to="/frota" className="inline-flex items-center gap-2 text-gray-500 mb-6 hover:text-[#0E3A2F]">
           <ArrowLeft size={16} /> Voltar
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
           <div className="p-8 text-center border-b border-gray-100">
              <div className={`inline-flex items-center justify-center p-4 rounded-full mb-4 ${getStatusColor(request.status)}`}>
                 {getStatusIcon(request.status)}
              </div>
              <h1 className="text-2xl font-bold text-[#0E3A2F] mb-2">{request.status}</h1>
              <p className="text-gray-500">Protocolo: <span className="font-mono font-bold">{request.numero_protocolo}</span></p>
           </div>

           <div className="p-8 space-y-6">
              <div>
                 <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Veículo Solicitado</h3>
                 <div className="flex items-center gap-4">
                    <img src={request.cars?.imagem_url} alt="Car" className="w-16 h-16 rounded-md object-cover" />
                    <p className="font-bold text-lg">{request.cars?.nome}</p>
                 </div>
              </div>

              <div>
                 <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Detalhes</h3>
                 <p>Tipo: <span className="font-medium capitalize">{request.tipo_locacao}</span></p>
                 <p>Data: <span className="font-medium">{new Date(request.created_at).toLocaleDateString()}</span></p>
              </div>

              <div>
                 <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Documentos Enviados</h3>
                 <div className="grid grid-cols-2 gap-2">
                    {Object.entries(request.documentos_enviados || {}).map(([key, url]) => (
                       <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          <FileText size={14} /> {key.toUpperCase()}
                       </a>
                    ))}
                 </div>
              </div>

              {request.status === 'Pendente' && (
                 <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
                    Sua análise está em andamento. O prazo médio é de 1 dia útil. Entraremos em contato via WhatsApp.
                 </div>
              )}
           </div>
        </div>
      </div>
    </>
  );
};

export default RequestStatus;