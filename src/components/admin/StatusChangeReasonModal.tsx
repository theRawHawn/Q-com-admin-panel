import React, { useState } from 'react';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

interface StatusChangeReasonModalProps {
  sellerName: string;
  currentStatus: string;
  targetStatus: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
}

export const StatusChangeReasonModal: React.FC<StatusChangeReasonModalProps> = ({
  sellerName,
  currentStatus,
  targetStatus,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Reason for status change is required (*)');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onConfirm(reason.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update store status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Change Store Status</h3>
              <p className="text-[11px] text-slate-500 font-medium">{sellerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Current Status</span>
              <span className="font-bold text-slate-800">{currentStatus}</span>
            </div>
            <span className="text-slate-400 font-bold">→</span>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">New Status</span>
              <span className="font-bold text-slate-900">{targetStatus}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-0.5">
              <span>Reason for Status Change</span>
              <span className="text-rose-600 font-bold text-sm">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter detailed reason for changing store status (e.g. Compliance audit completed, SLA restoration, requested by merchant)..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              This reason will be logged in the store audit history for future reference.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs disabled:opacity-50"
            >
              {submitting ? 'Updating Status...' : 'Confirm Status Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
