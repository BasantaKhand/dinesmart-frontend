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

export const apiGetTables = async (): Promise<TablesResponse> => {
    const response = await api.get<TablesResponse>('/tables');
    return response.data;
};

export const apiCreateTable = async (data: {
    number?: string;
    capacity: number;
    status?: string;
}): Promise<TableResponse> => {
    const response = await api.post<TableResponse>('/tables', data);
    return response.data;
};

export const apiUpdateTable = async (
    id: string,
    data: Partial<{ number: string; capacity: number; status: string }>
): Promise<TableResponse> => {
    const response = await api.put<TableResponse>(`/tables/${id}`, data);
    return response.data;
};

export const apiDeleteTable = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
};
