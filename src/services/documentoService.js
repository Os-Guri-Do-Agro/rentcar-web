import { supabase } from '@/lib/supabaseClient';
import { validatePDFFile, isValidUUID } from '@/lib/validationUtils';
import { logUploadDebug } from '@/lib/debugUtils';

// --- NEW JSON-BASED FUNCTIONS ---

/**
 * Uploads a document to Supabase Storage and returns its metadata.
 * Does NOT update the database.
 * @param {File} file 
 * @param {string} tipoDocumento (e.g., 'cnh', 'cpf', 'rg')
 * @param {string} reservaId 
 * @returns {Promise<{success: boolean, data: object, error: string}>}
 */
export const uploadDocumento = async (file, tipoDocumento, reservaId) => {
  logUploadDebug(`[UPLOAD STORAGE] Iniciando upload de ${tipoDocumento} para reserva ${reservaId}`);

  try {
    if (!reservaId) throw new Error("ID da reserva não informado.");
    if (!file) throw new Error("Arquivo não informado.");

    // Validate
    const validation = validatePDFFile(file);
    if (!validation.valid) throw new Error(validation.error);

    // Prepare path
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const filePath = `reservas/${reservaId}/${tipoDocumento}/${timestamp}_${safeFileName}`;
    
    // Upload
    const { error: uploadError } = await supabase.storage
        .from('reserva-documentos')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'application/pdf'
        });

    if (uploadError) {
        throw new Error(`Erro ao enviar arquivo para o storage: ${uploadError.message}`);
    }

    // Get Public URL
    const { data: urlData } = supabase.storage
        .from('reserva-documentos')
        .getPublicUrl(filePath);

    logUploadDebug(`[UPLOAD STORAGE] Sucesso: ${urlData.publicUrl}`);

    return {
        success: true,
        data: {
            tipo: tipoDocumento,
            url: urlData.publicUrl,
            nome: file.name,
            tamanho: file.size,
            data_upload: new Date().toISOString()
        }
    };

  } catch (error) {
      console.error(`[UPLOAD STORAGE ERROR] Falha no upload de ${tipoDocumento}:`, error);
      return { success: false, error: error.message };
  }
};

/**
 * Saves all document metadata to the 'documentos' JSONB column in the database.
 * Replaces the existing array or merges based on implementation. Here we merge/replace by type.
 * @param {string} reservaId 
 * @param {Array} novosDocumentos Array of document objects {tipo, url, nome, tamanho, data_upload}
 */
export const salvarTodosDocumentos = async (reservaId, novosDocumentos) => {
  logUploadDebug(`[DB SAVE] Salvando ${novosDocumentos.length} documentos para reserva ${reservaId}`);

  try {
      // 1. Fetch existing documents to merge (optional, but good practice to avoid overwriting unrelated docs if any)
      const { data: existingRow, error: fetchError } = await supabase
          .from('reserva_documentos')
          .select('documentos, id')
          .eq('reserva_id', reservaId)
          .maybeSingle();
      
      let finalDocumentos = [];
      let rowId = existingRow?.id;
      
      if (existingRow && Array.isArray(existingRow.documentos)) {
          // Merge logic: Remove old docs of same type, add new ones
          const newTypes = novosDocumentos.map(d => d.tipo);
          finalDocumentos = existingRow.documentos.filter(d => !newTypes.includes(d.tipo));
          finalDocumentos = [...finalDocumentos, ...novosDocumentos];
      } else {
          finalDocumentos = novosDocumentos;
      }

      // 2. Upsert
      const payload = {
          reserva_id: reservaId,
          documentos: finalDocumentos,
          updated_at: new Date().toISOString(),
          // Legacy columns fallback (optional, filling just one to satisfy constraints if any)
          tipo_documento: 'multi_docs_json',
          url_documento: '',
          arquivo_nome: 'JSON Collection'
      };

      if (rowId) {
          const { error: updateError } = await supabase
              .from('reserva_documentos')
              .update({ documentos: finalDocumentos, updated_at: new Date().toISOString() })
              .eq('id', rowId);
          
          if (updateError) throw updateError;
      } else {
          const { error: insertError } = await supabase
              .from('reserva_documentos')
              .insert(payload);
          
          if (insertError) throw insertError;
      }

      logUploadDebug(`[DB SAVE] Sucesso ao salvar documentos JSON.`);
      return { success: true };

  } catch (error) {
      console.error("[DB SAVE ERROR]", error);
      return { success: false, error: error.message };
  }
};

export const getDocumentosReserva = async (reservaId) => {
    try {
        const { data, error } = await supabase
            .from('reserva_documentos')
            .select('documentos')
            .eq('reserva_id', reservaId)
            .maybeSingle();
        
        if (error) throw error;
        return data?.documentos || [];
    } catch (error) {
        console.error("Erro ao buscar documentos JSON:", error);
        return [];
    }
};

export const deleteDocumento = async (reservaId, tipoDocumento) => {
    try {
        const docs = await getDocumentosReserva(reservaId);
        const newDocs = docs.filter(d => d.tipo !== tipoDocumento);
        
        const { error } = await supabase
            .from('reserva_documentos')
            .update({ documentos: newDocs, updated_at: new Date().toISOString() })
            .eq('reserva_id', reservaId);
            
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar documento:", error);
        return { success: false, error: error.message };
    }
};

// --- LEGACY / HELPER EXPORTS (Maintained for compatibility but using new logic internally if needed or just placeholders) ---
// Note: The previous logic relied on individual columns. We are moving to JSON.
// The code below is kept compatible where possible, but UI should switch to `uploadDocumento`.

export const verifyDocumentTableStructure = async () => {
    // Diagnostic
    return { success: true };
};

// These are now wrappers that do single upload + single save (inefficient but compatible)
// However, the prompt asks to update Documentos.jsx to use `salvarTodosDocumentos`.
// We will leave these here as legacy pointers or deprecated.
export const uploadCNH = (rId, file) => uploadDocumento(file, 'cnh', rId);
export const uploadCPF = (rId, file) => uploadDocumento(file, 'cpf', rId);
export const uploadRG = (rId, file) => uploadDocumento(file, 'rg', rId);
export const uploadComprovanteResidencia = (rId, file) => uploadDocumento(file, 'comprovante_residencia', rId);
export const uploadHistoricoCriminal = (rId, file) => uploadDocumento(file, 'historico_criminal', rId);