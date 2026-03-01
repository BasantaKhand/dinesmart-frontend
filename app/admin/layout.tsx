"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Sidebar } from '@/features/admin/components/layout/sidebar';
import { Topbar } from '@/features/admin/components/layout/topbar';
import { AccessDenied } from '@/features/admin/components/ui/access-denied';

const ALLOWED_ROLES = ['RESTAURANT_ADMIN'];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/auth/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00]" />
            </div>
        );
    }

    if (!user) return null;

    if (!ALLOWED_ROLES.includes(user.role)) {
        return <AccessDenied />;
    }

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
