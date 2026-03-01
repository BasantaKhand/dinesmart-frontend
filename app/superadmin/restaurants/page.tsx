"use client";

import React, { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Building2,
    Users,
    CheckCircle,
    KeyRound,
    Ban,
    Check,
    Copy,
} from "lucide-react";
import { Modal } from "@/features/admin/components/ui/modal";
import { Pagination } from "@/features/admin/components/ui/pagination";
import ConfirmationDialog from "@/features/admin/components/ui/confirmation-dialog";
import {
    useGetRestaurants,
    useCreateRestaurant,
    useUpdateRestaurantStatus,
    useDeleteRestaurant,
    useResetRestaurantPassword,
} from "@/hooks/useSuperadminRestaurants";
import type { Restaurant, PaginationData } from "@/api/superadmin-restaurant.api";

export default function RestaurantsPage() {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);

    // Use react-query hooks
    const { data: restaurantsResponse, isLoading } = useGetRestaurants(currentPage, limit);
    const createRestaurantMutation = useCreateRestaurant();
    const updateRestaurantStatusMutation = useUpdateRestaurantStatus();
    const deleteRestaurantMutation = useDeleteRestaurant();
    const resetRestaurantPasswordMutation = useResetRestaurantPassword();

    const restaurants = restaurantsResponse?.data || [];
    const pagination = restaurantsResponse?.pagination || null;

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "ALL" | "ACTIVE" | "SUSPENDED" | "PENDING"
    >("ALL");

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

    // Credentials display
    const [newCredentials, setNewCredentials] = useState<{
        email: string;
        tempPassword: string;
    } | null>(null);

    // ✅ Copy feedback (no alerts)
    const [copiedKey, setCopiedKey] = useState<
        null | "url" | "email" | "password"
    >(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [createFormData, setCreateFormData] = useState({
        name: "",
        address: "",
        ownerName: "",
        email: "",
        password: "",
    });

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: "danger" | "warning" | "info";
        confirmText: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        variant: "info",
        confirmText: "Confirm",
        onConfirm: () => {},
    });
    const [isConfirmLoading, setIsConfirmLoading] = useState(false);
    const [errorDialog, setErrorDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({
        isOpen: false,
        title: "",
        message: "",
    });

    // Local filtering for search
    const filteredRestaurants = restaurants.filter((restaurant) => {
        const matchesSearch =
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.address?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || restaurant.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const payload = {
                name: createFormData.name,
                address: createFormData.address,
                ownerName: createFormData.ownerName,
                email: createFormData.email,
                ...(createFormData.password ? { password: createFormData.password } : {}),
            };

            const response = await createRestaurantMutation.mutateAsync(payload);

            setNewCredentials(response.data.credentials);
            setIsCreateModalOpen(false);
            setIsCredentialsModalOpen(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = (
        restaurant: Restaurant,
        newStatus: "ACTIVE" | "SUSPENDED" | "PENDING"
    ) => {
        const action = newStatus === "ACTIVE" ? "activate" : "suspend";
        setConfirmDialog({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Restaurant`,
            message: `Are you sure you want to ${action} "${restaurant.name}"?`,
            variant: newStatus === "SUSPENDED" ? "danger" : "info",
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            onConfirm: async () => {
                setIsConfirmLoading(true);
                try {
                    await updateRestaurantStatusMutation.mutateAsync({ id: restaurant._id, data: { status: newStatus } });
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                } catch (err: any) {
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                    setErrorDialog({
                        isOpen: true,
                        title: "Operation Failed",
                        message: err.response?.data?.message || "Failed to update status",
                    });
                } finally {
                    setIsConfirmLoading(false);
                }
            },
        });
    };

    const handleResetPassword = (restaurant: Restaurant) => {
        setConfirmDialog({
            isOpen: true,
            title: "Reset Password",
            message: `Generate a new temporary password for "${restaurant.name}" admin?`,
            variant: "warning",
            confirmText: "Reset Password",
            onConfirm: async () => {
                setIsConfirmLoading(true);
                try {
                    const response = await resetRestaurantPasswordMutation.mutateAsync(restaurant._id);
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                    setNewCredentials(response.data);
                    setIsCredentialsModalOpen(true);
                } catch (err: any) {
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                    setErrorDialog({
                        isOpen: true,
                        title: "Reset Failed",
                        message:
                            err.response?.data?.message ||
                            "Failed to reset password. Note: Only accounts with a RESTAURANT_ADMIN user can be reset.",
                    });
                } finally {
                    setIsConfirmLoading(false);
                }
            },
        });
    };

    const handleDelete = (restaurant: Restaurant) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Restaurant",
            message: `Delete "${restaurant.name}"? This action cannot be undone and will affect all associated users and data.`,
            variant: "danger",
            confirmText: "Delete",
            onConfirm: async () => {
                setIsConfirmLoading(true);
                try {
                    await deleteRestaurantMutation.mutateAsync(restaurant._id);
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

                    if (filteredRestaurants.length === 1 && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    }
                } catch (err: any) {
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                    setErrorDialog({
                        isOpen: true,
                        title: "Delete Failed",
                        message: err.response?.data?.message || "Failed to delete restaurant",
                    });
                } finally {
                    setIsConfirmLoading(false);
                }
            },
        });
    };

    // ✅ Theme-friendly copy (no alert + small "Copied" label)
    const copyToClipboard = async (
        text: string,
        key?: "url" | "email" | "password"
    ) => {
        try {
            await navigator.clipboard.writeText(text);
            if (key) {
                setCopiedKey(key);
                window.setTimeout(() => setCopiedKey(null), 1200);
            }
        } catch {
            // ignore
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                        ACTIVE
                    </span>
                );
            case "SUSPENDED":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600">
                        SUSPENDED
                    </span>
                );
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">
                        PENDING
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-500">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Restaurants
                    </h1>
                    <p className="mt-1 text-sm font-medium text-zinc-500">
                        Manage onboarding, status, and reset credentials for all properties
                    </p>
                </div>
                <button
                    onClick={() => {
                        setCreateFormData({
                            name: "",
                            address: "",
                            ownerName: "",
                            email: "",
                            password: "",
                        });
                        setError("");
                        setIsCreateModalOpen(true);
                    }}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#FF5C00] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#e65300] transition-colors whitespace-nowrap"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Restaurant
                </button>
            </div>

            {/* Content area */}
            <div className="rounded-xl bg-white ring-1 ring-zinc-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Actions Bar */}
                <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <Search
                            size={15}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                        />
                        <input
                            type="text"
                            placeholder="Search by name or address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm font-medium text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-zinc-300 transition-colors"
                        />
                    </div>

                    <div className="flex items-center">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="h-10 w-full sm:w-auto rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-300 transition-colors cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="PENDING">Pending</option>
                        </select>
                    </div>
                </div>

                {/* Table or Loading state */}
                <div className="flex-1 overflow-x-auto">
                    {isLoading ? (
                        <div className="flex h-64 flex-col items-center justify-center">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 animate-pulse">
                                <Building2 size={24} className="text-zinc-300" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-500">
                                Loading restaurants...
                            </p>
                        </div>
                    ) : filteredRestaurants.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center text-center px-4">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100">
                                <Building2 size={28} className="text-zinc-400" />
                            </div>
                            <h4 className="mb-1 text-base font-bold text-zinc-800">
                                No restaurants found
                            </h4>
                            <p className="max-w-sm text-sm text-zinc-500">
                                {searchQuery || statusFilter !== "ALL"
                                    ? "No restaurants match your filters."
                                    : "Create your first restaurant to generate an onboarding URL and credentials."}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                                <tr>
                                    <th className="px-6 py-3.5">Restaurant</th>
                                    <th className="px-6 py-3.5">Address</th>
                                    <th className="px-6 py-3.5">Users</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Created</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-100/80 text-zinc-600">
                                {filteredRestaurants.map((restaurant) => (
                                    <tr
                                        key={restaurant._id}
                                        className="group transition-colors hover:bg-zinc-50/50"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="text-[14px] font-bold text-zinc-900">
                                                {restaurant.name}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">
                                            {restaurant.address || "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[13px] font-medium text-zinc-600">
                                                <Users size={14} className="text-zinc-400" />
                                                <span>{restaurant.userCount || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(restaurant.status)}</td>
                                        <td className="px-6 py-4 text-[13px] text-zinc-500">
                                            {new Date(restaurant.createdAt).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="flex items-center gap-1.5 border-r border-zinc-200 pr-2 mr-0.5">
                                                    {restaurant.status === "SUSPENDED" ? (
                                                        <button
                                                            onClick={() => handleStatusChange(restaurant, "ACTIVE")}
                                                            title="Activate Restaurant"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                        >
                                                            <Check size={14} strokeWidth={2.5} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handleStatusChange(restaurant, "SUSPENDED")
                                                            }
                                                            title="Suspend Restaurant"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                                        >
                                                            <Ban size={14} strokeWidth={2.5} />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleResetPassword(restaurant)}
                                                        title="Reset Admin Password"
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors"
                                                    >
                                                        <KeyRound size={14} />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleDelete(restaurant)}
                                                    title="Delete Restaurant"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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

                {/* Pagination */}
                {!isLoading && pagination && pagination.totalPages > 1 && (
                    <div className="border-t border-zinc-200 bg-zinc-50/50 px-5 py-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                )}
            </div>

            {/* Create Restaurant Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
                title="Register New Restaurant"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-5">
                    {error && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600 border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-2">
                            Business Details
                        </h4>

                        <div>
                            <label className="mb-1.5 block text-[13px] font-semibold text-zinc-700">
                                Restaurant Name *
                            </label>
                            <input
                                type="text"
                                value={createFormData.name}
                                onChange={(e) =>
                                    setCreateFormData({ ...createFormData, name: e.target.value })
                                }
                                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-300 transition-colors"
                                placeholder="e.g. Mamma Mia Pizza"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[13px] font-semibold text-zinc-700">
                                Business Address
                            </label>
                            <input
                                type="text"
                                value={createFormData.address}
                                onChange={(e) =>
                                    setCreateFormData({ ...createFormData, address: e.target.value })
                                }
                                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-300 transition-colors"
                                placeholder="e.g. 123 Main St, New York, NY 10001"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-2">
                            Primary Admin Account
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-[13px] font-semibold text-zinc-700">
                                    Owner Name *
                                </label>
                                <input
                                    type="text"
                                    value={createFormData.ownerName}
                                    onChange={(e) =>
                                        setCreateFormData({ ...createFormData, ownerName: e.target.value })
                                    }
                                    className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-300 transition-colors"
                                    placeholder="e.g. John Doe"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-[13px] font-semibold text-zinc-700">
                                    Owner Email *
                                </label>
                                <input
                                    type="email"
                                    value={createFormData.email}
                                    onChange={(e) =>
                                        setCreateFormData({ ...createFormData, email: e.target.value })
                                    }
                                    className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-300 transition-colors"
                                    placeholder="john@example.com"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[13px] font-semibold text-zinc-700 flex justify-between">
                                <span>Initial Password</span>
                                <span className="text-zinc-400 font-normal">Optional</span>
                            </label>
                            <input
                                type="text"
                                value={createFormData.password}
                                onChange={(e) =>
                                    setCreateFormData({ ...createFormData, password: e.target.value })
                                }
                                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-300 transition-colors"
                                placeholder="Leave blank to auto-generate"
                                minLength={6}
                                disabled={isSubmitting}
                            />
                            <p className="mt-1.5 text-[12px] text-zinc-500">
                                The user will be required to change this password on their first login.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-zinc-100">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={isSubmitting}
                            className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 rounded-lg bg-[#FF5C00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e65300] disabled:opacity-50 flex justify-center items-center"
                        >
                            {isSubmitting ? "Registering..." : "Register & Create Admin"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Credentials Display Modal */}
            <Modal
                isOpen={isCredentialsModalOpen}
                onClose={() => setIsCredentialsModalOpen(false)}
                title="Admin Credentials"
                subtitle="Share these with the restaurant owner"
                maxWidthClass="max-w-sm"
            >
                {newCredentials && (
                    <div className="space-y-3">
                        {[
                            { label: "Email", value: newCredentials.email, key: "email" as const },
                            { label: "Temporary Password", value: newCredentials.tempPassword, key: "password" as const, highlight: true },
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
                                        {copiedKey === key ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                variant={confirmDialog.variant}
                isLoading={isConfirmLoading}
            />

            {/* Error Dialog */}
            <ConfirmationDialog
                isOpen={errorDialog.isOpen}
                onClose={() => setErrorDialog({ isOpen: false, title: "", message: "" })}
                onConfirm={() => setErrorDialog({ isOpen: false, title: "", message: "" })}
                title={errorDialog.title}
                message={errorDialog.message}
                confirmText="OK"
                cancelText="Close"
                variant="danger"
            />
        </div>
    );
}