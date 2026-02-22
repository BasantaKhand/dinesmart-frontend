"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateTablePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            router.push('/admin/tables');
        }, 1000);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <Link href="/admin/tables" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Tables
            </Link>

            <div>
                <h2 className="text-2xl font-bold text-zinc-900">Add New Table</h2>
                <p className="text-sm text-zinc-500">Expand your restaurant capacity by adding more tables.</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-200">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Table Number / Label</label>
                            <input
                                type="text"
                                placeholder="e.g. T-12"
                                required
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Seat Capacity</label>
                            <input
                                type="number"
                                placeholder="4"
                                required
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link
                            href="/admin/tables"
                            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-[#FF5C00] px-4 py-2 text-sm font-medium text-white hover:bg-[#e65300] disabled:opacity-70"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Table'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
