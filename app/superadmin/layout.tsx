"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SuperadminSidebar } from '@/features/superadmin/components/layout/superadmin-sidebar';
import { SuperadminTopbar } from '@/features/superadmin/components/layout/superadmin-topbar';
import { AccessDenied } from '@/features/admin/components/ui/access-denied';

const ALLOWED_ROLES = ['SUPERADMIN'];

export default function SuperadminLayout({
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
