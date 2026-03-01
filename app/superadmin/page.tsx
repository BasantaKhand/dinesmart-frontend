"use client";

import { useEffect, useState } from 'react';
import {
    Building2,
    DollarSign,
    AlertTriangle,
    Clock,
    Loader2
} from 'lucide-react';
import { PlatformGrowthChart } from '@/features/superadmin/components/ui/platform-growth-chart';
import { ApplicationApprovalRate } from '@/features/superadmin/components/ui/application-approval-rate';


import { MostActiveRestaurants } from '@/features/superadmin/components/ui/most-active-restaurants';
import { RecentlySuspended } from '@/features/superadmin/components/ui/recently-suspended';


import { useGetSystemAnalytics } from '@/hooks/useSuperadmin';
import type { SystemAnalytics } from '@/api/superadmin.api';

interface KPIData {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend: {
        value: string;
        isPositive: boolean;
        description: string;
    };
    iconBg: string;
    iconColor: string;
}

export default function SuperadminDashboard() {
    const { data: analyticsResponse, isLoading: loading } = useGetSystemAnalytics(30);
    const analytics = analyticsResponse?.data || null;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-[#FF5C00]" />
                <p className="mt-4 text-sm font-semibold text-zinc-500">Loading system analytics...</p>
            </div>
        );
    }

    const overview = analytics?.overview;

    // Helper to format growth percentage
    const formatGrowth = (growth: number | undefined) => {
        const value = growth ?? 0;
        return `${Math.abs(value).toFixed(1)}%`;
    };

    const kpis: KPIData[] = [
        {
            title: 'Total Restaurants',
            value: overview?.totalRestaurants ?? 0,
            icon: <Building2 className="h-5 w-5" strokeWidth={2.5} />,
            trend: {
                value: formatGrowth(overview?.totalRestaurantsGrowth),
                isPositive: (overview?.totalRestaurantsGrowth ?? 0) >= 0,
                description: `last ${overview?.days ?? 30} days`
            },
            iconBg: 'bg-[#007BFF]',
            iconColor: 'text-white',
        },
        {
            title: 'Subscription Revenue',
            value: `NPR ${(overview?.totalRevenue ?? 0).toLocaleString()}`,
            icon: <DollarSign className="h-5 w-5" strokeWidth={2.5} />,
            trend: {
                value: formatGrowth(overview?.revenueGrowth),
                isPositive: (overview?.revenueGrowth ?? 0) >= 0,
                description: `last ${overview?.days ?? 30} days`
            },
            iconBg: 'bg-[#00A86B]',
            iconColor: 'text-white',
        },
        {
            title: 'Suspended Restaurants',
            value: overview?.suspendedRestaurants ?? 0,
            icon: <AlertTriangle className="h-5 w-5" strokeWidth={2.5} />,
            trend: {
                value: formatGrowth(overview?.suspendedRestaurantsGrowth),
                // For suspended, decrease is good (inverted logic)
                isPositive: (overview?.suspendedRestaurantsGrowth ?? 0) <= 0,
                description: `last ${overview?.days ?? 30} days`
            },
            iconBg: 'bg-[#FF5C00]',
            iconColor: 'text-white',
        },
        {
            title: 'Pending Applications',
            value: overview?.pendingRestaurants ?? 0,
            icon: <Clock className="h-5 w-5" strokeWidth={2.5} />,
            trend: {
                value: formatGrowth(overview?.pendingRestaurantsGrowth),
                isPositive: (overview?.pendingRestaurantsGrowth ?? 0) >= 0,
                description: `last ${overview?.days ?? 30} days`
            },
            iconBg: 'bg-[#8A2BE2]',
            iconColor: 'text-white',
        },
    ];

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
                    <p className="mt-1 text-sm font-medium text-zinc-500">
                        Enterprise overview of platform growth, risk, and operational health
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="group relative overflow-hidden rounded-xl bg-white px-6 py-5 ring-1 ring-zinc-300 transition-all shadow-none">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-[13px] font-medium text-zinc-400 leading-none">{kpi.title}</p>
                                <h3 className="mt-2.5 text-[28px] font-extrabold tracking-tight text-zinc-900 leading-none">{kpi.value}</h3>
                                <div className="mt-4 flex items-center gap-1">
                                    <span className={`text-[12px] font-semibold ${kpi.trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {kpi.trend.isPositive ? '↗' : '↘'} {kpi.trend.isPositive ? '+' : '-'}{kpi.trend.value}
                                    </span>
                                    <span className="text-[12px] font-medium text-zinc-400">{kpi.trend.description}</span>
                                </div>
                            </div>
                            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-none ${kpi.iconBg} ${kpi.iconColor}`}>
                                {kpi.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Row 2: Charts & Suspended */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <PlatformGrowthChart growthData={analytics?.growthData} />
                <ApplicationApprovalRate overview={overview} />
                <RecentlySuspended suspensions={analytics?.recentSuspensions} />
            </div>

            {/* Row 3: Activity */}
            <MostActiveRestaurants mostActive={analytics?.mostActiveRestaurants} />        </div>
    );
}
