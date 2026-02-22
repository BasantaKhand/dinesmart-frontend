"use client";

import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info'
}: ConfirmationDialogProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: <XCircle className="text-rose-500" size={24} />,
            confirmBtn: 'bg-rose-500 hover:bg-rose-600 text-white',
            iconWrap: 'bg-rose-50 border-rose-100'
        },
        warning: {
            icon: <AlertCircle className="text-amber-500" size={24} />,
            confirmBtn: 'bg-[#FF5C00] hover:bg-[#e65300] text-white',
            iconWrap: 'bg-amber-50 border-amber-100'
        },
        info: {
            icon: <CheckCircle className="text-blue-500" size={24} />,
            confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white',
            iconWrap: 'bg-blue-50 border-blue-100'
        }
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 bg-zinc-900/45 backdrop-blur-[2px] z-[70] flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl border border-zinc-200 w-full max-w-[440px] shadow-xl overflow-hidden">
                {/* Header */}
                <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-zinc-100 bg-white">
                    <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl border flex items-center justify-center shrink-0 ${styles.iconWrap}`}>
                        {styles.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">{title}</h3>
                </div>

                {/* Message */}
                <div className="px-4 sm:px-6 py-4 sm:py-5">
                    <p className="text-[15px] sm:text-[17px] text-zinc-600 leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="p-4 sm:p-5 border-t border-zinc-100 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-10 sm:h-11 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-semibold hover:bg-zinc-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 h-10 sm:h-11 rounded-xl font-semibold transition-colors ${styles.confirmBtn}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
