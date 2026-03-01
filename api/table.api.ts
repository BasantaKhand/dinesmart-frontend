import api from '@/lib/axios';

export interface Table {
    _id: string;
    number: string;
    capacity: number;
    status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
    restaurantId: string;
    createdAt: string;
}

export interface TablesResponse {
    success: boolean;
    count: number;
    data: Table[];
}

export interface TableResponse {
    success: boolean;
    message?: string;
    data: Table;
}

export interface CreateTableData {
    number?: string;
    capacity: number;
    status?: string;
}

export interface UpdateTableData {
    number?: string;
    capacity?: number;
    status?: string;
}

export const getTablesApi = () =>
    api.get<TablesResponse>('/tables');

export const createTableApi = (data: CreateTableData) =>
    api.post<TableResponse>('/tables', data);

export const updateTableApi = (id: string, data: UpdateTableData) =>
    api.put<TableResponse>(`/tables/${id}`, data);

export const deleteTableApi = (id: string) =>
    api.delete(`/tables/${id}`);
