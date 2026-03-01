'use client';

import { useState, useEffect } from 'react';
import { Banknote, Lock, Unlock, Loader2 } from 'lucide-react';
import { Modal } from '@/features/admin/components/ui/modal';
import { useGetDrawerStatus, useOpenDrawer, useCloseDrawer } from '@/hooks/useCashDrawer';
import type { CashDrawer } from '@/api/cash-drawer.api';

export default function CashDrawerPanel() {
  const { data: drawerData, isLoading: drawerLoading, refetch: refetchDrawer } = useGetDrawerStatus();
  const openDrawerMutation = useOpenDrawer();
  const closeDrawerMutation = useCloseDrawer();

  const drawer = drawerData || null;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Form state for opening
  const [openingAmount, setOpeningAmount] = useState('0');
  const [openingNotes, setOpeningNotes] = useState('');

  // Form state for closing
  const [closingAmount, setClosingAmount] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  // Poll every 30s
  useEffect(() => {
    const interval = setInterval(() => refetchDrawer(), 30000);
    return () => clearInterval(interval);
  }, [refetchDrawer]);

  const handleOpenDrawer = async () => {
    if (!openingAmount || isNaN(parseFloat(openingAmount))) {
      setError('Opening amount must be a valid number');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await openDrawerMutation.mutateAsync({ openingAmount: parseFloat(openingAmount), notes: openingNotes });
      setSuccess('Cash drawer opened successfully');
      setShowOpenModal(false);
      setOpeningAmount('0');
      setOpeningNotes('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to open drawer');
    }
  };

  const handleCloseDrawer = async () => {
    if (!closingAmount || isNaN(parseFloat(closingAmount))) {
      setError('Closing amount must be a valid number');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await closeDrawerMutation.mutateAsync({ closingAmount: parseFloat(closingAmount), notes: closingNotes });
      setSuccess('Cash drawer closed successfully');
      setShowCloseModal(false);
      setClosingAmount('');
      setClosingNotes('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close drawer');
    }
  };

  const isDrawerOpen = drawer?.status === 'OPEN';
  const variance = closingAmount ? parseFloat(closingAmount) - (drawer?.expectedAmount || 0) : 0;
  const varianceColor = variance > 0 ? 'text-emerald-600' : variance < 0 ? 'text-rose-600' : 'text-zinc-600';

  return (
    <>
      <div className="bg-white rounded-xl ring-1 ring-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#8A2BE2] flex items-center justify-center">
              <Banknote size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-zinc-900">Cash Drawer</h3>
              <p className="text-sm font-medium text-zinc-500">Daily cash operations</p>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg ${isDrawerOpen ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200'}`}
          >
            {isDrawerOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 ring-1 ring-rose-200 text-rose-700 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
              {success}
            </div>
          )}

          {isDrawerOpen ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-zinc-50 rounded-lg ring-1 ring-zinc-100">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Opening</p>
                  <p className="text-lg font-bold text-zinc-900 mt-1">₨ {drawer?.openingAmount?.toLocaleString() || 0}</p>
                </div>
                <div className="text-center p-3 bg-zinc-50 rounded-lg ring-1 ring-zinc-100">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Expected</p>
                  <p className="text-lg font-bold text-zinc-900 mt-1">₨ {drawer?.expectedAmount?.toLocaleString() || 0}</p>
                </div>
                <div className="text-center p-3 bg-zinc-50 rounded-lg ring-1 ring-zinc-100">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Opened At</p>
                  <p className="text-sm font-bold text-zinc-900 mt-1">
                    {drawer?.openedAt ? new Date(drawer.openedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '-'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCloseModal(true)}
                className="w-full h-10 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                Close Drawer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-6 bg-zinc-50 rounded-lg ring-1 ring-zinc-100 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-zinc-200 flex items-center justify-center">
                  <Lock size={24} className="text-zinc-500" />
                </div>
                <p className="text-sm font-medium text-zinc-600">Drawer is closed</p>
                <p className="text-xs text-zinc-500 mt-1">Open drawer to start accepting cash payments</p>
              </div>
              <button
                onClick={() => setShowOpenModal(true)}
                className="w-full h-10 bg-[#FF5C00] text-white rounded-lg hover:bg-[#e65300] font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2"
              >
                <Unlock size={16} />
                Open Drawer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Open Drawer Modal */}
      <Modal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        title="Open Cash Drawer"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">Enter the opening cash amount to start accepting payments.</p>
          
          <div>
            <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">Opening Amount (₨)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-zinc-200 text-sm focus:border-zinc-300 outline-none"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">Notes (optional)</label>
            <textarea
              value={openingNotes}
              onChange={(e) => setOpeningNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:border-zinc-300 outline-none resize-none"
              placeholder="Any notes about drawer opening..."
              rows={2}
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowOpenModal(false);
                setOpeningAmount('0');
                setOpeningNotes('');
              }}
              disabled={openDrawerMutation.isPending}
              className="flex-1 h-10 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleOpenDrawer}
              disabled={openDrawerMutation.isPending}
              className="flex-1 h-10 bg-[#FF5C00] text-white rounded-lg hover:bg-[#e65300] disabled:opacity-60 font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2"
            >
              {openDrawerMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {openDrawerMutation.isPending ? 'Opening...' : 'Open Drawer'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Close Drawer Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Close Cash Drawer"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 ring-1 ring-blue-200 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-600">Expected Amount:</span>
              <span className="font-bold text-zinc-900">₨ {drawer?.expectedAmount?.toLocaleString() || 0}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">Actual Closing Amount (₨)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={closingAmount}
              onChange={(e) => setClosingAmount(e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-zinc-200 text-sm focus:border-zinc-300 outline-none"
              placeholder="0.00"
              autoFocus
            />
          </div>

          {closingAmount && !isNaN(parseFloat(closingAmount)) && (
            <div className="p-3 bg-zinc-50 ring-1 ring-zinc-200 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-600">Variance:</span>
                <span className={`font-bold ${varianceColor}`}>
                  ₨ {variance.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">Notes (optional)</label>
            <textarea
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:border-zinc-300 outline-none resize-none"
              placeholder="Any notes about drawer closing..."
              rows={2}
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowCloseModal(false);
                setClosingAmount('');
                setClosingNotes('');
              }}
              disabled={closeDrawerMutation.isPending}
              className="flex-1 h-10 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCloseDrawer}
              disabled={closeDrawerMutation.isPending}
              className="flex-1 h-10 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-60 font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2"
            >
              {closeDrawerMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {closeDrawerMutation.isPending ? 'Closing...' : 'Close Drawer'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
