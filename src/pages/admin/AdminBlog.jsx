import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2, Trash2, Edit2, Plus, Search, Eye, EyeOff, AlertTriangle, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import blogService from '@/services/blog/blog-service';
import categoriaBlogService from '@/services/blog/categoria/categoriaBlog-service';
import CategoriaBlogModal from '@/components/admin/CategoriaBlogModal';

const AdminBlog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAtivo, setFilterAtivo] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const { toast } = useToast();

  const [categorias, setCategorias] = useState([]);
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const [categoriasLoading, setCategoriasLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState(null);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await blogService.getBlogAdmin();
      setPosts(res.data || []);
    } catch {
      toast({ title: 'Erro ao carregar posts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    setCategoriasLoading(true);
    try {
      const res = await categoriaBlogService.getCategoriaBlogAdmin();
      setCategorias(res?.data || []);
    } catch {
      toast({ title: 'Erro ao carregar categorias', variant: 'destructive' });
    } finally {
      setCategoriasLoading(false);
    }
  };

  const handleToggleCategorias = () => {
    if (!categoriasOpen && categorias.length === 0) fetchCategorias();
    setCategoriasOpen(v => !v);
  };

  const handleDelete = async () => {
    try {
      await blogService.deleteBlogById(deleteId);
      toast({ title: 'Post excluído' });
      fetchPosts();
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggle = async (post) => {
    try {
      await blogService.patchBlogToggle(post.id, post.ativo);
      fetchPosts();
      toast({ title: post.ativo ? 'Post desativado' : 'Post ativado' });
    } catch {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' });
    }
  };

  const handleToggleCategoria = async (cat) => {
    try {
      await categoriaBlogService.patchCategoriaBlogToggle(cat.id, cat.ativo);
      fetchCategorias();
      toast({ title: cat.ativo ? 'Categoria desativada' : 'Categoria ativada' });
    } catch {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' });
    }
  };

  const handleDeleteCategoria = async () => {
    try {
      await categoriaBlogService.deleteCategoriaBlogById(deleteCatId);
      toast({ title: 'Categoria excluída' });
      fetchCategorias();
    } catch {
      toast({ title: 'Erro ao excluir categoria', variant: 'destructive' });
    } finally {
      setDeleteCatId(null);
    }
  };

  const filtered = posts.filter(p => {
    const matchSearch = p.titulo.toLowerCase().includes(search.toLowerCase());
    const matchAtivo = filterAtivo === 'all' ? true : filterAtivo === 'active' ? p.ativo : !p.ativo;
    return matchSearch && matchAtivo;
  });

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <Helmet title="Admin | Blog" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#0E3A2F]">Gerenciar Blog</h1>
        <button onClick={() => navigate('/admin/blog/novo')} className="bg-[#00D166] text-[#0E3A2F] px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow hover:bg-[#00b355] transition-colors">
          <Plus size={20} /> Novo Post
        </button>
      </div>

      {/* Categorias section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <button
          onClick={handleToggleCategorias}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-2 font-bold text-[#0E3A2F]">
            <Tag size={18} />
            Categorias
          </div>
          {categoriasOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>

        {categoriasOpen && (
          <div className="border-t border-gray-100 p-4">
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#00D166] text-[#0E3A2F] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-sm hover:bg-[#00b355] transition-colors"
              >
                <Plus size={16} /> Nova Categoria
              </button>
            </div>

            {categoriasLoading ? (
              <div className="text-center py-6"><Loader2 className="animate-spin mx-auto text-[#00D166]" size={28} /></div>
            ) : categorias.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-sm">Nenhuma categoria cadastrada.</p>
            ) : (
              <div className="space-y-2">
                {categorias.map(cat => (
                  <div
                    key={cat.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${cat.ativo ? 'border-gray-100' : 'border-red-100 bg-red-50/40'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0E3A2F] text-sm">{cat.nome}</span>
                      {!cat.ativo && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">Inativa</span>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleCategoria(cat)}
                        title={cat.ativo ? 'Desativar' : 'Ativar'}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          cat.ativo
                            ? 'text-gray-500 bg-gray-100 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200'
                            : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                        }`}
                      >
                        {cat.ativo ? <EyeOff size={13} /> : <Eye size={13} />}
                        {cat.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => setDeleteCatId(cat.id)}
                        className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#00D166]"
            placeholder="Buscar por título..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {[['all', 'Todos'], ['active', 'Ativos'], ['inactive', 'Inativos']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterAtivo(val)} className={`px-4 py-2 rounded-lg text-sm font-bold ${filterAtivo === val ? 'bg-[#0E3A2F] text-white' : 'bg-gray-100'}`}>{label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center p-10"><Loader2 className="animate-spin mx-auto text-[#00D166]" size={40} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Nenhum post encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(post => (
            <div key={post.id} className={`bg-white p-5 rounded-xl shadow-sm border flex flex-col md:flex-row items-start md:items-center gap-5 ${post.ativo ? 'border-gray-200' : 'border-red-200 bg-red-50/40'}`}>
              {post.imagem_url ? (
                <img src={post.imagem_url} alt={post.titulo} className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-[#0E3A2F]/10 flex-shrink-0" />
              )}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-[#0E3A2F] text-base truncate">{post.titulo}</h3>
                  {post.categoriaBlog && (
                    <span className="text-xs bg-[#00D166]/10 text-[#0E3A2F] px-2 py-0.5 rounded-full font-semibold">{post.categoriaBlog.nome}</span>
                  )}
                  {!post.ativo && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">Inativo</span>}
                </div>
                {post.subTitulo && <p className="text-gray-500 text-sm line-clamp-1">{post.subTitulo}</p>}
                <p className="text-gray-400 text-xs mt-1">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex gap-2 self-end md:self-center">
                <button
                  onClick={() => handleToggle(post)}
                  title={post.ativo ? 'Desativar' : 'Ativar'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    post.ativo
                      ? 'text-gray-500 bg-gray-100 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200'
                      : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                  }`}
                >
                  {post.ativo ? <EyeOff size={14} /> : <Eye size={14} />}
                  {post.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => navigate(`/admin/blog/editar/${post.id}`)} className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100" title="Editar">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => setDeleteId(post.id)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100" title="Excluir">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Post Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 border border-red-100 mx-auto mb-3">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold text-gray-800">Excluir post?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-500">
              Esta ação é permanente e não poderá ser desfeita. O post será removido definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 mt-2">
            <AlertDialogCancel className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2">
              <Trash2 size={15} /> Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={!!deleteCatId} onOpenChange={open => !open && setDeleteCatId(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 border border-red-100 mx-auto mb-3">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold text-gray-800">Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-500">
              Esta ação é permanente. A categoria será removida definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 mt-2">
            <AlertDialogCancel className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategoria} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2">
              <Trash2 size={15} /> Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CategoriaBlogModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => fetchCategorias()}
      />
    </div>
  );
};

export default AdminBlog;
