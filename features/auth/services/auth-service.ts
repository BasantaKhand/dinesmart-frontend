import api from '@/lib/axios';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    restaurantId?: string;
    mustChangePassword?: boolean;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export const apiLogin = async (credentials: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
};

export const apiLogout = async (): Promise<void> => {
    await api.post('/auth/logout');
};

export const apiGetMe = async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get('/auth/me');
    return response.data;
};
