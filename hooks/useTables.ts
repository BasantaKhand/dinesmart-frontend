import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getTablesApi,
    createTableApi,
    updateTableApi,
    deleteTableApi,
} from '@/api/table.api';
import type { CreateTableData, UpdateTableData } from '@/api/table.api';

export const useGetTables = () => {
    return useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            const response = await getTablesApi();
            return response.data;
        },
    });
};

export const useCreateTable = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['createTable'],
        mutationFn: async (data: CreateTableData) => {
            const response = await createTableApi(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
        },
    });
};

export const useUpdateTable = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateTable'],
        mutationFn: async ({ id, data }: { id: string; data: UpdateTableData }) => {
            const response = await updateTableApi(id, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
        },
    });
};

export const useDeleteTable = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteTable'],
        mutationFn: async (id: string) => {
            const response = await deleteTableApi(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
        },
    });
};