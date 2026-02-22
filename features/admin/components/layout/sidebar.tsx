"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { SidebarNav } from './sidebar-nav';
import { Menu, X } from 'lucide-react';

export const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-sm border border-zinc-200 lg:hidden"
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

            {/* Sidebar Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-100 bg-white transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex h-16 items-center border-b border-zinc-100 px-5">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-[#FF5C00] rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight text-zinc-900 leading-none">DineSmart</span>
                            <span className="text-[9px] font-semibold tracking-wider text-zinc-400 uppercase">Admin Panel</span>
                        </div>
                    </Link>
                </div>

                <SidebarNav />
            </aside>
        </>
    );
};
