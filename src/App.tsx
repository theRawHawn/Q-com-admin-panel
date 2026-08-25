import React, { useState, useEffect } from 'react';
import { AdminHeader } from './components/admin/AdminHeader';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { PermissionDeniedBanner } from './components/admin/PermissionDeniedBanner';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { OrderControlCenter } from './components/admin/OrderControlCenter';
import { DispatchOperations } from './components/admin/DispatchOperations';
import { SellerManagement } from './components/admin/SellerManagement';
import { RiderFleetManagement } from './components/admin/RiderFleetManagement';
import { CustomerManagement } from './components/admin/CustomerManagement';
import { InventoryManagement } from './components/admin/InventoryManagement';
import { PaymentsAndRefunds } from './components/admin/PaymentsAndRefunds';
import { SellerSettlements } from './components/admin/SellerSettlements';
import { ServiceAreasConfig } from './components/admin/ServiceAreasConfig';
import { PricingEconomicsConfig } from './components/admin/PricingEconomicsConfig';
import { SupportDesk } from './components/admin/SupportDesk';
import { AuditLogsViewer } from './components/admin/AuditLogsViewer';
import { MarketplaceSettings } from './components/admin/MarketplaceSettings';

import { AdminUser, AdminRole, AdminPermission, IndianCityConfig } from './types/admin';
import { adminApi } from './utils/adminApiClient';

// 7 Pre-configured RBAC Admin Personas for live testing & inspection
const AVAILABLE_ADMIN_PERSONAS: AdminUser[] = [
  {
    id: 'ADM-SUPER-01',
    name: 'Vikram Malhotra',
    email: 'vikram.m@qcom.build',
    role: 'SUPER_ADMIN',
    roleTitle: 'Chief Operating Officer & Super Admin',
    department: 'Executive Leadership',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    lastLogin: 'Just now',
  },
  {
    id: 'ADM-OPS-02',
    name: 'Priya Sharma',
    email: 'priya.s@qcom.build',
    role: 'OPERATIONS_ADMIN',
    roleTitle: 'Head of National Hub Operations',
    department: 'Fulfillment & Dispatch',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    lastLogin: '5 mins ago',
  },
  {
    id: 'ADM-SELLER-03',
    name: 'Anand Kulkarni',
    email: 'anand.k@qcom.build',
    role: 'SELLER_MANAGER',
    roleTitle: 'Authorised Merchant & Local GST Store Onboarding Lead',
    department: 'Supply Partnerships',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    lastLogin: '18 mins ago',
  },
  {
    id: 'ADM-FLEET-04',
    name: 'Rohit Verma',
    email: 'rohit.v@qcom.build',
    role: 'DELIVERY_MANAGER',
    roleTitle: 'Pan-India Fleet Telemetry Controller',
    department: 'Logistics',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    lastLogin: '1 hour ago',
  },
  {
    id: 'ADM-FIN-05',
    name: 'Sunita Mehra',
    email: 'sunita.m@qcom.build',
    role: 'FINANCE_ADMIN',
    roleTitle: 'Reconciliation & Multi-State GST Comptroller',
    department: 'Finance & Accounts',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    lastLogin: '2 hours ago',
  },
  {
    id: 'ADM-SUPP-06',
    name: 'Karthik Raja',
    email: 'karthik.r@qcom.build',
    role: 'CUSTOMER_SUPPORT',
    roleTitle: 'Senior Contractor Support Specialist',
    department: 'Customer Care',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    lastLogin: '32 mins ago',
  },
  {
    id: 'ADM-ANALYST-07',
    name: 'Deepa Hegde',
    email: 'deepa.h@qcom.build',
    role: 'ANALYST',
    roleTitle: 'Pan-India Expansion & Unit Economics Analyst',
    department: 'Business Intelligence',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    lastLogin: 'Yesterday',
  },
];

// Required permission for each active view tab
const TAB_PERMISSION_MAP: Record<string, AdminPermission> = {
  dashboard: 'dashboard.view',
  orders: 'orders.view',
  dispatch: 'orders.assign_rider',
  support: 'support.view',
  sellers: 'sellers.view',
  riders: 'riders.view',
  customers: 'customers.view',
  inventory: 'inventory.view',
  payments: 'payments.view',
  refunds: 'refunds.view',
  settlements: 'settlements.view',
  pricing: 'pricing.view',
  service_areas: 'service_areas.view',
  audit: 'audit.view',
  settings: 'settings.manage',
};

// Default permission mapping for offline/instant hydration
const DEFAULT_ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    'dashboard.view', 'orders.view', 'orders.edit_status', 'orders.cancel', 'orders.assign_rider',
    'sellers.view', 'sellers.approve', 'sellers.suspend', 'sellers.edit_commission',
    'riders.view', 'riders.approve', 'riders.suspend', 'riders.broadcast',
    'customers.view', 'customers.edit_status', 'customers.view_sensitive',
    'inventory.view', 'inventory.edit_stock', 'inventory.edit_price',
    'payments.view', 'payments.reconcile', 'refunds.view', 'refunds.create', 'refunds.approve',
    'settlements.view', 'settlements.process', 'pricing.view', 'pricing.manage',
    'service_areas.view', 'service_areas.manage', 'audit.view', 'support.view', 'support.manage', 'settings.manage'
  ],
  OPERATIONS_ADMIN: [
    'dashboard.view', 'orders.view', 'orders.edit_status', 'orders.cancel', 'orders.assign_rider',
    'sellers.view', 'sellers.suspend', 'riders.view', 'riders.approve', 'riders.suspend', 'riders.broadcast',
    'customers.view', 'inventory.view', 'inventory.edit_stock', 'service_areas.view', 'service_areas.manage',
    'support.view', 'support.manage', 'audit.view'
  ],
  SELLER_MANAGER: [
    'dashboard.view', 'sellers.view', 'sellers.approve', 'sellers.suspend', 'sellers.edit_commission',
    'inventory.view', 'inventory.edit_price', 'pricing.view', 'orders.view', 'audit.view'
  ],
  DELIVERY_MANAGER: [
    'dashboard.view', 'riders.view', 'riders.approve', 'riders.suspend', 'riders.broadcast',
    'orders.view', 'orders.assign_rider', 'service_areas.view', 'audit.view'
  ],
  FINANCE_ADMIN: [
    'dashboard.view', 'orders.view', 'sellers.view', 'payments.view', 'payments.reconcile',
    'refunds.view', 'refunds.create', 'refunds.approve', 'settlements.view', 'settlements.process',
    'pricing.view', 'pricing.manage', 'audit.view'
  ],
  CUSTOMER_SUPPORT: [
    'dashboard.view', 'customers.view', 'customers.edit_status', 'orders.view', 'orders.cancel',
    'refunds.view', 'refunds.create', 'support.view', 'support.manage'
  ],
  ANALYST: [
    'dashboard.view', 'orders.view', 'sellers.view', 'riders.view', 'customers.view',
    'inventory.view', 'payments.view', 'refunds.view', 'settlements.view',
    'service_areas.view', 'pricing.view', 'audit.view'
  ],
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<AdminUser>(AVAILABLE_ADMIN_PERSONAS[0]);
  const [userPermissions, setUserPermissions] = useState<AdminPermission[]>(
    DEFAULT_ROLE_PERMISSIONS[AVAILABLE_ADMIN_PERSONAS[0].role] || []
  );
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(7);
  const [cities, setCities] = useState<IndianCityConfig[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Sync API client session role when user switches persona
  useEffect(() => {
    adminApi.setAdminRole(currentUser.role);
    adminApi.setAdminId(currentUser.id);
    
    // Set immediate permissions from matrix
    if (DEFAULT_ROLE_PERMISSIONS[currentUser.role]) {
      setUserPermissions(DEFAULT_ROLE_PERMISSIONS[currentUser.role]);
    }

    // Fetch dynamic permissions for this role from server authoritative matrix
    const fetchPerms = async () => {
      try {
        const res: any = await adminApi.get('/api/admin/me');
        if (res.success && res.permissions) {
          setUserPermissions(res.permissions);
        } else if (res.success && res.user?.permissions) {
          setUserPermissions(res.user.permissions);
        }
      } catch (err) {
        console.warn('Using client permissions fallback:', err);
      }
    };
    fetchPerms();
  }, [currentUser]);

  // Load operational Indian cities list
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res: any = await adminApi.get('/api/admin/cities');
        if (res.success) {
          setCities(res.cities);
        }
      } catch (err) {
        console.error('Failed to load Indian cities:', err);
      }
    };
    fetchCities();
  }, []);

  const handleGlobalSearch = (query: string) => {
    if (query) {
      setActiveTab('orders');
    }
  };

  const currentTabRequiredPermission = TAB_PERMISSION_MAP[activeTab];
  const isPermitted = !currentTabRequiredPermission || userPermissions.includes(currentTabRequiredPermission);

  const renderActiveView = () => {
    if (!isPermitted) {
      return (
        <PermissionDeniedBanner
          requiredPermission={currentTabRequiredPermission}
          currentRole={currentUser.role}
          featureName={activeTab.replace(/_/g, ' ').toUpperCase()}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onNavigateTab={setActiveTab} selectedCity={selectedCity} />;
      case 'orders':
        return <OrderControlCenter userPermissions={userPermissions} selectedCity={selectedCity} />;
      case 'dispatch':
        return <DispatchOperations userPermissions={userPermissions} />;
      case 'support':
        return <SupportDesk userPermissions={userPermissions} />;
      case 'sellers':
        return <SellerManagement userPermissions={userPermissions} selectedCity={selectedCity} />;
      case 'riders':
        return <RiderFleetManagement userPermissions={userPermissions} selectedCity={selectedCity} />;
      case 'customers':
        return <CustomerManagement userPermissions={userPermissions} />;
      case 'inventory':
        return <InventoryManagement userPermissions={userPermissions} selectedCity={selectedCity} />;
      case 'payments':
      case 'refunds':
        return <PaymentsAndRefunds userPermissions={userPermissions} />;
      case 'settlements':
        return <SellerSettlements userPermissions={userPermissions} />;
      case 'pricing':
        return <PricingEconomicsConfig userPermissions={userPermissions} />;
      case 'service_areas':
        return (
          <ServiceAreasConfig 
            userPermissions={userPermissions} 
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
          />
        );
      case 'audit':
        return <AuditLogsViewer userPermissions={userPermissions} />;
      case 'settings':
        return <MarketplaceSettings userPermissions={userPermissions} />;
      default:
        return <DashboardOverview onNavigateTab={setActiveTab} selectedCity={selectedCity} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Fixed Admin Header */}
      <AdminHeader
        currentUser={currentUser}
        availableUsers={AVAILABLE_ADMIN_PERSONAS}
        onSwitchUser={setCurrentUser}
        onSearch={handleGlobalSearch}
        activeAlertsCount={activeAlertsCount}
        onNavigateToTab={setActiveTab}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        cities={cities}
      />

      {/* Main Workspace: Sidebar + Dynamic Sub-system View */}
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userPermissions={userPermissions}
          userRole={currentUser.role}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
