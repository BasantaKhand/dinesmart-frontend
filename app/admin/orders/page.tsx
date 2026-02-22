"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/features/admin/components/ui/badge';
import api from '@/lib/axios';
import { Clock, Eye, ShoppingBag } from 'lucide-react';

interface OrderItem {
    _id: string;
    name: string;
    quantity: number;
    status: string;
    notes?: string;
}

interface Order {
    _id: string;
    orderNumber: string;
    tableId?: { number: string };
    waiterId?: { name: string };
    items: OrderItem[];
    total: number;
    status: string;
    createdAt: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            // Fetch all orders including completed ones
            const res = await api.get('/orders?page=1&limit=100');
            console.log('API Response:', res);
            const ordersList = Array.isArray(res.data?.data) ? res.data.data : [];
            console.log('Orders List:', ordersList);
            setOrders(ordersList);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            await fetchOrders();
        } catch (err) {
            console.error('Failed to update order:', err);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'COOKING': return 'blue' as any;
            case 'SERVED': return 'success';
            case 'COMPLETED': return 'gray';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900">Orders</h1>
                <p className="mt-1 text-[15px] font-medium text-zinc-500">Track and manage all restaurant orders in real-time.</p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 mb-4 animate-pulse">
                        <Clock size={32} className="text-zinc-400" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-500">Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-[2rem] bg-white ring-1 ring-zinc-100">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 mb-4">
                        <ShoppingBag size={36} className="text-zinc-400" />
                    </div>
                    <h4 className="text-base font-bold text-zinc-800 mb-2">No orders yet</h4>
                    <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                        Orders from waiters will appear here. You can track and update their status in real-time.
                    </p>
                </div>
            ) : (
                <div className="rounded-[2rem] bg-white ring-1 ring-zinc-100 overflow-hidden shadow-none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 border-b border-zinc-50">
                                <tr>
                                    <th className="px-8 py-5">Order ID</th>
                                    <th className="px-8 py-5">Table</th>
                                    <th className="px-8 py-5">Waiter</th>
                                    <th className="px-8 py-5 text-center">Items</th>
                                    <th className="px-8 py-5 text-right">Total</th>
                                    <th className="px-8 py-5 text-center">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 text-zinc-600">
                                {orders.map((order) => (
                                    <tr key={order._id} className={`group transition-colors ${
                                        order.status === 'COMPLETED' 
                                            ? 'bg-zinc-50/50 hover:bg-zinc-50' 
                                            : 'hover:bg-zinc-50/50'
                                    }`}>
                                        <td className="whitespace-nowrap px-8 py-5">
                                            <span className={`rounded-[2rem] px-3 py-1.5 text-[11px] font-black ring-1 shadow-none ${
                                                order.status === 'COMPLETED'
                                                    ? 'bg-zinc-100 text-zinc-500 ring-zinc-200'
                                                    : 'bg-zinc-100 text-zinc-600 ring-zinc-200'
                                            }`}>
                                                #{order.orderNumber}
                                            </span>
                                        </td>
                                        <td className={`px-8 py-5 font-black ${
                                            order.status === 'COMPLETED' ? 'text-zinc-500' : 'text-zinc-900'
                                        }`}>Table {order.tableId?.number || 'N/A'}</td>
                                        <td className={`px-8 py-5 ${
                                            order.status === 'COMPLETED' ? 'opacity-60' : ''
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black ${
                                                    order.status === 'COMPLETED' ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-50 text-zinc-400'
                                                }`}>
                                                    {order.waiterId?.name.charAt(0) || 'W'}
                                                </div>
                                                <span className={`font-black ${
                                                    order.status === 'COMPLETED' ? 'text-zinc-500' : 'text-zinc-700'
                                                }`}>{order.waiterId?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className={`px-8 py-5 text-center font-bold ${
                                            order.status === 'COMPLETED' ? 'text-zinc-400' : 'text-zinc-500'
                                        }`}>{order.items.length} items</td>
                                        <td className={`px-8 py-5 text-right font-black ${
                                            order.status === 'COMPLETED' ? 'text-zinc-500' : 'text-zinc-900'
                                        }`}>Rs. {Math.round(order.total).toLocaleString()}</td>
                                        <td className="px-8 py-5 text-center">
                                            <Badge variant={getStatusVariant(order.status) as any}>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {order.status === 'PENDING' && (
                                                    <button 
                                                        onClick={() => updateOrderStatus(order._id, 'COOKING')}
                                                        className="rounded-[2rem] bg-[#FF5C00]/10 px-4 py-2 text-[11px] font-black text-[#FF5C00] transition-all hover:bg-[#FF5C00]/20 active:scale-95 shadow-none">
                                                        COOKING
                                                    </button>
                                                )}
                                                {order.status === 'COOKING' && (
                                                    <button 
                                                        onClick={() => updateOrderStatus(order._id, 'SERVED')}
                                                        className="rounded-[2rem] bg-emerald-50 px-4 py-2 text-[11px] font-black text-emerald-600 transition-all hover:bg-emerald-100 active:scale-95 shadow-none">
                                                        READY
                                                    </button>
                                                )}
                                                {order.status === 'SERVED' && (
                                                    <button 
                                                        onClick={() => updateOrderStatus(order._id, 'COMPLETED')}
                                                        className="rounded-[2rem] bg-blue-50 px-4 py-2 text-[11px] font-black text-blue-600 transition-all hover:bg-blue-100 active:scale-95 shadow-none">
                                                        COMPLETE
                                                    </button>
                                                )}
                                                {order.status !== 'COMPLETED' && (
                                                    <button 
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="rounded-[2rem] bg-zinc-50 p-2.5 text-zinc-400 ring-1 ring-zinc-200 transition-all hover:text-zinc-600 hover:ring-zinc-300 active:scale-95 shadow-none">
                                                        <Eye size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
