import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import blogService from '@/services/blog/blog-service';
import BlogForm from '@/components/admin/BlogForm';

const AdminBlogEditar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.getBlogById(id)
      .then(res => {
        const p = res?.data;
        if (!p) return navigate('/admin/blog');
        setForm({ titulo: p.titulo, subTitulo: p.subTitulo || '', conteudo: p.conteudo || '', conclusao: p.conclusao || '', ativo: p.ativo, categoriaBlogId: p.categoriaBlogId || p.categoriaBlog?.id || '' });
        setPhotoPreview(p.imagem_url || '');
      })
      .catch(() => navigate('/admin/blog'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Imagem muito grande', description: 'O tamanho máximo permitido é 5MB.', variant: 'destructive' });
      e.target.value = '';
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await blogService.patchBlog(id, form);
      if (photoFile) {
        const fd = new FormData();
        fd.append('file', photoFile);
        await blogService.postBlogPhoto(id, fd);
      }
      toast({ title: 'Post atualizado!', className: 'bg-green-600 text-white' });
      navigate('/admin/blog');
    } catch (e) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Carregando...</div>;

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <Helmet title="Admin | Editar Post" />

      <div>
        <button
          onClick={() => navigate('/admin/blog')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0E3A2F] mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar ao Blog
        </button>

        <h1 className="text-2xl font-bold text-[#0E3A2F] mb-6">Editar Post</h1>

        <BlogForm
          form={form}
          onChange={setForm}
          photoPreview={photoPreview}
          onPhotoChange={handlePhoto}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/blog')}
          saving={saving}
          isEdit={true}
        />
      </div>
    </div>
  );
};

export default AdminBlogEditar;
