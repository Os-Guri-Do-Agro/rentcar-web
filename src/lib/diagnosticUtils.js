import { supabase } from '@/lib/supabaseClient';

// --- Database Schema Analysis ---

export const analyzeDatabaseSchema = async () => {
  const tables = ['users', 'reservas', 'reserva_documentos', 'cars'];
  const report = {};

  for (const table of tables) {
    report[table] = { columns: [], fks: [], policies: [] };
    
    // Columns
    // Note: accessing information_schema directly via Supabase client usually requires specific permissions or a function.
    // Standard JS client queries are limited to public tables. 
    // We will try to infer schema by selecting a single row or using rpc if available, 
    // but mostly we will log what we *expect* vs what we *can see* via basic queries.
    // However, the prompt asks for information_schema queries. 
    // If direct SQL is not possible, we simulate by checking table structure via a utility function if it exists,
    // or by inspecting a returned object structure.
    
    // Since we cannot run raw SQL like "SELECT * FROM information_schema..." easily with the JS client 
    // without a stored procedure, we will use a "best effort" approach by fetching one record
    // and inspecting the returned keys. 
    // OR we can try to use the 'rpc' if a specific introspection function was created (none listed in user prompt).
    // Given constraints, I will create a report based on accessibility.

    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        report[table].error = error.message;
        console.log(`[DB] Erro ao acessar tabela ${table}: ${error.message}`);
      } else if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        report[table].columns = columns;
        
        // Infer types roughly by checking values
        const types = {};
        columns.forEach(col => {
            const val = data[0][col];
            types[col] = typeof val;
            if (val instanceof Date) types[col] = 'date'; // rarely happens in JSON result
        });
        report[table].types = types;
        
        console.log(`[DB] Colunas da tabela ${table}: ${columns.join(', ')}`);
      } else {
        console.log(`[DB] Tabela ${table} acessível mas vazia. Impossível inferir colunas.`);
        report[table].status = 'empty';
      }
    } catch (e) {
      console.log(`[DB] Exceção ao analisar tabela ${table}: ${e.message}`);
    }
  }

  // Foreign Keys & Policies cannot be queried directly from JS client without admin RPC
  console.log(`[DB] Análise de Foreign Keys e Policies requer acesso direto ao banco ou RPC específico.`);
  
  return report;
};


// --- Code Analysis ---

export const analyzeReservaService = () => {
    const analysis = `
    [CODE] Funções em reservaService.js:
    1. createReserva:
       - Columns: usuario_id, carro_id, data_retirada, data_devolucao, valor_total, status, tipo_reserva, plano, etc.
       - Method: .insert().select().single()
       - Validation: Uses validatingDadosReserva()
       - Return: Object (via .single())
       - Error Handling: Try/catch with console error logging

    2. getReservaById:
       - Columns: All (*) + joins (users, cars)
       - Method: .select(..., users(*), cars(*)).eq().single()
       - Return: Object
       - Error Handling: Try/catch, checks for single response

    3. updateReservaStatus:
       - Columns: status, updated_at (implicit)
       - Method: .update().eq().select()
       - Return: Object (first item of array manually returned)
       - Error Handling: Try/catch

    4. getUserReservas:
       - Columns: Selected subset
       - Method: .select().eq().order()
       - Return: Array
       - Error Handling: Try/catch
    `;
    console.log(analysis);
    return analysis;
};

export const analyzeDocumentoService = () => {
    const analysis = `
    [CODE] Funções em documentoService.js:
    1. uploadDocumento:
       - Columns: reserva_id, tipo_documento, url_documento, arquivo_nome, arquivo_tamanho
       - Logic: Checks existing doc to upsert vs insert
       - Return: Object
       - Validation: Validates file type/size, validateReservaExists
    
    2. getDocumentos:
       - Columns: All relevant columns
       - Filter: reserva_id
       - Return: Array
    `;
    console.log(analysis);
    return analysis;
};

export const analyzeUsuarioService = () => {
    const analysis = `
    [CODE] Funções em usuarioService.js:
    1. updateUsuario:
       - Columns: nome, telefone, cpf, cnh, data_nascimento, endereco_*
       - Logic: Updates only provided fields
       - Return: Object (.single())
    `;
    console.log(analysis);
    return analysis;
};

export const analyzeComparisons = (dbReport) => {
    // This function compares expected vs actual
    // Since we did a best-effort DB scan, we compare against that
    
    const discrepancies = [];
    const tables = dbReport || {};
    
    // Check Reservas
    if (tables.reservas && tables.reservas.columns) {
        const expected = ['usuario_id', 'carro_id', 'data_retirada', 'data_devolucao', 'status'];
        const missing = expected.filter(c => !tables.reservas.columns.includes(c));
        if (missing.length > 0) discrepancies.push(`[COMPARE] Tabela 'reservas' pode estar faltando colunas: ${missing.join(', ')}`);
    }

    // Check Documents
    if (tables.reserva_documentos && tables.reserva_documentos.columns) {
        const expected = ['reserva_id', 'tipo_documento', 'url_documento'];
        const missing = expected.filter(c => !tables.reserva_documentos.columns.includes(c));
        if (missing.length > 0) discrepancies.push(`[COMPARE] Tabela 'reserva_documentos' pode estar faltando colunas: ${missing.join(', ')}`);
    }

    if (discrepancies.length === 0) {
        console.log("[COMPARE] Nenhuma discrepância óbvia encontrada entre código esperado e colunas visíveis.");
    } else {
        discrepancies.forEach(d => console.log(d));
    }

    return discrepancies;
};

export const identifyProblems = () => {
    const problems = [];
    
    // 1. MinhasReservas check logic
    problems.push("[PROBLEM] MinhasReservas: Verificar se a coluna 'user_id' existe na tabela 'reservas' ou se é 'usuario_id'. O código usa 'user_id' no filtro em alguns lugares e 'usuario_id' em outros.");

    // 2. Documents
    problems.push("[PROBLEM] UploadDocumento: Garantir que buckets do Storage têm permissões corretas (RLS) para escrita autenticada.");

    // 3. Email
    problems.push("[PROBLEM] Email: Verificar se as Edge Functions estão implantadas e se as chaves de API (Resend/SendGrid) estão configuradas nos Secrets.");

    return problems;
};

export const generateDiagnosticReport = async () => {
    console.log("[REPORT] Iniciando diagnóstico completo...");
    
    const dbReport = await analyzeDatabaseSchema();
    const codeReserva = analyzeReservaService();
    const codeDocs = analyzeDocumentoService();
    const codeUser = analyzeUsuarioService();
    const comparisons = analyzeComparisons(dbReport);
    const problems = identifyProblems();

    const fullReport = {
        timestamp: new Date().toISOString(),
        database: dbReport,
        code: {
            reserva: codeReserva,
            documentos: codeDocs,
            usuario: codeUser
        },
        comparisons,
        problems
    };

    console.log("[REPORT] Diagnóstico gerado com sucesso.");
    return fullReport;
};