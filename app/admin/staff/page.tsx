"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, UserCog, Trash2, User, Search, KeyRound, Copy, Check, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Modal } from '@/features/admin/components/ui/modal';
import ConfirmationDialog from '@/features/admin/components/ui/confirmation-dialog';
import {
    useGetStaff,
    useCreateStaff,
    useUpdateStaff,
    useDeleteStaff,
    useToggleStaffStatus,
    useResetStaffPassword,
} from '@/hooks/useStaff';
import type { Staff } from '@/api/staff.api';

interface FormData {
    name: string;
    email: string;
    phone: string;
    role: 'WAITER' | 'CASHIER';
    status: 'ACTIVE' | 'INACTIVE';
}

const initialFormData: FormData = {
    name: '',
    email: '',
    phone: '',
    role: 'WAITER',
    status: 'ACTIVE',
};

export default function StaffPage() {
    // Filters and pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'WAITER' | 'CASHIER'>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const itemsPerPage = 10;

    // Use react-query hooks
    const { data: staffResponse, isLoading, refetch } = useGetStaff({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        role: roleFilter,
        status: statusFilter,
    });
    const createStaffMutation = useCreateStaff();
    const updateStaffMutation = useUpdateStaff();
    const deleteStaffMutation = useDeleteStaff();
    const toggleStaffStatusMutation = useToggleStaffStatus();
    const resetStaffPasswordMutation = useResetStaffPassword();

    const staffList = staffResponse?.data || [];
    const totalPages = staffResponse?.pagination?.totalPages || 1;
    const totalCount = staffResponse?.pagination?.total || 0;
    
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    
    // Selected staff for edit/delete
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    
    // Credentials display
    const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
    const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);
    
    // Form data
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
    


    const showToast = (type: 'success' | 'error', message: string) => {
        toast[type](message);
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Validate form
    const validateForm = (): boolean => {
        const errors: Partial<FormData> = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle create staff
    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        try {
            const response = await createStaffMutation.mutateAsync({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim() || undefined,
                role: formData.role,
                status: formData.status,
            });
            
            if (response.success) {
                showToast('success', 'Staff member created successfully');
                setIsCreateModalOpen(false);
                setFormData(initialFormData);
                setCredentials(response.data.credentials);
                setIsCredentialsModalOpen(true);
            }
        } catch (error: any) {
            showToast('error', error.response?.data?.message || 'Failed to create staff');
        }
    };

    // Handle update staff
    const handleUpdateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStaff || !validateForm()) return;
        
        try {
            const response = await updateStaffMutation.mutateAsync({
                id: selectedStaff._id,
                data: {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim() || undefined,
                    role: formData.role,
                    status: formData.status,
                },
            });
            
            if (response.success) {
                showToast('success', 'Staff member updated successfully');
                setIsEditModalOpen(false);
                setSelectedStaff(null);
                setFormData(initialFormData);
            }
        } catch (error: any) {
            showToast('error', error.response?.data?.message || 'Failed to update staff');
        }
    };

    // Handle delete staff
    const handleDeleteStaff = async () => {
        if (!selectedStaff) return;
        
        try {
            await deleteStaffMutation.mutateAsync(selectedStaff._id);
            showToast('success', 'Staff member deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedStaff(null);
        } catch (error: any) {
            showToast('error', error.response?.data?.message || 'Failed to delete staff');
        }
    };

    // Handle toggle status
    const handleToggleStatus = async (staff: Staff) => {
        try {
            const response = await toggleStaffStatusMutation.mutateAsync(staff._id);
            if (response.success) {
                showToast('success', `Staff ${response.data.status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
            }
        } catch (error: any) {
            showToast('error', error.response?.data?.message || 'Failed to update status');
        }
    };

    // Handle reset password
    const handleResetPassword = async () => {
        if (!selectedStaff) return;
        
        try {
            const response = await resetStaffPasswordMutation.mutateAsync(selectedStaff._id);
            if (response.success) {
                showToast('success', 'Password reset successfully');
                setIsResetPasswordModalOpen(false);
                setCredentials({
                    email: response.data.email,
                    password: response.data.newPassword
                });
                setIsCredentialsModalOpen(true);
            }
        } catch (error: any) {
            showToast('error', error.response?.data?.message || 'Failed to reset password');
        }
    };

    // Open edit modal
    const openEditModal = (staff: Staff) => {
        setSelectedStaff(staff);
        setFormData({
            name: staff.name,
            email: staff.email,
            phone: staff.phone || '',
            role: staff.role,
            status: staff.status,
        });
        setFormErrors({});
        setIsEditModalOpen(true);
    };

    // Open delete modal
    const openDeleteModal = (staff: Staff) => {
        setSelectedStaff(staff);
        setIsDeleteModalOpen(true);
    };

    // Open reset password modal
    const openResetPasswordModal = (staff: Staff) => {
        setSelectedStaff(staff);
        setIsResetPasswordModalOpen(true);
    };

    // Copy to clipboard
    const copyToClipboard = async (text: string, field: 'email' | 'password') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            showToast('error', 'Failed to copy');
        }
    };

    // Get display index for staff member
    const getDisplayIndex = (index: number) => {
        return ((currentPage - 1) * itemsPerPage) + index + 1;
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Staff Members</h1>
                    <p className="text-zinc-600">Manage your restaurant employees and their roles.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData(initialFormData);
                        setFormErrors({});
                        setIsCreateModalOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-[#FF5C00] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#e65300] transition-colors"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Staff
                </button>
            </div>

            {/* Search + Filters */}
            <div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200">
                <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-zinc-300"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto">
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value as typeof roleFilter);
                                setCurrentPage(1);
                            }}
                            className="h-10 min-w-[120px] rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="WAITER">Waiter</option>
                            <option value="CASHIER">Cashier</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as typeof statusFilter);
                                setCurrentPage(1);
                            }}
                            className="h-10 min-w-[120px] rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                        <button
                            onClick={() => refetch()}
                            className="h-10 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Loader2 className="h-8 w-8 text-zinc-400 mb-3 animate-spin" />
                            <p className="text-sm font-medium text-zinc-500">Loading staff members...</p>
                        </div>
                    ) : staffList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <User className="h-10 w-10 text-zinc-300 mb-3" />
                            <p className="text-sm font-medium text-zinc-500">No staff members found</p>
                            <p className="text-sm text-zinc-400 mt-1">
                                {searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Click "Add Staff" to create your first staff member.'}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Employee</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Phone</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-600">
                                {staffList.map((member, index) => (
                                    <tr key={member._id} className="transition-colors hover:bg-zinc-50">
                                        <td className="whitespace-nowrap px-4 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900">{member.name}</p>
                                                <p className="mt-0.5 text-sm text-zinc-500">
                                                    ID #{getDisplayIndex(index).toString().padStart(3, '0')}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm font-medium text-zinc-900">{member.email}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm font-medium text-zinc-900">
                                                {member.phone || '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm font-medium text-zinc-700 uppercase tracking-tight">
                                                {member.role}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(member)}
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80 ${
                                                    member.status === 'ACTIVE'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-rose-100 text-rose-700'
                                                }`}
                                                title="Click to toggle status"
                                            >
                                                {member.status}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => openEditModal(member)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-[#FF5C00]"
                                                    title="Edit staff"
                                                >
                                                    <UserCog size={15} />
                                                </button>
                                                <button
                                                    onClick={() => openResetPasswordModal(member)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                                                    title="Reset password"
                                                >
                                                    <KeyRound size={15} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(member)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-rose-50 hover:text-rose-500"
                                                    title="Delete staff"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {staffList.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-200 px-5 py-4">
                        <span className="text-sm text-zinc-500">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} staff member{totalCount !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        // Show first page, last page, and pages around current
                                        return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                                    })
                                    .map((page, index, array) => (
                                        <React.Fragment key={page}>
                                            {index > 0 && array[index - 1] !== page - 1 && (
                                                <span className="px-2 text-zinc-400">...</span>
                                            )}
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                                    currentPage === page
                                                        ? 'bg-[#FF5C00] text-white border-[#FF5C00]'
                                                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Staff Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Add New Staff"
                subtitle="Create a new staff account with login credentials"
            >
                <form className="space-y-6" onSubmit={handleCreateStaff}>
                    {formErrors.name || formErrors.email ? (
                        <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100">
                            <AlertCircle className="h-4 w-4 text-rose-500" />
                            <span className="text-sm font-medium text-rose-600">
                                Please fill in all required fields correctly.
                            </span>
                        </div>
                    ) : null}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                Full Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Rahul Sharma"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-900 ring-1 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-[#FF5C00]/20 ${
                                    formErrors.name ? 'ring-rose-300' : 'ring-zinc-200'
                                }`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@restaurant.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-900 ring-1 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-[#FF5C00]/20 ${
                                        formErrors.email ? 'ring-rose-300' : 'ring-zinc-200'
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+977-98XXXXXXXX"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-900 ring-1 ring-zinc-200 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-[#FF5C00]/20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Role <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'WAITER' | 'CASHIER' })}
                                    className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-900 ring-1 ring-zinc-200 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#FF5C00]/20 appearance-none cursor-pointer"
                                >
                                    <option value="WAITER">Waiter</option>
                                    <option value="CASHIER">Cashier</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                                    className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-900 ring-1 ring-zinc-200 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#FF5C00]/20 appearance-none cursor-pointer"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-amber-50/80 px-4 py-3 ring-1 ring-amber-100">
                        <p className="text-sm text-amber-700">
                            <span className="font-medium">Note:</span> A temporary password will be auto-generated. You'll receive credentials to share with the staff member.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={createStaffMutation.isPending}
                            className="flex-1 rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createStaffMutation.isPending}
                            className="flex-1 rounded-xl bg-[#FF5C00] py-3 text-sm font-semibold text-white transition-all hover:bg-[#e65300] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {createStaffMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                'Add Staff'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Staff Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Staff"                subtitle="Update staff information and account status"            >
                <form className="space-y-6" onSubmit={handleUpdateStaff}>
                    {formErrors.name || formErrors.email ? (
                        <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100">
                            <AlertCircle className="h-4 w-4 text-rose-500" />
                            <span className="text-sm font-medium text-rose-600">
                                Please fill in all required fields correctly.
                            </span>
                        </div>
                    ) : null}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                Full Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Rahul Sharma"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-900 ring-1 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-[#FF5C00]/20 ${
                                    formErrors.name ? 'ring-rose-300' : 'ring-zinc-200'
                                }`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@restaurant.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-900 ring-1 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-[#FF5C00]/20 ${
                                        formErrors.email ? 'ring-rose-300' : 'ring-zinc-200'
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+977-98XXXXXXXX"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-900 ring-1 ring-zinc-200 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-[#FF5C00]/20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Role <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'WAITER' | 'CASHIER' })}
                                    className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-900 ring-1 ring-zinc-200 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#FF5C00]/20 appearance-none cursor-pointer"
                                >
                                    <option value="WAITER">Waiter</option>
                                    <option value="CASHIER">Cashier</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                                    className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-900 ring-1 ring-zinc-200 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#FF5C00]/20 appearance-none cursor-pointer"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={updateStaffMutation.isPending}
                            className="flex-1 rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateStaffMutation.isPending}
                            className="flex-1 rounded-xl bg-[#FF5C00] py-3 text-sm font-semibold text-white transition-all hover:bg-[#e65300] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {updateStaffMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Staff'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteStaff}
                title="Delete Staff"
                message={<>Are you sure you want to delete <span className="font-semibold text-zinc-900">{selectedStaff?.name}</span>? This action cannot be undone.</>}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteStaffMutation.isPending}
            />

            {/* Reset Password Confirmation Modal */}
            <ConfirmationDialog
                isOpen={isResetPasswordModalOpen}
                onClose={() => setIsResetPasswordModalOpen(false)}
                onConfirm={handleResetPassword}
                title="Reset Password"
                message={<>Are you sure you want to reset the password for <span className="font-semibold text-zinc-900">{selectedStaff?.name}</span>? A new temporary password will be generated.</>}
                confirmText="Reset Password"
                cancelText="Cancel"
                variant="warning"
                isLoading={resetStaffPasswordMutation.isPending}
            />

            {/* Credentials Modal */}
            <Modal
                isOpen={isCredentialsModalOpen}
                onClose={() => {
                    setIsCredentialsModalOpen(false);
                    setCredentials(null);
                }}
                title="Staff Credentials"
                subtitle="Share these with the staff member"
                maxWidthClass="max-w-sm"
            >
                {credentials && (
                    <div className="space-y-3">
                        {[
                            { label: "Email", value: credentials.email, key: "email" as const },
                            { label: "Temporary Password", value: credentials.password, key: "password" as const, highlight: true },
                        ].map(({ label, value, key, highlight }) => (
                            <div key={key}>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">{label}</label>
                                <div className="flex items-center gap-2">
                                    <div className={`flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold border truncate ${
                                        highlight ? 'bg-orange-50/60 border-orange-200 text-orange-700' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                                    }`} title={value}>
                                        {value}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(value, key)}
                                        className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 transition-colors"
                                        title="Copy"
                                    >
                                        {copiedField === key ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>


        </div>
    );
}
