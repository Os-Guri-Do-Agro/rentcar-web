import { supabase } from '@/lib/supabaseClient';

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validateEmail = (email) => {
  if (!email) return { valid: false, error: 'E-mail é obrigatório.' };
  if (!isValidEmail(email)) return { valid: false, error: 'E-mail inválido.' };
  return { valid: true };
};

export const validatePhone = (phone) => {
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  if (!cleanPhone) return { valid: false, error: 'Telefone é obrigatório.' };
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return { valid: false, error: 'Telefone deve ter 10 ou 11 dígitos.' };
  return { valid: true };
};

export const validateCPF = (cpf) => {
  const cleanCPF = cpf ? cpf.replace(/\D/g, '') : '';
  if (!cleanCPF) return { valid: false, error: 'CPF é obrigatório.' };
  
  if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) {
    return { valid: false, error: 'CPF inválido.' };
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return { valid: false, error: 'CPF inválido.' };

  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return { valid: false, error: 'CPF inválido.' };

  return { valid: true };
};

export const validateCEP = (cep) => {
  const cleanCEP = cep ? cep.replace(/\D/g, '') : '';
  if (!cleanCEP) return { valid: false, error: 'CEP é obrigatório.' };
  if (cleanCEP.length !== 8) return { valid: false, error: 'CEP deve ter 8 dígitos.' };
  return { valid: true };
};

export const validateCNH = (cnh) => {
  const cleanCNH = cnh ? cnh.replace(/\D/g, '') : '';
  if (!cleanCNH) return { valid: false, error: 'CNH é obrigatória.' };
  if (cleanCNH.length !== 11) return { valid: false, error: 'CNH deve ter 11 dígitos.' };
  return { valid: true };
};

export const formatCPF = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const formatPhone = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export const formatCEP = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

export const formatarTamanhoArquivo = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validates if the file is a PDF and respects size limits (10MB).
 * @param {File} file 
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validatePDFFile = (file) => {
  console.log("Validando arquivo PDF:", file?.name, file?.type, file?.size);
  if (!file) {
    console.error("Validação de arquivo falhou: Nenhum arquivo selecionado");
    return { valid: false, error: 'Nenhum arquivo selecionado.' };
  }

  // Check 1: Extension
  if (!file.name.toLowerCase().endsWith('.pdf')) {
      console.error(`Validação de arquivo falhou: Extensão incorreta (${file.name}).`);
      return { valid: false, error: 'O arquivo deve ser um PDF.' };
  }

  // Check 2: MIME Type
  if (file.type !== 'application/pdf') {
     console.error(`Validação de arquivo falhou: Tipo MIME ${file.type} não permitido. Apenas PDF.`);
     return { valid: false, error: 'Formato inválido. Apenas arquivos PDF são permitidos.' };
  }
  
  // Check 3: Size (10MB = 10 * 1024 * 1024 bytes)
  const MAX_SIZE_MB = 10;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (file.size > MAX_SIZE_BYTES) {
    console.error(`Validação de arquivo falhou: Tamanho ${file.size} excede limite`);
    return { valid: false, error: `Arquivo muito grande (${(file.size/1024/1024).toFixed(2)}MB). Máximo permitido é ${MAX_SIZE_MB}MB.` };
  }

  console.log("Arquivo válido:", file.name);
  return { valid: true };
};

// Deprecated alias for backward compatibility
export const validateDocumentFile = validatePDFFile;

export const isValidUUID = (value) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(value);
};

export const validateReservaExists = async (reservaId) => {
  if (!isValidUUID(reservaId)) return false;

  try {
    const { data, error } = await supabase
      .from('reservas')
      .select('id')
      .eq('id', reservaId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  } catch (err) {
    return false;
  }
};