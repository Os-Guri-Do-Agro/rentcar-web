import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Tag, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import blogService from '@/services/blog/blog-service';

const BlogCard = ({ post, navigate, featured }) => (
  <div
    onClick={() => navigate(`/blog/${post.id}`)}
    className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:scale-[1.02] transition-all flex flex-col cursor-pointer ${featured ? 'md:col-span-2' : ''}`}
  >
    {post.imagem_url ? (
      <img src={post.imagem_url} alt={post.titulo} className={`w-full object-cover ${featured ? 'h-64' : 'h-48'}`} />
    ) : (
      <div className={`w-full bg-[#0E3A2F]/10 flex items-center justify-center ${featured ? 'h-64' : 'h-48'}`}>
        <Tag size={40} className="text-[#0E3A2F]/30" />
      </div>
    )}
    <div className="p-6 flex flex-col flex-grow">
      {post.categoriaBlog && (
        <span className="inline-block bg-[#00D166]/10 text-[#0E3A2F] text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit">
          {post.categoriaBlog.nome}
        </span>
      )}
      <h3 className={`font-bold text-[#0E3A2F] mb-2 line-clamp-2 ${featured ? 'text-xl' : 'text-lg'}`}>{post.titulo}</h3>
      {post.subTitulo && <p className="text-gray-500 text-sm line-clamp-3 flex-grow">{post.subTitulo}</p>}
      <div className="flex items-center gap-1 text-gray-400 text-xs mt-4">
        <Calendar size={12} />
        <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  </div>
);

const Blog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.getBlog().then(res => {
      if (res?.success) {
        setPosts(res.data);
        const cats = [...new Set(res.data.map(p => p.categoriaBlog?.nome).filter(Boolean))];
        setCategorias(cats);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = posts;
    if (categoria) result = result.filter(p => p.categoriaBlog?.nome === categoria);
    if (search) result = result.filter(p =>
      p.titulo.toLowerCase().includes(search.toLowerCase()) ||
      p.subTitulo?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [posts, categoria, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const recentes = posts.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet title="Blog - JL RENT A CAR" />

      <div className="bg-[#0E3A2F] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-gray-300 max-w-xl mx-auto">
            Dicas, novidades e informações sobre locação de veículos.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">

        {/* Mais Recentes */}
        {!loading && recentes.length > 0 && (
          <div className="mb-14">
            <h2 className="text-2xl font-bold text-[#0E3A2F] mb-6">Mais Recentes</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {recentes.map((post, i) => (
                <BlogCard key={post.id} post={post} navigate={navigate} featured={i === 0} />
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00D166] text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-[#0E3A2F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#00D166] hover:text-[#0E3A2F] transition-colors"
            >
              Buscar
            </button>
          </form>

          {categorias.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoria(prev => prev === cat ? '' : cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    categoria === cat
                      ? 'bg-[#0E3A2F] text-white border-[#0E3A2F]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#0E3A2F] hover:text-[#0E3A2F]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid de Posts */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Tag size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Nenhum artigo encontrado.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(post => (
              <BlogCard key={post.id} post={post} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
