"use client";

import {
    DollarSign,
    ShoppingBag,
    Package,
    Users,
    Download,
    ChevronDown,
    MoreHorizontal
} from 'lucide-react';
import { Badge } from '@/features/admin/components/ui/badge';
import { KPICard } from '@/features/admin/components/ui/kpi-card';
import { SalesOverview } from '@/features/admin/components/ui/charts/sales-overview';
import { CategorySales } from '@/features/admin/components/ui/charts/category-sales';

export default function AdminDashboard() {
    return (
        <div className="space-y-6 pb-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Overview</h1>
                    <p className="mt-1 text-sm font-medium text-zinc-500">Welcome back! Here's what's happening today.</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-[#FF5C00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e65300] transition-all active:scale-95 whitespace-nowrap">
                    <Download size={16} strokeWidth={2.5} />
                    Download Report
                </button>
            </div>

            {/* KPI Section — compact gap matching sample */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Net Revenue"
                    value="NRs. 2.9L"
                    icon={DollarSign}
                    trend={{ value: '0.4%', isPositive: true, description: 'vs last month' }}
                    variant="success"
                />
                <KPICard
                    title="Total Orders"
                    value="9"
                    icon={ShoppingBag}
                    trend={{ value: '32%', isPositive: true, description: 'vs last quarter' }}
                    variant="blue"
                />
                <KPICard
                    title="Products"
                    value="4"
                    icon={Package}
                    trend={{ value: '71%', isPositive: true, description: 'Goal: 100' }}
                    variant="orange"
                />
                <KPICard
                    title="Customers"
                    value="6"
                    icon={Users}
                    trend={{ value: '11%', isPositive: true, description: 'vs last quarter' }}
                    variant="purple"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-xl bg-white p-6 border border-zinc-200 shadow-sm">
                    <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Sales Overview</h2>
                            <p className="text-sm text-zinc-500 mt-0.5">Revenue trend over the last 30 days</p>
                        </div>
                        <button className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-zinc-700 border border-zinc-300 transition-all hover:bg-zinc-50">
                            Last 30 Days
                            <ChevronDown size={14} />
                        </button>
                    </div>
                    <SalesOverview />
                </div>
                <div className="rounded-xl bg-white p-6 border border-zinc-200 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-zinc-900">Sales by Category</h2>
                        <p className="text-sm text-zinc-500 mt-0.5">Distribution of revenue</p>
                    </div>
                    <CategorySales />
                </div>
            </div>

            {/* Bottom Tables Section */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Top Products */}
                <div className="rounded-xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
                        <h2 className="text-lg font-bold text-zinc-900">Top Products</h2>
                        <button className="text-sm font-semibold text-[#FF5C00] hover:underline">View All →</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3 text-center">Deals</th>
                                    <th className="px-6 py-3 text-right">Total Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {
                                    [{ name: 'Aurora Fabric Sofa', category: 'Furniture', deals: 45, value: 'NRs. 8,70,000' },
                                    { name: 'Nova Wooden Coffee Table', category: 'Furniture', deals: 32, value: 'NRs. 1,35,000' },
                                    { name: 'Velvet Armchair', category: 'Furniture', deals: 28, value: 'NRs. 4,20,000' },
                                    ].map((product, i) => (
                                        <tr key={i} className="group hover:bg-zinc-50/30 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-zinc-100 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-[13px] font-semibold text-zinc-800">{product.name}</p>
                                                        <p className="text-[11px] font-medium text-zinc-400">{product.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 text-center text-[13px] font-semibold text-zinc-600">{product.deals}</td>
                                            <td className="px-6 py-3.5 text-right text-[13px] font-semibold text-zinc-800">{product.value}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="rounded-xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
                        <h2 className="text-lg font-bold text-zinc-900">Recent Orders</h2>
                        <button className="text-sm font-semibold text-[#FF5C00] hover:underline">View All →</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                <tr>
                                    <th className="px-6 py-3">Order ID</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {
                                    [{ id: '#03QMW3', customer: 'Naya Account', status: 'Confirmed' },
                                    { id: '#JHYDHH', customer: 'Saugat Shahi Thakuri', status: 'Confirmed' },
                                    { id: '#ILATMP', customer: 'Amrit Neupane', status: 'Pending' },
                                    ].map((order, i) => (
                                        <tr key={i} className="group hover:bg-zinc-50/30 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <span className="rounded-lg bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-600 ring-1 ring-zinc-200">
                                                    {order.id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-bold text-zinc-400">
                                                        {order.customer.charAt(0)}
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-zinc-700">{order.customer}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${order.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
