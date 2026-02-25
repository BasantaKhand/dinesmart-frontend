import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const buildPageItems = (currentPage: number, totalPages: number): Array<number | 'ellipsis'> => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, 4, 'ellipsis', totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
};

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className = '' }) => {
    if (totalPages <= 1) {
        return null;
    }

    const pageItems = buildPageItems(currentPage, totalPages);

    return (
        <div className={`flex items-center justify-center gap-2 ${className}`.trim()}>
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                Previous
            </button>

            <div className="flex gap-1">
                {pageItems.map((item, index) => {
                    if (item === 'ellipsis') {
                        return (
                            <span key={`ellipsis-${index}`} className="w-10 h-10 inline-flex items-center justify-center text-zinc-400 text-sm font-semibold">
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={item}
                            onClick={() => onPageChange(item)}
                            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                                currentPage === item
                                    ? 'bg-[#FF5C00] text-white'
                                    : 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                            }`}
                        >
                            {item}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                Next
            </button>
        </div>
    );
};
