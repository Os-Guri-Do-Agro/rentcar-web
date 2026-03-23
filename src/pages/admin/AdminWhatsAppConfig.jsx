import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2, MessageCircle, Mail, Settings, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getAdminConfigs, putAdminConfig } from '@/services/configService';

const FIELDS = [
  {
    key: 'numero_whatsapp_admin',
    label: 'WhatsApp Admin',
    placeholder: '11913123870',
    icon: MessageCircle,
    hint: 'Número que recebe notificações administrativas',
    rules: { required: 'WhatsApp admin é obrigatório' },
  },
  {
    key: 'whatsapp_numero',
    label: 'WhatsApp de Atendimento',
    placeholder: '11913123870',
    icon: MessageCircle,
    hint: 'Número exibido para clientes no site',
    rules: { required: 'WhatsApp de atendimento é obrigatório' },
  },
  {
    key: 'email_contato',
    label: 'E-mail de Contato',
    placeholder: 'contato@empresa.com',
    icon: Mail,
    rules: {
      required: 'E-mail é obrigatório',
      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' },
    },
  },
  {
    key: 'email_admin',
    label: 'E-mail Admin',
    placeholder: 'admin@empresa.com',
    icon: Mail,
    hint: 'Recebe cópias de notificações internas',
    rules: {
      required: 'E-mail admin é obrigatório',
    },
  },
  {
    key: 'company_phone',
    label: 'Telefone da Empresa',
    placeholder: '11 91312-3870',
    icon: Phone,
    rules: { required: 'Telefone é obrigatório' },
  },
];

const AdminWhatsAppConfig = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const configs = await getAdminConfigs();
        FIELDS.forEach(({ key }) => setValue(key, configs[key] ?? ''));
      } catch {
        toast({ title: 'Erro ao carregar', description: 'Não foi possível buscar as configurações.', variant: 'destructive' });
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [setValue, toast]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await Promise.all(FIELDS.map(({ key }) => putAdminConfig(key, data[key])));
      toast({ title: 'Sucesso', description: 'Configurações de contato atualizadas!', className: 'bg-green-600 text-white border-none' });
    } catch {
      toast({ title: 'Erro ao salvar', description: 'Falha ao salvar as alterações.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#0E3A2F]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Settings size={32} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurar Contato</h1>
          <p className="text-gray-500">Altere o número do WhatsApp e o e-mail de contato da empresa</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {FIELDS.map(({ key, label, placeholder, icon: Icon, hint, rules }) => (
            <div key={key}>
              <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
              <div className="relative">
                <input
                  type="text"
                  {...register(key, rules)}
                  placeholder={placeholder}
                  className="w-full p-3 pl-12 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon size={18} />
                </div>
              </div>
              {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
              {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key].message}</p>}
            </div>
          ))}

          <div className="pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[#0E3A2F] text-white font-bold rounded-xl hover:bg-[#165945] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <><Loader2 className="animate-spin" size={20} /> Salvando...</> : <><Save size={20} /> Salvar Alterações</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminWhatsAppConfig;
