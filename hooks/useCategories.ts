import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getCategoriesApi,
    createCategoryApi,
    updateCategoryApi,
    deleteCategoryApi,
} from '@/api/category.api';
import type { CreateCategoryData, UpdateCategoryData } from '@/api/category.api';

export const useGetCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await getCategoriesApi();
            return response.data;
        },
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['createCategory'],
        mutationFn: async (data: CreateCategoryData) => {
            const response = await createCategoryApi(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateCategory'],
        mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryData }) => {
            const response = await updateCategoryApi(id, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteCategory'],
        mutationFn: async (id: string) => {
            const response = await deleteCategoryApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};