import api from '@/lib/axios';

export interface TransactionLog {
  _id?: string;
  restaurantId?: string;
  cashierId?: string;
  orderId?: string;
  orderNumber?: string;
  type: 'PAYMENT_SETTLED' | 'DRAWER_OPENED' | 'DRAWER_CLOSED' | 'PAYMENT_OVERRIDE' | 'MANUAL_ADJUSTMENT';
  amount: number;
  paymentMethod?: string;
  paymentProvider?: string;
  description: string;
  metadata?: any;
  tableNumber?: number;
  createdAt?: string;
}

export interface DailySettlement {
  _id?: string;
  restaurantId?: string;
  date: string;
  totalBills: number;
  totalCollection: number;
  collectionByMethod: {
    cash: number;
    card: number;
    qr: number;
    credit: number;
  };
  drawerOpenings: number;
  drawerVariance: number;
  failedPayments: number;
  manualOverrides: number;
}

/**
 * Get all transactions
 */
export const apiGetTransactions = async (
  limit: number = 50,
  skip: number = 0,
  type?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{ transactions: TransactionLog[]; total: number }> => {
  const response = await api.get('/audit/transactions', {
    params: { limit, skip, type, dateFrom, dateTo },
  });
  return {
    transactions: response.data.data,
    total: response.data.pagination.total,
  };
};

/**
 * Get current user's transactions
 */
export const apiGetMyTransactions = async (
  limit: number = 20,
  skip: number = 0
): Promise<{ transactions: TransactionLog[]; summary: any; total: number }> => {
  const response = await api.get('/audit/my-transactions', {
    params: { limit, skip },
  });
  return {
    transactions: response.data.data,
    summary: response.data.summary,
    total: response.data.pagination.total,
  };
};

/**
 * Get daily settlement for a specific date
 */
export const apiGetDailySettlement = async (date: string): Promise<DailySettlement> => {
  const response = await api.get('/audit/daily-settlement', {
    params: { date },
  });
  return response.data.data;
};

/**
 * Get all daily settlements
 */
export const apiGetSettlements = async (
  limit: number = 30,
  skip: number = 0
): Promise<{ settlements: DailySettlement[]; total: number }> => {
  const response = await api.get('/audit/settlements', {
    params: { limit, skip },
  });
  return {
    settlements: response.data.data,
    total: response.data.pagination.total,
  };
};
