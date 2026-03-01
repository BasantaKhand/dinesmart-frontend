import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getNotificationsApi,
    archiveNotificationApi,
    deleteNotificationApi,
} from '@/api/notification.api';

export const useGetNotifications = (limit: number = 50) => {
    return useQuery({
        queryKey: ['notifications', limit],
        queryFn: async () => {
            const response = await getNotificationsApi({ limit });
            return response.data;
        },
    });
};

export const useArchiveNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['archiveNotification'],
        mutationFn: async (id: string) => {
            const response = await archiveNotificationApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteNotification'],
        mutationFn: async (id: string) => {
            const response = await deleteNotificationApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
