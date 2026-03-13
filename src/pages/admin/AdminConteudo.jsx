import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { getAllConteudo, updateConteudo } from '@/services/conteudoService';
import { useToast } from '@/components/ui/use-toast';

const AdminConteudo = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlug, setSelectedSlug] = useState('');
    const [form, setForm] = useState({ titulo: '', conteudo: '' });
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        try {
            console.log("Fetching content pages for admin...");
            const data = await getAllConteudo();
            
            // Ensure mandatory pages exist in the list even if not in DB yet (though service handles insertion on update)
            // This is just for UI display
            const requiredSlugs = [
                { slug: 'termos-uso', titulo: 'Termos de Uso' },
                { slug: 'politica-privacidade', titulo: 'Política de Privacidade' },
                { slug: 'termos-regras', titulo: 'Termos e Regras Gerais' },
                { slug: 'norma-lgpd', titulo: 'Norma LGPD' }
            ];
            
            // Merge existing data with required slugs
            const mergedPages = [...(data || [])];
            
            requiredSlugs.forEach(req => {
                if (!mergedPages.find(p => p.slug === req.slug)) {
                    mergedPages.push({ ...req, conteudo: '' });
                }
            });

            setPages(mergedPages);
            
            if (mergedPages.length > 0) {
                selectPage(mergedPages[0]);
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Erro ao carregar conteúdo", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const selectPage = (page) => {
        setSelectedSlug(page.slug);
        setForm({ titulo: page.titulo, conteudo: page.conteudo || '' });
    };

    const handleSave = async () => {
        setSaving(true);
        console.log("Saving content for:", selectedSlug);
        try {
            await updateConteudo(selectedSlug, form.titulo, form.conteudo);
            toast({ title: "Conteúdo salvo com sucesso!", className: "bg-green-600 text-white" });
            
            // Update local list state
            setPages(prev => prev.map(p => p.slug === selectedSlug ? { ...p, ...form } : p));
        } catch (e) {
            console.error(e);
            toast({ title: "Erro ao salvar", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link'],
            ['clean']
        ],
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline text-[#0E3A2F]"/></div>;

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
            <Helmet title="Admin | Conteúdo Legal" />
            <h1 className="text-3xl font-bold text-[#0E3A2F] mb-8">Editar Páginas de Conteúdo</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-bold mb-4 text-gray-500 uppercase text-xs">Páginas Disponíveis</h3>
                    <div className="space-y-2">
                        {pages.map(page => (
                            <button
                                key={page.slug}
                                onClick={() => selectPage(page)}
                                className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${selectedSlug === page.slug ? 'bg-[#0E3A2F] text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                                {page.titulo}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#0E3A2F]">Editando: {form.titulo}</h2>
                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="bg-[#00D166] text-[#0E3A2F] px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#00b355] disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} Salvar
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Título da Página</label>
                        <input 
                            className="w-full p-3 border rounded-lg font-bold text-lg focus:ring-2 focus:ring-[#00D166] outline-none" 
                            value={form.titulo}
                            onChange={e => setForm({...form, titulo: e.target.value})}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Conteúdo</label>
                        <ReactQuill 
                            theme="snow" 
                            value={form.conteudo} 
                            onChange={c => setForm({...form, conteudo: c})} 
                            modules={modules}
                            className="h-[420px] mb-12"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminConteudo;