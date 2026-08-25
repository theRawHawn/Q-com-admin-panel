import React, { useState, useEffect } from 'react';
import { Tag, Plus, Percent, DollarSign, Zap, CheckCircle2, PauseCircle, Clock, ShieldCheck, Filter, Download } from 'lucide-react';
import { adminApi } from '../../utils/adminApiClient';
import { exportToCsv } from '../../utils/exportToSheet';
import { AdminPromotion, PromotionFundingSource } from '../../types/admin';

export const PromotionsManager: React.FC = () => {
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'COUPON',
    discountValue: 50,
    isPercentage: false,
    minOrderValue: 499,
    maxDiscountCap: 100,
    fundingSource: 'PLATFORM' as PromotionFundingSource,
    platformShare: 100,
    sellerShare: 0,
    brandShare: 0,
    applicableBrand: '',
    applicableCategory: '',
    validUntil: '2026-12-31',
  });

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<{ success: boolean; promotions: AdminPromotion[] }>('/api/admin/promotions');
      if (res.success) {
        setPromotions(res.promotions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await adminApi.post<{ success: boolean; promotion: AdminPromotion }>(`/api/admin/promotions/${id}/toggle`, {});
      if (res.success) {
        setPromotions((prev) => prev.map((p) => (p.id === id ? res.promotion : p)));
      }
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminApi.post<{ success: boolean; promotion: AdminPromotion }>('/api/admin/promotions/create', {
        ...formData,
        fundingSharePercent: {
          platform: formData.platformShare,
          seller: formData.sellerShare,
          brand: formData.brandShare,
        },
      });
      if (res.success) {
        setPromotions((prev) => [res.promotion, ...prev]);
        setShowCreateModal(false);
        setFormData({
          code: '',
          name: '',
          type: 'COUPON',
          discountValue: 50,
          isPercentage: false,
          minOrderValue: 499,
          maxDiscountCap: 100,
          fundingSource: 'PLATFORM',
          platformShare: 100,
          sellerShare: 0,
          brandShare: 0,
          applicableBrand: '',
          applicableCategory: '',
          validUntil: '2026-12-31',
        });
      }
    } catch (err: any) {
      alert(`Failed to create promotion: ${err.message}`);
    }
  };

  const filtered = promotions.filter((p) => {
    if (filterSource === 'ALL') return true;
    return p.fundingSource === filterSource;
  });

  const handleExportPromotions = () => {
    exportToCsv<AdminPromotion>('qcom_promotions_funding_sheet', [
      { header: 'Promo ID', accessor: (p) => p.id },
      { header: 'Coupon Code', accessor: (p) => p.code },
      { header: 'Campaign Title', accessor: (p) => p.name },
      { header: 'Type', accessor: (p) => p.type },
      { header: 'Discount Value', accessor: (p) => p.isPercentage ? `${p.discountValue}%` : `INR ${p.discountValue}` },
      { header: 'Min Order (INR)', accessor: (p) => p.minOrderValue },
      { header: 'Max Cap (INR)', accessor: (p) => p.maxDiscountCap },
      { header: 'Funding Source', accessor: (p) => p.fundingSource },
      { header: 'Platform Share %', accessor: (p) => p.fundingSharePercent?.platform || 100 },
      { header: 'Seller Share %', accessor: (p) => p.fundingSharePercent?.seller || 0 },
      { header: 'Brand Share %', accessor: (p) => p.fundingSharePercent?.brand || 0 },
      { header: 'Usage Count', accessor: (p) => p.usageCount },
      { header: 'Max Limit', accessor: (p) => p.maxUsageLimit },
      { header: 'Status', accessor: (p) => p.status },
      { header: 'Created By', accessor: (p) => p.createdBy },
    ], promotions);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Promotions & Coupon Funding Engine</h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Manage discount codes, category offers, and multi-party funding attribution (Platform vs Seller vs Brand).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPromotions}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all border border-slate-700"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Export Coupons Sheet
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Create Promotion Code
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Total Active Promotions</p>
          <p className="text-2xl font-bold text-white mt-1">{promotions.filter((p) => p.status === 'ACTIVE').length}</p>
          <span className="inline-block mt-2 text-xs text-amber-400 font-medium">Live in Checkout Engine</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Total Coupon Redemptions</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {promotions.reduce((sum, p) => sum + p.usageCount, 0).toLocaleString('en-IN')}
          </p>
          <span className="inline-block mt-2 text-xs text-slate-400">Tracked across orders</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Brand Funded Campaigns</p>
          <p className="text-2xl font-bold text-sky-400 mt-1">
            {promotions.filter((p) => p.fundingSource === 'BRAND').length}
          </p>
          <span className="inline-block mt-2 text-xs text-slate-400">100% Brand Reimbursed</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Shared Co-Op Funded</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">
            {promotions.filter((p) => p.fundingSource === 'SHARED').length}
          </p>
          <span className="inline-block mt-2 text-xs text-slate-400">Platform + Seller Split</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium mr-2">
          <Filter className="w-3.5 h-3.5" /> Funding Filter:
        </span>
        {['ALL', 'PLATFORM', 'BRAND', 'SELLER', 'SHARED'].map((src) => (
          <button
            key={src}
            onClick={() => setFilterSource(src)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterSource === src
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800'
            }`}
          >
            {src} {src !== 'ALL' && 'Funded'}
          </button>
        ))}
      </div>

      {/* Promotions List Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Promo Code & Title</th>
                <th className="px-6 py-4">Discount Mechanics</th>
                <th className="px-6 py-4">Funding Source</th>
                <th className="px-6 py-4">Usage & Limits</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Loading promotional engine dataset...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No promotions found for selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 font-mono font-bold text-xs tracking-wider">
                          {p.code}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{p.name}</p>
                          <p className="text-xs text-slate-400">Created by {p.createdBy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-200">
                          {p.isPercentage ? `${p.discountValue}% OFF` : `₹${p.discountValue} FLAT OFF`}
                        </p>
                        <p className="text-xs text-slate-400">
                          Min Order: ₹{p.minOrderValue} | Max Cap: ₹{p.maxDiscountCap}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            p.fundingSource === 'BRAND'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              : p.fundingSource === 'SHARED'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                              : p.fundingSource === 'SELLER'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {p.fundingSource}
                        </span>
                        {p.fundingSharePercent && (
                          <p className="text-[11px] text-slate-400">
                            PF: {p.fundingSharePercent.platform}% | Brand: {p.fundingSharePercent.brand}% | Seller: {p.fundingSharePercent.seller}%
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-200">
                          {p.usageCount.toLocaleString('en-IN')} / {p.maxUsageLimit.toLocaleString('en-IN')}
                        </p>
                        <div className="w-28 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full"
                            style={{ width: `${Math.min(100, (p.usageCount / p.maxUsageLimit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p.status === 'ACTIVE' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          p.status === 'ACTIVE'
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {p.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-400" /> Create New Coupon Campaign
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MONSOON100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm font-mono tracking-wider focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Monsoon Heavy Electricals Sale"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Type</label>
                  <select
                    value={formData.isPercentage ? 'PERCENT' : 'FLAT'}
                    onChange={(e) => setFormData({ ...formData, isPercentage: e.target.value === 'PERCENT' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="FLAT">Flat ₹ Discount</option>
                    <option value="PERCENT">Percentage % Discount</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountCap}
                    onChange={(e) => setFormData({ ...formData, maxDiscountCap: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Funding Source</label>
                <select
                  value={formData.fundingSource}
                  onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value as PromotionFundingSource })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="PLATFORM">PLATFORM (100% Marketplace funded)</option>
                  <option value="BRAND">BRAND (100% Brand manufacturer funded)</option>
                  <option value="SELLER">SELLER (100% Merchant seller funded)</option>
                  <option value="SHARED">SHARED (Custom split ratio)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-semibold hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                >
                  Launch Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
