import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Mail, MessageSquare, CheckCircle, XCircle, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import whatsappService from '@/services/whatsapp/whatsapp-service';

const AdminLogs = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;
  const { toast } = useToast();

  const fetchLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      if (activeTab === 'whatsapp') {
        const res = await whatsappService.getLogs(page + 1, PAGE_SIZE, search || undefined);
        const records = res?.data?.logs ?? res?.data ?? res?.logs ?? [];
        const total = res?.data?.total ?? res?.total ?? records.length;
        setLogs(records);
        setTotalCount(total);
      } else {
        let query = supabase
          .from('email_logs')
          .select('*', { count: 'exact' });

        if (search) {
          query = query.or(`destinatario.ilike.%${search}%,assunto.ilike.%${search}%`);
        }

        query = query
          .order('created_at', { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        setLogs(data);
        setTotalCount(count);
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao buscar logs.", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (page === 0) fetchLogs();
        else setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-[#0E3A2F]">Logs do Sistema</h1>
            <p className="text-sm text-gray-500">Histórico de comunicações enviadas.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar destinatário..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00D166] outline-none"
                />
            </div>
            <button 
                onClick={() => fetchLogs(true)} 
                disabled={refreshing}
                className="p-2 bg-white rounded-lg border hover:bg-gray-50 text-gray-600 shadow-sm"
            >
                <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[500px] border border-gray-100">
        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button 
            onClick={() => { setActiveTab('email'); setPage(0); setSearch(''); }}
            className={`flex-1 py-4 font-bold text-center flex items-center justify-center gap-2 transition-all ${activeTab === 'email' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Mail size={18} /> Email Logs
          </button>
          <button 
            onClick={() => { setActiveTab('whatsapp'); setPage(0); setSearch(''); }}
            className={`flex-1 py-4 font-bold text-center flex items-center justify-center gap-2 transition-all ${activeTab === 'whatsapp' ? 'bg-white text-green-600 border-t-2 border-t-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <MessageSquare size={18} /> WhatsApp Logs
          </button>
        </div>

        {/* Content */}
        <div className="p-0">
          {loading ? (
             <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#00D166]" size={32} /></div>
          ) : logs.length === 0 ? (
             <div className="p-20 text-center text-gray-500 flex flex-col items-center gap-2">
                 <Search size={32} className="text-gray-300" />
                 Nenhum registro encontrado.
             </div>
          ) : (
             <>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b">
                            <tr>
                                <th className="p-4 w-24">Status</th>
                                <th className="p-4 w-40">Data/Hora</th>
                                <th className="p-4 w-52">{activeTab === 'email' ? 'Destinatário' : 'Telefone'}</th>
                                <th className="p-4">{activeTab === 'email' ? 'Assunto' : 'Mensagem'}</th>
                                {activeTab === 'whatsapp' && <th className="p-4 w-28">Enviado por</th>}
                                <th className="p-4 w-20 text-center"> </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {logs.map(log => {
                                const isSuccess = log.status === 'enviado' || log.status === 'success' || log.status === 'sent';
                                const isError = log.status === 'erro' || log.status === 'error';
                                let erroDetalhe = log.erro_mensagem;
                                if (erroDetalhe) {
                                    try {
                                        const parsed = JSON.parse(erroDetalhe);
                                        erroDetalhe = parsed?.error ?? parsed?.response?.message?.[0]?.exists === false
                                            ? 'Número sem WhatsApp'
                                            : (parsed?.error ?? erroDetalhe);
                                    } catch (_) { /* keep raw */ }
                                }
                                return (
                                <tr key={log.id} className={`hover:bg-gray-50 transition-colors ${isError ? 'bg-red-50/30' : ''}`}>
                                    <td className="p-4">
                                        {isSuccess ? (
                                            <span className="flex items-center gap-1 text-green-700 font-bold bg-green-100 px-2.5 py-1 rounded-full w-fit text-xs border border-green-200 shadow-sm"><CheckCircle size={12}/> Enviado</span>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-1 text-red-700 font-bold bg-red-100 px-2.5 py-1 rounded-full w-fit text-xs border border-red-200 shadow-sm"><XCircle size={12}/> Falha</span>
                                                {erroDetalhe && (
                                                    <span className="text-[10px] text-red-600 max-w-[120px] truncate" title={log.erro_mensagem}>{erroDetalhe}</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-500 whitespace-nowrap">
                                        <div className="font-medium text-gray-700">{new Date(log.created_at).toLocaleDateString()}</div>
                                        <div className="text-xs">{new Date(log.created_at).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">
                                        {activeTab === 'email' ? log.destinatario : log.numero_telefone}
                                    </td>
                                    <td className="p-4">
                                        <div className="max-w-md truncate text-gray-600 font-medium" title={activeTab === 'whatsapp' ? log.mensagem : log.assunto}>
                                            {activeTab === 'email' ? log.assunto : log.mensagem}
                                        </div>
                                    </td>
                                    {activeTab === 'whatsapp' && (
                                        <td className="p-4 text-gray-500 text-xs">{log.created_by ?? '—'}</td>
                                    )}
                                    <td className="p-4 text-center">
                                        {log.reserva_id ? (
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                                                #{log.reserva_id.slice(0, 4)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                 </div>

                 {/* Pagination */}
                 <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <span className="text-xs text-gray-500">
                        Mostrando {page * PAGE_SIZE + 1} a {Math.min((page + 1) * PAGE_SIZE, totalCount)} de {totalCount} resultados
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2 rounded bg-white border hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setPage(p => p + 1)}
                            disabled={(page + 1) * PAGE_SIZE >= totalCount}
                            className="p-2 rounded bg-white border hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                 </div>
             </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;