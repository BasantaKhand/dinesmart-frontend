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

export const getDashboardOverviewApi = (params?: { days?: number }) =>
    api.get<{ success: boolean; data: DashboardOverview }>('/dashboard/overview', { params });

export const getSalesOverviewApi = (params?: { days?: number }) =>
    api.get<{ success: boolean; data: SalesOverviewPoint[]; meta?: { days: number } }>('/dashboard/sales-overview', { params });

export const getCategorySalesApi = (params?: { days?: number }) =>
    api.get<{ success: boolean; data: CategorySalesPoint[]; meta?: { days: number } }>('/dashboard/category-sales', { params });
