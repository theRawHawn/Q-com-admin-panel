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
  | 'ANALYST';

export type AdminPermission =
  | 'dashboard.view'
  | 'orders.view'
  | 'orders.edit_status'
  | 'orders.cancel'
  | 'orders.assign_rider'
  | 'sellers.view'
  | 'sellers.approve'
  | 'sellers.suspend'
  | 'sellers.edit_commission'
  | 'riders.view'
  | 'riders.approve'
  | 'riders.suspend'
  | 'riders.broadcast'
  | 'customers.view'
  | 'customers.edit_status'
  | 'customers.view_sensitive'
  | 'inventory.view'
  | 'inventory.edit_stock'
  | 'inventory.edit_price'
  | 'payments.view'
  | 'payments.reconcile'
  | 'refunds.view'
  | 'refunds.create'
  | 'refunds.approve'
  | 'settlements.view'
  | 'settlements.process'
  | 'pricing.view'
  | 'pricing.manage'
  | 'service_areas.view'
  | 'service_areas.manage'
  | 'audit.view'
  | 'support.view'
  | 'support.manage'
  | 'settings.manage';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleTitle: string;
  avatar: string;
  department: string;
  lastLogin: string;
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
  adminId: string;
  adminName?: string;
  adminRole: string;
  action: string;
  targetEntity: string;
  targetId?: string;
  details: any;
  ipAddress: string;
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
