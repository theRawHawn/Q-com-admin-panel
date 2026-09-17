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
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  userPermissions,
  selectedCity = 'all',
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
}) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Catalog & Inventory
          </h1>
        </div>

        <button
          onClick={fetchInventory}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200/80 transition-colors shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
          <span>Sync Stock</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU name, brand (Havells, Astral, Bosch), HSN code..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-slate-50/75 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'Electrical', 'Plumbing', 'Fasteners', 'Tools'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white font-medium shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[820px]">
            <thead className="bg-slate-50/75 text-slate-500 text-[11px] font-medium border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3">Product Details</th>
                <th className="px-4 py-3">Category & Hub</th>
                <th className="px-4 py-3 text-right">Price / MRP</th>
                <th className="px-4 py-3 text-center">HSN & GST</th>
                <th className="px-4 py-3 text-center">Current Stock</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {filteredProducts.map((p) => {
                const isLowStock = p.stockCount <= p.minStockAlert;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                      <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Brand: <span className="text-slate-900 font-bold">{p.brand}</span></div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {p.category}
                      </span>
                      <div className="text-[11px] font-semibold text-emerald-800 mt-1">{p.sellerName}</div>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-sm">₹{p.price.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-500 font-medium line-through">MRP ₹{p.mrp.toLocaleString('en-IN')}</div>
                    </td>

                    <td className="px-4 py-3.5 text-center text-[11px] whitespace-nowrap">
                      <div className="text-slate-900 font-semibold">HSN {p.hsnCode}</div>
                      <div className="text-slate-600 font-medium text-[10px]">{p.gstRatePercent}% GST</div>
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className={`text-sm font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                        {p.stockCount} <span className="text-[10px] font-semibold text-slate-600">{p.unit}s</span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium">Min Buffer: {p.minStockAlert}</div>
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/60 px-2 py-0.5 rounded text-[11px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded text-[11px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Healthy
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap pr-4">
                      <button
                        onClick={() => {
                          setSelectedProductForRestock(p);
                          setNewStockQty(p.stockCount);
                          setRestockReason('');
                        }}
                        disabled={!canEditStock}
                        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 px-2.5 py-1 rounded text-xs font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="h-3 w-3 text-slate-400" />
                        <span>Adjust</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-xl w-full max-w-md p-5 shadow-lg space-y-3.5">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Adjust Stock Count</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update verified count for <strong className="text-slate-800 font-medium">{selectedProductForRestock.name}</strong>.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">New Unit Count</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewStockQty(Math.max(0, newStockQty - 10))}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg font-medium border border-slate-200/80 transition-colors"
                  >
                    -10
                  </button>
                  <input
                    type="number"
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(Number(e.target.value))}
                    className="flex-1 bg-slate-50/75 border border-slate-200/80 rounded-lg py-1.5 px-3 text-center text-slate-900 font-mono text-sm font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <button
                    onClick={() => setNewStockQty(newStockQty + 10)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg font-medium border border-slate-200/80 transition-colors"
                  >
                    +10
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Audit Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Physical cycle count at store..."
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full bg-slate-50/75 border border-slate-200/80 rounded-lg px-3 py-1.5 text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedProductForRestock(null)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs shadow-xs transition-colors"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
