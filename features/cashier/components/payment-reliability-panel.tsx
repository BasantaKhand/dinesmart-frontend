'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, RotateCw, CheckCircle } from 'lucide-react';
import {
  useGetQueueStatus,
  useGetFailedPayments,
  useManuallyOverridePayment,
  useRetryAllFailedPayments,
} from '@/hooks/usePaymentQueue';
import type { PaymentQueueStatus, PaymentQueueItem } from '@/api/payment-queue.api';

export default function PaymentReliabilityPanel() {
  const { data: statusData, refetch: refetchStatus } = useGetQueueStatus();
  const { data: failedData, refetch: refetchFailed } = useGetFailedPayments(10, 0);
  const manualOverrideMutation = useManuallyOverridePayment();
  const retryAllMutation = useRetryAllFailedPayments();

  const status: PaymentQueueStatus = statusData || { pending: 0, confirmed: 0, failed: 0 };
  const failedPayments: PaymentQueueItem[] = failedData?.payments || [];
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [overridePaymentId, setOverridePaymentId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStatus();
      refetchFailed();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchStatus, refetchFailed]);

  const handleRetryAll = async () => {
    setError('');
    setSuccess('');

    try {
      const results = await retryAllMutation.mutateAsync();
      setSuccess(
        `Retry complete: ${results.confirmed} confirmed, ${results.stillFailed} still failed`
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retry payments');
    }
  };

  const handleManualOverride = async (paymentId: string) => {
    if (!overrideReason.trim()) {
      setError('Please provide a reason for the override');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await manualOverrideMutation.mutateAsync({ paymentId, reason: overrideReason });
      setSuccess('Payment manually approved');
      setOverridePaymentId(null);
      setOverrideReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to override payment');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4">
      <h3 className="text-sm font-semibold mb-3 text-zinc-900">Payment Reliability</h3>

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

      {/* Queue Status Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
          <p className="text-xs text-zinc-600 font-medium mb-1">Pending</p>
          <p className="text-xl font-bold text-blue-700">{status.pending}</p>
          <p className="text-xs text-zinc-500 mt-1">Awaiting verification</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
          <p className="text-xs text-zinc-600 font-medium mb-1">Confirmed</p>
          <p className="text-xl font-bold text-emerald-700">{status.confirmed}</p>
          <p className="text-xs text-zinc-500 mt-1">Successfully processed</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
          <p className="text-xs text-zinc-600 font-medium mb-1">Failed</p>
          <p className="text-xl font-bold text-rose-700">{status.failed}</p>
          <p className="text-xs text-zinc-500 mt-1">Needs action</p>
        </div>
      </div>

      {/* Retry All Button */}
      {status.failed > 0 && (
        <div className="mb-6">
          <button
            onClick={handleRetryAll}
            disabled={retryAllMutation.isPending}
            className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-zinc-300 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCw size={16} />
            {retryAllMutation.isPending ? 'Retrying...' : 'Retry All Failed Payments'}
          </button>
        </div>
      )}

      {/* Failed Payments List */}
      {failedPayments.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-sm mb-3 text-gray-900">Failed Payments</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {failedPayments.map((payment) => (
              <div
                key={payment._id}
                className="border border-red-200 rounded-lg p-3 bg-red-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{payment.orderNumber}</p>
                    <p className="text-xs text-gray-600">
                      Amount: ₨ {payment.amount?.toFixed(2) || '0.00'} · Method:{' '}
                      {payment.paymentMethod}
                    </p>
                    {payment.failureReason && (
                      <p className="text-xs text-red-600 mt-1">
                        <AlertCircle size={12} className="inline mr-1" />
                        {payment.failureReason}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-gray-600">Retries: {payment.retryCount || 0}/3</p>
                  </div>
                </div>

                {/* Manual Override Section */}
                {overridePaymentId === payment._id ? (
                  <div className="bg-white rounded p-2 border border-yellow-300 mt-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Reason for Override
                    </label>
                    <textarea
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="e.g., Payment already received via alternate method"
                      rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleManualOverride(payment._id || '')}
                        className="flex-1 px-3 py-1 bg-yellow-600 text-white rounded text-xs font-medium hover:bg-yellow-700"
                      >
                        <CheckCircle size={12} className="inline mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setOverridePaymentId(null);
                          setOverrideReason('');
                        }}
                        className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setOverridePaymentId(payment._id || null)}
                    className="mt-2 w-full px-3 py-1 text-xs font-medium text-yellow-700 border border-yellow-300 rounded hover:bg-yellow-50"
                  >
                    Manual Override
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {failedPayments.length === 0 && status.failed === 0 && (
        <div className="text-center py-6">
          <CheckCircle size={32} className="mx-auto text-green-600 mb-2" />
          <p className="text-sm font-semibold text-gray-600">All payments verified</p>
          <p className="text-xs text-gray-500 mt-1">No failed payments to handle</p>
        </div>
      )}
    </div>
  );
}
