"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, User, Building2, MapPin, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import axios from "@/lib/axios";
import Link from "next/link";
import { Navbar } from "@/features/landing/components/navbar";

interface ActivationData {
    email: string;
    phone: string;
    plan: {
        name: string;
        price: number;
        billingCycle: string;
        features: string[];
    };
}

function ActivateContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activationData, setActivationData] = useState<ActivationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form fields
    const [ownerName, setOwnerName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [restaurantName, setRestaurantName] = useState("");
    const [restaurantAddress, setRestaurantAddress] = useState("");

    const token = searchParams.get("token");

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError("Invalid activation link");
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/checkout/activate/${token}`);
                setActivationData(response.data.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Invalid or expired activation link");
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!ownerName.trim()) {
            setError("Please enter your name");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!restaurantName.trim()) {
            setError("Please enter your restaurant name");
            return;
        }
        if (!restaurantAddress.trim()) {
            setError("Please enter your restaurant address");
            return;
        }

        setIsSubmitting(true);

        try {
            await axios.post(`/checkout/activate/${token}`, {
                ownerName: ownerName.trim(),
                password,
                restaurantName: restaurantName.trim(),
                restaurantAddress: restaurantAddress.trim()
            });
            
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Activation failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-[#FF5C00] mx-auto" />
                        <p className="mt-4 text-zinc-600">Validating activation link...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error && !activationData) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl ring-1 ring-zinc-200 p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                            <span className="text-3xl">❌</span>
                        </div>
                        <h1 className="mt-6 text-2xl font-bold text-zinc-900">Invalid Link</h1>
                        <p className="mt-2 text-zinc-600">{error}</p>
                        <Link
                            href="/"
                            className="mt-6 inline-block rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
                        >
                            Go to Home
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    if (success) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl ring-1 ring-zinc-200 p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h1 className="mt-6 text-2xl font-bold text-zinc-900">Account Activated!</h1>
                        <p className="mt-2 text-zinc-600">
                            Your restaurant account is now active. You can login with your email and password.
                        </p>
                        
                        <div className="mt-6 p-4 bg-zinc-50 rounded-xl text-left">
                            <p className="text-sm text-zinc-500">Login email</p>
                            <p className="font-medium text-zinc-900">{activationData?.email}</p>
                        </div>

                        <Link
                            href="/auth/login"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5C00] px-6 py-3 text-sm font-semibold text-white hover:bg-[#e65300] transition-colors"
                        >
                            Go to Login
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-zinc-50 py-8 px-4">
                <div className="max-w-lg mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-zinc-900">Complete Your Registration</h1>
                        <p className="mt-1 text-zinc-600">Set up your account to start using DineSmart</p>
                    </div>

                {/* Plan Info */}
                <div className="bg-emerald-50 rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-emerald-700">Your Plan</p>
                        <p className="font-bold text-emerald-900">{activationData?.plan?.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-emerald-900">NPR {activationData?.plan?.price?.toLocaleString()}</p>
                        <p className="text-sm text-emerald-700">per month</p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl ring-1 ring-zinc-200 p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Owner Info Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                                <User size={16} />
                                Your Information
                            </h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Your Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={ownerName}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] outline-none transition"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Email (cannot be changed)
                                    </label>
                                    <input
                                        type="email"
                                        value={activationData?.email || ""}
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                                <Lock size={16} />
                                Set Your Password
                            </h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min 6 characters"
                                            className="w-full px-4 py-3 pr-10 rounded-xl border border-zinc-200 focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] outline-none transition"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat your password"
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] outline-none transition"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Restaurant Info Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                                <Building2 size={16} />
                                Restaurant Details
                            </h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Restaurant Name
                                    </label>
                                    <input
                                        type="text"
                                        value={restaurantName}
                                        onChange={(e) => setRestaurantName(e.target.value)}
                                        placeholder="My Restaurant"
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] outline-none transition"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Restaurant Address
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-zinc-400" size={18} />
                                        <textarea
                                            value={restaurantAddress}
                                            onChange={(e) => setRestaurantAddress(e.target.value)}
                                            placeholder="Street, City, District"
                                            rows={2}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] outline-none transition resize-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#FF5C00] text-white py-3 rounded-xl font-semibold hover:bg-[#e65300] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Activating...
                                </>
                            ) : (
                                <>
                                    Activate Account
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
}

export default function ActivatePage() {
    return (
        <Suspense fallback={
            <>
                <Navbar />
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#FF5C00]" />
                </div>
            </>
        }>
            <ActivateContent />
        </Suspense>
    );
}
