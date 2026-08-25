import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
  Minus,
  Edit2,
  Filter,
  Tag,
  Store
} from 'lucide-react';
import { AdminProduct, AdminPermission } from '../../types/admin';
import { adminApi } from '../../utils/adminApiClient';

interface InventoryManagementProps {
  userPermissions: AdminPermission[];
  selectedCity?: string;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({ userPermissions, selectedCity = 'all' }) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedProductForRestock, setSelectedProductForRestock] = useState<AdminProduct | null>(null);
  const [newStockQty, setNewStockQty] = useState<number>(0);
  const [restockReason, setRestockReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEditStock = userPermissions.includes('inventory.edit_stock');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const url = selectedCity && selectedCity !== 'all'
        ? `/api/admin/inventory?city=${selectedCity}`
        : '/api/admin/inventory';
      const res: any = await adminApi.get(url);
      if (res.success) setProducts(res.products);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCity]);

  const handleAdjustStock = async () => {
    if (!selectedProductForRestock) return;
    try {
      setIsSubmitting(true);
      await adminApi.post(`/api/admin/inventory/${selectedProductForRestock.id}/adjust-stock`, {
        newStockCount: newStockQty,
        reason: restockReason,
      });
      setSelectedProductForRestock(null);
      fetchInventory();
    } catch (err: any) {
      alert(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hsnCode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Catalog & Inventory Control
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
              {products.length} Master SKUs
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor partner store inventory buffers, restock triggers, HSN compliance, and pricing.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Sync Stock Counts</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU name, brand (Havells, Astral, Bosch), HSN code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold uppercase text-[11px] mr-2">Category:</span>
          {['ALL', 'Electrical', 'Plumbing', 'Fasteners', 'Tools'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-all uppercase font-medium ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200 font-bold">
              <tr>
                <th className="p-4">Product Details</th>
                <th className="p-4">Category / Hub</th>
                <th className="p-4 text-right">Price / MRP</th>
                <th className="p-4 text-center">HSN & GST</th>
                <th className="p-4 text-center">Current Stock</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {filteredProducts.map((p) => {
                const isLowStock = p.stockCount <= p.minStockAlert;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">Brand: {p.brand}</div>
                    </td>

                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold">
                        {p.category}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">{p.sellerName}</div>
                    </td>

                    <td className="p-4 text-right font-mono">
                      <div className="font-bold text-emerald-700 text-sm">₹{p.price}</div>
                      <div className="text-[10px] text-slate-400 line-through">MRP ₹{p.mrp}</div>
                    </td>

                    <td className="p-4 text-center font-mono text-[11px]">
                      <div className="text-slate-900 font-semibold">HSN {p.hsnCode}</div>
                      <div className="text-slate-500">{p.gstRatePercent}% GST</div>
                    </td>

                    <td className="p-4 text-center font-mono">
                      <div className={`text-base font-black ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                        {p.stockCount} <span className="text-[10px] font-normal text-slate-500">{p.unit}s</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Min Buffer: {p.minStockAlert}</div>
                    </td>

                    <td className="p-4 text-center">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                          <AlertTriangle className="h-3 w-3" />
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                          <CheckCircle2 className="h-3 w-3" />
                          HEALTHY
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedProductForRestock(p);
                          setNewStockQty(p.stockCount);
                          setRestockReason('');
                        }}
                        disabled={!canEditStock}
                        className="bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs border border-slate-300 flex items-center gap-1.5 mx-auto transition-colors shadow-2xs"
                      >
                        <Edit2 className="h-3 w-3 text-emerald-600" />
                        <span>Adjust Stock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedProductForRestock && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Adjust Physical Stock Count</h3>
            <p className="text-xs text-slate-500">
              Update inventory for <strong className="text-slate-900">{selectedProductForRestock.name}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">New Verified Unit Count</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewStockQty(Math.max(0, newStockQty - 10))}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold border border-slate-200"
                  >
                    -10
                  </button>
                  <input
                    type="number"
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(Number(e.target.value))}
                    className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-center text-slate-900 font-mono text-base font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => setNewStockQty(newStockQty + 10)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold border border-slate-200"
                  >
                    +10
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Audit Trail Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Physical inventory cycle count verified at partner store..."
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedProductForRestock(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
              >
                Update Stock Buffer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
