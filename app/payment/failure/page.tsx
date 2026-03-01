"use client";

import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/features/landing/components/navbar";

function PaymentFailureContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl ring-1 ring-zinc-200 p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
                    <XCircle className="h-8 w-8 text-rose-600" />
                </div>

                <h1 className="mt-6 text-2xl font-bold text-zinc-900">Payment Failed</h1>

                <p className="mt-2 text-zinc-600">
                    Your payment could not be processed. This could be due to insufficient balance, 
                    cancelled transaction, or a network error.
                </p>

                <div className="mt-6 space-y-3">
                    <Link
                        href="/auth/signup"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5C00] px-6 py-3 text-sm font-semibold text-white hover:bg-[#e65300] transition-colors"
                    >
                        Try Again
                    </Link>

                    <Link
                        href="/"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-left">
                    <p className="text-sm font-medium text-amber-800">Need help?</p>
                    <p className="mt-1 text-sm text-amber-700">
                        Contact our support team at{" "}
                        <a href="mailto:support@dinesmart.com" className="font-medium underline">
                            support@dinesmart.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
        </>
    );
}

export default function PaymentFailurePage() {
    return (
        <Suspense fallback={
            <>
                <Navbar />
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#FF5C00]" />
                </div>
            </>
        }>
            <PaymentFailureContent />
        </Suspense>
    );
}
