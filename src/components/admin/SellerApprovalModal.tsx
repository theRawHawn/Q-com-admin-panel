import React, { useState } from 'react';
import {
  X,
  Store,
  CheckCircle2,
  XCircle,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  Building,
  CreditCard,
  FileText
} from 'lucide-react';
import { AdminSeller } from '../../types/admin';
import { adminApi } from '../../utils/adminApiClient';

interface SellerApprovalModalProps {
  seller: AdminSeller;
  onClose: () => void;
  onRefresh: () => void;
  canApprove: boolean;
}

export const SellerApprovalModal: React.FC<SellerApprovalModalProps> = ({
  seller,
  onClose,
  onRefresh,
  canApprove,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await adminApi.post(`/api/admin/sellers/${seller.id}/approve`, {});
      onRefresh();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to approve seller application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      setErrorMsg('Please specify why this applicant KYC is being rejected.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await adminApi.post(`/api/admin/sellers/${seller.id}/reject`, { reason: rejectReason });
      onRefresh();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reject seller application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{seller.name}</h2>
              <p className="text-xs text-slate-500">KYC Verification & Onboarding Review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-600">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Business & Owner Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block mb-0.5 font-medium">Proprietor / Owner:</span>
              <span className="text-slate-900 font-semibold">{seller.ownerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5 font-medium">Store Specialty:</span>
              <span className="text-slate-900 font-semibold">{seller.hubType}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5 font-medium">Phone Contact:</span>
              <span className="text-slate-900 font-mono">{seller.phone}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5 font-medium">Operating Area:</span>
              <span className="text-slate-900 font-medium">{seller.areaName}</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200">
              <span className="text-slate-500 block mb-0.5 font-medium">Registered Store Address:</span>
              <span className="text-slate-800">{seller.address}</span>
            </div>
          </div>

          {/* Documents Checklist */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-600" />
              Statutory KYC Compliance Checklist
            </h3>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">GSTIN Registration</span>
                  <span className="font-mono text-slate-600">{seller.gstin}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${seller.documents.gstVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {seller.documents.gstVerified ? 'VERIFIED' : 'PENDING AUDIT'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">PAN Card & Business Identity</span>
                  <span className="font-mono text-slate-600">{seller.panNumber}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${seller.documents.panVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {seller.documents.panVerified ? 'VERIFIED' : 'PENDING AUDIT'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Bank Account & IFSC (Payouts)</span>
                  <span className="font-mono text-slate-600">{seller.bankAccount.bankName} · {seller.bankAccount.accountNumber}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${seller.documents.bankVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {seller.documents.bankVerified ? 'VERIFIED' : 'PENDING AUDIT'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">BBMP Trade License / Shop Act</span>
                  <span className="font-mono text-slate-600">Trade License Certificate Doc</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${seller.documents.tradeLicenseVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {seller.documents.tradeLicenseVerified ? 'VERIFIED' : 'PENDING AUDIT'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showRejectForm ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
              <span className="font-bold text-rose-800 block">Provide Reason for KYC Rejection</span>
              <textarea
                rows={2}
                placeholder="e.g. Incomplete BBMP trade license document, address mismatch on GST portal..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-white border border-rose-300 rounded-lg p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs font-sans"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectReason}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={!canApprove || isSubmitting}
                className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-300 font-bold rounded-xl text-xs transition-all"
              >
                Reject Application
              </button>
              <button
                onClick={handleApprove}
                disabled={!canApprove || isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve & Onboard Store</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
