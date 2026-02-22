"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Wallet,
    Receipt,
    BadgeCheck,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Loader2,
    CheckCircle2,
    LogOut,
    Banknote
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Modal } from "@/features/admin/components/ui/modal";
import ConfirmationDialog from "@/features/admin/components/ui/confirmation-dialog";
import { apiGetPaymentSettings, PaymentSettings } from "@/features/admin/services/restaurant-service";
import { apiGetOrders, apiUpdateOrderStatus, Order } from "@/features/admin/services/order-service";
import CashDrawerPanel from "./cash-drawer-panel";
import DailySettlementPanel from "./daily-settlement-panel";

const formatCurrency = (value: number) => `NRs. ${value.toLocaleString()}`;

const isSameDay = (date: Date, compare: Date) =>
    date.getFullYear() === compare.getFullYear() &&
    date.getMonth() === compare.getMonth() &&
    date.getDate() === compare.getDate();

const formatRelativeTime = (value: string) => {
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return "Just now";
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} d ago`;
};

export default function CashierDashboard() {
    const { user, logout } = useAuth();
    const today = new Date();
    const [queueOrders, setQueueOrders] = useState<Order[]>([]);
    const [settledOrders, setSettledOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<Order["paymentMethod"]>("CASH");
    const [paymentReference, setPaymentReference] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
        provider: 'MANUAL',
        qrCodeUrl: '',
        accountName: '',
        accountId: '',
        notes: ''
    });
    const [restaurantName, setRestaurantName] = useState('');
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

    const loadOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [queueRes, settledRes] = await Promise.all([
                apiGetOrders({ status: "COMPLETED", paymentStatus: "PENDING", billPrinted: true, limit: 50, page: 1 }),
                apiGetOrders({ paymentStatus: "PAID", limit: 8, page: 1 })
            ]);

            const queueList = Array.isArray(queueRes?.data) ? queueRes.data : [];
            const settledList = Array.isArray(settledRes?.data) ? settledRes.data : [];

            setQueueOrders(queueList);
            setSettledOrders(settledList);

            if (selectedOrder) {
                const stillInQueue = queueList.find((order) => order._id === selectedOrder._id);
                setSelectedOrder(stillInQueue || null);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load cashier data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        const loadPaymentSettings = async () => {
            try {
                const res = await apiGetPaymentSettings();
                setRestaurantName(res.data.restaurantName || '');
                setPaymentSettings({
                    provider: res.data.paymentSettings?.provider || 'MANUAL',
                    qrCodeUrl: res.data.paymentSettings?.qrCodeUrl || '',
                    accountName: res.data.paymentSettings?.accountName || '',
                    accountId: res.data.paymentSettings?.accountId || '',
                    notes: res.data.paymentSettings?.notes || ''
                });
            } catch (err: any) {
                setError(err?.response?.data?.message || 'Failed to load payment settings.');
            }
        };

        loadPaymentSettings();
    }, []);

    const filteredQueue = useMemo(() => {
        if (!searchTerm.trim()) return queueOrders;
        const term = searchTerm.trim().toLowerCase();
        return queueOrders.filter((order) => {
            const orderNumber = order.orderNumber?.toLowerCase() || "";
            const tableNumber = order.tableId?.number?.toLowerCase() || "";
            return orderNumber.includes(term) || tableNumber.includes(term);
        });
    }, [queueOrders, searchTerm]);

    const todayPaidOrders = useMemo(() => {
        return settledOrders.filter((order) => isSameDay(new Date(order.updatedAt || order.createdAt), today));
    }, [settledOrders, today]);

    const collectionsToday = todayPaidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgBillSize = todayPaidOrders.length > 0 ? Math.round(collectionsToday / todayPaidOrders.length) : 0;

    const cashPaidToday = todayPaidOrders
        .filter((order) => order.paymentMethod === "CASH")
        .reduce((sum, order) => sum + (order.total || 0), 0);

    const kpis = useMemo(
        () => [
            {
                label: "Collections Today",
                value: formatCurrency(collectionsToday),
                helper: todayPaidOrders.length ? `${todayPaidOrders.length} bills closed` : "No settlements yet",
                icon: Wallet,
                iconBg: "bg-emerald-500",
                trend: "up",
            },
            {
                label: "Pending Payments",
                value: `${queueOrders.length}`,
                helper: "Awaiting settlement",
                icon: Clock,
                iconBg: "bg-amber-500",
                trend: "down",
            },
            {
                label: "Avg Bill Size",
                value: formatCurrency(avgBillSize),
                helper: todayPaidOrders.length ? "Based on today" : "No payments yet",
                icon: Receipt,
                iconBg: "bg-blue-500",
                trend: "up",
            },
            {
                label: "Cash Drawer",
                value: formatCurrency(cashPaidToday),
                helper: "Cash collected today",
                icon: Banknote,
                iconBg: "bg-purple-500",
                trend: "up",
            },
        ],
        [collectionsToday, todayPaidOrders.length, queueOrders.length, avgBillSize, cashPaidToday]
    );

    const handleSettleOrder = async () => {
        if (!selectedOrder) return;
        setIsUpdating(true);
        try {
            const provider = paymentMethod === 'QR' ? paymentSettings.provider : 'MANUAL';
            await apiUpdateOrderStatus(selectedOrder._id, {
                status: "COMPLETED",
                paymentStatus: "PAID",
                paymentMethod,
                paymentProvider: provider,
                paymentReference: paymentReference.trim() || undefined
            });
            await loadOrders();
            setSelectedOrder(null);
            setPaymentReference('');
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to settle payment.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePrintOrder = (order: Order) => {
        const printWindow = window.open("", "", "width=800,height=600");
        if (!printWindow) return;
        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt - ${order.orderNumber || "Order"}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 24px; }
                        h2 { margin: 0 0 8px; }
                        .muted { color: #666; font-size: 12px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                        th, td { text-align: left; padding: 8px 4px; border-bottom: 1px solid #eee; }
                        .totals { margin-top: 16px; text-align: right; }
                    </style>
                </head>
                <body>
                    <h2>Table ${order.tableId?.number || "-"}</h2>
                    <div class="muted">Order ${order.orderNumber || ""}</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items
                .map(
                    (item) => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>NRs. ${item.price}</td>
                                        <td>NRs. ${item.total}</td>
                                    </tr>
                                `
                )
                .join("")}
                        </tbody>
                    </table>
                    <div class="totals">
                        <div>Subtotal: NRs. ${order.subtotal.toLocaleString()}</div>
                        <div>VAT (13%): NRs. ${order.tax.toLocaleString()}</div>
                        <div><strong>Total: NRs. ${order.total.toLocaleString()}</strong></div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handlePrintSelected = () => {
        if (selectedOrder) {
            handlePrintOrder(selectedOrder);
            return;
        }

        if (settledOrders.length > 0) {
            handlePrintOrder(settledOrders[0]);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-white">
                <header className="sticky top-0 z-20 h-16 px-4 md:px-6 flex items-center justify-between border-b border-zinc-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-[#FF5C00] rounded-lg flex items-center justify-center">
                            <Receipt size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-500">Cashier Desk</p>
                            <h1 className="text-lg font-bold text-zinc-900 tracking-tight">Payment Control</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowLogoutConfirmation(true)}
                            className="h-9 w-9 rounded-lg border border-zinc-200 text-zinc-500 hover:text-rose-500 flex items-center justify-center transition-colors"
                            aria-label="Logout"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-zinc-900">{user?.name || "Cashier"}</p>
                            <p className="text-xs font-semibold text-zinc-500">{restaurantName || "Active Restaurant"}</p>
                        </div>
                        <div className="h-9 w-9 rounded-lg bg-[#FF5C00] text-white flex items-center justify-center text-sm font-bold">
                            {(user?.name || "C").charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="px-4 md:px-6 py-6 lg:py-8">
                    <div className="mx-auto w-full max-w-[1400px] space-y-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Today, {today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</h2>
                                <p className="text-sm font-medium text-zinc-500 mt-1">Track collections, settle bills, and close tables.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            {kpis.map((kpi) => {
                                const Icon = kpi.icon;
                                return (
                                    <div key={kpi.label} className="rounded-2xl border border-zinc-200 p-4 sm:p-5 bg-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{kpi.label}</p>
                                                <p className="text-2xl font-bold mt-2 text-zinc-900">{kpi.value}</p>
                                            </div>
                                            <div className={`h-10 w-10 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                                                <Icon size={18} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-zinc-500">
                                            {kpi.trend === "up" ? (
                                                <ArrowUpRight size={14} className="text-emerald-500" />
                                            ) : (
                                                <ArrowDownRight size={14} className="text-amber-500" />
                                            )}
                                            <span>{kpi.helper}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <DailySettlementPanel />
                            <CashDrawerPanel />
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                                <div className="p-4 md:p-5 border-b border-zinc-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900">Payment Queue</h3>
                                        <p className="text-xs font-semibold text-zinc-500 mt-1">Bills waiting at the cashier counter</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="relative w-full sm:w-[240px]">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                            <input
                                                type="text"
                                                placeholder="Search by order or table"
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs font-semibold text-zinc-600 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-300 outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={loadOrders}
                                            className="h-10 px-4 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                </div>

                                <div className="md:hidden p-4 space-y-3 max-h-[480px] overflow-y-auto">
                                    {isLoading && (
                                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-5 text-sm text-zinc-500 flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Loading queue...
                                        </div>
                                    )}
                                    {!isLoading && filteredQueue.length === 0 && (
                                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-5 text-sm text-zinc-500 text-center">
                                            No pending payments right now.
                                        </div>
                                    )}
                                    {!isLoading && filteredQueue.map((order) => (
                                        <div key={order._id} className="rounded-xl border border-zinc-200 p-3 bg-white">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900">{order.orderNumber}</p>
                                                    <p className="text-xs font-semibold text-zinc-500 mt-1">Table {order.tableId?.number || "-"} · {order.items?.length || 0} items</p>
                                                </div>
                                                <p className="text-sm font-bold text-zinc-900">{formatCurrency(order.total)}</p>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600">Waiting</span>
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setPaymentMethod(paymentSettings.provider === 'MANUAL' ? 'CASH' : 'QR');
                                                        setPaymentReference(order.paymentReference || '');
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="inline-flex items-center gap-1 text-[#FF5C00] text-xs font-bold"
                                                >
                                                    Settle <ArrowUpRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="hidden md:block overflow-x-auto max-h-[520px] overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Order</th>
                                                <th className="px-4 py-3 text-left">Table</th>
                                                <th className="px-4 py-3 text-center">Items</th>
                                                <th className="px-4 py-3 text-left">Channel</th>
                                                <th className="px-4 py-3 text-left">Status</th>
                                                <th className="px-4 py-3 text-right">Total</th>
                                                <th className="px-4 py-3 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {isLoading && (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-zinc-500">
                                                        <div className="inline-flex items-center gap-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" /> Loading queue...
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {!isLoading && filteredQueue.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-zinc-500">
                                                        No pending payments right now.
                                                    </td>
                                                </tr>
                                            )}
                                            {!isLoading && filteredQueue.map((order) => (
                                                <tr
                                                    key={order._id}
                                                    className={`hover:bg-zinc-50/50 transition-colors ${selectedOrder?._id === order._id ? "bg-orange-50/60" : ""
                                                        }`}
                                                >
                                                    <td className="px-4 py-3 font-semibold text-zinc-800">{order.orderNumber}</td>
                                                    <td className="px-4 py-3 text-zinc-600">{order.tableId?.number || "-"}</td>
                                                    <td className="px-4 py-3 text-center text-zinc-600">{order.items?.length || 0}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-600">
                                                            {order.paymentMethod}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600">
                                                            Waiting
                                                        </span>
                                                        <p className="text-[11px] text-zinc-400 mt-1">{formatRelativeTime(order.createdAt)}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-zinc-900">
                                                        {formatCurrency(order.total)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setPaymentMethod(paymentSettings.provider === 'MANUAL' ? 'CASH' : 'QR');
                                                                setPaymentReference(order.paymentReference || '');
                                                                setShowPaymentModal(true);
                                                            }}
                                                            className="inline-flex items-center gap-1 text-[#FF5C00] text-xs font-bold hover:underline"
                                                        >
                                                            Settle <ArrowUpRight size={12} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                                <div className="p-4 md:p-5 border-b border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900">Recent Settlements</h3>
                                    <p className="text-xs font-semibold text-zinc-500 mt-1">Latest closed checks</p>
                                </div>
                                <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                                    {settledOrders.length === 0 && (
                                        <div className="text-sm font-semibold text-zinc-400 text-center py-4">
                                            No settled payments yet.
                                        </div>
                                    )}
                                    {settledOrders.map((order) => (
                                        <div key={order._id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-zinc-800">{order.orderNumber}</p>
                                                <p className="text-xs font-semibold text-zinc-400">Table {order.tableId?.number || "-"} · {order.paymentMethod}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-zinc-900">{formatCurrency(order.total)}</p>
                                                <p className="text-[11px] font-semibold text-zinc-400">{new Date(order.updatedAt || order.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title=""
                maxWidthClass="max-w-4xl"
                showHeader={false}
            >
                {!selectedOrder && (
                    <div className="text-sm font-semibold text-zinc-500">Select a bill to continue.</div>
                )}
                {selectedOrder && (
                    <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.80fr] gap-2">
                        <div>
                            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Invoice</p>
                                    <h3 className="text-xl font-bold text-zinc-900 mt-1">{restaurantName || 'Active Restaurant'}</h3>
                                    <p className="text-xs font-semibold text-zinc-500 mt-1">Payment Receipt</p>
                                </div>
                                <div className="text-right text-xs font-semibold text-zinc-500 space-y-1">
                                    <div>Invoice #{selectedOrder.orderNumber}</div>
                                    <div>Date: {new Date(selectedOrder.createdAt).toLocaleDateString('en-US')}</div>
                                    <div>Table: {selectedOrder.tableId?.number || '-'}</div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-zinc-500">
                                <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">Billed To</p>
                                    <p className="text-sm font-bold text-zinc-900">Walk-in Guest</p>
                                    <p className="text-xs text-zinc-500">Order items as listed</p>
                                </div>
                                <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">Payment</p>
                                    <p className="text-sm font-bold text-zinc-900">Pending</p>
                                    <p className="text-xs text-zinc-500">Method: {paymentMethod}</p>
                                </div>
                            </div>

                            <div className="mt-4 border border-zinc-100 rounded-xl overflow-hidden">
                                <div className="grid grid-cols-[1.7fr_0.5fr_0.8fr_0.8fr] bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-3 py-2">
                                    <span>Item</span>
                                    <span className="text-center">Qty</span>
                                    <span className="text-right">Price</span>
                                    <span className="text-right">Total</span>
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.menuItemId} className="grid grid-cols-[1.7fr_0.5fr_0.8fr_0.8fr] px-3 py-2 text-sm border-t border-zinc-100">
                                            <div>
                                                <p className="font-semibold text-zinc-800">{item.name}</p>
                                                <p className="text-[11px] text-zinc-400">{item.notes || 'No special notes'}</p>
                                            </div>
                                            <div className="text-center text-zinc-600">{item.quantity}</div>
                                            <div className="text-right text-zinc-600">NRs. {item.price}</div>
                                            <div className="text-right font-semibold text-zinc-900">NRs. {item.total}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr] gap-4">
                                <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
                                    <p className="font-semibold text-zinc-700">Notes</p>
                                    <p className="mt-1">Please confirm payment before closing the table.</p>
                                </div>
                                <div className="rounded-xl border border-zinc-100 bg-white px-3 py-2 text-sm">
                                    <div className="flex items-center justify-between text-zinc-600">
                                        <span>Subtotal</span>
                                        <span className="font-semibold text-zinc-900">{formatCurrency(selectedOrder.subtotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-zinc-600 mt-2">
                                        <span>VAT (13%)</span>
                                        <span className="font-semibold text-zinc-900">{formatCurrency(selectedOrder.tax)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-base font-bold text-zinc-900 mt-2">
                                        <span>Total</span>
                                        <span>{formatCurrency(selectedOrder.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pl-2">
                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 flex flex-col items-center gap-3 max-w-[280px] mx-auto">
                                {paymentSettings.qrCodeUrl ? (
                                    <img
                                        src={paymentSettings.qrCodeUrl}
                                        alt="Payment QR"
                                        className="h-40 w-40 object-contain"
                                    />
                                ) : (
                                    <div className="h-40 w-40 rounded-xl border border-dashed border-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-400 text-center px-4">
                                        Add a QR image URL in Payment Settings
                                    </div>
                                )}
                                <div className="text-center space-y-1">
                                    <p className="text-xs font-semibold text-zinc-500">Scan to pay via {paymentSettings.provider}</p>
                                    {(paymentSettings.accountName || paymentSettings.accountId) && (
                                        <p className="text-xs font-semibold text-zinc-400">
                                            {paymentSettings.accountName || 'Account'} {paymentSettings.accountId ? `· ${paymentSettings.accountId}` : ''}
                                        </p>
                                    )}
                                    {paymentSettings.notes && (
                                        <p className="text-[11px] text-zinc-400">{paymentSettings.notes}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {paymentMethod === 'QR' && (
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-500">Transaction ID</label>
                                        <input
                                            type="text"
                                            value={paymentReference}
                                            onChange={(event) => setPaymentReference(event.target.value)}
                                            placeholder="Customer payment reference"
                                            className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700 focus:bg-white focus:border-zinc-300 outline-none"
                                        />
                                        <p className="text-[11px] text-zinc-400 mt-1">Optional for manual verification if webhook is not enabled.</p>
                                    </div>
                                )}

                                <div className="flex gap-3 max-w-[280px] mx-auto w-full">
                                    <button
                                        onClick={handlePrintSelected}
                                        className="flex-1 h-10 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                                    >
                                        Print Bill
                                    </button>
                                    <button
                                        onClick={async () => {
                                            await handleSettleOrder();
                                            setShowPaymentModal(false);
                                        }}
                                        disabled={isUpdating}
                                        className="flex-1 h-10 rounded-lg bg-[#FF5C00] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#e65300] transition-colors disabled:opacity-60"
                                    >
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={16} />}
                                        {isUpdating ? "Settling..." : "Mark Paid"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmationDialog
                isOpen={showLogoutConfirmation}
                onClose={() => setShowLogoutConfirmation(false)}
                onConfirm={logout}
                title="Confirm Logout"
                message="Are you sure you want to logout?"
                confirmText="Logout"
                cancelText="Cancel"
                variant="warning"
            />
        </>
    );
}