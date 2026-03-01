import api from '@/lib/axios';

export interface Staff {
    _id: string;
    name: string;
    email: string;
    phone: string | null;
    role: 'WAITER' | 'CASHIER';
    status: 'ACTIVE' | 'INACTIVE';
    restaurantId: string;
    mustChangePassword: boolean;
    createdAt: string;
}

export interface StaffPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface StaffListResponse {
    success: boolean;
    data: Staff[];
    pagination: StaffPagination;
}

export interface StaffResponse {
    success: boolean;
    message?: string;
    data: Staff;
}

export interface StaffCreateResponse {
    success: boolean;
    message?: string;
    data: {
        staff: Staff;
        credentials: {
            email: string;
            password: string;
        };
    };
}

export interface PasswordResetResponse {
    success: boolean;
    message?: string;
    data: {
        email: string;
        newPassword: string;
    };
}

export interface StaffQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'ALL' | 'WAITER' | 'CASHIER';
    status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
}

export interface CreateStaffData {
    name: string;
    email: string;
    phone?: string;
    role: 'WAITER' | 'CASHIER';
    status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateStaffData {
    name?: string;
    email?: string;
    phone?: string;
    role?: 'WAITER' | 'CASHIER';
    status?: 'ACTIVE' | 'INACTIVE';
}

export const getStaffApi = (params?: StaffQueryParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role && params.role !== 'ALL') queryParams.append('role', params.role);
    if (params?.status && params.status !== 'ALL') queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = queryString ? `/staff?${queryString}` : '/staff';
    return api.get<StaffListResponse>(url);
};

export const getStaffByIdApi = (id: string) =>
    api.get<StaffResponse>(`/staff/${id}`);

export const createStaffApi = (data: CreateStaffData) =>
    api.post<StaffCreateResponse>('/staff', data);

export const updateStaffApi = (id: string, data: UpdateStaffData) =>
    api.put<StaffResponse>(`/staff/${id}`, data);

export const deleteStaffApi = (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/staff/${id}`);

export const toggleStaffStatusApi = (id: string) =>
    api.patch<StaffResponse>(`/staff/${id}/status`);

export const resetStaffPasswordApi = (id: string) =>
    api.post<PasswordResetResponse>(`/staff/${id}/reset-password`);
