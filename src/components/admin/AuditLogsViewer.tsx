import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Filter,
  User,
  Clock,
  Key,
  Download
} from 'lucide-react';
import { AdminAuditLog, AdminPermission } from '../../types/admin';
import { adminApi } from '../../utils/adminApiClient';
import { exportToCsv } from '../../utils/exportToSheet';

interface AuditLogsViewerProps {
  userPermissions: AdminPermission[];
}

export const AuditLogsViewer: React.FC<AuditLogsViewerProps> = ({ userPermissions }) => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res: any = await adminApi.get('/api/admin/audit-logs');
      if (res.success) setLogs(res.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.adminId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.adminRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.targetEntity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportAuditLogs = () => {
    exportToCsv<AdminAuditLog>('qcom_security_audit_trail_sheet', [
      { header: 'Log ID', accessor: (l) => l.id },
      { header: 'Timestamp', accessor: (l) => l.timestamp },
      { header: 'Admin ID', accessor: (l) => l.adminId },
      { header: 'Admin Role', accessor: (l) => l.adminRole },
      { header: 'Action Taken', accessor: (l) => l.action },
      { header: 'Target Entity', accessor: (l) => l.targetEntity },
      { header: 'Entity ID', accessor: (l) => l.targetId || 'N/A' },
      { header: 'Details / Reason', accessor: (l) => typeof l.details === 'string' ? l.details : JSON.stringify(l.details || {}) },
      { header: 'IP Address', accessor: (l) => l.ipAddress || '127.0.0.1' },
    ], logs);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            System Security & Action Audit Trail
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
              Immutable Ledger
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped log of all admin state mutations, status overrides, and financial disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAuditLogs}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Audit Sheet</span>
          </button>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search action type (ORDER_ASSIGN, REFUND_APPROVE), admin ID, or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200 font-bold">
            <tr>
              <th className="p-4">Timestamp & IP</th>
              <th className="p-4">Admin Actor</th>
              <th className="p-4">Action Code</th>
              <th className="p-4">Target Entity</th>
              <th className="p-4">Payload Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="text-slate-900 font-semibold">{log.timestamp}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{log.ipAddress}</div>
                </td>

                <td className="p-4">
                  <div className="text-emerald-700 font-bold">{log.adminId}</div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold border border-slate-200 uppercase">
                    {log.adminRole}
                  </span>
                </td>

                <td className="p-4">
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold">
                    {log.action}
                  </span>
                </td>

                <td className="p-4 text-slate-900 font-bold">{log.targetEntity}</td>

                <td className="p-4 text-[11px] text-slate-600 font-mono max-w-xs truncate">
                  {JSON.stringify(log.details)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
