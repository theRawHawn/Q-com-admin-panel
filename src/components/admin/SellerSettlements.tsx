import React, { useState, useEffect } from 'react';
import {
  Receipt,
  CheckCircle2,
  Clock,
  Building,
  RefreshCw,
  FileSpreadsheet,
  ShieldCheck,
  Send
} from 'lucide-react';
import { AdminSettlement, AdminPermission } from '../../types/admin';
import { adminApi } from '../../utils/adminApiClient';

interface SellerSettlementsProps {
  userPermissions: AdminPermission[];
}

export const SellerSettlements: React.FC<SellerSettlementsProps> = ({ userPermissions }) => {
  const [settlements, setSettlements] = useState<AdminSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProcessSettlement = userPermissions.includes('settlements.process');

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const res: any = await adminApi.get('/api/admin/settlements');
      if (res.success) setSettlements(res.settlements);
    } catch (err) {
      console.error('Failed to load settlements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleProcessSettlement = async (settlementId: string) => {
    if (!canProcessSettlement) return;
    try {
      setIsSubmitting(true);
      await adminApi.post(`/api/admin/settlements/${settlementId}/process`, {});
      fetchSettlements();
    } catch (err: any) {
      alert(err.message || 'Settlement execution failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Seller Weekly Settlement & Payout Desk
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
              Week 34 (18 Aug – 24 Aug 2026)
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculation: Gross Sales – QCOM Commission – Customer Refunds – 1% TDS = Net Payable Payout.
          </p>
        </div>

        <button
          onClick={fetchSettlements}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Sync Settlement Batches</span>
        </button>
      </div>

      {/* Settlement Cards / Tables */}
      <div className="space-y-4">
        {settlements.map((set) => (
          <div
            key={set.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{set.sellerName}</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Cycle: {set.periodStart} → {set.periodEnd} (ID: {set.id})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase ${
                    set.status === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : set.status === 'PROCESSED'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {set.status}
                </span>

                {set.status !== 'PAID' && (
                  <button
                    onClick={() => handleProcessSettlement(set.id)}
                    disabled={!canProcessSettlement || isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Disburse NEFT Batch</span>
                  </button>
                )}
              </div>
            </div>

            {/* Reconciliation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Gross GMV Sales</span>
                <span className="text-slate-900 font-bold text-sm">₹{set.grossSales.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">QCOM Commission (–)</span>
                <span className="text-rose-600 font-semibold">₹{set.commissionDeducted.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Refunds Adjusted (–)</span>
                <span className="text-rose-600 font-semibold">₹{set.refundsAdjusted.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">1% Sec 194O TDS (–)</span>
                <span className="text-amber-700 font-semibold">₹{set.tdsDeducted.toLocaleString('en-IN')}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-lg border border-slate-300 shadow-2xs">
                <span className="text-slate-500 text-[10px] block">Net Seller Payable</span>
                <span className="text-emerald-700 font-black text-sm">₹{set.netPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {set.utrNumber && (
              <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>Bank Disbursal UTR: <strong className="text-emerald-700">{set.utrNumber}</strong></span>
                <span>Paid At: {set.payoutDate}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
