import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Bike,
  AlertTriangle,
  ArrowUpRight,
  Store,
  Clock,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { adminApi } from '../../utils/adminApiClient';

interface DashboardOverviewProps {
  onNavigateTab: (tabId: string) => void;
  selectedCity?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateTab, selectedCity = 'all' }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setIsRefreshing(true);
      const url = selectedCity && selectedCity !== 'all' 
        ? `/api/admin/dashboard/metrics?city=${selectedCity}` 
        : '/api/admin/dashboard/metrics';
      const data: any = await adminApi.get(url);
      if (data.success) {
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, [selectedCity]);

  if (loading || !metrics) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[350px]">
        <div className="flex flex-col items-center gap-2.5 text-slate-400">
          <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
          <span className="text-xs">Loading metrics...</span>
        </div>
      </div>
    );
  }

  const { kpis, activeNow, alerts, hourlyTrend } = metrics;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Marketplace Overview
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-normal">
              {selectedCity === 'all' ? 'National Grid' : selectedCity.toUpperCase()}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMetrics}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Top Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Gross GMV</span>
          <div className="text-xl font-bold text-slate-900 mt-1">₹{kpis.todayGmv.toLocaleString('en-IN')}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>+18.4% today</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Orders</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{kpis.todayOrders.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            96.7% completed
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Active Fleet</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{activeNow.ridersOnline + activeNow.ridersDelivering}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {activeNow.ridersDelivering} en route
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Avg Delivery SLA</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{kpis?.avgDeliverySlaMins || 14.8} min</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Standard target: &lt;15m
          </div>
        </div>
      </div>

      {/* Actionable Alerts Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          onClick={() => onNavigateTab('dispatch')}
          className="bg-white border border-slate-200 hover:border-rose-300 rounded-xl p-3.5 text-left transition-all group flex items-center justify-between shadow-2xs"
        >
          <div>
            <div className="text-xs font-semibold text-rose-600 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Unassigned
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{alerts.ordersWithoutRider}</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-rose-600 transition-colors" />
        </button>

        <button 
          onClick={() => onNavigateTab('sellers')}
          className="bg-white border border-slate-200 hover:border-amber-300 rounded-xl p-3.5 text-left transition-all group flex items-center justify-between shadow-2xs"
        >
          <div>
            <div className="text-xs font-semibold text-amber-600 flex items-center gap-1">
              <Store className="h-3.5 w-3.5" />
              Stores Offline
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{alerts.sellersOffline}</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
        </button>

        <button 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white border border-slate-200 hover:border-sky-300 rounded-xl p-3.5 text-left transition-all group flex items-center justify-between shadow-2xs"
        >
          <div>
            <div className="text-xs font-semibold text-sky-600 flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              Low Stock
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{alerts.lowStockAlerts}</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-sky-600 transition-colors" />
        </button>

        <button 
          onClick={() => onNavigateTab('refunds')}
          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-3.5 text-left transition-all group flex items-center justify-between shadow-2xs"
        >
          <div>
            <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
              <RotateCcw className="h-3.5 w-3.5" />
              Refunds
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{kpis.refundsCount}</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
        </button>
      </div>

      {/* Main Charts & Live Pipeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Hourly Trend */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Hourly Order Volume</h3>
            <span className="text-xs text-slate-500 font-medium">Peak: 312 ord/hr</span>
          </div>

          <div className="grid grid-cols-7 gap-3 items-end h-32 pt-2">
            {hourlyTrend.map((h: any, i: number) => {
              const heightPct = Math.max(12, (h.orders / 320) * 100);
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full bg-slate-100 rounded-t h-24 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-emerald-600 group-hover:bg-emerald-500 transition-all rounded-t"
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500">{h.hour}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">B2B Trade Share</span>
              <span className="font-semibold text-slate-800">{kpis.b2bPercentage}%</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">GST ITC Claimed</span>
              <span className="font-semibold text-slate-800">₹{kpis.totalItcClaimed.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Cancellations</span>
              <span className="font-semibold text-slate-800">{kpis.cancelledOrders} ({((kpis.cancelledOrders / (kpis.todayOrders || 1)) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Pipeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Live Pipeline</h3>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Package className="h-4 w-4 text-amber-600" />
                <span className="text-slate-700 font-medium">Packing in Stores</span>
              </div>
              <span className="font-bold text-slate-900">{activeNow.ordersPreparing}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-sky-600" />
                <span className="text-slate-700 font-medium">Ready for Pickup</span>
              </div>
              <span className="font-bold text-slate-900">{activeNow.ordersReadyForPickup}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Bike className="h-4 w-4 text-emerald-600" />
                <span className="text-slate-700 font-medium">Out for Delivery</span>
              </div>
              <span className="font-bold text-slate-900">{activeNow.ridersDelivering}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-slate-600" />
                <span className="text-slate-700 font-medium">Available Riders</span>
              </div>
              <span className="font-bold text-slate-900">{activeNow.ridersOnline}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
