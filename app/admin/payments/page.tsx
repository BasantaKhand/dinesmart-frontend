"use client";

import React, { useEffect, useState } from 'react';
import { apiGetPaymentSettings, apiUpdatePaymentSettings, PaymentSettings } from '@/features/admin/services/restaurant-service';

const defaultSettings: PaymentSettings = {
    provider: 'MANUAL',
    qrCodeUrl: '',
    accountName: '',
    accountId: '',
    notes: ''
};

export default function PaymentSettingsPage() {
    const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
    const [restaurantName, setRestaurantName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await apiGetPaymentSettings();
                setRestaurantName(res.data.restaurantName || '');
                setSettings({ ...defaultSettings, ...(res.data.paymentSettings || {}) });
            } catch (error: any) {
                setMessage(error?.response?.data?.message || 'Failed to load payment settings.');
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await apiUpdatePaymentSettings(settings);
            setRestaurantName(res.data.restaurantName || restaurantName);
            setSettings({ ...defaultSettings, ...(res.data.paymentSettings || {}) });
            setMessage('Payment settings updated successfully.');
        } catch (error: any) {
            setMessage(error?.response?.data?.message || 'Failed to update payment settings.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Payment Settings</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Configure the QR code and bank details shown on the cashier screen.
                </p>
            </div>

            {message && (
                <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
                    {message}
                </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4 max-w-2xl">
                <div>
                    <p className="text-xs font-semibold text-zinc-500">Restaurant</p>
                    <p className="text-sm font-bold text-zinc-900">{restaurantName || 'Active Restaurant'}</p>
                </div>

                <div>
                    <label className="text-xs font-semibold text-zinc-500">Provider</label>
                    <select
                        value={settings.provider}
                        onChange={(event) => setSettings((prev) => ({ ...prev, provider: event.target.value as PaymentSettings['provider'] }))}
                        className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700 focus:bg-white focus:border-zinc-300 outline-none"
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
                        value={settings.qrCodeUrl || ''}
                        onChange={(event) => setSettings((prev) => ({ ...prev, qrCodeUrl: event.target.value }))}
                        placeholder="https://..."
                        className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700 focus:bg-white focus:border-zinc-300 outline-none"
                    />
                    <p className="text-xs text-zinc-400 mt-2">Upload the QR image to a public URL and paste it here.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-zinc-500">Account Name</label>
                        <input
                            type="text"
                            value={settings.accountName || ''}
                            onChange={(event) => setSettings((prev) => ({ ...prev, accountName: event.target.value }))}
                            className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700 focus:bg-white focus:border-zinc-300 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-zinc-500">Account ID</label>
                        <input
                            type="text"
                            value={settings.accountId || ''}
                            onChange={(event) => setSettings((prev) => ({ ...prev, accountId: event.target.value }))}
                            className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700 focus:bg-white focus:border-zinc-300 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-zinc-500">Notes</label>
                    <textarea
                        rows={3}
                        value={settings.notes || ''}
                        onChange={(event) => setSettings((prev) => ({ ...prev, notes: event.target.value }))}
                        className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 focus:bg-white focus:border-zinc-300 outline-none"
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className="h-11 w-full rounded-lg bg-[#FF5C00] text-white text-sm font-bold hover:bg-[#e65300] disabled:opacity-60"
                >
                    {isSaving ? 'Saving...' : 'Save Payment Settings'}
                </button>
            </div>
        </div>
    );
}
