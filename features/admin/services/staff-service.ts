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

export const apiGetStaff = async (params?: StaffQueryParams): Promise<StaffListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role && params.role !== 'ALL') queryParams.append('role', params.role);
    if (params?.status && params.status !== 'ALL') queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = queryString ? `/staff?${queryString}` : '/staff';
    const response = await api.get<StaffListResponse>(url);
    return response.data;
};

export const apiGetStaffById = async (id: string): Promise<StaffResponse> => {
    const response = await api.get<StaffResponse>(`/staff/${id}`);
    return response.data;
};

export const apiCreateStaff = async (data: {
    name: string;
    email: string;
    phone?: string;
    role: 'WAITER' | 'CASHIER';
    status?: 'ACTIVE' | 'INACTIVE';
}): Promise<StaffCreateResponse> => {
    const response = await api.post<StaffCreateResponse>('/staff', data);
    return response.data;
};

export const apiUpdateStaff = async (
    id: string,
    data: Partial<{
        name: string;
        email: string;
        phone: string;
        role: 'WAITER' | 'CASHIER';
        status: 'ACTIVE' | 'INACTIVE';
    }>
): Promise<StaffResponse> => {
    const response = await api.put<StaffResponse>(`/staff/${id}`, data);
    return response.data;
};

export const apiDeleteStaff = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
};

export const apiToggleStaffStatus = async (id: string): Promise<StaffResponse> => {
    const response = await api.patch<StaffResponse>(`/staff/${id}/status`);
    return response.data;
};

export const apiResetStaffPassword = async (id: string): Promise<PasswordResetResponse> => {
    const response = await api.post<PasswordResetResponse>(`/staff/${id}/reset-password`);
    return response.data;
};
