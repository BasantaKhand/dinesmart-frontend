"use client";

import React from 'react';
import { KPICard } from '@/features/admin/components/ui/kpi-card';
import {
    Calendar,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Download
} from 'lucide-react';

import { SalesOverview } from '@/features/admin/components/ui/charts/sales-overview';

export default function ReportsPage() {
    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">Reports</h1>
                    <p className="mt-1 text-[15px] font-medium text-zinc-500">Analyze your restaurant performance and revenue trends.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-[2rem] bg-white px-5 py-2.5 text-sm font-black text-zinc-600 ring-1 ring-zinc-100 hover:bg-zinc-50 transition-colors shadow-none">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-[2rem] bg-[#FF5C00] px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-[#e65300] shadow-none">
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <KPICard
                    title="Daily Sales"
                    value="Rs. 24,500"
                    icon={Calendar}
                    trend={{ value: '15%', isPositive: true, description: 'vs yesterday' }}
                    variant="success"
                />
                <KPICard
                    title="Weekly Sales"
                    value="Rs. 1,85,000"
                    icon={TrendingUp}
                    trend={{ value: '10%', isPositive: true, description: 'vs last week' }}
                    variant="blue"
                />
                <KPICard
                    title="Monthly Sales"
                    value="Rs. 7,42,000"
                    icon={TrendingUp}
                    trend={{ value: '5%', isPositive: false, description: 'vs last month' }}
                    variant="orange"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Sales Chart */}
                <div className="lg:col-span-2 rounded-xl bg-white p-8 ring-1 ring-zinc-300 shadow-none">
                    <div className="mb-8">
                        <h2 className="text-[18px] font-bold text-zinc-900">Revenue Performance</h2>
                        <p className="text-[13px] font-medium text-zinc-400 mt-1">Net revenue growth over the last 30 days</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-xl bg-white p-8 ring-1 ring-zinc-300 shadow-none border border-zinc-200">
                            <div className="mb-8">
                                <h2 className="text-[17px] font-bold text-zinc-900">Revenue Analysis</h2>
                                <p className="text-[13px] font-medium text-zinc-400 mt-1">Monthly income comparison and projections</p>
                            </div>
                            <div className="h-[300px] w-full bg-zinc-50 rounded-lg border border-dashed border-zinc-200 flex items-center justify-center text-zinc-400 font-bold">
                                Chart: Revenue Trends
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-8 ring-1 ring-zinc-300 shadow-none border border-zinc-200">
                            <div className="mb-8">
                                <h2 className="text-[17px] font-bold text-zinc-900">Category Insights</h2>
                                <p className="text-[13px] font-medium text-zinc-400 mt-1">Top performing food and beverage categories</p>
                            </div>
                            <div className="h-[300px] w-full bg-zinc-50 rounded-lg border border-dashed border-zinc-200 flex items-center justify-center text-zinc-400 font-bold">
                                Chart: Category Distribution
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Selling Items */}
                <div className="rounded-xl bg-white ring-1 ring-zinc-300 overflow-hidden shadow-none">
                    <div className="border-b border-zinc-200 px-6 py-4">
                        <h2 className="text-[17px] font-bold text-zinc-900">Top Selling Items</h2>
                        <p className="text-xs font-medium text-zinc-400 mt-1">Most ordered items this month</p>
                    </div>
                    <div className="overflow-hidden">
                        <ul className="divide-y divide-zinc-100">
                            {[
                                { name: 'Momo (Steam)', sales: 145, revenue: 36250 },
                                { name: 'Chicken Biryani', sales: 98, revenue: 44100 },
                                { name: 'Cold Coffee', sales: 76, revenue: 13680 },
                                { name: 'French Fries', sales: 65, revenue: 13000 },
                            ].map((item, idx) => (
                                <li key={idx} className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-zinc-50/60">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center font-bold text-zinc-600 text-[13px]">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-semibold text-zinc-900">{item.name}</p>
                                            <p className="text-sm font-medium text-zinc-400 mt-0.5">{item.sales} portions sold</p>
                                        </div>
                                    </div>
                                    <p className="text-[15px] font-bold text-[#FF5C00]">Rs. {item.revenue.toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
