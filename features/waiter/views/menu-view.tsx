"use client";

import React, { useState } from 'react';
import {
    Search,
    Plus,
    Minus,
    Trash2,
    ChefHat,
    Utensils,
    ShoppingBag,
    ArrowLeft,
    Filter
} from 'lucide-react';
import { Category } from '@/features/admin/services/category-service';
import { MenuItem } from '@/features/admin/services/menu-item-service';

interface MenuViewProps {
    categories: Category[];
    menuItems: MenuItem[];
    onBack: () => void;
}

export default function MenuView({ categories, menuItems, onBack }: MenuViewProps) {
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<any[]>([]);

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.categoryId?.name === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i._id === itemId) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i._id !== itemId));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="flex h-full overflow-hidden animate-in fade-in duration-500">
            {/* Left Column: Menu Items */}
            <div className="flex-1 flex flex-col bg-zinc-50/50 overflow-hidden">
                {/* Search & Back */}
                <div className="p-8 pb-4 flex items-center gap-6">
                    <button
                        onClick={onBack}
                        className="h-12 w-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all shadow-sm"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-[#FF5C00] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search dishes, drinks, or desserts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 w-full pl-12 pr-6 bg-white border border-zinc-100 rounded-[1.25rem] text-[15px] font-bold text-zinc-900 placeholder:text-zinc-400 focus:ring-4 focus:ring-[#FF5C00]/5 transition-all outline-none shadow-sm"
                        />
                    </div>
                    <button className="h-14 px-6 rounded-[1.25rem] bg-white border border-zinc-100 flex items-center gap-2 text-zinc-500 font-bold shadow-sm">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>

                {/* Categories Strip */}
                <div className="px-8 py-4 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
                    <button
                        onClick={() => setActiveCategory('All')}
                        className={`flex-shrink-0 px-6 py-3.5 rounded-2xl text-[14px] font-black tracking-tight transition-all
                            ${activeCategory === 'All'
                                ? 'bg-[#FF5C00] text-white shadow-lg shadow-orange-500/20'
                                : 'bg-white text-zinc-500 border border-zinc-100 hover:border-zinc-200 shadow-sm'}`}
                    >
                        All Categories
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`flex-shrink-0 px-6 py-3.5 rounded-2xl text-[14px] font-black tracking-tight transition-all
                                ${activeCategory === cat.name
                                    ? 'bg-[#FF5C00] text-white shadow-lg shadow-orange-500/20'
                                    : 'bg-white text-zinc-500 border border-zinc-100 hover:border-zinc-200 shadow-sm'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-8 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                            <div
                                key={item._id}
                                onClick={() => addToCart(item)}
                                className="group bg-white rounded-[2rem] p-5 border border-zinc-100/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                            >
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 mb-5">
                                    <img
                                        src={item.image || `https://source.unsplash.com/800x600/?${item.name.toLowerCase().replace(/[^a-z]/g, ',')}`}
                                        alt={item.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <div className="px-2.5 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-black text-[#FF5C00] shadow-sm uppercase tracking-tighter">
                                            {item.categoryId?.name}
                                        </div>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                                        <button className="w-full h-10 bg-[#FF5C00] text-white text-[12px] font-black rounded-xl shadow-lg shadow-orange-500/20">
                                            ADD TO ORDER
                                        </button>
                                    </div>
                                </div>
                                <h4 className="text-[17px] font-black text-zinc-900 group-hover:text-[#FF5C00] transition-colors">{item.name}</h4>
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-[18px] font-black text-zinc-900 leading-none">
                                        <span className="text-[12px] text-zinc-400 mr-1 font-bold">NRs.</span>
                                        {item.price.toLocaleString()}
                                    </p>
                                    <div className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-[#FF5C00] group-hover:text-white transition-all shadow-sm">
                                        <Plus size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Checkout Sidebar */}
            <div className="w-[450px] bg-white border-l border-zinc-100 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
                <div className="p-8 pb-6 border-b border-zinc-50 relative">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF5C00]">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Order Details</h3>
                                <p className="text-[12px] font-bold text-zinc-400">Manage items and quantities</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                        <div className="h-10 w-10 bg-white rounded-xl border border-zinc-100 flex items-center justify-center text-zinc-400">
                            <Utensils size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Serving to</p>
                            <p className="text-[15px] font-black text-zinc-900">Table #04 (Ground Floor)</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-8 py-6 space-y-6">
                    {cart.map(item => (
                        <div key={item._id} className="flex gap-4 group animate-in slide-in-from-right-4 duration-300">
                            <div className="h-20 w-20 rounded-2xl bg-zinc-100 flex-shrink-0 overflow-hidden">
                                <img
                                    src={item.image || `https://source.unsplash.com/200x200/?${item.name.toLowerCase().replace(/[^a-z]/g, ',')}`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <h5 className="text-[15px] font-black text-zinc-900 line-clamp-2 leading-tight">{item.name}</h5>
                                    <p className="text-[15px] font-black text-zinc-900 whitespace-nowrap">NRs. {(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3 bg-zinc-50 px-2 py-1 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item._id, -1)}
                                                className="h-6 w-6 rounded-md hover:bg-white hover:shadow-sm flex items-center justify-center text-zinc-400 hover:text-rose-500 transition-all"
                                            >
                                                <Minus size={14} strokeWidth={3} />
                                            </button>
                                            <span className="text-[14px] font-black text-zinc-900 w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, 1)}
                                                className="h-6 w-6 rounded-md hover:bg-white hover:shadow-sm flex items-center justify-center text-zinc-400 hover:text-emerald-500 transition-all"
                                            >
                                                <Plus size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="h-8 w-8 text-zinc-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 pt-20">
                            <div className="h-24 w-24 bg-zinc-50 rounded-[2rem] flex items-center justify-center text-zinc-200 mb-6">
                                <Utensils size={48} />
                            </div>
                            <h4 className="text-[18px] font-black text-zinc-400">Cart is Empty</h4>
                            <p className="text-[13px] font-bold text-zinc-300 px-10">Choose some delicious items from the menu to start ordering</p>
                        </div>
                    )}
                </div>

                <div className="p-8 pt-6 border-t border-zinc-50 bg-zinc-50/30">
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-[15px] font-bold text-zinc-400">
                            <span>Subtotal</span>
                            <span className="text-zinc-900 font-black">NRs. {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[15px] font-bold text-zinc-400">
                            <span>Service Charge (5%)</span>
                            <span className="text-zinc-900 font-black">NRs. {(subtotal * 0.05).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end pt-4 border-t border-zinc-100">
                            <span className="text-[16px] font-black text-zinc-900 uppercase tracking-tight">Total Payable</span>
                            <span className="text-3xl font-black text-[#FF5C00]">NRs. {(subtotal * 1.05).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 h-16 bg-zinc-100 rounded-2xl text-[15px] font-black text-zinc-600 hover:bg-zinc-200 transition-all active:scale-95 uppercase tracking-tight">
                            Save Note
                        </button>
                        <button
                            disabled={cart.length === 0}
                            className="flex-[2] h-16 bg-[#FF5C00] rounded-2xl text-[15px] font-black text-white shadow-xl shadow-orange-500/20 hover:bg-[#e65300] transition-all active:scale-98 disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-3 uppercase tracking-tight"
                        >
                            <ChefHat size={20} />
                            Send to Kitchen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
