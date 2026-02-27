import React from 'react';
import { SuperadminSidebar } from '@/features/superadmin/components/layout/superadmin-sidebar';
import { SuperadminTopbar } from '@/features/superadmin/components/layout/superadmin-topbar';

export default function SuperadminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full bg-white font-dm-sans">
            <SuperadminSidebar />
            <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
                <SuperadminTopbar />
                <main className="min-w-0 flex-1 overflow-x-auto overflow-y-auto bg-white p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
