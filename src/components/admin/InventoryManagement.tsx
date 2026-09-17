import React, { useState, useEffect, useMemo } from 'react';
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
  Store,
  MapPin,
  Building2,
  ExternalLink,
  ChevronRight,
  X,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  ArrowUpDown,
  Download,
  Info,
  Layers,
  Phone
} from 'lucide-react';
import { AdminProduct, ProductSellerStock, AdminPermission } from '../../types/admin';
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
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modal states
  const [selectedSkuForSellers, setSelectedSkuForSellers] = useState<AdminProduct | null>(null);
  const [sellerModalCityFilter, setSellerModalCityFilter] = useState<string>('ALL');
  const [sellerModalSearch, setSellerModalSearch] = useState<string>('');
  const [sellerModalStatusFilter, setSellerModalStatusFilter] = useState<string>('ALL');

  // Adjust stock states
  const [adjustingSeller, setAdjustingSeller] = useState<{ product: AdminProduct; seller: ProductSellerStock } | null>(null);
  const [adjustingProductGeneral, setAdjustingProductGeneral] = useState<AdminProduct | null>(null);
  const [newStockQty, setNewStockQty] = useState<number>(0);
  const [restockReason, setRestockReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const canEditStock = userPermissions.includes('inventory.edit_stock');

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

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const url = selectedCity && selectedCity !== 'all'
        ? `/api/admin/inventory?city=${selectedCity}`
        : '/api/admin/inventory';
      const res: any = await adminApi.get(url);
      if (res.success && Array.isArray(res.products)) {
        setProducts(res.products);
        // If modal is open, refresh the selected product in view as well
        if (selectedSkuForSellers) {
          const updatedSelected = res.products.find((p: AdminProduct) => p.id === selectedSkuForSellers.id || p.sku === selectedSkuForSellers.sku);
          if (updatedSelected) {
            setSelectedSkuForSellers(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCity]);

  // Handle single seller stock adjustment
  const handleAdjustSellerStock = async () => {
    if (!adjustingSeller) return;
    try {
      setIsSubmitting(true);
      const res: any = await adminApi.post(`/api/admin/inventory/${adjustingSeller.product.id}/adjust-seller-stock`, {
        sellerId: adjustingSeller.seller.sellerId,
        newStockCount: newStockQty,
        reason: restockReason || 'Physical store inventory cycle count',
      });
      if (res.success) {
        showToast(`Stock updated to ${newStockQty} units for ${adjustingSeller.seller.sellerName}`);
        setAdjustingSeller(null);
        setRestockReason('');
        await fetchInventory();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to adjust seller stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle general product stock adjustment
  const handleAdjustGeneralStock = async () => {
    if (!adjustingProductGeneral) return;
    try {
      setIsSubmitting(true);
      const res: any = await adminApi.post(`/api/admin/inventory/${adjustingProductGeneral.id}/adjust-stock`, {
        newStockCount: newStockQty,
        reason: restockReason || 'Catalog stock audit',
      });
      if (res.success) {
        showToast(`Overall stock updated to ${newStockQty} units for ${adjustingProductGeneral.sku}`);
        setAdjustingProductGeneral(null);
        setRestockReason('');
        await fetchInventory();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Categories list
  const categories = [
    'ALL',
    'Electrical & Switchgear',
    'Cables & Wiring',
    'Fasteners & Rigging',
    'Power Tools',
    'Plumbing & Drainage',
    'Industrial Bearings',
    'Safety & Industrial PPE',
    'Construction Chemicals',
  ];

  // Filtered Products for Master SKU Table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;

      // Status filter
      let matchesStatus = true;
      const totalStock = p.stockCount;
      const minAlert = p.minStockAlert || 20;
      if (statusFilter === 'OUT_OF_STOCK') {
        matchesStatus = totalStock === 0;
      } else if (statusFilter === 'LOW_STOCK') {
        matchesStatus = totalStock > 0 && totalStock <= minAlert;
      } else if (statusFilter === 'IN_STOCK') {
        matchesStatus = totalStock > minAlert;
      }

      // Search Query filter (matches SKU, Name, Brand, HSN, or Seller Name)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.hsnCode.includes(q) ||
        (p.sellers && p.sellers.some((s) => s.sellerName.toLowerCase().includes(q) || s.areaName.toLowerCase().includes(q)));

      return matchesCat && matchesStatus && matchesSearch;
    });
  }, [products, categoryFilter, statusFilter, searchQuery]);

  // Filtered sellers in the SKU Breakdown Modal
  const modalFilteredSellers = useMemo(() => {
    if (!selectedSkuForSellers || !selectedSkuForSellers.sellers) return [];
    return selectedSkuForSellers.sellers.filter((s) => {
      const matchesCity =
        sellerModalCityFilter === 'ALL' ||
        s.cityId.toLowerCase() === sellerModalCityFilter.toLowerCase() ||
        s.cityName.toLowerCase() === sellerModalCityFilter.toLowerCase();

      const q = sellerModalSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.sellerName.toLowerCase().includes(q) ||
        s.areaName.toLowerCase().includes(q) ||
        s.cityName.toLowerCase().includes(q) ||
        (s.sellerContact && s.sellerContact.includes(q));

      let matchesStatus = true;
      if (sellerModalStatusFilter === 'ONLINE') {
        matchesStatus = s.isStoreOnline;
      } else if (sellerModalStatusFilter === 'OFFLINE') {
        matchesStatus = !s.isStoreOnline;
      } else if (sellerModalStatusFilter === 'OUT_OF_STOCK') {
        matchesStatus = s.stockCount === 0;
      } else if (sellerModalStatusFilter === 'LOW_STOCK') {
        matchesStatus = s.stockCount > 0 && s.stockCount <= s.minStockAlert;
      } else if (sellerModalStatusFilter === 'IN_STOCK') {
        matchesStatus = s.stockCount > s.minStockAlert;
      }

      return matchesCity && matchesSearch && matchesStatus;
    });
  }, [selectedSkuForSellers, sellerModalCityFilter, sellerModalSearch, sellerModalStatusFilter]);

  // Aggregate stats across filtered sellers in modal
  const modalStats = useMemo(() => {
    const sellers = modalFilteredSellers;
    const totalUnits = sellers.reduce((sum, s) => sum + s.stockCount, 0);
    const onlineCount = sellers.filter((s) => s.isStoreOnline).length;
    const lowStockCount = sellers.filter((s) => s.stockCount <= s.minStockAlert).length;
    return {
      totalUnits,
      sellerCount: sellers.length,
      onlineCount,
      lowStockCount,
    };
  }, [modalFilteredSellers]);

  // Export inventory to CSV
  const handleExportCsv = () => {
    const headers = ['SKU Code', 'Product Name', 'Brand', 'Category', 'HSN Code', 'GST %', 'Price (INR)', 'MRP (INR)', 'Overall Stock', 'Unit', 'Min Buffer', 'Status', 'Sellers Count'];
    const rows = filteredProducts.map((p) => {
      const statusLabel = p.stockCount === 0 ? 'Out of Stock' : p.stockCount <= p.minStockAlert ? 'Low Stock' : 'In Stock';
      return [
        `"${p.sku || p.id}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.brand}"`,
        `"${p.category}"`,
        `"${p.hsnCode}"`,
        `"${p.gstRatePercent}%"`,
        p.price,
        p.mrp,
        p.stockCount,
        p.unit,
        p.minStockAlert,
        `"${statusLabel}"`,
        p.sellers ? p.sellers.length : (p.sellerCount || 1),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QCOM_Inventory_SKUs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 font-sans text-slate-800">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>SKU Inventory & Multi-Seller Stock</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central catalog showing overall stock aggregated across all trade sellers with real-time availability status.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200/80 transition-colors shadow-xs"
            title="Export CSV of current filtered catalog"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchInventory}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200/80 transition-colors shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
            <span>Sync Stock</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU Code (SKU-ELE-3201), Product Name, Brand (Havells, Astral, Hilti), HSN Code or Seller..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-slate-50/75 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Stock Availability Filter Pills */}
          <div className="flex items-center gap-1 self-start md:self-auto shrink-0 text-xs">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Status:</span>
            {[
              { key: 'ALL', label: 'All Stock' },
              { key: 'IN_STOCK', label: 'In Stock (Healthy)' },
              { key: 'LOW_STOCK', label: 'Low Stock' },
              { key: 'OUT_OF_STOCK', label: 'Out of Stock' },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  statusFilter === st.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Categories:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] transition-colors ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white font-medium shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              {cat === 'ALL' ? 'All Verticals' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table: SKU -> Product Details -> HSN&GST -> SKU Price/MRP -> Overall Stock -> Status -> Action */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-slate-50/75 text-slate-500 text-[11px] font-medium border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 w-[150px]">SKU</th>
                <th className="px-4 py-3 min-w-[220px]">Product Details</th>
                <th className="px-4 py-3 text-center w-[140px]">HSN & GST</th>
                <th className="px-4 py-3 text-right w-[140px]">SKU Price / MRP</th>
                <th className="px-4 py-3 text-center w-[180px]">Overall Current Stock</th>
                <th className="px-4 py-3 text-center w-[120px]">Status</th>
                <th className="px-4 py-3 text-right pr-4 w-[130px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-600 mx-auto mb-2" />
                    <span>Loading SKU inventory & seller allocations...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Package className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">No SKUs match the current filters</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try clearing the search query or category filters</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const totalStock = p.stockCount;
                  const minBuffer = p.minStockAlert || 20;
                  const isOutOfStock = totalStock === 0;
                  const isLowStock = totalStock > 0 && totalStock <= minBuffer;
                  const isHealthy = totalStock > minBuffer;
                  const sellersCount = p.sellers ? p.sellers.length : (p.sellerCount || 1);
                  const discountPct = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

                  return (
                    <tr
                      key={p.id || p.sku}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedSkuForSellers(p);
                        setSellerModalCityFilter('ALL');
                        setSellerModalSearch('');
                        setSellerModalStatusFilter('ALL');
                      }}
                    >
                      {/* 1. SKU Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 group-hover:bg-emerald-50 text-slate-900 group-hover:text-emerald-800 border border-slate-200 group-hover:border-emerald-200 px-2 py-1 rounded-md font-mono text-[11px] font-bold tracking-tight transition-colors shadow-2xs">
                          <Package className="h-3 w-3 text-slate-500 group-hover:text-emerald-600 shrink-0" />
                          <span>{p.sku || p.id}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Store className="h-2.5 w-2.5 text-slate-400" />
                          <span>{sellersCount} {sellersCount === 1 ? 'Seller' : 'Sellers'} stocking</span>
                        </div>
                      </td>

                      {/* 2. Product Details */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-xs group-hover:text-emerald-950 transition-colors">
                          {p.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100/90 px-1.5 py-0.5 rounded text-[10px]">
                            Brand: <strong className="text-slate-900">{p.brand}</strong>
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            • {p.category} {p.subcategory ? `› ${p.subcategory}` : ''}
                          </span>
                        </div>
                      </td>

                      {/* 3. HSN & GST */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-[11px]">
                          HSN {p.hsnCode}
                        </div>
                        <div className="inline-block mt-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                          {p.gstRatePercent}% GST
                        </div>
                      </td>

                      {/* 4. SKU Price / MRP */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-sm">
                          ₹{p.price.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center justify-end gap-1">
                          <span className="line-through">MRP ₹{p.mrp.toLocaleString('en-IN')}</span>
                          {discountPct > 0 && (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded text-[9px]">
                              {discountPct}% OFF
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Overall Current Stock (Sum of all sellers) */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className={`text-sm font-bold ${
                          isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-900'
                        }`}>
                          {totalStock.toLocaleString('en-IN')} <span className="text-[10px] font-semibold text-slate-600">{p.unit}s</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Across {sellersCount} Sellers • Min Buffer: {minBuffer}
                        </div>
                      </td>

                      {/* 6. Status (Auto updated based on stock availability) */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* 7. Action */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedSkuForSellers(p);
                              setSellerModalCityFilter('ALL');
                              setSellerModalSearch('');
                              setSellerModalStatusFilter('ALL');
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-2xs"
                            title="View all sellers stocking this SKU"
                          >
                            <Store className="h-3 w-3 text-emerald-700" />
                            <span>Sellers ({sellersCount})</span>
                          </button>

                          <button
                            onClick={() => {
                              setAdjustingProductGeneral(p);
                              setNewStockQty(p.stockCount);
                              setRestockReason('');
                            }}
                            disabled={!canEditStock}
                            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 transition-colors"
                            title="Adjust total stock audit count"
                          >
                            <Edit2 className="h-3 w-3 text-slate-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SKU SELLER DISTRIBUTION & STOCK BREAKDOWN MODAL */}
      {selectedSkuForSellers && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {selectedSkuForSellers.sku || selectedSkuForSellers.id}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                    {selectedSkuForSellers.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    HSN {selectedSkuForSellers.hsnCode} ({selectedSkuForSellers.gstRatePercent}% GST)
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {selectedSkuForSellers.name}
                </h2>
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <span>Brand: <strong className="text-slate-900">{selectedSkuForSellers.brand}</strong></span>
                  <span>•</span>
                  <span>Catalog Price: <strong className="text-slate-900">₹{selectedSkuForSellers.price.toLocaleString('en-IN')}</strong> (MRP ₹{selectedSkuForSellers.mrp.toLocaleString('en-IN')})</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSkuForSellers(null)}
                className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-1.5 rounded-lg border border-slate-200 transition-colors shadow-2xs shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Quick Filter & Search Bar */}
            <div className="p-4 bg-white border-b border-slate-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* City Filter */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Filter By City</label>
                  <select
                    value={sellerModalCityFilter}
                    onChange={(e) => setSellerModalCityFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="ALL">All Operating Cities</option>
                    <option value="bengaluru">Bengaluru (KA)</option>
                    <option value="mumbai">Mumbai MMR (MH)</option>
                    <option value="delhi">Delhi NCR (DL/HR)</option>
                    <option value="hyderabad">Hyderabad (TS)</option>
                    <option value="chennai">Chennai (TN)</option>
                    <option value="pune">Pune (MH)</option>
                    <option value="kolkata">Kolkata (WB)</option>
                  </select>
                </div>

                {/* Area / Store Search */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Search Seller / Area</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search store name, locality, hub..."
                      value={sellerModalSearch}
                      onChange={(e) => setSellerModalSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* Store Status Filter */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Store / Stock State</label>
                  <select
                    value={sellerModalStatusFilter}
                    onChange={(e) => setSellerModalStatusFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="ALL">All Stores & Stock Levels</option>
                    <option value="ONLINE">Online Stores Only</option>
                    <option value="OFFLINE">Offline Stores Only</option>
                    <option value="IN_STOCK">In Stock (Healthy)</option>
                    <option value="LOW_STOCK">Low Stock (≤ Buffer)</option>
                    <option value="OUT_OF_STOCK">Out of Stock (0 Units)</option>
                  </select>
                </div>
              </div>

              {/* Aggregated Scope Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2 text-center">
                  <span className="text-[10px] text-slate-500 font-medium block">Total Units in Scope</span>
                  <span className="text-sm font-bold text-slate-900">
                    {modalStats.totalUnits} {selectedSkuForSellers.unit}s
                  </span>
                </div>
                <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2 text-center">
                  <span className="text-[10px] text-slate-500 font-medium block">Stocking Sellers</span>
                  <span className="text-sm font-bold text-slate-900">{modalStats.sellerCount} Stores</span>
                </div>
                <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2 text-center">
                  <span className="text-[10px] text-slate-500 font-medium block">Online Fulfillment</span>
                  <span className="text-sm font-bold text-emerald-700">{modalStats.onlineCount} Online</span>
                </div>
                <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2 text-center">
                  <span className="text-[10px] text-slate-500 font-medium block">Low Stock Stores</span>
                  <span className={`text-sm font-bold ${modalStats.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                    {modalStats.lowStockCount} Stores
                  </span>
                </div>
              </div>
            </div>

            {/* Sellers Breakdown Table */}
            <div className="overflow-y-auto flex-1 p-4">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Seller & Trade Partner</th>
                    <th className="px-3.5 py-2.5">City & Hub Area</th>
                    <th className="px-3.5 py-2.5 text-center">Store Status</th>
                    <th className="px-3.5 py-2.5 text-center">Available Stock</th>
                    <th className="px-3.5 py-2.5 text-right">Store Price / MRP</th>
                    <th className="px-3.5 py-2.5 text-center">Safety Buffer</th>
                    <th className="px-3.5 py-2.5 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {modalFilteredSellers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        <Store className="h-6 w-6 mx-auto mb-1 text-slate-300" />
                        <span>No sellers found matching the selected city/area filter</span>
                      </td>
                    </tr>
                  ) : (
                    modalFilteredSellers.map((s) => {
                      const isSellerOutOfStock = s.stockCount === 0;
                      const isSellerLowStock = s.stockCount > 0 && s.stockCount <= s.minStockAlert;
                      return (
                        <tr key={s.sellerId} className="hover:bg-slate-50/80 transition-colors">
                          {/* Seller Name & Contact */}
                          <td className="px-3.5 py-3">
                            <div className="font-bold text-slate-900 text-xs">{s.sellerName}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="h-2.5 w-2.5 text-slate-400" />
                              <span>{s.sellerContact || '+91 98450 12345'}</span>
                              {s.lastRestockedAt && (
                                <>
                                  <span>•</span>
                                  <span>Synced: {s.lastRestockedAt}</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* City & Area */}
                          <td className="px-3.5 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-[10px]">
                                {s.cityName}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                              <MapPin className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{s.areaName}</span>
                            </div>
                          </td>

                          {/* Store Online Status */}
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            {s.isStoreOnline ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Offline
                              </span>
                            )}
                          </td>

                          {/* Available Stock Units */}
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <div className={`text-xs font-bold ${
                              isSellerOutOfStock ? 'text-rose-600' : isSellerLowStock ? 'text-amber-600' : 'text-slate-900'
                            }`}>
                              {s.stockCount} <span className="text-[10px] font-semibold text-slate-600">{selectedSkuForSellers.unit}s</span>
                            </div>
                            <div className="text-[9px] font-medium mt-0.5">
                              {isSellerOutOfStock ? (
                                <span className="text-rose-600 font-semibold">Out of Stock</span>
                              ) : isSellerLowStock ? (
                                <span className="text-amber-600 font-semibold">Low Stock</span>
                              ) : (
                                <span className="text-emerald-700 font-semibold">In Stock</span>
                              )}
                            </div>
                          </td>

                          {/* Store Price / MRP */}
                          <td className="px-3.5 py-3 text-right whitespace-nowrap">
                            <div className="font-bold text-slate-900 text-xs">₹{s.price.toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-slate-500 line-through">MRP ₹{s.mrp.toLocaleString('en-IN')}</div>
                          </td>

                          {/* Safety Buffer */}
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {s.minStockAlert} units
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-3.5 py-3 text-right whitespace-nowrap pr-4">
                            <button
                              onClick={() => {
                                setAdjustingSeller({
                                  product: selectedSkuForSellers,
                                  seller: s,
                                });
                                setNewStockQty(s.stockCount);
                                setRestockReason('');
                              }}
                              disabled={!canEditStock}
                              className="text-emerald-800 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 px-2.5 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-emerald-200"
                            >
                              <Edit2 className="h-3 w-3 text-emerald-700" />
                              <span>Adjust Store Stock</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {modalFilteredSellers.length} sellers for SKU <strong>{selectedSkuForSellers.sku}</strong></span>
              <button
                onClick={() => setSelectedSkuForSellers(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition-colors shadow-2xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST SPECIFIC SELLER STOCK MODAL */}
      {adjustingSeller && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  {adjustingSeller.product.sku}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">Adjust Store Inventory</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update stock for <strong>{adjustingSeller.seller.sellerName}</strong> ({adjustingSeller.seller.cityName}).
                </p>
              </div>
              <button
                onClick={() => setAdjustingSeller(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Verified Unit Count ({adjustingSeller.product.unit}s)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewStockQty(Math.max(0, newStockQty - 10))}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold border border-slate-200"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => setNewStockQty(Math.max(0, newStockQty - 1))}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold border border-slate-200"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(Math.max(0, Number(e.target.value)))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-center text-slate-900 font-mono text-base font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <button
                    onClick={() => setNewStockQty(newStockQty + 1)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold border border-slate-200"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => setNewStockQty(newStockQty + 10)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold border border-slate-200"
                  >
                    +10
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>Current Store Stock: {adjustingSeller.seller.stockCount} units</span>
                  <span>Safety Buffer: {adjustingSeller.seller.minStockAlert} units</span>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Adjustment Reason / Audit Trail</label>
                <input
                  type="text"
                  placeholder="e.g. Physical cycle count audit, Inbound supplier delivery..."
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAdjustingSeller(null)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustSellerStock}
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Save & Update Store Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST GENERAL CATALOG STOCK MODAL */}
      {adjustingProductGeneral && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  {adjustingProductGeneral.sku}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">Adjust Overall Catalog Stock</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update central aggregate unit count for <strong>{adjustingProductGeneral.name}</strong>.
                </p>
              </div>
              <button
                onClick={() => setAdjustingProductGeneral(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Total Overall Units ({adjustingProductGeneral.unit}s)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewStockQty(Math.max(0, newStockQty - 10))}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold border border-slate-200"
                  >
                    -10
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(Math.max(0, Number(e.target.value)))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-center text-slate-900 font-mono text-base font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <button
                    onClick={() => setNewStockQty(newStockQty + 10)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold border border-slate-200"
                  >
                    +10
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Audit Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Catalog inventory reconciliation..."
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAdjustingProductGeneral(null)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustGeneralStock}
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Overall Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
