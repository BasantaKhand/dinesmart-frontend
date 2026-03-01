"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    DollarSign,
    ShoppingBag,
    Download,
    ChevronDown,
    Clock3,
    Loader2,
    Paperclip,
    CheckCircle,
    Table as TableIcon,
    AlertCircle
} from 'lucide-react';
import { Badge } from '@/features/admin/components/ui/badge';
import { KPICard } from '@/features/admin/components/ui/kpi-card';
import { SalesOverview } from '@/features/admin/components/ui/charts/sales-overview';
import { CategorySales } from '@/features/admin/components/ui/charts/category-sales';
import { Modal } from '@/features/admin/components/ui/modal';
import { useGetOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useGetCategorySales, useGetDashboardOverview, useGetSalesOverview } from '@/hooks/useDashboard';
import { useSocket } from '@/providers/socket-provider';
import { useQueryClient } from '@tanstack/react-query';
import type { Order } from '@/api/order.api';
import type { CategorySalesPoint, SalesOverviewPoint } from '@/api/dashboard.api';

type OrderSortFilter = 'RECENT' | 'OLDEST';

export default function AdminDashboard() {
    const [orderSortFilter, setOrderSortFilter] = useState<OrderSortFilter>('RECENT');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [notesOrder, setNotesOrder] = useState<Order | null>(null);
    const [dashboardDays, setDashboardDays] = useState(30);

    const { socket } = useSocket();
    const queryClient = useQueryClient();

    // Use react-query hooks
    const { data: ordersResponse, isLoading: quickOrdersLoading } = useGetOrders({ page: 1, limit: 50 });
    const { data: dashboardOverviewResponse, isLoading: dashboardLoading } = useGetDashboardOverview({ days: dashboardDays });
    const { data: salesOverviewResponse } = useGetSalesOverview({ days: dashboardDays });
    const { data: categorySalesResponse } = useGetCategorySales({ days: dashboardDays });
    const updateOrderStatusMutation = useUpdateOrderStatus();

    // Real-time: refresh dashboard data when a new notification arrives (e.g. new order)
    useEffect(() => {
        if (!socket) return;
        const handleNewNotification = () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
            queryClient.invalidateQueries({ queryKey: ['salesOverview'] });
            queryClient.invalidateQueries({ queryKey: ['categorySales'] });
        };
        socket.on('new_notification', handleNewNotification);
        return () => { socket.off('new_notification', handleNewNotification); };
    }, [socket, queryClient]);

    const quickOrders = ordersResponse?.data || [];
    const dashboardOverview = dashboardOverviewResponse?.data || {
        totalRevenue: 0,
        totalOrders: 0,
        paidOrders: 0,
        productsCount: 0,
        customersCount: 0,
        tablesTotal: 0,
        occupiedTables: 0,
        days: 30,
    };

    const getItemNotes = (order: Order | null) => {
        if (!order) return [] as Array<{ name: string; note: string }>;
        return order.items
            .filter((item) => item.notes && item.notes.trim().length > 0)
            .map((item) => ({ name: item.name, note: item.notes!.trim() }));
    };

    const formatRelativeTime = (value: string) => {
        const timestamp = new Date(value).getTime();
        if (Number.isNaN(timestamp)) return 'Just now';
        const diffMs = Date.now() - timestamp;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr} hr ago`;
        const diffDay = Math.floor(diffHr / 24);
        return `${diffDay} d ago`;
    };

    const formatCurrency = (value: number) => `NRs. ${Math.round(value).toLocaleString()}`;
    const getUnpaidOrders = () => Math.max(dashboardOverview.totalOrders - dashboardOverview.paidOrders, 0);

    const buildSalesOverviewData = (points: SalesOverviewPoint[], days: number) => {
        const totalsByDate = new Map(points.map((point) => [point.date, point.total]));
        const result: Array<{ name: string; sales: number }> = [];

        for (let i = days - 1; i >= 0; i -= 1) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const isoDate = date.toISOString().slice(0, 10);
            const label = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            result.push({ name: label, sales: totalsByDate.get(isoDate) || 0 });
        }

        return result;
    };

    const buildCategorySalesData = (points: CategorySalesPoint[]) => {
        const sorted = [...points].sort((a, b) => b.value - a.value);
        if (sorted.length <= 4) return sorted;

        const top = sorted.slice(0, 4);
        const otherValue = sorted.slice(4).reduce((sum, item) => sum + item.value, 0);
        return otherValue > 0 ? [...top, { name: 'Other', value: otherValue }] : top;
    };

    const salesOverviewData = salesOverviewResponse?.data ? buildSalesOverviewData(salesOverviewResponse.data, dashboardDays) : [];
    const categorySalesData = categorySalesResponse?.data ? buildCategorySalesData(categorySalesResponse.data) : [];

    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'PENDING': return 'warning' as const;
            case 'COOKING': return 'blue' as const;
            case 'COOKED': return 'success' as const;
            case 'SERVED': return 'info' as const;
            case 'COMPLETED': return 'gray' as const;
            default: return 'default' as const;
        }
    };

    const handleQuickOrderStatusChange = async (orderId: string, newStatus: Order['status']) => {
        setUpdatingOrderId(orderId);
        try {
            await updateOrderStatusMutation.mutateAsync({ id: orderId, data: { status: newStatus } });
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const activeQuickOrders = useMemo(
        () => quickOrders.filter((order) => order.status !== 'COMPLETED' && order.status !== 'CANCELLED'),
        [quickOrders]
    );

    const filteredQuickOrders = useMemo(() => {
        const sorted = [...activeQuickOrders].sort((a, b) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            return orderSortFilter === 'RECENT' ? bTime - aTime : aTime - bTime;
        });

        return sorted;
    }, [activeQuickOrders, orderSortFilter]);

    const recentOrders = useMemo(() => {
        const sorted = [...quickOrders].sort((a, b) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            return bTime - aTime;
        });

        return sorted.slice(0, 6);
    }, [quickOrders]);

    return (
        <div className="space-y-6 pb-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Overview</h1>
                    <p className="mt-1 text-sm font-medium text-zinc-500">Welcome back! Here's what's happening today.</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-[#FF5C00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e65300] transition-colors whitespace-nowrap">
                    <Download size={16} strokeWidth={2.5} />
                    Download Report
                </button>
            </div>

            {/* KPI Section — compact gap matching sample */}
            <div className="-mt-1 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Net Revenue"
                    value={dashboardLoading ? '—' : formatCurrency(dashboardOverview.totalRevenue)}
                    icon={DollarSign}
                    trend={{ value: '0.4%', isPositive: true, description: 'vs last month' }}
                    variant="success"
                />
                <KPICard
                    title="Unpaid Orders"
                    value={dashboardLoading ? '—' : getUnpaidOrders()}
                    icon={AlertCircle}
                    trend={{
                        value: dashboardLoading
                            ? '0%'
                            : `${Math.round((getUnpaidOrders() / Math.max(dashboardOverview.totalOrders, 1)) * 100)}%`,
                        isPositive: false,
                        description: 'of total orders'
                    }}
                    variant="blue"
                />
                <KPICard
                    title="Paid Orders"
                    value={dashboardLoading ? '—' : dashboardOverview.paidOrders}
                    icon={CheckCircle}
                    trend={{
                        value: dashboardLoading
                            ? '0%'
                            : `${Math.round((dashboardOverview.paidOrders / Math.max(dashboardOverview.totalOrders, 1)) * 100)}%`,
                        isPositive: true,
                        description: 'paid vs total'
                    }}
                    variant="orange"
                />
                <KPICard
                    title="Occupied Tables"
                    value={dashboardLoading ? '—' : dashboardOverview.occupiedTables}
                    icon={TableIcon}
                    trend={{
                        value: dashboardLoading
                            ? '0%'
                            : `${Math.round((dashboardOverview.occupiedTables / Math.max(dashboardOverview.tablesTotal, 1)) * 100)}%`,
                        isPositive: true,
                        description: 'of total tables'
                    }}
                    variant="purple"
                />
            </div>

            <div className="rounded-xl bg-white shadow-none">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900">Order line</h2>
                            <p className="mt-0.5 text-sm font-medium text-zinc-500">Track active orders and update status quickly.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={orderSortFilter}
                            onChange={(event) => setOrderSortFilter(event.target.value as OrderSortFilter)}
                            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none focus:border-zinc-300"
                        >
                            <option value="RECENT">Recent Order</option>
                            <option value="OLDEST">Oldest Order</option>
                        </select>
                        <Link href="/admin/orders" className="inline-flex h-9 items-center rounded-lg bg-[#FF5C00] px-4 text-sm font-bold text-white hover:bg-[#e65300] transition-colors">
                            See All
                        </Link>
                    </div>
                </div>

                {quickOrdersLoading ? (
                    <div className="flex h-28 items-center justify-center rounded-xl bg-white text-sm font-semibold text-zinc-500">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading order line...
                    </div>
                ) : filteredQuickOrders.length === 0 ? (
                    <div className="rounded-xl bg-zinc-50 px-4 py-8 sm:px-6">
                        <div className="mx-auto flex max-w-md flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white">
                                <ShoppingBag size={24} className="text-zinc-400" />
                            </div>

                            <h3 className="text-base font-bold text-zinc-800">No active orders</h3>
                            <p className="mt-1 max-w-sm text-sm font-medium text-zinc-500">
                                New orders will appear here once they are placed. Try changing the filter or check all orders.
                            </p>

                            <Link
                                href="/admin/orders"
                                className="mt-4 inline-flex h-9 items-center rounded-lg bg-[#FF5C00] px-4 text-sm font-bold text-white hover:bg-[#e65300] transition-colors"
                            >
                                Open Orders
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {filteredQuickOrders.slice(0, 6).map((order) => {
                            const location = order.orderType === 'DINE_IN' ? `Table ${order.tableId?.number || 'N/A'}` : order.orderType === 'TAKEAWAY' ? 'Pickup' : 'Delivery';
                            return (
                        <div key={order._id} className="rounded-xl bg-white p-3 ring-1 ring-zinc-200 shadow-none">
                            <div className="mb-2 flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <p className="text-[15px] font-semibold text-zinc-900">Order</p>
                                    <span className="text-sm font-semibold text-zinc-500">#{order.orderNumber}</span>
                                </div>
                                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                            </div>

                            <div className="mb-3 flex items-center justify-between text-[13px] font-medium text-zinc-600">
                                <p>{order.orderType.replace('_', ' ')} · {location}</p>
                                <span className="inline-flex items-center gap-1 text-zinc-400">
                                    <Clock3 size={12} />
                                    {formatRelativeTime(order.createdAt)}
                                </span>
                            </div>

                            <div className="mb-3 relative">
                                <div className="flex items-center gap-1.5 overflow-hidden pr-12">
                                    {order.items.slice(0, 2).map((item, index) => (
                                        <span key={`${item.name}-${index}`} className="inline-flex h-7 items-center rounded-lg bg-zinc-100 px-2.5 text-[11px] font-semibold text-zinc-600 whitespace-nowrap">
                                            {item.name}
                                        </span>
                                    ))}
                                </div>
                                {order.items.length > 2 && (
                                    <>
                                        <div className="pointer-events-none absolute right-10 top-0 h-full w-8 bg-gradient-to-l from-zinc-50 to-transparent" />
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 rounded-lg bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-600">
                                            +{order.items.length - 2}
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700">
                                    {order.items.length} items
                                </div>
                                <select
                                    value={order.status}
                                    onChange={(event) => handleQuickOrderStatusChange(order._id, event.target.value as Order['status'])}
                                    disabled={updatingOrderId === order._id}
                                    className="h-8 flex-1 rounded-lg border border-zinc-200 bg-white px-2 text-sm font-semibold text-zinc-700 outline-none focus:border-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="COOKING">COOKING</option>
                                    <option value="COOKED">COOKED</option>
                                </select>
                                <button
                                    onClick={() => setNotesOrder(order)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                                    title="View notes"
                                >
                                    <Paperclip size={14} />
                                </button>
                            </div>
                            {updatingOrderId === order._id && <p className="mt-2 text-xs font-medium text-zinc-500">Updating status...</p>}
                        </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal
                isOpen={Boolean(notesOrder)}
                onClose={() => setNotesOrder(null)}
                title=""
                maxWidthClass="max-w-md"
                showHeader={false}
            >
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-zinc-900">Order #{notesOrder?.orderNumber || ''} Notes</h3>
                    <p className="mt-1 text-sm font-medium text-zinc-500">Item-level kitchen instructions</p>

                    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                        {getItemNotes(notesOrder).length === 0 ? (
                            <p className="text-sm font-medium text-zinc-700">No item notes added for this order.</p>
                        ) : (
                            <div className="space-y-3">
                                {getItemNotes(notesOrder).map((entry, index) => (
                                    <div key={`${entry.name}-${index}`} className="rounded-lg border border-zinc-200 bg-white p-3">
                                        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{entry.name}</p>
                                        <p className="mt-1 text-sm font-medium text-zinc-700 leading-relaxed whitespace-pre-wrap">{entry.note}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-xl bg-white shadow-none">
                    <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Sales Overview</h2>
                            <p className="text-sm text-zinc-500 mt-0.5">Revenue trend over the last 30 days</p>
                        </div>
                        <div className="relative">
                            <select
                                value={dashboardDays}
                                onChange={(event) => setDashboardDays(Number(event.target.value))}
                                className="h-9 appearance-none rounded-lg border border-zinc-300 bg-white px-3 pr-8 text-sm font-semibold text-zinc-700 outline-none hover:bg-zinc-50"
                            >
                                <option value={7}>Last 7 Days</option>
                                <option value={30}>Last 30 Days</option>
                                <option value={90}>Last 90 Days</option>
                            </select>
                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        </div>
                    </div>
                    <SalesOverview data={salesOverviewData} isLoading={dashboardLoading} />
                </div>
                <div className="rounded-xl bg-white shadow-none">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-zinc-900">Sales by Category</h2>
                        <p className="text-sm text-zinc-500 mt-0.5">Distribution of revenue</p>
                    </div>
                    <CategorySales data={categorySalesData} isLoading={dashboardLoading} />
                </div>
            </div>

            {/* Recent Orders */}
            <div className="rounded-xl bg-white shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">Recent Orders</h2>
                        <p className="mt-0.5 text-sm font-medium text-zinc-500">Latest orders placed across the restaurant.</p>
                    </div>
                    <Link
                        href="/admin/orders"
                        className="text-sm font-semibold text-[#FF5C00] hover:underline"
                    >
                        View All →
                    </Link>
                </div>
                {quickOrdersLoading ? (
                    <div className="mt-3 flex h-28 items-center justify-center rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-500">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading recent orders...
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="mt-3 rounded-xl border border-zinc-300 px-6 py-10 text-center text-sm font-medium text-zinc-500">
                        No recent orders yet.
                    </div>
                ) : (
                    <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-300">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-zinc-200 bg-zinc-50/60 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                                <tr>
                                    <th className="px-6 py-4">Order</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Payment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-600">
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="group transition-colors hover:bg-zinc-50/40">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div>
                                                <p className="text-[15px] font-semibold text-zinc-900">#{order.orderNumber}</p>
                                                <p className="mt-0.5 text-sm font-medium text-zinc-400">
                                                    {order.items.length} items · {order.orderType.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-[15px] font-semibold text-zinc-900">{order.waiterId?.name || 'Unknown waiter'}</p>
                                                <p className="mt-0.5 text-sm font-medium text-zinc-400">
                                                    {order.orderType === 'DINE_IN' ? `Table ${order.tableId?.number || 'N/A'}` : order.orderType === 'TAKEAWAY' ? 'Pickup order' : 'Delivery order'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[15px] font-medium text-zinc-700">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right text-base font-bold text-zinc-900">
                                            NRs. {Math.round(order.total).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                order.status === 'COMPLETED'
                                                    ? 'bg-zinc-100 text-zinc-700'
                                                    : order.status === 'SERVED'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : order.status === 'COOKED'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : order.status === 'COOKING'
                                                                ? 'bg-violet-100 text-violet-700'
                                                                : order.status === 'CANCELLED'
                                                                    ? 'bg-rose-100 text-rose-700'
                                                                    : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                order.paymentStatus === 'PAID'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : order.paymentStatus === 'PARTIAL'
                                                        ? 'bg-sky-100 text-sky-700'
                                                        : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {order.paymentStatus || 'PENDING'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
