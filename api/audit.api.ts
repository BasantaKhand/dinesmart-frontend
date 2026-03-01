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

export interface TransactionsResponse {
    transactions: TransactionLog[];
    total: number;
}

export interface MyTransactionsResponse {
    transactions: TransactionLog[];
    summary: any;
    total: number;
}

export interface SettlementsResponse {
    settlements: DailySettlement[];
    total: number;
}

export const getTransactionsApi = (
    limit: number = 50,
    skip: number = 0,
    type?: string,
    dateFrom?: string,
    dateTo?: string
) =>
    api.get('/audit/transactions', {
        params: { limit, skip, type, dateFrom, dateTo },
    });

export const getMyTransactionsApi = (
    limit: number = 20,
    skip: number = 0
) =>
    api.get('/audit/my-transactions', {
        params: { limit, skip },
    });

export const getDailySettlementApi = (date: string) =>
    api.get('/audit/daily-settlement', {
        params: { date },
    });

export const getSettlementsApi = (
    limit: number = 30,
    skip: number = 0
) =>
    api.get('/audit/settlements', {
        params: { limit, skip },
    });
