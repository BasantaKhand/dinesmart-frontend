"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateStaffPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            router.push('/admin/staff');
        }, 1000);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <Link href="/admin/staff" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Staff List
            </Link>

            <div>
                <h2 className="text-2xl font-bold text-zinc-900">Add New Staff</h2>
                <p className="text-sm text-zinc-500">Create a new account for your restaurant employee.</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-200">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Full Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Ramesh Khatri"
                                required
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Role</label>
                            <select className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF5C00]/40">
                                <option value="WAITER">Waiter</option>
                                <option value="CASHIER">Cashier</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Email Address</label>
                        <input
                            type="email"
                            placeholder="ramesh@dinesmart.com"
                            required
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Initial Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link
                            href="/admin/staff"
                            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-[#FF5C00] px-4 py-2 text-sm font-medium text-white hover:bg-[#e65300] disabled:opacity-70"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Staff Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
