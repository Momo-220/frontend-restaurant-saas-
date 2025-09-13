import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service pour l'upload d'images
export class SupabaseStorageService {
  private bucketName = 'restaurant-images';

  // Initialiser le bucket (à faire une seule fois)
  async initializeBucket() {
    try {
      const { data, error } = await supabase.storage.createBucket(this.bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 10 * 1024 * 1024, // 10MB max
      });

      if (error && error.message !== 'Bucket already exists') {
        console.error('Erreur création bucket:', error);
        throw error;
      }

      console.log('Bucket initialisé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur initialisation bucket:', error);
      return false;
    }
  }

  // Upload d'un fichier
  async uploadFile(file: File, folder: string = 'general'): Promise<string> {
    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${folder}/${timestamp}_${randomId}.${fileExtension}`;

      // Upload du fichier
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erreur upload:', error);
        throw new Error(`Erreur upload: ${error.message}`);
      }

      // Récupérer l'URL publique
      const { data: publicData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      return publicData.publicUrl;
    } catch (error) {
      console.error('Erreur upload fichier:', error);
      throw error;
    }
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
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Erreur suppression:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur suppression fichier:', error);
      return false;
    }
  }

  // Lister les fichiers d'un dossier
  async listFiles(folder: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(folder);

      if (error) {
        console.error('Erreur liste fichiers:', error);
        return [];
      }

      return data.map(file => `${folder}/${file.name}`);
    } catch (error) {
      console.error('Erreur liste fichiers:', error);
      return [];
    }
  }
}

// Instance singleton
export const supabaseStorage = new SupabaseStorageService();
