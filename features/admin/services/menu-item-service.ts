import api from '@/lib/axios';

export interface MenuItem {
    _id: string;
    name: string;
    code: string;
    description: string;
    image: string;
    price: number;
    originalPrice: number | null;
    categoryId: {
        _id: string;
        name: string;
        slug: string;
    };
    status: 'Active' | 'Inactive';
    restaurantId: string;
    createdAt: string;
}

export interface MenuItemsResponse {
    success: boolean;
    count: number;
    data: MenuItem[];
}

export interface MenuItemResponse {
    success: boolean;
    message?: string;
    data: MenuItem;
}

export const apiGetMenuItems = async (params?: {
    search?: string;
    categoryId?: string;
    status?: string;
}): Promise<MenuItemsResponse> => {
    const response = await api.get<MenuItemsResponse>('/menu-items', { params });
    return response.data;
};

export const apiCreateMenuItem = async (data: {
    name: string;
    price: number;
    categoryId: string;
    description?: string;
    image?: string;
    originalPrice?: number | null;
    status?: string;
}): Promise<MenuItemResponse> => {
    const response = await api.post<MenuItemResponse>('/menu-items', data);
    return response.data;
};

export const apiUpdateMenuItem = async (
    id: string,
    data: Partial<{
        name: string;
        description: string;
        image: string;
        price: number;
        originalPrice: number | null;
        categoryId: string;
        status: string;
    }>
): Promise<MenuItemResponse> => {
    const response = await api.put<MenuItemResponse>(`/menu-items/${id}`, data);
    return response.data;
};

export const apiDeleteMenuItem = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/menu-items/${id}`);
    return response.data;
};
