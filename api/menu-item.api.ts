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

export interface GetMenuItemsParams {
    search?: string;
    categoryId?: string;
    status?: string;
}

export interface CreateMenuItemData {
    name: string;
    price: number;
    categoryId: string;
    description?: string;
    image?: string;
    originalPrice?: number | null;
    status?: string;
}

export interface UpdateMenuItemData {
    name?: string;
    description?: string;
    image?: string;
    price?: number;
    originalPrice?: number | null;
    categoryId?: string;
    status?: string;
}

export const getMenuItemsApi = (params?: GetMenuItemsParams) =>
    api.get<MenuItemsResponse>('/menu-items', { params });

export const createMenuItemApi = (data: CreateMenuItemData) =>
    api.post<MenuItemResponse>('/menu-items', data);

export const updateMenuItemApi = (id: string, data: UpdateMenuItemData) =>
    api.put<MenuItemResponse>(`/menu-items/${id}`, data);

export const deleteMenuItemApi = (id: string) =>
    api.delete(`/menu-items/${id}`);
