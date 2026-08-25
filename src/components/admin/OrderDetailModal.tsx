import React, { useState } from 'react';
import {
  X,
  Clock,
  MapPin,
  Store,
  Bike,
  User,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Send,
  RotateCcw,
  CheckCircle2,
  Phone,
  FileText,
  Key
} from 'lucide-react';
import { AdminOrder, AdminRider } from '../../types/admin';
import { adminApi } from '../../utils/adminApiClient';

interface OrderDetailModalProps {
  order: AdminOrder;
  onClose: () => void;
  onRefresh: () => void;
  availableRiders: AdminRider[];
  canEditStatus: boolean;
  canCancel: boolean;
  canAssignRider: boolean;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onRefresh,
  availableRiders,
  canEditStatus,
  canCancel,
  canAssignRider,
}) => {
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [newStatus, setNewStatus] = useState<string>(order.status);
  const [statusNote, setStatusNote] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const handleAssignRider = async () => {
    if (!selectedRiderId) return;
    try {
      setIsSubmitting(true);
      setActionError('');
      await adminApi.post(`/api/admin/orders/${order.id}/assign-rider`, { riderId: selectedRiderId });
      setActionSuccess('Rider assigned successfully! Order marked out for delivery.');
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to assign rider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      setIsSubmitting(true);
      setActionError('');
      await adminApi.post(`/api/admin/orders/${order.id}/update-status`, { status: newStatus, note: statusNote });
      setActionSuccess(`Order status transitioned to ${newStatus}`);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update order status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      setActionError('Please provide a mandatory cancellation reason for the audit trail.');
      return;
    }
    try {
      setIsSubmitting(true);
      setActionError('');
      await adminApi.post(`/api/admin/orders/${order.id}/cancel`, { reason: cancelReason });
      setActionSuccess('Order cancelled, stock restored, and refund initiated.');
      setShowCancelPrompt(false);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              QC
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900 font-mono">{order.orderNumber}</h2>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded uppercase border border-slate-200 font-semibold">
                  {order.status.replace(/_/g, ' ')}
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  OTP: {order.deliveryOtp}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Placed at {order.placedAt} · Est. Arrival: {order.estimatedDeliveryAt}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 flex-1">
          {actionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{actionError}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Timeline Stepper */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
              Live Order Fulfillment Stepper
            </h3>
            <div className="space-y-3">
              {order.timeline.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        step.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {step.completed ? '✓' : idx + 1}
                    </div>
                    {idx < order.timeline.length - 1 && (
                      <div className={`w-0.5 h-6 ${step.completed ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                        {step.stage}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{step.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid: Customer & Jobsite vs Seller & Rider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer & Jobsite */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4 text-sky-600" />
                Customer & Jobsite Destination
              </h4>
              <div className="space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-semibold text-slate-900">{order.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono text-slate-700">{order.customer.phone}</span>
                </div>
                {order.customer.businessName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Business:</span>
                    <span className="font-semibold text-sky-700">{order.customer.businessName}</span>
                  </div>
                )}
                {order.customer.gstin && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">GSTIN:</span>
                    <span className="font-mono text-slate-700">{order.customer.gstin}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Jobsite Address:</span>
                  <p className="text-slate-800 font-medium">{order.jobSite.address}</p>
                  {order.jobSite.gateCode && (
                    <span className="inline-block mt-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono text-[10px]">
                      Gate Pass: {order.jobSite.gateCode}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Seller & Dispatch Partner */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Store className="h-4 w-4 text-amber-600" />
                Fulfillment Partner & Rider
              </h4>
              <div className="space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Store Hub:</span>
                  <span className="font-semibold text-slate-900">{order.seller.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hub Type:</span>
                  <span className="text-slate-700">{order.seller.hubType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Seller GSTIN:</span>
                  <span className="font-mono text-slate-700">{order.seller.gstin}</span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Assigned Rider:</span>
                  {order.rider ? (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Bike className="h-3.5 w-3.5 text-emerald-600" />
                          {order.rider.name}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{order.rider.vehicle}</p>
                      </div>
                      <span className="text-emerald-700 font-mono font-bold text-[11px]">
                        ★ {order.rider.rating}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex items-center justify-between">
                      <span>No Rider Assigned Yet</span>
                      <span className="text-[10px] uppercase font-mono bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded border border-rose-200">
                        DISPATCH QUEUE
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 font-bold text-slate-900 border-b border-slate-200 flex items-center justify-between">
              <span>Order Line Items ({order.items.length})</span>
              <span className="font-mono text-slate-500">HSN & 18% GST Compliant</span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-mono border-b border-slate-200">
                <tr>
                  <th className="p-3">Item Details</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3 text-right">HSN</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {order.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{it.productName}</td>
                    <td className="p-3 text-slate-500">{it.brand}</td>
                    <td className="p-3 text-right font-mono text-slate-500">{it.hsnCode || '8536'}</td>
                    <td className="p-3 text-right font-mono">₹{it.price}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{it.quantity}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      ₹{it.price * it.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-slate-600">
                <span className="font-bold text-slate-900">Payment Method:</span>{' '}
                <span className="font-mono text-emerald-700 font-semibold">{order.payment.method}</span> · Transaction ID:{' '}
                <span className="font-mono text-slate-700">{order.payment.transactionId || 'N/A'}</span>
              </div>
              <div className="text-right space-y-1">
                <div className="text-slate-500">Subtotal: ₹{order.pricing.subtotal}</div>
                <div className="text-slate-500">18% GST (Inclusive): ₹{order.pricing.tax}</div>
                <div className="text-emerald-700 font-semibold">Claimable ITC: ₹{order.pricing.itcAmount}</div>
                <div className="text-sm font-black text-slate-900 font-mono pt-1 border-t border-slate-200">
                  Total Paid: ₹{order.pricing.total}
                </div>
              </div>
            </div>
          </div>

          {/* ADMIN ACTION CONTROLS */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Administrative Interventions & State Control
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assign / Change Rider */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-2">Assign or Re-route Delivery Rider</span>
                <div className="flex gap-2">
                  <select
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    disabled={!canAssignRider || isSubmitting}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Select available rider in zone...</option>
                    {availableRiders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.vehicleType.replace('_', ' ')}) - {r.status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignRider}
                    disabled={!canAssignRider || !selectedRiderId || isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all shadow-xs"
                  >
                    <Send className="h-3 w-3" />
                    <span>Dispatch</span>
                  </button>
                </div>
                {!canAssignRider && (
                  <p className="text-[10px] text-amber-600 mt-1">Requires 'orders.assign_rider' permission.</p>
                )}
              </div>

              {/* Force State Change */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-2">Transition Order Finite State</span>
                <div className="flex gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={!canEditStatus || isSubmitting}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase font-mono"
                  >
                    <option value="placed">placed</option>
                    <option value="picking">picking</option>
                    <option value="packed">packed</option>
                    <option value="out_for_delivery">out_for_delivery</option>
                    <option value="arriving">arriving</option>
                    <option value="delivered">delivered</option>
                  </select>
                  <button
                    onClick={handleStatusChange}
                    disabled={!canEditStatus || isSubmitting || newStatus === order.status}
                    className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-xs"
                  >
                    Update
                  </button>
                </div>
                {!canEditStatus && (
                  <p className="text-[10px] text-amber-600 mt-1">Requires 'orders.edit_status' permission.</p>
                )}
              </div>
            </div>

            {/* Cancel Order Section */}
            {canCancel && order.status !== 'cancelled' && order.status !== 'delivered' && (
              <div className="pt-3 border-t border-slate-200">
                {!showCancelPrompt ? (
                  <button
                    onClick={() => setShowCancelPrompt(true)}
                    className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Emergency Cancel Order & Issue Instant Refund</span>
                  </button>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <span className="font-bold text-rose-800 block">Cancel Order with Mandatory Audit Reason</span>
                    <input
                      type="text"
                      placeholder="e.g. Contractor requested cancellation, jobsite pipe specs altered..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowCancelPrompt(false)}
                        className="px-3 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium"
                      >
                        Abort
                      </button>
                      <button
                        onClick={handleCancelOrder}
                        disabled={isSubmitting || !cancelReason}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
                      >
                        Confirm Cancellation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
