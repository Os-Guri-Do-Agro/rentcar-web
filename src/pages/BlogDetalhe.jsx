import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Calendar, ArrowLeft, Tag, Search } from 'lucide-react';
import blogService from '@/services/blog/blog-service';

const SIDEBAR_LIMIT = 8;

const BlogDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sidebar
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarSearchDebounced, setSidebarSearchDebounced] = useState('');
  const [sidebarPosts, setSidebarPosts] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    blogService.getBlogById(id)
      .then(res => { if (res?.success) setPost(res.data); })
      .finally(() => setLoading(false));
  }, [id]);

  // Debounce sidebar search
  useEffect(() => {
    const t = setTimeout(() => setSidebarSearchDebounced(sidebarSearch), 400);
    return () => clearTimeout(t);
  }, [sidebarSearch]);

  // Carrega posts da sidebar
  useEffect(() => {
    setSidebarLoading(true);
    blogService.getBlogPagination(sidebarSearchDebounced, '', 1, SIDEBAR_LIMIT)
      .then(res => {
        if (res?.success) {
          setSidebarPosts((res.data?.data || []).filter(p => p.id !== id));
        }
      })
      .finally(() => setSidebarLoading(false));
  }, [sidebarSearchDebounced, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="h-72 bg-gray-200 w-full" />
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded-xl" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                    <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Tag size={48} className="text-gray-300" />
        <p className="text-gray-500 text-lg">Post não encontrado.</p>
        <button onClick={() => navigate('/blog')} className="text-[#00D166] font-semibold hover:underline">
          Voltar ao Blog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet title={`${post.titulo} - JL RENT A CAR`} />

      {/* Hero com imagem */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        {post.imagem_url ? (
          <img src={post.imagem_url} alt={post.titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#0E3A2F]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8 max-w-6xl">
          {post.categoriaBlog && (
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-[#00D166] text-[#0E3A2F] text-xs font-bold px-3 py-1 rounded-full">
                {post.categoriaBlog.nome}
              </span>
            </div>
          )}
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">{post.titulo}</h1>
        </div>
      </div>

      {/* Layout duas colunas */}
      <div className="container mx-auto px-4 max-w-6xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 items-start">

          {/* ── Coluna esquerda: conteúdo ── */}
          <div>
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0E3A2F] mb-8 transition-colors"
            >
              <ArrowLeft size={16} /> Voltar ao Blog
            </button>

            <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
              <Calendar size={14} />
              <span>{new Date(post.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>

            {post.subTitulo && (
              <p className="text-xl text-gray-600 font-medium mb-8 leading-relaxed border-l-4 border-[#00D166] pl-4">
                {post.subTitulo}
              </p>
            )}

            <div
              className="blog-content text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.conteudo }}
            />

            {post.conclusao && (
              <div className="mt-10 bg-[#0E3A2F] text-white rounded-2xl p-6 md:p-8">
                <p className="text-lg font-medium leading-relaxed">{post.conclusao}</p>
              </div>
            )}
          </div>

          {/* ── Sidebar: Continue lendo ── */}
          <aside className="lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Header da sidebar */}
              <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#0E3A2F] uppercase tracking-wider mb-3">Continue lendo</h3>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar artigos..."
                    value={sidebarSearch}
                    onChange={e => setSidebarSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00D166] text-xs"
                  />
                </div>
              </div>

              {/* Lista */}
              <div className="divide-y divide-gray-50">
                {sidebarLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
                      <div className="w-[72px] h-[54px] bg-gray-200 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-0.5">
                        <div className="h-2.5 bg-gray-200 rounded w-full" />
                        <div className="h-2.5 bg-gray-200 rounded w-3/4" />
                        <div className="h-2 bg-gray-200 rounded w-1/3 mt-1" />
                      </div>
                    </div>
                  ))
                ) : sidebarPosts.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">Nenhum artigo encontrado.</p>
                ) : (
                  sidebarPosts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/blog/${p.id}`)}
                      className="flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer group transition-colors"
                    >
                      {p.imagem_url ? (
                        <img
                          src={p.imagem_url}
                          alt={p.titulo}
                          className="w-[72px] h-[54px] rounded-lg object-cover flex-shrink-0 group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="w-[72px] h-[54px] rounded-lg bg-[#0E3A2F]/10 flex items-center justify-center flex-shrink-0">
                          <Tag size={14} className="text-[#0E3A2F]/25" />
                        </div>
                      )}
                      <div className="min-w-0 flex flex-col justify-center gap-1.5">
                        {p.categoriaBlog && (
                          <span className="text-[10px] font-semibold text-[#00a050] leading-none">{p.categoriaBlog.nome}</span>
                        )}
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-[#0E3A2F] transition-colors leading-snug">
                          {p.titulo}
                        </p>
                        <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                          <Calendar size={9} />
                          <span>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default BlogDetalhe;
