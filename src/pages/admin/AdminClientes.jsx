import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, User, Mail, Phone, Calendar, Filter, Eye, ChevronLeft, ChevronRight, ShieldCheck, MessageCircle } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { formatarData } from '@/lib/dateUtils';
import userService from '@/services/user/userService';

const ROLE_CONFIG = {
    user:  { label: 'Cliente',   color: 'bg-blue-100 text-blue-700' },
    admin: { label: 'Admin',     color: 'bg-red-100 text-red-700' },
    blog:  { label: 'Blog',      color: 'bg-purple-100 text-purple-700' },
};

const ITEMS_PER_PAGE = 20;

const AdminClientes = () => {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [todos, setTodos] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [updatingRole, setUpdatingRole] = useState(null);

    const handleRoleChange = async (e, clienteId) => {
        e.stopPropagation();
        const newRole = e.target.value;
        setUpdatingRole(clienteId);
        try {
            await userService.patchUserRole(clienteId, newRole);
            setClientes(prev => prev.map(c => c.id === clienteId ? { ...c, role: newRole } : c));
        } catch (err) {
            console.error('[AdminClientes] Erro ao trocar role:', err);
        } finally {
            setUpdatingRole(null);
        }
    };

    const fetchClientes = async (page = currentPage, searchTerm = search, showAll = todos) => {
        setLoading(true);
        try {
            const result = await userService.getClientPagined(searchTerm, showAll, String(page), String(ITEMS_PER_PAGE));
            const data = result?.data?.data ?? [];
            const totalCount = result?.data?.total ?? data.length;
            setClientes(data);
            setTotal(totalCount);
            setTotalPages(Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE)));
        } catch (err) {
            console.error('[AdminClientes] Erro:', err);
            setClientes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchClientes(1, search, todos);
        }, 400);
        return () => clearTimeout(timer);
    }, [search, todos]);

    useEffect(() => { fetchClientes(currentPage, search, todos); }, [currentPage]);

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <Helmet title="Admin | Clientes" />

            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-[#0E3A2F] mb-2 flex items-center gap-3">
                    <User className="text-[#00D166]" size={32} />
                    Gestão de Clientes
                </h1>
                <p className="text-gray-500">Gerencie a base de clientes e visualize históricos de reservas.</p>
            </div>

            <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
                                value={todos ? 'todos' : 'users'}
                                onChange={(e) => setTodos(e.target.value === 'todos')}
                                className="bg-transparent outline-none text-sm text-gray-700 cursor-pointer"
                            >
                                <option value="todos">Todos</option>
                                <option value="users">Apenas Clientes</option>
                            </select>
                        </div>
                        <div className="bg-[#0E3A2F] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                            Total: {total}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#00D166]" size={48} /></div>
                ) : clientes.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <User className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-gray-700">Nenhum cliente encontrado</h3>
                        <p className="text-gray-500">Tente ajustar seus filtros de busca.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clientes.map(cliente => (
                            <div
                                key={cliente.id}
                                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#00D166]/30 transition-all duration-300 group cursor-pointer"
                                onClick={() => navigate(`/admin/cliente/${cliente.id}`)}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-[#0E3A2F]/5 flex items-center justify-center text-[#0E3A2F] group-hover:bg-[#00D166] group-hover:text-white transition-colors overflow-hidden">
                                        {cliente.user_avatars ? (
                                            <img src={cliente.user_avatars} alt={cliente.nome} className="w-full h-full object-cover" />
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
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                        <Mail size={14} className="text-[#00D166]" />
                                        <span className="truncate">{cliente.email}</span>
                                    </div>
                                    {cliente.telefone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                            <Phone size={14} className="text-[#00D166]" />
                                            <span>{cliente.telefone}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                                        <ShieldCheck size={14} className="text-gray-400 shrink-0" />
                                        <select
                                            value={cliente.role || 'user'}
                                            onChange={(e) => handleRoleChange(e, cliente.id)}
                                            disabled={updatingRole === cliente.id}
                                            className="bg-transparent outline-none text-xs font-bold w-full cursor-pointer disabled:opacity-50"
                                        >
                                            <option value="user">Cliente</option>
                                            <option value="admin">Admin</option>
                                            <option value="blog">Blog</option>
                                        </select>
                                        {updatingRole === cliente.id && <Loader2 size={12} className="animate-spin text-gray-400 shrink-0" />}
                                    </div>
                                    {cliente.telefone && (
                                        <a
                                            href={`https://wa.me/${(cliente.telefone).replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center justify-center px-3 py-1.5 rounded-lg border border-green-500 text-green-600 text-sm font-bold hover:bg-green-500 hover:text-white transition-colors"
                                            title="Abrir WhatsApp"
                                        >
                                            <MessageCircle size={15} />
                                        </a>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/cliente/${cliente.id}`); }}
                                        className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-[#00D166] text-[#0E3A2F] text-sm font-bold hover:bg-[#00D166] hover:text-white transition-colors"
                                    >
                                        <Eye size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-6">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">«</button>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                            <ChevronLeft size={18} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                            .reduce((acc, page, idx, arr) => {
                                if (idx > 0 && page - arr[idx - 1] > 1) acc.push('...');
                                acc.push(page);
                                return acc;
                            }, [])
                            .map((item, idx) =>
                                item === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">...</span>
                                ) : (
                                    <button key={item} onClick={() => setCurrentPage(item)} className={`w-9 h-9 rounded-lg border text-sm font-bold transition-colors ${item === currentPage ? 'bg-[#0E3A2F] text-white border-[#0E3A2F]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{item}</button>
                                )
                            )
                        }
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                            <ChevronRight size={18} />
                        </button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">»</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminClientes;
