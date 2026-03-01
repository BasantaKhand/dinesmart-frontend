import api from '@/lib/axios';

export interface PaymentSettings {
    provider: 'ESEWA' | 'STRIPE' | 'MANUAL';
    qrCodeUrl?: string;
    accountName?: string;
    accountId?: string;
    notes?: string;
}

export const getPaymentSettingsApi = () =>
    api.get<{ success: boolean; data: { restaurantName: string; paymentSettings: PaymentSettings } }>(
        '/restaurants/me/payment-settings'
    );

export const updatePaymentSettingsApi = (data: PaymentSettings) =>
    api.put<{ success: boolean; data: { restaurantName: string; paymentSettings: PaymentSettings } }>(
        '/restaurants/me/payment-settings',
        data
    );
