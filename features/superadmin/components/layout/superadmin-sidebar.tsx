"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { SuperadminSidebarNav } from './superadmin-sidebar-nav';
import { Menu, X } from 'lucide-react';

export const SuperadminSidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed left-4 top-4 z-50 rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 shadow-none lg:hidden"
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex h-16 min-h-16 max-h-16 shrink-0 items-center border-b border-zinc-100 px-5 overflow-hidden">
                    <Link href="/superadmin" className="flex items-center gap-3">
                        <img src="/logo.svg" alt="DineSmart" className="h-10 w-10" />
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight text-zinc-900 leading-none">DineSmart</span>
                            <span className="mt-0.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase leading-none">Superadmin Panel</span>
                        </div>
                    </Link>
                </div>

                <SuperadminSidebarNav />
            </aside>
        </>
    );
};
