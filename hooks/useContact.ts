import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getContactMessagesApi,
    deleteContactMessageApi,
    sendContactInviteApi,
    validateInviteApi,
    activateInviteApi,
} from '@/api/contact.api';

export const useGetContactMessages = () => {
    return useQuery({
        queryKey: ['contactMessages'],
        queryFn: async () => {
            const response = await getContactMessagesApi();
            return response.data;
        },
    });
};

export const useDeleteContactMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteContactMessage'],
        mutationFn: async (id: string) => {
            const response = await deleteContactMessageApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
        },
    });
};

export const useSendContactInvite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['sendContactInvite'],
        mutationFn: async ({ id, customMessage }: { id: string; customMessage: string }) => {
            const response = await sendContactInviteApi(id, { customMessage });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
        },
    });
};

export const useValidateInvite = (token: string) => {
    return useQuery({
        queryKey: ['validateInvite', token],
        queryFn: async () => {
            const response = await validateInviteApi(token);
            return response.data;
        },
        enabled: !!token,
        retry: false,
    });
};

export const useActivateInvite = () => {
    return useMutation({
        mutationKey: ['activateInvite'],
        mutationFn: async (data: {
            token: string;
            password: string;
            restaurantAddress: string;
            restaurantPhone?: string;
            cuisineType?: string;
            numberOfTables?: number;
        }) => {
            const response = await activateInviteApi(data);
            return response.data;
        },
    });
};
