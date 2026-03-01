import api from '@/lib/axios';

export interface CashDrawer {
    _id?: string;
    restaurantId?: string;
    cashierId?: string;
    status: 'OPEN' | 'CLOSED';
    openedAt?: string;
    openingAmount: number;
    closedAt?: string;
    closingAmount?: number;
    expectedAmount?: number;
    variance?: number;
    notes?: string;
    transactionsHandled?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DrawerHistoryResponse {
    drawers: CashDrawer[];
    total: number;
}

export const openDrawerApi = (openingAmount: number, notes?: string) =>
    api.post('/cash-drawer/open', {
        openingAmount,
        notes,
    });

export const closeDrawerApi = (closingAmount: number, notes?: string) =>
    api.post('/cash-drawer/close', {
        closingAmount,
        notes,
    });

export const getDrawerStatusApi = () =>
    api.get('/cash-drawer/status');

export const getDrawerHistoryApi = (limit: number = 10, skip: number = 0) =>
    api.get('/cash-drawer/history', {
        params: { limit, skip },
    });
