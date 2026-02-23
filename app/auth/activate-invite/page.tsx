"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import axios from '@/lib/axios';

interface LeadInfo {
    fullName: string;
    email: string;
    restaurantName: string;
    phone: string;
}

export default function ActivateInvitePage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [lead, setLead] = useState<LeadInfo | null>(null);

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
        restaurantAddress: '',
        restaurantPhone: '',
        cuisineType: '',
        numberOfTables: '',
    });

    const isCompactState = loading || success || (Boolean(error) && !lead);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError('Invite token is missing.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('/contact/invite/validate', {
                    params: { token },
                });
                setLead(response.data.data.lead);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Invite is invalid or expired.');
            } finally {
                setLoading(false);
            }
        };

        validateToken();
    }, [token]);

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
            setSubmitting(true);
            await axios.post('/contact/invite/activate', {
                token,
                password: formData.password,
                restaurantAddress: formData.restaurantAddress,
                restaurantPhone: formData.restaurantPhone,
                cuisineType: formData.cuisineType,
                numberOfTables: formData.numberOfTables ? Number(formData.numberOfTables) : undefined,
            });

            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to activate account.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-white font-dm-sans flex flex-col">
            <header className="border-b border-zinc-200">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <a href="/" className="flex items-center gap-2">
                        <img src="/logo.svg" alt="DineSmart RMS" className="h-7 w-auto sm:h-8" />
                        <span className="text-xl sm:text-2xl lg:text-xl font-bold tracking-wide text-zinc-900">DineSmart RMS</span>
                    </a>
                    <a href="/#contact" className="text-sm lg:text-base font-medium text-zinc-700 hover:text-zinc-900 transition-colors duration-200">
                        Need Help?
                    </a>
                </div>
            </header>

            <div className={`flex-1 overflow-y-auto px-2 py-4 sm:py-5 md:flex md:justify-center ${isCompactState ? 'md:items-center' : 'md:items-start'}`}>
            <div className="mx-auto w-full max-w-md rounded-2xl bg-white px-3 py-4 sm:px-3 sm:py-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-9 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#FF5C00]" />
                        <p className="mt-2 text-sm font-medium text-zinc-500">Validating invite...</p>
                    </div>
                ) : success ? (
                    <div className="py-6 text-center">
                        <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-600" />
                        <h1 className="mt-3 text-2xl font-bold text-zinc-900">Account activated</h1>
                        <p className="mt-1.5 text-sm text-zinc-600">
                            Your onboarding is complete. You can now log in and start using DineSmart.
                        </p>
                        <Link
                            href="/auth/login"
                            className="mt-5 inline-flex rounded-lg bg-[#FF5C00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e65300]"
                        >
                            Go to Login
                        </Link>
                    </div>
                ) : error && !lead ? (
                    <div className="py-3 text-center">
                        <div className="relative mx-auto h-18 w-32 mb-4">
                            <img
                                src="/empty-state-400.png?v=2"
                                alt="Invite unavailable"
                                className="h-full w-full"
                            />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Invitation Link Unavailable</h1>
                        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600">
                            This invitation link is no longer valid. It may have expired or already been used.
                        </p>

                        <div className="mx-auto mt-[26px] w-fit">
                            <div className="inline-flex items-center justify-center gap-[10px]">
                                <a
                                    href="/#contact"
                                    className="inline-flex whitespace-nowrap rounded-lg bg-[#FF5C00] px-5 py-2 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[#e65300]"
                                >
                                    Request New Invite
                                </a>
                                <Link
                                    href="/auth/login"
                                    className="inline-flex whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-5 py-2 text-[15px] font-medium text-zinc-800 transition-colors duration-200 hover:bg-zinc-50"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-zinc-900">Complete onboarding</h1>
                        <p className="mt-1 text-sm text-zinc-500">Set your password and finish restaurant setup.</p>

                        {lead && (
                            <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
                                <p className="font-semibold text-zinc-800">{lead.restaurantName}</p>
                                <p className="text-zinc-600">Owner: {lead.fullName}</p>
                                <p className="text-zinc-600">Email: {lead.email}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-zinc-700">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#FF5C00]"
                                    placeholder="At least 6 characters"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-zinc-700">Confirm password</label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#FF5C00]"
                                    placeholder="Re-enter password"
                                />
                            </div>

                            <div>
                                <label htmlFor="restaurantAddress" className="block text-sm font-semibold text-zinc-700">Restaurant address</label>
                                <input
                                    id="restaurantAddress"
                                    name="restaurantAddress"
                                    type="text"
                                    value={formData.restaurantAddress}
                                    onChange={handleChange}
                                    required
                                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#FF5C00]"
                                    placeholder="Street, city"
                                />
                            </div>

                            <div>
                                <label htmlFor="restaurantPhone" className="block text-sm font-semibold text-zinc-700">Restaurant phone (optional)</label>
                                <input
                                    id="restaurantPhone"
                                    name="restaurantPhone"
                                    type="text"
                                    value={formData.restaurantPhone}
                                    onChange={handleChange}
                                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#FF5C00]"
                                    placeholder="+1 555 000 0000"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="cuisineType" className="block text-sm font-semibold text-zinc-700">Cuisine type (optional)</label>
                                    <input
                                        id="cuisineType"
                                        name="cuisineType"
                                        type="text"
                                        value={formData.cuisineType}
                                        onChange={handleChange}
                                        className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#FF5C00]"
                                        placeholder="Multi-cuisine"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="numberOfTables" className="block text-sm font-semibold text-zinc-700">Number of tables (optional)</label>
                                    <input
                                        id="numberOfTables"
                                        name="numberOfTables"
                                        type="number"
                                        min={1}
                                        value={formData.numberOfTables}
                                        onChange={handleChange}
                                        className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#FF5C00]"
                                        placeholder="20"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex w-full items-center justify-center rounded-lg bg-[#FF5C00] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e65300] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activate account'}
                            </button>
                        </form>
                    </>
                )}
            </div>
            </div>
        </div>
    );
}
