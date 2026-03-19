import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';
import blogService from '@/services/blog/blog-service';

const BlogDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [outros, setOutros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      blogService.getBlogById(id),
      blogService.getBlog()
    ]).then(([detalhe, lista]) => {
      if (detalhe?.success) setPost(detalhe.data);
      if (lista?.success) setOutros(lista.data.filter(p => p.id !== id).slice(0, 3));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="h-72 bg-gray-200 w-full" />
        <div className="container mx-auto px-4 py-12 max-w-3xl space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
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
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8 max-w-3xl">
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

      {/* Conteúdo */}
      <div className="container mx-auto px-4 max-w-3xl py-10">
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

      {outros.length > 0 && (
        <div className="bg-white border-t border-gray-100 py-14">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl font-bold text-[#0E3A2F] mb-8">Continue Lendo</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {outros.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/blog/${rel.id}`)}
                  className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden hover:scale-[1.02] transition-all cursor-pointer flex flex-col"
                >
                  {rel.imagem_url ? (
                    <img src={rel.imagem_url} alt={rel.titulo} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-[#0E3A2F]/10 flex items-center justify-center">
                      <Tag size={32} className="text-[#0E3A2F]/30" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    {rel.categoriaBlog && (
                      <span className="inline-block bg-[#00D166]/10 text-[#0E3A2F] text-xs font-semibold px-2 py-0.5 rounded-full mb-2 w-fit">
                        {rel.categoriaBlog.nome}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-[#0E3A2F] line-clamp-2 flex-grow">{rel.titulo}</h3>
                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-3">
                      <Calendar size={11} />
                      <span>{new Date(rel.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetalhe;
