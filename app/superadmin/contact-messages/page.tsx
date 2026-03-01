"use client";

import { useEffect, useMemo, useState } from 'react';
import { Mail, Phone, Loader2, Search, Clock, Eye, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationDialog from '@/features/admin/components/ui/confirmation-dialog';
import { useSocket } from '@/providers/socket-provider';
import { Modal } from '@/features/admin/components/ui/modal';
import { Pagination } from '@/features/admin/components/ui/pagination';
import { useGetContactMessages, useDeleteContactMessage, useSendContactInvite } from '@/hooks/useContact';
import type { ContactMessage } from '@/api/contact.api';

export default function ContactMessagesPage() {
    const { clearNotifications } = useSocket();
    const { data: messagesData, isLoading: loading, refetch: refetchMessages } = useGetContactMessages();
    const deleteMessageMutation = useDeleteContactMessage();
    const sendInviteMutation = useSendContactInvite();

    const messages: ContactMessage[] = messagesData?.data?.messages || [];

    const [searchQuery, setSearchQuery] = useState('');
    const [inviteFilter, setInviteFilter] = useState<'ALL' | 'INVITED' | 'ACTIVATED' | 'NOT_INVITED'>('ALL');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInviteConfirmOpen, setIsInviteConfirmOpen] = useState(false);
    const [inviteMessage, setInviteMessage] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        clearNotifications();
    }, []);

    const handleDelete = (messageId: string) => {
        setDeletingMessageId(messageId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingMessageId) return;
        try {
            await deleteMessageMutation.mutateAsync(deletingMessageId);
            if (selectedMessage && selectedMessage._id === deletingMessageId) {
                setIsModalOpen(false);
                setSelectedMessage(null);
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
        } finally {
            setIsDeleteDialogOpen(false);
            setDeletingMessageId(null);
        }
    };

    const getDefaultInviteMessage = (message: ContactMessage) => {
        return `Hi ${message.fullName},\n\nThanks for taking the time to check out DineSmart RMS.\n\nI'd like to invite you to create your own account and get started. Just click the button in the email to set your password and log in.\n\nLet me know if you have any questions!`;
    };

    const openInviteModal = (message: ContactMessage) => {
        setSelectedMessage(message);
        setInviteMessage(getDefaultInviteMessage(message));
        setIsInviteConfirmOpen(true);
    };

    const handleSendInvite = async () => {
        if (!selectedMessage) return;
        
        try {
            await sendInviteMutation.mutateAsync({ id: selectedMessage._id, customMessage: inviteMessage });
            toast.success('Invite sent successfully to ' + selectedMessage.email);
            setIsInviteConfirmOpen(false);
            setIsModalOpen(false);
            setSelectedMessage(null);
        } catch (error: any) {
            console.error('Failed to send invite:', error);
            const errorMsg = error.response?.data?.message || 'Failed to send invite';
            toast.error(errorMsg);
        }
    };

    const filteredMessages = useMemo(() => {
        return messages.filter((msg) => {
            const matchesSearch =
                msg.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                msg.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                msg.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesInvite =
                inviteFilter === 'ALL' ||
                (inviteFilter === 'INVITED' && Boolean(msg.inviteSentAt) && !msg.onboardedAt) ||
                (inviteFilter === 'ACTIVATED' && Boolean(msg.onboardedAt)) ||
                (inviteFilter === 'NOT_INVITED' && !msg.inviteSentAt);

            return matchesSearch && matchesInvite;
        });
    }, [messages, searchQuery, inviteFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredMessages.length / itemsPerPage));

    const paginatedMessages = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredMessages.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredMessages, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, inviteFilter]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Restaurant Applications</h1>
                <p className="mt-1 text-sm font-medium text-zinc-500">
                    Applications and inquiries from potential restaurant owners
                </p>
            </div>

            {/* Messages List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 animate-pulse">
                        <MessageSquare size={30} className="text-zinc-400" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-500">Loading contact messages...</p>
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 text-center ring-1 ring-zinc-300 shadow-none">
                    <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-xl bg-zinc-100">
                        <Mail size={34} className="text-zinc-400" />
                    </div>
                    <h4 className="mb-2 text-base font-bold text-zinc-800">No messages found</h4>
                    <p className="mx-auto max-w-sm text-sm text-zinc-500">
                        Contact messages from restaurant owners will appear here.
                    </p>
                </div>
            ) : (
                <div className="rounded-xl bg-white ring-1 ring-zinc-300 shadow-none overflow-hidden">
                    <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-xl">
                            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search by name, restaurant, or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm font-medium text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-zinc-300"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto">
                            <select
                                value={inviteFilter}
                                onChange={(e) => setInviteFilter(e.target.value as 'ALL' | 'INVITED' | 'ACTIVATED' | 'NOT_INVITED')}
                                className="h-10 min-w-[160px] rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                            >
                                <option value="ALL">All Leads</option>
                                <option value="INVITED">Invite Sent</option>
                                <option value="ACTIVATED">Activated</option>
                                <option value="NOT_INVITED">Not Invited</option>
                            </select>
                        </div>

                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-zinc-200 bg-zinc-50/60 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                                <tr>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Restaurant</th>
                                    <th className="px-6 py-4">Message</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-600">
                                {paginatedMessages.map((message) => {
                                const initials = message.fullName
                                    .split(' ')
                                    .map((part) => part[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase();

                                return (
                                <tr key={message._id} className="group transition-colors hover:bg-zinc-50/40">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
                                                {initials || 'C'}
                                            </div>
                                            <div>
                                                <p className="text-[15px] font-semibold text-zinc-900">{message.fullName}</p>
                                                <p className="mt-0.5 flex items-center gap-1 text-sm font-medium text-zinc-400">
                                                    <Mail size={11} />
                                                    {message.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-zinc-600">
                                        <p className="flex items-center gap-1">
                                            <Phone size={11} />
                                            {message.phone}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-[15px] font-medium text-zinc-700">
                                        {message.restaurantName}
                                    </td>
                                    <td className="max-w-sm px-6 py-4 text-sm text-zinc-600">
                                        <p className="line-clamp-2">{message.message}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(message.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {!message.onboardedAt ? (
                                                <button
                                                    onClick={() => openInviteModal(message)}
                                                    className="inline-flex h-8 min-w-[104px] whitespace-nowrap items-center justify-center rounded-lg bg-teal-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-teal-700"
                                                    title="Send invite"
                                                >
                                                    {message.inviteSentAt ? 'Resend Invite' : 'Send Invite'}
                                                </button>
                                            ) : (
                                                <span className="inline-flex h-8 items-center justify-center rounded-lg bg-teal-100 px-2.5 text-xs font-semibold text-teal-700">
                                                    Activated
                                                </span>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedMessage(message);
                                                    setIsModalOpen(true);
                                                }}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                                                title="View details"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                            </tbody>
                        </table>
                    </div>

                    {filteredMessages.length > 0 && (
                        <div className="border-t border-zinc-200 px-5 py-4">
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedMessage && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title=""
                    maxWidthClass="max-w-lg"
                    showHeader={false}
                >
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-zinc-900">Message Details</h3>
                        <p className="mt-1 text-sm font-medium text-zinc-500">Received on {new Date(selectedMessage.createdAt).toLocaleString()}</p>

                        <div className="mt-4 border-t border-zinc-200 pt-4">
                            <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Summary</h4>
                            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Contact</p>
                                    <p className="mt-1 font-semibold text-zinc-800">{selectedMessage.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Restaurant</p>
                                    <p className="mt-1 font-semibold text-zinc-800">{selectedMessage.restaurantName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Email</p>
                                    <p className="mt-1 break-all font-semibold text-zinc-800">{selectedMessage.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Phone</p>
                                    <p className="mt-1 font-semibold text-zinc-800">{selectedMessage.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 border-t border-zinc-200 pt-4">
                            <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Message</h4>
                            <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm leading-6 text-zinc-700">
                                {selectedMessage.message}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-2 border-t border-zinc-200 pt-4 sm:flex-row sm:justify-between">
                            <button
                                onClick={() => handleDelete(selectedMessage._id)}
                                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                            >
                                Delete
                            </button>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Invite Confirmation Modal */}
            {isInviteConfirmOpen && selectedMessage && (
                <Modal
                    isOpen={isInviteConfirmOpen}
                    onClose={() => setIsInviteConfirmOpen(false)}
                    title=""
                    maxWidthClass="max-w-md"
                    showHeader={false}
                >
                    <div>
                        <h3 className="text-lg font-bold tracking-tight text-zinc-900">Send Invite</h3>
                        <p className="mt-1 text-sm font-medium text-zinc-500">
                            Send an invitation email to <strong>{selectedMessage.fullName}</strong> so they can activate their DineSmart RMS account.
                        </p>

                        <div className="mt-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Personal Message</p>
                            <textarea
                                value={inviteMessage}
                                onChange={(e) => setInviteMessage(e.target.value)}
                                rows={9}
                                disabled={sendInviteMutation.isPending}
                                className="mt-3 min-h-[202px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-300 disabled:opacity-60"
                            />
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                onClick={handleSendInvite}
                                disabled={sendInviteMutation.isPending}
                                className="rounded-lg bg-[#FF5C00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e65300] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sendInviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                            </button>
                            <button
                                onClick={() => setIsInviteConfirmOpen(false)}
                                disabled={sendInviteMutation.isPending}
                                className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => { setIsDeleteDialogOpen(false); setDeletingMessageId(null); }}
                onConfirm={confirmDelete}
                title="Delete Message"
                message="Are you sure you want to delete this message?"
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMessageMutation.isPending}
            />
        </div>
    );
}
