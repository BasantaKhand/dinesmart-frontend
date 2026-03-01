import api from '@/lib/axios';

export interface OrderItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
    notes?: string;
}

export interface Order {
    _id: string;
    orderNumber: string;
    restaurantId: string;
    tableId?: {
        _id: string;
        number: string;
    };
    waiterId: {
        _id: string;
        name: string;
    };
    items: OrderItem[];
    subtotal: number;
    tax: number;
    serviceCharge: number;
    total: number;
    status: 'PENDING' | 'COOKING' | 'COOKED' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL';
    paymentMethod: 'CASH' | 'CARD' | 'QR' | 'CREDIT';
    paymentProvider?: 'ESEWA' | 'STRIPE' | 'MANUAL';
    paymentReference?: string;
    orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export const apiCreateOrder = async (data: any) => {
    const response = await api.post<{ success: boolean; data: Order }>('/orders', data);
    return response.data;
};

export const apiGetOrders = async (params?: any) => {
    const response = await api.get<{ success: boolean; data: Order[]; totalPages: number; currentPage: number }>('/orders', { params });
    return response.data;
};

export const apiGetActiveOrderByTable = async (tableId: string) => {
    const response = await api.get<{ success: boolean; data: Order }>(`/orders/active/table/${tableId}`);
    return response.data;
};

export const apiAppendItemsToOrder = async (id: string, data: any) => {
    const response = await api.put<{ success: boolean; data: Order }>(`/orders/${id}/append`, data);
    return response.data;
};

export const apiUpdateOrderStatus = async (id: string, data: { status: string; paymentStatus?: string; paymentMethod?: string; paymentProvider?: string; paymentReference?: string }) => {
    const response = await api.put<{ success: boolean; data: Order }>(`/orders/${id}/status`, data);
    return response.data;
};

export const apiSplitOrder = async (id: string, data: { itemIds: string[] }) => {
    const response = await api.post<{ success: boolean; data: { sourceOrder: Order; newOrder: Order } }>(`/orders/${id}/split`, data);
    return response.data;
};
