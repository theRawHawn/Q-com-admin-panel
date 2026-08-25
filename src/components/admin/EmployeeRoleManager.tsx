import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  FileText,
  Filter,
  Plus,
  Edit2,
  Search,
  Check,
  Trash2,
  Eye,
  ShieldAlert,
  XCircle,
  UserX,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Layers,
  RefreshCw,
  Info,
  Sliders,
  Sparkles,
  Ban
} from 'lucide-react';
import { adminApi } from '../../utils/adminApiClient';
import { AdminEmployeeUser, AdminRoleDefinition, AdminPermission } from '../../types/admin';
import { MODULE_PERMISSION_GROUPS, ALL_SYSTEM_PERMISSIONS } from '../../../server/rbac';

const SYSTEM_COMPONENTS_LIST = [
  { id: 'dashboard', name: 'Dashboard Overview', permissionKey: 'dashboard.view' as AdminPermission, desc: 'Main executive analytics dashboard and high-level stats' },
  { id: 'orders', name: 'Orders Management', permissionKey: 'orders.view' as AdminPermission, desc: 'Order processing, manual creation, status updates and refunds' },
  { id: 'delivery', name: 'Live Dispatch Operations', permissionKey: 'delivery.view' as AdminPermission, desc: 'Real-time order tracking map and rider dispatch' },
  { id: 'support', name: 'Customer Support Desk', permissionKey: 'support.view' as AdminPermission, desc: 'Support tickets, dispute resolution and customer credits' },
  { id: 'reports', name: 'Executive Reports & BI', permissionKey: 'reports.view' as AdminPermission, desc: 'Financial GMV reports and operational SLA compliance' },
  { id: 'promotions', name: 'Promotions & Coupons', permissionKey: 'promotions.view' as AdminPermission, desc: 'Discount coupon codes and co-funded campaigns' },
  { id: 'ads', name: 'Sponsored Ads Engine', permissionKey: 'ads.view' as AdminPermission, desc: 'Retail media sponsored products and advertiser analytics' },
  { id: 'sellers', name: 'Partner Stores & Sellers', permissionKey: 'sellers.view' as AdminPermission, desc: 'Merchant store onboarding, GSTIN verification and commission rates' },
  { id: 'riders', name: 'Riders & Fleet Management', permissionKey: 'riders.view' as AdminPermission, desc: 'Delivery rider directory, duty status and telemetry tracking' },
  { id: 'customers', name: 'Customers & Contractors', permissionKey: 'customers.view' as AdminPermission, desc: 'Customer accounts, saved GSTINs and trade privileges' },
  { id: 'products', name: 'Products & Catalogue', permissionKey: 'products.view' as AdminPermission, desc: 'SKU pricing, category hierarchy and stock inventory' },
  { id: 'employees', name: 'Employee Directory & Access', permissionKey: 'employees.view' as AdminPermission, desc: 'Staff account provisioning and status controls' },
  { id: 'roles', name: 'Dynamic Roles & RBAC Matrix', permissionKey: 'roles.view' as AdminPermission, desc: 'Custom role definitions and action permission matrix' },
  { id: 'settings', name: 'System Settings', permissionKey: 'settings.view' as AdminPermission, desc: 'Marketplace fees, delivery surcharges and global config' },
  { id: 'audit', name: 'Security Audit Logs', permissionKey: 'audit.view' as AdminPermission, desc: 'Security access logs and administrative activity trail' },
];

export const EmployeeRoleManager: React.FC = () => {
  const [employees, setEmployees] = useState<AdminEmployeeUser[]>([]);
  const [roles, setRoles] = useState<AdminRoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'ROLES_MATRIX'>('EMPLOYEES');

  // Search & Filters
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [permissionSearch, setPermissionSearch] = useState('');

  // Employee Modals
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<AdminEmployeeUser | null>(null);
  const [deletingEmp, setDeletingEmp] = useState<AdminEmployeeUser | null>(null);
  const [statusChangeEmp, setStatusChangeEmp] = useState<{ emp: AdminEmployeeUser; newStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' } | null>(null);
  const [statusReason, setStatusReason] = useState('');

  // Role Modals
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRoleDefinition | null>(null);
  const [deactivatingRole, setDeactivatingRole] = useState<{ role: AdminRoleDefinition; count: number } | null>(null);
  const [deletingRole, setDeletingRole] = useState<AdminRoleDefinition | null>(null);

  // Form states for Employee Create/Edit (Email identifier, Single Role, Component Access Matrix)
  const [empFormData, setEmpFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: 'Live Dispatch Operations',
    assignedRoleId: '',
    allowedComponentKeys: [] as AdminPermission[],
    joiningDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  // Form states for Role Create/Edit
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    code: '',
    department: 'General Operations',
    description: '',
    permissions: [] as AdminPermission[],
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  // Security confirmation / errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    orders: true,
    roles: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [empRes, rolesRes] = await Promise.all([
        adminApi.get<{ success: boolean; employees: AdminEmployeeUser[] }>('/api/admin/employees/list'),
        adminApi.get<{ success: boolean; roles: (AdminRoleDefinition & { assignedEmployeeCount: number })[] }>('/api/admin/roles'),
      ]);

      if (empRes.success) setEmployees(empRes.employees);
      if (rolesRes.success) setRoles(rolesRes.roles);
    } catch (err: any) {
      console.error('Failed to load RBAC data:', err);
      setErrorMsg(err.message || 'Failed to sync RBAC state with server store');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick Flash Notification
  const flashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // ------------------- EMPLOYEE HANDLERS -------------------
  const handleOpenAddEmp = () => {
    const defaultRole = roles.length > 0 ? (roles[1]?.id || roles[0]?.id || roles[0]?.code) : '';
    setEmpFormData({
      name: '',
      email: '',
      phone: '',
      designation: '',
      department: 'Live Dispatch Operations',
      assignedRoleId: defaultRole,
      allowedComponentKeys: SYSTEM_COMPONENTS_LIST.map((c) => c.permissionKey),
      joiningDate: new Date().toISOString().split('T')[0],
      reason: '',
    });
    setErrorMsg(null);
    setShowAddEmpModal(true);
  };

  const handleOpenEditEmp = (emp: AdminEmployeeUser) => {
    setEditingEmp(emp);
    const primaryRole = emp.assignedRoleIds?.[0] || emp.role || (roles[0]?.id || roles[0]?.code || '');
    const currentCustom = emp.customPermissionsOverride || SYSTEM_COMPONENTS_LIST.map((c) => c.permissionKey);
    setEmpFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      designation: emp.designation || emp.roleTitle || '',
      department: emp.department || 'Operations',
      assignedRoleId: primaryRole,
      allowedComponentKeys: currentCustom,
      joiningDate: emp.joiningDate || new Date().toISOString().split('T')[0],
      reason: '',
    });
    setErrorMsg(null);
  };

  const handleSubmitEmpForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empFormData.assignedRoleId) {
      setErrorMsg('Please select a role to assign to this employee.');
      return;
    }

    if (editingEmp && (!empFormData.reason || empFormData.reason.trim().length < 5)) {
      setErrorMsg('Updating employee role or component access requires an administrative justification reason.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload = {
        name: empFormData.name,
        email: empFormData.email,
        phone: empFormData.phone,
        designation: empFormData.designation,
        department: empFormData.department,
        assignedRoleIds: [empFormData.assignedRoleId],
        customPermissionsOverride: empFormData.allowedComponentKeys,
        joiningDate: empFormData.joiningDate,
        reason: empFormData.reason,
      };

      if (editingEmp) {
        const res = await adminApi.put<{ success: boolean; employee: AdminEmployeeUser; message: string }>(
          `/api/admin/employees/${editingEmp.id}/update`,
          payload
        );
        if (res.success) {
          flashSuccess(res.message);
          setEditingEmp(null);
          fetchData();
        }
      } else {
        const res = await adminApi.post<{ success: boolean; employee: AdminEmployeeUser; message: string }>(
          '/api/admin/employees/create',
          payload
        );
        if (res.success) {
          flashSuccess(res.message);
          setShowAddEmpModal(false);
          fetchData();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Employee action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeEmp) return;
    const { emp, newStatus } = statusChangeEmp;

    if ((newStatus === 'SUSPENDED' || newStatus === 'INACTIVE') && (!statusReason || statusReason.trim().length < 5)) {
      setErrorMsg('An administrative justification reason (min 5 chars) is mandatory when deactivating or suspending staff.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await adminApi.patch<{ success: boolean; message: string }>(
        `/api/admin/employees/${emp.id}/status`,
        {
          status: newStatus,
          reason: statusReason,
        }
      );

      if (res.success) {
        flashSuccess(res.message);
        setStatusChangeEmp(null);
        setStatusReason('');
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Status change failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteEmployee = async () => {
    if (!deletingEmp) return;
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await adminApi.delete<{ success: boolean; message: string }>(`/api/admin/employees/${deletingEmp.id}`);
      if (res.success) {
        flashSuccess(res.message);
        setDeletingEmp(null);
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete employee record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------- ROLE CREATION & PERMISSION MATRIX HANDLERS -------------------
  const handleOpenCreateRole = () => {
    setRoleFormData({
      name: '',
      code: '',
      department: 'Operations',
      description: '',
      permissions: ['orders.view', 'dashboard.view'],
      status: 'ACTIVE',
    });
    setErrorMsg(null);
    setShowCreateRoleModal(true);
  };

  const handleOpenEditRole = (role: AdminRoleDefinition) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      code: role.code,
      department: role.department,
      description: role.description,
      permissions: [...role.permissions],
      status: role.status,
    });
    setErrorMsg(null);
  };

  const togglePermission = (permKey: AdminPermission) => {
    setRoleFormData((prev) => {
      const exists = prev.permissions.includes(permKey);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== permKey) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permKey] };
      }
    });
  };

  const toggleModuleAllPermissions = (moduleId: string, check: boolean) => {
    const group = MODULE_PERMISSION_GROUPS.find((g) => g.moduleId === moduleId);
    if (!group) return;

    const groupKeys = group.permissions.map((p) => p.key);
    setRoleFormData((prev) => {
      if (check) {
        const combined = Array.from(new Set([...prev.permissions, ...groupKeys]));
        return { ...prev, permissions: combined };
      } else {
        const filtered = prev.permissions.filter((p) => !groupKeys.includes(p));
        return { ...prev, permissions: filtered };
      }
    });
  };

  const handleSubmitRoleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.name || roleFormData.name.trim().length < 3) {
      setErrorMsg('Role title must be at least 3 characters.');
      return;
    }

    if (roleFormData.permissions.length === 0) {
      setErrorMsg('Please select at least one action permission for this role.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      if (editingRole) {
        const res = await adminApi.put<{ success: boolean; role: AdminRoleDefinition; message: string }>(
          `/api/admin/roles/${editingRole.id}`,
          {
            name: roleFormData.name,
            department: roleFormData.department,
            description: roleFormData.description,
            permissions: roleFormData.permissions,
            status: roleFormData.status,
          }
        );

        if (res.success) {
          flashSuccess(res.message);
          setEditingRole(null);
          fetchData();
        }
      } else {
        const res = await adminApi.post<{ success: boolean; role: AdminRoleDefinition; message: string }>(
          '/api/admin/roles/create',
          {
            name: roleFormData.name,
            code: roleFormData.code || roleFormData.name.toUpperCase().replace(/\s+/g, '_'),
            department: roleFormData.department,
            description: roleFormData.description,
            permissions: roleFormData.permissions,
          }
        );

        if (res.success) {
          flashSuccess(res.message);
          setShowCreateRoleModal(false);
          fetchData();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Role creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateRolePrompt = (role: AdminRoleDefinition) => {
    const assignedCount = (role as any).assignedEmployeeCount || 0;
    setDeactivatingRole({ role, count: assignedCount });
  };

  const handleConfirmRoleDeactivation = async () => {
    if (!deactivatingRole) return;
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await adminApi.patch<{ success: boolean; message: string; affectedEmployeesCount: number }>(
        `/api/admin/roles/${deactivatingRole.role.id}/deactivate`
      );

      if (res.success) {
        flashSuccess(res.message);
        setDeactivatingRole(null);
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Role deactivation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteRole = async () => {
    if (!deletingRole) return;
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await adminApi.delete<{ success: boolean; message: string }>(`/api/admin/roles/${deletingRole.id}`);
      if (res.success) {
        flashSuccess(res.message);
        setDeletingRole(null);
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Role deletion failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------- SEARCH & FILTERS -------------------
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      (emp.employeeCode && emp.employeeCode.toLowerCase().includes(employeeSearch.toLowerCase())) ||
      (emp.designation && emp.designation.toLowerCase().includes(employeeSearch.toLowerCase()));

    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const uniqueDepartments = Array.from(new Set(employees.map((e) => e.department)));

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-slate-900 font-sans">
      {/* Alert Banners */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm shadow-xs">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm shadow-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Header Controls - Crisp Light Theme */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Main Admin RBAC & Role Permission Engine</h2>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-0.5 rounded-full font-mono">
              DYNAMIC CONTROL
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Dynamic control hierarchy: Main Admin → Staff Employees → Dynamic Roles → Action Permissions. Zero hardcoded role checks.
          </p>
        </div>

        {/* Tab & Primary Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('EMPLOYEES')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'EMPLOYEES'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Employee Directory ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('ROLES_MATRIX')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'ROLES_MATRIX'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              Dynamic Roles & Matrix ({roles.length})
            </button>
          </div>

          {activeTab === 'EMPLOYEES' ? (
            <button
              onClick={handleOpenAddEmp}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add New Employee
            </button>
          ) : (
            <button
              onClick={handleOpenCreateRole}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Custom Role
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: EMPLOYEES DIRECTORY */}
      {activeTab === 'EMPLOYEES' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, email, code..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="ALL">All Departments</option>
                {uniqueDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          </div>

          {/* Employee Directory Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Employee Staff</th>
                    <th className="px-6 py-4">Department & Designation</th>
                    <th className="px-6 py-4">Assigned Dynamic Roles</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                        Loading employee directory from store...
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No employees match the active filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const assignedRolesDetails = roles.filter(
                        (r) => emp.assignedRoleIds?.includes(r.id) || emp.assignedRoleIds?.includes(r.code) || emp.role === r.code
                      );

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-900">{emp.name}</p>
                                  {emp.employeeCode && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                                      {emp.employeeCode}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500">{emp.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-800">{emp.department}</p>
                            <p className="text-xs text-slate-500">{emp.designation || emp.roleTitle}</p>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {assignedRolesDetails.length > 0 ? (
                                assignedRolesDetails.map((r) => (
                                  <span
                                    key={r.id}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                      r.code === 'SUPER_ADMIN'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : r.code === 'FINANCE_ADMIN'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    }`}
                                  >
                                    <Shield className="w-3 h-3" />
                                    {r.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400">No roles assigned</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono">
                              Effective permissions: {(emp as any).effectivePermissionsCount || 'Full Access'}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                emp.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : emp.status === 'SUSPENDED'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {emp.status === 'ACTIVE' && <CheckCircle className="w-3 h-3" />}
                              {emp.status === 'SUSPENDED' && <Ban className="w-3 h-3" />}
                              {emp.status === 'INACTIVE' && <UserX className="w-3 h-3" />}
                              {emp.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditEmp(emp)}
                                className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit / Roles
                              </button>

                              {emp.status === 'ACTIVE' ? (
                                <button
                                  onClick={() => setStatusChangeEmp({ emp, newStatus: 'SUSPENDED' })}
                                  className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1.5 rounded-lg transition-colors"
                                  title="Suspend Account"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => setStatusChangeEmp({ emp, newStatus: 'ACTIVE' })}
                                  className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1.5 rounded-lg transition-colors"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Reactivate
                                </button>
                              )}

                              {/* Delete Option */}
                              <button
                                onClick={() => setDeletingEmp(emp)}
                                disabled={emp.role === 'SUPER_ADMIN' || emp.id === 'emp-001'}
                                className="inline-flex items-center gap-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title={emp.role === 'SUPER_ADMIN' ? 'Super Admin cannot be deleted' : 'Delete Employee Record'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
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
        </div>
      )}

      {/* TAB 2: DYNAMIC ROLES & PERMISSION MATRIX */}
      {activeTab === 'ROLES_MATRIX' && (
        <div className="space-y-6">
          {/* Roles Grid Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => {
              const assignedCount = (role as any).assignedEmployeeCount || 0;
              return (
                <div
                  key={role.id}
                  className={`bg-white border rounded-2xl p-5 space-y-3 shadow-xs transition-all ${
                    role.status === 'ACTIVE' ? 'border-slate-200 hover:border-slate-300' : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{role.name}</h3>
                        {role.isSystemRole && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-semibold">
                            SYSTEM
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{role.code}</span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        role.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {role.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{role.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-mono">
                      {role.permissions.length} action permissions
                    </span>
                    <span className="text-indigo-600 font-medium">
                      {assignedCount} employee(s) assigned
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEditRole(role)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      Edit Matrix
                    </button>

                    {role.status === 'ACTIVE' && !role.isSystemRole && (
                      <button
                        onClick={() => handleDeactivateRolePrompt(role)}
                        className="flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 p-1.5 rounded-lg transition-colors"
                        title="Deactivate Role"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!role.isSystemRole && role.code !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => setDeletingRole(role)}
                        className="flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 p-1.5 rounded-lg transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Enterprise Permission Matrix Inspection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  Master Permission Matrix & Action Levels
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect module action keys across View, Create, Edit, Delete, Approve, Export & Assign.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter permission keys (e.g. cancel, export)..."
                  value={permissionSearch}
                  onChange={(e) => setPermissionSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Accordion Module Permission Cards */}
            <div className="space-y-3">
              {MODULE_PERMISSION_GROUPS.map((group) => {
                const filteredGroupPerms = group.permissions.filter(
                  (p) =>
                    p.key.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                    p.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                    p.description.toLowerCase().includes(permissionSearch.toLowerCase())
                );

                if (permissionSearch && filteredGroupPerms.length === 0) return null;

                const isExpanded = expandedModules[group.moduleId] ?? true;

                return (
                  <div key={group.moduleId} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedModules((prev) => ({ ...prev, [group.moduleId]: !isExpanded }))
                      }
                      className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-600" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <div>
                          <span className="font-bold text-slate-900 text-sm">{group.moduleName}</span>
                          <span className="ml-2 text-xs text-slate-500 font-mono">({group.permissions.length} actions)</span>
                          <p className="text-xs text-slate-500">{group.description}</p>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 bg-white">
                        {filteredGroupPerms.map((perm) => (
                          <div
                            key={perm.key}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1 hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 text-xs">{perm.name}</span>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase ${
                                  perm.level === 'View'
                                    ? 'bg-slate-200 text-slate-700'
                                    : perm.level === 'Create'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : perm.level === 'Approve'
                                    ? 'bg-amber-100 text-amber-800'
                                    : perm.level === 'Export'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}
                              >
                                {perm.level}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-indigo-600">{perm.key}</p>
                            <p className="text-[11px] text-slate-500">{perm.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------- MODAL: ADD / EDIT EMPLOYEE ------------------- */}
      {(showAddEmpModal || editingEmp) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 shadow-xl text-slate-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {editingEmp ? `Edit Employee & Role Assignments` : `Add New Employee User`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddEmpModal(false);
                  setEditingEmp(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmitEmpForm} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={empFormData.name}
                    onChange={(e) => setEmpFormData({ ...empFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={empFormData.email}
                    onChange={(e) => setEmpFormData({ ...empFormData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="ramesh@qcom.trade"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={empFormData.phone}
                    onChange={(e) => setEmpFormData({ ...empFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={empFormData.designation}
                    onChange={(e) => setEmpFormData({ ...empFormData, designation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="Senior Hub Manager"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={empFormData.department}
                    onChange={(e) => setEmpFormData({ ...empFormData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="Live Dispatch Operations"
                  />
                </div>
              </div>

              {/* Role Assignment - Single Role Only (No Multiple Allowed) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Assign Primary Role</span>
                  <span className="text-[11px] text-slate-500 font-normal">Single role selection</span>
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                  {roles.map((r) => {
                    const isSelected = empFormData.assignedRoleId === r.id || empFormData.assignedRoleId === r.code;
                    return (
                      <label key={r.id} className={`flex items-start gap-2.5 cursor-pointer p-2 rounded-lg border transition-colors ${isSelected ? 'bg-indigo-50/80 border-indigo-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="assignedRoleRadio"
                          checked={isSelected}
                          onChange={() => {
                            setEmpFormData((prev) => ({ ...prev, assignedRoleId: r.id }));
                          }}
                          className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900">{r.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{r.code}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{r.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Component Access Checklist Matrix */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Component Access Control Matrix
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setEmpFormData((prev) => ({ ...prev, allowedComponentKeys: SYSTEM_COMPONENTS_LIST.map((c) => c.permissionKey) }))}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setEmpFormData((prev) => ({ ...prev, allowedComponentKeys: [] }))}
                      className="text-rose-600 hover:text-rose-800 font-semibold"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 max-h-56 overflow-y-auto">
                  {SYSTEM_COMPONENTS_LIST.map((comp) => {
                    const isAllowed = empFormData.allowedComponentKeys.includes(comp.permissionKey);
                    return (
                      <label
                        key={comp.id}
                        className={`flex items-start gap-2.5 cursor-pointer p-2 rounded-lg border transition-colors ${
                          isAllowed ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEmpFormData((prev) => ({
                                ...prev,
                                allowedComponentKeys: Array.from(new Set([...prev.allowedComponentKeys, comp.permissionKey])),
                              }));
                            } else {
                              setEmpFormData((prev) => ({
                                ...prev,
                                allowedComponentKeys: prev.allowedComponentKeys.filter((k) => k !== comp.permissionKey),
                              }));
                            }
                          }}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-slate-900">{comp.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{comp.permissionKey}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{comp.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {editingEmp && (
                <div>
                  <label className="block text-xs font-semibold text-amber-700 mb-1">
                    Administrative Security Justification (Mandatory)
                  </label>
                  <input
                    type="text"
                    required
                    value={empFormData.reason}
                    onChange={(e) => setEmpFormData({ ...empFormData, reason: e.target.value })}
                    className="w-full bg-slate-50 border border-amber-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    placeholder="Reason for role change (e.g., Transfer to Finance Department)"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEmpModal(false);
                    setEditingEmp(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingEmp ? 'Save Employee Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- MODAL: CREATE / EDIT ROLE & MATRIX ------------------- */}
      {(showCreateRoleModal || editingRole) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 shadow-xl text-slate-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {editingRole ? `Edit Role Matrix: ${editingRole.name}` : `Create New Dynamic Role & Permission Matrix`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCreateRoleModal(false);
                  setEditingRole(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmitRoleForm} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title / Name</label>
                  <input
                    type="text"
                    required
                    value={roleFormData.name}
                    onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="e.g. Regional Fleet Supervisor"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={roleFormData.department}
                    onChange={(e) => setRoleFormData({ ...roleFormData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="Logistics Operations"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Code</label>
                  <input
                    type="text"
                    value={roleFormData.code}
                    onChange={(e) => setRoleFormData({ ...roleFormData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="FLEET_SUPERVISOR"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Purpose & Description</label>
                  <input
                    type="text"
                    required
                    value={roleFormData.description}
                    onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="Describe what scope and responsibilities this role holds..."
                  />
                </div>
              </div>

              {/* Action Permission Matrix Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Assign Action Permissions ({roleFormData.permissions.length} selected)
                  </label>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setRoleFormData((prev) => ({ ...prev, permissions: [...ALL_SYSTEM_PERMISSIONS] }))}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold"
                    >
                      Select All Permissions
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setRoleFormData((prev) => ({ ...prev, permissions: [] }))}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 max-h-[360px] overflow-y-auto">
                  {MODULE_PERMISSION_GROUPS.map((group) => {
                    const groupKeys = group.permissions.map((p) => p.key);
                    const allGroupSelected = groupKeys.every((k) => roleFormData.permissions.includes(k));

                    return (
                      <div key={group.moduleId} className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-xs text-slate-900">{group.moduleName}</span>
                          <button
                            type="button"
                            onClick={() => toggleModuleAllPermissions(group.moduleId, !allGroupSelected)}
                            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            {allGroupSelected ? 'Deselect Module' : 'Select All in Module'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {group.permissions.map((p) => {
                            const isSelected = roleFormData.permissions.includes(p.key);
                            return (
                              <label
                                key={p.key}
                                className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
                                  isSelected
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => togglePermission(p.key)}
                                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-xs leading-tight text-slate-900">{p.name}</p>
                                  <p className="text-[10px] font-mono text-slate-500 truncate">{p.key}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateRoleModal(false);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Role...' : editingRole ? 'Update Role Matrix' : 'Create Custom Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- MODAL: DELETE EMPLOYEE CONFIRMATION ------------------- */}
      {deletingEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-8 h-8 shrink-0 text-rose-600" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Employee Record</h3>
                <p className="text-xs text-rose-700 font-medium">{deletingEmp.name} ({deletingEmp.email})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this employee account (<strong className="text-slate-900">{deletingEmp.employeeCode || deletingEmp.name}</strong>)? This action will remove their access and role assignments permanently.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeletingEmp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDeleteEmployee}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- MODAL: DELETE ROLE CONFIRMATION ------------------- */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-8 h-8 shrink-0 text-rose-600" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Dynamic Role</h3>
                <p className="text-xs text-rose-700 font-medium">{deletingRole.name} ({deletingRole.code})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the dynamic role <strong className="text-slate-900">{deletingRole.name}</strong>? Any permissions tied exclusively to this role definition will be unassigned.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeletingRole(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDeleteRole}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- MODAL: ROLE DEACTIVATION WARNING ------------------- */}
      {deactivatingRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-amber-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-amber-600">
              <ShieldAlert className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Deactivate Role Warning</h3>
                <p className="text-xs text-amber-800 font-mono">{deactivatingRole.role.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Deactivating this role will set its status to <strong className="text-amber-700">INACTIVE</strong>.
              {deactivatingRole.count > 0 ? (
                <span className="block mt-2 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-amber-800 font-medium">
                  ⚠️ Critical Notice: This role is currently assigned to <strong>{deactivatingRole.count} active employee(s)</strong>.
                  Deactivating this role will immediately revoke these action permissions for affected staff members.
                </span>
              ) : (
                <span className="block mt-2 text-slate-500">
                  No active employees are currently assigned to this role.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeactivatingRole(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmRoleDeactivation}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
              >
                {isSubmitting ? 'Deactivating...' : 'Confirm Role Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- MODAL: STATUS CHANGE CONFIRMATION ------------------- */}
      {statusChangeEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-amber-600">
              <UserX className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Employee Status Transition</h3>
                <p className="text-xs text-slate-500">{statusChangeEmp.emp.name} ({statusChangeEmp.emp.email})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Change account status to <strong className="text-slate-900">{statusChangeEmp.newStatus}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-amber-700 mb-1">
                Administrative Justification (Mandatory)
              </label>
              <input
                type="text"
                required
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                placeholder="Specify justification reason (e.g., SLA violation investigation)"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStatusChangeEmp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmStatusChange}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                {isSubmitting ? 'Updating...' : 'Confirm Status Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
