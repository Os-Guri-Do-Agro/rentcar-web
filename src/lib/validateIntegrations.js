import { supabase } from '@/lib/supabaseClient';

export const testEmailConfig = async () => {
  try {
    const { data: configs } = await supabase
      .from('admin_configs')
      .select('valor')
      .eq('chave', 'email_admin')
      .single();

    const adminEmail = configs?.valor;
    if (!adminEmail) return { success: false, message: 'Email do admin não configurado.' };

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { 
        to: adminEmail, 
        subject: "Teste de Integração JL Rent (Validação)", 
        htmlBody: "<div style='font-family: sans-serif; color: #0E3A2F;'><h1>Teste Bem Sucedido! ✅</h1><p>Seu sistema de emails está configurado e respondendo corretamente.</p></div>" 
      }
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Falha desconhecida no envio.');

    return { success: true, message: `Email de teste enviado para ${adminEmail}` };
  } catch (error) {
    console.error('Email test error:', error);
    return { success: false, message: 'Falha no teste de email', error: error.message };
  }
};

export const testWhatsAppConfig = async () => {
  try {
    const { data: configs } = await supabase
      .from('admin_configs')
      .select('valor')
      .eq('chave', 'numero_whatsapp_admin')
      .single();

    const adminPhone = configs?.valor;
    if (!adminPhone) return { success: false, message: 'WhatsApp do admin não configurado.' };

    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: { 
        to: adminPhone, 
        message: "🤖 Teste JL Rent: Integração do WhatsApp funcionando corretamente! ✅" 
      }
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Falha desconhecida no envio.');

    return { success: true, message: `WhatsApp de teste enviado para ${adminPhone}` };
  } catch (error) {
    console.error('WhatsApp test error:', error);
    return { success: false, message: 'Falha no teste de WhatsApp', error: error.message };
  }
};