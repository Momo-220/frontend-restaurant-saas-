// Services temporaires pour éviter les erreurs de compilation
// Ces services seront remplacés par de vrais appels API

// Types temporaires
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}
export interface PaymentData {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: string;
  customer: string;
  customerPhone: string;
  date: string;
  fee: number;
  table?: string;
  transactionId: string;
}

export interface OrderData {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  phone: string;
  tableNumber?: string;
  status: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  createdAt: string;
  notes?: string;
}

// Hook temporaire pour payments
export function usePaymentSync() {
  return {
    payments: [] as PaymentData[],
    stats: {
      totalRevenue: 0,
      totalTransactions: 0,
      averageTransaction: 0,
      pendingAmount: 0,
    },
    updatePaymentStatus: (id: string, status: string) => {
      console.log('TODO: Mettre à jour paiement', id, status);
    },
  };
}

// Hook temporaire pour orders
export function useOrderSync() {
  return {
    orders: [] as OrderData[],
    stats: {
      totalOrders: 0,
      todayOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
    },
    updateOrderStatus: (id: string, status: string) => {
      console.log('TODO: Mettre à jour commande', id, status);
    },
  };
}

// Service central temporaire
export const centralSyncService = {
  forceSync: () => {
    console.log('TODO: Synchronisation forcée');
  },
};

// Hook central temporaire
export function useCentralSync() {
  return {
    orders: [] as OrderData[],
    payments: [] as PaymentData[],
    forceSync: () => {
      console.log('TODO: Synchronisation centrale');
    },
  };
}


