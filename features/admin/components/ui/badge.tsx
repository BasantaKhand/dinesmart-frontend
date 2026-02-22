import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gray' | 'blue';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
    const variants = {
        default: 'bg-zinc-100 text-zinc-800 ring-zinc-200',
        success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        warning: 'bg-amber-50 text-amber-700 ring-amber-200',
        error: 'bg-rose-50 text-rose-700 ring-rose-200',
        info: 'bg-blue-50 text-blue-700 ring-blue-200',
        blue: 'bg-blue-50 text-blue-700 ring-blue-200',
        gray: 'bg-zinc-100 text-zinc-800 ring-zinc-200',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${variants[variant]}`}>
            {children}
        </span>
    );
};
