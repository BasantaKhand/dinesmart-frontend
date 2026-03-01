import api from '@/lib/axios';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
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

export interface UpdateProfileData {
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
}

export const loginApi = (credentials: any) =>
    api.post<AuthResponse>('/auth/login', credentials);

export const logoutApi = () =>
    api.post('/auth/logout');

export const getMeApi = () =>
    api.get('/auth/me');

export const updateProfileApi = (data: UpdateProfileData) =>
    api.put('/auth/profile', data);

export const forgotPasswordApi = (email: string) =>
    api.post('/auth/forgot-password', { email });

export const resetPasswordApi = (data: { email: string; token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data);
