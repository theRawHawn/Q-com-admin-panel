import React, { useState, useEffect } from 'react';
import { Layout, Image as ImageIcon, Plus, Layers, MapPin, Eye, Trash2, CheckCircle, Smartphone } from 'lucide-react';
import { adminApi } from '../../utils/adminApiClient';
import { CmsHeroBanner, CmsCuratedCollection } from '../../types/admin';

export const CmsContentManager: React.FC = () => {
  const [banners, setBanners] = useState<CmsHeroBanner[]>([]);
  const [collections, setCollections] = useState<CmsCuratedCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBannerModal, setShowCreateBannerModal] = useState(false);

  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
    targetScreen: 'HOME_EXPLORE',
    cityScope: 'all',
  });

  const fetchCmsData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<{ success: boolean; banners: CmsHeroBanner[]; collections: CmsCuratedCollection[] }>('/api/admin/cms/banners');
      if (res.success) {
        setBanners(res.banners);
        setCollections(res.collections);
      }
    } catch (err: any) {
      console.error('Failed to load CMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminApi.post<{ success: boolean; banner: CmsHeroBanner }>('/api/admin/cms/banners/create', newBanner);
      if (res.success) {
        setBanners((prev) => [res.banner, ...prev]);
        setShowCreateBannerModal(false);
        setNewBanner({
          title: '',
          subtitle: '',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
          targetScreen: 'HOME_EXPLORE',
          cityScope: 'all',
        });
      }
    } catch (err: any) {
      alert(`Failed to publish banner: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Layout className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Content & CMS Management</h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Configure homepage hero banners, promotional grid tiles, city-specific banners, and curated product collections.
          </p>
        </div>
        <button
          onClick={() => setShowCreateBannerModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Customer Banner
        </button>
      </div>

      {/* Active Banners Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-sky-400" /> Homepage Hero Carousel Banners ({banners.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div key={b.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col justify-between">
              <div className="relative h-44 bg-slate-950 overflow-hidden">
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="px-2 py-0.5 bg-sky-500/20 border border-sky-500/40 text-sky-300 font-bold text-[10px] rounded uppercase tracking-wider">
                    {b.targetScreen}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1 leading-snug">{b.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{b.subtitle}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Territory: <strong className="text-slate-200 capitalize">{b.cityScope}</strong>
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Active in Customer App
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Product Collections Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" /> Curated Product Collections ({collections.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {collections.map((col) => (
            <div key={col.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Slug: /{col.slug}</span>
                <h4 className="text-base font-bold text-white mt-0.5">{col.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{col.productIds.length} Products Curated in Collection</p>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-semibold">
                Live Grid
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showCreateBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 text-xs">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-sky-400" /> Publish Customer App Banner
            </h3>
            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Banner Headline</label>
                <input
                  type="text"
                  required
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  placeholder="Emergency Electrical Parts Delivered in 15 Mins"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Subtitle / Promo Text</label>
                <input
                  type="text"
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                  placeholder="Get 100% Genuine GST ITC Invoices with Havells & Schneider"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Banner Image URL</label>
                <input
                  type="text"
                  required
                  value={newBanner.imageUrl}
                  onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Target Screen</label>
                  <select
                    value={newBanner.targetScreen}
                    onChange={(e) => setNewBanner({ ...newBanner, targetScreen: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="HOME_EXPLORE">Homepage Main Hero</option>
                    <option value="CATEGORY_ELECTRICAL">Electrical Category Top</option>
                    <option value="CATEGORY_PLUMBING">Plumbing Category Top</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">City Scope</label>
                  <select
                    value={newBanner.cityScope}
                    onChange={(e) => setNewBanner({ ...newBanner, cityScope: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="all">Pan-India (All Cities)</option>
                    <option value="bengaluru">Bengaluru Hubs</option>
                    <option value="mumbai">Mumbai & MMR Hubs</option>
                    <option value="delhi_ncr">Delhi NCR Hubs</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateBannerModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 text-slate-950 rounded-xl font-semibold hover:bg-sky-400 shadow-lg shadow-sky-500/20"
                >
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
