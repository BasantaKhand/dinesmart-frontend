"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useSocket } from '@/providers/socket-provider';
import { Bell, Check, CheckCheck, LogOut } from 'lucide-react';
import ConfirmationDialog from '@/features/admin/components/ui/confirmation-dialog';

export const SuperadminTopbar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { notifications, totalUnread, markAsRead, markAllAsRead } = useSocket();
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
    const [showLogoutConfirmation, setShowLogoutConfirmation] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const notificationDropdownRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleViewAllMessages = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsNotificationsOpen(false);
        router.push('/superadmin/notifications');
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs} hr ago`;
        return `${Math.floor(diffHrs / 24)} day ago`;
    };

    React.useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                notificationDropdownRef.current &&
                !notificationDropdownRef.current.contains(event.target as Node)
            ) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const getBreadcrumb = () => {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length <= 1) return 'Dashboard';
        if (segments[1] === 'contact-messages') return 'Restaurant Applications';
        return segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
    };

    const currentPage = getBreadcrumb();

    return (
        <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center justify-between border-b border-zinc-100 bg-white px-4 pl-14 md:px-6 lg:pl-6">
            {/* Left: Breadcrumb */}
            <div className="min-w-0 flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Superadmin</span>
                <span className="text-xs text-zinc-300">/</span>
                <span className="truncate text-sm font-bold text-zinc-900">{currentPage}</span>
            </div>

            {/* Right: Notification & User Info */}
            <div className="ml-3 flex shrink-0 items-center gap-2 md:gap-3">
                {mounted ? (
                    <div className="relative" ref={notificationDropdownRef}>
                        <button
                            onClick={() => setIsNotificationsOpen((prev) => !prev)}
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-zinc-900 hover:text-zinc-900 transition-colors relative"
                            aria-label="Notifications"
                            aria-expanded={isNotificationsOpen}
                            aria-haspopup="menu"
                        >
                            <Bell size={18} />
                            {totalUnread > 0 && (
                                <div className="absolute top-2 right-2 h-2 w-2 bg-[#FF5C00] border-2 border-white rounded-full" />
                            )}
                        </button>

                        {isNotificationsOpen && (
                            <div className="absolute right-0 top-11 z-50 w-[min(92vw,380px)] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg" role="menu" aria-label="Notifications dropdown">
                                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                                    <p className="text-[15px] font-semibold text-zinc-900">Notifications</p>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-[#FF5C00]/10 px-2 py-0.5 text-xs font-medium text-[#FF5C00]">
                                            {totalUnread} new
                                        </span>
                                        <button
                                            onClick={async () => {
                                                await markAllAsRead();
                                            }}
                                            className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                                            disabled={totalUnread === 0}
                                            type="button"
                                        >
                                            <CheckCheck size={12} />
                                            Mark all
                                        </button>
                                    </div>
                                </div>

                                <ul className="max-h-80 overflow-y-auto py-1">
                                    {notifications.length === 0 ? (
                                        <li className="px-4 py-8 text-center text-sm text-zinc-500">
                                            No new notifications
                                        </li>
                                    ) : (
                                        <>
                                            {notifications.map((notification) => (
                                                <li key={notification._id}>
                                                    <div className={`flex items-start gap-2 px-4 py-3 transition-colors hover:bg-zinc-50 ${notification.status === 'UNREAD' ? 'bg-zinc-50' : 'bg-white opacity-70'}`}>
                                                        <button
                                                            onClick={() => {
                                                                if (notification.actionUrl) {
                                                                    setIsNotificationsOpen(false);
                                                                    router.push(notification.actionUrl);
                                                                }
                                                            }}
                                                            className="flex min-w-0 flex-1 items-start gap-3 text-left"
                                                            type="button"
                                                        >
                                                            {notification.status === 'UNREAD' ? (
                                                                <span className="mt-1 h-2 w-2 rounded-full bg-[#FF5C00]" />
                                                            ) : (
                                                                <span className="mt-1 h-2 w-2 rounded-full bg-transparent" />
                                                            )}
                                                            <span className="min-w-0 flex-1">
                                                                <p className="text-sm font-semibold text-zinc-900">{notification.title}</p>
                                                                <p className="mt-0.5 line-clamp-2 text-[13px] text-zinc-500">
                                                                    {notification.message}
                                                                </p>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                                                                        {notification.type.replace(/_/g, ' ')}
                                                                    </span>
                                                                    <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${notification.status === 'UNREAD' ? 'bg-[#FF5C00]/10 text-[#FF5C00]' : 'bg-zinc-100 text-zinc-500'}`}>
                                                                        {notification.status}
                                                                    </span>
                                                                    <span className="text-xs font-medium text-zinc-400">{formatTime(notification.createdAt)}</span>
                                                                </div>
                                                            </span>
                                                        </button>
                                                        {notification.status === 'UNREAD' && (
                                                            <button
                                                                onClick={async () => {
                                                                    await markAsRead(notification._id);
                                                                }}
                                                                className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-emerald-600"
                                                                type="button"
                                                                title="Mark as read"
                                                            >
                                                                <Check size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                            <li className="border-t border-zinc-100">
                                                <button
                                                    onClick={(e) => handleViewAllMessages(e)}
                                                    className="w-full px-4 py-3 text-center text-sm font-semibold text-[#FF5C00] hover:bg-zinc-50 hover:underline transition-all"
                                                    type="button"
                                                >
                                                    View All Notifications →
                                                </button>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="relative">
                        <button
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-zinc-900 hover:text-zinc-900 transition-colors relative"
                            aria-label="Notifications"
                        >
                            <Bell size={18} />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-3 pl-3 border-l border-zinc-100">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-zinc-900 leading-tight">{user?.name || 'Superadmin'}</p>
                        <p className="text-xs font-medium text-zinc-500 mt-1">{user?.role?.replace(/_/g, ' ') || 'SUPERADMIN'}</p>
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-[#FF5C00] text-white flex items-center justify-center font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'S'}
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
