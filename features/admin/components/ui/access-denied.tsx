"use client";

import React from "react";
import { ShieldX } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

const roleHomeMap: Record<string, string> = {
    SUPERADMIN: "/superadmin",
    RESTAURANT_ADMIN: "/admin",
    CASHIER: "/cashier",
    WAITER: "/waiter",
};

export function AccessDenied() {
    const { user, logout } = useAuth();
    const homePath = user ? roleHomeMap[user.role] || "/" : "/auth/login";

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <div className="w-full max-w-sm text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100">
                    <ShieldX className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-zinc-900">Access Denied</h1>
                <p className="mt-2 text-sm text-zinc-500">
                    You don&apos;t have permission to view this page.
                    {user && (
                        <> Your role <span className="font-semibold text-zinc-700">{user.role.replace("_", " ")}</span> cannot access this section.</>
                    )}
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                    <a
                        href={homePath}
                        className="rounded-lg bg-[#FF5C00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e65300]"
                    >
                        Go to Dashboard
                    </a>
                    <button
                        onClick={() => logout()}
                        className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
