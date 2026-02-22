"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, UtensilsCrossed, FolderTree, Loader2 } from 'lucide-react';
import { Modal } from '@/features/admin/components/ui/modal';
import {
    apiGetCategories,
    apiCreateCategory,
    apiUpdateCategory,
    apiDeleteCategory,
    Category,
} from '@/features/admin/services/category-service';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        status: 'Active',
    });

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await apiGetCategories();
            setCategories(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
        setIsSubmitting(true);
        setError('');

        try {
            if (editingCategory) {
                await apiUpdateCategory(editingCategory._id, formData);
            } else {
                await apiCreateCategory(formData);
            }
            setIsModalOpen(false);
            resetForm();
            await fetchCategories();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (category: Category) => {
        if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return;

        try {
            await apiDeleteCategory(category._id);
            await fetchCategories();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete category');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[26px] font-extrabold text-zinc-800 tracking-tight leading-tight">Categories</h1>
                    <p className="mt-1 text-[14px] font-normal text-zinc-400">Manage menu categories and hierarchy.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-xl bg-[#FF5C00] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#e65300] transition-all active:scale-95"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Category
                </button>
            </div>

            {/* Search + Stats */}
            <div className="flex items-center gap-3">
                <div className="relative group flex-1 max-w-lg">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#FF5C00] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 w-full rounded-xl bg-white pl-11 pr-4 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none transition-all focus:ring-2 focus:ring-[#FF5C00]/20 placeholder:text-zinc-400"
                    />
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <div className="rounded-xl bg-white px-4 py-2.5 ring-1 ring-zinc-200/60">
                        <span className="text-[12px] font-medium text-zinc-400">Total Categories: </span>
                        <span className="text-[13px] font-bold text-zinc-800">{categories.length}</span>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-2.5 ring-1 ring-zinc-200/60">
                        <span className="text-[12px] font-medium text-zinc-400">Total Items: </span>
                        <span className="text-[13px] font-bold text-zinc-800">{totalProducts}</span>
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
                    <p className="text-[15px] font-semibold text-zinc-500">No categories found</p>
                    <p className="text-[13px] text-zinc-400 mt-1">Create your first category to get started.</p>
                </div>
            ) : (
                /* Categories Grid — 2-column horizontal cards */
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {filteredCategories.map((category) => (
                        <div key={category._id} className="group rounded-2xl bg-white ring-1 ring-zinc-100 overflow-hidden transition-all hover:ring-zinc-200">
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
                                                <h3 className="text-[15px] font-bold text-zinc-800">{category.name}</h3>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold
                                                    ${category.status === 'Active'
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : 'bg-zinc-100 text-zinc-500'
                                                    }`}
                                                >
                                                    {category.status}
                                                </span>
                                            </div>
                                            <p className="text-[12px] font-medium text-zinc-400 mt-0.5">{category.slug}</p>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            <button
                                                onClick={() => openEditModal(category)}
                                                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category)}
                                                className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="mt-1.5 text-[12px] font-normal text-zinc-500 line-clamp-2 leading-relaxed">
                                        {category.description || 'No description'}
                                    </p>

                                    <div className="mt-3 flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
                                            <UtensilsCrossed size={12} className="text-zinc-400" />
                                            {category.productsCount || 0} items
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
                                            <FolderTree size={12} className="text-zinc-400" />
                                            {category.subcategoriesCount || 0} subcategories
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingCategory ? 'Edit Category' : 'Create New Category'}
            >
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-xl bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
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
                                className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
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
                            className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20 resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Image URL</label>
                        <input
                            type="text"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://..."
                            className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { setIsModalOpen(false); resetForm(); }}
                            className="flex-1 rounded-xl bg-zinc-100 py-2.5 text-[13px] font-bold text-zinc-600 transition-all hover:bg-zinc-200 active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl bg-[#FF5C00] py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#e65300] active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                            ) : editingCategory ? 'Update Category' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
