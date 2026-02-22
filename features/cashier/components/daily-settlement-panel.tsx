'use client';

import { useState, useEffect } from 'react';
import { FileText, TrendingUp } from 'lucide-react';
import { apiGetDailySettlement, apiGetMyTransactions, DailySettlement, TransactionLog } from '@/features/admin/services/audit-service';

export default function DailySettlementPanel() {
  const [settlement, setSettlement] = useState<DailySettlement | null>(null);
  const [myTransactions, setMyTransactions] = useState<TransactionLog[]>([]);
  const [mySummary, setMySummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const today = new Date().toISOString().split('T')[0];
        const [settlementData, txData] = await Promise.all([
          apiGetDailySettlement(today),
          apiGetMyTransactions(10, 0),
        ]);
        setSettlement(settlementData);
        setMyTransactions(txData.transactions);
        setMySummary(txData.summary);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load settlement data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Loading settlement data...</p>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-900">
        <div className="h-6 w-6 rounded-lg bg-blue-500 flex items-center justify-center">
          <FileText size={13} className="text-white" />
        </div>
        Today's Settlement
      </h3>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs">
          {error}
        </div>
      )}

      {/* Settlement Summary */}
      {settlement && (
        <div className="mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2">
              <p className="text-[11px] text-zinc-600 font-medium mb-0.5">Total Collection</p>
              <p className="text-base font-bold text-emerald-700">
                ₨ {settlement.totalCollection.toLocaleString('en-NP', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{settlement.totalBills} bills</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-2">
              <p className="text-[11px] text-zinc-600 font-medium mb-0.5">By Method</p>
              <div className="text-[10px] space-y-0.5">
                <p className="text-zinc-700">
                  <span className="font-semibold">Cash:</span> ₨
                  {settlement.collectionByMethod.cash.toLocaleString('en-NP', {
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-zinc-700">
                  <span className="font-semibold">QR:</span> ₨
                  {settlement.collectionByMethod.qr.toLocaleString('en-NP', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>

          {/* Drawer Info */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2">
            <p className="text-[11px] font-semibold text-zinc-600 mb-1.5">Drawer Activity</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <p className="text-zinc-700">
                <span className="font-semibold">Openings:</span> {settlement.drawerOpenings}
              </p>
              <p className={settlement.drawerVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                <span className="font-semibold">Variance:</span> ₨
                {settlement.drawerVariance.toLocaleString('en-NP', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Issues/Alerts */}
          {(settlement.failedPayments > 0 || settlement.manualOverrides > 0) && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-2">
              <p className="text-[11px] font-semibold text-zinc-600 mb-1">Alerts</p>
              {settlement.failedPayments > 0 && (
                <p className="text-[10px] text-amber-700">
                  ⚠️ {settlement.failedPayments} failed payment(s)
                </p>
              )}
              {settlement.manualOverrides > 0 && (
                <p className="text-[10px] text-amber-700">
                  ✓ {settlement.manualOverrides} manual override(s)
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* My Transactions */}
      {mySummary && (
        <div className="border-t border-zinc-200 pt-3">
          <h4 className="text-[11px] font-semibold mb-2 flex items-center gap-1 text-zinc-900">
            <div className="h-5 w-5 rounded-md bg-indigo-500 flex items-center justify-center">
              <TrendingUp size={11} className="text-white" />
            </div>
            Your Activity
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-1.5">
              <p className="text-zinc-600">Payments Settled</p>
              <p className="font-bold text-indigo-700 text-xs">{mySummary.totalPaymentsSettled}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-1.5">
              <p className="text-zinc-600">Total Amount</p>
              <p className="font-bold text-indigo-700 text-xs">
                ₨{mySummary.totalAmountSettled.toLocaleString('en-NP', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            <p className="text-[10px] font-semibold text-zinc-600">Recent Actions</p>
            {myTransactions.length === 0 ? (
              <p className="text-[10px] text-zinc-400">No transactions yet</p>
            ) : (
              myTransactions.slice(0, 5).map((tx) => (
                <div key={tx._id} className="text-[10px] bg-zinc-50 border border-zinc-100 p-1.5 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium text-zinc-700 truncate text-[9px]">{tx.type.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-zinc-900">
                      ₨{tx.amount.toLocaleString('en-NP', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-[9px] mt-0.5 truncate">
                    {tx.orderNumber ? `Order: ${tx.orderNumber}` : tx.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
