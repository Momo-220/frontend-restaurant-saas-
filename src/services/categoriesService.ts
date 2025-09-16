// Service pour la gestion des catégories - Intégration Backend NOMO
import { authService } from './authService';

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  items?: Item[];
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  out_of_stock: boolean;
  category_id: string;
  tenant_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  is_active?: boolean;
}

export interface CreateItemDto {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id: string;
  sort_order?: number;
}

export interface UpdateItemDto extends Partial<CreateItemDto> {
  is_available?: boolean;
  out_of_stock?: boolean;
}

class CategoriesService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-de-restaurant-saas-production.up.railway.app';
    if (!this.baseURL.endsWith('/api/v1')) {
      this.baseURL += '/api/v1';
    }
  }

  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    const user = authService.getUser();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (user?.tenant_id) {
      headers['X-Tenant-Id'] = user.tenant_id;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Erreur ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
    }
    
    try {
      return await response.json();
    } catch {
      return null as any;
    }
  }

  // ==================== CATÉGORIES ====================

  async getCategories(includeInactive = false): Promise<Category[]> {
    const url = `${this.baseURL}/menu/categories${includeInactive ? '?include_inactive=true' : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Category[]>(response);
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await fetch(`${this.baseURL}/menu/categories/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Category>(response);
  }

  async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
    const response = await fetch(`${this.baseURL}/menu/categories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(categoryData),
    });
    return this.handleResponse<Category>(response);
  }

  async updateCategory(id: string, categoryData: UpdateCategoryDto): Promise<Category> {
    const response = await fetch(`${this.baseURL}/menu/categories/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(categoryData),
    });
    return this.handleResponse<Category>(response);
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/menu/categories/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Erreur ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
    }
  }

  async reorderCategories(categoryOrders: { id: string; sort_order: number }[]): Promise<Category[]> {
    const response = await fetch(`${this.baseURL}/menu/categories/reorder`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(categoryOrders),
    });
    return this.handleResponse<Category[]>(response);
  }

  async getCategoryStats(): Promise<{
    totalCategories: number;
    activeCategories: number;
    totalItems: number;
  }> {
    const response = await fetch(`${this.baseURL}/menu/categories/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // ==================== ITEMS ====================

  async getItems(categoryId?: string, includeUnavailable = false): Promise<Item[]> {
    let url = `${this.baseURL}/menu/items`;
    const params = new URLSearchParams();
    
    if (categoryId) params.append('category_id', categoryId);
    if (includeUnavailable) params.append('include_unavailable', 'true');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Item[]>(response);
  }

  async getItemById(id: string): Promise<Item> {
    const response = await fetch(`${this.baseURL}/menu/items/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Item>(response);
  }

  async createItem(itemData: CreateItemDto): Promise<Item> {
    const response = await fetch(`${this.baseURL}/menu/items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(itemData),
    });
    return this.handleResponse<Item>(response);
  }

  async updateItem(id: string, itemData: UpdateItemDto): Promise<Item> {
    const response = await fetch(`${this.baseURL}/menu/items/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(itemData),
    });
    return this.handleResponse<Item>(response);
  }

  async deleteItem(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/menu/items/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Erreur ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
    }
  }

  async toggleItemStock(id: string): Promise<Item> {
    const response = await fetch(`${this.baseURL}/menu/items/${id}/toggle-stock`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Item>(response);
  }

  async searchItems(query: string): Promise<Item[]> {
    if (!query || query.trim().length < 2) return [];
    
    const response = await fetch(`${this.baseURL}/menu/items/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Item[]>(response);
  }

  async reorderItems(categoryId: string, itemOrders: { id: string; sort_order: number }[]): Promise<Item[]> {
    const response = await fetch(`${this.baseURL}/menu/items/category/${categoryId}/reorder`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(itemOrders),
    });
    return this.handleResponse<Item[]>(response);
  }

  async getItemStats(): Promise<{
    totalItems: number;
    availableItems: number;
    outOfStockItems: number;
  }> {
    const response = await fetch(`${this.baseURL}/menu/items/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

// Instance singleton du service
export const categoriesService = new CategoriesService();

// Hook personnalisé pour React
export const useCategoriesService = () => {
  return {
    // Catégories
    getCategories: categoriesService.getCategories.bind(categoriesService),
    getCategoryById: categoriesService.getCategoryById.bind(categoriesService),
    createCategory: categoriesService.createCategory.bind(categoriesService),
    updateCategory: categoriesService.updateCategory.bind(categoriesService),
    deleteCategory: categoriesService.deleteCategory.bind(categoriesService),
    reorderCategories: categoriesService.reorderCategories.bind(categoriesService),
    getCategoryStats: categoriesService.getCategoryStats.bind(categoriesService),
    
    // Items
    getItems: categoriesService.getItems.bind(categoriesService),
    getItemById: categoriesService.getItemById.bind(categoriesService),
    createItem: categoriesService.createItem.bind(categoriesService),
    updateItem: categoriesService.updateItem.bind(categoriesService),
    deleteItem: categoriesService.deleteItem.bind(categoriesService),
    toggleItemStock: categoriesService.toggleItemStock.bind(categoriesService),
    searchItems: categoriesService.searchItems.bind(categoriesService),
    reorderItems: categoriesService.reorderItems.bind(categoriesService),
    getItemStats: categoriesService.getItemStats.bind(categoriesService),
  };
};
