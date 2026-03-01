"use client";

import { useState } from 'react';
import { Mail, Phone, Loader2, Search, Clock, Check, AlertCircle, XCircle, Eye, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationDialog from '@/features/admin/components/ui/confirmation-dialog';
import { useSocket } from '@/providers/socket-provider';
import { useGetInquiries, useMarkInquiryContacted, useOnboardInquiry, useResendCredentials, useRejectInquiry } from '@/hooks/useInquiries';
import type { RestaurantInquiry } from '@/api/inquiry.api';

export default function OnboardingPage() {
    const { clearNotifications } = useSocket();
    const { data: inquiriesData, isLoading: loading, refetch: refetchInquiries } = useGetInquiries();
    const markContactedMutation = useMarkInquiryContacted();
    const onboardMutation = useOnboardInquiry();
    const resendCredentialsMutation = useResendCredentials();
    const rejectMutation = useRejectInquiry();

    const inquiries: RestaurantInquiry[] = inquiriesData?.data || [];

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedInquiry, setSelectedInquiry] = useState<RestaurantInquiry | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectingInquiryId, setRejectingInquiryId] = useState<string | null>(null);

    // Clear notifications on mount
    useState(() => { clearNotifications(); });

    const handleMarkContacted = async (inquiryId: string) => {
        try {
            await markContactedMutation.mutateAsync(inquiryId);
            if (selectedInquiry && selectedInquiry._id === inquiryId) {
                const updated = inquiries.find(i => i._id === inquiryId);
                if (updated) setSelectedInquiry(updated);
            }
        } catch (error) {
            console.error('Failed to mark as contacted:', error);
            toast.error('Failed to mark as contacted');
        }
    };

    const handleOnboard = async (inquiryId: string) => {
        try {
            await onboardMutation.mutateAsync(inquiryId);
            
            toast.success('Restaurant onboarded successfully! Credentials sent via email.');
            setIsOnboardModalOpen(false);
            setIsDetailModalOpen(false);
            setSelectedInquiry(null);
        } catch (error: any) {
            console.error('Failed to onboard restaurant:', error);
            const errorMsg = error.response?.data?.message || 'Failed to onboard restaurant';
            toast.error(errorMsg);
        }
    };

    const handleResendCredentials = async (inquiryId: string) => {
        try {
            await resendCredentialsMutation.mutateAsync(inquiryId);
            toast.success('Credentials resent successfully!');
        } catch (error) {
            console.error('Failed to resend credentials:', error);
            toast.error('Failed to resend credentials');
        }
    };

    const handleReject = async (inquiryId: string) => {
        setRejectingInquiryId(inquiryId);
        setIsRejectDialogOpen(true);
    };

    const confirmReject = async () => {
        if (!rejectingInquiryId) return;
        try {
            await rejectMutation.mutateAsync(rejectingInquiryId);
            setIsDetailModalOpen(false);
            setSelectedInquiry(null);
        } catch (error) {
            console.error('Failed to reject inquiry:', error);
            toast.error('Failed to reject inquiry');
        } finally {
            setIsRejectDialogOpen(false);
            setRejectingInquiryId(null);
        }
    };

    const filteredInquiries = inquiries.filter((inquiry) => {
        const matchesSearch =
            inquiry.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inquiry.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inquiry.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inquiry.restaurantAddress.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || inquiry.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
            PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
            CONTACTED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Phone className="w-4 h-4" /> },
            ONBOARDED: { bg: 'bg-green-100', text: 'text-green-800', icon: <Check className="w-4 h-4" /> },
            REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
        };

        const badge = badges[status];
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
                {badge.icon}
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-f44336 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Restaurant Onboarding</h1>
                <p className="text-gray-600 mt-2">Manage restaurant onboarding requests</p>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-col sm:flex-row">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or restaurant..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="ONBOARDED">Onboarded</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Restaurant</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Owner</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredInquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No inquiries found
                                    </td>
                                </tr>
                            ) : (
                                filteredInquiries.map((inquiry) => (
                                    <tr key={inquiry._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{inquiry.restaurantName}</div>
                                            <div className="text-sm text-gray-500 truncate">{inquiry.restaurantAddress}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{inquiry.ownerName}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                {inquiry.ownerEmail}
                                            </div>
                                            {inquiry.ownerPhone && (
                                                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                    <Phone className="w-4 h-4" />
                                                    {inquiry.ownerPhone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(inquiry.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(inquiry.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedInquiry(inquiry);
                                                    setIsDetailModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedInquiry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
                        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedInquiry.restaurantName}</h2>
                                <p className="text-sm text-gray-600">{selectedInquiry.restaurantAddress}</p>
                            </div>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            {/* Owner Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Owner Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Name:</span>
                                        <p className="font-medium text-gray-900">{selectedInquiry.ownerName}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Status:</span>
                                        <p className="mt-1">{getStatusBadge(selectedInquiry.status)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Email:</span>
                                        <p className="font-medium text-gray-900 flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {selectedInquiry.ownerEmail}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Phone:</span>
                                        <p className="font-medium text-gray-900 flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            {selectedInquiry.ownerPhone}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Restaurant Details */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Restaurant Details</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {selectedInquiry.restaurantPhone && (
                                        <div className="col-span-2">
                                            <span className="text-gray-600">Phone:</span>
                                            <p className="font-medium text-gray-900">{selectedInquiry.restaurantPhone}</p>
                                        </div>
                                    )}
                                    {selectedInquiry.cuisineType && (
                                        <div>
                                            <span className="text-gray-600">Cuisine Type:</span>
                                            <p className="font-medium text-gray-900">{selectedInquiry.cuisineType}</p>
                                        </div>
                                    )}
                                    {selectedInquiry.numberOfTables && (
                                        <div>
                                            <span className="text-gray-600">Tables:</span>
                                            <p className="font-medium text-gray-900">{selectedInquiry.numberOfTables}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message */}
                            {selectedInquiry.message && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Message</h3>
                                    <p className="text-sm text-gray-700">{selectedInquiry.message}</p>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Submitted:</span>
                                        <span className="text-gray-900 font-medium">{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                                    </div>
                                    {selectedInquiry.contactedAt && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Contacted:</span>
                                            <span className="text-gray-900 font-medium">{new Date(selectedInquiry.contactedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {selectedInquiry.onboardedAt && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Onboarded:</span>
                                            <span className="text-gray-900 font-medium">{new Date(selectedInquiry.onboardedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
                            {selectedInquiry.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsDetailModalOpen(false);
                                            setIsOnboardModalOpen(true);
                                        }}
                                        disabled={markContactedMutation.isPending || onboardMutation.isPending}
                                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Onboard Restaurant
                                    </button>
                                    <button
                                        onClick={() => handleMarkContacted(selectedInquiry._id)}
                                        disabled={markContactedMutation.isPending}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Mark Contacted
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedInquiry._id)}
                                        disabled={rejectMutation.isPending}
                                        className="flex-1 bg-red-100 text-red-700 py-2 rounded hover:bg-red-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {selectedInquiry.status === 'CONTACTED' && (
                                <button
                                    onClick={() => {
                                        setIsDetailModalOpen(false);
                                        setIsOnboardModalOpen(true);
                                    }}
                                    disabled={onboardMutation.isPending}
                                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Onboard Restaurant
                                </button>
                            )}
                            {selectedInquiry.status === 'ONBOARDED' && (
                                <button
                                    onClick={() => handleResendCredentials(selectedInquiry._id)}
                                    disabled={resendCredentialsMutation.isPending}
                                    className="flex-1 bg-amber-600 text-white py-2 rounded hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Resend Credentials
                                </button>
                            )}
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Onboarding Confirmation Modal */}
            {isOnboardModalOpen && selectedInquiry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-900">Confirm Onboarding</h2>
                        </div>

                        <div className="px-6 py-4 space-y-3">
                            <p className="text-gray-700">
                                You are about to onboard <strong>{selectedInquiry.restaurantName}</strong>.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <p className="text-sm text-blue-800">
                                    <strong>This will:</strong>
                                </p>
                                <ul className="text-sm text-blue-800 mt-2 ml-4 space-y-1 list-disc">
                                    <li>Create the restaurant in the system</li>
                                    <li>Generate temporary login credentials</li>
                                    <li>Create admin account for {selectedInquiry.ownerName}</li>
                                    <li>Send credentials via email to {selectedInquiry.ownerEmail}</li>
                                </ul>
                            </div>
                            <p className="text-sm text-gray-600">
                                The owner will be required to change their password on first login.
                            </p>
                        </div>

                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
                            <button
                                onClick={() => handleOnboard(selectedInquiry._id)}
                                disabled={onboardMutation.isPending}
                                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {onboardMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                {onboardMutation.isPending ? 'Processing...' : 'Confirm Onboarding'}
                            </button>
                            <button
                                onClick={() => setIsOnboardModalOpen(false)}
                                disabled={onboardMutation.isPending}
                                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationDialog
                isOpen={isRejectDialogOpen}
                onClose={() => { setIsRejectDialogOpen(false); setRejectingInquiryId(null); }}
                onConfirm={confirmReject}
                title="Reject Inquiry"
                message="Are you sure you want to reject this inquiry?"
                confirmText="Reject"
                cancelText="Cancel"
                variant="danger"
                isLoading={rejectMutation.isPending}
            />
        </div>
    );
}
