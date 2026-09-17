import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Percent,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  TrendingUp,
  ShieldCheck,
  Save,
  Search
} from 'lucide-react';
import { AdminPricingConfig, AdminPermission } from '../../types/admin';
import { adminApi } from '../../utils/adminApiClient';

interface PricingEconomicsConfigProps {
  userPermissions: AdminPermission[];
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
}

export const PricingEconomicsConfig: React.FC<PricingEconomicsConfigProps> = ({
  userPermissions,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
}) => {
  const [config, setConfig] = useState<AdminPricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');

  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (onSearchQueryChange) {
      onSearchQueryChange(val);
    }
  };

  const canEditPricing = userPermissions.includes('pricing.edit');

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res: any = await adminApi.get('/api/admin/pricing-config');
      if (res.success) setConfig(res.config);
    } catch (err) {
      console.error('Failed to load pricing config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !canEditPricing) return;
    try {
      setIsSaving(true);
      await adminApi.post('/api/admin/pricing-config', config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchConfig();
    } catch (err: any) {
      alert(err.message || 'Failed to update pricing rules');
    } finally {
      setIsSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="p-12 text-center text-slate-500">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
        <span>Loading global marketplace economics parameters...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Pricing & Economics
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search pricing rules & commission parameters..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
            />
          </div>

          <button
            onClick={fetchConfig}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shadow-2xs shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Reload Config</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>Pricing configuration updated and propagated to customer checkout engine!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Delivery Fees */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Customer Delivery & Handling Fee Policy
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-700 font-sans font-semibold block mb-1">
                  Base Delivery Fee (Orders under Free Threshold)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    value={config.baseDeliveryFee}
                    onChange={(e) => setConfig({ ...config, baseDeliveryFee: Number(e.target.value) })}
                    disabled={!canEditPricing}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-sans font-semibold block mb-1">
                  Free Delivery Cart Value Threshold (Min ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    value={config.freeDeliveryThreshold}
                    onChange={(e) => setConfig({ ...config, freeDeliveryThreshold: Number(e.target.value) })}
                    disabled={!canEditPricing}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-sans font-semibold block mb-1">
                  Platform Tech & Handling Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    value={config.platformFee}
                    onChange={(e) => setConfig({ ...config, platformFee: Number(e.target.value) })}
                    disabled={!canEditPricing}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-sans font-semibold block mb-1">
                  Emergency 10-Min Flash Rush Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    value={config.urgencyFee}
                    onChange={(e) => setConfig({ ...config, urgencyFee: Number(e.target.value) })}
                    disabled={!canEditPricing}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Merchant & Rider Partner Economics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-3 flex items-center gap-2">
              <Percent className="h-4 w-4 text-sky-600" />
              Merchant Take-Rate & Rider Payout Rules
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-700 font-sans font-semibold block mb-1">
                  Default Seller Commission Rate (%)
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  <input
                    type="number"
                    step="0.1"
                    value={config.defaultCommissionPercent}
                    onChange={(e) => setConfig({ ...config, defaultCommissionPercent: Number(e.target.value) })}
                    disabled={!canEditPricing}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-sans font-semibold block mb-1">
                  Delivery Partner Base Payout per Trip
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    value={config.riderBasePayout}
                    onChange={(e) => setConfig({ ...config, riderBasePayout: Number(e.target.value) })}
                    disabled={!canEditPricing}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-sans font-semibold block mb-1">
                  Rider Distance Incentive (₹ per KM above 3km)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    value={config.riderPerKmPayout}
                    onChange={(e) => setConfig({ ...config, riderPerKmPayout: Number(e.target.value) })}
                    disabled={!canEditPricing}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between font-sans">
                <div>
                  <span className="font-bold text-slate-900 block">Surge Pricing Engine</span>
                  <span className="text-slate-500 text-[11px]">Dynamic algorithmic rain & peak multipliers</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, isSurgeActive: !config.isSurgeActive })}
                  disabled={!canEditPricing}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                    config.isSurgeActive
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {config.isSurgeActive ? 'SURGE ACTIVE' : 'SURGE DISABLED'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {canEditPricing && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>Save & Publish Global Economics</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
