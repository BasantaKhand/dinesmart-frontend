import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getRestaurantsApi,
    createRestaurantApi,
    updateRestaurantStatusApi,
    deleteRestaurantApi,
    resetRestaurantPasswordApi,
} from '@/api/superadmin-restaurant.api';
import type {
    CreateRestaurantPayload,
    UpdateRestaurantStatusPayload,
} from '@/api/superadmin-restaurant.api';

export const useGetRestaurants = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ['restaurants', page, limit],
        queryFn: async () => {
            const response = await getRestaurantsApi(page, limit);
            return response.data;
        },
    });
};

export const useCreateRestaurant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['createRestaurant'],
        mutationFn: async (data: CreateRestaurantPayload) => {
            const response = await createRestaurantApi(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
        },
    });
};

export const useUpdateRestaurantStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateRestaurantStatus'],
        mutationFn: async ({ id, data }: { id: string; data: UpdateRestaurantStatusPayload }) => {
            const response = await updateRestaurantStatusApi(id, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
        },
    });
};

export const useDeleteRestaurant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteRestaurant'],
        mutationFn: async (id: string) => {
            const response = await deleteRestaurantApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
        },
    });
};

export const useResetRestaurantPassword = () => {
    return useMutation({
        mutationKey: ['resetRestaurantPassword'],
        mutationFn: async (id: string) => {
            const response = await resetRestaurantPasswordApi(id);
            return response.data;
        },
    });
};