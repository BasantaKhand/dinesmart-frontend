'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, RotateCw, CheckCircle } from 'lucide-react';
import {
  apiGetQueueStatus,
  apiGetFailedPayments,
  apiManuallyOverridePayment,
  apiRetryAllFailedPayments,
  PaymentQueueStatus,
  PaymentQueueItem,
} from '@/features/admin/services/payment-queue-service';

export default function PaymentReliabilityPanel() {
  const [status, setStatus] = useState<PaymentQueueStatus>({ pending: 0, confirmed: 0, failed: 0 });
  const [failedPayments, setFailedPayments] = useState<PaymentQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [overridePaymentId, setOverridePaymentId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  // Load status and failed payments on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statusData, failedData] = await Promise.all([
          apiGetQueueStatus(),
          apiGetFailedPayments(10, 0),
        ]);
        setStatus(statusData);
        setFailedPayments(failedData.payments);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load payment status');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRetryAll = async () => {
    setRetrying(true);
    setError('');
    setSuccess('');

    try {
      const results = await apiRetryAllFailedPayments();
      setSuccess(
        `Retry complete: ${results.confirmed} confirmed, ${results.stillFailed} still failed`
      );
      // Reload data
      const [statusData, failedData] = await Promise.all([
        apiGetQueueStatus(),
        apiGetFailedPayments(10, 0),
      ]);
      setStatus(statusData);
      setFailedPayments(failedData.payments);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retry payments');
    } finally {
      setRetrying(false);
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
      await apiManuallyOverridePayment(paymentId, overrideReason);
      setSuccess('Payment manually approved');
      setOverridePaymentId(null);
      setOverrideReason('');

      // Reload data
      const [statusData, failedData] = await Promise.all([
        apiGetQueueStatus(),
        apiGetFailedPayments(10, 0),
      ]);
      setStatus(statusData);
      setFailedPayments(failedData.payments);
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
            disabled={retrying}
            className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-zinc-300 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCw size={16} />
            {retrying ? 'Retrying...' : 'Retry All Failed Payments'}
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

      {failedPayments.length === 0 && status.failed === 0 && !loading && (
        <div className="text-center py-6">
          <CheckCircle size={32} className="mx-auto text-green-600 mb-2" />
          <p className="text-sm font-semibold text-gray-600">All payments verified</p>
          <p className="text-xs text-gray-500 mt-1">No failed payments to handle</p>
        </div>
      )}
    </div>
  );
}
