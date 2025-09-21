// Service pour la gestion des paiements - Intégration Backend NOMO
import { authService } from './authService';

export interface Payment {
  id: string;
  tenant_id: string;
  order_id: string;
  method: 'CASH' | 'CARD' | 'WAVE' | 'MYNITA';
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  transaction_id?: string;
  payment_url?: string;
  expires_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  order?: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
  };
}

export interface InitiatePaymentDto {
  order_id: string;
  method: 'WAVE' | 'MYNITA';
  return_url?: string;
  cancel_url?: string;
}

export interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  averageTransaction: number;
  todayRevenue: number;
  monthRevenue: number;
  paymentMethodBreakdown: {
    CASH: number;
    CARD: number;
    WAVE: number;
    MYNITA: number;
  };
}

export interface PaymentFilters {
  status?: string;
  method?: string;
  date_from?: string;
  date_to?: string;
  order_id?: string;
  transaction_id?: string;
}

class PaymentsService {
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

  // ==================== PAIEMENTS ADMIN ====================

  async getPayments(filters?: PaymentFilters): Promise<Payment[]> {
    let url = `${this.baseURL}/payments`;
    
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
    
    // Si pas de paiements disponibles (404), retourner un tableau vide
    if (response.status === 404) {
      return [];
    }
    
    return this.handleResponse<Payment[]>(response);
  }

  async getPaymentById(id: string): Promise<Payment> {
    const response = await fetch(`${this.baseURL}/payments/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Payment>(response);
  }

  async getPaymentStats(): Promise<PaymentStats> {
    const response = await fetch(`${this.baseURL}/payments/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    // Si pas de statistiques disponibles (404), retourner des stats vides
    if (response.status === 404) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        averageTransaction: 0,
        todayRevenue: 0,
        monthRevenue: 0,
        paymentMethodBreakdown: {
          CASH: 0,
          CARD: 0,
          WAVE: 0,
          MYNITA: 0,
        },
      };
    }
    
    return this.handleResponse<PaymentStats>(response);
  }

  async refundPayment(id: string, reason?: string): Promise<Payment> {
    const response = await fetch(`${this.baseURL}/payments/${id}/refund`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse<Payment>(response);
  }

  // ==================== PAIEMENTS PUBLIQUES (CLIENT) - VERSION SIMPLIFIÉE ====================

  async getRestaurantPaymentInfo(tenantSlug: string): Promise<{
    restaurant_name: string;
    payment_methods: {
      wave?: {
        number: string;
        name: string;
      };
      mynita?: {
        number: string;
        name: string;
      };
      orange_money?: {
        number: string;
        name: string;
      };
    };
  }> {
    const response = await fetch(`${this.baseURL}/tenants/public/${tenantSlug}/payment-info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse(response);
  }

  async confirmManualPayment(tenantSlug: string, data: {
    order_id: string;
    payment_method: 'WAVE' | 'MYNITA' | 'ORANGE_MONEY';
    transaction_reference: string;
    amount: number;
  }): Promise<{
    success: boolean;
    message: string;
    order_status: string;
  }> {
    const response = await fetch(`${this.baseURL}/payments/public/${tenantSlug}/confirm-manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getPublicPaymentStatus(tenantSlug: string, transactionId: string): Promise<Payment> {
    const response = await fetch(`${this.baseURL}/payments/public/${tenantSlug}/status/${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Payment>(response);
  }

  // ==================== CONFIGURATION PAIEMENTS ====================

  async getPaymentConfig(): Promise<{
    wave_enabled: boolean;
    mynita_enabled: boolean;
    cash_enabled: boolean;
    card_enabled: boolean;
    wave_config?: {
      merchant_name: string;
      fees_percentage: number;
    };
    mynita_config?: {
      merchant_name: string;
      fees_percentage: number;
    };
  }> {
    const response = await fetch(`${this.baseURL}/payments/config`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updatePaymentConfig(config: {
    wave_enabled?: boolean;
    mynita_enabled?: boolean;
    cash_enabled?: boolean;
    card_enabled?: boolean;
  }): Promise<void> {
    const response = await fetch(`${this.baseURL}/payments/config`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Erreur ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
    }
  }

  // ==================== WEBHOOKS & CALLBACKS ====================

  async verifyWebhookSignature(payload: string, signature: string, provider: 'wave' | 'mynita'): Promise<boolean> {
    const response = await fetch(`${this.baseURL}/payments/webhooks/${provider}/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ payload, signature }),
    });
    
    const result = await this.handleResponse<{ valid: boolean }>(response);
    return result.valid;
  }
}

// Instance singleton du service
export const paymentsService = new PaymentsService();

// Hook personnalisé pour React
export const usePaymentsService = () => {
  return {
    getPayments: paymentsService.getPayments.bind(paymentsService),
    getPaymentById: paymentsService.getPaymentById.bind(paymentsService),
    getPaymentStats: paymentsService.getPaymentStats.bind(paymentsService),
    refundPayment: paymentsService.refundPayment.bind(paymentsService),
    getRestaurantPaymentInfo: paymentsService.getRestaurantPaymentInfo.bind(paymentsService),
    confirmManualPayment: paymentsService.confirmManualPayment.bind(paymentsService),
    getPublicPaymentStatus: paymentsService.getPublicPaymentStatus.bind(paymentsService),
    getPaymentConfig: paymentsService.getPaymentConfig.bind(paymentsService),
    updatePaymentConfig: paymentsService.updatePaymentConfig.bind(paymentsService),
    verifyWebhookSignature: paymentsService.verifyWebhookSignature.bind(paymentsService),
  };
};
