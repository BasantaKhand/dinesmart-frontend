import api from '@/lib/axios';

export interface SystemAnalytics {
    overview: {
        totalRestaurants: number;
        activeRestaurants: number;
        suspendedRestaurants: number;
        pendingRestaurants: number;
        totalUsers: number;
        totalMenuItems: number;
        totalTables: number;
        totalOrders: number;
        paidOrders: number;
        pendingOrders: number;
        totalRevenue: number;
        days: number;
        // Growth rates
        totalRestaurantsGrowth: number;
        activeRestaurantsGrowth: number;
        suspendedRestaurantsGrowth: number;
        pendingRestaurantsGrowth: number;
        ordersGrowth: number;
        revenueGrowth: number;
    };
    dailyRevenue: Array<{
        _id: string;
        revenue: number;
        orders: number;
    }>;
    revenueByRestaurant: Array<{
        _id: string;
        restaurantId: string;
        restaurantName: string;
        revenue: number;
        orders: number;
    }>;
    growthData: {
        labels: string[];
        newRestaurants: number[];
        churn: number[];
    };
    recentSuspensions: Array<{
        _id: string;
        name: string;
        address: string;
        updatedAt: string;
        createdAt: string;
    }>;
    mostActiveRestaurants: Array<{
        id: string;
        name: string;
        totalOrders: number;
        totalRevenue: number;
        users: number;
        daysAgo: string;
        heatmap: number[];
    }>;
}

export interface ActivityLog {
    _id: string;
    type: string;
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    message: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    userRole?: string;
    restaurantId?: string;
    restaurantName?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
    createdAt: string;
}

export interface ActivityStats {
    byType: Array<{ _id: string; count: number }>;
    bySeverity: Array<{ _id: string; count: number }>;
    last24Hours: number;
    totalErrors: number;
}

export interface ActivityLogResponse {
    success: boolean;
    data: ActivityLog[];
    stats: ActivityStats;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AuditLog {
    _id: string;
    restaurantId?: {
        _id: string;
        name: string;
    };
    cashierId?: {
        _id: string;
        name: string;
        email: string;
    };
    orderId?: {
        _id: string;
        orderNumber: string;
        total: number;
    };
    orderNumber?: string;
    type: 'PAYMENT_SETTLED' | 'DRAWER_OPENED' | 'DRAWER_CLOSED' | 'PAYMENT_OVERRIDE' | 'MANUAL_ADJUSTMENT';
    amount: number;
    paymentMethod?: 'CASH' | 'CARD' | 'QR' | 'CREDIT';
    paymentProvider?: string;
    description?: string;
    tableNumber?: number;
    metadata?: Record<string, any>;
    createdAt: string;
}

export interface AuditStats {
    byType: Array<{ _id: string; count: number; totalAmount: number }>;
    byPaymentMethod: Array<{ _id: string; count: number; totalAmount: number }>;
    todayTransactions: { count: number; totalAmount: number };
    totalSettled: { count: number; totalAmount: number };
}

export interface AuditLogResponse {
    success: boolean;
    data: AuditLog[];
    stats: AuditStats;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetSystemActivityParams {
    page?: number;
    limit?: number;
    type?: string;
    severity?: string;
    restaurantId?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface GetAuditLogsParams {
    page?: number;
    limit?: number;
    type?: string;
    restaurantId?: string;
    cashierId?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
}

export const getSystemAnalyticsApi = (days: number = 30) =>
    api.get(`/superadmin/analytics?days=${days}`);

export const getSystemActivityApi = (params: GetSystemActivityParams = {}) =>
    api.get('/superadmin/activity', { params });

export const getAuditLogsApi = (params: GetAuditLogsParams = {}) =>
    api.get('/superadmin/audit-logs', { params });
