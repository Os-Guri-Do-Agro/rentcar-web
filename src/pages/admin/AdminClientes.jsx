import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, Eye, User, Mail, Phone, Calendar, ArrowUpAz, ArrowDown01, Filter } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { formatarData } from '@/lib/dateUtils';

const AdminClientes = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'reservations_desc', 'reservations_asc'

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        setLoading(true);
        console.log("[AdminClientes] Buscando clientes...");
        
        try {
            // Fetch users
            const { data: users, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch reservation counts to enhance user data
            const { data: reservas } = await supabase.from('reservas').select('usuario_id');
            
            const usersWithStats = users.map(u => {
                const count = reservas ? reservas.filter(r => r.usuario_id === u.id).length : 0;
                return { ...u, reservaCount: count };
            });
            
            console.log(`[AdminClientes] Clientes carregados: ${usersWithStats.length}`);
            setClientes(usersWithStats);
        } catch (error) {
            console.error("[AdminClientes] Erro ao buscar clientes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredClientes = clientes.filter(c => 
        (c.nome && c.nome.toLowerCase().includes(search.toLowerCase())) || 
        (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
        (c.cpf && c.cpf.includes(search))
    );

    // Sort logic
    const sortedClientes = [...filteredClientes].sort((a, b) => {
        if (sortOrder === 'reservations_desc') return b.reservaCount - a.reservaCount;
        if (sortOrder === 'reservations_asc') return a.reservaCount - b.reservaCount;
        if (sortOrder === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        return 0;
    });

    console.log(`[AdminClientes] Clientes filtrados: ${sortedClientes.length} (Busca: "${search}", Ordenação: ${sortOrder})`);

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <Helmet title="Admin | Clientes" />
            
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-[#0E3A2F] mb-2 flex items-center gap-3">
                    <User className="text-[#00D166]" size={32} />
                    Gestão de Clientes
                </h1>
                <p className="text-gray-500">Gerencie a base de clientes e visualize históricos de reservas.</p>
            </div>

            {/* Controls Section */}
            <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input 
                            type="text" 
                            placeholder="Buscar por nome, email ou CPF..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#00D166] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto items-center">
                         <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                            <Filter size={16} className="text-gray-500" />
                            <select 
                                value={sortOrder} 
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="bg-transparent outline-none text-sm text-gray-700 cursor-pointer"
                            >
                                <option value="newest">Mais Recentes</option>
                                <option value="reservations_desc">Mais Reservas</option>
                                <option value="reservations_asc">Menos Reservas</option>
                            </select>
                         </div>
                         <div className="bg-[#0E3A2F] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                             Total: {sortedClientes.length}
                         </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#00D166]" size={48}/></div>
                ) : sortedClientes.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <User className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-gray-700">Nenhum cliente encontrado</h3>
                        <p className="text-gray-500">Tente ajustar seus filtros de busca.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedClientes.map(cliente => (
                            <div 
                                key={cliente.id} 
                                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#00D166]/30 transition-all duration-300 group cursor-pointer"
                                onClick={() => navigate(`/admin/cliente/${cliente.id}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-[#0E3A2F]/5 flex items-center justify-center text-[#0E3A2F] group-hover:bg-[#00D166] group-hover:text-white transition-colors">
                                            {cliente.foto_perfil_url ? (
                                                <img src={cliente.foto_perfil_url} alt={cliente.nome} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <User size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#0E3A2F] line-clamp-1 group-hover:text-[#00D166] transition-colors">
                                                {cliente.nome || 'Cliente sem nome'}
                                            </h3>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar size={10} /> Desde {formatarData(cliente.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="bg-[#0E3A2F] text-white text-xs font-bold px-2 py-1 rounded-md min-w-[24px] text-center" title="Total de Reservas">
                                        {cliente.reservaCount}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                        <Mail size={14} className="text-[#00D166]" />
                                        <span className="truncate">{cliente.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                        <Phone size={14} className="text-[#00D166]" />
                                        <span>{cliente.telefone || 'Não informado'}</span>
                                    </div>
                                </div>

                                <button 
                                    className="w-full mt-auto py-2.5 bg-gray-50 hover:bg-[#0E3A2F] text-gray-600 hover:text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-gray-100 hover:border-transparent"
                                >
                                    <Eye size={16} /> Ver Detalhes
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminClientes;