import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileSpreadsheet,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  Download
} from 'lucide-react';
import { AdminCustomer, AdminPermission } from '../../types/admin';
import { adminApi } from '../../utils/adminApiClient';
import { exportToCsv } from '../../utils/exportToSheet';

interface CustomerManagementProps {
  userPermissions: AdminPermission[];
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({ userPermissions }) => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);

  const canViewSensitive = userPermissions.includes('customers.view_sensitive');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res: any = await adminApi.get('/api/admin/customers');
      if (res.success) setCustomers(res.customers);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleExportCustomers = () => {
    exportToCsv<AdminCustomer>('qcom_customers_directory_sheet', [
      { header: 'Customer ID', accessor: (c) => c.id },
      { header: 'Name', accessor: (c) => c.name },
      { header: 'Phone', accessor: (c) => c.phone },
      { header: 'Email', accessor: (c) => c.email || 'N/A' },
      { header: 'Trade Role', accessor: (c) => c.accountType },
      { header: 'Company Name', accessor: (c) => c.companyName || 'Individual' },
      { header: 'GSTIN', accessor: (c) => c.savedGstins?.[0]?.gstin || 'Unregistered' },
      { header: 'Primary City', accessor: (c) => c.addresses?.[0]?.areaName || 'Bengaluru' },
      { header: 'Status', accessor: (c) => c.status },
      { header: 'Total Orders', accessor: (c) => c.totalOrders },
      { header: 'Total LTV Spend (INR)', accessor: (c) => c.totalSpend },
      { header: 'Joined At', accessor: (c) => c.createdAt },
    ], customers);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Contractor & Customer Intelligence Directory
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
              {customers.length} Verified Tradespeople
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profiles, trade classification (Contractor, Electrician, Plumber), saved GSTINs, and lifetime volume.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCustomers}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Customers Sheet</span>
          </button>
          <button
            onClick={fetchCustomers}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh Directory</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contractor name, phone number, GSTIN or firm name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCustomer(c)}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 hover:border-emerald-500 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                  {c.companyName && (
                    <p className="text-xs text-sky-700 font-semibold mt-0.5 truncate max-w-[200px]">
                      {c.companyName}
                    </p>
                  )}
                  <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded uppercase font-mono mt-1 inline-block font-medium">
                    {c.accountType}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-slate-900 font-medium">{canViewSensitive ? c.phone : `${c.phone.substring(0, 7)}****`}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Lifetime Spend:</span>
                  <span className="text-emerald-700 font-bold">₹{c.totalSpend.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Completed Orders:</span>
                  <span className="text-slate-900 font-medium">{c.totalOrders} Orders</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Saved GSTINs: {c.savedGstins.length}</span>
              <span className="text-emerald-700 font-semibold">Inspect Profile →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Customer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedCustomer.name}</h3>
                <p className="text-xs text-sky-700 font-medium">{selectedCustomer.companyName || 'Independent Contractor'}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-700 hover:text-slate-900 text-xs font-semibold px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-500 block mb-0.5">Contact:</span>
                  <span className="text-slate-900 font-medium">{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Email:</span>
                  <span className="text-slate-900 font-medium">{selectedCustomer.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Customer Since:</span>
                  <span className="text-slate-900 font-medium">{selectedCustomer.createdAt}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Last Active:</span>
                  <span className="text-emerald-700 font-semibold">{selectedCustomer.lastActive}</span>
                </div>
              </div>

              {/* Saved GSTINs */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block uppercase text-[11px] tracking-wider">
                  Verified Business GSTINs
                </span>
                {selectedCustomer.savedGstins.map((g, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center font-mono">
                    <div>
                      <span className="font-bold text-emerald-700">{g.gstin}</span>
                      <p className="text-[11px] text-slate-700 mt-0.5">{g.legalName}</p>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">{g.state}</span>
                  </div>
                ))}
              </div>

              {/* Jobsite Locations */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block uppercase text-[11px] tracking-wider">
                  Frequent Jobsite Addresses
                </span>
                {selectedCustomer.addresses.map((a, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900">{a.label}</span>
                    <p className="text-[11px] text-slate-700 mt-0.5">{a.address}</p>
                    <span className="text-[10px] font-mono text-sky-800 bg-sky-100 border border-sky-200 px-1.5 py-0.5 rounded mt-1 inline-block font-medium">
                      {a.areaName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
