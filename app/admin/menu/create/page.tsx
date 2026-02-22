"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateMenuItemPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            router.push('/admin/menu');
        }, 1000);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <Link href="/admin/menu" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Menu
            </Link>

            <div>
                <h2 className="text-2xl font-bold text-zinc-900">Add New Item</h2>
                <p className="text-sm text-zinc-500">Create a new dish or beverage for your menu.</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-200">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Item Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Chicken Biryani"
                            required
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Category</label>
                            <select className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF5C00]/40">
                                <option>Appetizers</option>
                                <option>Main Course</option>
                                <option>Beverages</option>
                                <option>Desserts</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Price (Rs.)</label>
                            <input
                                type="number"
                                placeholder="450"
                                required
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="available"
                            defaultChecked
                            className="h-4 w-4 rounded border-zinc-300 text-[#FF5C00] focus:ring-[#FF5C00]/40"
                        />
                        <label htmlFor="available" className="text-sm font-medium text-zinc-700">Available for Order</label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link
                            href="/admin/menu"
                            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-[#FF5C00] px-4 py-2 text-sm font-medium text-white hover:bg-[#e65300] disabled:opacity-70"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Menu Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
