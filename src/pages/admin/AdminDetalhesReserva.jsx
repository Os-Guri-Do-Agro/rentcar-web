import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { formatarData } from '@/lib/dateUtils';
import { Loader2, ArrowLeft, User, Mail, Phone, FileText, Car, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import DocumentosDisplay from '@/components/DocumentosDisplay';
import WhatsAppPanel from '@/components/WhatsAppPanel';
import reservasServices from '@/services/reservas/reservas-services';
import documentosService from '@/services/reservas/documentos/documentos-service';

const AdminDetalhesReserva = () => {
    const { reservaId } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const { toast } = useToast();
    
    const [reserva, setReserva] = useState(null);
    const [documentos, setDocumentos] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [reason, setReason] = useState('');
    const [modals, setModals] = useState({ confirmReserva: false, rejectReserva: false });

    useEffect(() => {
        fetchData();
    }, [reservaId]);

    const fetchData = async () => {
        try {
            const [resData, histData, docsData] = await Promise.all([
                reservasServices.getReservasById(reservaId),
                reservasServices.getHostoryReserva(reservaId),
                documentosService.getDocumentosByReservaId(reservaId),
            ]);
            setReserva(resData?.reserva ?? resData?.data ?? resData);
            setHistorico(histData?.data ?? []);
            setDocumentos(docsData?.data?.documentos ?? []);
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao carregar detalhes.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (actionType) => {
        setProcessing(true);
        try {
            const actions = {
                confirmReserva: () => reservasServices.postConfirmReserva(reservaId),
                rejectReserva: () => reservasServices.postRejectReserva(reservaId, { motivo: reason, adminId: usuario.id }),
            };
            await actions[actionType]();
            toast({ title: "Sucesso", description: "Operação realizada.", className: "bg-green-600 text-white" });
            setModals({ confirmReserva: false, rejectReserva: false });
            fetchData();
        } catch (error) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status) => {
        if (status === 'confirmada') return 'bg-green-100 text-green-800 border-green-200';
        if (status === 'cancelada') return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-[#0E3A2F]" size={48} /></div>;
    if (!reserva) return <div className="p-10 text-center">Reserva não encontrada.</div>;



    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet title={`Admin | Reserva #${reserva.id?.slice(0,8)}`} />
            
            <div className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/reservas')} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">Reserva #{reserva.id?.slice(0,8)} <span className={`text-xs px-2 py-0.5 rounded border uppercase ${getStatusColor(reserva.status)}`}>{reserva.status?.replace('_', ' ')}</span></h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    {(reserva.status === 'pendente' || reserva.status === 'aguardando_aprovacao') && <button onClick={() => setModals(p => ({...p, confirmReserva: true}))} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 text-sm"><CheckCircle size={16} /> Confirmar</button>}
                    {reserva.status !== 'cancelada' && <button onClick={() => setModals(p => ({...p, rejectReserva: true}))} className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200 text-sm"><XCircle size={16} /> Cancelar</button>}

                </div>
            </div>

            <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="space-y-6 xl:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-[#0E3A2F] mb-4 flex items-center gap-2"><User size={20} className="text-[#00D166]" /> Dados do Cliente</h2>
                            <div className="space-y-3">
                                <p className="font-bold text-gray-900">{reserva.users?.nome}</p>
                                <div className="text-sm text-gray-600"><Mail size={14} className="inline mr-2"/> {reserva.users?.email}</div>
                                <div className="text-sm text-gray-600"><Phone size={14} className="inline mr-2"/> {reserva.users?.telefone || 'Não informado'}</div>
                                <div className="text-sm text-gray-600"><FileText size={14} className="inline mr-2"/> CPF: {reserva.users?.cpf || 'Não informado'}</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-[#0E3A2F] mb-4 flex items-center gap-2"><Car size={20} className="text-[#00D166]" /> Veículo</h2>
                            <div className="flex gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {reserva.cars?.imagem_url ? <img src={reserva.cars.imagem_url} alt="Car" className="w-full h-full object-cover" /> : <Car size={32} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{reserva.cars?.nome}</h3>
                                    <p className="text-gray-500 text-sm">{reserva.cars?.placa || 'Sem Placa'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-[#0E3A2F] mb-6 flex items-center gap-2 border-b pb-4"><FileText size={20} className="text-[#00D166]" /> DOCUMENTOS DA RESERVA</h2>
                        <DocumentosDisplay documentos={documentos} />
                    </div>
                </div>

                <div className="xl:col-span-1 space-y-6">
                    <WhatsAppPanel telefone={reserva.users?.telefone} reserva={reserva} />

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-[#0E3A2F] mb-6 flex items-center gap-2"><Clock size={20} className="text-[#00D166]" /> Histórico</h2>
                        <div className="space-y-6 border-l border-gray-200 pl-6">
                            {historico.length === 0 && <p className="text-sm text-gray-400">Nenhum histórico encontrado.</p>}
                            {historico.map((item) => (
                                <div key={item.id} className="relative">
                                    <div className="absolute -left-[29px] w-3 h-3 rounded-full bg-gray-300 border-2 border-white"></div>
                                    <p className="text-sm font-bold text-gray-800">{item.status_anterior} → {item.status_novo}</p>
                                    {item.motivo && <p className="text-xs text-gray-600 italic">{item.motivo}</p>}
                                    <p className="text-xs text-gray-400">{formatarData(item.criado_em)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={modals.confirmReserva} onOpenChange={(open) => !open && setModals(p => ({...p, confirmReserva: false}))}><DialogContent><DialogHeader><DialogTitle>Confirmar</DialogTitle><DialogDescription>Deseja confirmar?</DialogDescription></DialogHeader><DialogFooter><button onClick={() => setModals(p => ({...p, confirmReserva: false}))} className="px-4 py-2 text-gray-600">Cancelar</button><button onClick={() => handleAction('confirmReserva')} disabled={processing} className="px-4 py-2 bg-green-600 text-white rounded font-bold">{processing && <Loader2 className="animate-spin" size={16}/>} Confirmar</button></DialogFooter></DialogContent></Dialog>
            <Dialog open={modals.rejectReserva} onOpenChange={(open) => !open && setModals(p => ({...p, rejectReserva: false}))}><DialogContent><DialogHeader><DialogTitle>Cancelar</DialogTitle></DialogHeader><textarea className="w-full border rounded p-3 h-24 mt-2" placeholder="Motivo..." value={reason} onChange={e => setReason(e.target.value)} /><DialogFooter className="mt-4"><button onClick={() => setModals(p => ({...p, rejectReserva: false}))} className="px-4 py-2 text-gray-600">Voltar</button><button onClick={() => handleAction('rejectReserva')} disabled={processing || !reason} className="px-4 py-2 bg-red-600 text-white rounded font-bold">{processing && <Loader2 className="animate-spin" size={16}/>} Cancelar</button></DialogFooter></DialogContent></Dialog>

        </div>
    );
};

export default AdminDetalhesReserva;