"use client";

import React, { useState } from 'react';
import {
    Clock,
    ChefHat,
    CheckCircle2,
    AlertCircle,
    ShoppingBag,
    ChevronRight,
    Utensils,
    Search,
    Filter,
    MoveRight
} from 'lucide-react';
import { useGetOrders, useUpdateItemStatus } from '@/hooks/useOrders';

interface OrderItem {
    _id: string;
    name: string;
    quantity: number;
    status: 'PREPARING' | 'READY' | 'SERVED';
    notes?: string;
}

interface Order {
    _id: string;
    orderNumber: string;
    tableId?: {
        _id: string;
        number: string;
    };
    items: OrderItem[];
    status: string;
    createdAt: string;
}

export default function OrdersView() {
    const [filter, setFilter] = useState<'ALL' | 'READY' | 'PREPARING'>('ALL');

    const { data: ordersResponse, isLoading, refetch: refetchOrders } = useGetOrders({ status: 'PENDING,COOKING,SERVED' });
    const updateItemStatusMutation = useUpdateItemStatus();

    const orders = (ordersResponse?.data || []) as Order[];

    // Poll every 10s
    React.useEffect(() => {
        const interval = setInterval(() => refetchOrders(), 10000);
        return () => clearInterval(interval);
    }, [refetchOrders]);

    const updateItemStatus = async (orderId: string, itemId: string, newStatus: string) => {
        try {
            await updateItemStatusMutation.mutateAsync({ orderId, itemId, data: { status: newStatus } });
            refetchOrders();
        } catch (err) {
            console.error("Failed to update item status", err);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'ALL') return true;
        if (filter === 'READY') return order.items.some(i => i.status === 'READY');
        if (filter === 'PREPARING') return order.items.some(i => i.status === 'PREPARING');
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
                <div className="h-10 w-10 border-4 border-[#FF5C00]/20 border-t-[#FF5C00] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-400">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Active Orders</h2>
                    <p className="text-xs font-semibold text-zinc-400 mt-1">Track and serve ready items to tables</p>
                </div>

                <div className="flex bg-zinc-50 p-1 rounded-lg border border-zinc-100">
                    {['ALL', 'PREPARING', 'READY'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all
                                ${filter === f ? 'bg-[#FF5C00] text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map(order => (
                    <div
                        key={order._id}
                        className="bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col"
                    >
                        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-[#FF5C00] text-white flex items-center justify-center font-bold text-sm">
                                    {order.tableId?.number.replace('T-', '') || '??'}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-900">Table {order.tableId?.number || 'N/A'}</h4>
                                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-tight">{order.orderNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Clock size={12} />
                                <span className="text-[11px] font-semibold">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        <div className="flex-1 p-4 space-y-3">
                            {order.items.map(item => (
                                <div key={item._id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`h-1.5 w-1.5 rounded-full 
                                            ${item.status === 'READY' ? 'bg-emerald-500' :
                                                item.status === 'PREPARING' ? 'bg-amber-400' : 'bg-zinc-200'}`}
                                        />
                                        <div>
                                            <span className="text-sm font-semibold text-zinc-700">
                                                <span className="text-zinc-400 mr-2 text-xs">{item.quantity}x</span>
                                                {item.name}
                                            </span>
                                            {item.notes && (
                                                <div className="mt-1 inline-flex rounded px-1.5 py-0.5 text-[9px] font-semibold bg-rose-50 text-rose-700">
                                                    {item.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {item.status === 'READY' ? (
                                        <button
                                            onClick={() => updateItemStatus(order._id, item._id, 'SERVED')}
                                            className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-md hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                                        >
                                            <Utensils size={10} />
                                            SERVE
                                        </button>
                                    ) : (
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded
                                            ${item.status === 'PREPARING' ? 'text-amber-600 bg-amber-50 border border-amber-100' : 'text-zinc-400 bg-zinc-50 border border-zinc-100'}`}>
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <ChefHat size={14} />
                                <span className="text-[11px] font-semibold text-zinc-500">Processing...</span>
                            </div>
                            <button className="text-[11px] font-bold text-[#FF5C00] hover:underline flex items-center gap-1 group">
                                Details
                                <MoveRight size={12} className="transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredOrders.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-40">
                        <ShoppingBag size={48} className="text-zinc-200" />
                        <h3 className="text-sm font-bold text-zinc-400 mt-3">No Active Orders</h3>
                        <p className="text-xs font-semibold text-zinc-300">All checks are cleared</p>
                    </div>
                )}
            </div>
        </div>
    );
}
