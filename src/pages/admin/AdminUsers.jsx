import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Search, Shield, User, ChevronLeft, ChevronRight, ShieldCheck, Newspaper } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import userService from '@/services/user/userService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const limit = 50;
  const debounceRef = useRef(null);
  const [updatingRole, setUpdatingRole] = useState(null);

  const handleRoleChange = async (e, userId) => {
    e.stopPropagation();
    const newRole = e.target.value;
    setUpdatingRole(userId);
    try {
      await userService.patchUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao atualizar função.', variant: 'destructive' });
    } finally {
      setUpdatingRole(null);
    }
  };

  useEffect(() => {
    fetchUsers(page, search);
  }, [page]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, value);
    }, 400);
  };

  const fetchUsers = async (currentPage, currentSearch) => {
    try {
      setLoading(true);
      const result = await userService.getClientPagined(currentSearch ?? search, '', currentPage ?? page, limit);
      const payload = result?.data ?? result;
      const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
      const tot = payload?.total ?? 0;
      setUsers(list);
      setTotal(tot);
      setTotalPages(payload?.totalPages ?? (Math.ceil(tot / limit) || 1));
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar usuários.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0E3A2F]">Gerenciar Usuários</h1>
          <p className="text-gray-500">Visualize e gerencie os usuários cadastrados.</p>
        </div>
        <div className="text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          Total: <span className="font-bold text-[#00D166]">{total}</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-3 border border-gray-100">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          className="flex-1 outline-none text-gray-700"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#00D166]" size={40} /></div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4">Contato</th>
                    <th className="px-6 py-4">CPF</th>
                    <th className="px-6 py-4">Função</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                            {user.foto_perfil_url ? <img src={user.foto_perfil_url} className="w-full h-full object-cover" /> : <User size={20} />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{user.nome || 'Sem Nome'}</div>
                            <div className="text-xs text-gray-400">Cadastrado em {new Date(user.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.telefone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.cpf || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Shield size={10} /> Admin
                          </span>
                        )} 
                        {user.role === 'blog' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Newspaper size={10} /> Blog
                          </span>
                        )}
                        {user.role === 'user' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Usuário
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                          <ShieldCheck size={14} className="text-gray-400 shrink-0" />
                          <select
                            value={user.role || 'user'}
                            onChange={(e) => handleRoleChange(e, user.id)}
                            disabled={updatingRole === user.id}
                            className="bg-transparent outline-none text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            <option value="user">Cliente</option>
                            <option value="admin">Admin</option>
                            <option value="blog">Blog</option>
                          </select>
                          {updatingRole === user.id && <Loader2 size={12} className="animate-spin text-gray-400 shrink-0" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Página <span className="font-bold">{page}</span> de <span className="font-bold">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsers;
