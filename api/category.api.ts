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

export interface CreateCategoryData {
    name: string;
    description?: string;
    image?: string;
    status?: string;
}

export interface UpdateCategoryData {
    name?: string;
    description?: string;
    image?: string;
    status?: string;
}

export const getCategoriesApi = () =>
    api.get<CategoriesResponse>('/categories');

export const createCategoryApi = (data: CreateCategoryData) =>
    api.post<CategoryResponse>('/categories', data);

export const updateCategoryApi = (id: string, data: UpdateCategoryData) =>
    api.put<CategoryResponse>(`/categories/${id}`, data);

export const deleteCategoryApi = (id: string) =>
    api.delete(`/categories/${id}`);
