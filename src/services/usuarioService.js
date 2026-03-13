import { supabase } from '@/lib/supabaseClient';

export const carregarDadosUsuario = async (usuarioId) => {
  console.log('Carregando dados do usuário:', usuarioId);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('nome, email, telefone, cpf, cnh, endereco_rua, endereco_numero, endereco_complemento, endereco_cidade, endereco_estado, endereco_cep, data_nascimento')
      .eq('id', usuarioId)
      .single();

    if (error) throw error;

    console.log('Dados carregados:', data);
    return data;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return null;
  }
};

export const salvarDadosUsuario = async (usuarioId, dados) => {
  console.log(`[usuarioService] Salvando dados do usuário: ${usuarioId}`);
  console.log('[usuarioService] Dados originais:', dados);

  if (!usuarioId) {
    console.error('[usuarioService] Erro: ID do usuário obrigatório');
    return { success: false, error: 'ID do usuário obrigatório' };
  }

  if (!dados || typeof dados !== 'object') {
     console.error('[usuarioService] Erro: Dados inválidos fornecidos');
     return { success: false, error: 'Dados inválidos' };
  }

  try {
    // 1. Clean the data object - Remove system columns that should not be manually updated
    const cleanedData = { ...dados };
    
    // Explicitly remove forbidden fields
    delete cleanedData.id;
    delete cleanedData.created_at;
    delete cleanedData.updated_at;
    
    // Remove potential non-DB fields if they crept in (sanity check)
    delete cleanedData.is_sso_user;
    delete cleanedData.deleted_at;
    delete cleanedData.role; // Security: don't allow role updates here

    // Remove undefined values to avoid overwriting with NULL if not intended
    Object.keys(cleanedData).forEach(key => 
        cleanedData[key] === undefined && delete cleanedData[key]
    );

    console.log('[usuarioService] Dados para salvar (sem updated_at/id):', cleanedData);
    console.log('[usuarioService] Colunas sendo atualizadas:', Object.keys(cleanedData));

    // 2. Perform Update
    const { data, error } = await supabase
      .from('users')
      .update(cleanedData)
      .eq('id', usuarioId)
      .select()
      .single();

    if (error) {
      console.error('[usuarioService] Erro no Supabase:', error);
      throw error;
    }

    console.log('[usuarioService] Resposta:', data);
    return { success: true, data };

  } catch (error) {
    console.error('[usuarioService] Erro crítico ao salvar usuário:', error);
    return { success: false, error: error.message || 'Erro ao atualizar dados' };
  }
};

export const updateUsuario = salvarDadosUsuario; // Alias for backward compatibility

export const getUsuario = async (userId) => {
    console.log(`[USUARIO] Buscando dados: ${userId}`);
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error) throw error;
        return data;
    } catch (e) {
        console.error(`[USUARIO] Erro getUsuario:`, e);
        throw e;
    }
};