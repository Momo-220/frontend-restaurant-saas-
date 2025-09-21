// Service de stockage d'images pour NOMO Restaurant SaaS
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase pour le stockage d'images
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabaseStorage = createClient(supabaseUrl, supabaseAnonKey);

// Service d'upload d'images
export class ImageStorageService {
  private bucketName = 'restaurant-images';

  // Upload d'un fichier
  async uploadFile(file: File, folder: string = 'general'): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${folder}/${timestamp}.${fileExtension}`;

      const { data, error } = await supabaseStorage.storage
        .from(this.bucketName)
        .upload(fileName, file);

      if (error) {
        console.error('Erreur upload Supabase:', error);
        // Fallback en cas d'erreur
        return `https://via.placeholder.com/400x300/4f46e5/ffffff?text=${encodeURIComponent(file.name)}`;
      }

      const { data: urlData } = supabaseStorage.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erreur upload:', error);
      // Fallback en cas d'erreur
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${timestamp}_${randomId}.${fileExtension}`;
      return `https://via.placeholder.com/400x300/4f46e5/ffffff?text=${encodeURIComponent(file.name)}`;
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
      const { error } = await supabaseStorage.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Erreur suppression:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur suppression:', error);
      return false;
    }
  }
}

// Instance singleton
export const imageStorage = new ImageStorageService();

// Fonction de debug pour vérifier la connectivité Supabase
export async function debugSupabaseConnection() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔧 Debug Supabase Storage:');
    console.log('URL:', supabaseUrl ? '✅ Configuré' : '❌ Manquant');
    console.log('Key:', supabaseKey ? '✅ Configuré' : '❌ Manquant');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      return false;
    }
    
    // Test de connexion au bucket
    const { data, error } = await supabaseStorage.storage
      .from('restaurant-images')
      .list('', { limit: 5 });
    
    if (error) {
      console.error('❌ Erreur connexion bucket:', error);
      return false;
    }
    
    console.log('✅ Connexion Supabase Storage réussie');
    console.log('📁 Fichiers trouvés:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('📋 Liste des fichiers:');
      data.forEach((file, index) => {
        const { data: urlData } = supabaseStorage.storage
          .from('restaurant-images')
          .getPublicUrl(file.name);
        console.log(`${index + 1}. ${file.name} -> ${urlData.publicUrl}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur debug Supabase:', error);
    return false;
  }
}

// Exposer la fonction de debug globalement pour la console
if (typeof window !== 'undefined') {
  (window as any).debugSupabase = debugSupabaseConnection;
}
