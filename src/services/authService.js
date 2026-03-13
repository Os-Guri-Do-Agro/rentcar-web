import { supabase } from '@/lib/supabaseClient';
import { validateCPF, validatePhone, validateCEP } from '@/lib/validationUtils';

// Helper for regex validation
const validateEmailFormat = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const handleRlsError = (error, context = 'operation') => {
  if (error?.code === '42501') {
    console.error(`RLS Violation during ${context}:`, error);
    throw new Error(`Acesso negado (${context}). Verifique se você tem permissão para esta ação.`);
  }
  throw error;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const insertUserProfileWithRetry = async (user, nome, attempts = 3) => {
  for (let i = 0; i < attempts; i++) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert([
          { 
            id: user.id,
            email: user.email,
            nome: nome,
            role: 'user' 
          }
        ], { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (i === attempts - 1) throw error;
      await delay(1000);
    }
  }
};

/**
 * Checks password strength against security criteria
 * @param {string} password 
 * @returns {Object} score ('weak'|'medium'|'strong') and requirements array
 */
export const validatePasswordStrength = (password) => {
  if (!password) return { score: 'weak', requirements: [] };

  const requirements = [
    { id: 'length', label: 'Mínimo de 8 caracteres', met: password.length >= 8 },
    { id: 'uppercase', label: 'Letra maiúscula', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'Letra minúscula', met: /[a-z]/.test(password) },
    { id: 'number', label: 'Número', met: /[0-9]/.test(password) },
    { id: 'special', label: 'Caractere especial (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const metCount = requirements.filter(r => r.met).length;
  
  let score = 'weak';
  if (metCount >= 5) score = 'strong';
  else if (metCount >= 3) score = 'medium';

  return { score, requirements };
};

export const login = async (email, password) => {
  try {
    const cleanEmail = String(email).trim();

    if (!validateEmailFormat(cleanEmail)) {
      throw new Error("Formato de e-mail inválido.");
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError) {
      if (authError.message.includes("Invalid login credentials")) {
         throw new Error("E-mail ou senha incorretos.");
      }
      throw authError;
    }

    if (!authData.user) throw new Error("Usuário não encontrado.");

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.warn("Could not fetch user profile:", profileError);
      return { ...authData.user, role: 'user' }; 
    }

    return { ...authData.user, ...profile };

  } catch (error) {
    throw error;
  }
};

export const register = async (email, password, nome) => {
  const cleanEmail = String(email).trim();
  const cleanNome = String(nome).trim();
  
  if (!validateEmailFormat(cleanEmail)) throw new Error("O e-mail informado é inválido.");
  if (!cleanNome || cleanNome.length < 2) throw new Error("O nome é obrigatório.");
  
  const strength = validatePasswordStrength(password);
  if (strength.score === 'weak') {
    throw new Error("A senha é muito fraca. Use letras maiúsculas, números e caracteres especiais.");
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { nome: cleanNome }
      }
    });

    if (authError) {
      if (authError.message.includes("User already registered") || authError.status === 422) {
        throw new Error("Este e-mail já está cadastrado.");
      }
      throw authError;
    }

    if (!authData.user) throw new Error("Falha ao criar usuário. Tente novamente.");

    await insertUserProfileWithRetry(authData.user, cleanNome);

    return { ...authData.user, nome: cleanNome, role: 'user' };

  } catch (error) {
    console.error("Registration fatal error:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) return null;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return user;
    }
    
    return { ...user, ...profile };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const updateUserProfile = async (usuarioId, updates) => {
  try {
    if (updates.role) {
      delete updates.role;
      console.warn("Attempt to update role via profile update blocked.");
    }

    if (updates.cpf) {
      const cpfValidation = validateCPF(updates.cpf);
      if (!cpfValidation.valid) throw new Error(cpfValidation.error);
    }
    if (updates.telefone) {
      const phoneValidation = validatePhone(updates.telefone);
      if (!phoneValidation.valid) throw new Error(phoneValidation.error);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', usuarioId)
      .select()
      .single();

    if (error) handleRlsError(error, 'updateProfile');

    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

/**
 * Uploads a profile photo to Supabase Storage
 * @param {string} usuarioId - User ID
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export const uploadProfilePhoto = async (usuarioId, file) => {
  try {
    if (!file) throw new Error("Nenhum arquivo selecionado.");
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error("Tipo de arquivo inválido. Use JPG, PNG, WebP ou GIF.");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("Arquivo muito grande. Máximo 5MB.");
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${usuarioId}/${timestamp}.${fileExt}`;

    // Upload to storage
    const { data, error: uploadError } = await supabase.storage
      .from('user_avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user_avatars')
      .getPublicUrl(fileName);

    // Update user profile with new photo URL
    await updateUserProfile(usuarioId, { foto_perfil_url: publicUrl });

    return publicUrl;
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    throw error;
  }
};

/**
 * Sends a password recovery email to the user
 * @param {string} email 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendPasswordRecoveryEmail = async (email) => {
  console.log('[Auth] Iniciando recuperação de senha para:', email);
  
  if (!validateEmailFormat(email)) {
    console.error('[Auth] Email inválido:', email);
    return { success: false, error: 'Formato de e-mail inválido.' };
  }

  try {
    // Determine redirect URL (should be the reset password page)
    const redirectTo = `${window.location.origin}/reset-password`;
    console.log('[Auth] Redirect URL configurada:', redirectTo);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    if (error) {
      console.error('[Auth] Erro Supabase resetPassword:', error);
      // Supabase generic error for security privacy (sometimes) but we return specifics if possible
      throw error;
    }

    console.log('[Auth] Email de recuperação enviado com sucesso.');
    return { success: true };
  } catch (error) {
    console.error('[Auth] Exceção em sendPasswordRecoveryEmail:', error);
    return { success: false, error: error.message || "Erro ao enviar email de recuperação." };
  }
};

/**
 * Resets the user's password. 
 * NOTE: This function requires an active session (which Supabase automatically handles 
 * when the user clicks the recovery link).
 * @param {string} newPassword 
 * @param {string} [token] - Optional in implicit flow, Supabase handles token in URL hash
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const resetPassword = async (newPassword, token = null) => {
  console.log('[Auth] Tentando redefinir senha...');

  const strength = validatePasswordStrength(newPassword);
  if (strength.score === 'weak') {
    return { 
      success: false, 
      error: 'A senha é muito fraca. Verifique os requisitos de segurança.' 
    };
  }

  try {
    // Check if session exists (standard flow) or if we need to verify OTP (custom flow)
    // If token is explicitly passed and no session, we might try verifyOtp, 
    // but usually we rely on the session established by the redirect.
    
    // Attempt update
    const { data, error } = await supabase.auth.updateUser({ 
      password: newPassword 
    });

    if (error) {
      console.error('[Auth] Erro ao atualizar senha:', error);
      throw error;
    }

    console.log('[Auth] Senha atualizada com sucesso.');
    return { success: true };
  } catch (error) {
    console.error('[Auth] Exceção em resetPassword:', error);
    return { success: false, error: error.message || "Falha ao redefinir a senha." };
  }
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};