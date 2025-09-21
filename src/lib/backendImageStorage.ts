// Service de stockage d'images via Backend NestJS
// Utilise l'API backend pour stocker les images

export class BackendImageStorageService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-de-restaurant-saas-production.up.railway.app';
    if (!this.baseURL.endsWith('/api/v1')) {
      this.baseURL += '/api/v1';
    }
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('nomo_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Upload d'un fichier via l'API backend
  async uploadFile(file: File, folder: string = 'general'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch(`${this.baseURL}/files/upload`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url || data.filePath;
    } catch (error) {
      console.error('Erreur upload backend:', error);
      
      // Mode fallback - générer URL de test
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${timestamp}_${randomId}.${fileExtension}`;
      
      console.log(`📁 Upload fallback: ${fileName}`);
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
      const response = await fetch(`${this.baseURL}/files/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ filePath }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur suppression:', error);
      return false;
    }
  }
}

// Instance singleton
export const backendImageStorage = new BackendImageStorageService();


