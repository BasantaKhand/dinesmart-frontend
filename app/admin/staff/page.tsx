"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, UserCog, Mail, Shield, User } from 'lucide-react';
import { Badge } from '@/features/admin/components/ui/badge';
import { Modal } from '@/features/admin/components/ui/modal';

const staff = [
    { id: 1, name: 'Ramesh Khatri', role: 'WAITER', email: 'ramesh@dinesmart.com', status: 'ACTIVE' },
    { id: 2, name: 'Sita Magar', role: 'WAITER', email: 'sita@dinesmart.com', status: 'ACTIVE' },
    { id: 3, name: 'Gopal Shrestha', role: 'CASHIER', email: 'gopal@dinesmart.com', status: 'ACTIVE' },
    { id: 4, name: 'Anita Thapa', role: 'WAITER', email: 'anita@dinesmart.com', status: 'INACTIVE' },
];

export default function StaffPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">Staff members</h1>
                    <p className="mt-1 text-[15px] font-medium text-zinc-500">Manage your restaurant employees and their roles.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-[2rem] bg-[#FF5C00] px-5 py-2.5 text-sm font-black text-white shadow-none transition-all hover:bg-[#e65300] active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Add Staff
                </button>
            </div>

            <div className="rounded-[2rem] bg-white ring-1 ring-zinc-100 overflow-hidden shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 border-b border-zinc-50">
                            <tr>
                                <th className="px-8 py-5">Employee</th>
                                <th className="px-8 py-5">Role</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 text-zinc-600">
                            {staff.map((member) => (
                                <tr key={member.id} className="group hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-[2rem] bg-zinc-100 text-zinc-400 group-hover:bg-[#FF5C00]/10 group-hover:text-[#FF5C00] transition-colors shadow-none">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="font-black text-zinc-900">{member.name}</p>
                                                <p className="text-[12px] font-medium text-zinc-400">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className="text-[#FF5C00]" />
                                            <span className="text-[13px] font-bold text-zinc-700 uppercase tracking-tight">
                                                {member.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${member.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="rounded-[2rem] p-2 text-zinc-400 hover:bg-zinc-100 hover:text-[#FF5C00] transition-colors">
                                                <UserCog size={18} />
                                            </button>
                                            <button className="rounded-[2rem] p-2 text-zinc-400 hover:bg-zinc-100 hover:text-rose-500 transition-colors">
                                                <Shield size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Staff Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Register New Staff"
            >
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <label className="text-[13px] font-black text-zinc-900 uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Rahul Sharma"
                            className="w-full rounded-[2rem] bg-zinc-50 px-4 py-3 text-[14px] font-bold text-zinc-900 ring-1 ring-zinc-100 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-black text-zinc-900 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                placeholder="name@active.com"
                                className="w-full rounded-[2rem] bg-zinc-50 px-4 py-3 text-[14px] font-bold text-zinc-900 ring-1 ring-zinc-100 outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-black text-zinc-900 uppercase tracking-wider">Role</label>
                            <select className="w-full rounded-[2rem] bg-zinc-50 px-4 py-3 text-[14px] font-bold text-zinc-900 ring-1 ring-zinc-100 outline-none focus:ring-2 focus:ring-[#FF5C00]/20">
                                <option value="WAITER">Waiter</option>
                                <option value="CASHIER">Cashier</option>
                                <option value="KITCHEN">Kitchen Staff</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 rounded-[2rem] bg-zinc-100 py-2.5 text-[14px] font-black text-zinc-500 transition-all hover:bg-zinc-200 active:scale-95 shadow-none"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-[2rem] bg-[#FF5C00] py-2.5 text-[14px] font-black text-white transition-all hover:bg-[#e65300] active:scale-95 shadow-none"
                        >
                            REGISTER STAFF
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
