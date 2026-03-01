"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PaymentRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to signup page
        router.replace("/auth/signup");
    }, [router]);

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00] mx-auto" />
                <p className="mt-4 text-zinc-600">Redirecting...</p>
            </div>
        </div>
    );
}
