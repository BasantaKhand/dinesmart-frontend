"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { LogOut } from 'lucide-react';
import ConfirmationDialog from '@/features/admin/components/ui/confirmation-dialog';
import { NotificationDropdown } from '@/features/notifications/components/notification-dropdown';

export const Topbar: React.FC = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [showLogoutConfirmation, setShowLogoutConfirmation] = React.useState(false);

    const getBreadcrumb = () => {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length <= 1) return 'Dashboard';
        return segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
    };

    const currentPage = getBreadcrumb();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-100 bg-white px-4 md:px-6">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Admin</span>
                <span className="text-xs text-zinc-300">/</span>
                <span className="text-sm font-bold text-zinc-900">{currentPage}</span>
            </div>

            {/* Right: Notification & User Info */}
            <div className="flex items-center gap-2 md:gap-3">
                <NotificationDropdown />

                <div className="flex items-center gap-3 pl-3 border-l border-zinc-100">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-zinc-900 leading-tight">{user?.name || 'Admin'}</p>
                        <p className="text-xs font-medium text-zinc-500 mt-1">{user?.role?.replace(/_/g, ' ') || 'ADMIN'}</p>
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-[#FF5C00] text-white flex items-center justify-center font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <button
                        onClick={() => setShowLogoutConfirmation(true)}
                        className="h-9 w-9 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-500 border border-zinc-100 hover:text-rose-500 hover:border-rose-200 transition-colors"
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogOut size={17} />
                    </button>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={showLogoutConfirmation}
                onClose={() => setShowLogoutConfirmation(false)}
                onConfirm={logout}
                title="Logout"
                message="Are you sure you want to logout? You will need to sign in again to access your account."
                confirmText="Logout"
                cancelText="Cancel"
                variant="warning"
            />
        </header>
    );
};
