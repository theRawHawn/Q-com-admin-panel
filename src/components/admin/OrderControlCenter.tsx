import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  AlertTriangle,
  Bike,
  RefreshCw
} from 'lucide-react';
import { AdminOrder, AdminRider, AdminPermission } from '../../types/admin';
import { adminApi } from '../../utils/adminApiClient';
import { OrderDetailModal } from './OrderDetailModal';

interface OrderControlCenterProps {
  userPermissions: AdminPermission[];
  selectedCity?: string;
}

export const OrderControlCenter: React.FC<OrderControlCenterProps> = ({ userPermissions, selectedCity = 'all' }) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [riders, setRiders] = useState<AdminRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const canEditStatus = userPermissions.includes('orders.edit_status');
  const canCancel = userPermissions.includes('orders.cancel');
  const canAssignRider = userPermissions.includes('orders.assign_rider');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (paymentFilter !== 'ALL') params.append('paymentStatus', paymentFilter);
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);

      const [ordersRes, ridersRes]: [any, any] = await Promise.all([
        adminApi.get(`/api/admin/orders?${params.toString()}`),
        adminApi.get(`/api/admin/riders${selectedCity && selectedCity !== 'all' ? `?city=${selectedCity}` : ''}`),
      ]);

      if (ordersRes.success) setOrders(ordersRes.orders);
      if (ridersRes.success) setRiders(ridersRes.riders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, selectedCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'placed':
        return <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded text-[10px] font-medium uppercase">Placed</span>;
      case 'picking':
        return <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[10px] font-medium uppercase">Picking</span>;
      case 'packed':
        return <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-medium uppercase">Ready</span>;
      case 'out_for_delivery':
        return <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-medium uppercase">On Way</span>;
      case 'arriving':
        return <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-medium uppercase">Arriving</span>;
      case 'delivered':
        return <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-medium uppercase">Delivered</span>;
      case 'cancelled':
        return <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-medium uppercase">Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium uppercase">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Orders
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-normal">
              {orders.length}
            </span>
          </h1>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer, phone, or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'placed', 'picking', 'packed', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto text-emerald-600 mb-1.5" />
                    <span>Loading orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{ord.orderNumber}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{ord.placedAt}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{ord.customer.name}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {ord.jobSite?.areaName || 'Standard Location'}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{ord.seller.name}</div>
                      <div className="text-[10px] text-slate-400">{ord.seller.hubType}</div>
                    </td>

                    <td className="px-4 py-3">
                      {ord.rider ? (
                        <div className="flex items-center gap-1.5">
                          <Bike className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium text-slate-800">{ord.rider.name}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div>{getStatusBadge(ord.status)}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        OTP: <span className="font-medium text-slate-700">{ord.deliveryOtp}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold text-slate-900">₹{ord.pricing.total}</div>
                      <div className="text-[10px] text-emerald-600">ITC: ₹{ord.pricing.itcAmount}</div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="h-3 w-3 text-slate-500" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onRefresh={() => {
            fetchOrders();
            const updated = orders.find((o) => o.id === selectedOrder.id);
            if (updated) setSelectedOrder(updated);
          }}
          availableRiders={riders.filter((r) => r.status === 'ONLINE')}
          canEditStatus={canEditStatus}
          canCancel={canCancel}
          canAssignRider={canAssignRider}
        />
      )}
    </div>
  );
};
