import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import blogService from '@/services/blog/blog-service';
import BlogForm from '@/components/admin/BlogForm';

const EMPTY_FORM = { titulo: '', subTitulo: '', conteudo: '', conclusao: '', ativo: true };

const AdminBlogNovo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await blogService.postBlog(form);
      const id = res.data?.id;
      if (photoFile && id) {
        const fd = new FormData();
        fd.append('file', photoFile);
        await blogService.postBlogPhoto(id, fd);
      }
      toast({ title: 'Post criado com sucesso!', className: 'bg-green-600 text-white' });
      navigate('/admin/blog');
    } catch (e) {
      toast({ title: 'Erro ao criar post', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <Helmet title="Admin | Novo Post" />

      <div>
        <button
          onClick={() => navigate('/admin/blog')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0E3A2F] mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar ao Blog
        </button>

        <h1 className="text-2xl font-bold text-[#0E3A2F] mb-6">Novo Post</h1>

        <BlogForm
          form={form}
          onChange={setForm}
          photoPreview={photoPreview}
          onPhotoChange={handlePhoto}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/blog')}
          saving={saving}
          isEdit={false}
        />
      </div>
    </div>
  );
};

export default AdminBlogNovo;
