"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    UtensilsCrossed,
    BarChart3,
    Table as TableIcon,
    Wallet,
    LogOut,
    Menu as MenuIcon
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import ConfirmationDialog from '@/features/admin/components/ui/confirmation-dialog';

const navGroups: {
    title: string;
    items: {
        label: string;
        href: string;
        icon: any;
        badge?: string;
        isPlaceholder?: boolean;
    }[];
}[] = [
        {
            title: 'OVERVIEW',
            items: [
                { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
            ]
        },
        {
            title: 'MANAGEMENT',
            items: [
                { label: 'Menu Items', href: '/admin/menu', icon: UtensilsCrossed },
                { label: 'Categories', href: '/admin/categories', icon: LayoutDashboard },
                { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
                { label: 'Staff', href: '/admin/staff', icon: Users },
                { label: 'Tables', href: '/admin/tables', icon: TableIcon },
                { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
                { label: 'Payment Settings', href: '/admin/payments', icon: Wallet },
            ]
        },
        {
            title: 'COMMUNICATION',
            items: [
                { label: 'Support Chat', href: '#support', icon: LogOut, isPlaceholder: true },
            ]
        }
    ];

export const SidebarNav: React.FC = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

    return (
        <nav className="flex flex-1 flex-col justify-between py-4">
            <div className="space-y-6 px-3">
                {navGroups.map((group) => (
                    <div key={group.title} className="space-y-2">
                        <h3 className="px-3 text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase">
                            {group.title}
                        </h3>
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                return (
                                    <li key={item.label}>
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all
                                    ${isActive
                                                    ? 'bg-[#FF5C00]/10 text-[#FF5C00]'
                                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                                                }`}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-[#FF5C00]" />
                                            )}
                                            <item.icon className={`h-[18px] w-[18px] transition-colors
                                        ${isActive ? 'text-[#FF5C00]' : 'text-zinc-400 group-hover:text-zinc-600'}`}
                                            />
                                            <span className={`text-[14px] font-medium tracking-tight transition-colors
                                        ${isActive ? 'font-semibold text-[#FF5C00]' : ''}`}
                                            >
                                                {item.label}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Profile Section */}
            <div className="mt-auto border-t border-zinc-100 px-4 py-4">
                <div className="group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-all hover:bg-zinc-50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF5C00] text-[13px] font-bold text-white">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-zinc-800 leading-none">{user?.name || 'User'}</span>
                            <span className="mt-1 text-[11px] font-medium text-zinc-400 leading-none truncate max-w-[120px]">{user?.email || ''}</span>
                        </div>
                    </div>
                    <LogOut
                        onClick={() => setShowLogoutConfirmation(true)}
                        className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-rose-500 cursor-pointer"
                    />
                </div>
            </div>

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
        </nav>
    );
};
