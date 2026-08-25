import React, { useState, useEffect } from 'react';
import {
  Bike,
  CheckCircle2,
  XCircle,
  Radio,
  Battery,
  ShieldCheck,
  RefreshCw,
  Search,
  Zap,
  Phone,
  FileCheck
} from 'lucide-react';
import { AdminRider, AdminPermission } from '../../types/admin';
import { adminApi } from '../../utils/adminApiClient';

interface RiderFleetManagementProps {
  userPermissions: AdminPermission[];
  selectedCity?: string;
}

export const RiderFleetManagement: React.FC<RiderFleetManagementProps> = ({ userPermissions, selectedCity = 'all' }) => {
  const [riders, setRiders] = useState<AdminRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const canApprove = userPermissions.includes('riders.approve');
  const canSuspend = userPermissions.includes('riders.suspend');

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const url = selectedCity && selectedCity !== 'all'
        ? `/api/admin/riders?city=${selectedCity}`
        : '/api/admin/riders';
      const res: any = await adminApi.get(url);
      if (res.success) setRiders(res.riders);
    } catch (err) {
      console.error('Failed to load riders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, [selectedCity]);

  const handleApproveRider = async (riderId: string) => {
    if (!canApprove) return;
    try {
      await adminApi.post(`/api/admin/riders/${riderId}/approve`, {});
      fetchRiders();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const filteredRiders = riders.filter((r) => {
    const matchesFilter = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesQuery =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Delivery Partner & Fleet Management
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
              {riders.length} Registered Partners
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fleet readiness, background verification compliance, live telemetry, and earnings tracking.
          </p>
        </div>

        <button
          onClick={fetchRiders}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
          {['ALL', 'ONLINE', 'ON_DELIVERY', 'OFFLINE', 'PENDING_APPROVAL'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-all uppercase font-medium ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search rider name, vehicle or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Riders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRiders.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={r.avatar} alt={r.name} className="h-11 w-11 rounded-full object-cover" />
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${
                        r.status === 'ONLINE'
                          ? 'bg-emerald-500'
                          : r.status === 'ON_DELIVERY'
                          ? 'bg-sky-500'
                          : r.status === 'PENDING_APPROVAL'
                          ? 'bg-indigo-500'
                          : 'bg-slate-400'
                      }`}
                    ></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{r.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{r.phone}</p>
                    <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-mono mt-1 inline-block font-medium">
                      {r.vehicleType.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-700 font-mono font-bold text-xs">★ {r.rating}</span>
                  <span className="text-[10px] text-slate-500 block font-mono">{r.totalDeliveries} Lifetime</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="text-slate-900 font-semibold truncate max-w-[170px]">{r.vehicleNumber}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Current Area:</span>
                  <span className="text-slate-800 font-medium">{r.currentLocation?.areaName || 'Offline'}</span>
                </div>
                {r.batteryPercent && (
                  <div className="flex justify-between text-slate-700 items-center">
                    <span className="text-slate-500">EV Battery:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Battery className="h-3.5 w-3.5" />
                      {r.batteryPercent}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Today's Payout:</span>
                  <span className="text-emerald-700 font-bold">₹{r.todayEarnings} ({r.todayDeliveries} trips)</span>
                </div>
              </div>
            </div>

            {/* Rider State Action */}
            <div className="pt-2">
              {r.status === 'PENDING_APPROVAL' ? (
                <button
                  onClick={() => handleApproveRider(r.id)}
                  disabled={!canApprove}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <FileCheck className="h-4 w-4" />
                  <span>Verify Documents & Approve</span>
                </button>
              ) : (
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Active Since: {r.activeSince}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase ${
                      r.status === 'ONLINE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : r.status === 'ON_DELIVERY'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {r.status.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
