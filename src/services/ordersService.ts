// Service pour la gestion des commandes - Intégration Backend NOMO
import { authService } from './authService';

export interface OrderItem {
  id: string;
  item_id: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
}

export interface Order {
  id: string;
  order_number: string;
  tenant_id: string;
  table_id?: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  payment_method: 'CASH' | 'CARD' | 'WAVE' | 'MYNITA';
  payment_status: 'PENDING' | 'PAID' | 'FAILED';
  total_amount: number;
  delivery_fee: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface CreateOrderDto {
  table_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  payment_method: 'CASH' | 'CARD' | 'WAVE' | 'MYNITA';
  delivery_fee?: number;
  notes?: string;
  items: {
    item_id: string;
    quantity: number;
    special_instructions?: string;
  }[];
}

export interface UpdateOrderStatusDto {
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
}

export interface OrderFilters {
  status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  customer_phone?: string;
  table_id?: string;
}

class OrdersService {
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

  // ==================== COMMANDES ADMIN ====================

  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    let url = `${this.baseURL}/orders`;
    
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Order[]>(response);
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await fetch(`${this.baseURL}/orders/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Order>(response);
  }

  async updateOrderStatus(id: string, statusData: UpdateOrderStatusDto): Promise<Order> {
    const response = await fetch(`${this.baseURL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(statusData),
    });
    return this.handleResponse<Order>(response);
  }

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const response = await fetch(`${this.baseURL}/orders/${id}/cancel`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse<Order>(response);
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    todayOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> {
    const response = await fetch(`${this.baseURL}/orders/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // ==================== COMMANDES PUBLIQUES (CLIENT) ====================

  async createPublicOrder(tenantSlug: string, orderData: CreateOrderDto): Promise<Order> {
    const response = await fetch(`${this.baseURL}/orders/public/${tenantSlug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    return this.handleResponse<Order>(response);
  }

  async getPublicOrderStatus(tenantSlug: string, orderNumber: string): Promise<Order> {
    const response = await fetch(`${this.baseURL}/orders/public/${tenantSlug}/${orderNumber}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Order>(response);
  }

  // ==================== TEMPS RÉEL ====================

  subscribeToOrderUpdates(callback: (order: Order) => void): () => void {
    // TODO: Implémenter WebSocket pour les mises à jour temps réel
    console.log('🔄 Abonnement aux mises à jour commandes - WebSocket à implémenter');
    
    // Retourner une fonction de désabonnement vide pour le moment
    return () => {
      console.log('🔄 Désabonnement mises à jour commandes');
    };
  }
}

// Instance singleton du service
export const ordersService = new OrdersService();

// Hook personnalisé pour React
export const useOrdersService = () => {
  return {
    getOrders: ordersService.getOrders.bind(ordersService),
    getOrderById: ordersService.getOrderById.bind(ordersService),
    updateOrderStatus: ordersService.updateOrderStatus.bind(ordersService),
    cancelOrder: ordersService.cancelOrder.bind(ordersService),
    getOrderStats: ordersService.getOrderStats.bind(ordersService),
    createPublicOrder: ordersService.createPublicOrder.bind(ordersService),
    getPublicOrderStatus: ordersService.getPublicOrderStatus.bind(ordersService),
    subscribeToOrderUpdates: ordersService.subscribeToOrderUpdates.bind(ordersService),
  };
};
