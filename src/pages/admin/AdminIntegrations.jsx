import React, { useState, useEffect } from 'react';
import { Loader2, Phone, MessageCircle, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getWhatsAppNumber, setWhatsAppNumber, validateWhatsAppNumber } from '@/services/whatsappService';
import { generateWhatsAppLink } from '@/lib/whatsappUtils';

const AdminIntegrations = () => {
  const [whatsappNumber, setLocalWhatsappNumber] = useState('5511913123870');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadWhatsApp();
  }, []);

  const loadWhatsApp = async () => {
    try {
      setLoading(true);
      const number = await getWhatsAppNumber();
      if (number) setLocalWhatsappNumber(number);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar configuração do WhatsApp.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    
    // Validate while typing
    if (val.length > 0 && !validateWhatsAppNumber(val)) {
        if (val.length < 12) setError('Número muito curto (min 12 dígitos com 55)');
        else if (val.length > 13) setError('Número muito longo (max 13 dígitos)');
        else setError('');
    } else {
        setError('');
    }

    setLocalWhatsappNumber(val);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateWhatsAppNumber(whatsappNumber)) {
        toast({ title: "Número inválido", description: "Verifique o formato (55 + DDD + Número)", variant: "destructive" });
        return;
    }

    setSaving(true);
    try {
      await setWhatsAppNumber(whatsappNumber);
      toast({ title: "Salvo com sucesso!", className: "bg-green-600 text-white border-none" });
      console.log("Número de WhatsApp atualizado: " + whatsappNumber);
    } catch (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const runWhatsAppTest = () => {
      if (!validateWhatsAppNumber(whatsappNumber)) {
          toast({ title: "Número inválido para teste", variant: "destructive" });
          return;
      }
      const link = generateWhatsAppLink(whatsappNumber, "Teste de integração do Painel Administrativo");
      window.open(link, '_blank');
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#00D166]" size={40} /></div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0E3A2F] mb-2">Integrações</h1>
      <p className="text-gray-500 mb-8">Gerencie as conexões com serviços externos.</p>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* WhatsApp Config Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Phone size={24} /></div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">WhatsApp de Atendimento</h2>
                    <p className="text-sm text-gray-500">Este número será usado para todos os botões de contato no site.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número do WhatsApp (apenas números)</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={whatsappNumber} 
                            onChange={handlePhoneChange}
                            className={`w-full border rounded-lg p-3 bg-gray-50 focus:bg-white transition-colors focus:ring-2 outline-none ${error ? 'border-red-300 ring-red-100' : 'border-gray-200 focus:ring-[#00D166]'}`}
                            placeholder="5511913123870"
                        />
                        {whatsappNumber && validateWhatsAppNumber(whatsappNumber) && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                <MessageCircle size={20} />
                            </div>
                        )}
                    </div>
                    {error ? (
                        <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
                    ) : (
                        <p className="text-xs text-gray-500 mt-1">Exemplo: 5511913123870 (Código País + DDD + Número)</p>
                    )}
                </div>
                
                <div className="flex gap-3 pt-6">
                     <button 
                        type="button" 
                        onClick={runWhatsAppTest}
                        disabled={!validateWhatsAppNumber(whatsappNumber)}
                        className="px-4 py-3 bg-white border border-green-200 text-green-700 rounded-lg font-bold hover:bg-green-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MessageCircle size={18} /> Testar Link
                    </button>
                    
                    <button 
                        type="submit" 
                        disabled={saving || !!error}
                        className="px-6 py-3 bg-[#00D166] text-[#0E3A2F] rounded-lg font-bold shadow-md hover:bg-[#00F178] transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                        Salvar Configuração
                    </button>
                </div>
            </div>
        </div>

      </form>
    </div>
  );
};

export default AdminIntegrations;