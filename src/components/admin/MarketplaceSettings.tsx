import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Bell,
  Database,
  Lock,
  Key,
  CheckCircle2,
  AlertTriangle,
  Save,
  Server
} from 'lucide-react';
import { AdminPermission } from '../../types/admin';

interface MarketplaceSettingsProps {
  userPermissions: AdminPermission[];
}

export const MarketplaceSettings: React.FC<MarketplaceSettingsProps> = ({ userPermissions }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [smsGatewayActive, setSmsGatewayActive] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const canManageSettings = userPermissions.includes('settings.manage');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Marketplace Infrastructure & System Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage global emergency kill switches, notification channels, API gateway secrets, and database sync.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>Marketplace infrastructure configuration saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emergency Kill Switches */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            Operational Kill Switches & Safety Limits
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Emergency Maintenance Mode</span>
                <span className="text-slate-500 text-[11px]">Pauses incoming customer checkout while in progress</span>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                disabled={!canManageSettings}
                className={`px-3 py-1.5 rounded-xl font-mono font-bold transition-all ${
                  maintenanceMode
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {maintenanceMode ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Default Jobsite Delivery Buffer SLA</span>
              <div className="flex items-center gap-2 font-mono">
                <input
                  type="number"
                  defaultValue={15}
                  disabled={!canManageSettings}
                  className="w-20 bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                />
                <span className="text-slate-600">minutes from placement to contractor handover</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Gateways */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-sky-600" />
            Communication & Dispatch Gateways
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">SMS OTP Gateway (DLT Compliant)</span>
                <span className="text-slate-500 text-[11px]">Delivery handover OTPs & contractor sign-in</span>
              </div>
              <button
                onClick={() => setSmsGatewayActive(!smsGatewayActive)}
                disabled={!canManageSettings}
                className={`px-3 py-1.5 rounded-xl font-mono font-bold transition-all ${
                  smsGatewayActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {smsGatewayActive ? 'ONLINE' : 'OFFLINE'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">WhatsApp Business API Webhooks</span>
                <span className="text-slate-500 text-[11px]">Real-time map tracking links sent to electricians</span>
              </div>
              <button
                onClick={() => setWhatsappAlerts(!whatsappAlerts)}
                disabled={!canManageSettings}
                className={`px-3 py-1.5 rounded-xl font-mono font-bold transition-all ${
                  whatsappAlerts
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {whatsappAlerts ? 'ONLINE' : 'OFFLINE'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {canManageSettings && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>Save System Parameters</span>
          </button>
        </div>
      )}
    </div>
  );
};
