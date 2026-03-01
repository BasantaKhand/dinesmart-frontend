"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    UtensilsCrossed,
    Table as TableIcon,
    Settings
} from 'lucide-react';

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
                { label: 'Settings', href: '/admin/settings', icon: Settings },
            ]
        }
    ];

export const SidebarNav: React.FC = () => {
    const pathname = usePathname();

    return (
        <nav className="flex flex-1 flex-col py-4">
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
                                            href={item.isPlaceholder ? '#' : item.href}
                                            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all
                                    ${isActive
                                                    ? 'bg-[#FF5C00]/10 text-[#FF5C00]'
                                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                                                }`}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-[#FF5C00]" />
                                            )}
                                            <item.icon className={`h-[18px] w-[18px] transition-colors ${
                                                isActive ? 'text-[#FF5C00]' : 'text-zinc-400 group-hover:text-zinc-600'
                                            }`} />
                                            <span className={`text-[15px] font-medium tracking-tight transition-colors
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
        </nav>
    );
};
