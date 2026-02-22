"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CashierLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || (user.role !== "CASHIER" && user.role !== "RESTAURANT_ADMIN" && user.role !== "SUPERADMIN"))) {
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

    return (
        <div className="min-h-screen bg-white font-dm-sans">
            {children}
        </div>
    );
}
