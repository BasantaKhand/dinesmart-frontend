import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getInquiriesApi,
    markInquiryContactedApi,
    onboardInquiryApi,
    resendCredentialsApi,
    rejectInquiryApi,
} from '@/api/inquiry.api';

export const useGetInquiries = () => {
    return useQuery({
        queryKey: ['inquiries'],
        queryFn: async () => {
            const response = await getInquiriesApi();
            return response.data;
        },
    });
};

export const useMarkInquiryContacted = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['markInquiryContacted'],
        mutationFn: async (id: string) => {
            const response = await markInquiryContactedApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inquiries'] });
        },
    });
};

export const useOnboardInquiry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['onboardInquiry'],
        mutationFn: async (id: string) => {
            const response = await onboardInquiryApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inquiries'] });
        },
    });
};

export const useResendCredentials = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['resendCredentials'],
        mutationFn: async (id: string) => {
            const response = await resendCredentialsApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inquiries'] });
        },
    });
};

export const useRejectInquiry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['rejectInquiry'],
        mutationFn: async (id: string) => {
            const response = await rejectInquiryApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inquiries'] });
        },
    });
};
