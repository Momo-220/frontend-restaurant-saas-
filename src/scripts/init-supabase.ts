// Script d'initialisation Supabase Storage
// À exécuter une seule fois pour créer le bucket

import { supabaseStorage } from '@/services/supabase';

export async function initializeSupabaseStorage() {
  try {
    console.log('Initialisation du bucket Supabase Storage...');
    const success = await supabaseStorage.initializeBucket();
    
    if (success) {
      console.log('✅ Bucket Supabase Storage initialisé avec succès');
      return true;
    } else {
      console.error('❌ Erreur lors de l\'initialisation du bucket');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur initialisation Supabase:', error);
    return false;
  }
}

// Fonction pour tester l'upload
export async function testSupabaseUpload() {
  try {
    // Créer un fichier de test
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    console.log('Test d\'upload vers Supabase...');
    const url = await supabaseStorage.uploadFile(testFile, 'test');
    
    console.log('✅ Upload test réussi:', url);
    return url;
  } catch (error) {
    console.error('❌ Erreur test upload:', error);
    return null;
  }
}
