import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Car, Calendar, DollarSign, Settings, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { getDashboardStats } from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';

const StatCard = ({ title, value, icon: Icon, color, link }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-gray-100 relative overflow-hidden"
    style={{ borderLeftColor: color }}
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className="p-3 rounded-lg bg-opacity-10" style={{ backgroundColor: `${color}20`, color: color }}>
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
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível buscar as estatísticas do painel.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#00D166]" size={40} /></div>;

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0E3A2F]">Painel Administrativo</h1>
        <p className="text-gray-500 mt-1">Visão geral do sistema e atalhos de gerenciamento.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total de Usuários" 
          value={stats?.stats?.totalUsers || 0} 
          icon={Users} 
          color="#3B82F6" 
          link="/admin/usuarios"
        />
        <StatCard 
          title="Veículos na Frota" 
          value={stats?.stats?.totalCars || 0} 
          icon={Car} 
          color="#00D166" 
          link="/admin/carros"
        />
        <StatCard 
          title="Reservas Totais" 
          value={stats?.stats?.totalReservas || 0} 
          icon={Calendar} 
          color="#F59E0B" 
          link="/admin/reservas"
        />
        <StatCard 
          title="Faturamento (Mês)" 
          value="R$ --" 
          icon={DollarSign} 
          color="#10B981" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Reservations */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#0E3A2F]">Reservas Recentes</h2>
            <Link to="/admin/reservas" className="text-[#00D166] text-sm font-bold hover:underline">Ver todas</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase">
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Veículo</th>
                  <th className="pb-3 font-semibold">Data</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.recentReservas?.map(res => (
                  <tr key={res.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-gray-900">{res.users?.nome || 'Usuário'}</div>
                      <div className="text-xs text-gray-400">{res.users?.email}</div>
                    </td>
                    <td className="py-4 text-gray-700">{res.cars?.nome || 'Carro removido'}</td>
                    <td className="py-4 text-gray-600 text-sm">{new Date(res.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                        ${res.status === 'confirmada' ? 'bg-green-100 text-green-800' : 
                          res.status === 'cancelada' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentReservas || stats.recentReservas.length === 0) && (
                   <tr><td colSpan="4" className="text-center py-6 text-gray-500">Nenhuma reserva recente.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-[#0E3A2F] mb-6">Ações Rápidas</h2>
          <div className="space-y-4">
            <Link to="/admin/car/new" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-[#00D166] transition-all group">
               <div className="bg-green-100 text-[#00D166] p-2 rounded-lg group-hover:bg-[#00D166] group-hover:text-white transition-colors">
                 <Car size={20} />
               </div>
               <div>
                 <h4 className="font-bold text-gray-800">Adicionar Veículo</h4>
                 <p className="text-xs text-gray-500">Cadastrar novo carro na frota</p>
               </div>
            </Link>

            <Link to="/admin/whatsapp-config" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-[#00D166] transition-all group">
               <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <Settings size={20} />
               </div>
               <div>
                 <h4 className="font-bold text-gray-800">Configurar Contato</h4>
                 <p className="text-xs text-gray-500">Alterar WhatsApp e e-mail</p>
               </div>
            </Link>

            <Link to="/admin/precos-carros" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-[#00D166] transition-all group">
               <div className="bg-purple-100 text-purple-600 p-2 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                 <TrendingUp size={20} />
               </div>
               <div>
                 <h4 className="font-bold text-gray-800">Gerenciar Preços</h4>
                 <p className="text-xs text-gray-500">Ajustar valores da diária</p>
               </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;