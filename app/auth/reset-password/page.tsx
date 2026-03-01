"use client";

import { Suspense } from "react";
import { ResetPasswordPage } from "@/features/auth/components/reset-password-page";

function ResetPasswordContent() {
    return <ResetPasswordPage />;
}

export default function ResetPasswordRoute() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-sm font-medium text-zinc-500">Loading...</div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
