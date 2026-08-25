import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  RefreshCw,
  Search,
  Send,
  AlertCircle
} from 'lucide-react';
import { AdminSupportTicket, AdminPermission } from '../../types/admin';
import { adminApi } from '../../utils/adminApiClient';

interface SupportDeskProps {
  userPermissions: AdminPermission[];
}

export const SupportDesk: React.FC<SupportDeskProps> = ({ userPermissions }) => {
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicket | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canResolve = userPermissions.includes('support.resolve');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res: any = await adminApi.get('/api/admin/support-tickets');
      if (res.success) setTickets(res.tickets);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async () => {
    if (!selectedTicket || !resolutionNote) return;
    try {
      setIsSubmitting(true);
      await adminApi.post(`/api/admin/support-tickets/${selectedTicket.id}/resolve`, {
        resolutionNote,
      });
      setSelectedTicket(null);
      setResolutionNote('');
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve ticket');
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
            Contractor & Partner Support Desk
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
              {tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length} Pending Triage
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve jobsite delivery delays, merchant item mismatches, invoice corrections, and rider claims.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{t.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        t.priority === 'URGENT'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{t.subject}</h3>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    t.status === 'RESOLVED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : t.status === 'IN_PROGRESS'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {t.description}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                <span>By: <strong className="text-slate-900">{t.raisedByName}</strong> ({t.raisedByType})</span>
                {t.orderNumber && <span>Order: <strong className="text-emerald-700">{t.orderNumber}</strong></span>}
                <span>Created: {t.createdAt}</span>
              </div>

              {t.resolutionNote && (
                <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <strong>Resolution:</strong> {t.resolutionNote}
                </div>
              )}
            </div>

            {t.status !== 'RESOLVED' && (
              <div className="pt-2">
                <button
                  onClick={() => setSelectedTicket(t)}
                  disabled={!canResolve}
                  className="w-full bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-300 shadow-2xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Triage & Resolve Ticket</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Resolve Support Ticket #{selectedTicket.id}</h3>
            <p className="text-xs text-slate-500">
              Provide closure documentation for <strong className="text-slate-900">{selectedTicket.raisedByName}</strong>.
            </p>

            <div>
              <label className="text-slate-700 font-semibold block text-xs mb-1">Resolution Summary Note</label>
              <textarea
                rows={3}
                placeholder="e.g. Dispatched replacement circuit breaker via Express Rider and credited ₹250 wallet balance..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 text-xs">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={isSubmitting || !resolutionNote}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
