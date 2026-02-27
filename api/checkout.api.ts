import api from '@/lib/axios';

export interface CheckoutSession {
    _id: string;
    email: string;
    phone: string;
    amount: number;
    currency: string;
    status: 'PAYMENT_PENDING' | 'VERIFIED' | 'ACTIVATED' | 'EXPIRED' | 'FAILED';
    plan: {
        _id: string;
        name: string;
        price: number;
        billingCycle: string;
    };
    transactionId: string;
    esewaRefId?: string;
    verifiedAt?: string;
    inviteSentAt?: string;
    activatedAt?: string;
    completedAt?: string;
    createdAt: string;
}

export const getCheckoutSessionsApi = (params?: { status?: string }) =>
    api.get<{ success: boolean; data: CheckoutSession[] }>('/checkout/sessions', { params });

export const activateCheckoutSessionApi = (id: string) =>
    api.post(`/checkout/sessions/${id}/activate`);

export const resendCheckoutInviteApi = (id: string) =>
    api.post(`/checkout/sessions/${id}/resend-invite`);
