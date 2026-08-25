import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, TrendingUp, Eye, MousePointer, ShoppingCart, DollarSign, Award, CheckCircle, ShieldAlert, Layers, Download } from 'lucide-react';
import { adminApi } from '../../utils/adminApiClient';
import { exportToCsv } from '../../utils/exportToSheet';
import { SponsoredAdCampaign, AdPlacement, AdCampaignStatus } from '../../types/admin';

export const SponsoredAdsManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<SponsoredAdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    campaignName: '',
    advertiserBrand: '',
    brandContactEmail: '',
    placement: 'HOME_TOP_BANNER' as AdPlacement,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-10-31',
    totalBudget: 250000,
    billingMethod: 'CPM' as 'CPM' | 'CPC' | 'FIXED',
    cpmRate: 120,
    cpcRate: 12,
    targetGeography: 'Bengaluru, Mumbai, Delhi NCR',
    targetCategory: 'Electrical Switchgears',
    creativeUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=1200&auto=format&fit=crop&q=80',
    headline: 'Authorized Manufacturer Range Delivered in 15 Mins',
    ctaText: 'Explore Range',
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<{ success: boolean; campaigns: SponsoredAdCampaign[] }>('/api/admin/ads/campaigns');
      if (res.success) {
        setCampaigns(res.campaigns);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load ad campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await adminApi.post<{ success: boolean; campaign: SponsoredAdCampaign }>(`/api/admin/ads/campaigns/${id}/approve`, {});
      if (res.success) {
        setCampaigns((prev) => prev.map((c) => (c.id === id ? res.campaign : c)));
      }
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await adminApi.post<{ success: boolean; campaign: SponsoredAdCampaign }>(`/api/admin/ads/campaigns/${id}/toggle`, {});
      if (res.success) {
        setCampaigns((prev) => prev.map((c) => (c.id === id ? res.campaign : c)));
      }
    } catch (err: any) {
      alert(`Status toggle failed: ${err.message}`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminApi.post<{ success: boolean; campaign: SponsoredAdCampaign }>('/api/admin/ads/campaigns/create', formData);
      if (res.success) {
        setCampaigns((prev) => [res.campaign, ...prev]);
        setShowCreateModal(false);
      }
    } catch (err: any) {
      alert(`Failed to create ad campaign: ${err.message}`);
    }
  };

  const filtered = campaigns.filter((c) => {
    if (selectedPlacement === 'ALL') return true;
    return c.placement === selectedPlacement;
  });

  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.analytics?.impressions || 0), 0);
  const totalAttributableRevenue = campaigns.reduce((sum, c) => sum + (c.analytics?.attributableRevenue || 0), 0);
  const totalBudgetSpent = campaigns.reduce((sum, c) => sum + c.spentBudget, 0);
  const overallRoas = totalBudgetSpent > 0 ? (totalAttributableRevenue / totalBudgetSpent).toFixed(1) : '7.8';

  const handleExportAds = () => {
    exportToCsv<SponsoredAdCampaign>('qcom_retail_media_ads_sheet', [
      { header: 'Campaign ID', accessor: (c) => c.id },
      { header: 'Campaign Name', accessor: (c) => c.campaignName },
      { header: 'Advertiser Brand', accessor: (c) => c.advertiserBrand },
      { header: 'Brand Email', accessor: (c) => c.brandContactEmail },
      { header: 'Placement', accessor: (c) => c.placement },
      { header: 'Status', accessor: (c) => c.status },
      { header: 'Billing Method', accessor: (c) => c.billingMethod },
      { header: 'Total Budget (INR)', accessor: (c) => c.totalBudget },
      { header: 'Spent Budget (INR)', accessor: (c) => c.spentBudget },
      { header: 'Impressions', accessor: (c) => c.analytics?.impressions || 0 },
      { header: 'Clicks', accessor: (c) => c.analytics?.clicks || 0 },
      { header: 'CTR %', accessor: (c) => c.analytics?.ctrPercent || 0 },
      { header: 'Attributable Orders', accessor: (c) => c.analytics?.attributableOrders || 0 },
      { header: 'Attributable Revenue (INR)', accessor: (c) => c.analytics?.attributableRevenue || 0 },
      { header: 'ROAS Multiplier', accessor: (c) => c.analytics?.roasMultiplier || 0 },
      { header: 'Start Date', accessor: (c) => c.startDate },
      { header: 'End Date', accessor: (c) => c.endDate },
    ], campaigns);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Retail Media Sponsored Ads Engine (Phase 2)</h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Monetize high-intent contractor traffic with native sponsored placement bidding, multi-stage approvals, and real-time ROAS tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAds}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all border border-slate-700"
          >
            <Download className="w-4 h-4 text-purple-400" />
            Export Ads Performance Sheet
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            New Brand Ad Campaign
          </button>
        </div>
      </div>

      {/* Retail Media Performance Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Total Ad Impressions Delivered</p>
          <p className="text-2xl font-bold text-white mt-1">{(totalImpressions / 1000000).toFixed(2)}M</p>
          <span className="inline-block mt-2 text-xs text-purple-400 font-medium">Across all placements</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Attributable Brand Sales GMV</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">₹{(totalAttributableRevenue / 100000).toFixed(1)} Lakhs</p>
          <span className="inline-block mt-2 text-xs text-slate-400">Directly attributed sales</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Average Campaign ROAS</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{overallRoas}x</p>
          <span className="inline-block mt-2 text-xs text-slate-400">Return On Ad Spend</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Active Live Campaigns</p>
          <p className="text-2xl font-bold text-sky-400 mt-1">{campaigns.filter((c) => c.status === 'LIVE').length}</p>
          <span className="inline-block mt-2 text-xs text-slate-400">Bidding actively</span>
        </div>
      </div>

      {/* Placement Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium mr-2">
          <Layers className="w-3.5 h-3.5" /> Placement:
        </span>
        {['ALL', 'HOME_TOP_BANNER', 'SEARCH_TOP_SPONSORED', 'PRODUCT_LIST_SPONSORED'].map((pl) => (
          <button
            key={pl}
            onClick={() => setSelectedPlacement(pl)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedPlacement === pl
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800'
            }`}
          >
            {pl.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Loading Retail Media ad engine analytics...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No ad campaigns found.
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                {/* Banner Preview */}
                <div className="relative h-36 bg-slate-950 overflow-hidden">
                  <img src={c.creativeUrl} alt={c.headline} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-slate-950/80 border border-slate-700 backdrop-blur-md rounded-md text-[11px] font-semibold text-purple-300">
                      {c.placement.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        c.status === 'LIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : c.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{c.advertiserBrand}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{c.campaignName}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.headline}</p>
                  </div>

                  {/* Budget & Billing */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/60 rounded-xl p-3 text-xs border border-slate-800/80">
                    <div>
                      <span className="text-slate-400">Budget Spent</span>
                      <p className="font-semibold text-white mt-0.5">₹{c.spentBudget.toLocaleString('en-IN')} / ₹{c.totalBudget.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Billing Method</span>
                      <p className="font-semibold text-purple-300 mt-0.5">{c.billingMethod} (Rate: ₹{c.cpmRate || c.cpcRate})</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                      <span className="text-[10px] text-slate-400 block">Impressions</span>
                      <span className="font-semibold text-white">{((c.analytics?.impressions || 0) / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                      <span className="text-[10px] text-slate-400 block">CTR %</span>
                      <span className="font-semibold text-emerald-400">{c.analytics?.ctrPercent || 0}%</span>
                    </div>
                    <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                      <span className="text-[10px] text-slate-400 block">ROAS</span>
                      <span className="font-semibold text-amber-400">{c.analytics?.roasMultiplier || 0}x</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Stage: {c.approvalWorkflow.currentStage}</span>
                <div className="flex items-center gap-2">
                  {c.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleApprove(c.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-emerald-600/20"
                    >
                      Approve & Publish
                    </button>
                  )}
                  {c.status !== 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleToggle(c.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all"
                    >
                      {c.status === 'LIVE' ? 'Pause Ad' : 'Resume'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-400" /> New Brand Retail Media Ad Campaign
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  placeholder="Havells Switchgears Summer Surge"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Advertiser Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.advertiserBrand}
                    onChange={(e) => setFormData({ ...formData, advertiserBrand: e.target.value })}
                    placeholder="Havells India"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Ad Placement</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value as AdPlacement })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="HOME_TOP_BANNER">Home Top Hero Banner</option>
                    <option value="SEARCH_TOP_SPONSORED">Search Results Top Sponsored</option>
                    <option value="PRODUCT_LIST_SPONSORED">Product Category Listing Sponsored</option>
                    <option value="CHECKOUT_PROMOTION">Checkout Page Promotion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Total Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.totalBudget}
                    onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Billing Model</label>
                  <select
                    value={formData.billingMethod}
                    onChange={(e) => setFormData({ ...formData, billingMethod: e.target.value as 'CPM' | 'CPC' | 'FIXED' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="CPM">CPM (Cost Per 1k Impressions)</option>
                    <option value="CPC">CPC (Cost Per Click)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Ad Headline & Tagline</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Heavy Duty Industrial MCBs delivered in 15 mins"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Creative Image URL</label>
                <input
                  type="text"
                  value={formData.creativeUrl}
                  onChange={(e) => setFormData({ ...formData, creativeUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-500 shadow-lg shadow-purple-600/20"
                >
                  Submit Campaign for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
