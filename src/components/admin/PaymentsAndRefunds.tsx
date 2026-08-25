import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { AdminRefund, AdminOrder, AdminPermission } from '../../types/admin';
import { adminApi } from '../../utils/adminApiClient';

interface PaymentsAndRefundsProps {
  userPermissions: AdminPermission[];
}

export const PaymentsAndRefunds: React.FC<PaymentsAndRefundsProps> = ({ userPermissions }) => {
  const [refunds, setRefunds] = useState<AdminRefund[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'REFUNDS' | 'TRANSACTIONS'>('REFUNDS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreateRefund = userPermissions.includes('refunds.create');
  const canApproveRefund = userPermissions.includes('refunds.approve');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [refRes, ordRes]: [any, any] = await Promise.all([
        adminApi.get('/api/admin/refunds'),
        adminApi.get('/api/admin/orders'),
      ]);
      if (refRes.success) setRefunds(refRes.refunds);
      if (ordRes.success) setOrders(ordRes.orders);
    } catch (err) {
      console.error('Failed to load financial records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveRefund = async (refundId: string) => {
    if (!canApproveRefund) return;
    try {
      setIsSubmitting(true);
      await adminApi.post(`/api/admin/refunds/${refundId}/approve`, {});
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Refund approval failed');
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
            Payment & Refund Reconciliation Hub
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
              ₹6,72,450 GMV Settled Today
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit payment gateway webhooks, process instant merchant/customer refunds, and enforce payout caps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('REFUNDS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'REFUNDS'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Refund Desk ({refunds.length})
            </button>
            <button
              onClick={() => setActiveTab('TRANSACTIONS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'TRANSACTIONS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Payment Ledger ({orders.length})
            </button>
          </div>

          <button
            onClick={fetchData}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-300 shadow-2xs transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* SECTION 1: REFUND DESK */}
      {activeTab === 'REFUNDS' ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-rose-600" />
                  Refund Approvals & Execution Desk
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authoritative server-side refund limits prevent payouts exceeding invoice total.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {refunds.map((ref) => (
                <div
                  key={ref.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">{ref.orderNumber}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          ref.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ref.status === 'APPROVED'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {ref.status}
                      </span>
                      <span className="text-xs text-slate-500">Requested by {ref.requestedBy}</span>
                    </div>
                    <p className="text-xs text-slate-700">
                      Reason: <span className="text-slate-900 font-medium">{ref.reason}</span>
                    </p>
                    {ref.transactionId && (
                      <p className="text-[11px] text-emerald-700 font-mono font-medium">
                        Bank UTR/Txn: {ref.transactionId}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <div className="text-base font-black text-rose-600">₹{ref.amount}</div>
                      <div className="text-[10px] text-slate-500">Max Cap: ₹{ref.maxRefundable}</div>
                    </div>

                    {ref.status === 'PENDING' && (
                      <button
                        onClick={() => handleApproveRefund(ref.id)}
                        disabled={!canApproveRefund || isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Approve & Disburse</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* SECTION 2: PAYMENT TRANSACTIONS LEDGER */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Settled Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-mono">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-emerald-700 font-bold">
                    {ord.payment.transactionId || `UPI-${ord.orderNumber}`}
                  </td>
                  <td className="p-4 text-slate-900 font-bold">{ord.orderNumber}</td>
                  <td className="p-4 text-slate-800 font-sans">{ord.customer.name}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                      {ord.payment.method}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.payment.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ord.payment.status === 'REFUNDED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {ord.payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-slate-900 text-sm">₹{ord.pricing.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
