"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Lock, Save, Loader2, Eye, EyeOff, Utensils } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

export default function WaiterSettingsPage() {
    const { user, updateProfile } = useAuth();
    const router = useRouter();
    
    // Profile form state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    
    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    
    // UI state
    const [isProfileSaving, setIsProfileSaving] = useState(false);
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
        <div className="min-h-screen bg-white">


            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
                <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.push('/waiter')}
                            className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
                        >
                            <ArrowLeft size={18} className="text-zinc-600" />
                        </button>
                        <div className="flex items-center gap-3">
                            <img src="/logo.svg" alt="DineSmart" className="h-10 w-10" />
                            <div>
                                <h1 className="text-lg font-bold text-zinc-900 tracking-tight">DineSmart</h1>
                                <p className="text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">Waiter Panel</p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-bold text-zinc-900">{user?.name || 'User'}</p>
                            <p className="text-xs text-zinc-500">{user?.role?.replace('_', ' ')}</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-[#FF5C00] text-white flex items-center justify-center font-bold text-sm">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto">
                <div className="space-y-8">
                    {/* Page Title */}
                    <div>
                        <h2 className="text-[26px] font-extrabold tracking-tight leading-tight text-zinc-800">Settings</h2>
                        <p className="mt-1 text-[14px] font-normal text-zinc-400">
                            Manage your profile and password.
                        </p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Profile Section */}
                        <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 shadow-none">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-[#FF5C00]/10 flex items-center justify-center">
                                    <User size={20} className="text-[#FF5C00]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900">Your Profile</h3>
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
                                    <h3 className="text-lg font-bold text-zinc-900">Change Password</h3>
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
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
