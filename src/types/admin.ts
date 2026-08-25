export interface IndianCityConfig {
  id: string;
  name: string;
  state: string;
  region: 'North' | 'South' | 'West' | 'East' | 'Central';
  tier?: string;
  code?: string;
  stateGstPrefix?: string;
  status?: 'ACTIVE' | 'LAUNCHING_SOON' | 'PAUSED' | 'MAINTENANCE';
  isActive?: boolean;
  operationalMode?: 'PILOT' | 'GROWTH' | 'HYPER_SCALE' | 'MAINTENANCE';
  totalZones?: number;
  activeZones?: number;
  activePartnerStores?: number;
  activeContractorsCount?: number;
  activeRiders?: number;
  dailyGmvTarget?: number;
  avgDeliverySlaMins?: number;
  surgeMultiplier?: number;
  defaultSurgeMultiplier?: number;
  baseDeliveryFee: number;
  freeDeliveryThreshold?: number;
  minOrderValue: number;
}

export type AdminRole = 
  | 'SUPER_ADMIN'
  | 'OPERATIONS_ADMIN'
  | 'SELLER_MANAGER'
  | 'DELIVERY_MANAGER'
  | 'FINANCE_ADMIN'
  | 'CUSTOMER_SUPPORT'
  | 'MARKETING_ADMIN'
  | 'ANALYST'
  | string; // Support dynamic role codes

export type AdminPermission =
  // Dashboard & System Settings
  | 'dashboard.view'
  | 'settings.view'
  | 'settings.edit'
  | 'settings.manage'
  // Orders
  | 'orders.view'
  | 'orders.create'
  | 'orders.edit'
  | 'orders.cancel'
  | 'orders.refund'
  | 'orders.export'
  | 'orders.assign_rider'
  | 'orders.update_status'
  | 'orders.edit_status'
  // Customers
  | 'customers.view'
  | 'customers.edit'
  | 'customers.suspend'
  | 'customers.reactivate'
  | 'customers.export'
  | 'customers.edit_status'
  | 'customers.view_sensitive'
  // Sellers
  | 'sellers.view'
  | 'sellers.create'
  | 'sellers.edit'
  | 'sellers.approve'
  | 'sellers.reject'
  | 'sellers.suspend'
  | 'sellers.reactivate'
  | 'sellers.export'
  | 'sellers.edit_commission'
  // Products & Catalogue
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'products.approve'
  | 'products.disable'
  | 'products.export'
  | 'categories.view'
  | 'categories.create'
  | 'categories.edit'
  | 'categories.delete'
  | 'brands.view'
  | 'brands.create'
  | 'brands.edit'
  | 'brands.delete'
  | 'inventory.view'
  | 'inventory.edit_stock'
  | 'inventory.edit_price'
  // Riders & Fleet
  | 'riders.view'
  | 'riders.create'
  | 'riders.edit'
  | 'riders.approve'
  | 'riders.suspend'
  | 'riders.reactivate'
  | 'riders.assign'
  | 'riders.view_location'
  | 'riders.broadcast'
  | 'riders.export'
  // Delivery Operations
  | 'delivery.view'
  | 'delivery.assign_rider'
  | 'delivery.reassign_rider'
  | 'delivery.view_live_map'
  | 'delivery.view_eta'
  | 'delivery.manage_exception'
  | 'service_areas.view'
  | 'service_areas.manage'
  // Payments & Financial Settlements
  | 'payments.view'
  | 'payments.export'
  | 'payments.refund'
  | 'payments.approve_refund'
  | 'payments.reconcile'
  | 'refunds.view'
  | 'refunds.create'
  | 'refunds.approve'
  | 'settlements.view'
  | 'settlements.create'
  | 'settlements.process'
  | 'settlements.approve'
  | 'settlements.export'
  | 'pricing.view'
  | 'pricing.manage'
  // Promotions & Marketing
  | 'promotions.view'
  | 'promotions.create'
  | 'promotions.edit'
  | 'promotions.approve'
  | 'promotions.publish'
  | 'promotions.pause'
  | 'promotions.delete'
  // Sponsored Ads Engine
  | 'ads.view'
  | 'ads.create'
  | 'ads.edit'
  | 'ads.approve'
  | 'ads.publish'
  | 'ads.pause'
  | 'ads.delete'
  | 'ads.export'
  | 'ads.view_analytics'
  // CMS Content
  | 'cms.view'
  | 'cms.manage'
  // Support Desk
  | 'support.view'
  | 'support.create_ticket'
  | 'support.update_ticket'
  | 'support.resolve_ticket'
  | 'support.issue_refund'
  | 'support.manage'
  // Reports & Business Analytics
  | 'reports.view'
  | 'reports.export'
  | 'reports.financial'
  | 'reports.operations'
  | 'reports.seller'
  | 'reports.rider'
  | 'reports.customer'
  | 'reports.marketing'
  // Employee Management
  | 'employees.view'
  | 'employees.create'
  | 'employees.edit'
  | 'employees.activate'
  | 'employees.deactivate'
  | 'employees.suspend'
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  // Dynamic Roles & Permissions Management
  | 'roles.view'
  | 'roles.create'
  | 'roles.edit'
  | 'roles.deactivate'
  | 'roles.assign'
  | 'roles.manage'
  | 'permissions.view'
  | 'permissions.assign'
  // Security Audit Logs
  | 'audit.view'
  | 'audit_logs.view'
  | 'audit_logs.export';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleTitle: string;
  avatar: string;
  department: string;
  lastLogin: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export type OrderStatus =
  | 'placed'
  | 'picking'
  | 'packed'
  | 'out_for_delivery'
  | 'arriving'
  | 'delivered'
  | 'cancelled';

export interface AdminOrderItem {
  productId: string;
  productName: string;
  brand: string;
  category: string;
  unit: string;
  price: number;
  quantity: number;
  hsnCode?: string;
  gstRate?: number;
  image?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  cityId?: string;
  cityName?: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    accountType: 'electrician' | 'plumber' | 'contractor' | 'individual';
    businessName?: string;
    gstin?: string;
  };
  jobSite: {
    address: string;
    city?: string;
    landmark?: string;
    gateCode?: string;
    contactPhone?: string;
    coordinates?: { lat: number; lng: number };
    areaName: string;
  };
  seller: {
    id: string;
    name: string;
    hubType: string;
    phone: string;
    address: string;
    gstin: string;
    coordinates?: { lat: number; lng: number };
  };
  rider?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    currentSpeedKmH?: number;
    distanceMeters?: number;
  };
  items: AdminOrderItem[];
  pricing: {
    subtotal: number;
    deliveryFee: number;
    urgencyFee: number;
    discount: number;
    couponCode?: string;
    tax: number;
    total: number;
    itcAmount: number;
  };
  payment: {
    status: 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED' | 'PARTIALLY_REFUNDED';
    method: 'UPI' | 'CARD' | 'NETBANKING' | 'TRADE_CREDIT' | 'PAY_ON_JOBSITE';
    transactionId?: string;
    paidAt?: string;
  };
  status: OrderStatus;
  deliveryOtp: string;
  placedAt: string;
  estimatedDeliveryAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  timeline: {
    stage: string;
    timestamp: string;
    description: string;
    completed: boolean;
  }[];
}

export interface AdminSeller {
  id: string;
  name: string;
  ownerName: string;
  hubType: string;
  phone: string;
  email: string;
  address: any;
  cityId?: string;
  areaName: string;
  gstin: string;
  panNumber: string;
  bankAccount: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'SUSPENDED';
  isStoreOnline: boolean;
  canReceiveOrders: boolean;
  isOrderingEnabled: boolean;
  commissionRatePercent: number;
  rating: number;
  totalOrders: number;
  activeOrdersCount: number;
  avgPrepTimeMins: number;
  slaAdherencePercent: number;
  joinedDate: string;
  rejectionReason?: string;
  documents: {
    gstVerified: boolean;
    panVerified: boolean;
    bankVerified: boolean;
    tradeLicenseVerified: boolean;
  };
}

export interface AdminRider {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  cityId?: string;
  assignedZoneName?: string;
  vehicleType: 'EV_SCOOTER' | 'BIKE' | 'E_LOADER';
  vehicleNumber: string;
  status: 'ONLINE' | 'ON_DELIVERY' | 'OFFLINE' | 'SUSPENDED' | 'PENDING_APPROVAL';
  currentLocation?: {
    lat: number;
    lng: number;
    areaName: string;
  };
  currentOrderId?: string;
  batteryPercent?: number;
  rating: number;
  totalDeliveries: number;
  todayDeliveries: number;
  todayEarnings: number;
  activeSince: string;
  documents: {
    drivingLicenseVerified: boolean;
    rcVerified: boolean;
    aadharVerified: boolean;
    backgroundCheckPassed: boolean;
  };
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  accountType: 'contractor' | 'electrician' | 'plumber' | 'individual';
  companyName?: string;
  status: 'ACTIVE' | 'FLAGGED' | 'SUSPENDED';
  totalOrders: number;
  totalSpend: number;
  savedGstins: {
    gstin: string;
    legalName: string;
    state: string;
  }[];
  addresses: {
    label: string;
    address: string;
    areaName: string;
    landmark?: string;
  }[];
  createdAt: string;
  lastActive: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  mrp: number;
  unit: string;
  stockCount: number;
  minStockAlert: number;
  hsnCode: string;
  gstRatePercent: number;
  inStock: boolean;
  cityId?: string;
  sellerId: string;
  sellerName: string;
  rating: number;
  image?: string;
}

export interface AdminRefund {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  maxRefundable: number;
  reason: string;
  requestedBy: string;
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  transactionId?: string;
}

export interface AdminSettlement {
  id: string;
  sellerId: string;
  sellerName: string;
  periodStart: string;
  periodEnd: string;
  grossSales: number;
  commissionDeducted: number;
  refundsAdjusted: number;
  tdsDeducted: number;
  netPayable: number;
  status: 'PENDING' | 'PROCESSED' | 'PAID' | 'ON_HOLD';
  payoutDate?: string;
  utrNumber?: string;
}

export interface ServiceAreaZone {
  id: string;
  name: string;
  cityId?: string;
  cityName?: string;
  city?: string;
  state?: string;
  region?: 'North' | 'South' | 'West' | 'East' | 'Central';
  pincode?: string;
  coordinates?: { lat: number; lng: number };
  radiusKm?: number;
  serviceableRadiusKm?: number;
  hubLocation?: any;
  activeOrdersCount?: number;
  avgSlaMins?: number;
  isActive: boolean;
  minOrderValue?: number;
  baseDeliveryFee?: number;
  freeDeliveryThreshold?: number;
  operatingHours?: string;
  activeSellersCount?: number;
  partnerStoresCount?: number;
  activeRidersCount: number;
  surgeMultiplier: number;
}
export type AdminServiceArea = ServiceAreaZone;

export interface PricingConfig {
  freeDeliveryThreshold: number;
  baseDeliveryFee: number;
  platformFee: number;
  urgencyFee?: number;
  urgencyHandlingFee?: number;
  defaultCommissionPercent?: number;
  defaultSellerCommissionPercent?: number;
  riderBasePay?: number;
  riderBasePayout?: number;
  riderPerKmPay?: number;
  riderPerKmPayout?: number;
  isSurgeActive?: boolean;
  surgeActive?: boolean;
  surgeMultiplier?: number;
}
export type AdminPricingConfig = PricingConfig;

export interface AuditLogEntry {
  id: string;
  adminId?: string;
  adminName?: string;
  adminRole?: string;
  actorName?: string;
  actorRole?: string;
  actionType?: string;
  targetModule?: string;
  summary?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action?: string;
  targetEntity?: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
  timestamp: string;
  status?: 'SUCCESS' | 'DENIED' | 'FAILED';
}
export type AdminAuditLog = AuditLogEntry;

export interface SupportTicket {
  id: string;
  ticketNumber?: string;
  raisedByName?: string;
  raisedByType?: string;
  customerName?: string;
  customerPhone?: string;
  orderNumber?: string;
  orderId?: string;
  category?: 'DELIVERY_DELAY' | 'DAMAGED_ITEM' | 'INCORRECT_PART' | 'PAYMENT_ISSUE' | 'GENERAL';
  priority: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  subject: string;
  description: string;
  assignedTo?: string;
  createdAt: string;
  resolutionNote?: string;
  resolutionNotes?: string;
}
export type AdminSupportTicket = SupportTicket;

// ==================== PROMOTIONS & FUNDING MATRIX ====================
export type PromotionFundingSource = 'PLATFORM' | 'SELLER' | 'BRAND' | 'SHARED';
export type PromotionType = 'COUPON' | 'PERCENTAGE_DISCOUNT' | 'FLAT_DISCOUNT' | 'FREE_DELIVERY' | 'FIRST_ORDER' | 'SELLER_OFFER' | 'BRAND_OFFER';

export interface AdminPromotion {
  id: string;
  code: string;
  name: string;
  type: PromotionType;
  discountValue: number; // e.g., 50 (flat) or 15 (%)
  isPercentage: boolean;
  minOrderValue: number;
  maxDiscountCap: number;
  fundingSource: PromotionFundingSource;
  fundingSharePercent?: {
    platform: number;
    seller: number;
    brand: number;
  };
  applicableCategory?: string;
  applicableBrand?: string;
  validFrom: string;
  validUntil: string;
  usageCount: number;
  maxUsageLimit: number;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'PAUSED';
  createdBy: string;
}

// ==================== SPONSORED ADS & RETAIL MEDIA ENGINE ====================
export type AdPlacement = 
  | 'HOME_TOP_BANNER'
  | 'HOME_SECOND_BANNER'
  | 'HOME_CATEGORY_BANNER'
  | 'CATEGORY_TOP_BANNER'
  | 'SEARCH_TOP_SPONSORED'
  | 'SEARCH_PRODUCT_SPONSORED'
  | 'PRODUCT_PAGE_SPONSORED'
  | 'PRODUCT_LIST_SPONSORED'
  | 'CHECKOUT_PROMOTION';

export type AdCampaignStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'LIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'REJECTED';

export interface SponsoredAdCampaign {
  id: string;
  campaignName: string;
  advertiserBrand: string;
  brandContactEmail?: string;
  placement: AdPlacement;
  startDate: string;
  endDate: string;
  totalBudget: number;
  spentBudget: number;
  billingMethod: 'CPM' | 'CPC' | 'FIXED';
  cpmRate?: number; // Cost per 1k impressions
  cpcRate?: number; // Cost per click
  targetGeography: string; // e.g. 'Bengaluru', 'All Hubs'
  targetCategory?: string;
  creativeUrl: string;
  headline: string;
  ctaText: string;
  targetProductId?: string;
  priorityScore: number; // Higher priority gets served first
  status: AdCampaignStatus;
  rejectionReason?: string;
  approvalWorkflow: {
    createdBy: string;
    createdAt: string;
    managerReviewedBy?: string;
    financeApprovedBy?: string;
    superAdminApprovedBy?: string;
    currentStage: 'MARKETING_SUBMITTED' | 'MANAGER_REVIEW' | 'FINANCE_REVIEW' | 'FINAL_APPROVED' | 'LIVE';
  };
  analytics: {
    impressions: number;
    clicks: number;
    ctrPercent: number;
    productViews: number;
    addToCarts: number;
    attributableOrders: number;
    attributableRevenue: number;
    roasMultiplier: number; // Return On Ad Spend (e.g., 6.4x)
  };
}

// ==================== CONTENT & CMS MANAGEMENT ====================
export interface CmsHeroBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  targetScreen: string;
  cityScope: string;
  priority: number;
  isActive: boolean;
  validUntil: string;
}

export interface CmsCuratedCollection {
  id: string;
  title: string;
  slug: string;
  bannerBgColor: string;
  productIds: string[];
  cityScope: string;
  isActive: boolean;
}

// ==================== EMPLOYEES & ROLE MANAGEMENT ====================
export interface AdminRoleDefinition {
  id: string; // e.g., 'role-super-admin', 'role-ops-mgr', 'role-city-ops-101'
  code: string; // e.g., 'SUPER_ADMIN', 'OPERATIONS_MANAGER', 'CITY_OPS_MGR'
  name: string; // e.g., 'Main Admin / Super Admin', 'City Operations Manager'
  department: string; // e.g., 'Executive Leadership', 'Operations', 'Finance'
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  isSystemRole?: boolean;
  permissions: AdminPermission[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminEmployeeUser {
  id: string; // Employee ID e.g. EMP-1001
  employeeCode?: string;
  name: string;
  email: string;
  phone: string;
  designation?: string;
  role: AdminRole; // Primary role code for backwards compatibility
  roleTitle: string;
  department: string;
  avatar: string;
  assignedRoleIds: string[]; // Dynamic multiple assigned role IDs
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  joiningDate?: string;
  lastLogin: string;
  customPermissionsOverride?: AdminPermission[];
  createdAt: string;
  mfaEnabled?: boolean;
}

export interface ProtectedRoleChangePayload {
  targetUserId: string;
  newRole?: AdminRole;
  roleIds?: string[];
  reason: string;
}
