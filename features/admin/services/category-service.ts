import api from '@/lib/axios';

export interface Category {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    status: 'Active' | 'Inactive';
    restaurantId: string;
    productsCount: number;
    subcategoriesCount: number;
    createdAt: string;
}

export interface CategoriesResponse {
    success: boolean;
    count: number;
    data: Category[];
}

export interface CategoryResponse {
    success: boolean;
    message?: string;
    data: Category;
}

export const apiGetCategories = async (): Promise<CategoriesResponse> => {
    const response = await api.get<CategoriesResponse>('/categories');
    return response.data;
};

export const apiCreateCategory = async (data: {
    name: string;
    description?: string;
    image?: string;
    status?: string;
}): Promise<CategoryResponse> => {
    const response = await api.post<CategoryResponse>('/categories', data);
    return response.data;
};

export const apiUpdateCategory = async (
    id: string,
    data: Partial<{ name: string; description: string; image: string; status: string }>
): Promise<CategoryResponse> => {
    const response = await api.put<CategoryResponse>(`/categories/${id}`, data);
    return response.data;
};

export const apiDeleteCategory = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};
