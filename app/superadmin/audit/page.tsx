"use client";

import React, { useState } from 'react';
import { Search, FileText, Loader2, Building2, User, RefreshCcw } from 'lucide-react';
import { Pagination } from '@/features/admin/components/ui/pagination';
import { useGetAuditLogs } from '@/hooks/useSuperadmin';
import type { AuditLog } from '@/api/superadmin.api';

export default function AuditLogsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 25;

    const { data: auditResponse, isLoading, refetch } = useGetAuditLogs({
        page: currentPage,
        limit,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        paymentMethod: paymentMethodFilter !== 'ALL' ? paymentMethodFilter : undefined,
    });

    const transactions = auditResponse?.data || [];
    const totalPages = auditResponse?.pagination?.totalPages || 1;

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = 
            tx.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (typeof tx.restaurantId === 'object' && tx.restaurantId?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (typeof tx.cashierId === 'object' && tx.cashierId?.email?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    const getTypeBadge = (type: string) => {
        const styles: Record<string, { bg: string; text: string }> = {
            PAYMENT_SETTLED: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
            DRAWER_OPENED: { bg: 'bg-blue-100', text: 'text-blue-800' },
            DRAWER_CLOSED: { bg: 'bg-zinc-100', text: 'text-zinc-600' },
            PAYMENT_OVERRIDE: { bg: 'bg-amber-100', text: 'text-amber-800' },
            MANUAL_ADJUSTMENT: { bg: 'bg-red-100', text: 'text-red-800' },
        };
        const style = styles[type] || { bg: 'bg-zinc-100', text: 'text-zinc-600' };
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                {type.replace(/_/g, ' ')}
            </span>
        );
    };

    const getPaymentBadge = (method: string) => {
        const styles: Record<string, { bg: string; text: string }> = {
            CASH: { bg: 'bg-zinc-100', text: 'text-zinc-700' },
            CARD: { bg: 'bg-blue-100', text: 'text-blue-800' },
            QR: { bg: 'bg-green-100', text: 'text-green-800' },
            CREDIT: { bg: 'bg-purple-100', text: 'text-purple-800' },
        };
        const style = styles[method] || { bg: 'bg-zinc-100', text: 'text-zinc-600' };
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                {method}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatCurrency = (amount: number) => {
        return `Rs ${Math.abs(amount).toLocaleString()}`;
    };

    if (isLoading && transactions.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF5C00]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Audit Logs</h1>
                <p className="text-zinc-600">System-wide transaction history and financial audit trail</p>
            </div>

            {/* Table Card with Filters */}
            <div className="bg-white rounded-xl ring-1 ring-zinc-200 overflow-hidden">
                {/* Search + Filters */}
                <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full pl-10 pr-4 rounded-lg border border-zinc-200 text-sm focus:border-zinc-300 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                            className="h-10 px-3 pr-8 rounded-lg border border-zinc-200 text-sm focus:border-zinc-300 outline-none bg-white"
                        >
                            <option value="ALL">All Types</option>
                            <option value="PAYMENT_SETTLED">Payment Settled</option>
                            <option value="DRAWER_OPENED">Drawer Opened</option>
                            <option value="DRAWER_CLOSED">Drawer Closed</option>
                            <option value="PAYMENT_OVERRIDE">Payment Override</option>
                            <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
                        </select>
                        <select
                            value={paymentMethodFilter}
                            onChange={(e) => { setPaymentMethodFilter(e.target.value); setCurrentPage(1); }}
                            className="h-10 px-3 pr-8 rounded-lg border border-zinc-200 text-sm focus:border-zinc-300 outline-none bg-white"
                        >
                            <option value="ALL">All Methods</option>
                            <option value="CASH">Cash</option>
                            <option value="CARD">Card</option>
                            <option value="QR">QR</option>
                            <option value="CREDIT">Credit</option>
                        </select>
                        <button
                            onClick={() => refetch()}
                            className="h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
                        >
                            <RefreshCcw className="h-4 w-4 text-zinc-600" />
                        </button>
                    </div>
                </div>

                {/* Transactions Table */}
                {filteredTransactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                        <p className="text-sm text-zinc-500">No transactions found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Date</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Restaurant</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Order</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Payment</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Cashier</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction._id} className="hover:bg-zinc-50">
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-zinc-600">{formatDate(transaction.createdAt || '')}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-zinc-400" />
                                                <span className="text-sm font-medium text-zinc-900">
                                                    {typeof transaction.restaurantId === 'object' 
                                                        ? transaction.restaurantId?.name 
                                                        : '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {getTypeBadge(transaction.type)}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-zinc-600">
                                            {transaction.orderNumber || 
                                                (typeof transaction.orderId === 'object' ? transaction.orderId?.orderNumber : '—')}
                                        </td>
                                        <td className="px-4 py-4">
                                            {transaction.paymentMethod ? (
                                                getPaymentBadge(transaction.paymentMethod)
                                            ) : (
                                                <span className="text-sm text-zinc-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-zinc-400" />
                                                <span className="text-sm text-zinc-600">
                                                    {typeof transaction.cashierId === 'object' 
                                                        ? transaction.cashierId?.name || transaction.cashierId?.email 
                                                        : '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className={`text-sm font-semibold ${
                                                transaction.type === 'MANUAL_ADJUSTMENT' && transaction.amount < 0 
                                                    ? 'text-red-600' 
                                                    : 'text-emerald-600'
                                            }`}>
                                                {transaction.amount < 0 ? '-' : '+'}
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-4 border-t border-zinc-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
