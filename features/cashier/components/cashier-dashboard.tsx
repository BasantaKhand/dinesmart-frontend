"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Wallet,
    Receipt,
    Clock,
    ArrowUpRight,
    Search,
    Loader2,
    CheckCircle2,
    LogOut,
    Banknote,
    Settings,
    CheckCircle,
    Clock3,
    Lock,
    Unlock,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Modal } from "@/features/admin/components/ui/modal";
import ConfirmationDialog from "@/features/admin/components/ui/confirmation-dialog";
import { KPICard } from "@/features/admin/components/ui/kpi-card";
import { Badge } from "@/features/admin/components/ui/badge";
import { Pagination } from "@/features/admin/components/ui/pagination";
import { apiGetPaymentSettings, PaymentSettings } from "@/features/admin/services/restaurant-service";
import { apiGetOrders, apiUpdateOrderStatus, Order } from "@/features/admin/services/order-service";
import { apiOpenDrawer, apiCloseDrawer, apiGetDrawerStatus, CashDrawer } from "@/features/admin/services/cash-drawer-service";
import DailySettlementPanel from "./daily-settlement-panel";
import { NotificationDropdown } from "@/features/notifications/components/notification-dropdown";
import { useSocket } from "@/providers/socket-provider";

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
    const { socket } = useSocket();
    const router = useRouter();
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
    const [settlementRefreshKey, setSettlementRefreshKey] = useState(0);

    // Pagination State for Settlements
    const [settlementsPage, setSettlementsPage] = useState(1);
    const settlementsPerPage = 6;

    // Cash Drawer State
    const [drawer, setDrawer] = useState<CashDrawer | null>(null);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [showOpenDrawerModal, setShowOpenDrawerModal] = useState(false);
    const [showCloseDrawerModal, setShowCloseDrawerModal] = useState(false);
    const [openingAmount, setOpeningAmount] = useState('0');
    const [openingNotes, setOpeningNotes] = useState('');
    const [closingAmount, setClosingAmount] = useState('');
    const [closingNotes, setClosingNotes] = useState('');

    const isDrawerOpen = drawer?.status === 'OPEN';
    const drawerVariance = closingAmount ? parseFloat(closingAmount) - (drawer?.expectedAmount || 0) : 0;
    const varianceColor = drawerVariance > 0 ? 'text-emerald-600' : drawerVariance < 0 ? 'text-rose-600' : 'text-zinc-600';

    const loadOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [queueRes, settledRes] = await Promise.all([
                apiGetOrders({ status: "COMPLETED", paymentStatus: "PENDING", limit: 50, page: 1 }),
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
        if (!socket) return;

        socket.on('new_notification', (notification) => {
            if (['ORDER_COMPLETED', 'BILL_PRINTED', 'PAYMENT_PENDING'].includes(notification.type)) {
                loadOrders();
            }
        });

        return () => {
            socket.off('new_notification');
        };
    }, [socket]);

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

    // Load drawer status
    const loadDrawerStatus = async () => {
        try {
            setDrawerLoading(true);
            const data = await apiGetDrawerStatus();
            setDrawer(data);
        } catch (err: any) {
            console.error('Failed to load drawer status');
        } finally {
            setDrawerLoading(false);
        }
    };

    useEffect(() => {
        loadDrawerStatus();
        const interval = setInterval(loadDrawerStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenDrawer = async () => {
        if (!openingAmount) return;
        try {
            setDrawerLoading(true);
            await apiOpenDrawer(parseFloat(openingAmount), openingNotes || undefined);
            await loadDrawerStatus();
            setShowOpenDrawerModal(false);
            setOpeningAmount('');
            setOpeningNotes('');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to open drawer');
        } finally {
            setDrawerLoading(false);
        }
    };

    const handleCloseDrawer = async () => {
        if (!closingAmount) return;
        try {
            setDrawerLoading(true);
            await apiCloseDrawer(parseFloat(closingAmount), closingNotes || undefined);
            await loadDrawerStatus();
            setShowCloseDrawerModal(false);
            setClosingAmount('');
            setClosingNotes('');
            setSettlementRefreshKey(prev => prev + 1);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to close drawer');
        } finally {
            setDrawerLoading(false);
        }
    };

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

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning' as const;
            case 'COOKING': return 'blue' as const;
            case 'COOKED': return 'success' as const;
            case 'SERVED': return 'info' as const;
            case 'COMPLETED': return 'gray' as const;
            case 'PAID': return 'success' as const;
            default: return 'default' as const;
        }
    };

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
            setSettlementRefreshKey(prev => prev + 1);
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

    const combinedItems = useMemo(() => {
        if (!selectedOrder?.items) return [];

        const grouped = new Map<string, {
            key: string;
            name: string;
            price: number;
            quantity: number;
            total: number;
            notesList: string[];
        }>();

        selectedOrder.items.forEach((item) => {
            const key = (item as any).menuItemId?.toString?.() || (item as any)._id || item.name;
            const note = (item.notes || '').trim();
            const existing = grouped.get(key);

            if (existing) {
                existing.quantity += item.quantity;
                existing.total += item.total ?? item.price * item.quantity;
                if (note && !existing.notesList.includes(note)) existing.notesList.push(note);
            } else {
                grouped.set(key, {
                    key,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total: item.total ?? item.price * item.quantity,
                    notesList: note ? [note] : []
                });
            }
        });

        return Array.from(grouped.values()).map((entry) => ({
            key: entry.key,
            name: entry.name,
            price: entry.price,
            quantity: entry.quantity,
            total: entry.total,
            notes: entry.notesList.join(' | ')
        }));
    }, [selectedOrder]);

    return (
        <>
            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="sticky top-0 z-20 h-16 px-4 md:px-6 flex items-center justify-between border-b border-zinc-200 bg-white">
                    <div className="flex items-center gap-3">
                        <img src="/logo.svg" alt="DineSmart" className="h-10 w-10" />
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-zinc-900">DineSmart</h1>
                            <p className="text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">Cashier Panel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <NotificationDropdown />
                        <button
                            onClick={() => router.push('/cashier/settings')}
                            className="h-9 w-9 rounded-lg ring-1 ring-zinc-200 bg-white text-zinc-500 hover:text-zinc-700 flex items-center justify-center transition-colors"
                            aria-label="Settings"
                            title="Settings"
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            onClick={() => setShowLogoutConfirmation(true)}
                            className="h-9 w-9 rounded-lg ring-1 ring-zinc-200 bg-white text-zinc-500 hover:text-rose-500 flex items-center justify-center transition-colors"
                            aria-label="Logout"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-zinc-100">
                            <div className="text-right">
                                <p className="text-sm font-bold text-zinc-900">{user?.name || "Cashier"}</p>
                                <p className="text-xs font-medium text-zinc-500">{restaurantName || "Active Restaurant"}</p>
                            </div>
                            <div className="h-9 w-9 rounded-lg bg-[#FF5C00] text-white flex items-center justify-center text-sm font-bold">
                                {(user?.name || "C").charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="px-4 md:px-6 py-6 lg:py-8">
                    <div className="mx-auto w-full max-w-[1400px] space-y-6">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Today, {today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</h2>
                                <p className="mt-1 text-sm font-medium text-zinc-500">Track collections, settle bills, and close tables.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => isDrawerOpen ? setShowCloseDrawerModal(true) : setShowOpenDrawerModal(true)}
                                    disabled={drawerLoading}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors whitespace-nowrap ${isDrawerOpen
                                            ? 'ring-1 ring-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                            : 'ring-1 ring-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                        } disabled:opacity-60`}
                                >
                                    {drawerLoading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : isDrawerOpen ? (
                                        <Unlock size={16} />
                                    ) : (
                                        <Lock size={16} />
                                    )}
                                    {isDrawerOpen ? 'Close Drawer' : 'Open Drawer'}
                                </button>
                                <button
                                    onClick={loadOrders}
                                    disabled={isLoading}
                                    className="h-9 w-9 rounded-lg ring-1 ring-zinc-200 bg-white text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 flex items-center justify-center transition-colors disabled:opacity-60"
                                    aria-label="Refresh Data"
                                    title="Refresh Data"
                                >
                                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl ring-1 ring-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                                {error}
                            </div>
                        )}

                        {/* KPI Cards - Admin Pattern */}
                        <div className="-mt-1 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <KPICard
                                title="Collections Today"
                                value={formatCurrency(collectionsToday)}
                                icon={Wallet}
                                trend={{
                                    value: `${todayPaidOrders.length} bills`,
                                    isPositive: true,
                                    description: "closed today"
                                }}
                                variant="success"
                            />
                            <KPICard
                                title="Pending Payments"
                                value={queueOrders.length}
                                icon={Clock}
                                trend={{
                                    value: queueOrders.length > 0 ? "Active" : "Clear",
                                    isPositive: queueOrders.length === 0,
                                    description: "awaiting settlement"
                                }}
                                variant="blue"
                            />
                            <KPICard
                                title="Avg Bill Size"
                                value={formatCurrency(avgBillSize)}
                                icon={Receipt}
                                trend={{
                                    value: todayPaidOrders.length ? `${todayPaidOrders.length}` : "0",
                                    isPositive: true,
                                    description: "bills today"
                                }}
                                variant="orange"
                            />
                            <KPICard
                                title="Cash Collected"
                                value={formatCurrency(cashPaidToday)}
                                icon={Banknote}
                                trend={{
                                    value: "Cash",
                                    isPositive: true,
                                    description: "payments only"
                                }}
                                variant="purple"
                            />
                        </div>

                        {/* Settlement + Payment Queue Side by Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
                            <DailySettlementPanel refreshKey={settlementRefreshKey} />

                            {/* Payment Queue Section */}
                            <div className="rounded-xl bg-white ring-1 ring-zinc-200 overflow-hidden">
                                <div className="p-5 border-b border-zinc-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-zinc-900">Payment Queue</h3>
                                        <p className="mt-0.5 text-sm font-medium text-zinc-500">Bills waiting at the cashier counter</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="relative w-full sm:w-[280px]">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <input
                                                type="text"
                                                placeholder="Search order, table..."
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                className="h-10 w-full pl-10 pr-4 rounded-lg border border-zinc-200 text-sm focus:border-zinc-300 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden p-4 space-y-3 max-h-[480px] overflow-y-auto">
                                    {isLoading && (
                                        <div className="rounded-xl ring-1 ring-zinc-200 bg-zinc-50 px-4 py-5 text-sm text-zinc-500 flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Loading queue...
                                        </div>
                                    )}
                                    {!isLoading && filteredQueue.length === 0 && (
                                        <div className="rounded-xl bg-zinc-50 px-4 py-8 sm:px-6">
                                            <div className="mx-auto flex max-w-md flex-col items-center text-center">
                                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200">
                                                    <CheckCircle size={24} className="text-emerald-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-zinc-800">All cleared!</h3>
                                                <p className="mt-1 max-w-sm text-sm font-medium text-zinc-500">
                                                    No pending payments right now. New bills will appear here.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {!isLoading && filteredQueue.map((order) => (
                                        <div key={order._id} className="rounded-xl bg-white p-3 ring-1 ring-zinc-200">
                                            <div className="mb-2 flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[15px] font-semibold text-zinc-900">Order</p>
                                                    <span className="text-sm font-semibold text-zinc-500">#{order.orderNumber}</span>
                                                </div>
                                                <Badge variant="warning">WAITING</Badge>
                                            </div>
                                            <div className="mb-3 flex items-center justify-between text-[13px] font-medium text-zinc-600">
                                                <p>Table {order.tableId?.number || "-"} · {order.items?.length || 0} items</p>
                                                <span className="inline-flex items-center gap-1 text-zinc-400">
                                                    <Clock3 size={12} />
                                                    {formatRelativeTime(order.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-base font-bold text-zinc-900">{formatCurrency(order.total)}</p>
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setPaymentMethod(paymentSettings.provider === 'MANUAL' ? 'CASH' : 'QR');
                                                        setPaymentReference(order.paymentReference || '');
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#FF5C00] px-3 text-sm font-bold text-white hover:bg-[#e65300] transition-colors"
                                                >
                                                    Settle <ArrowUpRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto max-h-[520px] overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-zinc-50 border-b border-zinc-200">
                                            <tr>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Order</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Table</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Items</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Time</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Status</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Total</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider"></th>
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
                                                    <td colSpan={7} className="px-4 py-8">
                                                        <div className="mx-auto flex max-w-md flex-col items-center text-center">
                                                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-50 ring-1 ring-zinc-200">
                                                                <CheckCircle size={24} className="text-emerald-500" />
                                                            </div>
                                                            <h3 className="text-base font-bold text-zinc-800">All cleared!</h3>
                                                            <p className="mt-1 max-w-sm text-sm font-medium text-zinc-500">
                                                                No pending payments right now. New bills will appear here.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {!isLoading && filteredQueue.map((order) => (
                                                <tr
                                                    key={order._id}
                                                    className={`hover:bg-zinc-50 transition-colors ${selectedOrder?._id === order._id ? "bg-orange-50/60" : ""}`}
                                                >
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm font-medium text-zinc-900">#{order.orderNumber}</span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm font-medium text-zinc-900">Table {order.tableId?.number || "-"}</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="text-sm text-zinc-600">
                                                            {order.items?.length || 0} items
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm text-zinc-600">
                                                            {formatRelativeTime(order.createdAt)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge variant="warning">WAITING</Badge>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <span className="text-sm font-semibold text-zinc-900">{formatCurrency(order.total)}</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setPaymentMethod(paymentSettings.provider === 'MANUAL' ? 'CASH' : 'QR');
                                                                setPaymentReference(order.paymentReference || '');
                                                                setShowPaymentModal(true);
                                                            }}
                                                            className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#FF5C00] px-3 text-sm font-bold text-white hover:bg-[#e65300] transition-colors"
                                                        >
                                                            Settle <ArrowUpRight size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Recent Settlements - Admin Pattern */}
                        <div className="rounded-xl bg-white ring-1 ring-zinc-200 overflow-hidden">
                            <div className="p-5 border-b border-zinc-100">
                                <h3 className="text-xl font-bold tracking-tight text-zinc-900">Recent Settlements</h3>
                                <p className="mt-0.5 text-sm font-medium text-zinc-500">Latest closed checks</p>
                            </div>
                            <div className="p-4">
                                {settledOrders.length === 0 ? (
                                    <div className="rounded-xl bg-zinc-50 px-4 py-8 sm:px-6">
                                        <div className="mx-auto flex max-w-md flex-col items-center text-center">
                                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200">
                                                <Receipt size={24} className="text-zinc-400" />
                                            </div>
                                            <h3 className="text-base font-bold text-zinc-800">No settlements yet</h3>
                                            <p className="mt-1 max-w-sm text-sm font-medium text-zinc-500">
                                                Completed payments will appear here.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                            {settledOrders
                                                .slice((settlementsPage - 1) * settlementsPerPage, settlementsPage * settlementsPerPage)
                                                .map((order) => (
                                                    <div key={order._id} className="rounded-xl bg-white p-3 ring-1 ring-zinc-200">
                                                        <div className="mb-2 flex items-start justify-between gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[15px] font-semibold text-zinc-900">Order</p>
                                                                <span className="text-sm font-semibold text-zinc-500">#{order.orderNumber}</span>
                                                            </div>
                                                            <Badge variant="success">PAID</Badge>
                                                        </div>
                                                        <div className="mb-3 flex items-center justify-between text-[13px] font-medium text-zinc-600">
                                                            <p>Table {order.tableId?.number || "-"} · {order.paymentMethod}</p>
                                                            <span className="text-zinc-400">
                                                                {new Date(order.updatedAt || order.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-base font-bold text-zinc-900">{formatCurrency(order.total)}</p>
                                                            <button
                                                                onClick={() => handlePrintOrder(order)}
                                                                className="inline-flex h-8 items-center gap-1 rounded-lg ring-1 ring-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                                                            >
                                                                Print
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                        {/* Pagination */}
                                        {settledOrders.length > settlementsPerPage && (
                                            <div className="mt-4 border-t border-zinc-100 pt-4">
                                                <Pagination
                                                    currentPage={settlementsPage}
                                                    totalPages={Math.ceil(settledOrders.length / settlementsPerPage)}
                                                    onPageChange={setSettlementsPage}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
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
                                    <p className="text-sm font-semibold text-zinc-500 mt-1">Payment Receipt</p>
                                </div>
                                <div className="text-right text-sm font-medium text-zinc-500 space-y-1">
                                    <div>Invoice #{selectedOrder.orderNumber}</div>
                                    <div>Date: {new Date(selectedOrder.createdAt).toLocaleDateString('en-US')}</div>
                                    <div>Table: {selectedOrder.tableId?.number || '-'}</div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-zinc-500">
                                <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2">
                                    <p className="text-[11px] uppercase tracking-widest text-zinc-400">Billed To</p>
                                    <p className="text-sm font-bold text-zinc-900 mt-1">Walk-in Guest</p>
                                    <p className="text-sm text-zinc-500 font-medium">Order items as listed</p>
                                </div>
                                <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2">
                                    <p className="text-[11px] uppercase tracking-widest text-zinc-400">Payment</p>
                                    <p className="text-sm font-bold text-zinc-900 mt-1">Pending</p>
                                    <p className="text-sm text-zinc-500 font-medium">Method: {paymentMethod}</p>
                                </div>
                            </div>

                            <div className="mt-4 border border-zinc-100 rounded-xl overflow-hidden">
                                <div className="grid grid-cols-[1.7fr_0.5fr_0.8fr_0.8fr] bg-zinc-50 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 px-3 py-2">
                                    <span>Item</span>
                                    <span className="text-center">Qty</span>
                                    <span className="text-right">Price</span>
                                    <span className="text-right">Total</span>
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                    {combinedItems.map((item) => (
                                        <div key={item.key} className="grid grid-cols-[1.7fr_0.5fr_0.8fr_0.8fr] px-3 py-2 text-sm border-t border-zinc-100">
                                            <div>
                                                <p className="font-semibold text-zinc-800">{item.name}</p>
                                                <p className="text-[12px] text-zinc-400 mt-1">{item.notes || 'No special notes'}</p>
                                            </div>
                                            <div className="text-center text-zinc-600">{item.quantity}</div>
                                            <div className="text-right text-zinc-600">NRs. {item.price}</div>
                                            <div className="text-right font-semibold text-zinc-900">NRs. {item.total}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <div className="w-full sm:w-[280px] rounded-xl border border-zinc-100 bg-white px-3 py-2 text-sm">
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
                            {/* Payment Method Toggle */}
                            <div className="inline-flex w-full rounded-lg bg-zinc-100 p-0.5">
                                <button
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`flex-1 h-8 rounded-md text-sm font-semibold transition-all ${paymentMethod === 'CASH'
                                            ? 'bg-white text-zinc-900 shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-700'
                                        }`}
                                >
                                    Cash
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('QR')}
                                    className={`flex-1 h-8 rounded-md text-sm font-semibold transition-all ${paymentMethod === 'QR'
                                            ? 'bg-white text-zinc-900 shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-700'
                                        }`}
                                >
                                    QR / Digital
                                </button>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 flex flex-col items-center gap-3 w-full">
                                {paymentMethod === 'QR' ? (
                                    paymentSettings.qrCodeUrl ? (
                                        <>
                                            <img
                                                src={paymentSettings.qrCodeUrl}
                                                alt="Payment QR"
                                                className="h-40 w-40 object-contain"
                                            />
                                            <div className="text-center space-y-1">
                                                <p className="text-sm font-semibold text-zinc-600">Scan to pay via {paymentSettings.provider}</p>
                                                {(paymentSettings.accountName || paymentSettings.accountId) && (
                                                    <p className="text-[14px] font-semibold text-zinc-400 mt-1">
                                                        {paymentSettings.accountName || 'Account'} {paymentSettings.accountId ? ` ${paymentSettings.accountId}` : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-6 flex flex-col items-center text-center space-y-2">
                                            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                                                <AlertCircle size={24} />
                                            </div>
                                            <p className="text-md font-bold text-zinc-700">No QR Code Available</p>
                                            <p className="text-sm text-zinc-500">Please configure your payment QR code in the settings to allow customers to scan and pay.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="py-4 flex flex-col items-center gap-1">
                                        <Banknote size={32} className="text-emerald-600" />
                                        <p className="text-sm font-semibold text-zinc-600">Cash Payment</p>
                                        <p className="text-xl font-bold text-zinc-900 mt-1">{formatCurrency(selectedOrder.total)}</p>
                                        <p className="text-[14px] text-zinc-400">Collect cash and mark as paid</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {paymentMethod === 'QR' && (
                                    <div>
                                        <label className="text-sm font-semibold text-zinc-500">Transaction ID</label>
                                        <input
                                            type="text"
                                            value={paymentReference}
                                            onChange={(event) => setPaymentReference(event.target.value)}
                                            placeholder="Customer payment reference"
                                            className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-700 focus:bg-white focus:border-zinc-300 outline-none"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-3 w-full">
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

            {/* Open Drawer Modal */}
            <Modal
                isOpen={showOpenDrawerModal}
                onClose={() => setShowOpenDrawerModal(false)}
                title="Open Cash Drawer"
                subtitle="Begin your shift by recording the opening cash amount"
                maxWidthClass="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-zinc-500">Opening Amount (NRs.)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={openingAmount}
                            onChange={(e) => setOpeningAmount(e.target.value)}
                            placeholder="0.00"
                            className="mt-2 h-11 w-full rounded-lg ring-1 ring-zinc-200 bg-white px-3 text-lg font-semibold text-zinc-900 focus:ring-zinc-300 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-zinc-500">Notes (Optional)</label>
                        <textarea
                            value={openingNotes}
                            onChange={(e) => setOpeningNotes(e.target.value)}
                            placeholder="Any notes for drawer opening..."
                            rows={2}
                            className="mt-2 w-full rounded-lg ring-1 ring-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:ring-zinc-300 outline-none resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowOpenDrawerModal(false)}
                            className="flex-1 h-10 rounded-lg ring-1 ring-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleOpenDrawer}
                            disabled={!openingAmount || drawerLoading}
                            className="flex-1 h-10 rounded-lg bg-[#FF5C00] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#e65300] transition-colors disabled:opacity-60"
                        >
                            {drawerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock size={16} />}
                            Open Drawer
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Close Drawer Modal */}
            <Modal
                isOpen={showCloseDrawerModal}
                onClose={() => setShowCloseDrawerModal(false)}
                title="Close Cash Drawer"
                subtitle="End your shift by recording the closing cash amount"
                maxWidthClass="max-w-md"
            >
                <div className="space-y-4">
                    {drawer && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-zinc-50 p-3 text-center">
                                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Opening</p>
                                <p className="text-lg font-bold text-zinc-900">NRs. {drawer.openingAmount?.toLocaleString() || 0}</p>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-3 text-center">
                                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Expected</p>
                                <p className="text-lg font-bold text-emerald-700">NRs. {drawer.expectedAmount?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-semibold text-zinc-500">Closing Amount (NRs.)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={closingAmount}
                            onChange={(e) => setClosingAmount(e.target.value)}
                            placeholder="0.00"
                            className="mt-2 h-11 w-full rounded-lg ring-1 ring-zinc-200 bg-white px-3 text-lg font-semibold text-zinc-900 focus:ring-zinc-300 outline-none"
                        />
                        {closingAmount && drawer && (
                            <p className={`mt-2 text-sm font-semibold ${parseFloat(closingAmount) - (drawer.expectedAmount || 0) >= 0
                                    ? 'text-emerald-600'
                                    : 'text-rose-600'
                                }`}>
                                Variance: NRs. {(parseFloat(closingAmount) - (drawer.expectedAmount || 0)).toLocaleString()}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-zinc-500">Notes (Optional)</label>
                        <textarea
                            value={closingNotes}
                            onChange={(e) => setClosingNotes(e.target.value)}
                            placeholder="Any notes for drawer closing..."
                            rows={2}
                            className="mt-2 w-full rounded-lg ring-1 ring-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:ring-zinc-300 outline-none resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowCloseDrawerModal(false)}
                            className="flex-1 h-10 rounded-lg ring-1 ring-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCloseDrawer}
                            disabled={!closingAmount || drawerLoading}
                            className="flex-1 h-10 rounded-lg bg-rose-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors disabled:opacity-60"
                        >
                            {drawerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock size={16} />}
                            Close Drawer
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}