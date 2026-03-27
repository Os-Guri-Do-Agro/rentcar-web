import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { Users, Car, Calendar, Settings, TrendingUp, ArrowRight, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import dashboardService from '@/services/dashboard/dashboard-service';

const StatCard = ({ title, value, icon: Icon, color, link, sub }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-xl shadow-md border-l-4 relative overflow-hidden"
    style={{ borderLeftColor: color }}
  >
    <div className="flex justify-between items-start mb-3">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20`, color }}>
        <Icon size={24} />
      </div>
    </div>
    {link && (
      <Link to={link} className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color }}>
        Ver detalhes <ArrowRight size={14} />
      </Link>
    )}
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getDashboard();
        setStats(data.data);
      } catch {
        toast({ title: 'Erro ao carregar dados', description: 'Não foi possível buscar as estatísticas do painel.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#00D166]" size={40} /></div>;

  // --- Chart options ---

  const carrosDonutOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie', radius: ['50%', '75%'], avoidLabelOverlap: false,
      label: { show: false },
      data: [
        { value: stats?.carros?.disponiveis || 0, name: 'Disponíveis', itemStyle: { color: '#00D166' } },
        { value: stats?.carros?.indisponiveis || 0, name: 'Indisponíveis', itemStyle: { color: '#F87171' } },
      ],
    }],
  };

  const reservasTipoBarOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 16, right: 16, bottom: 24, top: 16, containLabel: true },
    xAxis: { type: 'category', data: ['Particular', 'Motorista', 'Corporativo'], axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      type: 'bar', barMaxWidth: 48,
      data: [
        { value: stats?.reservasPorTipo?.particular || 0, itemStyle: { color: '#3B82F6' } },
        { value: stats?.reservasPorTipo?.motorista || 0, itemStyle: { color: '#F59E0B' } },
        { value: stats?.reservasPorTipo?.corporativo || 0, itemStyle: { color: '#8B5CF6' } },
      ],
    }],
  };

  const reservasStatusOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie', radius: ['50%', '75%'], avoidLabelOverlap: false,
      label: { show: false },
      data: [
        { value: stats?.reservas?.confirmadas || 0, name: 'Confirmadas', itemStyle: { color: '#00D166' } },
        { value: stats?.reservas?.pendentes || 0, name: 'Pendentes', itemStyle: { color: '#F59E0B' } },
        { value: stats?.reservas?.canceladas || 0, name: 'Canceladas', itemStyle: { color: '#F87171' } },
      ],
    }],
  };

  const carrosMaisReservadosOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 16, right: 24, bottom: 8, top: 8, containLabel: true },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: {
      type: 'category',
      data: (stats?.carrosMaisReservados || []).map(c => c.nome.length > 22 ? c.nome.slice(0, 22) + '…' : c.nome).reverse(),
      axisLabel: { fontSize: 11 },
    },
    series: [{
      type: 'bar', barMaxWidth: 32,
      data: (stats?.carrosMaisReservados || []).map(c => c.totalReservas).reverse(),
      itemStyle: { color: '#00D166', borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', fontSize: 11 },
    }],
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0E3A2F]">Painel Administrativo</h1>
        <p className="text-gray-500 mt-1">Visão geral do sistema e atalhos de gerenciamento.</p>
      </div>

      {/* Row 1 — Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Clientes" value={stats?.clientes?.total || 0} icon={Users} color="#3B82F6" link="/admin/usuarios" sub={`+${stats?.clientes?.novosMes || 0} este mês`} />
        <StatCard title="Veículos na Frota" value={stats?.carros?.total || 0} icon={Car} color="#00D166" link="/admin/frota" sub={`${stats?.carros?.disponiveis || 0} disponíveis`} />
        <StatCard title="Reservas" value={stats?.reservas?.total || 0} icon={Calendar} color="#F59E0B" link="/admin/reservas" sub={`${stats?.reservas?.pendentes || 0} pendentes · ${stats?.reservas?.recentes || 0} recentes`} />
        <StatCard title="Posts do Blog" value={stats?.blog?.posts || 0} icon={FileText} color="#8B5CF6" link="/admin/blog" sub={`${stats?.blog?.postsAtivos || 0} ativos`} />
      </div>



      {/* Row 3 — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Carros mais reservados */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#0E3A2F] mb-4">Carros Mais Reservados</h2>
          <ReactECharts option={carrosMaisReservadosOption} style={{ height: 220 }} />
        </div>

        {/* Frota donut */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#0E3A2F] mb-2">Disponibilidade da Frota</h2>
          <ReactECharts option={carrosDonutOption} style={{ height: 220 }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Reservas por tipo */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#0E3A2F] mb-4">Reservas por Tipo</h2>
          <ReactECharts option={reservasTipoBarOption} style={{ height: 200 }} />
        </div>

        {/* Reservas por status */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#0E3A2F] mb-2">Status das Reservas</h2>
          <ReactECharts option={reservasStatusOption} style={{ height: 200 }} />
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#0E3A2F] mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <Link to="/admin/car/new" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-[#00D166] transition-all group">
              <div className="bg-green-100 text-[#00D166] p-2 rounded-lg group-hover:bg-[#00D166] group-hover:text-white transition-colors"><Car size={18} /></div>
              <div><h4 className="font-bold text-gray-800 text-sm">Adicionar Veículo</h4><p className="text-xs text-gray-500">Cadastrar novo carro na frota</p></div>
            </Link>
            <Link to="/admin/whatsapp-config" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-[#00D166] transition-all group">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Settings size={18} /></div>
              <div><h4 className="font-bold text-gray-800 text-sm">Configurar Contato</h4><p className="text-xs text-gray-500">Alterar WhatsApp e e-mail</p></div>
            </Link>
            <Link to="/admin/precos-carros" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-[#00D166] transition-all group">
              <div className="bg-purple-100 text-purple-600 p-2 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors"><TrendingUp size={18} /></div>
              <div><h4 className="font-bold text-gray-800 text-sm">Gerenciar Preços</h4><p className="text-xs text-gray-500">Ajustar valores da diária</p></div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
