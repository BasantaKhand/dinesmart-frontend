'use client';

import { useState, useEffect, useMemo } from 'react';
import { FileText, Wallet, CreditCard, AlertTriangle } from 'lucide-react';
import { useGetDailySettlement, useGetMyTransactions } from '@/hooks/useAudit';
import type { DailySettlement, TransactionLog } from '@/api/audit.api';

interface DailySettlementPanelProps {
  refreshKey?: number;
}

export default function DailySettlementPanel({ refreshKey = 0 }: DailySettlementPanelProps) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { data: settlementData, isLoading: settlementLoading, refetch: refetchSettlement } = useGetDailySettlement(today);
  const { data: txData, isLoading: txLoading, refetch: refetchTx } = useGetMyTransactions(10, 0);

  const settlement = settlementData || null;
  const myTransactions = txData?.transactions || [];
  const mySummary = txData?.summary || null;
  const loading = settlementLoading || txLoading;
  const [error, setError] = useState('');

  // Poll and refresh on key change
  useEffect(() => {
    refetchSettlement();
    refetchTx();
  }, [refreshKey, refetchSettlement, refetchTx]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetchSettlement();
      refetchTx();
    }, 60000);
    return () => clearInterval(interval);
  }, [refetchSettlement, refetchTx]);

  if (loading)
    return (
      <div className="bg-white rounded-xl ring-1 ring-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#00A86B] flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900">Today's Settlement</h3>
            <p className="text-sm font-medium text-zinc-500">Loading...</p>
          </div>
        </div>
        <div className="p-5 flex items-center justify-center h-32">
          <div className="animate-pulse text-sm font-medium text-zinc-400">Loading settlement data...</div>
        </div>
      </div>
    );

  return (
    <div className="bg-white rounded-xl ring-1 ring-zinc-200 overflow-hidden">
      <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#00A86B] flex items-center justify-center">
          <FileText size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight text-zinc-900">Today's Settlement</h3>
          <p className="text-sm font-medium text-zinc-500">Daily collection summary</p>
        </div>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 ring-1 ring-rose-200 text-rose-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {settlement && (
          <div className="space-y-4">
            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg ring-1 ring-emerald-100">
                <div className="mx-auto mb-2 h-10 w-10 rounded-xl bg-[#00A86B] flex items-center justify-center">
                  <Wallet size={18} className="text-white" />
                </div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Collection</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">
                  ₨ {settlement.totalCollection.toLocaleString()}
                </p>
                <p className="text-xs font-medium text-zinc-500 mt-1">{settlement.totalBills} bills closed</p>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-zinc-50 rounded-lg ring-1 ring-zinc-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cash</span>
                    <span className="text-sm font-bold text-zinc-900">
                      ₨ {settlement.collectionByMethod.cash.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 rounded-lg ring-1 ring-zinc-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">QR/Digital</span>
                    <span className="text-sm font-bold text-zinc-900">
                      ₨ {settlement.collectionByMethod.qr.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 rounded-lg ring-1 ring-zinc-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Variance</span>
                    <span className={`text-sm font-bold ${settlement.drawerVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ₨ {settlement.drawerVariance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {(settlement.failedPayments > 0 || settlement.manualOverrides > 0) && (
              <div className="p-3 bg-amber-50 ring-1 ring-amber-200 rounded-lg flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  {settlement.failedPayments > 0 && (
                    <p className="font-medium text-amber-700">{settlement.failedPayments} failed payment(s)</p>
                  )}
                  {settlement.manualOverrides > 0 && (
                    <p className="font-medium text-amber-700">{settlement.manualOverrides} manual override(s)</p>
                  )}
                </div>
              </div>
            )}

            {/* Your Activity */}
            {mySummary && (
              <div className="pt-4 border-t border-zinc-100">
                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-3">Your Activity</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg ring-1 ring-blue-100 text-center">
                    <p className="text-xl font-bold text-zinc-900">{mySummary.totalPaymentsSettled}</p>
                    <p className="text-xs font-medium text-zinc-500">Payments Settled</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg ring-1 ring-blue-100 text-center">
                    <p className="text-xl font-bold text-zinc-900">₨ {mySummary.totalAmountSettled.toLocaleString()}</p>
                    <p className="text-xs font-medium text-zinc-500">Amount Settled</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
