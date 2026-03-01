import axios from '@/lib/axios';

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

// Activity Log Types
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

// Audit Log Types
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

// Get system analytics (Superadmin only)
export const apiGetSystemAnalytics = async (days: number = 30): Promise<{ success: boolean; data: SystemAnalytics }> => {
    const response = await axios.get(`/superadmin/analytics?days=${days}`);
    return response.data;
};

// Get system activity logs (Superadmin only)
export const apiGetSystemActivity = async (params: {
    page?: number;
    limit?: number;
    type?: string;
    severity?: string;
    restaurantId?: string;
    dateFrom?: string;
    dateTo?: string;
} = {}): Promise<ActivityLogResponse> => {
    const response = await axios.get('/superadmin/activity', { params });
    return response.data;
};

// Get system-wide audit logs (Superadmin only)
export const apiGetAuditLogs = async (params: {
    page?: number;
    limit?: number;
    type?: string;
    restaurantId?: string;
    cashierId?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
} = {}): Promise<AuditLogResponse> => {
    const response = await axios.get('/superadmin/audit-logs', { params });
    return response.data;
};
