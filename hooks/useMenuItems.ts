import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getMenuItemsApi,
    createMenuItemApi,
    updateMenuItemApi,
    deleteMenuItemApi,
} from '@/api/menu-item.api';
import type {
    GetMenuItemsParams,
    CreateMenuItemData,
    UpdateMenuItemData,
} from '@/api/menu-item.api';

export const useGetMenuItems = (params?: GetMenuItemsParams) => {
    return useQuery({
        queryKey: ['menuItems', params],
        queryFn: async () => {
            const response = await getMenuItemsApi(params);
            return response.data;
        },
    });
};

export const useCreateMenuItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['createMenuItem'],
        mutationFn: async (data: CreateMenuItemData) => {
            const response = await createMenuItemApi(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
        },
    });
};

export const useUpdateMenuItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateMenuItem'],
        mutationFn: async ({ id, data }: { id: string; data: UpdateMenuItemData }) => {
            const response = await updateMenuItemApi(id, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
        },
    });
};

export const useDeleteMenuItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteMenuItem'],
        mutationFn: async (id: string) => {
            const response = await deleteMenuItemApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
        },
    });
};