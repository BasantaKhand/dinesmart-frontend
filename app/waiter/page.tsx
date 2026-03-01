"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Bell,
    CookingPot,
    ShoppingBag,
    Utensils,
    Clock,
    ChefHat,
    Plus,
    Minus,
    Trash2,
    LayoutGrid,
    Check,
    CheckCircle2,
    XCircle,
    MessageSquare,
    ChevronUp,
    ChevronDown,
    X,
    Receipt,
    Menu,
    LogOut,
    Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useGetCategories } from '@/hooks/useCategories';
import { useGetMenuItems } from '@/hooks/useMenuItems';
import { useGetTables } from '@/hooks/useTables';
import { useUpdateOrderStatus, useCreateOrder, useAppendItemsToOrder } from '@/hooks/useOrders';
import { getActiveOrderByTableApi, getOrderByIdApi, getOrdersApi } from '@/api/order.api';
import type { Category } from '@/api/category.api';
import type { MenuItem } from '@/api/menu-item.api';
import type { Table } from '@/api/table.api';
import ConfirmationDialog from '@/features/admin/components/ui/confirmation-dialog';
import { toast } from 'react-toastify';
import { Pagination } from '@/features/admin/components/ui/pagination';
import { NotificationDropdown } from '@/features/notifications/components/notification-dropdown';
import { useSocket } from '@/providers/socket-provider';

export default function WaiterDashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { socket } = useSocket();

    // Use react-query hooks
    const { data: categoriesResponse, isLoading: categoriesLoading, refetch: refetchCategories } = useGetCategories();
    const { data: menuItemsResponse, isLoading: menuItemsLoading, refetch: refetchMenuItems } = useGetMenuItems({});
    const { data: tablesResponse, isLoading: tablesLoading, refetch: refetchTables } = useGetTables();
    const updateOrderStatusMutation = useUpdateOrderStatus();
    const createOrderMutation = useCreateOrder();
    const appendItemsMutation = useAppendItemsToOrder();

    const categories = categoriesResponse?.data || [];
    const menuItems = menuItemsResponse?.data || [];
    const tables = tablesResponse?.data || [];
    const isLoading = categoriesLoading || menuItemsLoading || tablesLoading;

    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [cart, setCart] = useState<any[]>([]);
    const [currentView, setCurrentView] = useState<'tables' | 'menu'>('tables');
    const [tableSearch, setTableSearch] = useState('');
    const [menuSearch, setMenuSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Menu');
    const [isCartExpanded, setIsCartExpanded] = useState(false);
    const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(true);
    const [restaurantName, setRestaurantName] = useState<string>('');
    const [tableFilter, setTableFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'>('ALL');
    const [showTableFilterMenu, setShowTableFilterMenu] = useState(false);
    const [tableLayoutView, setTableLayoutView] = useState<'horizontal' | 'grid'>('horizontal');
    const [menuFilter, setMenuFilter] = useState<'ALL' | 'LOW_PRICE' | 'HIGH_PRICE' | 'AVAILABLE'>('ALL');
    const [showMenuFilterMenu, setShowMenuFilterMenu] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
    const [showCancelOrderConfirmation, setShowCancelOrderConfirmation] = useState(false);
    const itemsPerPage = 12;

    const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
        toast[type](message);
    };

    useEffect(() => {
        // Refetch data when order is confirmed via socket
        const handleOrderUpdate = () => {
            refetchTables();
        };

        if (socket) {
            socket.on('orderConfirmed', handleOrderUpdate);
            socket.on('orderStatusUpdated', handleOrderUpdate);
        }

        return () => {
            if (socket) {
                socket.off('orderConfirmed', handleOrderUpdate);
                socket.off('orderStatusUpdated', handleOrderUpdate);
            }
        };
    }, [socket, refetchTables]);

    // Close filter menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showTableFilterMenu && !target.closest('.table-filter-container')) {
                setShowTableFilterMenu(false);
            }
            if (showMenuFilterMenu && !target.closest('.menu-filter-container')) {
                setShowMenuFilterMenu(false);
            }
            if (showProfileMenu && !target.closest('.profile-menu-container')) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showTableFilterMenu, showMenuFilterMenu, showProfileMenu]);

    useEffect(() => {
        // Reset to page 1 when category changes
        setCurrentPage(1);
    }, [activeCategory]);

    useEffect(() => {
        // Set restaurant name from seed data
        setRestaurantName('Active Restaurant');
    }, [user]);

    const fetchActiveOrder = async (table: Table) => {
        const tableId = table._id;
        try {
            const res = await getActiveOrderByTableApi(tableId);
            if (res.data.data) {
                return res.data.data;
            }

            if (table?.status === 'OCCUPIED') {
                try {
                    const allOrdersRes = await getOrdersApi({ page: 1, limit: 50 });
                    const allOrders = allOrdersRes.data?.data || [];
                    const tableOrders = allOrders.filter((o: any) => {
                        const orderTableId = o.tableId?._id || o.tableId;
                        return orderTableId === tableId;
                    });

                    if (tableOrders.length > 0) {
                        return tableOrders[0];
                    }
                } catch (err) {
                    console.error('Error fetching table orders:', err);
                }
            }

            return null;
        } catch (err) {
            console.error('Error fetching active order:', err);
            return null;
        }
    };

    const handleSelectTable = (table: Table) => {
        setSelectedTable(table);
        setActiveOrder(null);
        setCart([]);
    };

    useEffect(() => {
        if (selectedTable) {
            let isCancelled = false;

            const loadSelectedTableOrder = async () => {
                const order = await fetchActiveOrder(selectedTable);
                if (!isCancelled) {
                    setActiveOrder(order);
                }
            };

            loadSelectedTableOrder();

            // Only poll if order is not COMPLETED
            if (activeOrder?.status === 'COMPLETED') {
                return () => {
                    isCancelled = true;
                };
            }

            // Poll for order status updates every 3 seconds
            const pollInterval = setInterval(() => {
                loadSelectedTableOrder();
            }, 3000);

            return () => {
                isCancelled = true;
                clearInterval(pollInterval);
            };
        } else {
            setActiveOrder(null);
            setCart([]);
        }
    }, [selectedTable, activeOrder?.status]);

    // Separate effect to fetch full order details by ID when we have an order
    // This helps us get status updates even when the "active" endpoint stops returning it
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (data: any) => {
            if (['ORDER_READY', 'PAYMENT_VERIFIED', 'ORDER_SERVED', 'ORDER_STATUS_UPDATE'].includes(data.type)) {
                refetchTables();
                refetchCategories();
                refetchMenuItems();
                if (selectedTable) {
                    fetchActiveOrder(selectedTable).then(order => {
                        setActiveOrder(order);
                    });
                }
            }
        };

        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, selectedTable]);

    useEffect(() => {
        if (activeOrder?._id && activeOrder?.status !== 'COMPLETED') {
            const statusCheckInterval = setInterval(async () => {
                try {
                    const res = await getOrderByIdApi(activeOrder._id);
                    if (res.data.data) {
                        setActiveOrder(res.data.data);
                    }
                } catch (err) {
                    console.error('Error fetching order status:', err);
                }
            }, 2000); // Check every 2 seconds for status updates

            return () => clearInterval(statusCheckInterval);
        }
    }, [activeOrder?._id]);

    const addToCart = (item: MenuItem) => {
        if (activeOrder?.status === 'COMPLETED') {
            showToast('warning', 'This order is COMPLETED. No more items can be added.');
            return;
        }
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        if (!isCartExpanded) setIsCartExpanded(true);
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i._id !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i._id === itemId) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const updateItemNotes = (itemId: string, notes: string) => {
        setCart(prev => prev.map(i => i._id === itemId ? { ...i, notes } : i));
    };

    const sendToKitchen = async () => {
        if (!selectedTable) {
            showToast('warning', 'Please select a table before sending order to kitchen');
            return;
        }
        if (cart.length === 0) {
            showToast('warning', 'Add items to cart before sending order to kitchen');
            return;
        }

        try {
            const orderData = {
                tableId: selectedTable._id,
                items: cart.map(item => ({
                    menuItemId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total: item.price * item.quantity,
                    notes: item.notes?.trim() || ''
                })),
                orderType: 'DINE_IN' as const,
                subtotal,
                tax,
                serviceCharge: 0,
                total: subtotal + tax
            };

            // Validate required fields
            if (!orderData.tableId || !orderData.items?.length) {
                showToast('error', 'Invalid order data. Please try again.');
                return;
            }

            if (activeOrder) {
                await appendItemsMutation.mutateAsync({ id: activeOrder._id, data: orderData });
                showToast('success', 'Items added to order successfully');
            } else {
                await createOrderMutation.mutateAsync(orderData);
                showToast('success', 'Order sent to kitchen successfully');
            }

            setCart([]);
            const refreshedOrder = await fetchActiveOrder(selectedTable);
            setActiveOrder(refreshedOrder);

            // Refresh all data and update selected table status
            await refetchTables();
            if (selectedTable) {
                // Find updated table and set it as selected to reflect status change
                const updatedTables = await refetchTables();
                const updatedTablesList = updatedTables.data?.data || [];
                const updatedSelectedTable = updatedTablesList.find((t: Table) => t._id === selectedTable._id);
                if (updatedSelectedTable) {
                    setSelectedTable(updatedSelectedTable);
                }
            }
        } catch (err) {
            console.error("Failed to send order to kitchen", err);
            const errorMsg = (err as any)?.response?.data?.message || 'Failed to send order to kitchen. Please try again.';
            showToast('error', errorMsg);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!activeOrder) return;
        try {
            await updateOrderStatusMutation.mutateAsync({ id: activeOrder._id, data: { status: newStatus } });
            // Fetch the latest order status to ensure UI is in sync
            const refreshedOrder = await fetchActiveOrder(selectedTable!);
            setActiveOrder(refreshedOrder);
            showToast('success', `Order status updated to ${newStatus}`);
            await refetchTables();
        } catch (err: any) {
            console.error('Failed to update order status:', err);
            const errorMsg = (err as any)?.response?.data?.message || 'Failed to update order status';
            showToast('error', errorMsg);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.13;

    // Color palette for table icons
    const tableColors = [
        'bg-blue-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-orange-500',
        'bg-cyan-500',
        'bg-teal-500',
        'bg-indigo-500',
        'bg-rose-500'
    ];

    const getTableIconColor = (index: number) => tableColors[index % tableColors.length];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white font-dm-sans">
            <header className="h-16 px-4 md:px-6 lg:pl-6 lg:pr-[420px] flex items-center justify-between bg-white border-b border-zinc-100 z-20">
                <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="DineSmart" className="h-10 w-10" />
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900 tracking-tight">DineSmart</h1>
                        <p className="text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">Waiter Panel</p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 md:gap-3 shrink-0 lg:pr-6">
                    {/* Notification Button */}
                    <NotificationDropdown />

                    {/* Profile Menu */}
                    <div className="relative profile-menu-container">
                        <div className="flex items-center gap-3 md:pl-3 md:border-l md:border-zinc-100">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-zinc-900 leading-tight">{user?.name || 'Waiter One'}</p>
                                {restaurantName && (
                                    <p className="text-xs font-medium text-zinc-500 mt-0.5">{restaurantName}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="h-9 w-9 rounded-lg bg-[#FF5C00] text-white flex items-center justify-center font-bold text-sm hover:bg-[#FF5C00]/90 transition-colors"
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'W'}
                            </button>
                        </div>

                        {/* Profile Dropdown - Mobile Only */}
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-zinc-200 py-3 px-4 z-50 md:hidden">
                                <div className="text-left">
                                    <p className="text-sm font-bold text-zinc-900">{user?.name || 'Waiter One'}</p>
                                    {restaurantName && (
                                        <p className="text-xs font-medium text-zinc-500 mt-1">{restaurantName}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative lg:pr-[420px]">
                <div className={`h-full overflow-y-auto no-scrollbar pt-6 ${isOrderSummaryOpen ? 'pb-[390px] md:pb-[430px] lg:pb-6' : 'pb-[110px] md:pb-[120px] lg:pb-6'} lg:border-r lg:border-zinc-200 space-y-8`}>
                    <section className="px-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900">Active Tables</h3>
                                {tableFilter !== 'ALL' && (
                                    <p className="text-xs font-semibold text-zinc-400 mt-1">
                                        Showing {tables.filter(t => t.status === tableFilter).length} {tableFilter.toLowerCase()} tables
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2 relative">
                                <div className="relative table-filter-container">
                                    <button
                                        onClick={() => setShowTableFilterMenu(!showTableFilterMenu)}
                                        className={`h-8 w-8 border rounded-lg flex items-center justify-center transition-colors
                                            ${tableFilter !== 'ALL'
                                                ? 'bg-[#FF5C00] border-[#FF5C00] text-white'
                                                : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
                                    >
                                        <Filter size={16} />
                                    </button>

                                    {showTableFilterMenu && (
                                        <div className="absolute top-10 right-0 w-48 bg-white rounded-xl border border-zinc-200 shadow-xl z-50 overflow-hidden">
                                            <div className="p-2 border-b border-zinc-100">
                                                <p className="text-[14px] font-medium text-zinc-400 px-2">Filter by Status</p>
                                            </div>
                                            <div className="p-1">
                                                {[{ key: 'ALL', label: 'All Tables' }, { key: 'AVAILABLE', label: 'Available' }, { key: 'OCCUPIED', label: 'Occupied' }, { key: 'RESERVED', label: 'Reserved' }].map(option => (
                                                    <button
                                                        key={option.key}
                                                        onClick={() => {
                                                            setTableFilter(option.key as any);
                                                            setShowTableFilterMenu(false);
                                                        }}
                                                        className={`w-full px-3 py-2 rounded-lg text-left text-sm font-semibold transition-colors
                                                            ${tableFilter === option.key
                                                                ? 'bg-orange-50 text-[#FF5C00]'
                                                                : 'text-zinc-700 hover:bg-zinc-50'}`}
                                                    >
                                                        {option.label}
                                                        {tableFilter === option.key && (
                                                            <span className="float-right">✓</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setTableLayoutView(tableLayoutView === 'horizontal' ? 'grid' : 'horizontal')}
                                    className={`h-8 w-8 border rounded-lg flex items-center justify-center transition-colors
                                        ${tableLayoutView === 'grid'
                                            ? 'bg-[#FF5C00] border-[#FF5C00] text-white'
                                            : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
                                >
                                    <LayoutGrid size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Empty State */}
                        {tables.filter(table => tableFilter === 'ALL' || table.status === tableFilter).length === 0 ? (
                            <div className="w-full py-16 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 mb-4">
                                    <Filter size={36} className="text-zinc-400" />
                                </div>
                                <h4 className="text-base font-bold text-zinc-800 mb-2">No {tableFilter.toLowerCase()} tables</h4>
                                <p className="text-sm text-zinc-500 max-w-xs mx-auto mb-4">
                                    {tableFilter === 'AVAILABLE' && 'All tables are currently occupied or reserved.'}
                                    {tableFilter === 'OCCUPIED' && 'No tables are currently being served.'}
                                    {tableFilter === 'RESERVED' && 'No tables are reserved at the moment.'}
                                </p>
                                <button
                                    onClick={() => setTableFilter('ALL')}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#FF5C00] hover:bg-orange-50 rounded-lg transition-colors"
                                >
                                    <X size={14} /> Clear filter
                                </button>
                            </div>
                        ) : tableLayoutView === 'horizontal' ? (
                            /* Horizontal Scroll View */
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                {tables.filter(table => tableFilter === 'ALL' || table.status === tableFilter).map((table, index) => (
                                    <button
                                        key={table._id}
                                        onClick={() => handleSelectTable(table)}
                                        className={`flex-shrink-0 min-w-[212px] p-3 rounded-2xl border-2 transition-all flex flex-col items-start gap-3 text-left group
                                        ${selectedTable?._id === table._id
                                                ? 'bg-orange-50/20 border-[#FF5C00]'
                                                : table.status !== 'AVAILABLE'
                                                    ? 'bg-red-50/30 border-red-300'
                                                    : 'bg-white border-zinc-100 hover:border-zinc-300'
                                            }`}
                                    >
                                        <div className="w-full flex items-start justify-between">
                                            <div className={`h-14 w-14 rounded-[12px] flex flex-col items-start justify-center pl-2 font-bold text-white transition-transform group-hover:scale-105 relative
                                            ${getTableIconColor(index)}`}>
                                                <span className="text-xs -mb-1">{table.number.split('-')[0]}-</span>
                                                <span className="text-lg leading-none">{table.number.split('-')[1] || table.number.replace('T-', '')}</span>
                                                {/* Status indicator badge */}
                                                <div className={`absolute -bottom-1 -right-1 rounded-full p-1 ${table.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                                    {table.status === 'AVAILABLE' ? (
                                                        <Check size={14} className="text-white" strokeWidth={3} />
                                                    ) : (
                                                        <X size={14} className="text-white" strokeWidth={3} />
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap
                                            ${table.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-red-100 text-red-700'}`}>
                                                {table.status}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-extrabold text-zinc-900">Table {table.number}</h4>
                                            <p className="text-xs font-semibold text-zinc-400 mt-0.5">
                                                {table.status === 'AVAILABLE' ? 'Ready to serve' :
                                                    table.status === 'OCCUPIED' ? 'Serving guests' :
                                                        'Reserved'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            /* Compact Grid View */
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                                {tables.filter(table => tableFilter === 'ALL' || table.status === tableFilter).map((table, index) => (
                                    <button
                                        key={table._id}
                                        onClick={() => handleSelectTable(table)}
                                        className={`aspect-square rounded-xl border-2 transition-all flex flex-col items-center justify-start pt-6 pb-6 gap-1.5 group relative overflow-hidden
                                            ${selectedTable?._id === table._id
                                                ? 'bg-orange-50 border-[#FF5C00]'
                                                : table.status !== 'AVAILABLE'
                                                    ? 'bg-red-50/30 border-red-300'
                                                    : 'bg-white border-zinc-100 hover:border-zinc-300'
                                            }`}
                                    >
                                        {/* Status Badge - Top Right */}
                                        <div className={`absolute top-1.5 right-1.5 rounded-full p-0.5 ${table.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                            {table.status === 'AVAILABLE' ? (
                                                <Check size={10} className="text-white" strokeWidth={3} />
                                            ) : (
                                                <X size={10} className="text-white" strokeWidth={3} />
                                            )}
                                        </div>

                                        {/* Table Number - Large and Centered */}
                                        <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-white transition-transform group-hover:scale-110
                                            ${getTableIconColor(index)}`}>
                                            <span className="text-[10px] -mb-1">{table.number.split('-')[0]}</span>
                                            <span className="text-2xl leading-none">{table.number.split('-')[1] || table.number.replace('T-', '')}</span>
                                        </div>

                                        {/* Status */}
                                        <div className={`absolute bottom-0 left-0 right-0 py-1.5 text-[11px] font-bold text-center
                                            ${table.status === 'AVAILABLE'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'}`}>
                                            {table.status}
                                        </div>
                                    </button>
                                ))}                            </div>
                        )}
                    </section>

                    <section className="px-6 space-y-6 animate-in slide-in-from-bottom-4 duration-400">
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pt-2 pb-2">
                            <button
                                onClick={() => setActiveCategory('All Menu')}
                                className={`flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl transition-all min-w-[136px] border
                                        ${activeCategory === 'All Menu'
                                        ? 'bg-[#FF5C00] border-[#FF5C00] text-white'
                                        : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-200'}`}
                            >
                                <LayoutGrid size={18} className={activeCategory === 'All Menu' ? 'text-white' : 'text-zinc-400'} />
                                <div className="text-left">
                                    <p className="text-sm font-bold leading-none">All Menu</p>
                                    <p className={`text-[11px] mt-1 font-semibold ${activeCategory === 'All Menu' ? 'text-white/80' : 'text-zinc-400'}`}>
                                        {menuItems.length} items
                                    </p>
                                </div>
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat._id}
                                    onClick={() => setActiveCategory(cat.name)}
                                    className={`flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl transition-all min-w-[136px] border
                                            ${activeCategory === cat.name
                                            ? 'bg-[#FF5C00] border-[#FF5C00] text-white'
                                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-200'}`}
                                >
                                    {cat.image ? (
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="h-8 w-8 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className={`h-8 w-8 rounded-md flex items-center justify-center text-[11px] font-bold ${activeCategory === cat.name ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                            {cat.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="text-left">
                                        <p className="text-sm font-bold leading-none">{cat.name}</p>
                                        <p className={`text-[11px] mt-1 font-semibold ${activeCategory === cat.name ? 'text-white/80' : 'text-zinc-400'}`}>
                                            {menuItems.filter(i => i.categoryId?._id === cat._id).length} items
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 mt-8">
                            <h3 className="text-xl font-bold text-zinc-900">Special menu for you</h3>
                            <div className="flex items-center gap-2.5">
                                {/* Search Bar */}
                                <div className="relative group flex-1 sm:w-64">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-[#FF5C00] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search menu..."
                                        value={menuSearch}
                                        onChange={(e) => { setMenuSearch(e.target.value); setCurrentPage(1); }}
                                        className="h-10 w-full pl-10 pr-4 bg-white border border-zinc-300 rounded-lg text-sm font-medium text-zinc-900 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-[#FF5C00] transition-all outline-none"
                                    />
                                </div>

                                {/* Filter Button */}
                                <div className="relative menu-filter-container">
                                    <button
                                        onClick={() => setShowMenuFilterMenu(!showMenuFilterMenu)}
                                        className={`flex items-center gap-2 text-sm font-bold transition-colors px-3 py-2.5 rounded-lg border whitespace-nowrap
                                                ${menuFilter !== 'ALL'
                                                ? 'text-[#FF5C00] border-[#FF5C00] bg-orange-50'
                                                : 'text-zinc-700 hover:text-zinc-900 border-zinc-300 hover:border-zinc-300 bg-white'}`}
                                    >
                                        <Filter size={16} /> Filter
                                    </button>
                                    {showMenuFilterMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-zinc-200 shadow-xl z-50 overflow-hidden">
                                            <div className="p-2 border-b border-zinc-100">
                                                <p className="text-[14px] font-medium text-zinc-400 px-2">Filter Menu</p>
                                            </div>
                                            <div className="p-1">
                                                <button
                                                    onClick={() => { setMenuFilter('ALL'); setShowMenuFilterMenu(false); setCurrentPage(1); }}
                                                    className={`w-full px-3 py-2 rounded-lg text-left text-sm font-semibold transition-colors
                                                        ${menuFilter === 'ALL'
                                                            ? 'bg-orange-50 text-[#FF5C00]'
                                                            : 'text-zinc-700 hover:bg-zinc-50'}`}
                                                >
                                                    All Items
                                                    {menuFilter === 'ALL' && (
                                                        <span className="float-right">✓</span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setMenuFilter('LOW_PRICE'); setShowMenuFilterMenu(false); setCurrentPage(1); }}
                                                    className={`w-full px-3 py-2 rounded-lg text-left text-sm font-semibold transition-colors
                                                        ${menuFilter === 'LOW_PRICE'
                                                            ? 'bg-orange-50 text-[#FF5C00]'
                                                            : 'text-zinc-700 hover:bg-zinc-50'}`}
                                                >
                                                    Price: Low to High
                                                    {menuFilter === 'LOW_PRICE' && (
                                                        <span className="float-right">✓</span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setMenuFilter('HIGH_PRICE'); setShowMenuFilterMenu(false); setCurrentPage(1); }}
                                                    className={`w-full px-3 py-2 rounded-lg text-left text-sm font-semibold transition-colors
                                                        ${menuFilter === 'HIGH_PRICE'
                                                            ? 'bg-orange-50 text-[#FF5C00]'
                                                            : 'text-zinc-700 hover:bg-zinc-50'}`}
                                                >
                                                    Price: High to Low
                                                    {menuFilter === 'HIGH_PRICE' && (
                                                        <span className="float-right">✓</span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setMenuFilter('AVAILABLE'); setShowMenuFilterMenu(false); setCurrentPage(1); }}
                                                    className={`w-full px-3 py-2 rounded-lg text-left text-sm font-semibold transition-colors
                                                        ${menuFilter === 'AVAILABLE'
                                                            ? 'bg-orange-50 text-[#FF5C00]'
                                                            : 'text-zinc-700 hover:bg-zinc-50'}`}
                                                >
                                                    Available Only
                                                    {menuFilter === 'AVAILABLE' && (
                                                        <span className="float-right">✓</span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {(() => {
                                // Filter by category
                                let filteredItems = menuItems.filter(item =>
                                    activeCategory === 'All Menu' || item.categoryId?.name === activeCategory
                                );

                                // Apply search filter
                                if (menuSearch.trim()) {
                                    const query = menuSearch.toLowerCase().trim();
                                    filteredItems = filteredItems.filter(item =>
                                        item.name.toLowerCase().includes(query) ||
                                        item.categoryId?.name?.toLowerCase().includes(query)
                                    );
                                }

                                // Apply menu filter
                                if (menuFilter === 'AVAILABLE') {
                                    filteredItems = filteredItems.filter(item => item.status === 'Active');
                                }

                                // Apply sorting
                                if (menuFilter === 'LOW_PRICE') {
                                    filteredItems = [...filteredItems].sort((a, b) => a.price - b.price);
                                } else if (menuFilter === 'HIGH_PRICE') {
                                    filteredItems = [...filteredItems].sort((a, b) => b.price - a.price);
                                }

                                // Pagination
                                const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
                                const startIndex = (currentPage - 1) * itemsPerPage;
                                const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

                                if (filteredItems.length === 0) {
                                    return (
                                        <div className="col-span-full py-20 text-center">
                                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 mb-4">
                                                <Utensils size={36} className="text-zinc-400" />
                                            </div>
                                            <h4 className="text-base font-bold text-zinc-800 mb-2">No items in this category</h4>
                                            <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                                                There are no menu items available in <span className="font-bold text-zinc-700">{activeCategory}</span> category right now.
                                            </p>
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        {paginatedItems.map(item => (
                                            <div
                                                key={item._id}
                                                onClick={() => addToCart(item)}
                                                className={`group bg-white rounded-xl p-3.5 border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-all cursor-pointer relative overflow-hidden ${activeOrder?.status === 'COMPLETED' ? 'opacity-60 grayscale-[0.4]' : ''}`}
                                            >
                                                <div className="aspect-[4/3] rounded-lg bg-zinc-100 overflow-hidden mb-3 relative border border-transparent group-hover:border-zinc-200 transition-colors">
                                                    <img
                                                        src={item.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80`}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                        alt={item.name}
                                                    />
                                                    <div className="absolute top-2.5 left-2.5">
                                                        <span className="px-2 py-1 bg-[#FF5C00] text-white text-[8px] font-bold rounded-md uppercase tracking-wide">
                                                            {item.categoryId?.name || 'Menu Item'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h4 className="text-sm font-bold text-zinc-900 group-hover:text-[#FF5C00] transition-colors line-clamp-1">{item.name}</h4>
                                                <p className="mt-1 text-xs font-medium text-zinc-500 line-clamp-2 min-h-[32px]">
                                                    {item.description || 'No description available'}
                                                </p>
                                                <div className="mt-3 flex items-center justify-between">
                                                    <p className="text-base font-bold text-zinc-900">
                                                        <span className="text-[10px] text-zinc-400 mr-0.5 font-semibold">NRs.</span>
                                                        {item.price.toLocaleString()}
                                                    </p>
                                                    <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-[#FF5C00] group-hover:text-white group-hover:border-[#FF5C00] transition-all">
                                                        <Plus size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                                className="col-span-full mt-6 pb-4"
                                            />
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </section>
                </div>

                <div className={`fixed inset-x-0 bottom-0 z-30 flex flex-col bg-white border-t border-zinc-200 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] transition-all duration-300
                    ${isOrderSummaryOpen ? 'h-[72vh] md:h-[68vh]' : 'h-[126px] md:h-[132px]'}
                    lg:shadow-none lg:border-t-0 lg:border-l lg:fixed lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-[420px]`}>
                    <div className="h-16 px-4 md:px-5 lg:px-8 border-b border-zinc-100 flex items-center">
                        <div className="flex items-center justify-between w-full">
                            <h3 className="text-lg lg:text-xl font-bold text-zinc-900">Order Summary</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => router.push('/waiter/settings')}
                                    className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-700 transition-colors"
                                    aria-label="Settings"
                                    title="Settings"
                                >
                                    <Settings size={16} />
                                </button>
                                <button
                                    onClick={() => setShowLogoutConfirmation(true)}
                                    className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-rose-500 transition-colors"
                                    aria-label="Logout"
                                    title="Logout"
                                >
                                    <LogOut size={16} />
                                </button>
                                <button
                                    onClick={() => setIsOrderSummaryOpen((prev) => !prev)}
                                    className="lg:hidden h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500"
                                >
                                    {isOrderSummaryOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {!isOrderSummaryOpen && (
                        <div className="lg:hidden px-4 md:px-5 pb-3 space-y-1.5 border-b border-zinc-100">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500">
                                <span>{selectedTable ? `Table ${selectedTable.number}` : 'Select Table'}</span>
                                <span>Subtotal: NRs. {((activeOrder?.subtotal || 0) + subtotal).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-zinc-800">Total</span>
                                <span className="text-[#FF5C00]">NRs. {Math.round((activeOrder?.total || 0) + subtotal + tax).toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    <div className={`${isOrderSummaryOpen ? 'flex' : 'hidden'} lg:flex flex-col min-h-0 flex-1 px-4 md:px-5 lg:px-8 pb-0 lg:pb-8`}>
                        <div className="mb-5 mt-3 flex justify-between items-start border-b border-zinc-100 pb-5">
                            <div className="space-y-1">
                                {activeOrder ? (
                                    <p className="text-[12px] font-bold uppercase tracking-widest text-[#FF5C00]">
                                        #{activeOrder.orderNumber || `OD-${Math.floor(Math.random() * 10000)}`}
                                    </p>
                                ) : (
                                    <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">
                                        New Order
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <Utensils size={14} className="text-zinc-500" />
                                    <p className="text-[15px] font-semibold text-zinc-500">
                                        Recipient : <span className="text-zinc-900">{selectedTable ? `Table ${selectedTable.number}` : 'Select Table'}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-right">
                                <Clock size={12} className="text-zinc-400" />
                                <p className="text-[13px] font-medium text-zinc-400">
                                    {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                                </p>
                            </div>
                        </div>

                        <div className="lg:flex-1 overflow-y-auto no-scrollbar space-y-4 max-h-[34vh] md:max-h-[30vh] lg:max-h-none">
                            {cart.length > 0 && (
                                <div className="flex flex-col min-w-0">
                                    <p className="text-[14px] font-medium text-zinc-400 mb-3">Adding to Order ({cart.length})</p>
                                    <div className="space-y-3 md:flex md:gap-3 md:space-y-0 md:overflow-x-auto md:no-scrollbar lg:block lg:space-y-3">
                                        {cart.map(item => (
                                            <div key={item._id} className="p-3 bg-white rounded-xl border border-zinc-200 group md:min-w-[300px] md:max-w-[320px] md:shrink-0 lg:min-w-0 lg:max-w-none">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-10 w-10 rounded-lg bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0">
                                                            <img
                                                                src={item.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80`}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[12px] font-semibold text-center leading-4">
                                                                {item.quantity}x
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[14px] font-bold text-zinc-900 line-clamp-1">{item.name}</p>
                                                            <p className="text-[12px] font-semibold text-zinc-400 mt-1">NRs. {item.price.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <button onClick={() => removeFromCart(item._id)} className="text-rose-500"><Trash2 size={14} /></button>
                                                        <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden h-7">
                                                            <button onClick={() => updateQuantity(item._id, -1)} className="h-full w-7 flex items-center justify-center text-zinc-400 hover:bg-white transition-colors"><Minus size={10} /></button>
                                                            <span className="text-[12px] font-bold w-5 text-center">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item._id, 1)} className="h-full w-7 flex items-center justify-center text-zinc-400 hover:bg-white transition-colors"><Plus size={10} /></button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-2 pl-[52px]">
                                                    <div className="relative">
                                                        <MessageSquare size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                        <input
                                                            type="text"
                                                            value={item.notes || ''}
                                                            onChange={(e) => updateItemNotes(item._id, e.target.value)}
                                                            placeholder="Add note for chef (e.g. less spicy, no..."
                                                            className="w-full h-8 pl-8 pr-3 rounded-lg border border-zinc-200 bg-zinc-50 text-[13px] font-medium text-zinc-700 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-300 outline-none"
                                                        />
                                                    </div>
                                                    {item.notes?.trim() && (
                                                        <div className="mt-1.5 inline-flex items-center rounded px-2 py-1 text-[12px] font-semibold bg-rose-50 text-rose-700">
                                                            {item.notes.trim()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeOrder?.items?.length > 0 && (
                                <div className="flex flex-col min-w-0 space-y-3">
                                    <div className={`flex items-center justify-between p-3 rounded-xl border ${activeOrder.status === 'PENDING' ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' :
                                            activeOrder.status === 'COOKING' ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200' :
                                                activeOrder.status === 'COOKED' ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' :
                                                    activeOrder.status === 'SERVED' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' :
                                                        activeOrder.status === 'COMPLETED' ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' :
                                                            activeOrder.status === 'CANCELLED' ? 'bg-gradient-to-r from-rose-50 to-red-50 border-rose-200' :
                                                                'bg-gradient-to-r from-zinc-50 to-zinc-100 border-zinc-200'
                                        }`}>
                                        <div>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${activeOrder.status === 'PENDING' ? 'text-amber-600' :
                                                    activeOrder.status === 'COOKING' ? 'text-violet-600' :
                                                        activeOrder.status === 'COOKED' ? 'text-emerald-600' :
                                                            activeOrder.status === 'SERVED' ? 'text-blue-600' :
                                                                activeOrder.status === 'COMPLETED' ? 'text-emerald-600' :
                                                                    activeOrder.status === 'CANCELLED' ? 'text-rose-600' :
                                                                        'text-zinc-600'
                                                }`}>Order Status</p>
                                            <p className={`text-sm font-bold mt-1 ${activeOrder.status === 'PENDING' ? 'text-amber-900' :
                                                    activeOrder.status === 'COOKING' ? 'text-violet-900' :
                                                        activeOrder.status === 'COOKED' ? 'text-emerald-900' :
                                                            activeOrder.status === 'SERVED' ? 'text-blue-900' :
                                                                activeOrder.status === 'COMPLETED' ? 'text-emerald-900' :
                                                                    activeOrder.status === 'CANCELLED' ? 'text-rose-900' :
                                                                        'text-zinc-900'
                                                }`}>{activeOrder.status}</p>
                                            {activeOrder.items.some((i: any) => i.status === 'PREPARING') && ['COOKED', 'SERVED'].includes(activeOrder.status) && (
                                                <p className="text-[9px] font-bold text-rose-500 mt-0.5 animate-pulse">
                                                    New items pending kitchen
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {activeOrder.status === 'PENDING' && (
                                                <button
                                                    disabled={isLoading}
                                                    onClick={() => setShowCancelOrderConfirmation(true)}
                                                    className="h-9 px-4 rounded-lg bg-rose-500 text-white text-[13px] font-semibold hover:bg-rose-600 transition-all flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    <XCircle size={14} /> Cancel
                                                </button>
                                            )}
                                            {activeOrder.status === 'COOKED' && (
                                                <button
                                                    disabled={isLoading}
                                                    onClick={() => handleUpdateStatus('SERVED')}
                                                    className="h-9 px-4 rounded-lg bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                                >
                                                    <Utensils size={14} /> Serve
                                                </button>
                                            )}
                                            {activeOrder.status === 'SERVED' && (
                                                <button
                                                    disabled={isLoading}
                                                    onClick={() => handleUpdateStatus('COMPLETED')}
                                                    className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-[13px] font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                                >
                                                    <CheckCircle2 size={14} /> Complete
                                                </button>
                                            )}
                                            {activeOrder.status === 'COOKING' && (
                                                <Clock size={17} className="text-orange-500 animate-spin" />
                                            )}
                                            {activeOrder.status === 'COMPLETED' && (
                                                <CheckCircle2 size={17} className="text-emerald-500" />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[14px] font-medium text-zinc-400">
                                        {activeOrder.status === 'COMPLETED' ? 'Order Items' : 'In Kitchen'} ({activeOrder.items.length})
                                    </p>
                                    <div className="space-y-3">
                                        {activeOrder.items.map((item: any) => (
                                            <div key={item._id} className="p-3 bg-white rounded-xl border border-zinc-200 group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-10 w-10 rounded-lg bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0">
                                                            <img
                                                                src={item.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80`}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[12px] font-semibold text-center leading-4">
                                                                {item.quantity}x
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[14px] font-bold text-zinc-900 line-clamp-1">{item.name}</p>
                                                            {item.price && (
                                                                <p className="text-[12px] font-semibold text-zinc-400 mt-1">NRs. {item.price.toLocaleString()}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={`text-[12px] font-semibold px-1.5 py-0.5 rounded ${activeOrder.status === 'COMPLETED' || ['READY', 'COOKED', 'SERVED'].includes(item.status)
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-zinc-200 text-zinc-500'
                                                        }`}>
                                                        {activeOrder.status === 'COMPLETED'
                                                            ? 'COMPLETED'
                                                            : (item.status === 'READY' || item.status === 'COOKED' || item.status === 'SERVED')
                                                                ? 'READY'
                                                                : item.status}
                                                    </div>
                                                </div>
                                                {item.notes && (
                                                    <div className="mt-2 pl-[52px]">
                                                        <div className="inline-flex items-center rounded px-2 py-1 text-[12px] font-semibold bg-rose-50 text-rose-700">
                                                            {item.notes}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {activeOrder.status !== 'COMPLETED' && cart.length === 0 && (
                                        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                            <p className="text-[14px] font-medium text-amber-700 text-center">
                                                💡 Need to add more items? Select from the menu and click "Add Items to Order"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {cart.length === 0 && (!activeOrder || activeOrder.items.length === 0) && (
                                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 mb-4">
                                        <ShoppingBag size={36} className="text-zinc-400" />
                                    </div>
                                    <h4 className="text-base font-bold text-zinc-800 mb-2">Your cart is empty</h4>
                                    <p className="text-sm text-zinc-500 max-w-[220px]">Add items from the menu to start an order</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-zinc-100 shrink-0 bg-white">
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold text-zinc-500">Subtotal</p>
                                    <p className="text-sm font-bold text-zinc-900">NRs. {((activeOrder?.subtotal || 0) + subtotal).toLocaleString()}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold text-zinc-500">Tax 13% (VAT)</p>
                                    <p className="text-sm font-bold text-zinc-900">NRs. {Math.round((activeOrder?.tax || 0) + tax).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="h-px w-full bg-zinc-200 my-4" />
                            <div className="flex justify-between items-center pb-5">
                                <p className="text-lg font-bold text-zinc-900">Total</p>
                                <p className="text-lg font-bold text-[#FF5C00]">NRs. {Math.round((activeOrder?.total || 0) + subtotal + tax).toLocaleString()}</p>
                            </div>

                            {activeOrder?.status === 'COMPLETED' ? (
                                <div className="h-12 w-full bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                                    <CheckCircle2 size={18} className="text-white" /> Order Completed
                                </div>
                            ) : (
                                <button
                                    onClick={sendToKitchen}
                                    disabled={!selectedTable || cart.length === 0 || isLoading}
                                    className="h-12 w-full bg-[#FF5C00]/90 hover:bg-[#FF5C00] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                    {activeOrder ? (
                                        <Plus size={18} />
                                    ) : (
                                        <ChefHat size={18} />
                                    )}

                                    {activeOrder ? 'Add Items to Order' : 'Send to Kitchen'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>



            <ConfirmationDialog
                isOpen={showLogoutConfirmation}
                onClose={() => setShowLogoutConfirmation(false)}
                onConfirm={logout}
                title="Confirm Logout"
                message="Are you sure you want to logout? You will need to sign in again to access your account."
                confirmText="Logout"
                cancelText="Cancel"
                variant="warning"
            />

            <ConfirmationDialog
                isOpen={showCancelOrderConfirmation}
                onClose={() => setShowCancelOrderConfirmation(false)}
                onConfirm={() => {
                    setShowCancelOrderConfirmation(false);
                    handleUpdateStatus('CANCELLED');
                }}
                title="Cancel Order"
                message="Are you sure you want to cancel this order?"
                confirmText="Cancel Order"
                cancelText="Go Back"
                variant="danger"
            />
        </div>
    );
}