import React from 'react';
import { Sidebar } from '@/features/admin/components/layout/sidebar';
import { Topbar } from '@/features/admin/components/layout/topbar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-white font-dm-sans">
            <Sidebar />
            <div className="flex flex-1 flex-col lg:pl-64">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white">
                    {children}
                </main>
            </div>
        </div>
    );
}
