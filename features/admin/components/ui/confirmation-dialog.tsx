"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info',
    isLoading = false
}: ConfirmationDialogProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    const variantStyles = {
        danger: {
            confirmBtn: 'bg-rose-500 hover:bg-rose-600',
        },
        warning: {
            confirmBtn: 'bg-amber-500 hover:bg-amber-600',
        },
        info: {
            confirmBtn: 'bg-[#FF5C00] hover:bg-[#e65300]',
        }
    };

    const styles = variantStyles[variant];

    const dialogContent = (
        <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-zinc-200 w-full max-w-[380px] shadow-xl overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-zinc-100">
                    <h3 className="text-[16px] font-bold text-zinc-900">{title}</h3>
                </div>

                {/* Message */}
                <div className="px-5 py-4">
                    <div className="text-[15px] text-zinc-600 leading-relaxed">{message}</div>
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 rounded-lg bg-zinc-100 py-2.5 text-[15px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-200 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 rounded-lg py-2.5 text-[15px] font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${styles.confirmBtn}`}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(dialogContent, document.body);
}