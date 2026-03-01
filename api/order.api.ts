import api from '@/lib/axios';

export interface OrderItem {
    _id: string;
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
    notes?: string;
    status?: 'PREPARING' | 'READY' | 'SERVED';
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

export interface CreateOrderData {
    tableId?: string;
    items: Array<{
        menuItemId: string;
        name?: string;
        price?: number;
        quantity: number;
        total?: number;
        notes?: string;
    }>;
    orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
    subtotal?: number;
    tax?: number;
    serviceCharge?: number;
    total?: number;
    notes?: string;
}

export interface UpdateOrderStatusData {
    status: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentProvider?: string;
    paymentReference?: string;
}

export const createOrderApi = (data: CreateOrderData) =>
    api.post<{ success: boolean; data: Order }>('/orders', data);

export const getOrdersApi = (params?: any) =>
    api.get<{ success: boolean; data: Order[]; totalPages: number; currentPage: number }>('/orders', { params });

export const getActiveOrderByTableApi = (tableId: string) =>
    api.get<{ success: boolean; data: Order }>(`/orders/active/table/${tableId}`);

export const appendItemsToOrderApi = (id: string, data: any) =>
    api.put<{ success: boolean; data: Order }>(`/orders/${id}/append`, data);

export const updateOrderStatusApi = (id: string, data: UpdateOrderStatusData) =>
    api.put<{ success: boolean; data: Order }>(`/orders/${id}/status`, data);

export const splitOrderApi = (id: string, data: { itemIds: string[] }) =>
    api.post<{ success: boolean; data: { sourceOrder: Order; newOrder: Order } }>(`/orders/${id}/split`, data);

export const getOrderByIdApi = (id: string) =>
    api.get<{ success: boolean; data: Order }>(`/orders/${id}`);

export const markBillPrintedApi = (id: string) =>
    api.patch<{ success: boolean; data: Order }>(`/orders/${id}/mark-bill-printed`);

export const updateItemStatusApi = (orderId: string, itemId: string, data: { status: string }) =>
    api.put<{ success: boolean }>(`/orders/${orderId}/items/${itemId}/status`, data);
