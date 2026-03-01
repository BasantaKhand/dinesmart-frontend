import { useQuery } from '@tanstack/react-query';
import {
    getTransactionsApi,
    getMyTransactionsApi,
    getDailySettlementApi,
    getSettlementsApi,
} from '@/api/audit.api';

export const useGetTransactions = (
    limit: number = 50,
    skip: number = 0,
    type?: string,
    dateFrom?: string,
    dateTo?: string
) => {
    return useQuery({
        queryKey: ['transactions', limit, skip, type, dateFrom, dateTo],
        queryFn: async () => {
            const response = await getTransactionsApi(limit, skip, type, dateFrom, dateTo);
            return {
                transactions: response.data.data,
                total: response.data.pagination.total,
            };
        },
    });
};

export const useGetMyTransactions = (limit: number = 20, skip: number = 0) => {
    return useQuery({
        queryKey: ['myTransactions', limit, skip],
        queryFn: async () => {
            const response = await getMyTransactionsApi(limit, skip);
            return {
                transactions: response.data.data,
                summary: response.data.summary,
                total: response.data.pagination.total,
            };
        },
    });
};

export const useGetDailySettlement = (date: string) => {
    return useQuery({
        queryKey: ['dailySettlement', date],
        queryFn: async () => {
            const response = await getDailySettlementApi(date);
            return response.data.data;
        },
        enabled: !!date,
    });
};

export const useGetSettlements = (limit: number = 30, skip: number = 0) => {
    return useQuery({
        queryKey: ['settlements', limit, skip],
        queryFn: async () => {
            const response = await getSettlementsApi(limit, skip);
            return {
                settlements: response.data.data,
                total: response.data.pagination.total,
            };
        },
    });
};