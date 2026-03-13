import { supabase } from '@/lib/supabaseClient';

export const uploadFoto = async (arquivo, carroId, tipo) => {
    console.log(`[fotosService] Uploading ${tipo} for car ${carroId}`);
    
    const fileExt = arquivo.name.split('.').pop();
    const fileName = `${carroId}/${tipo}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('cars')
        .upload(filePath, arquivo);

    if (uploadError) {
        console.error("Upload Error:", uploadError);
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage.from('cars').getPublicUrl(filePath);
    return publicUrl;
};

export const updateFotoPrincipal = async (carroId, fotoUrl) => {
    console.log(`[fotosService] Updating main photo for ${carroId}`);
    const { error } = await supabase
        .from('cars')
        .update({ foto_principal: fotoUrl, imagem_url: fotoUrl }) // Sync legacy field
        .eq('id', carroId);
    if (error) throw error;
    return true;
};

export const updateFotosGaleria = async (carroId, fotos) => {
    console.log(`[fotosService] Updating gallery for ${carroId}`, fotos);
    const { error } = await supabase
        .from('cars')
        .update({ fotos_galeria: fotos })
        .eq('id', carroId);
    if (error) throw error;
    return true;
};

export const deleteFoto = async (fotoUrl) => {
    console.log(`[fotosService] Deleting photo ${fotoUrl}`);
    // Extract path from URL
    const path = fotoUrl.split('/storage/v1/object/public/cars/')[1];
    if (!path) return;

    const { error } = await supabase.storage.from('cars').remove([path]);
    if (error) console.error("Error deleting file:", error);
};