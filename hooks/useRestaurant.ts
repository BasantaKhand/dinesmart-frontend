import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getPaymentSettingsApi,
    updatePaymentSettingsApi,
} from '@/api/restaurant.api';
import type { PaymentSettings } from '@/api/restaurant.api';

export const useGetPaymentSettings = () => {
    return useQuery({
        queryKey: ['paymentSettings'],
        queryFn: async () => {
            const response = await getPaymentSettingsApi();
            return response.data;
        },
    });
};

export const useUpdatePaymentSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updatePaymentSettings'],
        mutationFn: async (data: PaymentSettings) => {
            const response = await updatePaymentSettingsApi(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paymentSettings'] });
        },
    });
};