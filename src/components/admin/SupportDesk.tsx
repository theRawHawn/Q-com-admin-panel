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
  AlertCircle,
  X
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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const canResolve =
    userPermissions.includes('support.manage') ||
    userPermissions.includes('support.resolve_ticket') ||
    userPermissions.includes('support.resolve' as any) ||
    userPermissions.includes('*' as any);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res: any = await adminApi.get('/api/admin/support/tickets');
      if (res.success && res.tickets) {
        setTickets(res.tickets);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
      // Fallback try alias
      try {
        const fallbackRes: any = await adminApi.get('/api/admin/support-tickets');
        if (fallbackRes.success && fallbackRes.tickets) {
          setTickets(fallbackRes.tickets);
        }
      } catch (e) {
        console.error('Fallback also failed:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async () => {
    if (!selectedTicket || !resolutionNote.trim()) return;
    try {
      setIsSubmitting(true);
      await adminApi.post(`/api/admin/support/tickets/${selectedTicket.id}/resolve`, {
        resolutionNote: resolutionNote.trim(),
        resolutionNotes: resolutionNote.trim(),
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

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.id.toLowerCase().includes(q) ||
        (t.ticketNumber && t.ticketNumber.toLowerCase().includes(q)) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.customerName && t.customerName.toLowerCase().includes(q)) ||
        (t.raisedByName && t.raisedByName.toLowerCase().includes(q)) ||
        (t.orderNumber && t.orderNumber.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const pendingCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Support Desk</h1>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200/80 transition-colors shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-slate-600' : 'text-slate-500'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Status Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: 'All Tickets', count: tickets.length, key: 'ALL' as const },
          { label: 'Open Triage', count: openCount, key: 'OPEN' as const, badge: 'bg-rose-500' },
          { label: 'In Progress', count: inProgressCount, key: 'IN_PROGRESS' as const, badge: 'bg-sky-500' },
          { label: 'Resolved', count: resolvedCount, key: 'RESOLVED' as const, badge: 'bg-emerald-500' },
        ].map((tab) => {
          const isSelected = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`p-3 rounded-xl border text-left transition-all shadow-xs ${
                isSelected
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-medium ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                  {tab.label}
                </span>
                {tab.badge && !isSelected && (
                  <span className={`h-1.5 w-1.5 rounded-full ${tab.badge}`} />
                )}
              </div>
              <div className="text-lg font-bold mt-1 tracking-tight">
                {tab.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, customer, order number, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/75 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-normal self-end sm:self-auto">
          Showing <strong className="text-slate-700 font-medium">{filteredTickets.length}</strong> of {tickets.length} tickets
        </div>
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 && !loading && (
        <div className="text-center py-12 bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <LifeBuoy className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-xs font-semibold text-slate-900">No support tickets found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
            {searchQuery ? 'No tickets match the search query.' : 'There are no support tickets in this category.'}
          </p>
        </div>
      )}

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredTickets.map((t) => (
          <div
            key={t.id}
            className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-medium text-slate-500">
                      {t.ticketNumber || t.id}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-medium uppercase border ${
                        t.priority === 'CRITICAL' || t.priority === 'URGENT'
                          ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                          : 'bg-slate-100 text-slate-600 border-slate-200/60'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mt-1">{t.subject}</h3>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border shrink-0 ${
                    t.status === 'RESOLVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      : t.status === 'IN_PROGRESS'
                      ? 'bg-sky-50 text-sky-700 border-sky-200/60'
                      : 'bg-rose-50 text-rose-700 border-rose-200/60'
                  }`}
                >
                  {t.status === 'IN_PROGRESS' ? 'In Progress' : t.status === 'RESOLVED' ? 'Resolved' : 'Open'}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-2.5 bg-slate-50/75 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                {t.description}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-slate-500">
                <span>By: <strong className="text-slate-800 font-medium">{t.raisedByName || t.customerName}</strong> ({t.raisedByType || 'CUSTOMER'})</span>
                {t.orderNumber && <span>Order: <strong className="text-slate-800 font-medium font-mono">{t.orderNumber}</strong></span>}
                {t.assignedTo && <span>Assignee: <strong className="text-slate-700 font-medium">{t.assignedTo}</strong></span>}
                <span>Created: {t.createdAt}</span>
              </div>

              {t.resolutionNote && (
                <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60">
                  <strong className="font-medium">Resolution:</strong> {t.resolutionNote}
                </div>
              )}
            </div>

            {t.status !== 'RESOLVED' && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedTicket(t);
                    setResolutionNote('');
                  }}
                  disabled={!canResolve}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
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
          <div className="bg-white border border-slate-200/80 rounded-xl w-full max-w-md p-5 shadow-xl space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Resolve Ticket #{selectedTicket.ticketNumber || selectedTicket.id}</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Document resolution summary for <strong className="text-slate-800 font-medium">{selectedTicket.raisedByName || selectedTicket.customerName}</strong>.
            </p>

            <div>
              <label className="text-slate-700 font-medium block text-xs mb-1">Resolution Summary</label>
              <textarea
                rows={3}
                placeholder="e.g. Dispatched replacement unit via Express Rider; credited ₹250 wallet balance..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full bg-slate-50/75 border border-slate-200/80 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={isSubmitting || !resolutionNote.trim()}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium rounded-lg transition-colors shadow-xs"
              >
                {isSubmitting ? 'Resolving...' : 'Mark as Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

