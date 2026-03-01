"use client";

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

const fallbackData = [
    { name: 'Main Course', value: 400 },
    { name: 'Beverages', value: 300 },
    { name: 'Desserts', value: 200 },
    { name: 'Appetizers', value: 100 },
];

const COLORS = ['#FF5C00', '#007BFF', '#f59e0b', '#8A2BE2'];

type CategorySalesPoint = { name: string; value: number };

interface CategorySalesProps {
    data?: CategorySalesPoint[];
    isLoading?: boolean;
}

export const CategorySales: React.FC<CategorySalesProps> = ({ data, isLoading }) => {
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
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #F1F1F1',
                            boxShadow: 'none'
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-[12px] font-medium text-zinc-600">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
