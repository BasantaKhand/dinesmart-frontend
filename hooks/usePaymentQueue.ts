import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getQueueStatusApi,
    getFailedPaymentsApi,
    getPaymentQueueApi,
    manuallyOverridePaymentApi,
    retryAllFailedPaymentsApi,
} from '@/api/payment-queue.api';

export const useGetQueueStatus = () => {
    return useQuery({
        queryKey: ['queueStatus'],
        queryFn: async () => {
            const response = await getQueueStatusApi();
            return response.data.data;
        },
    });
};

export const useGetFailedPayments = (limit: number = 20, skip: number = 0) => {
    return useQuery({
        queryKey: ['failedPayments', limit, skip],
        queryFn: async () => {
            const response = await getFailedPaymentsApi(limit, skip);
            return {
                payments: response.data.data,
                total: response.data.pagination.total,
            };
        },
    });
};

export const useGetPaymentQueue = (status?: string, limit: number = 50, skip: number = 0) => {
    return useQuery({
        queryKey: ['paymentQueue', status, limit, skip],
        queryFn: async () => {
            const response = await getPaymentQueueApi(status, limit, skip);
            return {
                payments: response.data.data,
                total: response.data.pagination.total,
            };
        },
    });
};

export const useManuallyOverridePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['manuallyOverridePayment'],
        mutationFn: async ({ paymentId, reason }: { paymentId: string; reason: string }) => {
            const response = await manuallyOverridePaymentApi(paymentId, reason);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queueStatus'] });
            queryClient.invalidateQueries({ queryKey: ['failedPayments'] });
            queryClient.invalidateQueries({ queryKey: ['paymentQueue'] });
        },
    });
};

export const useRetryAllFailedPayments = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['retryAllFailedPayments'],
        mutationFn: async () => {
            const response = await retryAllFailedPaymentsApi();
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queueStatus'] });
            queryClient.invalidateQueries({ queryKey: ['failedPayments'] });
            queryClient.invalidateQueries({ queryKey: ['paymentQueue'] });
        },
    });
};