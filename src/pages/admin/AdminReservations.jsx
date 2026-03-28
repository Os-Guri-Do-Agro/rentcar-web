import React, { useState, useEffect } from 'react';
import { Loader2, Calendar, CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle, FileText, Download, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import reservasServices from '@/services/reservas/reservas-services';

const AdminReservations = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date());
  const [syncStatus, setSyncStatus] = useState('synced');
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchReservas = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      setSyncStatus('syncing');

      console.log("[AdminReservations] Fetching reservas with explicit FK syntax");

      // FK Explícita para users e cars
      const response = await reservasServices.getReservas();
      if (!response?.success) throw new Error('Falha ao buscar reservas');
      setReservas(response.data);
      setLastSynced(new Date());
      setSyncStatus('synced');

      if (isManualRefresh) {
        toast({ title: "Sincronizado", className: "bg-green-600 text-white border-none" });
      }
    } catch (error) {
      console.error(error);
      setSyncStatus('error');
      toast({ title: "Erro", description: "Falha ao carregar reservas.", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservas();
    const interval = setInterval(() => {
      if (new Date() - lastSynced > 30000) fetchReservas();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigateToDetails = (id) => {
    console.log(`Navegando para detalhes da reserva: ${id}`);
    navigate(`/admin/reserva/${id}`);
  };

  const filteredReservas = filter === 'all' ? reservas : reservas.filter(r => r.status === filter);

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-[#0E3A2F]">Gerenciar Reservas</h1>
            {syncStatus === 'syncing' && <Loader2 className="animate-spin text-[#00D166]" size={18} />}
            {syncStatus === 'synced' && <CheckCircle className="text-green-500" size={18} title="Sincronizado" />}
            {syncStatus === 'error' && <AlertTriangle className="text-red-500" size={18} title="Erro" />}
          </div>
          <p className="text-gray-500 text-sm">Última atualização: {lastSynced.toLocaleTimeString()}</p>
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={() => fetchReservas(true)}
            disabled={refreshing}
            className="p-2 bg-white border rounded hover:bg-gray-50"
            title="Atualizar"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>

          <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            {[
              { value: 'all',        label: 'Todas' },
              { value: 'pendente',   label: 'Pendentes' },
              { value: 'aceita',     label: 'Aprovadas' },
              { value: 'confirmada', label: 'Confirmadas' },
              { value: 'cancelada',  label: 'Canceladas' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === value ? 'bg-[#0E3A2F] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#00D166]" size={40} /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs font-bold text-gray-500 uppercase">
                  <th className="px-6 py-4">ID / Data</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Veículo</th>
                  <th className="px-6 py-4">Período</th>
                  <th className="px-6 py-4"> </th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReservas.map(res => (
                  <tr key={res.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleNavigateToDetails(res.id)}>
                    <td className="px-6 py-4">
                      <span className="block text-xs text-gray-500 font-mono">#{res.id.slice(0, 8)}</span>
                      <span className="text-xs text-gray-400">{new Date(res.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{res.users?.nome || 'Desconhecido'}</div>
                      <div className="text-xs text-gray-500">{res.users?.telefone || res.users?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{res.cars?.nome || 'Veículo removido'}</div>
                      <div className="text-xs text-gray-500">{res.cars?.placa}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {res.data_retirada ? new Date(res.data_retirada).toLocaleDateString() : '-'} - {res.data_devolucao ? new Date(res.data_devolucao).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {res.documentos_urls?.length > 0 && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                          <FileText size={12} /> {res.documentos_urls.length}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1 ${
                        res.status === 'confirmada' ? 'bg-green-100 text-green-800' :
                        res.status === 'aceita'     ? 'bg-blue-100 text-blue-800' :
                        res.status === 'cancelada'  ? 'bg-red-100 text-red-800' :
                                                      'bg-yellow-100 text-yellow-800'
                      }`}>
                        {res.status === 'aceita' ? 'Aprovada' :
                         res.status === 'pendente' ? 'Pendente' :
                         res.status === 'confirmada' ? 'Confirmada' :
                         res.status === 'cancelada' ? 'Cancelada' : res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNavigateToDetails(res.id); }}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
                      >
                        <Eye size={16} /> Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservations;