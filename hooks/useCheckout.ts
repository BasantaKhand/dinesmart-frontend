import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getCheckoutSessionsApi,
    activateCheckoutSessionApi,
    resendCheckoutInviteApi,
} from '@/api/checkout.api';

export const useGetCheckoutSessions = (status?: string) => {
    return useQuery({
        queryKey: ['checkoutSessions', status],
        queryFn: async () => {
            const params = status && status !== 'ALL' ? { status } : undefined;
            const response = await getCheckoutSessionsApi(params);
            return response.data;
        },
    });
};

export const useActivateCheckoutSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['activateCheckoutSession'],
        mutationFn: async (id: string) => {
            const response = await activateCheckoutSessionApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checkoutSessions'] });
        },
    });
};

export const useResendCheckoutInvite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['resendCheckoutInvite'],
        mutationFn: async (id: string) => {
            const response = await resendCheckoutInviteApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checkoutSessions'] });
        },
    });
};
