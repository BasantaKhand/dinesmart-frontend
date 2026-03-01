"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AccessDenied } from "@/features/admin/components/ui/access-denied";

const ALLOWED_ROLES = ["CASHIER"];

export default function CashierLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/auth/login");
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
        <div className="min-h-screen bg-white font-dm-sans">
            {children}
        </div>
    );
}
