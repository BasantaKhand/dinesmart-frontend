import { useQuery } from '@tanstack/react-query';
import {
    getDashboardOverviewApi,
    getSalesOverviewApi,
    getCategorySalesApi,
} from '@/api/dashboard.api';

export const useGetDashboardOverview = (params?: { days?: number }) => {
    return useQuery({
        queryKey: ['dashboardOverview', params],
        queryFn: async () => {
            const response = await getDashboardOverviewApi(params);
            return response.data;
        },
    });
};

export const useGetSalesOverview = (params?: { days?: number }) => {
    return useQuery({
        queryKey: ['salesOverview', params],
        queryFn: async () => {
            const response = await getSalesOverviewApi(params);
            return response.data;
        },
    });
};

export const useGetCategorySales = (params?: { days?: number }) => {
    return useQuery({
        queryKey: ['categorySales', params],
        queryFn: async () => {
            const response = await getCategorySalesApi(params);
            return response.data;
        },
    });
};