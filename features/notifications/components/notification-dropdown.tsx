import React, { useRef, useState, useEffect } from 'react';
import { Bell, Check, Trash2, X, CheckCheck } from 'lucide-react';
import { useSocket } from '@/providers/socket-provider';
import { useRouter } from 'next/navigation';

export const NotificationDropdown: React.FC = () => {
    const { notifications, totalUnread, markAsRead, markAllAsRead, clearNotifications } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = async (id: string, actionUrl?: string) => {
        await markAsRead(id);
        if (actionUrl) {
            router.push(actionUrl);
            setIsOpen(false);
        }
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

    if (!mounted) {
        return (
            <div className="relative">
                <button
                    className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-900 hover:text-zinc-900 transition-colors"
                    aria-label="Notifications"
                >
                    <Bell size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-900 hover:text-zinc-900 transition-colors"
                aria-label="Notifications"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <Bell size={18} />
                {totalUnread > 0 && (
                    <div className="absolute top-2 right-2 h-2 w-2 bg-[#FF5C00] border-2 border-white rounded-full" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-11 z-50 w-[min(92vw,380px)] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg" role="menu" aria-label="Notifications dropdown">
                    <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                        <p className="text-[15px] font-semibold text-zinc-900">Notifications</p>
                        <div className="flex items-center gap-2">
                             {totalUnread > 0 && (
                                <span className="rounded-full bg-[#FF5C00]/10 px-2 py-0.5 text-xs font-medium text-[#FF5C00]">
                                    {totalUnread} new
                                </span>
                            )}
                            <button
                                onClick={async () => {
                                    await markAllAsRead();
                                }}
                                className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                                disabled={totalUnread === 0}
                                type="button"
                            >
                                <CheckCheck size={12} />
                            </button>
                             <button
                                onClick={() => clearNotifications()}
                                className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-red-500 disabled:opacity-50"
                                disabled={notifications.length === 0}
                                type="button"
                                title="Clear all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>

                    <ul className="max-h-80 overflow-y-auto py-1">
                        {notifications.length === 0 ? (
                             <li className="flex flex-col items-center justify-center py-8 text-center">
                                <Bell className="h-8 w-8 text-zinc-200 mb-2" />
                                <p className="text-sm text-zinc-500">No notifications yet</p>
                            </li>
                        ) : (
                            <>
                                {notifications.map((notification) => (
                                    <li key={notification._id}>
                                        <div className={`flex items-start gap-2 px-4 py-3 transition-colors hover:bg-zinc-50 ${notification.status === 'UNREAD' ? 'bg-zinc-50' : 'bg-white opacity-70'}`}>
                                            <div
                                                onClick={() => handleNotificationClick(notification._id, notification.actionUrl)}
                                                className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left"
                                            >
                                                {notification.status === 'UNREAD' ? (
                                                    <span className="mt-1 h-2 w-2 rounded-full bg-[#FF5C00]" />
                                                ) : (
                                                    <span className="mt-1 h-2 w-2 rounded-full bg-transparent" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-zinc-900">{notification.title}</p>
                                                    <p className="mt-0.5 line-clamp-2 text-[13px] text-zinc-500">
                                                        {notification.message}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                                        <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 uppercase tracking-wide">
                                                            {notification.type.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="text-xs font-medium text-zinc-400">{formatTime(notification.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {notification.status === 'UNREAD' && (
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await markAsRead(notification._id);
                                                    }}
                                                    className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-emerald-600 transition-colors"
                                                    type="button"
                                                    title="Mark as read"
                                                >
                                                    <Check size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
