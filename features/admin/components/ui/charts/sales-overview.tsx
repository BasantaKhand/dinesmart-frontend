"use client";

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

const fallbackData = [
    { name: '1 Feb', sales: 4000 },
    { name: '5 Feb', sales: 3000 },
    { name: '10 Feb', sales: 2000 },
    { name: '15 Feb', sales: 2780 },
    { name: '20 Feb', sales: 1890 },
    { name: '25 Feb', sales: 2390 },
    { name: '28 Feb', sales: 3490 },
];

type SalesOverviewPoint = { name: string; sales: number };

interface SalesOverviewProps {
    data?: SalesOverviewPoint[];
    isLoading?: boolean;
}

export const SalesOverview: React.FC<SalesOverviewProps> = ({ data, isLoading }) => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const chartData = data && data.length > 0 ? data : fallbackData;
    const showLoading = !isMounted || isLoading;

    if (showLoading) return <div className="h-[300px] w-full rounded-lg border border-zinc-300 bg-zinc-50/50 p-4 animate-pulse" />;

    return (
        <div className="h-[300px] w-full rounded-lg border border-zinc-300 p-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF5C00" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#FF5C00" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#A1A1AA', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#A1A1AA', fontSize: 12 }}
                        tickFormatter={(value) => `Rs.${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #F1F1F1',
                            boxShadow: 'none'
                        }}
                        formatter={(value: any) => [`Rs. ${Math.round(value as number).toLocaleString()}`, 'Sales']}
                    />
                    <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#FF5C00"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSales)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
