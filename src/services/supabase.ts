import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Désactiver Supabase temporairement pour éviter les erreurs RLS
export const supabase = null;

// Service pour l'upload d'images
export class SupabaseStorageService {
  private bucketName = 'restaurant-images';

  // Initialiser le bucket (à faire une seule fois)
  async initializeBucket() {
    console.log('✅ Mode test activé - Supabase désactivé');
    return true;
  }

  // Upload d'un fichier
  async uploadFile(file: File, folder: string = 'general'): Promise<string> {
    // Utiliser des URLs de test pour tous les uploads
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    
    // Générer une URL de test avec le nom du fichier
    const fileName = `${folder}/${timestamp}_${randomId}.${fileExtension}`;
    const testUrl = `https://via.placeholder.com/400x300/4f46e5/ffffff?text=${encodeURIComponent(fileName)}`;
    
    console.log(`📁 Upload simulé: ${fileName} → ${testUrl}`);
    return testUrl;
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
    console.log(`🗑️ Suppression simulée: ${filePath}`);
    return true;
  }

  // Lister les fichiers d'un dossier
  async listFiles(folder: string): Promise<string[]> {
    console.log(`📂 Liste simulée du dossier: ${folder}`);
    return [];
  }
}

// Instance singleton
export const supabaseStorage = new SupabaseStorageService();
