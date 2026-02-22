import api from '@/lib/axios';

export interface PaymentQueueItem {
  _id?: string;
  restaurantId?: string;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'QR' | 'CREDIT';
  paymentProvider: 'ESEWA' | 'STRIPE' | 'MANUAL';
  paymentReference?: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  retryCount?: number;
  maxRetries?: number;
  failureReason?: string;
  manualOverride?: boolean;
  manualOverrideBy?: string;
  manualOverrideReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentQueueStatus {
  pending: number;
  confirmed: number;
  failed: number;
}

/**
 * Get payment queue status (counts)
 */
export const apiGetQueueStatus = async (): Promise<PaymentQueueStatus> => {
  const response = await api.get('/payment-queue/status');
  return response.data.data;
};

/**
 * Get all failed payments
 */
export const apiGetFailedPayments = async (limit: number = 20, skip: number = 0): Promise<{ payments: PaymentQueueItem[]; total: number }> => {
  const response = await api.get('/payment-queue/failed', {
    params: { limit, skip },
  });
  return {
    payments: response.data.data,
    total: response.data.pagination.total,
  };
};

/**
 * Get entire payment queue
 */
export const apiGetPaymentQueue = async (status?: string, limit: number = 50, skip: number = 0): Promise<{ payments: PaymentQueueItem[]; total: number }> => {
  const response = await api.get('/payment-queue', {
    params: { status, limit, skip },
  });
  return {
    payments: response.data.data,
    total: response.data.pagination.total,
  };
};

/**
 * Manually override a failed payment
 */
export const apiManuallyOverridePayment = async (paymentId: string, reason: string): Promise<PaymentQueueItem> => {
  const response = await api.post(`/payment-queue/${paymentId}/manual-override`, {
    reason,
  });
  return response.data.data;
};

/**
 * Retry all failed payments
 */
export const apiRetryAllFailedPayments = async (): Promise<{ processed: number; confirmed: number; stillFailed: number }> => {
  const response = await api.post('/payment-queue/retry-all');
  return response.data.data;
};
