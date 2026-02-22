"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidthClass?: string;
    showHeader?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidthClass = 'max-w-lg',
    showHeader = true
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[4px] transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full ${maxWidthClass} scale-100 rounded-2xl bg-white p-6 ring-1 ring-zinc-100 transition-all animate-in fade-in zoom-in duration-300 shadow-none`}>
                {showHeader ? (
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black tracking-tight text-zinc-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onClose}
                        className="absolute -right-3 -top-3 rounded-full bg-white p-2 text-zinc-400 shadow-md transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                    >
                        <X size={20} />
                    </button>
                )}

                <div className={showHeader ? 'mt-8' : ''}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
