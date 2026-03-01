import api from '@/lib/axios';

export interface Restaurant {
    _id: string;
    name: string;
    address?: string;
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
    createdAt: string;
    userCount?: number;
    paymentSettings?: {
        provider: 'ESEWA' | 'STRIPE' | 'MANUAL';
        qrCodeUrl?: string;
        accountName?: string;
        accountId?: string;
        notes?: string;
    };
}

export interface CreateRestaurantPayload {
    name: string;
    address?: string;
    status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
    ownerName: string;
    email: string;
    password?: string;
}

export interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UpdateRestaurantStatusPayload {
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

export const getRestaurantsApi = (page: number = 1, limit: number = 10) =>
    api.get('/restaurants', { params: { page, limit } });

export const createRestaurantApi = (data: CreateRestaurantPayload) =>
    api.post('/restaurants', data);

export const updateRestaurantStatusApi = (id: string, data: UpdateRestaurantStatusPayload) =>
    api.patch(`/restaurants/${id}/status`, data);

export const deleteRestaurantApi = (id: string) =>
    api.delete(`/restaurants/${id}`);

export const resetRestaurantPasswordApi = (id: string) =>
    api.post(`/restaurants/${id}/reset-password`);
