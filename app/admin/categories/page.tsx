"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, UtensilsCrossed, Loader2 } from 'lucide-react';
import { Modal } from '@/features/admin/components/ui/modal';
import ConfirmationDialog from '@/features/admin/components/ui/confirmation-dialog';
import { toast } from 'react-toastify';
import {
    useGetCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from '@/hooks/useCategories';
import type { Category } from '@/api/category.api';

export default function CategoriesPage() {
    const { data: categoriesResponse, isLoading } = useGetCategories();
    const createCategoryMutation = useCreateCategory();
    const updateCategoryMutation = useUpdateCategory();
    const deleteCategoryMutation = useDeleteCategory();

    const categories = categoriesResponse?.data || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        status: 'Active',
    });

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalProducts = categories.reduce((sum, cat) => sum + (cat.productsCount || 0), 0);

    const resetForm = () => {
        setFormData({ name: '', description: '', image: '', status: 'Active' });
        setEditingCategory(null);
        setError('');
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            image: category.image || '',
            status: category.status,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (editingCategory) {
                await updateCategoryMutation.mutateAsync({ id: editingCategory._id, data: formData });
                toast.success('Category updated successfully');
            } else {
                await createCategoryMutation.mutateAsync(formData);
                toast.success('Category added successfully');
            }
            setIsModalOpen(false);
            resetForm();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = (category: Category) => {
        setDeletingCategory(category);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingCategory) return;
        try {
            await deleteCategoryMutation.mutateAsync(deletingCategory._id);
            toast.success('Category deleted successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete category');
        } finally {
            setIsDeleteModalOpen(false);
            setDeletingCategory(null);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Categories</h1>
                    <p className="text-zinc-600">Manage menu categories and hierarchy.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-lg bg-[#FF5C00] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#e65300] transition-colors"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Category
                </button>
            </div>

            {/* Categories Card */}
            <div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200">
                {/* Search + Stats */}
                <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full rounded-lg bg-white pl-10 pr-4 text-sm text-zinc-700 border border-zinc-200 outline-none focus:border-zinc-300 placeholder:text-zinc-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-zinc-50 px-4 py-2.5">
                            <span className="text-sm text-zinc-500">Total: </span>
                            <span className="text-sm font-semibold text-zinc-700">{categories.length}</span>
                        </div>
                        <div className="rounded-lg bg-zinc-50 px-4 py-2.5">
                            <span className="text-sm text-zinc-500">Items: </span>
                            <span className="text-sm font-semibold text-zinc-700">{totalProducts}</span>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-[#FF5C00]" />
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <UtensilsCrossed className="h-10 w-10 text-zinc-300 mb-3" />
                        <p className="text-sm font-medium text-zinc-500">No categories found</p>
                        <p className="text-sm text-zinc-400 mt-1">Create your first category to get started.</p>
                    </div>
                ) : (
                    /* Categories Grid — 2-column horizontal cards */
                    <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
                    {paginatedCategories.map((category) => (
                        <div key={category._id} className="group rounded-xl bg-zinc-50 ring-1 ring-zinc-100 overflow-hidden transition-all hover:ring-zinc-200">
                            <div className="flex gap-4 p-4">
                                {/* Image */}
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-orange-50">
                                            <UtensilsCrossed className="h-8 w-8 text-[#FF5C00]" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-[17px] font-bold text-zinc-800">{category.name}</h3>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold
                                                    ${category.status === 'Active'
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : 'bg-zinc-100 text-zinc-500'
                                                    }`}
                                                >
                                                    {category.status}
                                                </span>
                                            </div>
                                            <p className="text-[13px] font-medium text-zinc-400 mt-0.5">{category.slug}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(category)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-rose-50 hover:text-rose-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="mt-1.5 text-[13px] font-normal text-zinc-500 line-clamp-2 leading-relaxed">
                                        {category.description || 'No description'}
                                    </p>

                                    <div className="mt-2 flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-500">
                                            <UtensilsCrossed size={12} className="text-zinc-400" />
                                            {category.productsCount || 0} items
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {/* Pagination */}
                {filteredCategories.length > 0 && (
                    <div className="border-t border-zinc-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <span className="text-sm text-zinc-500">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
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
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
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

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingCategory ? 'Edit Category' : 'Create New Category'}
            >
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-lg bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Category Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Italian Pasta"
                                className="w-full rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-800 border border-zinc-200 outline-none focus:border-zinc-300"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-800 border border-zinc-200 outline-none focus:border-zinc-300"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe what this category contains..."
                            className="w-full rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-800 border border-zinc-200 outline-none focus:border-zinc-300 resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Image URL</label>
                        <input
                            type="text"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://..."
                            className="w-full rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-800 border border-zinc-200 outline-none focus:border-zinc-300"
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
                            disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                            className="flex-1 rounded-lg bg-[#FF5C00] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#e65300] disabled:opacity-50"
                        >
                            {(createCategoryMutation.isPending || updateCategoryMutation.isPending) ? (
                                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                            ) : editingCategory ? 'Update Category' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationDialog
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setDeletingCategory(null); }}
                onConfirm={confirmDelete}
                title="Delete Category"
                message={`Delete "${deletingCategory?.name}"? This will also delete all items in this category.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteCategoryMutation.isPending}
            />
        </div>
    );
}
