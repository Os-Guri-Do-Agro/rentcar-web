import { supabase } from '@/lib/supabaseClient';

const CAR_IMAGE_WIDTH = 1280;
const CAR_IMAGE_HEIGHT = 720; // 16:9 Aspect Ratio
const MAX_CAR_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Resizes and crops an image to a specific 16:9 aspect ratio using Canvas API
 */
export const resizeImage = (file, width = CAR_IMAGE_WIDTH, height = CAR_IMAGE_HEIGHT) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Calculate aspect ratios
        const sourceRatio = img.width / img.height;
        const targetRatio = width / height;

        let sourceWidth, sourceHeight, sourceX, sourceY;

        // Center crop logic
        if (sourceRatio > targetRatio) {
          // Source is wider than target
          sourceHeight = img.height;
          sourceWidth = img.height * targetRatio;
          sourceX = (img.width - sourceWidth) / 2;
          sourceY = 0;
        } else {
          // Source is taller than target
          sourceWidth = img.width;
          sourceHeight = img.width / targetRatio;
          sourceX = 0;
          sourceY = (img.height - sourceHeight) / 2;
        }

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          width,
          height
        );

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        }, 'image/jpeg', 0.9); // 90% quality
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Validates file type and size based on context (car or document)
 */
export const validateImage = (file, type = 'car') => {
  const allowedTypesCar = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedTypesDoc = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = type === 'car' ? MAX_CAR_IMAGE_SIZE : MAX_DOC_SIZE;
  const allowedTypes = type === 'car' ? allowedTypesCar : allowedTypesDoc;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo inválido. Permitido: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`);
  }

  if (file.size > maxSize) {
    throw new Error(`Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`);
  }

  return true;
};

/**
 * Uploads an image to Supabase Storage, resizing if it's a car image
 */
export const uploadImage = async (file, bucket, path = '', type = 'car') => {
  try {
    validateImage(file, type);

    let fileToUpload = file;
    let fileExt = file.name.split('.').pop();
    let contentType = file.type;

    // Resize car images to 16:9
    if (type === 'car' && file.type.startsWith('image/')) {
      fileToUpload = await resizeImage(file);
      fileExt = 'jpg'; // We convert to JPEG in resizeImage
      contentType = 'image/jpeg';
    }

    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const fullPath = path ? `${path}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fullPath, fileToUpload, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fullPath);

    return {
      url: publicUrlData.publicUrl,
      path: fullPath,
      name: fileName
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
};

export const deleteImage = async (bucket, path) => {
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
  return true;
};