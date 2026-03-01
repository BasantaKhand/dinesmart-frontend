"use client";

import React, { useState } from 'react';
import { 
    Activity, 
    Search, 
    Loader2, 
    AlertCircle, 
    Info, 
    AlertTriangle,
    User,
    Building2,
    RefreshCcw
} from 'lucide-react';
import { Pagination } from '@/features/admin/components/ui/pagination';
import { useGetSystemActivity } from '@/hooks/useSuperadmin';
import type { ActivityLog } from '@/api/superadmin.api';

export default function SystemActivityPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [severityFilter, setSeverityFilter] = useState<string>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 20;

    const { data: activityResponse, isLoading, refetch } = useGetSystemActivity({
        page: currentPage,
        limit,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        severity: severityFilter !== 'ALL' ? severityFilter : undefined,
    });

    const activities = activityResponse?.data || [];
    const totalPages = activityResponse?.pagination?.totalPages || 1;

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = 
            activity.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.restaurantName?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const getSeverityBadge = (severity: string) => {
        const badges: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
            INFO: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Info className="w-4 h-4" /> },
            WARNING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <AlertTriangle className="w-4 h-4" /> },
            ERROR: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle className="w-4 h-4" /> },
            CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle className="w-4 h-4" /> },
        };
        const badge = badges[severity] || badges.INFO;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.icon}
                {severity}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        let bg = 'bg-zinc-100';
        let text = 'text-zinc-600';
        
        if (type.includes('LOGIN') || type.includes('LOGOUT') || type.includes('PASSWORD')) {
            bg = 'bg-purple-100'; text = 'text-purple-800';
        } else if (type.includes('RESTAURANT')) {
            bg = 'bg-green-100'; text = 'text-green-800';
        } else if (type.includes('USER') || type.includes('STAFF') || type.includes('ROLE')) {
            bg = 'bg-blue-100'; text = 'text-blue-800';
        } else if (type.includes('SUBSCRIPTION') || type.includes('PAYMENT')) {
            bg = 'bg-yellow-100'; text = 'text-yellow-800';
        } else if (type.includes('ERROR')) {
            bg = 'bg-red-100'; text = 'text-red-800';
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
                {type.replace(/_/g, ' ')}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const activityTypes = [
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_REGISTERED',
        'PASSWORD_RESET',
        'LOGIN_FAILED',
        'PROFILE_UPDATED',
        'RESTAURANT_CREATED',
        'RESTAURANT_ACTIVATED',
        'RESTAURANT_SUSPENDED',
        'RESTAURANT_DELETED',
        'STAFF_INVITED',
        'STAFF_REMOVED',
        'ROLE_CHANGED',
        'SUBSCRIPTION_CREATED',
        'SUBSCRIPTION_ACTIVATED',
        'SUBSCRIPTION_EXPIRED',
        'PAYMENT_RECEIVED',
        'SYSTEM_ERROR',
        'API_ERROR',
        'DATABASE_ERROR',
    ];

    if (isLoading && activities.length === 0) {
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
                <h1 className="text-2xl font-bold text-zinc-900">System Activity</h1>
                <p className="text-zinc-600">Real-time system activity and event logs</p>
            </div>

            {/* Table Card with Filters */}
            <div className="bg-white rounded-xl ring-1 ring-zinc-200 overflow-hidden">
                {/* Search + Filters */}
                <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search activity..."
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
                            {activityTypes.map(type => (
                                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                        <select
                            value={severityFilter}
                            onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
                            className="h-10 px-3 pr-8 rounded-lg border border-zinc-200 text-sm focus:border-zinc-300 outline-none bg-white"
                        >
                            <option value="ALL">All Severity</option>
                            <option value="INFO">Info</option>
                            <option value="WARNING">Warning</option>
                            <option value="ERROR">Error</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                        <button
                            onClick={() => refetch()}
                            className="h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
                        >
                            <RefreshCcw className="h-4 w-4 text-zinc-600" />
                        </button>
                    </div>
                </div>

                {/* Activity Table */}
                {filteredActivities.length === 0 ? (
                    <div className="p-12 text-center">
                        <Activity className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                        <p className="text-sm text-zinc-500">No activity found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Event</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Severity</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">User</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Restaurant</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredActivities.map((activity) => (
                                    <tr key={activity._id} className="hover:bg-zinc-50">
                                        <td className="px-4 py-4">
                                            {getTypeBadge(activity.type)}
                                            <p className="text-sm text-zinc-600 mt-1 max-w-md">
                                                {activity.message}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {getSeverityBadge(activity.severity)}
                                        </td>
                                        <td className="px-4 py-4">
                                            {activity.userEmail ? (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-zinc-400" />
                                                    <div>
                                                        <span className="text-sm font-medium text-zinc-900">
                                                            {activity.userName || activity.userEmail}
                                                        </span>
                                                        {activity.userRole && (
                                                            <p className="text-xs text-zinc-500">{activity.userRole}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-zinc-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {activity.restaurantName ? (
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-zinc-400" />
                                                    <span className="text-sm font-medium text-zinc-900">
                                                        {activity.restaurantName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-zinc-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-zinc-600">{formatDate(activity.createdAt)}</p>
                                            {activity.ipAddress && (
                                                <p className="text-xs text-zinc-400 mt-0.5">IP: {activity.ipAddress}</p>
                                            )}
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
