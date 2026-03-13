import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Loader2, Save, RotateCcw, Mail } from 'lucide-react';
import { getTemplates, updateTemplate } from '@/services/emailTemplateService';
import EmailPreview from '@/components/EmailPreview';
import { useToast } from '@/components/ui/use-toast';

const AdminEmails = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [form, setForm] = useState({ assunto: '', corpo: '', variaveis: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await getTemplates();
            setTemplates(data || []);
            if (data && data.length > 0) {
                selectTemplate(data[0]);
            }
        } catch (e) {
            toast({ title: "Erro ao carregar templates", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const selectTemplate = (tpl) => {
        setSelectedType(tpl.tipo);
        setForm({ 
            assunto: tpl.assunto, 
            corpo: tpl.corpo, 
            variaveis: tpl.variaveis || [] 
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateTemplate(selectedType, form.assunto, form.corpo);
            toast({ title: "Template salvo com sucesso!", className: "bg-green-600 text-white" });
            
            setTemplates(prev => prev.map(t => t.tipo === selectedType ? { ...t, ...form } : t));
        } catch (e) {
            toast({ title: "Erro ao salvar", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'link'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['clean']
        ],
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline text-[#00D166]"/></div>;

    const currentTemplate = templates.find(t => t.tipo === selectedType);

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
            <Helmet title="Admin | E-mails" />
            <h1 className="text-3xl font-bold text-[#0E3A2F] mb-8">Gerenciar Modelos de E-mail</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    {templates.map(tpl => (
                        <button
                            key={tpl.id}
                            onClick={() => selectTemplate(tpl)}
                            className={`w-full text-left p-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${selectedType === tpl.tipo ? 'bg-[#0E3A2F] text-white shadow-md' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'}`}
                        >
                            <Mail size={16} className={selectedType === tpl.tipo ? "text-[#00D166]" : "text-gray-400"}/>
                            <span className="truncate">{tpl.nome || tpl.tipo}</span>
                        </button>
                    ))}
                </div>

                {/* Editor */}
                <div className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#0E3A2F]">{currentTemplate?.nome}</h2>
                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="bg-[#00D166] text-[#0E3A2F] px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#00b355] disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Salvar
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Assunto</label>
                            <input 
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#00D166] outline-none"
                                value={form.assunto}
                                onChange={e => setForm({...form, assunto: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Corpo do E-mail</label>
                            <ReactQuill 
                                theme="snow" 
                                value={form.corpo} 
                                onChange={c => setForm({...form, corpo: c})} 
                                modules={modules}
                                className="h-[300px] mb-12"
                            />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                            <p className="font-bold mb-2">Variáveis Disponíveis:</p>
                            <div className="flex flex-wrap gap-2">
                                {form.variaveis.map(v => (
                                    <span key={v} className="bg-white border border-blue-200 px-2 py-1 rounded font-mono text-xs cursor-pointer hover:bg-blue-100" onClick={() => {
                                        // Ideally insert at cursor, but simple copy is fine for now
                                        navigator.clipboard.writeText(`{{${v}}}`);
                                        toast({ title: "Copiado!", duration: 1000 });
                                    }}>
                                        {`{{${v}}}`}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="lg:col-span-4">
                    <h3 className="font-bold text-gray-500 mb-2 uppercase text-xs">Visualização em Tempo Real</h3>
                    <EmailPreview content={form.corpo} variables={form.variaveis} />
                </div>
            </div>
        </div>
    );
};

export default AdminEmails;