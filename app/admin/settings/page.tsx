"use client";

import React, { useEffect, useState } from 'react';
import { CreditCard, Save, User, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { Modal } from '@/features/admin/components/ui/modal';
import { useGetPaymentSettings, useUpdatePaymentSettings } from '@/hooks/useRestaurant';
import { useAuth } from '@/providers/auth-provider';
import type { PaymentSettings } from '@/api/restaurant.api';

const defaultSettings: PaymentSettings = {
    provider: 'MANUAL',
    qrCodeUrl: '',
    accountName: '',
    accountId: '',
    notes: '',
};

export default function SettingsPage() {
    const { user, updateProfile } = useAuth();
    const { data: paymentSettingsData, isLoading: isPaymentLoading } = useGetPaymentSettings();
    const updatePaymentSettingsMutation = useUpdatePaymentSettings();
    
    // Payment modal state
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultSettings);
    const [restaurantName, setRestaurantName] = useState('');

    // Update payment settings from query data
    useEffect(() => {
        if (paymentSettingsData?.data) {
            setRestaurantName(paymentSettingsData.data.restaurantName || '');
            setPaymentSettings({ ...defaultSettings, ...(paymentSettingsData.data.paymentSettings || {}) });
        }
    }, [paymentSettingsData]);
    
    // Profile state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);
    


    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const showToast = (type: 'success' | 'error', message: string) => {
        toast[type](message);
    };

    const handlePaymentSave = async () => {
        try {
            const res = await updatePaymentSettingsMutation.mutateAsync(paymentSettings);
            setRestaurantName(res.data.restaurantName || restaurantName);
            setPaymentSettings({ ...defaultSettings, ...(res.data.paymentSettings || {}) });
            toast.success('Payment settings updated successfully.');
            setIsPaymentModalOpen(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update payment settings.');
        }
    };

    const handleProfileSave = async () => {
        if (!name.trim()) {
            showToast('error', 'Name is required');
            return;
        }
        if (!email.trim()) {
            showToast('error', 'Email is required');
            return;
        }

        setIsProfileSaving(true);
        try {
            await updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined });
            showToast('success', 'Profile updated successfully');
        } catch (error: any) {
            showToast('error', error?.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsProfileSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        if (!currentPassword) {
            showToast('error', 'Current password is required');
            return;
        }
        if (!newPassword) {
            showToast('error', 'New password is required');
            return;
        }
        if (newPassword.length < 6) {
            showToast('error', 'New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('error', 'Passwords do not match');
            return;
        }

        setIsPasswordSaving(true);
        try {
            await updateProfile({ currentPassword, newPassword });
            showToast('success', 'Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            showToast('error', error?.response?.data?.message || 'Failed to change password');
        } finally {
            setIsPasswordSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">


            <div>
                <h1 className="text-[26px] font-extrabold tracking-tight leading-tight text-zinc-800">Settings</h1>
                <p className="mt-1 text-[14px] font-normal text-zinc-400">Manage your profile, password, and payment settings.</p>
            </div>

            <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 shadow-none">
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
                {/* Profile Section */}
                <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 shadow-none">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#FF5C00]/10 flex items-center justify-center">
                            <User size={20} className="text-[#FF5C00]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Your Profile</h2>
                            <p className="text-sm text-zinc-500">Update your personal information</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+977-98XXXXXXXX"
                                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleProfileSave}
                            disabled={isProfileSaving}
                            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#FF5C00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e65300] transition-all disabled:opacity-50"
                        >
                            {isProfileSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 shadow-none">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <Lock size={20} className="text-zinc-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Change Password</h2>
                            <p className="text-sm text-zinc-500">Update your account password</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 pr-10 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                >
                                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 pr-10 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handlePasswordSave}
                            disabled={isPasswordSaving}
                            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#FF5C00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e65300] transition-all disabled:opacity-50"
                        >
                            {isPasswordSaving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                            Change Password
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Payment Settings"
                subtitle="Configure how you accept payments from customers"
                maxWidthClass="max-w-lg"
            >
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handlePaymentSave(); }}>
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Payment Provider</label>
                        <select
                            value={paymentSettings.provider}
                            onChange={(event) => setPaymentSettings((prev) => ({
                                ...prev,
                                provider: event.target.value as PaymentSettings['provider'],
                            }))}
                            className="w-full rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-800 border border-zinc-200 outline-none focus:border-zinc-300"
                            disabled={isPaymentLoading}
                        >
                            <option value="MANUAL">Manual Payment</option>
                            <option value="ESEWA">eSewa</option>
                            <option value="STRIPE">Stripe</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">QR Code URL</label>
                        <input
                            type="text"
                            value={paymentSettings.qrCodeUrl || ''}
                            onChange={(event) => setPaymentSettings((prev) => ({ ...prev, qrCodeUrl: event.target.value }))}
                            placeholder="https://example.com/qr-code.png"
                            className="w-full rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-800 border border-zinc-200 outline-none focus:border-zinc-300"
                            disabled={isPaymentLoading}
                        />
                        <p className="text-[11px] text-zinc-400">Upload the QR image to a public URL and paste it here.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Account Name</label>
                            <input
                                type="text"
                                value={paymentSettings.accountName || ''}
                                onChange={(event) => setPaymentSettings((prev) => ({ ...prev, accountName: event.target.value }))}
                                placeholder="John Doe"
                                className="w-full rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-800 border border-zinc-200 outline-none focus:border-zinc-300"
                                disabled={isPaymentLoading}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Account ID</label>
                            <input
                                type="text"
                                value={paymentSettings.accountId || ''}
                                onChange={(event) => setPaymentSettings((prev) => ({ ...prev, accountId: event.target.value }))}
                                placeholder="98XXXXXXXX"
                                className="w-full rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-800 border border-zinc-200 outline-none focus:border-zinc-300"
                                disabled={isPaymentLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Notes</label>
                        <textarea
                            rows={3}
                            value={paymentSettings.notes || ''}
                            onChange={(event) => setPaymentSettings((prev) => ({ ...prev, notes: event.target.value }))}
                            placeholder="Any special payment instructions for cashiers..."
                            className="w-full rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-800 border border-zinc-200 outline-none focus:border-zinc-300 resize-none"
                            disabled={isPaymentLoading}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="flex-1 rounded-lg bg-zinc-100 py-2.5 text-[13px] font-bold text-zinc-600 transition-colors hover:bg-zinc-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updatePaymentSettingsMutation.isPending || isPaymentLoading}
                            className="flex-1 rounded-lg bg-[#FF5C00] py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#e65300] disabled:opacity-50"
                        >
                            {updatePaymentSettingsMutation.isPending ? (
                                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                            ) : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
