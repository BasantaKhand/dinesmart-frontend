"use client";

import React, { useState } from 'react';
import {
    X,
    Receipt,
    Percent,
    ChevronRight,
    Trash2,
    Plus,
    Minus,
    Calculator,
    CheckCircle2,
    Printer
} from 'lucide-react';
import ConfirmationDialog from '@/features/admin/components/ui/confirmation-dialog';
import { toast } from 'react-toastify';
import { useMarkBillPrinted } from '@/hooks/useOrders';

interface BillingViewProps {
    order: any;
    onClose: () => void;
    onBillPrinted?: () => void;
}

export default function BillingView({ order, onClose, onBillPrinted }: BillingViewProps) {
    const [view, setView] = useState<'PREVIEW' | 'SPLIT'>('PREVIEW');
    const [selectedItemsForSplit, setSelectedItemsForSplit] = useState<string[]>([]);
    const [discount, setDiscount] = useState({ value: 0, type: 'FIXED' });
    const [printed, setPrinted] = useState(order.billPrinted || false);
    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
    const markBillPrintedMutation = useMarkBillPrinted();

    const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const discountAmount = discount.type === 'PERCENTAGE' ? (subtotal * discount.value) / 100 : discount.value;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const tax = taxableAmount * 0.13;
    const total = taxableAmount + tax;

    const handleCloseAttempt = () => {
        if (!printed) {
            setShowCloseConfirmation(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = async () => {
        try {
            await markBillPrintedMutation.mutateAsync(order._id);
            setPrinted(true);
            setShowCloseConfirmation(false);
            
            // Notify parent to refresh order data
            if (onBillPrinted) {
                onBillPrinted();
            }
            
            onClose();
        } catch (error: any) {
            console.error('Failed to mark bill as printed:', error);
            toast.error('Failed to update bill status. Please try again.');
        }
    };

    // Calculate split bill totals for selected items
    const selectedItems = order.items.filter((item: any) => selectedItemsForSplit.includes(item._id));
    const remainingItems = order.items.filter((item: any) => !selectedItemsForSplit.includes(item._id));
    
    const splitSubtotal = selectedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const splitDiscountAmount = discount.type === 'PERCENTAGE' ? (splitSubtotal * discount.value) / 100 : discount.value;
    const splitTaxableAmount = Math.max(0, splitSubtotal - splitDiscountAmount);
    const splitTax = splitTaxableAmount * 0.13;
    const splitTotal = splitTaxableAmount + splitTax;

    const remainingSubtotal = remainingItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const remainingDiscountAmount = discount.type === 'PERCENTAGE' ? (remainingSubtotal * discount.value) / 100 : discount.value;
    const remainingTaxableAmount = Math.max(0, remainingSubtotal - remainingDiscountAmount);
    const remainingTax = remainingTaxableAmount * 0.13;
    const remainingTotal = remainingTaxableAmount + remainingTax;

    const printSplitBill = () => {
        // Create a print-friendly version with both split bills
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Split Bills - Table ${order.tableId?.number}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { margin-bottom: 10px; }
                        .info { color: #666; font-size: 14px; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        .totals { margin-top: 20px; text-align: right; }
                        .totals div { padding: 5px 0; }
                        .final-total { font-size: 18px; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 2px solid #333; }
                        .bill-section { margin-bottom: 60px; page-break-after: always; }
                        .bill-section:last-child { page-break-after: auto; }
                        .bill-header { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #FF5C00; margin-bottom: 20px; }
                        @media print {
                            .bill-section { page-break-after: always; }
                        }
                    </style>
                </head>
                <body>
                    <div class="bill-section">
                        <div class="bill-header">
                            <h2>Bill 1 - Table ${order.tableId?.number.replace('T-', '')}</h2>
                            <div class="info">Order #${order.orderNumber} - Split Bill (${selectedItems.length} items)</div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${selectedItems.map((item: any) => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>NRs. ${item.price}</td>
                                        <td>NRs. ${item.total}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="totals">
                            <div>Subtotal: NRs. ${splitSubtotal.toFixed(2)}</div>
                            ${discount.value > 0 ? `<div>Discount: - NRs. ${splitDiscountAmount.toFixed(2)}</div>` : ''}
                            <div>VAT (13%): NRs. ${splitTax.toFixed(2)}</div>
                            <div class="final-total">Total: NRs. ${splitTotal.toFixed(2)}</div>
                        </div>
                    </div>

                    ${remainingItems.length > 0 ? `
                    <div class="bill-section">
                        <div class="bill-header">
                            <h2>Bill 2 - Table ${order.tableId?.number.replace('T-', '')}</h2>
                            <div class="info">Order #${order.orderNumber} - Split Bill (${remainingItems.length} items)</div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${remainingItems.map((item: any) => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>NRs. ${item.price}</td>
                                        <td>NRs. ${item.total}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="totals">
                            <div>Subtotal: NRs. ${remainingSubtotal.toFixed(2)}</div>
                            ${discount.value > 0 ? `<div>Discount: - NRs. ${remainingDiscountAmount.toFixed(2)}</div>` : ''}
                            <div>VAT (13%): NRs. ${remainingTax.toFixed(2)}</div>
                            <div class="final-total">Total: NRs. ${remainingTotal.toFixed(2)}</div>
                        </div>
                    </div>
                    ` : ''}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const printFullBill = () => {
        // Create a print-friendly version with all items
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Bill - Table ${order.tableId?.number}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { margin-bottom: 10px; }
                        .info { color: #666; font-size: 14px; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        .totals { margin-top: 20px; text-align: right; }
                        .totals div { padding: 5px 0; }
                        .final-total { font-size: 18px; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 2px solid #333; }
                    </style>
                </head>
                <body>
                    <h2>Table ${order.tableId?.number.replace('T-', '')}</h2>
                    <div class="info">Order #${order.orderNumber} - Complete Bill (${order.items.length} items)</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map((item: any) => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>NRs. ${item.price}</td>
                                    <td>NRs. ${item.total}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="totals">
                        <div>Subtotal: NRs. ${subtotal.toFixed(2)}</div>
                        ${discount.value > 0 ? `<div>Discount (${discount.type === 'PERCENTAGE' ? discount.value + '%' : 'Fixed'}): - NRs. ${discountAmount.toFixed(2)}</div>` : ''}
                        <div>VAT (13%): NRs. ${tax.toFixed(2)}</div>
                        <div class="final-total">Total Payable: NRs. ${total.toFixed(2)}</div>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white w-full max-w-3xl h-[95vh] sm:h-[90vh] md:h-[80vh] rounded-xl sm:rounded-2xl border border-zinc-200 overflow-hidden flex flex-col md:flex-row">

                {/* Left Side: Bill Preview / Split Selection */}
                <div className="flex-1 border-b md:border-b-0 md:border-r border-zinc-100 flex flex-col bg-zinc-50/30 max-h-[50vh] md:max-h-full overflow-y-auto md:overflow-visible">
                    <div className="p-4 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-zinc-900">Table {order.tableId?.number.replace('T-', '')}</h3>
                            <p className="text-xs font-semibold text-zinc-400">Order #{order.orderNumber}</p>
                        </div>
                        <div className="flex bg-zinc-50 p-1 rounded-lg border border-zinc-100">
                            <button
                                onClick={() => setView('PREVIEW')}
                                className={`px-3 sm:px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200
                                    ${view === 'PREVIEW' ? 'bg-white text-zinc-900 border border-zinc-200' : 'text-zinc-400'}`}
                            >
                                Preview
                            </button>
                            <button
                                onClick={() => setView('SPLIT')}
                                className={`px-3 sm:px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200
                                    ${view === 'SPLIT' ? 'bg-white text-zinc-900 border border-zinc-200' : 'text-zinc-400'}`}
                            >
                                Split
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
                        {order.items.map((item: any) => (
                            <div
                                key={item._id}
                                onClick={() => view === 'SPLIT' && setSelectedItemsForSplit(prev =>
                                    prev.includes(item._id) ? prev.filter(id => id !== item._id) : [...prev, item._id]
                                )}
                                className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 flex items-center justify-between
                                    ${view === 'SPLIT' ? 'cursor-pointer' : ''}
                                    ${selectedItemsForSplit.includes(item._id) ? 'bg-orange-50 border-[#FF5C00]' : 'bg-white border-zinc-100'}`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    {view === 'SPLIT' && (
                                        <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all
                                            ${selectedItemsForSplit.includes(item._id) ? 'bg-[#FF5C00] border-[#FF5C00] text-white' : 'border-zinc-200 bg-white'}`}>
                                            {selectedItemsForSplit.includes(item._id) && <CheckCircle2 size={12} />}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-bold text-zinc-800">{item.name}</p>
                                        <p className="text-xs font-semibold text-zinc-400">{item.quantity} x NRs. {item.price}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-zinc-900">NRs. {item.total}</p>
                            </div>
                        ))}
                    </div>

                    {view === 'SPLIT' && selectedItemsForSplit.length > 0 && (
                        <div className="p-4 sm:p-6 bg-white border-t border-zinc-100 animate-in slide-in-from-bottom-2 sticky bottom-0">
                            <button 
                                onClick={printSplitBill}
                                className="w-full h-11 bg-[#FF5C00] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#FF5C00]/90 transition-colors"
                            >
                                <Printer size={18} />
                                Print Bill for {selectedItemsForSplit.length} Item{selectedItemsForSplit.length > 1 ? 's' : ''}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Side: Summary & Actions */}
                <div className="w-full md:w-[400px] flex flex-col bg-white">
                    <div className="p-4 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <h4 className="text-base sm:text-lg font-bold text-zinc-900">Summary</h4>
                        <button onClick={handleCloseAttempt} className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-rose-500 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 flex-1 space-y-4 sm:space-y-6 overflow-y-auto">
                        {/* Discount Section */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Apply Discount</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[5, 10, 15, 20].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setDiscount({ value: v, type: 'PERCENTAGE' })}
                                        className={`py-2 rounded-lg border text-xs font-bold transition-all
                                            ${discount.value === v && discount.type === 'PERCENTAGE'
                                                ? 'bg-[#FF5C00] border-[#FF5C00] text-white'
                                                : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200'}`}
                                    >
                                        {v}%
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    type="number"
                                    placeholder="Custom fixed amount"
                                    className="w-full h-10 pl-10 pr-4 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#FF5C00] outline-none transition-all"
                                    onChange={(e) => setDiscount({ value: Number(e.target.value), type: 'FIXED' })}
                                />
                            </div>
                        </div>

                        {/* Bill Breakdown */}
                        <div className="p-3 sm:p-4 bg-zinc-50 rounded-xl sm:rounded-2xl border border-zinc-100 space-y-2 sm:space-y-3">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-zinc-400">Subtotal</span>
                                <span className="text-zinc-900">NRs. {subtotal.toLocaleString()}</span>
                            </div>
                            {discount.value > 0 && (
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-emerald-500">Discount ({discount.type === 'PERCENTAGE' ? `${discount.value}%` : 'Fixed'})</span>
                                    <span className="text-emerald-500">- NRs. {discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-zinc-400">VAT (13%)</span>
                                <span className="text-zinc-900">NRs. {tax.toLocaleString()}</span>
                            </div>
                            <div className="pt-2 sm:pt-3 border-t border-zinc-200 flex justify-between items-end">
                                <span className="text-sm font-bold text-zinc-900">Total Payable</span>
                                <span className="text-xl sm:text-2xl font-bold text-[#FF5C00]">NRs. {total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 bg-zinc-50/50 border-t border-zinc-100 sticky bottom-0">
                        <button
                            onClick={printFullBill}
                            className="w-full h-11 bg-[#FF5C00] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors hover:bg-[#FF5C00]/90"
                        >
                            <Printer size={18} />
                            {printed ? 'Printed ✓' : 'Print Bill'}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <ConfirmationDialog
                isOpen={showCloseConfirmation}
                onClose={() => setShowCloseConfirmation(false)}
                onConfirm={handleConfirmClose}
                title="Confirm Bill Status"
                message="Have you printed the bill and given it to the customer? The order will be marked as complete."
                confirmText="Yes, Close"
                cancelText="No, Go Back"
                variant="warning"
            />
        </>
    );
}
