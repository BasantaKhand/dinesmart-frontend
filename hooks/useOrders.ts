import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createOrderApi,
    getOrdersApi,
    getActiveOrderByTableApi,
    appendItemsToOrderApi,
    updateOrderStatusApi,
    splitOrderApi,
    getOrderByIdApi,
    markBillPrintedApi,
    updateItemStatusApi,
} from '@/api/order.api';
import type { CreateOrderData, UpdateOrderStatusData } from '@/api/order.api';

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['createOrder'],
        mutationFn: async (data: CreateOrderData) => {
            const response = await createOrderApi(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['activeOrderByTable'] });
        },
    });
};

export const useGetOrders = (params?: any) => {
    return useQuery({
        queryKey: ['orders', params],
        queryFn: async () => {
            const response = await getOrdersApi(params);
            return response.data;
        },
    });
};

export const useGetActiveOrderByTable = (tableId: string) => {
    return useQuery({
        queryKey: ['activeOrderByTable', tableId],
        queryFn: async () => {
            const response = await getActiveOrderByTableApi(tableId);
            return response.data;
        },
        enabled: !!tableId,
    });
};

export const useAppendItemsToOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['appendItemsToOrder'],
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await appendItemsToOrderApi(id, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['activeOrderByTable'] });
        },
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateOrderStatus'],
        mutationFn: async ({ id, data }: { id: string; data: UpdateOrderStatusData }) => {
            const response = await updateOrderStatusApi(id, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['activeOrderByTable'] });
        },
    });
};

export const useSplitOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['splitOrder'],
        mutationFn: async ({ id, data }: { id: string; data: { itemIds: string[] } }) => {
            const response = await splitOrderApi(id, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['activeOrderByTable'] });
        },
    });
};

export const useGetOrderById = (id: string, options?: { enabled?: boolean; refetchInterval?: number }) => {
    return useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await getOrderByIdApi(id);
            return response.data;
        },
        enabled: options?.enabled ?? !!id,
        refetchInterval: options?.refetchInterval,
    });
};

export const useMarkBillPrinted = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['markBillPrinted'],
        mutationFn: async (id: string) => {
            const response = await markBillPrintedApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['activeOrderByTable'] });
        },
    });
};

export const useUpdateItemStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateItemStatus'],
        mutationFn: async ({ orderId, itemId, data }: { orderId: string; itemId: string; data: { status: string } }) => {
            const response = await updateItemStatusApi(orderId, itemId, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['activeOrderByTable'] });
            queryClient.invalidateQueries({ queryKey: ['order'] });
        },
    });
};