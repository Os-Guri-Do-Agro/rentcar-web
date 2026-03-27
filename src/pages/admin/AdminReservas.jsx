import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Search, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import reservasService from '@/services/reservas/reservas-services';
import { logAdminDebug } from '@/lib/debugUtils';

const AdminReservas = () => {
    const navigate = useNavigate();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); 
    const [search, setSearch] = useState('');
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    
    useEffect(() => {
        fetchReservas();
        const sub = supabase.channel('admin_reservas_list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, () => {
                logAdminDebug("Realtime change detected, refreshing...");
                fetchReservas();
            })
            .subscribe();
        return () => { sub.unsubscribe(); };
    }, []); 

    const fetchReservas = async () => {
        if (isFetching) return;
        setIsFetching(true);
        setLoading(true);
        setError(null);
        
        logAdminDebug("Fetching reservas attempt:", retryCount + 1);
        
        try {
            // Using service method with explicit foreign keys
            const res = await reservasService.getReservas();
            const data = res?.data ?? res;

            if (Array.isArray(data)) {
                setReservas(data);
                logAdminDebug("Fetched records:", data.length);
            } else {
                throw new Error("Dados inválidos retornados (não é array)");
            }

        } catch (err) {
            logAdminDebug("Error fetching reservas:", err);
            if (retryCount < 3) {
                console.log(`Retrying... (${retryCount + 1}/3)`);
                setRetryCount(prev => prev + 1);
                setTimeout(() => { setIsFetching(false); fetchReservas(); }, 1000 * (retryCount + 1));
                return;
            } else {
                setError(`Erro ao carregar reservas: ${err.message}`);
            }
        } finally {
            setLoading(false);
            setIsFetching(false);
        }
    };

    const handleRetry = () => { setRetryCount(0); fetchReservas(); };

    const filteredReservas = reservas.filter(r => {
        const idMatch = r.id?.toLowerCase().includes(search.toLowerCase());
        const userMatch = r.users?.nome?.toLowerCase().includes(search.toLowerCase()) || r.users?.email?.toLowerCase().includes(search.toLowerCase());
        const matchesSearch = idMatch || userMatch;
        const matchesFilter = filter === 'all' 
            ? true 
            : (filter === 'pendente' 
                ? (r.status === 'pendente' || r.status === 'aguardando_aprovacao' || r.status === 'pendente_documentos')
                : r.status === filter);
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-100';
        if (status === 'confirmada' || status === 'aprovada') return 'bg-green-100 text-green-700';
        if (status === 'cancelada' || status === 'recusada') return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-[#0E3A2F] mb-2">Gestão de Reservas</h1>
            <div className="flex flex-col xl:flex-row justify-between items-start gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative w-full xl:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:border-[#0E3A2F]" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'pendente', 'confirmada', 'cancelada'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${filter === f ? 'bg-[#0E3A2F] text-white' : 'bg-gray-100 text-gray-600'}`}>{f === 'all' ? 'Todas' : f}</button>
                    ))}
                    <button onClick={handleRetry} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200" title="Atualizar"><RefreshCw size={16}/></button>
                </div>
            </div>
            {error ? (
                <div className="bg-red-50 p-8 rounded-xl text-center border border-red-100">
                    <AlertTriangle className="mx-auto text-red-500 mb-2" size={32}/>
                    <h3 className="font-bold text-red-800 mb-1">Erro ao carregar dados</h3>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <button onClick={handleRetry} className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-bold text-sm hover:bg-red-200">Tentar Novamente</button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 text-sm font-bold text-gray-600">Reserva</th>
                                    <th className="p-4 text-sm font-bold text-gray-600">Cliente</th>
                                    <th className="p-4 text-sm font-bold text-gray-600">Veículo</th>
                                    <th className="p-4 text-sm font-bold text-gray-600">Status</th>
                                    <th className="p-4 text-right text-sm font-bold text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (<tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-[#0E3A2F]"/></td></tr>) : filteredReservas.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">Nenhuma reserva encontrada.</td></tr>
                                ) : (
                                    filteredReservas.map(reserva => (
                                        <tr key={reserva.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4"><span className="font-mono text-xs text-gray-400">#{reserva.id.slice(0,8)}</span><div className="font-bold text-[#0E3A2F] text-sm">{new Date(reserva.created_at).toLocaleDateString()}</div></td>
                                            <td className="p-4"><div className="font-medium text-sm text-gray-900">{reserva.users?.nome || 'Cliente não identificado'}</div><div className="text-xs text-gray-500">{reserva.users?.email}</div></td>
                                            <td className="p-4"><div className="font-medium text-sm text-gray-900">{reserva.cars?.marca} {reserva.cars?.nome}</div><div className="text-xs text-gray-500">{reserva.cars?.placa || 'Sem placa'}</div></td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(reserva.status)}`}>{reserva.status ? reserva.status.replace('_', ' ') : 'Desconhecido'}</span></td>
                                            <td className="p-4 text-right"><button onClick={() => navigate(`/admin/reserva/${reserva.id}`)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-[#0E3A2F] hover:text-white transition-all" title="Ver Detalhes"><Eye size={18}/></button></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReservas;