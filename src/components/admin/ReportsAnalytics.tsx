import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Percent, Zap, ShieldCheck, Download, Calendar } from 'lucide-react';
import { adminApi } from '../../utils/adminApiClient';
import { exportCustomSheet } from '../../utils/exportToSheet';

export const ReportsAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await adminApi.get<{ success: boolean; summary: any }>('/api/admin/reports/summary');
        if (res.success) {
          setData(res.summary);
        }
      } catch (err) {
        console.error('Failed to load summary reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportExecutiveSheet = () => {
    if (!data) return;

    exportCustomSheet('qcom_executive_business_report', [
      {
        title: 'FINANCIAL SUMMARY REPORT',
        rows: [
          ['Metric', 'Value (INR)', 'Description'],
          ['Gross Merchandise Value (GMV)', data.financials.totalGmv, 'Total marketplace order volume'],
          ['Net Commission Revenue', data.financials.platformCommission, 'Platform cut from merchants'],
          ['Retail Media Sponsored Ad Revenue', data.financials.adRevenue, 'Ad placement earnings'],
          ['Delivery & Fulfillment Surcharges', data.financials.deliverySurcharges, 'Hyperlocal logistics fee'],
          ['Net Platform Earnings', data.financials.netEarnings, 'Total net revenue accrued'],
        ],
      },
      {
        title: 'OPERATIONAL DELIVERY SLA SUMMARY',
        rows: [
          ['Metric', 'Performance Value'],
          ['Total Orders Fulfilled', data.operations.totalOrdersDelivered],
          ['Avg Delivery SLA (Mins)', `${data.operations.avgDeliveryMinutes} Mins`],
          ['On-Time Delivery SLA %', `${data.operations.onTimeSlaPercent}%`],
          ['Active Delivery Partners', data.operations.activeRidersCount],
          ['Onboarded GST Merchants', data.operations.activeSellersCount],
        ],
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Executive Business & Operational Reports</h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Consolidated marketplace performance across GMV, commissions, delivery logistics SLA, and retail media ad yields.
          </p>
        </div>
        <button
          onClick={handleExportExecutiveSheet}
          disabled={!data}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20"
        >
          <Download className="w-4 h-4" />
          Export Executive Sheet Summary
        </button>
      </div>

      {loading || !data ? (
        <div className="py-16 text-center text-slate-400">Loading operational analytics summary...</div>
      ) : (
        <div className="space-y-6">
          {/* Revenue Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Gross Merchandise Value</span>
              <p className="text-3xl font-extrabold text-white">₹{(data.financials.totalGmv / 10000000).toFixed(2)} Cr</p>
              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Total Marketplace Volume</span>
                <span className="text-emerald-400 font-semibold">+18.4% YoY</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Platform Take Rate Revenue</span>
              <p className="text-3xl font-extrabold text-white">₹{(data.financials.platformCommissionRevenue / 100000).toFixed(1)} Lakhs</p>
              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Avg Merchant Commission</span>
                <span className="text-sky-400 font-semibold">9.0% Effective</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Retail Media Ad Revenue</span>
              <p className="text-3xl font-extrabold text-white">₹{(data.financials.retailMediaAdRevenue / 100000).toFixed(1)} Lakhs</p>
              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Sponsored Placements Yield</span>
                <span className="text-purple-400 font-semibold">{data.retailMediaMetrics.avgRoas}x Brand ROAS</span>
              </div>
            </div>
          </div>

          {/* Operational Metrics Grid */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> 15-Minute Hyperlocal Delivery SLA Analytics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block">Avg Merchant Packing</span>
                <span className="text-xl font-bold text-white mt-1 block">{data.operationalSla.avgDispatchTimeMins} mins</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block">Avg Rider Pickup</span>
                <span className="text-xl font-bold text-white mt-1 block">{data.operationalSla.avgRiderPickupMins} mins</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block">Avg Doorstep Delivery</span>
                <span className="text-xl font-bold text-emerald-400 mt-1 block">{data.operationalSla.avgDoorstepDeliveryMins} mins</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block">Overall SLA Compliance</span>
                <span className="text-xl font-bold text-amber-400 mt-1 block">{data.operationalSla.slaCompliancePercent}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
