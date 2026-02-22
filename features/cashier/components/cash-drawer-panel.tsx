'use client';

import { useState, useEffect } from 'react';
import { apiOpenDrawer, apiCloseDrawer, apiGetDrawerStatus, CashDrawer } from '@/features/admin/services/cash-drawer-service';

export default function CashDrawerPanel() {
  const [drawer, setDrawer] = useState<CashDrawer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for opening
  const [openingAmount, setOpeningAmount] = useState('0');
  const [openingNotes, setOpeningNotes] = useState('');
  const [showOpenForm, setShowOpenForm] = useState(false);

  // Form state for closing
  const [closingAmount, setClosingAmount] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [showCloseForm, setShowCloseForm] = useState(false);

  // Load drawer status on mount and periodically
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await apiGetDrawerStatus();
        setDrawer(status);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load drawer status');
      }
    };

    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleOpenDrawer = async () => {
    if (!openingAmount || isNaN(parseFloat(openingAmount))) {
      setError('Opening amount must be a valid number');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiOpenDrawer(parseFloat(openingAmount), openingNotes);
      setDrawer(result);
      setSuccess('Cash drawer opened successfully');
      setShowOpenForm(false);
      setOpeningAmount('0');
      setOpeningNotes('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to open drawer');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDrawer = async () => {
    if (!closingAmount || isNaN(parseFloat(closingAmount))) {
      setError('Closing amount must be a valid number');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiCloseDrawer(parseFloat(closingAmount), closingNotes);
      setDrawer(result);
      setSuccess('Cash drawer closed successfully');
      setShowCloseForm(false);
      setClosingAmount('');
      setClosingNotes('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close drawer');
    } finally {
      setLoading(false);
    }
  };

  const isDrawerOpen = drawer?.status === 'OPEN';
  const varianceColor =
    drawer?.variance === undefined
      ? 'text-gray-500'
      : drawer.variance > 0
        ? 'text-green-600'
        : drawer.variance < 0
          ? 'text-red-600'
          : 'text-gray-600';

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4">
      <h3 className="text-sm font-semibold mb-3 text-zinc-900">Cash Drawer Management</h3>

      {/* Status Messages */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 rounded-md text-xs">
          {success}
        </div>
      )}

      {/* Current Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">Status</span>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${isDrawerOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
          >
            {isDrawerOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>

        {isDrawerOpen ? (
          <>
            <div className="grid grid-cols-3 gap-4 text-sm mb-4">
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center mb-2">
                  <span className="text-white text-xs font-bold">₨</span>
                </div>
                <p className="text-xs text-zinc-500 mb-1">Opening</p>
                <p className="text-base font-bold text-zinc-900">₨ {drawer?.openingAmount?.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-purple-50 border border-purple-100 p-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center mb-2">
                  <span className="text-white text-xs font-bold">₨</span>
                </div>
                <p className="text-xs text-zinc-500 mb-1">Expected</p>
                <p className="text-base font-bold text-zinc-900">₨ {drawer?.expectedAmount?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
                <div className="h-8 w-8 rounded-lg bg-[#FF5C00] flex items-center justify-center mb-2">
                  <span className="text-white text-[10px] font-bold">⏱</span>
                </div>
                <p className="text-xs text-zinc-500 mb-1">Opened</p>
                <p className="text-xs font-semibold text-zinc-900">
                  {drawer?.openedAt ? new Date(drawer.openedAt).toLocaleTimeString() : '-'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-zinc-500 text-sm mb-3">Drawer is closed. Open it to start accepting cash.</p>
          </div>
        )}
      </div>

      {/* Open Drawer Form */}
      {!isDrawerOpen && (
        <div className="mb-4">
          {!showOpenForm ? (
            <button
              onClick={() => setShowOpenForm(true)}
              className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold text-sm transition-colors"
              disabled={loading}
            >
              Open Drawer
            </button>
          ) : (
            <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50">
              <h4 className="font-medium mb-3 text-sm text-zinc-900">Opening Drawer</h4>
              <div className="mb-3">
                <label className="block text-sm text-zinc-700 font-medium mb-1">Opening Amount (₨)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="0.00"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-zinc-700 font-medium mb-1">Notes (optional)</label>
                <textarea
                  value={openingNotes}
                  onChange={(e) => setOpeningNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Any notes about drawer opening..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleOpenDrawer}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-zinc-300 font-semibold text-sm transition-colors"
                >
                  {loading ? 'Opening...' : 'Confirm'}
                </button>
                <button
                  onClick={() => {
                    setShowOpenForm(false);
                    setOpeningAmount('0');
                    setOpeningNotes('');
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Close Drawer Form */}
      {isDrawerOpen && (
        <div className="mb-4">
          {!showCloseForm ? (
            <button
              onClick={() => setShowCloseForm(true)}
              className="w-full px-4 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-semibold text-sm transition-colors"
              disabled={loading}
            >
              Close Drawer
            </button>
          ) : (
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
              <h4 className="font-medium mb-3 text-sm">Closing Drawer</h4>
              <div className="mb-3">
                <label className="block text-sm text-gray-700 mb-1">Expected Amount (₨)</label>
                <div className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-900">
                  ₨ {drawer?.expectedAmount?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-700 mb-1">Actual Closing Amount (₨)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={closingAmount}
                  onChange={(e) => setClosingAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              {/* Variance Preview */}
              {closingAmount && !isNaN(parseFloat(closingAmount)) && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
                  <p className="text-gray-600 mb-1">
                    Expected: ₨ {drawer?.expectedAmount?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-gray-600 mb-1">
                    Actual: ₨ {parseFloat(closingAmount).toFixed(2)}
                  </p>
                  <p className={`font-semibold ${varianceColor}`}>
                    Variance: ₨{' '}
                    {(parseFloat(closingAmount) - (drawer?.expectedAmount || 0)).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  placeholder="Any notes about drawer closing (e.g., shortage reason)..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCloseDrawer}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 font-medium text-sm"
                >
                  {loading ? 'Closing...' : 'Confirm & Close'}
                </button>
                <button
                  onClick={() => {
                    setShowCloseForm(false);
                    setClosingAmount('');
                    setClosingNotes('');
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
