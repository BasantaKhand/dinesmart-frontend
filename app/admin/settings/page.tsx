"use client";

import React, { useEffect, useState } from 'react';
import { CreditCard, Save } from 'lucide-react';
import { Modal } from '@/features/admin/components/ui/modal';
import { apiGetPaymentSettings, apiUpdatePaymentSettings, PaymentSettings } from '@/features/admin/services/restaurant-service';

const defaultSettings: PaymentSettings = {
    provider: 'MANUAL',
    qrCodeUrl: '',
    accountName: '',
    accountId: '',
    notes: '',
};

export default function SettingsPage() {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultSettings);
    const [restaurantName, setRestaurantName] = useState('');
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [isPaymentSaving, setIsPaymentSaving] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

    const loadPaymentSettings = async () => {
        setIsPaymentLoading(true);
        setPaymentMessage(null);
        try {
            const res = await apiGetPaymentSettings();
            setRestaurantName(res.data.restaurantName || '');
            setPaymentSettings({ ...defaultSettings, ...(res.data.paymentSettings || {}) });
        } catch (error: any) {
            setPaymentMessage(error?.response?.data?.message || 'Failed to load payment settings.');
        } finally {
            setIsPaymentLoading(false);
        }
    };

    const handlePaymentSave = async () => {
        setIsPaymentSaving(true);
        setPaymentMessage(null);
        try {
            const res = await apiUpdatePaymentSettings(paymentSettings);
            setRestaurantName(res.data.restaurantName || restaurantName);
            setPaymentSettings({ ...defaultSettings, ...(res.data.paymentSettings || {}) });
            setPaymentMessage('Payment settings updated successfully.');
        } catch (error: any) {
            setPaymentMessage(error?.response?.data?.message || 'Failed to update payment settings.');
        } finally {
            setIsPaymentSaving(false);
        }
    };

    useEffect(() => {
        if (isPaymentModalOpen) {
            loadPaymentSettings();
        }
    }, [isPaymentModalOpen]);

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-[26px] font-extrabold tracking-tight leading-tight text-zinc-800">Settings</h1>
                <p className="mt-1 text-[14px] font-normal text-zinc-400">Manage restaurant profile, owner details, and payments.</p>
            </div>

            <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-300 shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">Payment Settings</h2>
                        <p className="mt-1 text-sm text-zinc-500">Manage gateways, payout accounts, and billing preferences.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#FF5C00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e65300] transition-all"
                    >
                        <CreditCard size={16} />
                        Open Payments
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-300 shadow-none">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-zinc-900">Restaurant Details</h2>
                        <p className="mt-1 text-sm text-zinc-500">Keep your venue profile up to date.</p>
                    </div>
                    <form className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Restaurant Name</label>
                            <input
                                type="text"
                                placeholder="DineSmart Central"
                                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Address</label>
                            <input
                                type="text"
                                placeholder="Lazimpat, Kathmandu"
                                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Phone</label>
                                <input
                                    type="tel"
                                    placeholder="+977-98XXXXXXXX"
                                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Support Email</label>
                                <input
                                    type="email"
                                    placeholder="support@dinesmart.com"
                                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#FF5C00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e65300] transition-all"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    </form>
                </div>

                <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-300 shadow-none">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-zinc-900">Owner Profile</h2>
                        <p className="mt-1 text-sm text-zinc-500">Update owner contact and access details.</p>
                    </div>
                    <form className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Owner Name</label>
                            <input
                                type="text"
                                placeholder="Restaurant Owner"
                                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Owner Email</label>
                            <input
                                type="email"
                                placeholder="owner@dinesmart.com"
                                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                            />
                        </div>
                        <button
                            type="button"
                            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-all"
                        >
                            Update Profile
                        </button>
                    </form>
                </div>
            </div>

            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Payment Settings"
                maxWidthClass="max-w-2xl"
            >
                <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-zinc-900">Configure how you accept payments</h3>
                        <p className="mt-1 text-sm font-medium text-zinc-500">These settings appear on cashier screens and receipts.</p>
                    </div>

                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">Restaurant</p>
                        <p className="mt-1 text-[15px] font-semibold text-zinc-900">{restaurantName || 'Active Restaurant'}</p>
                    </div>

                    {paymentMessage && (
                        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
                            {paymentMessage}
                        </div>
                    )}

                    <div className="border-t border-zinc-200 pt-5">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">Gateway</h4>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-zinc-500">Provider</label>
                                <select
                                    value={paymentSettings.provider}
                                    onChange={(event) => setPaymentSettings((prev) => ({
                                        ...prev,
                                        provider: event.target.value as PaymentSettings['provider'],
                                    }))}
                                    className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 focus:border-zinc-300 outline-none"
                                    disabled={isPaymentLoading}
                                >
                                    <option value="MANUAL">Manual</option>
                                    <option value="ESEWA">eSewa</option>
                                    <option value="STRIPE">Stripe</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-500">QR Code Image URL</label>
                                <input
                                    type="text"
                                    value={paymentSettings.qrCodeUrl || ''}
                                    onChange={(event) => setPaymentSettings((prev) => ({ ...prev, qrCodeUrl: event.target.value }))}
                                    placeholder="https://..."
                                    className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 focus:border-zinc-300 outline-none"
                                    disabled={isPaymentLoading}
                                />
                                <p className="mt-2 text-xs text-zinc-400">Upload the QR image to a public URL and paste it here.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-200 pt-5">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">Account Details</h4>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-semibold text-zinc-500">Account Name</label>
                                <input
                                    type="text"
                                    value={paymentSettings.accountName || ''}
                                    onChange={(event) => setPaymentSettings((prev) => ({ ...prev, accountName: event.target.value }))}
                                    className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 focus:border-zinc-300 outline-none"
                                    disabled={isPaymentLoading}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-zinc-500">Account ID</label>
                                <input
                                    type="text"
                                    value={paymentSettings.accountId || ''}
                                    onChange={(event) => setPaymentSettings((prev) => ({ ...prev, accountId: event.target.value }))}
                                    className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 focus:border-zinc-300 outline-none"
                                    disabled={isPaymentLoading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-200 pt-5">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">Notes</h4>
                        <textarea
                            rows={3}
                            value={paymentSettings.notes || ''}
                            onChange={(event) => setPaymentSettings((prev) => ({ ...prev, notes: event.target.value }))}
                            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 focus:border-zinc-300 outline-none"
                            disabled={isPaymentLoading}
                        />
                    </div>

                    <button
                        onClick={handlePaymentSave}
                        disabled={isPaymentSaving || isPaymentLoading}
                        className="h-11 w-full rounded-lg bg-[#FF5C00] text-white text-sm font-bold hover:bg-[#e65300] disabled:opacity-60"
                    >
                        {isPaymentSaving ? 'Saving...' : 'Save Payment Settings'}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
