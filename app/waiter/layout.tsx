"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AccessDenied } from '@/features/admin/components/ui/access-denied';

const ALLOWED_ROLES = ['WAITER'];

export default function WaiterLayout({
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
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00]" />
            </div>
        );
    }

    if (!user) return null;

    if (!ALLOWED_ROLES.includes(user.role)) {
        return <AccessDenied />;
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            {children}
        </div>
    );
}
