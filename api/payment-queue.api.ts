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

export interface PaymentQueueResponse {
    payments: PaymentQueueItem[];
    total: number;
}

export const getQueueStatusApi = () =>
    api.get('/payment-queue/status');

export const getFailedPaymentsApi = (limit: number = 20, skip: number = 0) =>
    api.get('/payment-queue/failed', {
        params: { limit, skip },
    });

export const getPaymentQueueApi = (status?: string, limit: number = 50, skip: number = 0) =>
    api.get('/payment-queue', {
        params: { status, limit, skip },
    });

export const manuallyOverridePaymentApi = (paymentId: string, reason: string) =>
    api.post(`/payment-queue/${paymentId}/manual-override`, {
        reason,
    });

export const retryAllFailedPaymentsApi = () =>
    api.post('/payment-queue/retry-all');
