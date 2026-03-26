import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Tag, Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import blogService from '@/services/blog/blog-service';
import categoriaBlogService from '@/services/blog/categoria/categoriaBlog-service';

const POSTS_PER_PAGE = 9;

const stripHtml = (html) => html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';

const FeaturedCard = ({ post, navigate }) => (
  <div
    onClick={() => navigate(`/blog/${post.id}`)}
    className="cursor-pointer relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group h-full min-h-[320px]"
  >
    {post.imagem_url ? (
      <img
        src={post.imagem_url}
        alt={post.titulo}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
      />
    ) : (
      <div className="absolute inset-0 bg-[#0E3A2F]/20 flex items-center justify-center">
        <Tag size={48} className="text-[#0E3A2F]/30" />
      </div>
    )}

    {/* Gradient escurecido */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

    {/* Texto no canto inferior esquerdo */}
    <div className="absolute bottom-0 left-0 p-6 w-full">
      {post.categoriaBlog && (
        <span className="inline-block bg-[#00D166] text-[#0E3A2F] text-xs font-bold px-3 py-1 rounded-full mb-3">
          {post.categoriaBlog.nome}
        </span>
      )}
      <h2 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2 drop-shadow">
        {post.titulo}
      </h2>
      {post.subTitulo && (
        <p className="text-gray-300 text-sm line-clamp-2 mb-3">{post.subTitulo}</p>
      )}
      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
        <Calendar size={12} />
        <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  </div>
);

const SideCard = ({ post, navigate }) => (
  <div
    onClick={() => navigate(`/blog/${post.id}`)}
    className="cursor-pointer flex gap-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group p-3 items-start"
  >
    {post.imagem_url ? (
      <img
        src={post.imagem_url}
        alt={post.titulo}
        className="w-32 h-20 rounded-lg object-cover flex-shrink-0"
      />
    ) : (
      <div className="w-32 h-20 rounded-lg bg-[#0E3A2F]/10 flex items-center justify-center flex-shrink-0">
        <Tag size={20} className="text-[#0E3A2F]/25" />
      </div>
    )}
    <div className="min-w-0 flex flex-col justify-between h-full py-0.5">
      {post.categoriaBlog && (
        <span className="text-xs font-semibold text-[#00a050] mb-1">{post.categoriaBlog.nome}</span>
      )}
      <p className="text-sm font-bold text-[#0E3A2F] line-clamp-2 group-hover:text-[#00a050] transition-colors">
        {post.titulo}
      </p>
      {post.subTitulo && (
        <p className="text-xs text-gray-400 line-clamp-2 mt-1">{post.subTitulo}</p>
      )}
      <div className="flex items-center gap-1 text-gray-400 text-xs mt-2">
        <Calendar size={11} />
        <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  </div>
);

const BlogCard = ({ post, navigate }) => (
  <div
    onClick={() => navigate(`/blog/${post.id}`)}
    className="cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col overflow-hidden"
  >
    {post.imagem_url ? (
      <img
        src={post.imagem_url}
        alt={post.titulo}
        className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
      />
    ) : (
      <div className="w-full h-44 bg-[#0E3A2F]/10 flex items-center justify-center">
        <Tag size={32} className="text-[#0E3A2F]/20" />
      </div>
    )}
    <div className="p-5 flex flex-col flex-grow">
      {post.categoriaBlog && (
        <span className="inline-block bg-[#00D166]/15 text-[#0E3A2F] text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit">
          {post.categoriaBlog.nome}
        </span>
      )}
      <h3 className="font-bold text-[#0E3A2F] text-base mb-1 line-clamp-2 group-hover:text-[#00a050] transition-colors">
        {post.titulo}
      </h3>
      {post.subTitulo && (
        <p className="text-gray-600 text-sm font-medium italic line-clamp-2 mt-1">{post.subTitulo}</p>
      )}
      {post.conteudo && (
        <p className="text-gray-400 text-xs line-clamp-4 mt-2 border-t border-gray-100 pt-2">{stripHtml(post.conteudo)}</p>
      )}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <Calendar size={11} />
          <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
        <span className="text-xs font-semibold text-[#0E3A2F] bg-[#00D166]/15 px-3 py-1.5 rounded-lg group-hover:bg-[#00D166] group-hover:text-[#0E3A2F] transition-colors">
          Ler mais
        </span>
      </div>
    </div>
  </div>
);

const Blog = () => {
  const navigate = useNavigate();

  // Seção 1 — destaques
  const [featured, setFeatured] = useState(null);
  const [sideCards, setSideCards] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [bannerUrl, setBannerUrl] = useState(null);

  // Seção 2 — paginado com filtros
  const [gridPosts, setGridPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingGrid, setLoadingGrid] = useState(true);

  // Filtros
  const [categorias, setCategorias] = useState([]);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [page, setPage] = useState(1);

  // Carrega destaques, categorias e banner uma vez
  useEffect(() => {
    Promise.all([
      blogService.getBlog(),
      categoriaBlogService.getCategoriaBlog(),
      blogService.getBlogBanner(),
    ]).then(([blogRes, catRes, bannerRes]) => {
      if (blogRes?.success) {
        const data = blogRes.data || [];
        setFeatured(data[0] || null);
        setSideCards(data.slice(1, 5));
      }
      if (catRes?.success) setCategorias(catRes.data || []);
      if (bannerRes?.success) setBannerUrl(bannerRes.data?.banner_url || null);
    }).finally(() => setLoadingFeatured(false));
  }, []);

  // Debounce do search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Busca paginada sempre que filtros ou página mudam
  useEffect(() => {
    setLoadingGrid(true);
    blogService.getBlogPagination(searchDebounced, categoriaId, page, POSTS_PER_PAGE)
      .then(res => {
        if (res?.success) {
          setGridPosts(res.data?.data || []);
          setTotalPages(res.data?.totalPages ?? (Math.ceil((res.data?.total ?? 0) / POSTS_PER_PAGE) || 1));
        }
      })
      .finally(() => setLoadingGrid(false));
  }, [searchDebounced, categoriaId, page]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoria = (value) => {
    setCategoriaId(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet title="Blog - JL RENT A CAR" />

      {/* Hero */}
      <div className="relative bg-[#0E3A2F] text-white py-20 overflow-hidden">
        {/* Detalhe decorativo */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-[#00D166]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full bg-[#00D166]/8 blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 text-center">
          <span className="inline-block text-[#00D166] text-xs font-bold tracking-widest uppercase mb-4">
            JL Rent a Car
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Nosso Blog
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Dicas, novidades e informações sobre locação de veículos.
          </p>
          <div className="w-12 h-1 bg-[#00D166] rounded-full mx-auto mt-6" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-10">

        {/* ── Seção 1: Featured + Banner ── */}
        <section>
          <h2 className="text-2xl font-bold text-[#0E3A2F] mb-5">Mais Recentes</h2>
          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-5 mb-6">
              {/* Skeleton featured */}
              <div className="rounded-2xl overflow-hidden animate-pulse bg-gray-200 min-h-[320px]" />
              {/* Skeleton side cards */}
              <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-3 animate-pulse">
                    <div className="w-32 h-20 rounded-lg bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                      <div className="h-3.5 bg-gray-200 rounded w-full" />
                      <div className="h-3.5 bg-gray-200 rounded w-4/5" />
                      <div className="h-2.5 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : featured && (
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-5 mb-6">
              <FeaturedCard post={featured} navigate={navigate} />
              <div className="flex flex-col gap-4">
                {sideCards.map(post => (
                  <SideCard key={post.id} post={post} navigate={navigate} />
                ))}
              </div>
            </div>
          )}

          {/* Banner anúncio */}
          {bannerUrl ? (
            <div className="w-full rounded-2xl overflow-hidden h-28 md:h-36">
              <img
                src={bannerUrl}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
        </section>

        {/* ── Seção 2: Filtros + Grid paginado (server-side) ── */}
        <section>
          <h2 className="text-2xl font-bold text-[#0E3A2F] mb-5">Todos os Artigos</h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-7">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00D166] text-sm"
              />
            </div>

            <div className="relative">
              <select
                value={categoriaId}
                onChange={e => handleCategoria(e.target.value)}
                className="appearance-none pl-3 pr-9 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00D166] text-sm text-gray-600 min-w-[170px]"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {loadingGrid ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-44 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : gridPosts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Tag size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Nenhum artigo encontrado.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map(post => (
                <BlogCard key={post.id} post={post} navigate={navigate} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                    n === page
                      ? 'bg-[#0E3A2F] text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Blog;
