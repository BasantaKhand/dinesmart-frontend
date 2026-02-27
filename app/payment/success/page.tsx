"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, Mail, Clock, RefreshCw, XCircle } from "lucide-react";
import axios from "@/lib/axios";
import Link from "next/link";
import { Navbar } from "@/features/landing/components/navbar";

interface SessionStatus {
    status: string;
    email: string;
    plan: {
        name: string;
        price: number;
        billingCycle: string;
    };
    verifiedAt?: string;
}

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Extract data param - eSewa appends ?data= which may break existing query params
    // So we need to parse it manually from the URL
    const getDataParam = () => {
        if (typeof window === 'undefined') return null;
        const url = window.location.href;
        const dataMatch = url.match(/[?&]data=([^&]+)/);
        return dataMatch ? dataMatch[1] : null;
    };

    const getSessionIdParam = () => {
        // First try from URL params, then from URL path before ?data=
        const fromParams = searchParams.get("sessionId");
        if (fromParams && !fromParams.includes('?')) return fromParams;
        
        if (typeof window === 'undefined') return null;
        const url = window.location.href;
        const sessionMatch = url.match(/sessionId=([a-f0-9]+)/);
        return sessionMatch ? sessionMatch[1] : null;
    };

    useEffect(() => {
        const verifyAndCheckStatus = async () => {
            const data = getDataParam();
            const sessionId = getSessionIdParam();

            if (!data && !sessionId) {
                setError("Invalid payment session");
                setIsLoading(false);
                return;
            }

            try {
                let verifiedSessionId = sessionId;

                // Verify with eSewa if we have the data
                if (data) {
                    setIsVerifying(true);
                    try {
                        const verifyResponse = await axios.post("/checkout/verify", { data });
                        // Get sessionId from verify response
                        if (verifyResponse.data?.data?.sessionId) {
                            verifiedSessionId = verifyResponse.data.data.sessionId;
                        }
                    } catch (verifyErr: any) {
                        console.error("Verification error:", verifyErr.response?.data || verifyErr);
                        // Continue to check status even if verification fails
                    }
                }

                if (!verifiedSessionId) {
                    setError("Could not identify payment session");
                    setIsLoading(false);
                    return;
                }

                // Check session status
                const response = await axios.get(`/checkout/session/${verifiedSessionId}`);
                setSessionStatus(response.data.data);
            } catch (err: any) {
                console.error("Payment verification error:", err);
                setError(err.response?.data?.message || "Payment verification failed");
            } finally {
                setIsVerifying(false);
                setIsLoading(false);
            }
        };

        verifyAndCheckStatus();
    }, [searchParams]);

    if (isLoading || isVerifying) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-[#FF5C00] mx-auto" />
                        <p className="mt-4 text-lg font-medium text-zinc-600">
                            {isVerifying ? "Verifying payment..." : "Loading..."}
                        </p>
                    </div>
                </div>
            </>
        );
    }

    if (error || !sessionStatus) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl ring-1 ring-zinc-200 p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="mt-6 text-2xl font-bold text-zinc-900">Verification Failed</h1>
                        <p className="mt-2 text-zinc-600">{error || "Something went wrong"}</p>
                        <Link
                            href="/auth/signup"
                            className="mt-6 inline-block rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
                        >
                            Try Again
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    // Payment verified successfully
    if (sessionStatus.status === 'VERIFIED' || sessionStatus.status === 'ACTIVATED') {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl ring-1 ring-zinc-200 p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                        </div>

                        <h1 className="mt-6 text-2xl font-bold text-zinc-900">Payment Verified!</h1>

                    <p className="mt-2 text-zinc-600">
                        Your payment for the <strong>{sessionStatus.plan?.name}</strong> plan has been verified.
                    </p>

                    <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-left">
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-emerald-900">What happens next?</p>
                                <p className="mt-1 text-sm text-emerald-700">
                                    Our team will review your payment and send an activation link to <strong>{sessionStatus.email}</strong> within 24 hours.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-xl bg-zinc-50 p-4">
                        <div className="flex items-center gap-3 text-left">
                            <Mail className="h-5 w-5 text-zinc-500 shrink-0" />
                            <div className="text-sm">
                                <p className="text-zinc-600">Activation link will be sent to:</p>
                                <p className="font-medium text-zinc-900">{sessionStatus.email}</p>
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-zinc-500">
                        Didn&apos;t receive the email? Check your spam folder or contact support.
                    </p>
                </div>
            </div>
            </>
        );
    }

    // Fallback for other statuses
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl ring-1 ring-zinc-200 p-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                        <Clock className="h-8 w-8 text-amber-600" />
                    </div>
                    <h1 className="mt-6 text-2xl font-bold text-zinc-900">Payment Processing</h1>
                    <p className="mt-2 text-zinc-600">
                        Your payment is being processed. Status: {sessionStatus.status}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh Status
                    </button>
                </div>
            </div>
        </>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <>
                <Navbar />
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#FF5C00]" />
                </div>
            </>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
