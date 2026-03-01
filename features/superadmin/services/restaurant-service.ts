import axios from '@/lib/axios';

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

// Get all restaurants (Superadmin only)
export const apiGetRestaurants = async (page: number = 1, limit: number = 10): Promise<{ success: boolean; data: Restaurant[]; pagination?: PaginationData }> => {
    const response = await axios.get('/restaurants', { params: { page, limit } });
    return response.data;
};

// Create restaurant (Superadmin only)
export const apiCreateRestaurant = async (data: CreateRestaurantPayload): Promise<{ success: boolean; data: { restaurant: Restaurant, credentials: { email: string, tempPassword: string } } }> => {
    const response = await axios.post('/restaurants', data);
    return response.data;
};

// Update restaurant status (Superadmin only)
export const apiUpdateRestaurantStatus = async (id: string, data: UpdateRestaurantStatusPayload): Promise<{ success: boolean; data: Restaurant }> => {
    const response = await axios.patch(`/restaurants/${id}/status`, data);
    return response.data;
};

// Delete restaurant (Superadmin only)
export const apiDeleteRestaurant = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/restaurants/${id}`);
    return response.data;
};

// Reset Restaurant Admin Password (Superadmin only)
export const apiResetRestaurantPassword = async (id: string): Promise<{ success: boolean; data: { email: string; tempPassword: string } }> => {
    const response = await axios.post(`/restaurants/${id}/reset-password`);
    return response.data;
};
