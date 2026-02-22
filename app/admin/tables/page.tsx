"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Grid, Loader2, Users } from 'lucide-react';
import { Modal } from '@/features/admin/components/ui/modal';
import {
    apiGetTables,
    apiCreateTable,
    apiUpdateTable,
    apiDeleteTable,
    Table,
} from '@/features/admin/services/table-service';

export default function TablesPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        number: '',
        capacity: '4',
        status: 'AVAILABLE',
    });

    const fetchTables = async () => {
        try {
            setIsLoading(true);
            const response = await apiGetTables();
            setTables(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load tables');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const filteredTables = tables.filter(table =>
        table.number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;

    const resetForm = () => {
        setFormData({ number: '', capacity: '4', status: 'AVAILABLE' });
        setEditingTable(null);
        setError('');
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (table: Table) => {
        setEditingTable(table);
        setFormData({
            number: table.number,
            capacity: String(table.capacity),
            status: table.status,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const payload = {
                ...formData,
                capacity: Number(formData.capacity),
            };

            if (editingTable) {
                await apiUpdateTable(editingTable._id, payload);
            } else {
                await apiCreateTable(payload);
            }
            setIsModalOpen(false);
            resetForm();
            await fetchTables();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (table: Table) => {
        if (!confirm(`Delete Table "${table.number}"? This cannot be undone.`)) return;

        try {
            await apiDeleteTable(table._id);
            await fetchTables();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete table');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[26px] font-extrabold text-zinc-800 tracking-tight leading-tight">Tables</h1>
                    <p className="mt-1 text-[14px] font-normal text-zinc-400">Manage your restaurant layout and table status.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-xl bg-[#FF5C00] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#e65300] transition-all active:scale-95"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Table
                </button>
            </div>

            {/* Search + Stats */}
            <div className="flex items-center gap-3">
                <div className="relative group flex-1 max-w-lg">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#FF5C00] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search tables..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 w-full rounded-xl bg-white pl-11 pr-4 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none transition-all focus:ring-2 focus:ring-[#FF5C00]/20 placeholder:text-zinc-400"
                    />
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <div className="rounded-xl bg-white px-4 py-2.5 ring-1 ring-zinc-200/60">
                        <span className="text-[12px] font-medium text-zinc-400">Total Tables: </span>
                        <span className="text-[13px] font-bold text-zinc-800">{tables.length}</span>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-2.5 ring-1 ring-zinc-200/60">
                        <span className="text-[12px] font-medium text-zinc-400">Occupied: </span>
                        <span className="text-[13px] font-bold text-[#FF5C00]">{occupiedTables}</span>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-[#FF5C00]" />
                </div>
            ) : filteredTables.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Grid size={40} className="text-zinc-300 mb-3" />
                    <p className="text-[15px] font-semibold text-zinc-500">No tables found</p>
                    <p className="text-[13px] text-zinc-400 mt-1">Create your first table to get started.</p>
                </div>
            ) : (
                /* Tables Grid */
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredTables.map((table) => (
                        <div key={table._id} className="group rounded-2xl bg-white ring-1 ring-zinc-100 overflow-hidden transition-all hover:ring-zinc-200">
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors
                                        ${table.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' :
                                            table.status === 'OCCUPIED' ? 'bg-orange-50 text-[#FF5C00]' :
                                                'bg-zinc-50 text-zinc-400'}`}>
                                        <Grid size={24} />
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold
                                        ${table.status === 'AVAILABLE'
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : table.status === 'OCCUPIED'
                                                ? 'bg-orange-50 text-[#FF5C00]'
                                                : 'bg-zinc-100 text-zinc-500'
                                        }`}
                                    >
                                        {table.status}
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[17px] font-extrabold text-zinc-800">Table {table.number}</h3>
                                        <div className="flex items-center gap-0.5">
                                            <button
                                                onClick={() => openEditModal(table)}
                                                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(table)}
                                                className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                                        <Users size={14} className="text-zinc-400" />
                                        <span>{table.capacity} Seats</span>
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
                title={editingTable ? 'Edit Table' : 'Add New Table'}
            >
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-xl bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Table Number *</label>
                            <input
                                type="text"
                                required
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                placeholder="e.g. T-01"
                                className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Capacity *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-700 uppercase tracking-wider">Current Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200/60 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                        >
                            <option value="AVAILABLE">Available</option>
                            <option value="OCCUPIED">Occupied</option>
                            <option value="RESERVED">Reserved</option>
                        </select>
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
                            ) : editingTable ? 'Update Table' : 'Create Table'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
