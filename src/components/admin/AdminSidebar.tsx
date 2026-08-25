import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Send,
  Store,
  Bike,
  Users,
  Package,
  CreditCard,
  RotateCcw,
  Receipt,
  Tag,
  MapPin,
  LifeBuoy,
  FileText,
  Settings,
  Lock
} from 'lucide-react';
import { AdminPermission, AdminRole } from '../../types/admin';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission: AdminPermission;
  badge?: number | string;
  badgeColor?: string;
  group: 'Operations' | 'Supply & Fleet' | 'Finance' | 'Settings';
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  // 1. Operations
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiredPermission: 'dashboard.view', group: 'Operations' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, requiredPermission: 'orders.view', badge: 5, badgeColor: 'bg-emerald-600', group: 'Operations' },
  { id: 'dispatch', label: 'Live Dispatch', icon: Send, requiredPermission: 'orders.assign_rider', badge: 7, badgeColor: 'bg-rose-500', group: 'Operations' },
  { id: 'support', label: 'Support Desk', icon: LifeBuoy, requiredPermission: 'support.view', badge: 2, badgeColor: 'bg-amber-500', group: 'Operations' },

  // 2. Supply & Fleet
  { id: 'sellers', label: 'Partner Stores', icon: Store, requiredPermission: 'sellers.view', group: 'Supply & Fleet' },
  { id: 'riders', label: 'Riders & Fleet', icon: Bike, requiredPermission: 'riders.view', group: 'Supply & Fleet' },
  { id: 'customers', label: 'Customers', icon: Users, requiredPermission: 'customers.view', group: 'Supply & Fleet' },
  { id: 'inventory', label: 'Inventory & SKUs', icon: Package, requiredPermission: 'inventory.view', group: 'Supply & Fleet' },

  // 3. Finance & Growth
  { id: 'payments', label: 'Payments & Ledger', icon: CreditCard, requiredPermission: 'payments.view', group: 'Finance' },
  { id: 'refunds', label: 'Refunds Desk', icon: RotateCcw, requiredPermission: 'refunds.view', group: 'Finance' },
  { id: 'settlements', label: 'Store Settlements', icon: Receipt, requiredPermission: 'settlements.view', group: 'Finance' },
  { id: 'pricing', label: 'Pricing & Margins', icon: Tag, requiredPermission: 'pricing.view', group: 'Finance' },

  // 4. Governance & Settings
  { id: 'service_areas', label: 'Service Zones', icon: MapPin, requiredPermission: 'service_areas.view', group: 'Settings' },
  { id: 'audit', label: 'Audit Logs', icon: FileText, requiredPermission: 'audit.view', group: 'Settings' },
  { id: 'settings', label: 'Settings', icon: Settings, requiredPermission: 'settings.manage', group: 'Settings' },
];

interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  userPermissions: AdminPermission[];
  userRole: AdminRole;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  userPermissions,
  userRole,
}) => {
  const groups: SidebarItem['group'][] = ['Operations', 'Supply & Fleet', 'Finance', 'Settings'];

  return (
    <aside className="w-56 bg-white border-r border-slate-200 text-slate-700 flex flex-col shrink-0 min-h-[calc(100vh-53px)]">
      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {groups.map((grp) => {
          const itemsInGroup = SIDEBAR_ITEMS.filter((item) => item.group === grp);
          return (
            <div key={grp} className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {grp}
              </div>
              {itemsInGroup.map((item) => {
                const isPermitted = userPermissions.includes(item.requiredPermission);
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : isPermitted
                        ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        : 'text-slate-400 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isPermitted ? (
                        <Lock className="h-3 w-3 text-slate-400" />
                      ) : item.badge ? (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full text-white font-mono ${
                            item.badgeColor || 'bg-slate-500'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Role Pill Footer */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="truncate">{userRole.replace('_', ' ')}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
      </div>
    </aside>
  );
};
