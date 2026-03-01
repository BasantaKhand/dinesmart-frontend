"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Filter, ArrowUpDown, Loader2, UtensilsCrossed } from 'lucide-react';
import { Modal } from '@/features/admin/components/ui/modal';
import ConfirmationDialog from '@/features/admin/components/ui/confirmation-dialog';
import { toast } from 'react-toastify';
import {
    useGetMenuItems,
    useCreateMenuItem,
    useUpdateMenuItem,
    useDeleteMenuItem,
} from '@/hooks/useMenuItems';
import { useGetCategories } from '@/hooks/useCategories';
import type { MenuItem } from '@/api/menu-item.api';
import type { Category } from '@/api/category.api';

export default function MenuPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');
    const [sortOrder, setSortOrder] = useState<'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'>('default');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);

    const { data: menuItemsResponse, isLoading: menuItemsLoading } = useGetMenuItems({ search: searchQuery || undefined });
    const { data: categoriesResponse, isLoading: categoriesLoading } = useGetCategories();
    const createMenuItemMutation = useCreateMenuItem();
    const updateMenuItemMutation = useUpdateMenuItem();
    const deleteMenuItemMutation = useDeleteMenuItem();

    const rawMenuItems = menuItemsResponse?.data || [];
    const categories = categoriesResponse?.data || [];
    const isLoading = menuItemsLoading || categoriesLoading;

    // Apply client-side filters and sorting
    const menuItems = React.useMemo(() => {
        let items = [...rawMenuItems];

        if (categoryFilter !== 'ALL') {
            items = items.filter(item => item.categoryId?._id === categoryFilter);
        }
        if (statusFilter !== 'ALL') {
            items = items.filter(item => item.status === statusFilter);
        }

        switch (sortOrder) {
            case 'price_asc': items.sort((a, b) => a.price - b.price); break;
            case 'price_desc': items.sort((a, b) => b.price - a.price); break;
            case 'name_asc': items.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name_desc': items.sort((a, b) => b.name.localeCompare(a.name)); break;
        }

        return items;
    }, [rawMenuItems, categoryFilter, statusFilter, sortOrder]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        price: '',
        originalPrice: '',
        categoryId: '',
        status: 'Active',
    });

    const resetForm = () => {
        setFormData({ name: '', description: '', image: '', price: '', originalPrice: '', categoryId: '', status: 'Active' });
        setEditingItem(null);
        setError('');
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (showFilterMenu && !target.closest('.filter-dropdown-container')) setShowFilterMenu(false);
            if (showSortMenu && !target.closest('.sort-dropdown-container')) setShowSortMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFilterMenu, showSortMenu]);

    const openCreateModal = () => {
        resetForm();
        if (categories.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: categories[0]._id }));
        }
        setIsModalOpen(true);
    };

    const openEditModal = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            image: item.image || '',
            price: String(item.price),
            originalPrice: item.originalPrice ? String(item.originalPrice) : '',
            categoryId: item.categoryId?._id || '',
            status: item.status,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const payload = {
            name: formData.name,
            description: formData.description,
            image: formData.image,
            price: Number(formData.price),
            originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
            categoryId: formData.categoryId,
            status: formData.status,
        };

        try {
            if (editingItem) {
                await updateMenuItemMutation.mutateAsync({ id: editingItem._id, data: payload });
                toast.success('Menu item updated successfully');
            } else {
                await createMenuItemMutation.mutateAsync(payload);
                toast.success('Menu item added successfully');
            }
            setIsModalOpen(false);
            resetForm();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = (item: MenuItem) => {
        setDeletingItem(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingItem) return;
        try {
            await deleteMenuItemMutation.mutateAsync(deletingItem._id);
            toast.success('Menu item deleted successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete item');
        } finally {
            setIsDeleteModalOpen(false);
            setDeletingItem(null);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Menu Items</h1>
                    <p className="text-zinc-600">Manage your restaurant menu inventory</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-lg bg-[#FF5C00] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#e65300] transition-colors"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Item
                </button>
            </div>

            {/* Table Card */}
            <div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200">
                {/* Search + Filters */}
                <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-10 w-full pl-10 pr-4 rounded-lg border border-zinc-200 text-sm focus:border-zinc-300 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Category + Status Filter */}
                        <div className="relative filter-dropdown-container">
                            <button
                                onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
                                className={`flex h-10 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-medium transition-colors ${
                                    categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                                        ? 'border-[#FF5C00] bg-orange-50 text-[#FF5C00]'
                                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                }`}
                            >
                                <Filter size={14} />
                                Filter
                                {(categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
                                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5C00] text-[10px] font-bold text-white">
                                        {(categoryFilter !== 'ALL' ? 1 : 0) + (statusFilter !== 'ALL' ? 1 : 0)}
                                    </span>
                                )}
                            </button>
                            {showFilterMenu && (
                                <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg space-y-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Category</label>
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#FF5C00]"
                                        >
                                            <option value="ALL">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#FF5C00]"
                                        >
                                            <option value="ALL">All Statuses</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    {(categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
                                        <button
                                            onClick={() => { setCategoryFilter('ALL'); setStatusFilter('ALL'); setCurrentPage(1); }}
                                            className="w-full rounded-lg bg-zinc-100 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sort */}
                        <div className="relative sort-dropdown-container">
                            <button
                                onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
                                className={`flex h-10 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-medium transition-colors ${
                                    sortOrder !== 'default'
                                        ? 'border-[#FF5C00] bg-orange-50 text-[#FF5C00]'
                                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                }`}
                            >
                                <ArrowUpDown size={14} />
                                Sort
                            </button>
                            {showSortMenu && (
                                <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                                    {[
                                        { value: 'default', label: 'Default' },
                                        { value: 'name_asc', label: 'Name A → Z' },
                                        { value: 'name_desc', label: 'Name Z → A' },
                                        { value: 'price_asc', label: 'Price: Low → High' },
                                        { value: 'price_desc', label: 'Price: High → Low' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setSortOrder(opt.value as any); setShowSortMenu(false); }}
                                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                                sortOrder === opt.value
                                                    ? 'bg-orange-50 text-[#FF5C00] font-semibold'
                                                    : 'text-zinc-700 hover:bg-zinc-50'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Loading / Empty / Table */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-[#FF5C00]" />
                    </div>
                ) : menuItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <UtensilsCrossed className="h-10 w-10 text-zinc-300 mb-3" />
                        <p className="text-sm font-semibold text-zinc-500">No menu items found</p>
                        <p className="text-sm text-zinc-400 mt-1">Add your first menu item to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Item</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Description</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Category</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Price</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {(() => {
                                    const paginatedItems = menuItems.slice(
                                        (currentPage - 1) * itemsPerPage,
                                        currentPage * itemsPerPage
                                    );
                                    return paginatedItems.map((item) => (
                                    <tr key={item._id} className="hover:bg-zinc-50">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-[#FF5C00]">
                                                        <span className="text-sm font-medium">{item.name.charAt(0)}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="line-clamp-2 max-w-[280px] text-sm text-zinc-500">
                                                {item.description?.trim() ? item.description : '—'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm font-medium text-zinc-900">
                                                {item.categoryId?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className="text-sm font-semibold text-zinc-900">NRs. {item.price.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
                                                ${item.status === 'Active'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-zinc-100 text-zinc-600'
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
                                                    title="Edit item"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                                    title="Delete item"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer with Pagination */}
                {!isLoading && menuItems.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-200 px-4 py-4">
                        <span className="text-sm text-zinc-500">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, menuItems.length)} of {menuItems.length} item{menuItems.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.ceil(menuItems.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`h-8 w-8 text-sm font-medium rounded-lg border transition-colors ${
                                            currentPage === page
                                                ? 'bg-[#FF5C00] text-white border-[#FF5C00]'
                                                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(Math.min(Math.ceil(menuItems.length / itemsPerPage), currentPage + 1))}
                                disabled={currentPage === Math.ceil(menuItems.length / itemsPerPage)}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            >
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-xl bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Item Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Chicken Biryani"
                            className="w-full rounded-lg bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Price (NRs) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0"
                                className="w-full rounded-lg bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Original Price</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.originalPrice}
                                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                placeholder="Optional"
                                className="w-full rounded-lg bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Category *</label>
                            <select
                                required
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full rounded-lg bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full rounded-lg bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Description</label>
                        <textarea
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Optional description..."
                            className="w-full rounded-lg bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20 resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Image URL</label>
                        <input
                            type="url"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://example.com/dish.jpg"
                            className="w-full rounded-lg bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { setIsModalOpen(false); resetForm(); }}
                            className="flex-1 rounded-lg bg-zinc-100 py-2.5 text-[13px] font-bold text-zinc-600 transition-colors hover:bg-zinc-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
                            className="flex-1 rounded-lg bg-[#FF5C00] py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#e65300] disabled:opacity-50"
                        >
                            {(createMenuItemMutation.isPending || updateMenuItemMutation.isPending) ? (
                                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                            ) : editingItem ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationDialog
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setDeletingItem(null); }}
                onConfirm={confirmDelete}
                title="Delete Menu Item"
                message={`Delete "${deletingItem?.name}"? This cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMenuItemMutation.isPending}
            />
        </div>
    );
}
