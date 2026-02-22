"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Bell } from 'lucide-react';

export const Topbar: React.FC = () => {
    const pathname = usePathname();
    const { user } = useAuth();

    const getBreadcrumb = () => {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length <= 1) return 'Dashboard';
        return segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
    };

    const currentPage = getBreadcrumb();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-100 bg-white px-4 md:px-6">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Admin</span>
                <span className="text-xs text-zinc-300">/</span>
                <span className="text-sm font-bold text-zinc-900">{currentPage}</span>
            </div>

            {/* Right: Notification & User Info */}
            <div className="flex items-center gap-2 md:gap-3">
                <button className="h-9 w-9 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-100 hover:text-zinc-900 transition-colors relative">
                    <Bell size={18} />
                    <div className="absolute top-2 right-2 h-2 w-2 bg-[#FF5C00] border-2 border-white rounded-full" />
                </button>

                <div className="flex items-center gap-3 pl-3 border-l border-zinc-100">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-zinc-900 leading-tight">{user?.name || 'Admin'}</p>
                        <p className="text-xs font-medium text-zinc-500 mt-1">{user?.role?.replace(/_/g, ' ') || 'ADMIN'}</p>
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-[#FF5C00] text-white flex items-center justify-center font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                </div>
            </div>
        </header>
    );
};
