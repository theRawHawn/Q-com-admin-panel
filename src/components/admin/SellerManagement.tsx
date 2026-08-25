import React, { useState, useEffect } from 'react';
import {
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  TrendingUp,
  Percent,
  RefreshCw,
  Search,
  ShieldCheck,
  Power,
  Sliders,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { AdminSeller, AdminPermission } from '../../types/admin';
import { adminApi } from '../../utils/adminApiClient';
import { SellerApprovalModal } from './SellerApprovalModal';

interface SellerManagementProps {
  userPermissions: AdminPermission[];
  selectedCity?: string;
}

export const SellerManagement: React.FC<SellerManagementProps> = ({ userPermissions, selectedCity = 'all' }) => {
  const [sellers, setSellers] = useState<AdminSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'APPLICATIONS'>('ACTIVE');
  const [selectedSellerForApproval, setSelectedSellerForApproval] = useState<AdminSeller | null>(null);
  const [editingCommissionId, setEditingCommissionId] = useState<string | null>(null);
  const [tempCommission, setTempCommission] = useState<number>(8.5);

  const canApprove = userPermissions.includes('sellers.approve');
  const canSuspend = userPermissions.includes('sellers.suspend');
  const canEditCommission = userPermissions.includes('sellers.edit_commission');

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const url = selectedCity && selectedCity !== 'all'
        ? `/api/admin/sellers?city=${selectedCity}`
        : '/api/admin/sellers';
      const res: any = await adminApi.get(url);
      if (res.success) setSellers(res.sellers);
    } catch (err) {
      console.error('Failed to load sellers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [selectedCity]);

  const handleToggleStoreOnline = async (seller: AdminSeller) => {
    if (!canSuspend) return;
    try {
      await adminApi.post(`/api/admin/sellers/${seller.id}/toggle-status`, {
        isStoreOnline: !seller.isStoreOnline,
      });
      fetchSellers();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleToggleReceiveOrders = async (seller: AdminSeller) => {
    if (!canSuspend) return;
    try {
      await adminApi.post(`/api/admin/sellers/${seller.id}/toggle-status`, {
        canReceiveOrders: !seller.canReceiveOrders,
      });
      fetchSellers();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleUpdateCommission = async (sellerId: string) => {
    if (!canEditCommission) return;
    try {
      await adminApi.post(`/api/admin/sellers/${sellerId}/update-commission`, {
        commissionRatePercent: tempCommission,
      });
      setEditingCommissionId(null);
      fetchSellers();
    } catch (err: any) {
      alert(err.message || 'Failed to update commission');
    }
  };

  const activeSellers = sellers.filter((s) => s.status === 'ACTIVE' || s.status === 'SUSPENDED');
  const pendingApplications = sellers.filter((s) => s.status === 'PENDING_APPROVAL');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Authorised GST Sellers & Partner Store Hub
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
              {activeSellers.length} Onboarded Stores
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage local GST merchant KYC approvals, real-time store availability, dispatch SLAs, and commission economics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Stores ({activeSellers.length})
            </button>
            <button
              onClick={() => setActiveTab('APPLICATIONS')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'APPLICATIONS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>KYC Applications</span>
              {pendingApplications.length > 0 && (
                <span className="bg-indigo-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {pendingApplications.length}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={fetchSellers}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 shadow-2xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* SECTION: PENDING KYC APPLICATIONS */}
      {activeTab === 'APPLICATIONS' ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-600" />
              Local Merchant Applications Pending Review
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Review GSTIN validity, PAN authentication, bank account mandates, and trade licenses.
            </p>

            {pendingApplications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No pending seller applications at this time. All KYC queues cleared!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingApplications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 hover:border-slate-300 transition-all shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{app.name}</h4>
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          PENDING AUDIT
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{app.hubType} · {app.areaName}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 font-mono">
                      <div>Owner: <span className="text-slate-900 font-semibold">{app.ownerName}</span></div>
                      <div>Phone: <span className="text-slate-600">{app.phone}</span></div>
                      <div>GSTIN: <span className="text-emerald-700 font-bold">{app.gstin}</span></div>
                      <div>Bank: <span className="text-slate-700">{app.bankAccount.bankName}</span></div>
                    </div>

                    <button
                      onClick={() => setSelectedSellerForApproval(app)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <FileCheck className="h-4 w-4" />
                      <span>Audit Documents & Decision</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SECTION: ACTIVE STORES & CONTROLS */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Seller Store Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{seller.name}</h3>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          seller.isStoreOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      ></span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{seller.hubType}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{seller.address}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-emerald-700 font-mono font-bold text-xs">★ {seller.rating}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">{seller.totalOrders} Delivered</span>
                  </div>
                </div>

                {/* SLA & Prep Time Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Avg Prep Time</span>
                    <span className="text-xs font-bold text-slate-900">{seller.avgPrepTimeMins} mins</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">SLA Rate</span>
                    <span className="text-xs font-bold text-emerald-700">{seller.slaAdherencePercent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Active Orders</span>
                    <span className="text-xs font-bold text-sky-700">{seller.activeOrdersCount}</span>
                  </div>
                </div>

                {/* Granular Store Controls (Online / Ordering / Commission) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">Store Availability (Online):</span>
                    <button
                      onClick={() => handleToggleStoreOnline(seller)}
                      disabled={!canSuspend}
                      className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-colors ${
                        seller.isStoreOnline
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {seller.isStoreOnline ? 'ONLINE' : 'OFFLINE'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">Can Receive Quick Orders:</span>
                    <button
                      onClick={() => handleToggleReceiveOrders(seller)}
                      disabled={!canSuspend}
                      className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-colors ${
                        seller.canReceiveOrders
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {seller.canReceiveOrders ? 'ENABLED' : 'PAUSED'}
                    </button>
                  </div>

                  {/* Commission Editor */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-medium">Marketplace Commission:</span>
                    {editingCommissionId === seller.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          value={tempCommission}
                          onChange={(e) => setTempCommission(Number(e.target.value))}
                          className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-900 font-mono"
                        />
                        <button
                          onClick={() => handleUpdateCommission(seller.id)}
                          className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[11px]"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCommissionId(null)}
                          className="text-slate-500 hover:text-slate-800 text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-700 font-bold">{seller.commissionRatePercent}%</span>
                        {canEditCommission && (
                          <button
                            onClick={() => {
                              setEditingCommissionId(seller.id);
                              setTempCommission(seller.commissionRatePercent);
                            }}
                            className="text-slate-500 hover:text-slate-800 text-[10px] underline"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seller Approval Modal */}
      {selectedSellerForApproval && (
        <SellerApprovalModal
          seller={selectedSellerForApproval}
          onClose={() => setSelectedSellerForApproval(null)}
          onRefresh={fetchSellers}
          canApprove={canApprove}
        />
      )}
    </div>
  );
};
