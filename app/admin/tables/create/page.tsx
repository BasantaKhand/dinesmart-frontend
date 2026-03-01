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
        <div className="max-w-2xl space-y-6 pb-12">
            <Link href="/admin/tables" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Tables
            </Link>

            <div>
                <h2 className="text-[26px] font-extrabold tracking-tight leading-tight text-zinc-800">Add New Table</h2>
                <p className="mt-1 text-[14px] font-normal text-zinc-400">Expand your restaurant capacity by adding more tables.</p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-none ring-1 ring-zinc-300">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700">Table Number</label>
                            <div className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-500 flex items-center">
                                Auto-assigned by system
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700">Seat Capacity</label>
                            <input
                                type="number"
                                placeholder="4"
                                required
                                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link
                            href="/admin/tables"
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-[#FF5C00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e65300] disabled:opacity-70"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Table'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
