"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, Filter, ArrowUpDown, Loader2, UtensilsCrossed } from 'lucide-react';
import { Modal } from '@/features/admin/components/ui/modal';
import {
    apiGetMenuItems,
    apiCreateMenuItem,
    apiUpdateMenuItem,
    apiDeleteMenuItem,
    MenuItem,
} from '@/features/admin/services/menu-item-service';
import {
    apiGetCategories,
    Category,
} from '@/features/admin/services/category-service';

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [error, setError] = useState('');

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

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [itemsRes, catsRes] = await Promise.all([
                apiGetMenuItems({ search: searchQuery || undefined }),
                apiGetCategories(),
            ]);
            setMenuItems(itemsRes.data);
            setCategories(catsRes.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const resetForm = () => {
        setFormData({ name: '', description: '', image: '', price: '', originalPrice: '', categoryId: '', status: 'Active' });
        setEditingItem(null);
        setError('');
    };

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
        setIsSubmitting(true);
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
                await apiUpdateMenuItem(editingItem._id, payload);
            } else {
                await apiCreateMenuItem(payload);
            }
            setIsModalOpen(false);
            resetForm();
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (item: MenuItem) => {
        if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

        try {
            await apiDeleteMenuItem(item._id);
            await fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete item');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[26px] font-extrabold text-zinc-800 tracking-tight leading-tight">Menu Items</h1>
                    <p className="mt-1 text-[14px] font-normal text-zinc-400">Manage your restaurant menu inventory</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-xl bg-[#FF5C00] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#e65300] transition-all active:scale-95"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Item
                </button>
            </div>

            {/* Table Card */}
            <div className="rounded-2xl bg-white ring-1 ring-zinc-100 overflow-hidden">
                {/* Search + Filters */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100">
                    <div className="relative group flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#FF5C00] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-full rounded-lg bg-zinc-50 pl-9 pr-3 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#FF5C00]/20 placeholder:text-zinc-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold text-zinc-600 ring-1 ring-zinc-200/60 hover:bg-zinc-50 transition-all">
                            <Filter size={14} />
                            Filter
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold text-zinc-600 ring-1 ring-zinc-200/60 hover:bg-zinc-50 transition-all">
                            <ArrowUpDown size={14} />
                            Sort
                        </button>
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
                        <p className="text-[15px] font-semibold text-zinc-500">No menu items found</p>
                        <p className="text-[13px] text-zinc-400 mt-1">Add your first menu item to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50/50 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                                <tr>
                                    <th className="px-6 py-3">Item</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Price</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {menuItems.map((item) => (
                                    <tr key={item._id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-10 w-10 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF5C00]">
                                                        <span className="text-[14px] font-bold">{item.name.charAt(0)}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[13px] font-semibold text-zinc-800">{item.name}</p>
                                                    <p className="text-[11px] font-medium text-[#FF5C00]">{item.code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="text-[13px] font-medium text-zinc-600">
                                                {item.categoryId?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div>
                                                <span className="text-[13px] font-bold text-zinc-800">NRs. {item.price.toLocaleString()}</span>
                                                {item.originalPrice && (
                                                    <span className="ml-1.5 text-[11px] font-medium text-zinc-400 line-through">
                                                        NRs. {item.originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold
                                                ${item.status === 'Active'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-zinc-100 text-zinc-500'
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                {!isLoading && menuItems.length > 0 && (
                    <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3">
                        <span className="text-[12px] font-medium text-zinc-400">
                            Showing {menuItems.length} item{menuItems.length !== 1 ? 's' : ''}
                        </span>
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
                            className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
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
                                className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
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
                                className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
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
                                className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
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
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Optional description..."
                            className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20 resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Image URL</label>
                        <input
                            type="url"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://example.com/dish.jpg"
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
                            ) : editingItem ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
