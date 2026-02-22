import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend: {
        value: string;
        isPositive: boolean;
        description: string;
    };
    variant?: 'success' | 'blue' | 'orange' | 'purple';
}

const variants = {
    success: 'bg-[#00A86B]', // Green
    blue: 'bg-[#007BFF]',   // Blue
    orange: 'bg-[#FF5C00]', // Orange
    purple: 'bg-[#8A2BE2]', // Purple
};

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, variant = 'orange' }) => {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white px-6 py-5 ring-1 ring-zinc-100 transition-all hover:ring-zinc-200 shadow-none">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-[13px] font-medium text-zinc-400 leading-none">{title}</p>
                    <h3 className="mt-2.5 text-[28px] font-extrabold tracking-tight text-zinc-900 leading-none">{value}</h3>
                    <div className="mt-4 flex items-center gap-1">
                        <span className={`text-[12px] font-semibold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            ↗ +{trend.value}
                        </span>
                        <span className="text-[12px] font-medium text-zinc-400">{trend.description}</span>
                    </div>
                </div>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-none ${variants[variant]}`}>
                    <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
            </div>
        </div>
    );
};
