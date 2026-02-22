import api from '@/lib/axios';

export interface PaymentSettings {
    provider: 'ESEWA' | 'STRIPE' | 'MANUAL';
    qrCodeUrl?: string;
    accountName?: string;
    accountId?: string;
    notes?: string;
}

export const apiGetPaymentSettings = async () => {
    const response = await api.get<{ success: boolean; data: { restaurantName: string; paymentSettings: PaymentSettings } }>(
        '/restaurants/me/payment-settings'
    );
    return response.data;
};

export const apiUpdatePaymentSettings = async (data: PaymentSettings) => {
    const response = await api.put<{ success: boolean; data: { restaurantName: string; paymentSettings: PaymentSettings } }>(
        '/restaurants/me/payment-settings',
        data
    );
    return response.data;
};
