import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loginApi, logoutApi, getMeApi, updateProfileApi } from '@/api/auth.api';
import type { UpdateProfileData } from '@/api/auth.api';

export const useLogin = () => {
    return useMutation({
        mutationKey: ['login'],
        mutationFn: async (credentials: any) => {
            const response = await loginApi(credentials);
            return response.data;
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['logout'],
        mutationFn: async () => {
            const response = await logoutApi();
            return response.data;
        },
        onSuccess: () => {
            queryClient.clear();
        },
    });
};

export const useGetMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const response = await getMeApi();
            return response.data;
        },
        retry: false,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateProfile'],
        mutationFn: async (data: UpdateProfileData) => {
            const response = await updateProfileApi(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
};