import { supabase } from '@/lib/supabaseClient';

const log = (msg, type = 'info') => {
  const prefix = '[DB_VERIFY]';
  if (type === 'error') console.error(`${prefix} ❌ ${msg}`);
  else if (type === 'success') console.log(`${prefix} ✅ ${msg}`);
  else console.log(`${prefix} ℹ️ ${msg}`);
};

export const verifyUsersTable = async () => {
  log("Verificando tabela 'users'...");
  try {
    const { error } = await supabase.from('users').select('id, email, nome, role').limit(1);
    if (error) throw error;
    log("Tabela 'users' acessível e colunas básicas verificadas.", 'success');
    return true;
  } catch (error) {
    log(`Falha na tabela 'users': ${error.message}`, 'error');
    return false;
  }
};

export const verifyReservasTable = async () => {
  log("Verificando tabela 'reservas'...");
  try {
    const { error } = await supabase
      .from('reservas')
      .select('id, usuario_id, carro_id, status, created_at')
      .limit(1);
    if (error) throw error;
    log("Tabela 'reservas' acessível e colunas principais verificadas.", 'success');
    return true;
  } catch (error) {
    log(`Falha na tabela 'reservas': ${error.message}`, 'error');
    return false;
  }
};

export const verifyReservaDocumentosTable = async () => {
  log("Verificando tabela 'reserva_documentos'...");
  try {
    const { error } = await supabase
      .from('reserva_documentos')
      .select('id, reserva_id, tipo_documento, url_documento')
      .limit(1);
    if (error) throw error;
    log("Tabela 'reserva_documentos' acessível.", 'success');
    return true;
  } catch (error) {
    log(`Falha na tabela 'reserva_documentos': ${error.message}`, 'error');
    return false;
  }
};

export const verifyCarsTable = async () => {
  log("Verificando tabela 'cars'...");
  try {
    const { error } = await supabase.from('cars').select('id, nome, marca, placa').limit(1);
    if (error) throw error;
    log("Tabela 'cars' acessível.", 'success');
    return true;
  } catch (error) {
    log(`Falha na tabela 'cars': ${error.message}`, 'error');
    return false;
  }
};

export const verifyForeignKeys = async () => {
  log("Verificando chaves estrangeiras (simulação)...");
  // Cannot directly verify FKs via JS client easily, but we can try a join
  try {
    const { error } = await supabase
      .from('reservas')
      .select('id, users(id, email), cars(id, nome)')
      .limit(1);
    
    if (error) throw error;
    log("Relacionamentos (Joins) 'users' e 'cars' em 'reservas' funcionando.", 'success');
    return true;
  } catch (error) {
    log(`Falha nos relacionamentos: ${error.message}`, 'error');
    return false;
  }
};

export const verifyRLSPolicies = async () => {
  log("Verificando políticas RLS (tentativa de leitura pública)...");
  try {
    // Attempt to read cars (usually public)
    const { data: cars, error: carsError } = await supabase.from('cars').select('id').limit(1);
    if (carsError) throw carsError;
    log(`Leitura de 'cars' OK (Retornou ${cars.length} registros).`, 'success');

    return true;
  } catch (error) {
    log(`Erro ao verificar políticas: ${error.message}`, 'error');
    return false;
  }
};

export const runFullDatabaseVerification = async () => {
  log("=== INICIANDO VERIFICAÇÃO DO BANCO DE DADOS ===");
  
  const results = {
    users: await verifyUsersTable(),
    cars: await verifyCarsTable(),
    reservas: await verifyReservasTable(),
    documentos: await verifyReservaDocumentosTable(),
    fks: await verifyForeignKeys(),
    policies: await verifyRLSPolicies()
  };

  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    log("=== DIAGNÓSTICO COMPLETO: TUDO PARECE CORRETO ✅ ===", 'success');
  } else {
    log("=== DIAGNÓSTICO COMPLETO: ENCONTRADOS ERROS ❌ ===", 'error');
  }
  
  return results;
};