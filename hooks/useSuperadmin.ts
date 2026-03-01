import { useQuery } from '@tanstack/react-query';
import {
    getSystemAnalyticsApi,
    getSystemActivityApi,
    getAuditLogsApi,
} from '@/api/superadmin.api';
import type {
    GetSystemActivityParams,
    GetAuditLogsParams,
} from '@/api/superadmin.api';

export const useGetSystemAnalytics = (days: number = 30) => {
    return useQuery({
        queryKey: ['systemAnalytics', days],
        queryFn: async () => {
            const response = await getSystemAnalyticsApi(days);
            return response.data;
        },
    });
};

export const useGetSystemActivity = (params: GetSystemActivityParams = {}) => {
    return useQuery({
        queryKey: ['systemActivity', params],
        queryFn: async () => {
            const response = await getSystemActivityApi(params);
            return response.data;
        },
    });
};

export const useGetAuditLogs = (params: GetAuditLogsParams = {}) => {
    return useQuery({
        queryKey: ['auditLogs', params],
        queryFn: async () => {
            const response = await getAuditLogsApi(params);
            return response.data;
        },
    });
};