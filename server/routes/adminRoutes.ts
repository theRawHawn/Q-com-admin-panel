import { Router, Request, Response, NextFunction } from 'express';
import { authoritativeAdminStore } from '../store/adminStore';
import { calculateEmployeePermissions, MODULE_PERMISSION_GROUPS, ALL_SYSTEM_PERMISSIONS } from '../rbac';
import { AdminPermission, AdminRole, AdminUser, AdminEmployeeUser, AdminRoleDefinition } from '../../src/types/admin';

export const adminRouter = Router();

// Middleware to extract authenticated admin persona from headers
interface AuthenticatedRequest extends Request {
  admin?: AdminUser;
  employee?: AdminEmployeeUser;
  effectivePermissions?: AdminPermission[];
}

function authenticateAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const roleHeader = (req.headers['x-admin-role'] as AdminRole) || 'SUPER_ADMIN';
  const adminIdHeader = req.headers['x-admin-id'] as string;

  // Look up employee from store first
  let emp = authoritativeAdminStore.getEmployees().find(
    (e) => (adminIdHeader && (e.id === adminIdHeader || e.employeeCode === adminIdHeader)) || e.role === roleHeader || e.assignedRoleIds?.includes(roleHeader)
  );

  if (!emp && (roleHeader === 'SUPER_ADMIN' || !roleHeader)) {
    emp = authoritativeAdminStore.getEmployees().find((e) => e.role === 'SUPER_ADMIN') || authoritativeAdminStore.getEmployees()[0];
  } else if (!emp) {
    emp = authoritativeAdminStore.getEmployees()[0];
  }

  req.employee = emp;
  req.admin = {
    id: emp.id,
    name: emp.name,
    email: emp.email,
    role: emp.role,
    roleTitle: emp.roleTitle,
    avatar: emp.avatar,
    department: emp.department,
    lastLogin: emp.lastLogin,
    status: emp.status,
  };

  const allRoles = authoritativeAdminStore.getRoles();
  req.effectivePermissions = calculateEmployeePermissions(emp, allRoles);
  next();
}

function requirePermission(permission: AdminPermission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const emp = req.employee;
    const permissions = req.effectivePermissions || [];

    if (!emp) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHENTICATED',
        message: 'Admin authentication required',
      });
    }

    // Check if employee is inactive or suspended
    if (emp.status !== 'ACTIVE') {
      authoritativeAdminStore.logAudit({
        actorName: emp.name,
        actorRole: emp.role,
        actionType: 'BLOCKED_INACTIVE_USER_ACCESS',
        targetModule: 'RBAC Security',
        summary: `Blocked access attempt by ${emp.status} user "${emp.name}" (${emp.email}).`,
        severity: 'CRITICAL',
      });

      return res.status(403).json({
        success: false,
        error: 'ACCOUNT_INACTIVE',
        status: emp.status,
        message: `Access Denied: Your account status is '${emp.status}'. Please contact Super Admin.`,
      });
    }

    // Super Admin bypass & alias permissions mapping
    const isSuperAdmin = emp.role === 'SUPER_ADMIN' || emp.assignedRoleIds?.includes('role-super-admin') || emp.assignedRoleIds?.includes('SUPER_ADMIN');

    const hasPerm =
      isSuperAdmin ||
      permissions.includes(permission) ||
      permissions.includes('*' as any) ||
      (permission === 'users.view' && (permissions.includes('employees.view') || permissions.includes('roles.view'))) ||
      (permission === 'roles.view' && permissions.includes('users.view')) ||
      (permission === 'employees.view' && permissions.includes('users.view'));

    if (!hasPerm) {
      authoritativeAdminStore.logAudit({
        actorName: emp.name,
        actorRole: emp.role,
        actionType: `PERMISSION_DENIED_${permission.toUpperCase().replace(/\./g, '_')}`,
        targetModule: 'RBAC Security',
        summary: `User "${emp.name}" (${emp.roleTitle}) attempted forbidden action requiring '${permission}'.`,
        severity: 'HIGH',
      });

      return res.status(403).json({
        success: false,
        error: 'PERMISSION_DENIED',
        requiredPermission: permission,
        userRole: emp.roleTitle,
        message: `Forbidden: Your role '${emp.roleTitle}' does not possess the required permission '${permission}'`,
      });
    }

    next();
  };
}

adminRouter.use(authenticateAdmin);

// ==================== DYNAMIC RBAC: ROLES & PERMISSIONS API ====================

// 1. Get all dynamic roles & permission breakdown
adminRouter.get('/roles', requirePermission('roles.view'), (req: AuthenticatedRequest, res: Response) => {
  const roles = authoritativeAdminStore.getRoles();
  const employees = authoritativeAdminStore.getEmployees();

  // Enrich roles with assigned employee counts
  const enrichedRoles = roles.map((role) => {
    const assignedCount = employees.filter(
      (e) => e.status === 'ACTIVE' && (e.assignedRoleIds?.includes(role.id) || e.assignedRoleIds?.includes(role.code) || e.role === role.code)
    ).length;

    return {
      ...role,
      assignedEmployeeCount: assignedCount,
    };
  });

  res.json({
    success: true,
    roles: enrichedRoles,
  });
});

// 2. Get full permission matrix structure & list
adminRouter.get('/permissions', requirePermission('permissions.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    moduleGroups: MODULE_PERMISSION_GROUPS,
    allPermissions: ALL_SYSTEM_PERMISSIONS,
  });
});

// 3. Create a new custom role dynamically
adminRouter.post('/roles/create', requirePermission('roles.create'), (req: AuthenticatedRequest, res: Response) => {
  const { name, department, description, permissions, code } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    return res.status(400).json({ success: false, error: 'INVALID_ROLE_NAME', message: 'Role name must be at least 3 characters long.' });
  }

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ success: false, error: 'INVALID_PERMISSIONS', message: 'Permissions must be provided as an array of permission keys.' });
  }

  const createdRole = authoritativeAdminStore.createRole({
    name: name.trim(),
    code: code || name.trim().toUpperCase().replace(/\s+/g, '_'),
    department: department || 'General Operations',
    description: description || 'Custom dynamic role created by Main Admin.',
    permissions,
    status: 'ACTIVE',
  });

  res.status(201).json({
    success: true,
    role: createdRole,
    message: `Dynamic role "${createdRole.name}" created successfully with ${createdRole.permissions.length} action permissions.`,
  });
});

// 4. Update an existing role definition & permission matrix
adminRouter.put('/roles/:id', requirePermission('roles.edit'), (req: AuthenticatedRequest, res: Response) => {
  const roleId = req.params.id;
  const { name, department, description, permissions, status } = req.body;

  const existing = authoritativeAdminStore.getRoleById(roleId);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'ROLE_NOT_FOUND', message: 'Role not found.' });
  }

  if (existing.isSystemRole && existing.code === 'SUPER_ADMIN' && permissions && permissions.length < ALL_SYSTEM_PERMISSIONS.length) {
    return res.status(400).json({ success: false, error: 'PROTECTED_SYSTEM_ROLE', message: 'Super Admin system role permissions cannot be restricted.' });
  }

  const updated = authoritativeAdminStore.updateRole(roleId, {
    ...(name && { name: name.trim() }),
    ...(department && { department }),
    ...(description !== undefined && { description }),
    ...(permissions && { permissions }),
    ...(status && { status }),
  });

  res.json({
    success: true,
    role: updated,
    message: `Role "${updated?.name}" updated successfully.`,
  });
});

// 5. Deactivate a role (with employee impact warning and audit log)
adminRouter.patch('/roles/:id/deactivate', requirePermission('roles.deactivate'), (req: AuthenticatedRequest, res: Response) => {
  const roleId = req.params.id;
  const result = authoritativeAdminStore.deactivateRole(roleId);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'ROLE_DEACTIVATION_FAILED',
      message: result.message,
    });
  }

  res.json({
    success: true,
    role: result.role,
    affectedEmployeesCount: result.affectedEmployeesCount,
    message: result.message,
  });
});

// 5b. Delete dynamic role
adminRouter.delete('/roles/:id', requirePermission('roles.deactivate'), (req: AuthenticatedRequest, res: Response) => {
  const result = authoritativeAdminStore.deleteRole(req.params.id);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'ROLE_DELETE_FAILED', message: result.message });
  }
  res.json({ success: true, message: result.message });
});

// 6. Get employee directory with dynamic permissions summary
adminRouter.get('/employees/list', requirePermission('employees.view'), (req: AuthenticatedRequest, res: Response) => {
  const employees = authoritativeAdminStore.getEmployees();
  const allRoles = authoritativeAdminStore.getRoles();

  const enrichedEmployees = employees.map((emp) => {
    const effectivePerms = calculateEmployeePermissions(emp, allRoles);
    const assignedRoles = allRoles.filter(
      (r) => emp.assignedRoleIds?.includes(r.id) || emp.assignedRoleIds?.includes(r.code) || emp.role === r.code
    );

    return {
      ...emp,
      effectivePermissionsCount: effectivePerms.length,
      assignedRolesDetails: assignedRoles,
    };
  });

  res.json({
    success: true,
    employees: enrichedEmployees,
  });
});

// 7. Create new employee with multi-role assignment
adminRouter.post('/employees/create', requirePermission('employees.create'), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone, designation, department, assignedRoleIds, joiningDate } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'MISSING_FIELDS', message: 'Name and email are required.' });
  }

  const newEmp = authoritativeAdminStore.createEmployee({
    name,
    email,
    phone,
    designation,
    department,
    assignedRoleIds: assignedRoleIds || ['role-order-ops-exec'],
    joiningDate,
    status: 'ACTIVE',
  });

  res.status(201).json({
    success: true,
    employee: newEmp,
    message: `Employee "${newEmp.name}" (${newEmp.employeeCode}) created successfully.`,
  });
});

// 8. Update employee details & role assignments
adminRouter.put('/employees/:id/update', requirePermission('employees.edit'), (req: AuthenticatedRequest, res: Response) => {
  const empId = req.params.id;
  const { name, email, phone, designation, department, assignedRoleIds, customPermissionsOverride, reason } = req.body;

  if (assignedRoleIds && (!reason || reason.trim().length < 5)) {
    return res.status(400).json({
      success: false,
      error: 'REASON_REQUIRED',
      message: 'Role reassignments require an administrative justification reason (min 5 characters).',
    });
  }

  const updated = authoritativeAdminStore.updateEmployee(empId, {
    ...(name && { name }),
    ...(email && { email }),
    ...(phone && { phone }),
    ...(designation && { designation }),
    ...(department && { department }),
    ...(assignedRoleIds && { assignedRoleIds }),
    ...(customPermissionsOverride !== undefined && { customPermissionsOverride }),
  });

  if (!updated) {
    return res.status(404).json({ success: false, error: 'EMPLOYEE_NOT_FOUND', message: 'Employee not found.' });
  }

  res.json({
    success: true,
    employee: updated,
    message: `Employee "${updated.name}" updated successfully.`,
  });
});

// 9. Update employee status (Activate / Deactivate / Suspend)
adminRouter.patch('/employees/:id/status', requirePermission('employees.suspend'), (req: AuthenticatedRequest, res: Response) => {
  const empId = req.params.id;
  const { status, reason } = req.body;

  if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
    return res.status(400).json({ success: false, error: 'INVALID_STATUS', message: 'Status must be ACTIVE, INACTIVE, or SUSPENDED.' });
  }

  if ((status === 'SUSPENDED' || status === 'INACTIVE') && (!reason || reason.trim().length < 5)) {
    return res.status(400).json({
      success: false,
      error: 'JUSTIFICATION_REQUIRED',
      message: 'Deactivating or suspending an employee requires an administrative justification reason.',
    });
  }

  const updated = authoritativeAdminStore.setEmployeeStatus(empId, status, reason);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'EMPLOYEE_NOT_FOUND', message: 'Employee not found.' });
  }

  res.json({
    success: true,
    employee: updated,
    message: `Employee status changed to ${status}.`,
  });
});

// 10. Delete employee record
adminRouter.delete('/employees/:id', requirePermission('employees.suspend'), (req: AuthenticatedRequest, res: Response) => {
  const result = authoritativeAdminStore.deleteEmployee(req.params.id);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'EMPLOYEE_DELETE_FAILED', message: result.message });
  }
  res.json({ success: true, message: result.message });
});


// 1. Current Admin Profile & Permissions
const handleAdminMe = (req: AuthenticatedRequest, res: Response) => {
  const admin = req.admin!;
  const emp = req.employee!;
  const permissions = req.effectivePermissions || [];
  const allRoles = authoritativeAdminStore.getRoles();
  const allEmployees = authoritativeAdminStore.getEmployees();

  res.json({
    success: true,
    user: {
      ...admin,
      status: emp.status,
      assignedRoleIds: emp.assignedRoleIds,
      permissions,
    },
    permissions,
    allAvailableRoles: allRoles,
    allEmployees: allEmployees,
  });
};

adminRouter.get('/me', handleAdminMe);
adminRouter.get('/auth/me', handleAdminMe);
adminRouter.get('/permissions', handleAdminMe);

// 2. Operational Overview Dashboard Metrics
adminRouter.get('/dashboard/metrics', requirePermission('dashboard.view'), (req: AuthenticatedRequest, res: Response) => {
  const cityFilter = (req.query.city as string || 'all').toLowerCase();
  
  let orders = authoritativeAdminStore.orders;
  let sellers = authoritativeAdminStore.sellers;
  let riders = authoritativeAdminStore.riders;
  let products = authoritativeAdminStore.products;

  if (cityFilter !== 'all') {
    orders = orders.filter((o) => (o.cityId || '').toLowerCase() === cityFilter || (o.jobSite.city || '').toLowerCase().includes(cityFilter));
    sellers = sellers.filter((s) => (s.cityId || '').toLowerCase() === cityFilter || (s.address.city || '').toLowerCase().includes(cityFilter));
    riders = riders.filter((r) => (r.cityId || '').toLowerCase() === cityFilter || (r.assignedZoneName || '').toLowerCase().includes(cityFilter));
    products = products.filter((p) => (p.cityId || '').toLowerCase() === cityFilter || !p.cityId);
  }

  const preparingCount = orders.filter((o) => o.status === 'picking').length + (cityFilter === 'all' ? 79 : 8);
  const readyPickupCount = orders.filter((o) => o.status === 'packed').length + (cityFilter === 'all' ? 22 : 3);
  const ridersOnlineCount = riders.filter((r) => r.status === 'ONLINE').length + (cityFilter === 'all' ? 143 : 15);
  const ridersDeliveringCount = riders.filter((r) => r.status === 'ON_DELIVERY').length + (cityFilter === 'all' ? 57 : 6);

  const unassignedOrders = orders.filter((o) => o.status === 'packed' && !o.rider);
  const offlineSellers = sellers.filter((s) => !s.isStoreOnline && s.status === 'ACTIVE');
  const lowStockProducts = products.filter((p) => p.stockCount <= p.minStockAlert);

  const todayGmv = orders.reduce((acc, curr) => acc + (curr.pricing?.total || 0), 0) + (cityFilter === 'all' ? 672450 : 68000);
  const totalGmv = todayGmv;
  const todayOrders = orders.length + (cityFilter === 'all' ? 1342 : 140);

  res.json({
    success: true,
    kpis: {
      todayOrders,
      todayGmv,
      successfulOrders: Math.round(todayOrders * 0.96),
      cancelledOrders: Math.round(todayOrders * 0.025),
      refundsCount: Math.round(todayOrders * 0.01),
      avgDeliverySlaMins: cityFilter === 'all' ? 14.8 : 13.5,
      b2bPercentage: 74.2,
      totalItcClaimed: Math.round(totalGmv * 0.15),
    },
    activeNow: {
      ordersPreparing: preparingCount,
      ordersReadyForPickup: readyPickupCount,
      ridersOnline: ridersOnlineCount,
      ridersDelivering: ridersDeliveringCount,
    },
    alerts: {
      ordersWithoutRider: unassignedOrders.length + (cityFilter === 'all' ? 5 : 1),
      sellersOffline: offlineSellers.length + (cityFilter === 'all' ? 11 : 2),
      paymentIssues: cityFilter === 'all' ? 3 : 1,
      lowStockAlerts: lowStockProducts.length + (cityFilter === 'all' ? 4 : 1),
      criticalList: [
        { id: 'alt-1', type: 'NO_RIDER', message: 'Packed orders awaiting rapid dispatch in high-density hub', severity: 'HIGH', link: '/dispatch' },
        { id: 'alt-2', type: 'SELLER_OFFLINE', message: 'Hardware & electrical merchant depot offline during peak business hours', severity: 'MEDIUM', link: '/sellers' },
        { id: 'alt-3', type: 'LOW_STOCK', message: 'Heavy-duty cables and switchgears below safety buffer in regional hub', severity: 'HIGH', link: '/inventory' },
      ],
    },
    hourlyTrend: [
      { hour: '06 AM', orders: Math.round(todayOrders * 0.03), gmv: Math.round(totalGmv * 0.03) },
      { hour: '07 AM', orders: Math.round(todayOrders * 0.08), gmv: Math.round(totalGmv * 0.08) },
      { hour: '08 AM', orders: Math.round(todayOrders * 0.18), gmv: Math.round(totalGmv * 0.18) },
      { hour: '09 AM', orders: Math.round(todayOrders * 0.23), gmv: Math.round(totalGmv * 0.23) },
      { hour: '10 AM', orders: Math.round(todayOrders * 0.21), gmv: Math.round(totalGmv * 0.21) },
      { hour: '11 AM', orders: Math.round(todayOrders * 0.15), gmv: Math.round(totalGmv * 0.15) },
      { hour: '12 PM', orders: Math.round(todayOrders * 0.12), gmv: Math.round(totalGmv * 0.12) },
    ],
  });
});

// 3. Orders List & Control Center
adminRouter.get('/orders', requirePermission('orders.view'), (req: AuthenticatedRequest, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase();
  const status = req.query.status as string;
  const paymentStatus = req.query.paymentStatus as string;
  const city = (req.query.city as string || 'all').toLowerCase();

  let filtered = [...authoritativeAdminStore.orders];

  if (city !== 'all') {
    filtered = filtered.filter(
      (o) => (o.cityId || '').toLowerCase() === city || (o.jobSite.city || '').toLowerCase().includes(city)
    );
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter((o) => o.status === status);
  }

  if (paymentStatus && paymentStatus !== 'ALL') {
    filtered = filtered.filter((o) => o.payment.status === paymentStatus);
  }

  if (query) {
    filtered = filtered.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customer.name.toLowerCase().includes(query) ||
        o.customer.phone.includes(query) ||
        o.seller.name.toLowerCase().includes(query) ||
        (o.rider && o.rider.name.toLowerCase().includes(query)) ||
        o.jobSite.areaName.toLowerCase().includes(query) ||
        (o.cityName && o.cityName.toLowerCase().includes(query))
    );
  }

  res.json({
    success: true,
    orders: filtered,
    totalCount: filtered.length,
  });
});

// 4. Order Detail
adminRouter.get('/orders/:id', requirePermission('orders.view'), (req: AuthenticatedRequest, res: Response) => {
  const order = authoritativeAdminStore.orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'ORDER_NOT_FOUND' });
  }
  res.json({ success: true, order });
});

// 5. Assign / Re-assign Rider (Dispatch Control)
adminRouter.post('/orders/:id/assign-rider', requirePermission('orders.assign_rider'), (req: AuthenticatedRequest, res: Response) => {
  const { riderId } = req.body;
  const order = authoritativeAdminStore.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'ORDER_NOT_FOUND' });

  const rider = authoritativeAdminStore.riders.find((r) => r.id === riderId);
  if (!rider) return res.status(404).json({ success: false, error: 'RIDER_NOT_FOUND' });

  order.rider = {
    id: rider.id,
    name: rider.name,
    phone: rider.phone,
    vehicle: rider.vehicleNumber,
    rating: rider.rating,
    currentSpeedKmH: 26,
    distanceMeters: 800,
  };
  order.status = 'out_for_delivery';
  rider.status = 'ON_DELIVERY';
  rider.currentOrderId = order.id;

  order.timeline.push({
    stage: 'Rider Assigned (Manual Dispatch)',
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    description: `Manual dispatch override by ${req.admin!.name}: Assigned rider ${rider.name}`,
    completed: true,
  });

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'RIDER_MANUALLY_ASSIGNED',
    targetEntity: 'Order',
    targetId: order.id,
    details: `Assigned rider ${rider.name} (${rider.id}) to order ${order.orderNumber}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, order });
});

// 6. Update Order Status (Force State Transition)
adminRouter.post('/orders/:id/update-status', requirePermission('orders.edit_status'), (req: AuthenticatedRequest, res: Response) => {
  const { status, note } = req.body;
  const order = authoritativeAdminStore.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'ORDER_NOT_FOUND' });

  const previousStatus = order.status;
  order.status = status;

  order.timeline.push({
    stage: `Status Changed: ${status.toUpperCase()}`,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    description: `Admin updated status from ${previousStatus} to ${status}. Note: ${note || 'Manual action'}`,
    completed: true,
  });

  if (status === 'delivered') {
    order.deliveredAt = 'Just now';
    if (order.rider) {
      const rider = authoritativeAdminStore.riders.find((r) => r.id === order.rider!.id);
      if (rider) {
        rider.status = 'ONLINE';
        rider.todayDeliveries += 1;
        rider.todayEarnings += 65;
        rider.currentOrderId = undefined;
      }
    }
  }

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'ORDER_STATUS_TRANSITION',
    targetEntity: 'Order',
    targetId: order.id,
    details: `Transitioned ${order.orderNumber} from ${previousStatus} -> ${status}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, order });
});

// 7. Cancel Order
adminRouter.post('/orders/:id/cancel', requirePermission('orders.cancel'), (req: AuthenticatedRequest, res: Response) => {
  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json({ success: false, error: 'CANCELLATION_REASON_REQUIRED' });
  }

  const order = authoritativeAdminStore.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'ORDER_NOT_FOUND' });

  order.status = 'cancelled';
  order.cancelReason = reason;
  order.cancelledAt = 'Just now';

  // Restore inventory
  for (const item of order.items) {
    const prod = authoritativeAdminStore.products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stockCount += item.quantity;
      prod.inStock = true;
    }
  }

  // If paid, create pending refund
  if (order.payment.status === 'PAID') {
    order.payment.status = 'REFUNDED';
    authoritativeAdminStore.refunds.unshift({
      id: `ref-${Date.now().toString(36)}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      amount: order.pricing.total,
      maxRefundable: order.pricing.total,
      reason: `Order cancelled by Admin: ${reason}`,
      requestedBy: req.admin!.name,
      status: 'APPROVED',
      createdAt: 'Just now',
      approvedBy: req.admin!.name,
      approvedAt: 'Just now',
    });
  }

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'ORDER_CANCELLED',
    targetEntity: 'Order',
    targetId: order.id,
    details: `Cancelled ${order.orderNumber}. Reason: ${reason}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, order });
});

// 8. Sellers Directory & Applications
adminRouter.get('/sellers', requirePermission('sellers.view'), (req: AuthenticatedRequest, res: Response) => {
  const city = (req.query.city as string || 'all').toLowerCase();
  let sellers = authoritativeAdminStore.sellers;
  if (city !== 'all') {
    sellers = sellers.filter((s) => (s.cityId || '').toLowerCase() === city || (s.address.city || '').toLowerCase().includes(city));
  }
  res.json({
    success: true,
    sellers,
  });
});

// 9. Approve Seller Application
adminRouter.post('/sellers/:id/approve', requirePermission('sellers.approve'), (req: AuthenticatedRequest, res: Response) => {
  const seller = authoritativeAdminStore.sellers.find((s) => s.id === req.params.id);
  if (!seller) return res.status(404).json({ success: false, error: 'SELLER_NOT_FOUND' });

  seller.status = 'ACTIVE';
  seller.isStoreOnline = true;
  seller.canReceiveOrders = true;
  seller.isOrderingEnabled = true;
  seller.documents.gstVerified = true;
  seller.documents.panVerified = true;
  seller.documents.bankVerified = true;
  seller.documents.tradeLicenseVerified = true;

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'SELLER_APPLICATION_APPROVED',
    targetEntity: 'Seller',
    targetId: seller.id,
    details: `Approved KYC documents and onboarded ${seller.name}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, seller });
});

// 10. Reject Seller Application
adminRouter.post('/sellers/:id/reject', requirePermission('sellers.approve'), (req: AuthenticatedRequest, res: Response) => {
  const { reason } = req.body;
  const seller = authoritativeAdminStore.sellers.find((s) => s.id === req.params.id);
  if (!seller) return res.status(404).json({ success: false, error: 'SELLER_NOT_FOUND' });

  seller.status = 'REJECTED';
  seller.rejectionReason = reason || 'KYC verification criteria not met';

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'SELLER_APPLICATION_REJECTED',
    targetEntity: 'Seller',
    targetId: seller.id,
    details: `Rejected applicant ${seller.name}. Reason: ${seller.rejectionReason}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, seller });
});

// 11. Toggle Seller Store Controls (Online, Can Receive, Suspend)
adminRouter.post('/sellers/:id/toggle-status', requirePermission('sellers.suspend'), (req: AuthenticatedRequest, res: Response) => {
  const { isStoreOnline, canReceiveOrders, isOrderingEnabled, status } = req.body;
  const seller = authoritativeAdminStore.sellers.find((s) => s.id === req.params.id);
  if (!seller) return res.status(404).json({ success: false, error: 'SELLER_NOT_FOUND' });

  if (typeof isStoreOnline === 'boolean') seller.isStoreOnline = isStoreOnline;
  if (typeof canReceiveOrders === 'boolean') seller.canReceiveOrders = canReceiveOrders;
  if (typeof isOrderingEnabled === 'boolean') seller.isOrderingEnabled = isOrderingEnabled;
  if (status) seller.status = status;

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'SELLER_CONTROLS_MODIFIED',
    targetEntity: 'Seller',
    targetId: seller.id,
    details: `Updated controls for ${seller.name}: Online=${seller.isStoreOnline}, Receive=${seller.canReceiveOrders}, Status=${seller.status}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, seller });
});

// 12. Update Seller Commission
adminRouter.post('/sellers/:id/update-commission', requirePermission('sellers.edit_commission'), (req: AuthenticatedRequest, res: Response) => {
  const { commissionRatePercent } = req.body;
  if (typeof commissionRatePercent !== 'number' || commissionRatePercent < 0 || commissionRatePercent > 50) {
    return res.status(400).json({ success: false, error: 'INVALID_COMMISSION_PERCENT' });
  }

  const seller = authoritativeAdminStore.sellers.find((s) => s.id === req.params.id);
  if (!seller) return res.status(404).json({ success: false, error: 'SELLER_NOT_FOUND' });

  const oldRate = seller.commissionRatePercent;
  seller.commissionRatePercent = commissionRatePercent;

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'SELLER_COMMISSION_ADJUSTED',
    targetEntity: 'Seller',
    targetId: seller.id,
    details: `Changed commission for ${seller.name} from ${oldRate}% to ${commissionRatePercent}%`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, seller });
});

// 13. Riders / Fleet Management
adminRouter.get('/riders', requirePermission('riders.view'), (req: AuthenticatedRequest, res: Response) => {
  const city = (req.query.city as string || 'all').toLowerCase();
  let riders = authoritativeAdminStore.riders;
  if (city !== 'all') {
    riders = riders.filter((r) => (r.cityId || '').toLowerCase() === city || (r.assignedZoneName || '').toLowerCase().includes(city));
  }
  res.json({
    success: true,
    riders,
  });
});

// 14. Approve Rider Application
adminRouter.post('/riders/:id/approve', requirePermission('riders.approve'), (req: AuthenticatedRequest, res: Response) => {
  const rider = authoritativeAdminStore.riders.find((r) => r.id === req.params.id);
  if (!rider) return res.status(404).json({ success: false, error: 'RIDER_NOT_FOUND' });

  rider.status = 'ONLINE';
  rider.documents.drivingLicenseVerified = true;
  rider.documents.rcVerified = true;
  rider.documents.aadharVerified = true;
  rider.documents.backgroundCheckPassed = true;

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'RIDER_APPROVED',
    targetEntity: 'Rider',
    targetId: rider.id,
    details: `Approved fleet onboarding and background check for rider ${rider.name}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, rider });
});

// 15. Broadcast to Riders
adminRouter.post('/riders/broadcast', requirePermission('riders.broadcast'), (req: AuthenticatedRequest, res: Response) => {
  const { message, zoneId, incentiveAmount } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'BROADCAST_MESSAGE_REQUIRED' });

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'FLEET_BROADCAST_SENT',
    targetEntity: 'RiderFleet',
    targetId: zoneId || 'ALL_ZONES',
    details: `Broadcast: "${message}" (Incentive: ₹${incentiveAmount || 0})`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({
    success: true,
    sentCount: authoritativeAdminStore.riders.filter((r) => r.status === 'ONLINE' || r.status === 'ON_DELIVERY').length,
    message: 'Broadcast sent to active riders',
  });
});

// 16. Customers
adminRouter.get('/customers', requirePermission('customers.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    customers: authoritativeAdminStore.customers,
  });
});

// 17. Inventory Management
adminRouter.get('/inventory', requirePermission('inventory.view'), (req: AuthenticatedRequest, res: Response) => {
  const city = (req.query.city as string || 'all').toLowerCase();
  let products = authoritativeAdminStore.products;
  if (city !== 'all') {
    products = products.filter((p) => (p.cityId || '').toLowerCase() === city || !p.cityId);
  }
  res.json({
    success: true,
    products,
  });
});

adminRouter.post('/inventory/:id/adjust-stock', requirePermission('inventory.edit_stock'), (req: AuthenticatedRequest, res: Response) => {
  const { newStockCount, reason } = req.body;
  if (typeof newStockCount !== 'number' || newStockCount < 0) {
    return res.status(400).json({ success: false, error: 'INVALID_STOCK_COUNT' });
  }

  const prod = authoritativeAdminStore.products.find((p) => p.id === req.params.id);
  if (!prod) return res.status(404).json({ success: false, error: 'PRODUCT_NOT_FOUND' });

  const oldStock = prod.stockCount;
  prod.stockCount = newStockCount;
  prod.inStock = newStockCount > 0;

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'INVENTORY_STOCK_ADJUSTED',
    targetEntity: 'Product',
    targetId: prod.id,
    details: `Adjusted ${prod.name} from ${oldStock} -> ${newStockCount} units. Reason: ${reason || 'Physical cycle count'}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, product: prod });
});

// 18. Refunds Desk
adminRouter.get('/refunds', requirePermission('refunds.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    refunds: authoritativeAdminStore.refunds,
  });
});

adminRouter.post('/refunds/create', requirePermission('refunds.create'), (req: AuthenticatedRequest, res: Response) => {
  const { orderId, amount, reason } = req.body;
  const order = authoritativeAdminStore.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!order) return res.status(404).json({ success: false, error: 'ORDER_NOT_FOUND' });

  // Backend authoritative max refundable verification
  const maxRefundable = order.pricing.total;
  if (amount > maxRefundable) {
    return res.status(400).json({
      success: false,
      error: 'EXCEEDS_MAX_REFUNDABLE',
      maxRefundable,
      message: `Requested refund of ₹${amount} exceeds max order total of ₹${maxRefundable}`,
    });
  }

  const newRefund: typeof authoritativeAdminStore.refunds[0] = {
    id: `ref-${Date.now().toString(36)}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    amount,
    maxRefundable,
    reason,
    requestedBy: req.admin!.name,
    status: 'PENDING',
    createdAt: 'Just now',
  };

  authoritativeAdminStore.refunds.unshift(newRefund);

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'REFUND_REQUESTED',
    targetEntity: 'Refund',
    targetId: newRefund.id,
    details: `Created refund request for ₹${amount} on order ${order.orderNumber}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, refund: newRefund });
});

adminRouter.post('/refunds/:id/approve', requirePermission('refunds.approve'), (req: AuthenticatedRequest, res: Response) => {
  const refund = authoritativeAdminStore.refunds.find((r) => r.id === req.params.id);
  if (!refund) return res.status(404).json({ success: false, error: 'REFUND_NOT_FOUND' });

  refund.status = 'COMPLETED';
  refund.approvedBy = req.admin!.name;
  refund.approvedAt = 'Just now';
  refund.transactionId = `REF-UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'REFUND_APPROVED_AND_EXECUTED',
    targetEntity: 'Refund',
    targetId: refund.id,
    details: `Approved payout of ₹${refund.amount} for ${refund.customerName}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, refund });
});

// 19. Seller Settlements
adminRouter.get('/settlements', requirePermission('settlements.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    settlements: authoritativeAdminStore.settlements,
  });
});

adminRouter.post('/settlements/:id/process', requirePermission('settlements.process'), (req: AuthenticatedRequest, res: Response) => {
  const settlement = authoritativeAdminStore.settlements.find((s) => s.id === req.params.id);
  if (!settlement) return res.status(404).json({ success: false, error: 'SETTLEMENT_NOT_FOUND' });

  settlement.status = 'PAID';
  settlement.payoutDate = 'Today (Automated NEFT Batch)';
  settlement.utrNumber = `QCOMSETTL${Date.now().toString(36).toUpperCase()}`;

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'SELLER_PAYOUT_EXECUTED',
    targetEntity: 'Settlement',
    targetId: settlement.id,
    details: `Processed net payable ₹${settlement.netPayable} for ${settlement.sellerName}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, settlement });
});

// 20. Service Areas & Hyperlocal Zones
adminRouter.get('/service-areas', requirePermission('service_areas.view'), (req: AuthenticatedRequest, res: Response) => {
  const city = (req.query.city as string || 'all').toLowerCase();
  let zones = authoritativeAdminStore.serviceAreas;
  if (city !== 'all') {
    zones = zones.filter((z) => (z.cityId || '').toLowerCase() === city);
  }
  res.json({
    success: true,
    zones,
  });
});

adminRouter.post('/service-areas', requirePermission('service_areas.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { name, cityId, hubLocation, serviceableRadiusKm, baseSlaMins, surgeMultiplier } = req.body;
  if (!name || !cityId) {
    return res.status(400).json({ success: false, error: 'NAME_AND_CITY_REQUIRED' });
  }

  const city = authoritativeAdminStore.cities.find((c) => c.id === cityId);
  const newZone = {
    id: `zone-${Date.now().toString(36)}`,
    name,
    cityId,
    cityName: city ? city.name : 'Regional Zone',
    state: city ? city.state : 'India',
    region: city ? city.region : 'North',
    hubLocation: hubLocation || `${name} Quick Hub`,
    activeRidersCount: 12,
    activeOrdersCount: 4,
    avgSlaMins: baseSlaMins || 15,
    surgeMultiplier: surgeMultiplier || 1.0,
    isActive: true,
    serviceableRadiusKm: serviceableRadiusKm || 6.5,
  };

  authoritativeAdminStore.serviceAreas.push(newZone);

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'SERVICE_ZONE_CREATED',
    targetEntity: 'ServiceAreaZone',
    targetId: newZone.id,
    details: `Created new zone '${newZone.name}' in ${newZone.cityName} (${newZone.state})`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, zone: newZone });
});

adminRouter.post('/service-areas/:id/toggle', requirePermission('service_areas.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { isActive, surgeMultiplier } = req.body;
  const zone = authoritativeAdminStore.serviceAreas.find((z) => z.id === req.params.id);
  if (!zone) return res.status(404).json({ success: false, error: 'ZONE_NOT_FOUND' });

  if (typeof isActive === 'boolean') zone.isActive = isActive;
  if (typeof surgeMultiplier === 'number') zone.surgeMultiplier = surgeMultiplier;

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'SERVICE_ZONE_MODIFIED',
    targetEntity: 'ServiceAreaZone',
    targetId: zone.id,
    details: `Updated ${zone.name}: Active=${zone.isActive}, Surge=${zone.surgeMultiplier}x`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, zone });
});

// 20b. Indian Cities & Regional Expansion Control
adminRouter.get('/cities', requirePermission('service_areas.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    cities: authoritativeAdminStore.cities,
  });
});

adminRouter.post('/cities', requirePermission('service_areas.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { name, state, region, tier, code } = req.body;
  if (!name || !state || !region) {
    return res.status(400).json({ success: false, error: 'NAME_STATE_REGION_REQUIRED' });
  }

  const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const existing = authoritativeAdminStore.cities.find((c) => c.id === id);
  if (existing) {
    return res.status(400).json({ success: false, error: 'CITY_ALREADY_EXISTS' });
  }

  const newCity = {
    id,
    name,
    state,
    region: region || 'North',
    tier: tier || 'Tier 2',
    code: code || name.substring(0, 3).toUpperCase(),
    isActive: true,
    operationalMode: 'PILOT' as const,
    activePartnerStores: 1,
    activeContractorsCount: 50,
    dailyGmvTarget: 150000,
    surgeMultiplier: 1.0,
    minOrderValue: 249,
    baseDeliveryFee: 39,
  };

  authoritativeAdminStore.cities.push(newCity);

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'INDIAN_CITY_EXPANSION_LAUNCHED',
    targetEntity: 'IndianCityConfig',
    targetId: newCity.id,
    details: `Launched new territory ${newCity.name}, ${newCity.state} (${newCity.region} India) in PILOT mode`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, city: newCity });
});

adminRouter.post('/cities/:id/toggle', requirePermission('service_areas.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { isActive, operationalMode } = req.body;
  const city = authoritativeAdminStore.cities.find((c) => c.id === req.params.id);
  if (!city) return res.status(404).json({ success: false, error: 'CITY_NOT_FOUND' });

  if (typeof isActive === 'boolean') city.isActive = isActive;
  if (operationalMode) city.operationalMode = operationalMode;

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'CITY_STATUS_UPDATED',
    targetEntity: 'IndianCityConfig',
    targetId: city.id,
    details: `Updated ${city.name} (${city.state}): Active=${city.isActive}, Mode=${city.operationalMode}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, city });
});

adminRouter.post('/cities/:id/config', requirePermission('service_areas.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { minOrderValue, baseDeliveryFee, surgeMultiplier, operationalMode, dailyGmvTarget } = req.body;
  const city = authoritativeAdminStore.cities.find((c) => c.id === req.params.id);
  if (!city) return res.status(404).json({ success: false, error: 'CITY_NOT_FOUND' });

  if (typeof minOrderValue === 'number') city.minOrderValue = minOrderValue;
  if (typeof baseDeliveryFee === 'number') city.baseDeliveryFee = baseDeliveryFee;
  if (typeof surgeMultiplier === 'number') city.surgeMultiplier = surgeMultiplier;
  if (typeof dailyGmvTarget === 'number') city.dailyGmvTarget = dailyGmvTarget;
  if (operationalMode) city.operationalMode = operationalMode;

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'CITY_ECONOMICS_CONFIG_UPDATED',
    targetEntity: 'IndianCityConfig',
    targetId: city.id,
    details: `Updated parameters for ${city.name}: MinOrder=₹${city.minOrderValue}, BaseFee=₹${city.baseDeliveryFee}, Surge=${city.surgeMultiplier}x`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, city });
});

// 21. Pricing Configuration
adminRouter.get('/pricing', requirePermission('pricing.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    pricing: authoritativeAdminStore.pricingConfig,
  });
});

adminRouter.post('/pricing/update', requirePermission('pricing.manage'), (req: AuthenticatedRequest, res: Response) => {
  const newConfig = req.body;
  authoritativeAdminStore.pricingConfig = {
    ...authoritativeAdminStore.pricingConfig,
    ...newConfig,
  };

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'PRICING_ECONOMICS_CONFIG_UPDATED',
    targetEntity: 'PricingConfig',
    targetId: 'GLOBAL_CONFIG',
    details: `Updated parameters: Free Threshold=₹${authoritativeAdminStore.pricingConfig.freeDeliveryThreshold}, Base Fee=₹${authoritativeAdminStore.pricingConfig.baseDeliveryFee}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({
    success: true,
    pricing: authoritativeAdminStore.pricingConfig,
  });
});

// 22. Audit Logs
adminRouter.get('/audit-logs', requirePermission('audit.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    logs: authoritativeAdminStore.auditLogs,
  });
});

// 23. Support Desk
adminRouter.get('/support/tickets', requirePermission('support.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    tickets: authoritativeAdminStore.supportTickets,
  });
});

adminRouter.post('/support/tickets/:id/resolve', requirePermission('support.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { resolutionNotes } = req.body;
  const ticket = authoritativeAdminStore.supportTickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ success: false, error: 'TICKET_NOT_FOUND' });

  ticket.status = 'RESOLVED';
  ticket.resolutionNotes = resolutionNotes || 'Resolved by Contractor Support Specialist';

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'SUPPORT_TICKET_RESOLVED',
    targetEntity: 'SupportTicket',
    targetId: ticket.id,
    details: `Resolved ticket ${ticket.ticketNumber} for customer ${ticket.customerName}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, ticket });
});

// ==================== 24. PROMOTIONS & COUPONS MATRIX ====================
adminRouter.get('/promotions', requirePermission('promotions.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    promotions: authoritativeAdminStore.promotions,
  });
});

adminRouter.post('/promotions/create', requirePermission('promotions.create'), (req: AuthenticatedRequest, res: Response) => {
  const { code, name, type, discountValue, isPercentage, minOrderValue, maxDiscountCap, fundingSource, fundingSharePercent, applicableBrand, applicableCategory, validUntil } = req.body;

  if (!code || !name || !discountValue) {
    return res.status(400).json({ success: false, error: 'MISSING_PROMOTION_FIELDS' });
  }

  const newPromo = {
    id: `prm-${Date.now().toString(36)}`,
    code: code.toUpperCase().trim(),
    name,
    type: type || 'COUPON',
    discountValue: Number(discountValue),
    isPercentage: Boolean(isPercentage),
    minOrderValue: Number(minOrderValue) || 0,
    maxDiscountCap: Number(maxDiscountCap) || 500,
    fundingSource: fundingSource || 'PLATFORM',
    fundingSharePercent: fundingSharePercent || { platform: 100, seller: 0, brand: 0 },
    applicableBrand,
    applicableCategory,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: validUntil || '2026-12-31',
    usageCount: 0,
    maxUsageLimit: 1000,
    status: 'ACTIVE' as const,
    createdBy: `${req.admin!.name} (${req.admin!.roleTitle})`,
  };

  authoritativeAdminStore.promotions.unshift(newPromo);

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'PROMOTION_COUPON_CREATED',
    targetEntity: 'AdminPromotion',
    targetId: newPromo.id,
    details: `Created promo coupon '${newPromo.code}' funded by ${newPromo.fundingSource}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, promotion: newPromo });
});

adminRouter.post('/promotions/:id/toggle', requirePermission('promotions.create'), (req: AuthenticatedRequest, res: Response) => {
  const promo = authoritativeAdminStore.promotions.find((p) => p.id === req.params.id);
  if (!promo) return res.status(404).json({ success: false, error: 'PROMOTION_NOT_FOUND' });

  promo.status = promo.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'PROMOTION_STATUS_TOGGLED',
    targetEntity: 'AdminPromotion',
    targetId: promo.id,
    details: `Toggled status of coupon '${promo.code}' to ${promo.status}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, promotion: promo });
});

// ==================== 25. SPONSORED ADS & RETAIL MEDIA ENGINE ====================
adminRouter.get('/ads/campaigns', requirePermission('ads.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    campaigns: authoritativeAdminStore.sponsoredAds,
  });
});

adminRouter.post('/ads/campaigns/create', requirePermission('ads.create'), (req: AuthenticatedRequest, res: Response) => {
  const { campaignName, advertiserBrand, brandContactEmail, placement, startDate, endDate, totalBudget, billingMethod, cpmRate, cpcRate, targetGeography, targetCategory, creativeUrl, headline, ctaText } = req.body;

  if (!campaignName || !advertiserBrand || !placement) {
    return res.status(400).json({ success: false, error: 'MISSING_AD_FIELDS' });
  }

  const newCampaign = {
    id: `ad-${Date.now().toString(36)}`,
    campaignName,
    advertiserBrand,
    brandContactEmail: brandContactEmail || `${advertiserBrand.toLowerCase().replace(/\s+/g, '')}@brand.in`,
    placement,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '2026-10-31',
    totalBudget: Number(totalBudget) || 100000,
    spentBudget: 0,
    billingMethod: billingMethod || 'CPM',
    cpmRate: Number(cpmRate) || 100,
    cpcRate: Number(cpcRate) || 10,
    targetGeography: targetGeography || 'Pan-India',
    targetCategory,
    creativeUrl: creativeUrl || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&auto=format&fit=crop&q=80',
    headline: headline || `${advertiserBrand} Authorized Range`,
    ctaText: ctaText || 'Shop Now',
    priorityScore: 80,
    status: 'PENDING_APPROVAL' as const,
    approvalWorkflow: {
      createdBy: `${req.admin!.name} (${req.admin!.roleTitle})`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      currentStage: 'MANAGER_REVIEW' as const,
    },
    analytics: {
      impressions: 0,
      clicks: 0,
      ctrPercent: 0,
      productViews: 0,
      addToCarts: 0,
      attributableOrders: 0,
      attributableRevenue: 0,
      roasMultiplier: 0,
    },
  };

  authoritativeAdminStore.sponsoredAds.unshift(newCampaign);

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'SPONSORED_AD_CAMPAIGN_SUBMITTED',
    targetEntity: 'SponsoredAdCampaign',
    targetId: newCampaign.id,
    details: `Created Retail Media ad campaign '${newCampaign.campaignName}' for brand ${newCampaign.advertiserBrand}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, campaign: newCampaign });
});

adminRouter.post('/ads/campaigns/:id/approve', requirePermission('ads.approve'), (req: AuthenticatedRequest, res: Response) => {
  const campaign = authoritativeAdminStore.sponsoredAds.find((c) => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ success: false, error: 'CAMPAIGN_NOT_FOUND' });

  campaign.status = 'LIVE';
  campaign.approvalWorkflow.superAdminApprovedBy = `${req.admin!.name} (${req.admin!.roleTitle})`;
  campaign.approvalWorkflow.currentStage = 'LIVE';

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'SPONSORED_AD_APPROVED_LIVE',
    targetEntity: 'SponsoredAdCampaign',
    targetId: campaign.id,
    details: `Approved & published Retail Media ad campaign '${campaign.campaignName}' for ${campaign.advertiserBrand}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, campaign });
});

adminRouter.post('/ads/campaigns/:id/toggle', requirePermission('ads.publish'), (req: AuthenticatedRequest, res: Response) => {
  const campaign = authoritativeAdminStore.sponsoredAds.find((c) => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ success: false, error: 'CAMPAIGN_NOT_FOUND' });

  campaign.status = campaign.status === 'LIVE' ? 'PAUSED' : 'LIVE';

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'SPONSORED_AD_STATUS_TOGGLED',
    targetEntity: 'SponsoredAdCampaign',
    targetId: campaign.id,
    details: `Toggled status of campaign '${campaign.campaignName}' to ${campaign.status}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, campaign });
});

// ==================== 26. CMS CONTENT & BANNER MANAGEMENT ====================
adminRouter.get('/cms/banners', requirePermission('cms.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    banners: authoritativeAdminStore.cmsBanners,
    collections: authoritativeAdminStore.cmsCollections,
  });
});

adminRouter.post('/cms/banners/create', requirePermission('cms.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { title, subtitle, imageUrl, targetScreen, cityScope } = req.body;
  if (!title || !imageUrl) {
    return res.status(400).json({ success: false, error: 'TITLE_AND_IMAGE_REQUIRED' });
  }

  const newBanner = {
    id: `cms-ban-${Date.now().toString(36)}`,
    title,
    subtitle: subtitle || 'Limited time offer for verified trade contractors',
    imageUrl,
    targetScreen: targetScreen || 'HOME_EXPLORE',
    cityScope: cityScope || 'all',
    priority: 1,
    isActive: true,
    validUntil: '2026-12-31',
  };

  authoritativeAdminStore.cmsBanners.unshift(newBanner);

  authoritativeAdminStore.logAudit({
    adminId: req.admin!.id,
    adminName: req.admin!.name,
    adminRole: req.admin!.role,
    action: 'CMS_BANNER_CREATED',
    targetEntity: 'CmsHeroBanner',
    targetId: newBanner.id,
    details: `Created CMS hero banner '${newBanner.title}'`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, banner: newBanner });
});

// ==================== 28. REPORTS & ANALYTICS SUMMARY ====================
adminRouter.get('/reports/summary', requirePermission('reports.view'), (req: AuthenticatedRequest, res: Response) => {
  const city = (req.query.city as string || 'all').toLowerCase();
  
  res.json({
    success: true,
    summary: {
      financials: {
        totalGmv: 48290000,
        platformCommissionRevenue: 4346100,
        deliveryFeeRevenue: 1240000,
        retailMediaAdRevenue: 898000,
        totalRefundsProcessed: 482000,
        netPlatformProfit: 6002100,
      },
      operationalSla: {
        avgDispatchTimeMins: 3.2,
        avgRiderPickupMins: 4.1,
        avgDoorstepDeliveryMins: 14.8,
        slaCompliancePercent: 97.4,
      },
      retailMediaMetrics: {
        totalActiveCampaigns: authoritativeAdminStore.sponsoredAds.filter((a) => a.status === 'LIVE').length,
        totalImpressions: 1913333,
        totalClicks: 65233,
        avgRoas: 7.55,
      },
    },
  });
});
