import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    openDrawerApi,
    closeDrawerApi,
    getDrawerStatusApi,
    getDrawerHistoryApi,
} from '@/api/cash-drawer.api';

export const useGetDrawerStatus = () => {
    return useQuery({
        queryKey: ['drawerStatus'],
        queryFn: async () => {
            const response = await getDrawerStatusApi();
            return response.data;
        },
    });
};

export const useGetDrawerHistory = (limit: number = 10, skip: number = 0) => {
    return useQuery({
        queryKey: ['drawerHistory', limit, skip],
        queryFn: async () => {
            const response = await getDrawerHistoryApi(limit, skip);
            return response.data;
        },
    });
};

export const useOpenDrawer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['openDrawer'],
        mutationFn: async ({ openingAmount, notes }: { openingAmount: number; notes?: string }) => {
            const response = await openDrawerApi(openingAmount, notes);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drawerStatus'] });
            queryClient.invalidateQueries({ queryKey: ['drawerHistory'] });
        },
    });
};

export const useCloseDrawer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['closeDrawer'],
        mutationFn: async ({ closingAmount, notes }: { closingAmount: number; notes?: string }) => {
            const response = await closeDrawerApi(closingAmount, notes);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drawerStatus'] });
            queryClient.invalidateQueries({ queryKey: ['drawerHistory'] });
        },
    });
};