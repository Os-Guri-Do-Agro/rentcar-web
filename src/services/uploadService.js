import { supabase } from '@/lib/supabaseClient';

export const uploadFotoAvaliacao = async (file) => {
    console.log("[uploadService] Uploading file:", file.name);
    
    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from('avaliacoes_fotos')
        .upload(filePath, file);

    if (error) {
        console.error("Error uploading photo:", error);
        throw error;
    }

    const { data: publicUrlData } = supabase.storage
        .from('avaliacoes_fotos')
        .getPublicUrl(filePath);

    return {
        path: filePath,
        url: publicUrlData.publicUrl
    };
};

export const deleteFotoAvaliacao = async (filePath) => {
    console.log("[uploadService] Deleting file:", filePath);
    const { error } = await supabase.storage
        .from('avaliacoes_fotos')
        .remove([filePath]);

    if (error) {
        console.error("Error deleting photo:", error);
        throw error;
    }
    return true;
};