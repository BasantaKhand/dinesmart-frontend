"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Clock, ShoppingBag, Search, Eye } from 'lucide-react';
import { Pagination } from '@/features/admin/components/ui/pagination';
import { Modal } from '@/features/admin/components/ui/modal';
import { useGetOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import type { Order } from '@/api/order.api';

export default function OrdersPage() {
    const ORDER_STATUS_OPTIONS: Order['status'][] = ['PENDING', 'COOKING', 'COOKED'];

    // Use react-query hooks
    const { data: ordersResponse, isLoading, refetch } = useGetOrders({ page: 1, limit: 300 });
    const updateOrderStatusMutation = useUpdateOrderStatus();

    const orders = ordersResponse?.data || [];

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | Order['status']>('ALL');
    const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'PARTIAL'>('ALL');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [notesOrder, setNotesOrder] = useState<Order | null>(null);
    const itemsPerPage = 8;

    const getItemNotes = (order: Order | null) => {
        if (!order) return [] as Array<{ name: string; note: string }>;
        return order.items
            .filter((item) => item.notes && item.notes.trim().length > 0)
            .map((item) => ({ name: item.name, note: item.notes!.trim() }));
    };

    useEffect(() => {
        // Poll for updates every 5 seconds
        const interval = setInterval(() => refetch(), 5000);
        return () => clearInterval(interval);
    }, [refetch]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, paymentFilter]);

    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        const existingOrder = orders.find((order) => order._id === orderId);
        if (!existingOrder || existingOrder.status === newStatus || existingOrder.paymentStatus === 'PAID') {
            return;
        }

        setUpdatingOrderId(orderId);

        try {
            await updateOrderStatusMutation.mutateAsync({ id: orderId, data: { status: newStatus } });
        } catch (err) {
            console.error('Failed to update order:', err);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const filteredOrders = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
            const paymentStatus = order.paymentStatus || 'PENDING';
            const matchesPayment = paymentFilter === 'ALL' || paymentStatus === paymentFilter;
            if (!matchesStatus) return false;
            if (!matchesPayment) return false;

            if (!query) return true;

            const orderNumber = order.orderNumber?.toLowerCase() || '';
            const tableNumber = order.tableId?.number?.toLowerCase() || '';
            const waiterName = order.waiterId?.name?.toLowerCase() || '';
            const orderType = order.orderType?.toLowerCase() || '';

            return (
                orderNumber.includes(query) ||
                tableNumber.includes(query) ||
                waiterName.includes(query) ||
                orderType.includes(query)
            );
        });
    }, [orders, searchQuery, statusFilter, paymentFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredOrders, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Orders</h1>
                <p className="text-zinc-600">Track and manage all restaurant orders in real-time.</p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 animate-pulse">
                        <Clock size={32} className="text-zinc-400" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-500">Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 text-center ring-1 ring-zinc-200">
                    <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-xl bg-zinc-100">
                        <ShoppingBag size={36} className="text-zinc-400" />
                    </div>
                    <h4 className="text-sm font-bold text-zinc-800 mb-2">No orders yet</h4>
                    <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                        Orders from waiters will appear here. You can track and update their status in real-time.
                    </p>
                </div>
            ) : (
                <div className="rounded-xl bg-white ring-1 ring-zinc-200 overflow-hidden">
                    <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-sm">
                            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search by order ID, table, waiter or type..."
                                className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-zinc-300"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto">
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value as 'ALL' | Order['status'])}
                                className="h-10 min-w-[126px] rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="COOKING">Cooking</option>
                                <option value="COOKED">Cooked</option>
                                <option value="SERVED">Served</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                            <select
                                value={paymentFilter}
                                onChange={(event) => setPaymentFilter(event.target.value as 'ALL' | 'PAID' | 'PENDING' | 'PARTIAL')}
                                className="h-10 min-w-[130px] rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                            >
                                <option value="ALL">All Payment</option>
                                <option value="PAID">Paid</option>
                                <option value="PENDING">Pending</option>
                                <option value="PARTIAL">Partial</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Order</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Customer</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider text-center">Payment</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-600">
                                {paginatedOrders.map((order) => (
                                    <tr key={order._id} className="transition-colors hover:bg-zinc-50">
                                        <td className="whitespace-nowrap px-4 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900">#{order.orderNumber}</p>
                                                <p className="mt-0.5 text-sm text-zinc-500">
                                                    {order.items.length} items · {order.orderType.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900">{order.waiterId?.name || 'Unknown waiter'}</p>
                                                <p className="mt-0.5 text-sm text-zinc-500">
                                                    {order.orderType === 'DINE_IN' ? `Table ${order.tableId?.number || 'N/A'}` : order.orderType === 'TAKEAWAY' ? 'Pickup order' : 'Delivery order'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-medium text-zinc-700">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-4 text-right text-sm font-bold text-zinc-900">
                                            NRs. {Math.round(order.total).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-center">
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
                                        <td className="px-4 py-4 text-center">
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
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                {!['SERVED', 'COMPLETED', 'CANCELLED'].includes(order.status) && (
                                                    <select
                                                        value={order.status}
                                                        onChange={(event) => updateOrderStatus(order._id, event.target.value as Order['status'])}
                                                        disabled={updatingOrderId === order._id || order.paymentStatus === 'PAID'}
                                                        className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-700 outline-none focus:border-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
                                                        title={order.paymentStatus === 'PAID' ? 'Status locked after payment' : 'Update status'}
                                                    >
                                                        {ORDER_STATUS_OPTIONS.map((statusOption) => (
                                                            <option key={statusOption} value={statusOption}>{statusOption}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                <button
                                                    onClick={() => setNotesOrder(order)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                                                    title="View details"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="border-t border-zinc-200 px-6 py-10 text-center text-sm font-medium text-zinc-500">
                            No orders match this filter.
                        </div>
                    ) : (
                        <div className="border-t border-zinc-200 px-5 py-4">
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={Boolean(notesOrder)}
                onClose={() => setNotesOrder(null)}
                title=""
                maxWidthClass="max-w-xl"
                showHeader={false}
            >
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-zinc-900">Order #{notesOrder?.orderNumber || ''} Details</h3>
                    <p className="mt-1 text-sm font-medium text-zinc-500">Summary and item-level notes</p>

                    <div className="mt-4 border-t border-zinc-200 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Summary</h4>
                        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Order Type</p>
                                <p className="mt-1 font-semibold text-zinc-800">{notesOrder?.orderType?.replace('_', ' ') || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Table / Mode</p>
                                <p className="mt-1 font-semibold text-zinc-800">
                                    {notesOrder?.orderType === 'DINE_IN'
                                        ? `Table ${notesOrder?.tableId?.number || 'N/A'}`
                                        : notesOrder?.orderType === 'TAKEAWAY'
                                            ? 'Pickup'
                                            : 'Delivery'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Status</p>
                                <p className="mt-1 font-semibold text-zinc-800">{notesOrder?.status || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Payment</p>
                                <p className="mt-1 font-semibold text-zinc-800">{notesOrder?.paymentStatus || 'PENDING'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Created</p>
                                <p className="mt-1 font-semibold text-zinc-800">
                                    {notesOrder ? new Date(notesOrder.createdAt).toLocaleString() : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total</p>
                                <p className="mt-1 font-semibold text-zinc-800">NRs. {Math.round(notesOrder?.total || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 border-t border-zinc-200 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Items</h4>
                        <div className="mt-3 space-y-2">
                            {(notesOrder?.items || []).map((item, index) => (
                                <div key={`${item.name}-${index}`} className="border-b border-zinc-200 pb-3 last:border-b-0">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-zinc-900">{item.quantity} × {item.name}</p>
                                        <p className="text-sm font-semibold text-zinc-700">NRs. {Math.round(item.total).toLocaleString()}</p>
                                    </div>
                                    <p className="mt-2 text-xs font-medium text-zinc-500">
                                        Note: {item.notes?.trim() ? item.notes.trim() : 'No note'}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {notesOrder?.items?.length === 0 && (
                            <p className="mt-3 text-sm font-medium text-zinc-700">No items found for this order.</p>
                        )}

                        {notesOrder?.items?.length && getItemNotes(notesOrder).length === 0 ? (
                            <p className="mt-3 text-sm font-medium text-zinc-600">No item notes added for this order.</p>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
