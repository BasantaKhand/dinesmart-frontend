"use client";

import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Grid, Loader2, Users } from 'lucide-react';
import { Modal } from '@/features/admin/components/ui/modal';
import ConfirmationDialog from '@/features/admin/components/ui/confirmation-dialog';
import { toast } from 'react-toastify';
import {
  useGetTables,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
} from '@/hooks/useTables';
import type { Table } from '@/api/table.api';

export default function TablesPage() {
    // Use react-query hooks
    const { data: tablesResponse, isLoading, error: fetchError } = useGetTables();
    const createTableMutation = useCreateTable();
    const updateTableMutation = useUpdateTable();
    const deleteTableMutation = useDeleteTable();

    const tables = tablesResponse?.data || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTable, setDeletingTable] = useState<Table | null>(null);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form state
    const [formData, setFormData] = useState({
        number: '',
        capacity: '4',
        status: 'AVAILABLE',
    });

    const filteredTables = tables.filter(table =>
        table.number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;

    const tableColors = [
        'bg-blue-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-orange-500',
        'bg-cyan-500',
        'bg-teal-500',
        'bg-indigo-500',
        'bg-rose-500',
    ];

    const getTableIconColor = (index: number) => tableColors[index % tableColors.length];

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
        setError('');

        try {
            const payload: { capacity: number; status: string } = {
                capacity: Number(formData.capacity),
                status: formData.status,
            };

            if (editingTable) {
                await updateTableMutation.mutateAsync({ id: editingTable._id, data: payload });
                toast.success('Table updated successfully');
            } else {
                await createTableMutation.mutateAsync(payload);
                toast.success('Table added successfully');
            }
            setIsModalOpen(false);
            resetForm();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = (table: Table) => {
        setDeletingTable(table);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingTable) return;
        try {
            await deleteTableMutation.mutateAsync(deletingTable._id);
            toast.success('Table deleted successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete table');
        } finally {
            setIsDeleteModalOpen(false);
            setDeletingTable(null);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Tables</h1>
                    <p className="text-zinc-600">Manage your restaurant layout and table status.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-lg bg-[#FF5C00] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#e65300] transition-colors"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Table
                </button>
            </div>

            {/* Tables Card */}
            <div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200">
                {/* Search + Stats */}
                <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search tables..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full rounded-lg bg-white pl-10 pr-4 text-sm text-zinc-700 border border-zinc-200 outline-none focus:border-zinc-300 placeholder:text-zinc-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-zinc-50 px-4 py-2.5">
                            <span className="text-sm text-zinc-500">Total: </span>
                            <span className="text-sm font-semibold text-zinc-700">{tables.length}</span>
                        </div>
                        <div className="rounded-lg bg-zinc-50 px-4 py-2.5">
                            <span className="text-sm text-zinc-500">Occupied: </span>
                            <span className="text-sm font-semibold text-[#FF5C00]">{occupiedTables}</span>
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
                        <p className="text-sm font-medium text-zinc-500">No tables found</p>
                        <p className="text-sm text-zinc-400 mt-1">Create your first table to get started.</p>
                    </div>
                ) : (
                    /* Tables Grid */
                    <div>
                        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {(() => {
                            const paginatedTables = filteredTables.slice(
                                (currentPage - 1) * itemsPerPage,
                                currentPage * itemsPerPage
                            );
                            return paginatedTables.map((table, index) => (
                        <div
                            key={table._id}
                            className={`group overflow-hidden rounded-xl ring-1 transition-all ${
                                table.status === 'AVAILABLE'
                                    ? 'bg-zinc-50 ring-zinc-100 hover:ring-zinc-200'
                                    : table.status === 'OCCUPIED'
                                        ? 'bg-red-50/50 ring-red-200'
                                        : 'bg-amber-50/50 ring-amber-200'
                            }`}
                        >
                            <div className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className={`flex h-12 w-12 flex-col items-start justify-center rounded-[10px] pl-2 font-bold text-white ${getTableIconColor(index)}`}>
                                        <span className="-mb-1 text-xs">{table.number.split('-')[0]}-</span>
                                        <span className="text-base leading-none">{table.number.split('-')[1] || table.number.replace('T-', '')}</span>
                                    </div>

                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
                                        ${table.status === 'AVAILABLE'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : table.status === 'OCCUPIED'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}
                                    >
                                        {table.status}
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-extrabold text-zinc-800">Table {table.number}</h3>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEditModal(table)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(table)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-rose-50 hover:text-rose-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs font-semibold text-zinc-400">
                                        {table.status === 'AVAILABLE'
                                            ? 'Ready to serve'
                                            : table.status === 'OCCUPIED'
                                                ? 'Currently serving guests'
                                                : 'Reserved for upcoming guests'}
                                    </p>
                                    <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                                        <Users size={14} className="text-zinc-400" />
                                        <span>{table.capacity} Seats</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ));
                        })()}
                        </div>
                        {/* Footer with Pagination */}
                        <div className="border-t border-zinc-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <span className="text-sm text-zinc-500">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTables.length)} of {filteredTables.length} table{filteredTables.length !== 1 ? 's' : ''}
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
                                    {Array.from({ length: Math.ceil(filteredTables.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
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
                                    onClick={() => setCurrentPage(Math.min(Math.ceil(filteredTables.length / itemsPerPage), currentPage + 1))}
                                    disabled={currentPage === Math.ceil(filteredTables.length / itemsPerPage)}
                                    className="px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingTable ? 'Edit Table' : 'Add New Table'}
            >
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-lg bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Capacity *</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none transition-colors focus:border-zinc-300"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-700">Current Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none transition-colors focus:border-zinc-300"
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
                            className="flex-1 rounded-lg border border-zinc-200 bg-white py-2.5 text-[13px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createTableMutation.isPending || updateTableMutation.isPending}
                            className="flex-1 rounded-lg bg-[#FF5C00] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#e65300] disabled:opacity-50"
                        >
                            {(createTableMutation.isPending || updateTableMutation.isPending) ? (
                                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                            ) : editingTable ? 'Update Table' : 'Create Table'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationDialog
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setDeletingTable(null); }}
                onConfirm={confirmDelete}
                title="Delete Table"
                message={`Delete Table "${deletingTable?.number}"? This cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteTableMutation.isPending}
            />
        </div>
    );
}
