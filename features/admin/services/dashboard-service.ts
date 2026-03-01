import api from '@/lib/axios';

export interface DashboardOverview {
    days: number;
    totalRevenue: number;
    totalOrders: number;
    paidOrders: number;
    productsCount: number;
    customersCount: number;
    tablesTotal: number;
    occupiedTables: number;
}

export interface SalesOverviewPoint {
    date: string;
    total: number;
}

export interface CategorySalesPoint {
    name: string;
    value: number;
}

export const apiGetDashboardOverview = async (params?: { days?: number }) => {
    const response = await api.get<{ success: boolean; data: DashboardOverview }>('/dashboard/overview', { params });
    return response.data;
};

export const apiGetSalesOverview = async (params?: { days?: number }) => {
    const response = await api.get<{ success: boolean; data: SalesOverviewPoint[]; meta?: { days: number } }>('/dashboard/sales-overview', { params });
    return response.data;
};

export const apiGetCategorySales = async (params?: { days?: number }) => {
    const response = await api.get<{ success: boolean; data: CategorySalesPoint[]; meta?: { days: number } }>('/dashboard/category-sales', { params });
    return response.data;
};
