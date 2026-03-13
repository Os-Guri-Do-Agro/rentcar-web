import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2, Mail, Building, MapPin, Phone, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { testEmail } from '@/services/emailService';

const AdminEmailConfig = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailValue, setTestEmailValue] = useState('');
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const { toast } = useToast();
  
  const companyEmail = watch('company_email');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    console.log("Carregando configurações de email...");
    try {
      setInitialLoading(true);
      const { data, error } = await supabase
        .from('admin_configs')
        .select('*')
        .in('chave', ['company_name', 'company_email', 'company_phone', 'company_address']);

      if (error) throw error;

      console.log("Configurações carregadas:", data);
      
      const configMap = {};
      data.forEach(item => {
        configMap[item.chave] = item.valor;
      });

      setValue('company_name', configMap.company_name || 'JL Rent a Car');
      setValue('company_email', configMap.company_email || '');
      setValue('company_phone', configMap.company_phone || '');
      setValue('company_address', configMap.company_address || '');
      
      if (configMap.company_email) {
          setTestEmailValue(configMap.company_email);
      }

    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    console.log("Salvando configurações...", data);
    setLoading(true);
    try {
      const updates = Object.entries(data).map(([key, value]) => {
        return supabase
          .from('admin_configs')
          .upsert({ chave: key, valor: value, updated_at: new Date() }, { onConflict: 'chave' });
      });

      await Promise.all(updates);
      console.log("Configurações salvas com sucesso");
      
      toast({
        title: 'Sucesso',
        description: 'Configurações de email e contato atualizadas!',
        className: 'bg-green-600 text-white border-none',
      });
    } catch (error) {
      console.error(`Erro ao salvar configurações: ${error.message}`);
      toast({
        title: 'Erro ao salvar',
        description: 'Falha ao salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestEmail = async () => {
    const targetEmail = testEmailValue || companyEmail;
    
    if (!targetEmail) {
        toast({ title: "Email necessário", description: "Configure ou digite um email para testar.", variant: "destructive" });
        return;
    }

    console.log("Testando email...");
    setTestingEmail(true);
    try {
        const result = await testEmail(targetEmail);
        if (result.success) {
            console.log("Email de teste enviado com sucesso");
            toast({ title: "Sucesso!", description: `Email de teste enviado para ${targetEmail}`, className: "bg-green-600 text-white" });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error(`Erro ao enviar email de teste: ${error.message}`);
        toast({ title: "Erro no envio", description: error.message, variant: "destructive" });
    } finally {
        setTestingEmail(false);
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
        <div className="p-3 bg-green-100 rounded-xl">
          <Mail size={32} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuração de Email e Contato</h1>
          <p className="text-gray-500">Defina os dados que aparecerão nos emails enviados aos clientes</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Company Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nome da Locadora
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('company_name', { required: 'Nome é obrigatório' })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition-colors pl-12"
                placeholder="Ex: JL Rent a Car"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Building size={18} />
              </div>
            </div>
            {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Oficial (Remetente/Contato)
            </label>
            <div className="relative">
              <input
                type="email"
                {...register('company_email', { 
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email inválido"
                  }
                })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition-colors pl-12"
                placeholder="contato@empresa.com"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </div>
            </div>
            {errors.company_email && <p className="text-red-500 text-sm mt-1">{errors.company_email.message}</p>}
          </div>

          {/* Test Email Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Testar Integração</label>
             <div className="flex gap-2">
                 <input 
                    type="email" 
                    value={testEmailValue}
                    onChange={(e) => setTestEmailValue(e.target.value)}
                    placeholder="Email para teste..."
                    className="flex-1 p-2 border rounded-lg text-sm"
                 />
                 <button 
                    type="button" 
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2"
                 >
                    {testingEmail ? <Loader2 className="animate-spin" size={14}/> : <Send size={14}/>}
                    Testar
                 </button>
             </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Telefone de Suporte
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('company_phone', { required: 'Telefone é obrigatório' })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition-colors pl-12"
                placeholder="(11) 99999-9999"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone size={18} />
              </div>
            </div>
            {errors.company_phone && <p className="text-red-500 text-sm mt-1">{errors.company_phone.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Endereço Físico
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('company_address')}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition-colors pl-12"
                placeholder="Rua Exemplo, 123 - São Paulo/SP"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <MapPin size={18} />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0E3A2F] text-white font-bold rounded-xl hover:bg-[#165945] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEmailConfig;