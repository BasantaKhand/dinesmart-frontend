"use client";

import React from 'react';
import {
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    Eraser,
    Bookmark
} from 'lucide-react';
import type { Table } from '@/api/table.api';

interface TablesViewProps {
    tables: Table[];
    onSelectTable: (table: Table) => void;
}

const statusConfig = {
    'AVAILABLE': {
        color: 'bg-emerald-500',
        light: 'bg-emerald-50',
        text: 'text-emerald-600',
        label: 'Ready',
        icon: CheckCircle2
    },
    'OCCUPIED': {
        color: 'bg-amber-500',
        light: 'bg-amber-50',
        text: 'text-amber-600',
        label: 'Eating',
        icon: Users
    },
    'WAITING_FOR_FOOD': {
        color: 'bg-orange-500',
        light: 'bg-orange-50',
        text: 'text-orange-600',
        label: 'Waiting',
        icon: Clock
    },
    'NEEDS_CLEANING': {
        color: 'bg-rose-500',
        light: 'bg-rose-50',
        text: 'text-rose-600',
        label: 'Cleaning',
        icon: Eraser
    },
    'RESERVED': {
        color: 'bg-blue-500',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        label: 'Reserved',
        icon: Bookmark
    }
};

export default function TablesView({ tables, onSelectTable }: TablesViewProps) {
    return (
        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Floor Map</h2>
                    <p className="text-[15px] font-bold text-zinc-400 mt-2">Manage restaurant seating and active orders</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {Object.entries(statusConfig).map(([status, config]) => (
                        <div key={status} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-zinc-100 shadow-sm">
                            <div className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
                            <span className="text-[12px] font-black text-zinc-700 uppercase tracking-wider">{config.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Spatial Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {tables.map(table => {
                    const config = statusConfig[table.status as keyof typeof statusConfig] || statusConfig['AVAILABLE'];
                    const Icon = config.icon;

                    return (
                        <div
                            key={table._id}
                            onClick={() => onSelectTable(table)}
                            className={`relative bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group`}
                        >
                            {/* Table Number Badge */}
                            <div className={`absolute -top-4 -left-4 h-16 w-16 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-xl transition-transform group-hover:scale-110 z-10
                                ${config.color}`}>
                                {table.number}
                            </div>

                            {/* Status Icon Overlay (Soft) */}
                            <div className="flex justify-end mb-6">
                                <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2
                                    ${config.light} ${config.text}`}>
                                    <Icon size={14} />
                                    {config.label}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 leading-tight">Table {table.number}</h3>
                                    <p className="text-[13px] font-bold text-zinc-400 mt-1">
                                        Capacity: {table.capacity} Guests
                                    </p>
                                </div>

                                {table.status !== 'AVAILABLE' ? (
                                    <div className="pt-4 border-t border-zinc-50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-zinc-400 uppercase">Seated For</span>
                                            <span className="text-[13px] font-black text-zinc-900">42m</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-zinc-400 uppercase">Current Total</span>
                                            <span className="text-[16px] font-black text-[#FF5C00]">NRs. 2,850</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-4 h-[68px] flex items-center justify-center border-t border-zinc-50 border-dashed">
                                        <p className="text-[12px] font-bold text-zinc-300 uppercase tracking-widest">Ready for Guests</p>
                                    </div>
                                )}
                            </div>

                            {/* Hover Action Indicator */}
                            <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="px-4 py-1.5 bg-[#FF5C00] text-white text-[11px] font-black rounded-full shadow-lg">
                                    OPEN ORDER
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
