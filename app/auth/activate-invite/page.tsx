"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { useValidateInvite, useActivateInvite } from '@/hooks/useContact';

interface LeadInfo {
    fullName: string;
    email: string;
    restaurantName: string;
    phone: string;
}

export default function ActivateInvitePage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const { data: validateData, isLoading: loading, error: validateError } = useValidateInvite(token);
    const activateInviteMutation = useActivateInvite();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const lead = validateData?.data?.lead || null;

    useEffect(() => {
        if (!token) {
            setError('Invite token is missing.');
        }
    }, [token]);

    useEffect(() => {
        if (validateError) {
            setError((validateError as any)?.response?.data?.message || 'Invite is invalid or expired.');
        }
    }, [validateError]);

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
        restaurantAddress: '',
        restaurantPhone: '',
        cuisineType: '',
        numberOfTables: '',
    });

    const isCompactState = loading || success || (Boolean(error) && !lead);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!formData.restaurantAddress.trim()) {
            setError('Restaurant address is required.');
            return;
        }

        try {
            await activateInviteMutation.mutateAsync({
                token,
                password: formData.password,
                restaurantAddress: formData.restaurantAddress,
                restaurantPhone: formData.restaurantPhone || undefined,
                cuisineType: formData.cuisineType || undefined,
                numberOfTables: formData.numberOfTables ? Number(formData.numberOfTables) : undefined,
            });

            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to activate account.');
        }
    };

    // Modern onboarding form with card layout and eye toggles for password fields
    // ...existing code...
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="min-h-screen bg-white font-dm-sans flex flex-col">
            <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
                <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-6">
                    <a href="/" className="flex items-center gap-2">
                        <img src="/logo.svg" alt="DineSmart RMS" className="h-8 w-auto" />
                        <span className="text-xl font-extrabold tracking-tight text-zinc-900">DineSmart RMS</span>
                    </a>
                    <a href="/#contact" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Need Help?</a>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-2 py-8 bg-zinc-50">
                <div className="w-full max-w-lg">
                    <div className="rounded-2xl bg-white shadow ring-1 ring-zinc-200 px-8 py-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00]" />
                                <p className="mt-3 text-base font-medium text-zinc-500">Validating invite...</p>
                            </div>
                        ) : success ? (
                            <div className="flex justify-center items-center min-h-[60vh]">
                                <div className="w-full max-w-xl rounded-2xl bg-white shadow-lg ring-1 ring-zinc-200 px-10 py-12 flex flex-col items-center text-center">
                                    <span className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-4">
                                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                                    </span>
                                    <h1 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight">Account Activated</h1>
                                    <p className="text-lg text-zinc-600 mb-6 max-w-md">
                                        Your onboarding is complete.<br />You can now log in and start using <span className="font-semibold text-zinc-900">DineSmart</span>.
                                    </p>
                                    <Link
                                        href="/auth/login"
                                        className="inline-flex items-center justify-center rounded-lg bg-[#FF5C00] px-8 py-3 text-lg font-bold text-white shadow transition-colors hover:bg-[#e65300] focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/40 focus:ring-offset-2"
                                    >
                                        Go to Login
                                    </Link>
                                </div>
                            </div>
                        ) : error && !lead ? (
                            <div className="py-8 text-center">
                                <div className="relative mx-auto h-20 w-32 mb-4">
                                    <img
                                        src="/empty-state-400.png?v=2"
                                        alt="Invite unavailable"
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                <h1 className="text-2xl font-extrabold tracking-tight text-rose-600">Activation Failed</h1>
                                <p className="mx-auto mt-2 max-w-md text-base text-zinc-600">
                                    {error || 'This invitation link is no longer valid. It may have expired or already been used.'}
                                </p>

                                <div className="mx-auto mt-8 w-fit">
                                    <div className="inline-flex items-center justify-center gap-3">
                                        <a
                                            href="/#contact"
                                            className="inline-flex whitespace-nowrap rounded-lg bg-[#FF5C00] px-6 py-2 text-base font-semibold text-white transition-colors hover:bg-[#e65300]"
                                        >
                                            Request New Invite
                                        </a>
                                        <Link
                                            href="/auth/login"
                                            className="inline-flex whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-6 py-2 text-base font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
                                        >
                                            Back to Login
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-extrabold text-zinc-900">Complete Onboarding</h1>
                                <p className="mt-2 text-base text-zinc-500">Set your password and finish restaurant setup.</p>

                                {lead && (
                                    <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-base flex flex-col gap-1">
                                        <span className="font-semibold text-zinc-800">{lead.restaurantName}</span>
                                        <span className="text-zinc-600">Owner: {lead.fullName}</span>
                                        <span className="text-zinc-600">Email: {lead.email}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                                        <div className="flex-1">
                                            <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 mb-2">Password</label>
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                    className="block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-base outline-none focus:border-[#FF5C00] pr-12"
                                                    placeholder="At least 6 characters"
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                                                    onClick={() => setShowPassword((v) => !v)}
                                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-zinc-700 mb-2">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    required
                                                    className="block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-base outline-none focus:border-[#FF5C00] pr-12"
                                                    placeholder="Re-enter password"
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                                        <div className="flex-1">
                                            <label htmlFor="restaurantAddress" className="block text-sm font-semibold text-zinc-700 mb-2">Restaurant Address</label>
                                            <input
                                                id="restaurantAddress"
                                                name="restaurantAddress"
                                                type="text"
                                                value={formData.restaurantAddress}
                                                onChange={handleChange}
                                                required
                                                className="block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-base outline-none focus:border-[#FF5C00]"
                                                placeholder="Street, city"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="restaurantPhone" className="block text-sm font-semibold text-zinc-700 mb-2">Restaurant Phone <span className="text-zinc-400">(optional)</span></label>
                                            <input
                                                id="restaurantPhone"
                                                name="restaurantPhone"
                                                type="text"
                                                value={formData.restaurantPhone}
                                                onChange={handleChange}
                                                className="block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-base outline-none focus:border-[#FF5C00]"
                                                placeholder="+1 555 000 0000"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                                        <div className="flex-1">
                                            <label htmlFor="cuisineType" className="block text-sm font-semibold text-zinc-700 mb-2">Cuisine Type <span className="text-zinc-400">(optional)</span></label>
                                            <input
                                                id="cuisineType"
                                                name="cuisineType"
                                                type="text"
                                                value={formData.cuisineType}
                                                onChange={handleChange}
                                                className="block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-base outline-none focus:border-[#FF5C00]"
                                                placeholder="Multi-cuisine"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="numberOfTables" className="block text-sm font-semibold text-zinc-700 mb-2">Number of Tables <span className="text-zinc-400">(optional)</span></label>
                                            <input
                                                id="numberOfTables"
                                                name="numberOfTables"
                                                type="number"
                                                min={1}
                                                value={formData.numberOfTables}
                                                onChange={handleChange}
                                                className="block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-base outline-none focus:border-[#FF5C00]"
                                                placeholder="20"
                                            />
                                        </div>
                                    </div>

                                    {error && <p className="text-base font-medium text-red-600 mt-2">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={activateInviteMutation.isPending}
                                        className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#FF5C00] px-6 py-2.5 text-base font-semibold text-white hover:bg-[#e65300] disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
                                    >
                                        {activateInviteMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Activate Account'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
