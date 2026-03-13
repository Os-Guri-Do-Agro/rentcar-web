import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { formatarData } from '@/lib/dateUtils';
import { 
    Loader2, ArrowLeft, User, Mail, Phone, Calendar, 
    Star, Edit2, FileText, CheckCircle, Clock, Car, 
    AlertCircle, FileCheck, XCircle, AlertTriangle 
} from 'lucide-react';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, 
    DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { 
    getClienteAvaliacao, 
    updateClienteAvaliacao, 
    getClienteAvaliacaoHistorico,
    getClienteReservas 
} from '@/services/clienteAvaliacaoService';

const AdminDetalhesCliente = () => {
    const { clienteId } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const { toast } = useToast();

    const [cliente, setCliente] = useState(null);
    const [avaliacao, setAvaliacao] = useState(null);
    const [historicoAvaliacao, setHistoricoAvaliacao] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editNota, setEditNota] = useState(5);
    const [editNotasPessoais, setEditNotasPessoais] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [clienteId]);

    const fetchData = async () => {
        setLoading(true);
        console.log(`[AdminDetalhesCliente] Buscando detalhes cliente ${clienteId}`);

        try {
            const { data: clientData, error } = await supabase.from('users').select('*').eq('id', clienteId).single();
            if(error) throw error;
            setCliente(clientData);

            const av = await getClienteAvaliacao(clienteId);
            setAvaliacao(av);
            if (av) {
                setEditNota(av.nota);
                setEditNotasPessoais(av.notas_pessoais || '');
            }

            const hist = await getClienteAvaliacaoHistorico(clienteId);
            setHistoricoAvaliacao(hist);

            const res = await getClienteReservas(clienteId);
            setReservas(res);
            
            // Debug logs for dates and docs
            if (res && res.length > 0) {
                res.forEach(r => {
                    console.log(`[DATAS] Reserva ${r.id.slice(0,6)} - data_retirada: ${r.data_retirada}, data_devolucao: ${r.data_devolucao}`);
                    console.log(`[DOCS] Reserva ${r.id.slice(0,6)} - Documentos: ${r.reserva_documentos?.length || 0}`);
                });
            }

        } catch (error) {
            console.error("Erro ao buscar dados do cliente:", error);
            toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAvaliacao = async () => {
        setSaving(true);
        console.log("Salvando avaliação...");
        const result = await updateClienteAvaliacao(clienteId, editNota, editNotasPessoais, usuario.id);
        
        if (result.success) {
            toast({ title: "Avaliação salva!", className: "bg-green-600 text-white" });
            setEditModalOpen(false);
            fetchData(); // Refresh
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
        setSaving(false);
    };

    const getStatusBadge = (reserva) => {
        const hasDocs = reserva.reserva_documentos && reserva.reserva_documentos.length > 0;
        const status = reserva.status;

        console.log(`[STATUS] Reserva ${reserva.id.slice(0,6)}: ${status}, documentos: ${reserva.reserva_documentos?.length || 0}`);

        if (status === 'cancelada') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                    <XCircle size={12} /> Cancelada
                </span>
            );
        }
        if (status === 'confirmada') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle size={12} /> Confirmada
                </span>
            );
        }
        
        // Custom logic for documents
        if (hasDocs) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                    <FileCheck size={12} /> Documentos Entregues
                </span>
            );
        }

        if (status === 'aguardando_documentos' || status === 'pendente') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Clock size={12} /> Aguardando Docs
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                <AlertTriangle size={12} /> {status}
            </span>
        );
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-[#00D166]" size={48}/></div>;
    if (!cliente) return <div className="p-10 text-center text-gray-500">Cliente não encontrado.</div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <Helmet title={`Admin | ${cliente.nome}`} />
            
            <button onClick={() => navigate('/admin/clientes')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-[#0E3A2F] transition-colors font-medium">
                <ArrowLeft size={20} /> Voltar para lista
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Personal Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
                    <div className="bg-[#0E3A2F] px-6 py-4 flex items-center gap-3">
                        <User className="text-[#00D166]" size={24} />
                        <h2 className="text-white font-bold text-lg">Informações Pessoais</h2>
                    </div>
                    <div className="p-6">
                         <div className="flex items-start gap-6 mb-8">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border-2 border-[#00D166]/20">
                                {cliente.foto_perfil_url ? (
                                    <img src={cliente.foto_perfil_url} alt={cliente.nome} className="w-full h-full object-cover rounded-full"/>
                                ) : (
                                    <User size={40} />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#0E3A2F]">{cliente.nome}</h1>
                                <p className="text-gray-500 text-sm font-mono mt-1">ID: {cliente.id}</p>
                                <div className="flex gap-2 mt-3">
                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                                        Cliente Ativo
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="p-2 bg-white rounded-full shadow-sm"><Mail className="text-[#00D166]" size={18}/></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">E-mail</p>
                                        <p className="text-sm text-gray-700 font-medium">{cliente.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="p-2 bg-white rounded-full shadow-sm"><Phone className="text-[#00D166]" size={18}/></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Telefone</p>
                                        <p className="text-sm text-gray-700 font-medium">{cliente.telefone || 'Não informado'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="p-2 bg-white rounded-full shadow-sm"><FileText className="text-[#00D166]" size={18}/></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">CPF</p>
                                        <p className="text-sm text-gray-700 font-medium font-mono">{cliente.cpf || 'Não informado'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="p-2 bg-white rounded-full shadow-sm"><Calendar className="text-[#00D166]" size={18}/></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Membro Desde</p>
                                        <p className="text-sm text-gray-700 font-medium">{formatarData(cliente.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evaluation Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                    <div className="bg-[#0E3A2F] px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Star className="text-yellow-400 fill-yellow-400" size={24}/> 
                            <h2 className="text-white font-bold text-lg">Avaliação</h2>
                        </div>
                        <button 
                            onClick={() => setEditModalOpen(true)} 
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
                            title="Editar Avaliação"
                        >
                            <Edit2 size={16}/>
                        </button>
                    </div>

                    <div className="p-6">
                        {avaliacao ? (
                            <div className="text-center">
                                <div className="text-5xl font-bold text-[#0E3A2F] mb-2">{avaliacao.nota}<span className="text-xl text-gray-400">/5</span></div>
                                <div className="flex justify-center gap-1 mb-6">
                                    {[1,2,3,4,5].map(star => (
                                        <Star key={star} size={24} className={star <= avaliacao.nota ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                                    ))}
                                </div>
                                
                                {avaliacao.notas_pessoais && (
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-left">
                                        <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Observações Internas</p>
                                        <p className="text-sm text-gray-700 italic">"{avaliacao.notas_pessoais}"</p>
                                    </div>
                                )}
                                
                                <p className="text-xs text-gray-400 mt-4 border-t pt-4">
                                    Última atualização: {formatarData(avaliacao.atualizado_em)}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Star className="mx-auto text-gray-200 mb-3" size={48} />
                                <p className="text-gray-500 mb-4">Este cliente ainda não possui avaliação.</p>
                                <button 
                                    onClick={() => setEditModalOpen(true)} 
                                    className="px-4 py-2 bg-[#0E3A2F] text-white rounded-lg text-sm font-bold hover:bg-[#165945] transition-colors"
                                >
                                    Adicionar Avaliação
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reservation History - Full Width */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                         <div className="flex items-center gap-3">
                             <Car className="text-[#0E3A2F]" size={24} />
                             <h2 className="text-[#0E3A2F] font-bold text-lg">Histórico de Reservas</h2>
                         </div>
                         <span className="bg-[#0E3A2F] text-white text-xs font-bold px-3 py-1 rounded-full">{reservas.length} total</span>
                    </div>

                    {reservas.length === 0 ? (
                        <div className="p-12 text-center">
                            <Car className="mx-auto text-gray-200 mb-3" size={48} />
                            <p className="text-gray-500">Nenhuma reserva encontrada para este cliente.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID / Data</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Veículo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Período</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Valor</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Docs</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reservas.map(res => {
                                        const docCount = res.reserva_documentos?.length || 0;
                                        return (
                                            <tr key={res.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-xs text-gray-500 block mb-1">#{res.id.slice(0,6)}</span>
                                                    <span className="text-xs text-gray-400">{formatarData(res.created_at).split(' ')[0]}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-[#0E3A2F]">{res.cars?.marca} {res.cars?.nome}</div>
                                                    <div className="text-xs text-gray-500">{res.cars?.cor} • {res.cars?.ano}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="whitespace-nowrap">Ret: {formatarData(res.data_retirada)}</span>
                                                        <span className="whitespace-nowrap">Dev: {formatarData(res.data_devolucao)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-[#00D166] whitespace-nowrap">
                                                    R$ {parseFloat(res.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${docCount > 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                                        <FileText size={12} />
                                                        {docCount}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(res)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => navigate(`/admin/reserva/${res.id}`)} 
                                                        className="text-[#0E3A2F] hover:text-[#00D166] font-bold text-sm transition-colors"
                                                    >
                                                        Ver Detalhes
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Rating History Log (if exists) */}
                {historicoAvaliacao.length > 0 && (
                    <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-[#0E3A2F] mb-6 flex items-center gap-2"><Clock size={20} className="text-[#00D166]"/> Histórico de Alterações na Avaliação</h2>
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {historicoAvaliacao.map(hist => (
                                <div key={hist.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-[#00D166] text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                                        <Edit2 size={16} />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex flex-col sm:flex-row justify-between mb-1">
                                            <div className="font-bold text-gray-900 text-sm">Nota alterada: <span className="text-gray-400">{hist.nota_anterior || '-'}</span> <ArrowLeft size={12} className="inline rotate-180 mx-1"/> <span className="text-[#0E3A2F] text-lg">{hist.nota_nova}</span></div>
                                            <time className="font-caveat font-medium text-xs text-indigo-500">{formatarData(hist.atualizado_em)}</time>
                                        </div>
                                        {hist.notas_novas && <p className="text-gray-500 text-xs italic bg-gray-50 p-2 rounded">"{hist.notas_novas}"</p>}
                                        <div className="mt-2 text-xs text-gray-400">Por: {hist.updated_by?.nome || 'Admin'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[#0E3A2F] flex items-center gap-2"><Star className="fill-[#00D166] text-[#00D166]" /> Editar Avaliação</DialogTitle>
                        <DialogDescription>Classifique o cliente e adicione notas internas importantes.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-6 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Classificação (1-5)</label>
                            <div className="flex gap-3 justify-center">
                                {[1,2,3,4,5].map(star => (
                                    <button 
                                        key={star} 
                                        onClick={() => setEditNota(star)}
                                        className="transition-all hover:scale-125 focus:outline-none"
                                    >
                                        <Star size={36} className={`transition-colors ${star <= editNota ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" : "text-gray-200"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Notas Internas</label>
                            <textarea 
                                className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-[#00D166] focus:border-transparent outline-none transition-all resize-none text-sm" 
                                placeholder="Descreva o comportamento, pontualidade, cuidados com o carro, etc..."
                                value={editNotasPessoais}
                                onChange={e => setEditNotasPessoais(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <button 
                            onClick={() => setEditModalOpen(false)} 
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSaveAvaliacao} 
                            disabled={saving} 
                            className="px-6 py-2 bg-[#0E3A2F] text-white rounded-lg font-bold flex gap-2 items-center hover:bg-[#165945] transition-all disabled:opacity-70 shadow-lg shadow-[#0E3A2F]/20"
                        >
                            {saving && <Loader2 className="animate-spin" size={18}/>} Salvar Avaliação
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDetalhesCliente;