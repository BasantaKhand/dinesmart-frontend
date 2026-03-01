import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getStaffApi,
    getStaffByIdApi,
    createStaffApi,
    updateStaffApi,
    deleteStaffApi,
    toggleStaffStatusApi,
    resetStaffPasswordApi,
} from '@/api/staff.api';
import type {
    StaffQueryParams,
    CreateStaffData,
    UpdateStaffData,
} from '@/api/staff.api';

export const useGetStaff = (params?: StaffQueryParams) => {
    return useQuery({
        queryKey: ['staff', params],
        queryFn: async () => {
            const response = await getStaffApi(params);
            return response.data;
        },
    });
};

export const useGetStaffById = (id: string) => {
    return useQuery({
        queryKey: ['staff', id],
        queryFn: async () => {
            const response = await getStaffByIdApi(id);
            return response.data;
        },
        enabled: !!id,
    });
};

export const useCreateStaff = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['createStaff'],
        mutationFn: async (data: CreateStaffData) => {
            const response = await createStaffApi(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
        },
    });
};

export const useUpdateStaff = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateStaff'],
        mutationFn: async ({ id, data }: { id: string; data: UpdateStaffData }) => {
            const response = await updateStaffApi(id, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
        },
    });
};

export const useDeleteStaff = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteStaff'],
        mutationFn: async (id: string) => {
            const response = await deleteStaffApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
        },
    });
};

export const useToggleStaffStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['toggleStaffStatus'],
        mutationFn: async (id: string) => {
            const response = await toggleStaffStatusApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
        },
    });
};

export const useResetStaffPassword = () => {
    return useMutation({
        mutationKey: ['resetStaffPassword'],
        mutationFn: async (id: string) => {
            const response = await resetStaffPasswordApi(id);
            return response.data;
        },
    });
};