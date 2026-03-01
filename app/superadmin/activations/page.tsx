"use client";

import { useEffect, useState } from 'react';
import { Mail, Phone, Loader2, Search, Clock, Check, Send, RefreshCcw, CreditCard, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSocket } from '@/providers/socket-provider';
import { useGetCheckoutSessions, useActivateCheckoutSession, useResendCheckoutInvite } from '@/hooks/useCheckout';
import type { CheckoutSession } from '@/api/checkout.api';

export default function ActivationsPage() {
    const { clearNotifications, socket } = useSocket();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('VERIFIED');
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);

    const { data: sessionsData, isLoading: loading, refetch: refetchSessions } = useGetCheckoutSessions(statusFilter);
    const activateMutation = useActivateCheckoutSession();
    const resendInviteMutation = useResendCheckoutInvite();

    const sessions: CheckoutSession[] = sessionsData?.data || [];

    useEffect(() => {
        clearNotifications();
    }, []);

    // Listen for real-time new verified payments and auto-refresh the table
    useEffect(() => {
        if (!socket) return;

        const handleNewVerifiedPayment = () => {
            refetchSessions();
        };

        const handleNewNotification = (notification: any) => {
            if (notification.type === 'PAYMENT_VERIFIED') {
                refetchSessions();
            }
        };

        socket.on('new_verified_payment', handleNewVerifiedPayment);
        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_verified_payment', handleNewVerifiedPayment);
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, refetchSessions]);

    const handleActivateAndSendInvite = async (sessionId: string) => {
        try {
            setActionInProgress(sessionId);
            await activateMutation.mutateAsync(sessionId);
            toast.success('Activation invite sent successfully!');
        } catch (error: any) {
            console.error('Failed to activate:', error);
            toast.error(error.response?.data?.message || 'Failed to send activation invite');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleResendInvite = async (sessionId: string) => {
        try {
            setActionInProgress(sessionId);
            await resendInviteMutation.mutateAsync(sessionId);
            toast.success('Invite resent successfully!');
        } catch (error: any) {
            console.error('Failed to resend:', error);
            toast.error(error.response?.data?.message || 'Failed to resend invite');
        } finally {
            setActionInProgress(null);
        }
    };

    const filteredSessions = sessions.filter((session) => {
        const matchesSearch =
            session.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.phone.includes(searchQuery) ||
            session.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
            PAYMENT_PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
            VERIFIED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CreditCard className="w-4 h-4" /> },
            ACTIVATED: { bg: 'bg-green-100', text: 'text-green-800', icon: <Check className="w-4 h-4" /> },
            EXPIRED: { bg: 'bg-zinc-100', text: 'text-zinc-600', icon: <Clock className="w-4 h-4" /> },
            FAILED: { bg: 'bg-red-100', text: 'text-red-800', icon: <Clock className="w-4 h-4" /> },
        };

        const badge = badges[status] || badges.PAYMENT_PENDING;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.icon}
                {status.replace('_', ' ')}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Count verified sessions needing attention
    const verifiedCount = sessions.filter(s => s.status === 'VERIFIED' && !s.inviteSentAt).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF5C00]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Payment Activations</h1>
                    <p className="text-zinc-600">Manage verified payments and send activation invites</p>
                </div>
                {verifiedCount > 0 && (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">{verifiedCount} pending activation{verifiedCount > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* Table Card with Filters */}
            <div className="bg-white rounded-xl ring-1 ring-zinc-200 overflow-hidden">
                {/* Search + Filters */}
                <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search email, phone, transaction..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full pl-10 pr-4 rounded-lg border border-zinc-200 text-sm focus:border-zinc-300 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 px-3 pr-8 rounded-lg border border-zinc-200 text-sm focus:border-zinc-300 outline-none bg-white"
                        >
                            <option value="ALL">All Status</option>
                            <option value="VERIFIED">Verified (Pending Activation)</option>
                            <option value="ACTIVATED">Activated</option>
                            <option value="PAYMENT_PENDING">Payment Pending</option>
                            <option value="FAILED">Failed</option>
                        </select>

                        <button
                            onClick={() => refetchSessions()}
                            className="h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
                        >
                            <RefreshCcw className="h-4 w-4 text-zinc-600" />
                        </button>
                    </div>
                </div>

                {/* Sessions Table */}
                {filteredSessions.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-sm text-zinc-500">No checkout sessions found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Contact</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Plan</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Date</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredSessions.map((session) => (
                                    <tr key={session._id} className="hover:bg-zinc-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-zinc-400" />
                                                <span className="text-sm font-medium text-zinc-900">{session.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone className="h-4 w-4 text-zinc-400" />
                                                <span className="text-sm text-zinc-500">{session.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm font-medium text-zinc-900">{session.plan?.name || 'N/A'}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm font-semibold text-zinc-900">
                                                NPR {session.amount?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {getStatusBadge(session.status)}
                                            {session.inviteSentAt && (
                                                <p className="text-xs text-zinc-500 mt-1">
                                                    Invite sent {formatDate(session.inviteSentAt)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-zinc-600">{formatDate(session.createdAt)}</p>
                                            {session.verifiedAt && (
                                                <p className="text-xs text-emerald-600 mt-0.5">
                                                    Verified {formatDate(session.verifiedAt)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {session.status === 'VERIFIED' && !session.inviteSentAt && (
                                                    <button
                                                        onClick={() => handleActivateAndSendInvite(session._id)}
                                                        disabled={actionInProgress === session._id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF5C00] text-white text-sm font-medium rounded-lg hover:bg-[#e65300] disabled:opacity-50"
                                                    >
                                                        {actionInProgress === session._id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Send className="h-4 w-4" />
                                                        )}
                                                        Activate & Send Invite
                                                    </button>
                                                )}
                                                {session.status === 'VERIFIED' && session.inviteSentAt && (
                                                    <button
                                                        onClick={() => handleResendInvite(session._id)}
                                                        disabled={actionInProgress === session._id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-200 disabled:opacity-50"
                                                    >
                                                        {actionInProgress === session._id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <RefreshCcw className="h-4 w-4" />
                                                        )}
                                                        Resend Invite
                                                    </button>
                                                )}
                                                {session.status === 'ACTIVATED' && (
                                                    <span className="text-sm text-emerald-600 font-medium">
                                                        ✓ Completed
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
