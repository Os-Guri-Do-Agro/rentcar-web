import { supabase } from '@/lib/supabaseClient';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];

export const validateFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Tipo de arquivo não permitido: ${file.name}. Use PDF, JPG, PNG ou DOC.`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande: ${file.name}. Máximo permitido é 10MB.`);
  }
  return true;
};

export const uploadFile = async (file, bucket = 'reserva-documentos', path = '', userId = null) => {
  try {
    validateFile(file);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    // Determine path based on userId presence
    let fullPath;
    if (userId) {
        fullPath = `${userId}/${fileName}`;
    } else {
        fullPath = path ? `${path}/${fileName}` : fileName;
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fullPath);

    return {
      path: fullPath,
      url: publicUrlData.publicUrl,
      name: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const uploadMultipleFiles = async (files, bucket = 'reserva-documentos', path = '', userId = null) => {
  if (files.length > 5) {
    throw new Error('Máximo de 5 arquivos permitidos por vez.');
  }

  const uploadPromises = Array.from(files).map(file => uploadFile(file, bucket, path, userId));
  
  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

export const deleteFile = async (bucket, path) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const getFileUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return data.publicUrl;
};