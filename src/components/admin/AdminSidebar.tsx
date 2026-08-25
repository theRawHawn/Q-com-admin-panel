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
  Lock,
  X,
  Megaphone,
  Layout,
  BarChart3,
  Shield,
  Percent
} from 'lucide-react';
import { AdminPermission, AdminRole } from '../../types/admin';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission: AdminPermission;
  badge?: number | string;
  badgeColor?: string;
  group: 'Operations' | 'Marketing & Ads' | 'Supply & Fleet' | 'Finance' | 'Settings';
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  // 1. Operations
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiredPermission: 'dashboard.view', group: 'Operations' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, requiredPermission: 'orders.view', badge: 5, badgeColor: 'bg-emerald-600', group: 'Operations' },
  { id: 'dispatch', label: 'Live Dispatch', icon: Send, requiredPermission: 'orders.assign_rider', badge: 7, badgeColor: 'bg-rose-500', group: 'Operations' },
  { id: 'support', label: 'Support Desk', icon: LifeBuoy, requiredPermission: 'support.view', badge: 2, badgeColor: 'bg-amber-500', group: 'Operations' },
  { id: 'reports', label: 'Executive Reports', icon: BarChart3, requiredPermission: 'reports.view', group: 'Operations' },

  // 2. Marketing & Retail Media
  { id: 'promotions', label: 'Promotions & Coupons', icon: Percent, requiredPermission: 'promotions.view', group: 'Marketing & Ads' },
  { id: 'ads', label: 'Sponsored Ads Engine', icon: Megaphone, requiredPermission: 'ads.view', badge: 'LIVE', badgeColor: 'bg-purple-600', group: 'Marketing & Ads' },
  { id: 'cms', label: 'Content & CMS', icon: Layout, requiredPermission: 'cms.view', group: 'Marketing & Ads' },

  // 3. Supply & Fleet
  { id: 'sellers', label: 'Partner Stores', icon: Store, requiredPermission: 'sellers.view', group: 'Supply & Fleet' },
  { id: 'riders', label: 'Riders & Fleet', icon: Bike, requiredPermission: 'riders.view', group: 'Supply & Fleet' },
  { id: 'customers', label: 'Customers', icon: Users, requiredPermission: 'customers.view', group: 'Supply & Fleet' },
  { id: 'inventory', label: 'Inventory & SKUs', icon: Package, requiredPermission: 'inventory.view', group: 'Supply & Fleet' },

  // 4. Finance & Growth
  { id: 'payments', label: 'Payments & Ledger', icon: CreditCard, requiredPermission: 'payments.view', group: 'Finance' },
  { id: 'refunds', label: 'Refunds Desk', icon: RotateCcw, requiredPermission: 'refunds.view', group: 'Finance' },
  { id: 'settlements', label: 'Store Settlements', icon: Receipt, requiredPermission: 'settlements.view', group: 'Finance' },
  { id: 'pricing', label: 'Pricing & Margins', icon: Tag, requiredPermission: 'pricing.view', group: 'Finance' },

  // 5. Governance & Settings
  { id: 'employees', label: 'Employees & Roles', icon: Shield, requiredPermission: 'users.view', group: 'Settings' },
  { id: 'service_areas', label: 'Service Zones', icon: MapPin, requiredPermission: 'service_areas.view', group: 'Settings' },
  { id: 'audit', label: 'Audit Logs', icon: FileText, requiredPermission: 'audit.view', group: 'Settings' },
  { id: 'settings', label: 'Settings', icon: Settings, requiredPermission: 'settings.manage', group: 'Settings' },
];

interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  userPermissions: AdminPermission[];
  userRole: AdminRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  userPermissions,
  userRole,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const groups: SidebarItem['group'][] = ['Operations', 'Marketing & Ads', 'Supply & Fleet', 'Finance', 'Settings'];

  const renderSidebarContent = () => (
    <>
      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {groups.map((grp) => {
          const isSuperAdmin = userRole === 'SUPER_ADMIN' || userPermissions.includes('*' as any);
          const itemsInGroup = SIDEBAR_ITEMS.filter((item) => {
            if (item.group !== grp) return false;
            if (isSuperAdmin) return true;
            return userPermissions.includes(item.requiredPermission);
          });

          if (itemsInGroup.length === 0) return null;

          return (
            <div key={grp} className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {grp}
              </div>
              {itemsInGroup.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
                      {item.badge ? (
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
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r border-slate-200 text-slate-700 flex-col shrink-0 min-h-[calc(100vh-53px)]">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <aside className="relative w-64 max-w-[80vw] bg-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                  QC
                </div>
                <span className="font-bold text-slate-900 text-sm">Navigation</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
};
