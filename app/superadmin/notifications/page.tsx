"use client";

import { useState } from 'react';
import { Bell, Archive, Trash2, Loader2, Check, CheckCheck } from 'lucide-react';
import ConfirmationDialog from '@/features/admin/components/ui/confirmation-dialog';
import { useSocket } from '@/providers/socket-provider';
import { useGetNotifications, useArchiveNotification, useDeleteNotification } from '@/hooks/useNotifications';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'UNREAD' | 'READ' | 'ARCHIVED';
    actionUrl?: string;
    createdAt: string;
}

export default function NotificationsPage() {
    const { markAsRead, markAllAsRead } = useSocket();
    const { data: notificationsData, isLoading: loading, refetch: reloadNotifications } = useGetNotifications(50);
    const archiveNotificationMutation = useArchiveNotification();
    const deleteNotificationMutation = useDeleteNotification();
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingNotificationId, setDeletingNotificationId] = useState<string | null>(null);

    const notifications: Notification[] = notificationsData?.data?.notifications || [];

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            await reloadNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            await reloadNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleArchive = async (id: string) => {
        try {
            await archiveNotificationMutation.mutateAsync(id);
        } catch (error) {
            console.error('Failed to archive:', error);
        }
    };

    const handleDelete = (id: string) => {
        setDeletingNotificationId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingNotificationId) return;
        try {
            await deleteNotificationMutation.mutateAsync(deletingNotificationId);
        } catch (error) {
            console.error('Failed to delete:', error);
        } finally {
            setIsDeleteDialogOpen(false);
            setDeletingNotificationId(null);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-300';
            case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'LOW': return 'bg-green-100 text-green-700 border-green-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getTypeLabel = (type: string) => {
        return type.replace(/_/g, ' ');
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        const diffDays = Math.floor(diffHrs / 24);
        return `${diffDays}d ago`;
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Notifications</h1>
                    <p className="mt-2 text-sm text-zinc-600">Manage all system notifications and alerts</p>
                </div>
                <button
                    onClick={handleMarkAllAsRead}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    type="button"
                >
                    <CheckCheck size={16} />
                    Mark all as read
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-[#FF5C00]" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center">
                    <Bell size={32} className="mx-auto mb-2 text-zinc-400" />
                    <p className="text-zinc-600">No notifications found</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                                notification.status === 'UNREAD'
                                    ? 'border-[#FF5C00]/20 bg-[#FF5C00]/5'
                                    : 'border-zinc-200 bg-white hover:bg-zinc-50'
                            }`}
                            onClick={async () => {
                                setSelectedNotification(notification);
                                if (notification.status === 'UNREAD') {
                                    await handleMarkAsRead(notification._id);
                                }
                            }}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        <h3 className="font-semibold text-zinc-900">{notification.title}</h3>
                                        <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${getPriorityColor(notification.priority)}`}>
                                            {notification.priority}
                                        </span>
                                        {notification.status === 'UNREAD' && (
                                            <span className="inline-block h-2 w-2 rounded-full bg-[#FF5C00]"></span>
                                        )}
                                    </div>
                                    <p className="line-clamp-2 text-sm text-zinc-600">{notification.message}</p>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                                        <span className="rounded bg-zinc-100 px-2 py-1">{getTypeLabel(notification.type)}</span>
                                        <span>{formatTime(notification.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {notification.status === 'UNREAD' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notification._id);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-emerald-600"
                                            title="Mark as read"
                                        >
                                            <Check size={16} />
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleArchive(notification._id);
                                        }}
                                        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-blue-600"
                                        title="Archive"
                                    >
                                        <Archive size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(notification._id);
                                        }}
                                        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-red-600"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedNotification && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setSelectedNotification(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-xl bg-white shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="border-b border-zinc-200 px-6 py-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <h2 className="text-lg font-bold text-zinc-900">{selectedNotification.title}</h2>
                                    <p className="mt-1 text-sm text-zinc-600">{formatTime(selectedNotification.createdAt)}</p>
                                </div>
                                <span className={`inline-block whitespace-nowrap rounded border px-2 py-1 text-[11px] font-medium ${getPriorityColor(selectedNotification.priority)}`}>
                                    {selectedNotification.priority}
                                </span>
                            </div>
                        </div>

                        <div className="px-6 py-4">
                            <p className="text-sm text-zinc-700">{selectedNotification.message}</p>

                            {selectedNotification.data && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs font-medium uppercase text-zinc-600">Details</p>
                                    <div className="rounded-lg bg-zinc-50 p-3 text-xs">
                                        <pre className="overflow-auto">
                                            {JSON.stringify(selectedNotification.data, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex items-center gap-2">
                                <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                                    {getTypeLabel(selectedNotification.type)}
                                </span>
                                <span className={`rounded px-2 py-1 text-xs font-medium ${
                                    selectedNotification.status === 'UNREAD' ? 'bg-[#FF5C00]/10 text-[#FF5C00]' :
                                    selectedNotification.status === 'READ' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {selectedNotification.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-6 py-3">
                            {selectedNotification.actionUrl && (
                                <button
                                    onClick={() => {
                                        window.location.href = selectedNotification.actionUrl!;
                                    }}
                                    className="rounded-lg bg-[#FF5C00] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#e65300]"
                                >
                                    Go to Details
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => { setIsDeleteDialogOpen(false); setDeletingNotificationId(null); }}
                onConfirm={confirmDelete}
                title="Delete Notification"
                message="Are you sure you want to delete this notification?"
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteNotificationMutation.isPending}
            />
        </div>
    );
}
