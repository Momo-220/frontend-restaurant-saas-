// Service de stockage d'images pour NOMO Restaurant SaaS
// Utilise Supabase Storage uniquement pour les images
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase pour le stockage d'images uniquement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client Supabase pour le stockage
export const supabaseStorage = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Service d'upload d'images
export class ImageStorageService {
  private bucketName = 'restaurant-images';

  // Upload d'un fichier
  async uploadFile(file: File, folder: string = 'general'): Promise<string> {
    if (!supabaseStorage) {
      // Mode fallback - générer URL de test
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${timestamp}_${randomId}.${fileExtension}`;
      return `https://via.placeholder.com/400x300/4f46e5/ffffff?text=${encodeURIComponent(fileName)}`;
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}.${fileExtension}`;

    const { data, error } = await supabaseStorage.storage
      .from(this.bucketName)
      .upload(fileName, file);

    if (error) {
      console.error('Erreur upload:', error);
      throw new Error('Échec de l\'upload du fichier');
    }

    const { data: urlData } = supabaseStorage.storage
      .from(this.bucketName)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  // Upload d'un logo de restaurant
  async uploadLogo(file: File, restaurantId: string): Promise<string> {
    return this.uploadFile(file, `logos/${restaurantId}`);
  }

  // Upload d'une bannière de restaurant  
  async uploadBanner(file: File, restaurantId: string): Promise<string> {
    return this.uploadFile(file, `banners/${restaurantId}`);
  }

  // Upload d'une image de plat
  async uploadMenuItemImage(file: File, restaurantId: string, itemId: string): Promise<string> {
    return this.uploadFile(file, `menu-items/${restaurantId}/${itemId}`);
  }

  // Supprimer un fichier
  async deleteFile(filePath: string): Promise<boolean> {
    if (!supabaseStorage) return true;

    const { error } = await supabaseStorage.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Erreur suppression:', error);
      return false;
    }

    return true;
  }
}

// Instance singleton
export const imageStorage = new ImageStorageService();
