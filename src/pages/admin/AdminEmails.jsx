import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2, Save, Mail, Copy, CheckCircle2 } from 'lucide-react';
import TiptapEditor from '@/components/admin/TiptapEditor';
import emailTemplateService from '@/services/emailTemplates/emailTemplate-service';
import { useToast } from '@/components/ui/use-toast';

const TIPOS_LABELS = {
  reserva_criada: 'Reserva Criada',
  reserva_aceita: 'Reserva Aceita',
  reserva_confirmada: 'Reserva Confirmada',
  reserva_cancelada: 'Reserva Cancelada',
  reserva_rejeitada: 'Reserva Rejeitada',
  envio_documentos: 'Envio de Documentos',
};

const ALL_TIPOS = Object.keys(TIPOS_LABELS);

const VARIAVEIS_DISPONIVEIS = [
  { key: 'nome_cliente',  label: 'Cliente' },
  { key: 'nome_carro',   label: 'Carro' },
  { key: 'data_retirada', label: 'Data Retirada' },
  { key: 'hora_retirada', label: 'Hora Retirada' },
  { key: 'hora_retirada_solicitada', label: 'Hora Solicitada' },
  { key: 'data_devolucao', label: 'Data Devolução' },
  { key: 'hora_devolucao', label: 'Hora Devolução' },
  { key: 'valor_total',  label: 'Valor Total' },
];

const AdminEmails = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [form, setForm] = useState({ assunto: '', corpo: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedVar, setCopiedVar] = useState(null);
  const editorRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await emailTemplateService.getEmailTemplates();
      const data = res?.data || [];
      setTemplates(data);
      // Seleciona o primeiro tipo fixo, com dados da API se existir
      const primeiro = ALL_TIPOS[0];
      const tplExistente = data.find(t => t.tipo === primeiro);
      setSelectedTipo(primeiro);
      setForm({ assunto: tplExistente?.assunto || '', corpo: tplExistente?.corpo || '' });
    } catch {
      toast({ title: 'Erro ao carregar templates', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const selectTipo = (tipo) => {
    const tpl = templates.find(t => t.tipo === tipo);
    const corpo = tpl?.corpo || '';
    setSelectedTipo(tipo);
    setForm({ assunto: tpl?.assunto || '', corpo });
    editorRef.current?.setContent(corpo);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await emailTemplateService.putEmailTemplate(selectedTipo, form);
      toast({ title: 'Template salvo com sucesso!', className: 'bg-green-600 text-white' });
      setTemplates(prev =>
        prev.map(t => (t.tipo === selectedTipo ? { ...t, ...form } : t))
      );
    } catch {
      toast({ title: 'Erro ao salvar template', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleInsertVar = (v) => {
    editorRef.current?.insertText(`{{${v}}}`);
    setCopiedVar(v);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-[#00D166] mx-auto" size={36} />
          <p className="text-sm text-gray-400 font-medium">Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <Helmet title="Admin | E-mails" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-[#0E3A2F] rounded-xl">
          <Mail size={22} className="text-[#00D166]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0E3A2F] leading-tight">Modelos de E-mail</h1>
          <p className="text-sm text-gray-400 mt-0.5">Edite os textos enviados automaticamente ao cliente</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar */}
        <div className="w-full lg:w-60 shrink-0 lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Templates</p>
            </div>
            <div className="p-2 space-y-0.5">
              {ALL_TIPOS.map(tipo => {
                const existe = templates.some(t => t.tipo === tipo);
                const isActive = selectedTipo === tipo;
                return (
                  <button
                    key={tipo}
                    onClick={() => selectTipo(tipo)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2.5 group ${
                      isActive
                        ? 'bg-[#0E3A2F] text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Mail
                      size={15}
                      className={isActive ? 'text-[#00D166] shrink-0' : 'text-gray-300 shrink-0 group-hover:text-gray-400'}
                    />
                    <span className="truncate flex-1 text-sm">{TIPOS_LABELS[tipo]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Card header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Editando</p>
                <h2 className="text-lg font-bold text-[#0E3A2F]">
                  {TIPOS_LABELS[selectedTipo] || '—'}
                </h2>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !selectedTipo}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0E3A2F] hover:bg-[#165945] text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Assunto */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Assunto</label>
                <input
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#00D166] focus:outline-none transition-colors"
                  value={form.assunto}
                  onChange={e => setForm({ ...form, assunto: e.target.value })}
                  placeholder="Ex: Sua reserva foi confirmada!"
                />
              </div>

              {/* Corpo */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Corpo do E-mail</label>
                <TiptapEditor ref={editorRef} value={form.corpo} onChange={c => setForm({ ...form, corpo: c })} />
              </div>
            </div>
          </div>

          {/* Variáveis */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Copy size={15} className="text-gray-400" />
              <p className="text-sm font-bold text-gray-700">Variáveis disponíveis</p>
              <span className="text-xs text-gray-400">— clique para inserir no editor</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {VARIAVEIS_DISPONIVEIS.map(({ key, label }) => {
                const copied = copiedVar === key;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => handleInsertVar(key)}
                    title={`{{${key}}}`}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      copied
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                    }`}
                  >
                    {copied
                      ? <CheckCircle2 size={12} className="text-green-500" />
                      : <Copy size={12} className="opacity-50" />
                    }
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmails;
