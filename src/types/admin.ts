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
  | 'riders.payout'
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
  itemStatus?: 'FULFILLED' | 'OUT_OF_STOCK' | 'SUBSTITUTED' | 'REMOVED';
  originalProductName?: string;
  substitutionNote?: string;
}

export interface AdminOrderNote {
  id: string;
  author: string;
  role: string;
  text: string;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  cityId?: string;
  cityName?: string;
  priority?: 'NORMAL' | 'HIGH' | 'CRITICAL_SITE';
  isHold?: boolean;
  holdReason?: string;
  tags?: string[];
  notes?: AdminOrderNote[];
  customer: {
    id: string;
    name: string;
    phone: string;
    accountType: 'electrician' | 'plumber' | 'contractor' | 'individual';
    businessName?: string;
    gstin?: string;
  };
  deliveryLocation: {
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
    method: 'UPI' | 'CARD' | 'NETBANKING' | 'TRADE_CREDIT' | 'PAY_ON_DELIVERY';
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

export const NON_FOOD_GROCERY_CATEGORIES = [
  'Electrical & Lighting',
  'Hardware & Fasteners',
  'Power Tools & Equipment',
  'Plumbing & Sanitaryware',
  'Electronics & IT Gadgets',
  'Mobile & Accessories',
  'Auto Parts & Accessories',
  'Safety & Industrial PPE',
  'Office & Stationery Supplies',
  'Fashion & Apparel',
  'Beauty & Personal Care',
  'Home Decor & Appliances',
  'Medical & Healthcare',
  'Sports & Fitness Equipment',
] as const;

export interface MainCategoryConfig {
  id: string;
  name: string;
  code: string;
  iconName: string;
  description: string;
  verticals: string[];
}

export const MAIN_CATEGORIES_WITH_VERTICALS: MainCategoryConfig[] = [
  {
    id: 'cat-hardware-tools',
    name: 'Hardware, Tools & Construction (Q-Commerce Core)',
    code: 'HARDWARE_TOOLS',
    iconName: 'Wrench',
    description: 'Power tools, hand tools, cutting discs, screws, fasteners, carpentry & safety PPE',
    verticals: [
      'Power Tools & Drills',
      'Hand Tools & Pliers',
      'Cutting Discs, Blades & Bits',
      'Snips, Cutters & Shears',
      'Screws, Bolts & Machine Fasteners',
      'Wall Plugs, Anchors & Plugs',
      'Carpentry Hardware, Door Locks & Hinges',
      'Adhesives, Solvents & CPVC Cement',
      'Silicone Sealants & PU Foams',
      'M-Seal, Tapes & Lubricant Sprays',
      'Safety PPE, Goggles, Gloves & Helmets',
      'Abrasives & Sanding Supplies',
      'Measuring Tapes & Levelling Tools',
      'Paints, Primers & Waterproofing',
    ],
  },
  {
    id: 'cat-electrical-lighting',
    name: 'Electricals, Lighting & Power',
    code: 'ELECTRICAL_LIGHTING',
    iconName: 'Zap',
    description: 'Wires, cables, MCBs, modular switches, LED lighting, ceiling fans & boards',
    verticals: [
      'Wires, Cables & Extension Cords',
      'MCBs, DB Boxes & Circuit Breakers',
      'Modular Switches & Sockets',
      'Switch Plates, Frames & Bell Push Buttons',
      'Heavy Duty DP Switches & Plugs',
      'LED Tubelights, Battens & Bulbs',
      'Ceiling Panel Lights & Spotlights',
      'Ceiling Fans & BLDC Energy Fans',
      'Exhaust Fans & Regulators',
      'Electrical Insulation Tapes & Conduits',
      'Inverters, Batteries & Stabilizers',
    ],
  },
  {
    id: 'cat-plumbing-bath-kitchen',
    name: 'Plumbing, Bath & Kitchen Fittings',
    code: 'PLUMBING_BATH_KITCHEN',
    iconName: 'Droplet',
    description: 'Pipes, CPVC fittings, bathroom faucets, showers, kitchen sink taps & RO valves',
    verticals: [
      'Plumbing Pipes & CPVC/PVC Fittings',
      'Dual Angle Valves & Teflon Tapes',
      'Health Faucets, Jet Sprays & Hoses',
      'Showers, Shower Arms & Overhead Showers',
      'Basin Pillar Taps & Mixer Faucets',
      'Kitchen Sink Taps & Flexible Cocks',
      'Sink Waste Couplings & Drain Pipes',
      'RO Water Purifier Valves & Adapters',
      'Bathroom Accessories & Towel Rods',
      'Water Tanks & Pump Pressure Controllers',
    ],
  },
  {
    id: 'cat-electronics-mobiles',
    name: 'Electronics, Mobiles & Appliances',
    code: 'ELECTRONICS_MOBILES',
    iconName: 'Cpu',
    description: 'Smartphones, chargers, laptops, audio gear, TVs & home appliances',
    verticals: [
      'Smartphones & Feature Phones',
      'Mobile Chargers, Power Banks & Cables',
      'Cases, Covers & Screen Protectors',
      'Headphones, TWS Earbuds & Speakers',
      'Laptops, Computer Accessories & Keyboards',
      'Smart Wearables & Fitness Bands',
      'Televisions & Home Audio Systems',
      'Small Home Appliances (Mixers, Irons, Trimmers)',
      'Coolers, Air Conditioners & Geysers',
    ],
  },
  {
    id: 'cat-home-kitchen-living',
    name: 'Home, Kitchen & Living Essentials',
    code: 'HOME_KITCHEN',
    iconName: 'ShoppingBag',
    description: 'Cookware, storage containers, home decor, cleaning gear & furniture',
    verticals: [
      'Cookware, Pressure Cookers & Pans',
      'Storage Containers, Bottles & Jars',
      'Home Decor, Wall Art & Clocks',
      'Bedding, Pillows, Curtains & Towels',
      'Cleaning Mops, Brooms & Wipes',
      'Storage Racks, Shelves & Organizers',
      'Plasticware, Buckets & Bins',
      'Furniture, Chairs & Study Tables',
    ],
  },
  {
    id: 'cat-automotive-spares',
    name: 'Automotive, Spares & Garage',
    code: 'AUTOMOTIVE_SPARES',
    iconName: 'Wrench',
    description: 'Auto spare parts, engine oils, bike accessories, helmets & garage tools',
    verticals: [
      'Bike & Car Spare Parts',
      'Engine Oils, Lubricants & Coolants',
      'Car & Bike Cleaning Sprays & Polish',
      'Helmets, Riding Gloves & Accessories',
      'Tyre Inflators, Jacks & Emergency Kits',
      'Car Mobile Holders & Chargers',
    ],
  },
  {
    id: 'cat-beauty-fashion',
    name: 'Beauty, Personal Care & Fashion',
    code: 'BEAUTY_FASHION',
    iconName: 'Activity',
    description: 'Skincare, grooming, apparel, footwear, watches & accessories',
    verticals: [
      'Men\'s Apparel & Activewear',
      'Women\'s Wear & Ethnic Clothing',
      'Footwear, Sneakers & Sandals',
      'Skincare, Face Washes & Moisturizers',
      'Haircare, Shampoos & Styling Oils',
      'Men\'s Trimmers, Razors & Grooming',
      'Fragrances, Deodorants & Perfumes',
      'Watches, Eyewear & Backpacks',
    ],
  },
  {
    id: 'cat-grocery-food',
    name: 'Grocery, Foods & Daily FMCG',
    code: 'GROCERY_FOOD',
    iconName: 'Utensils',
    description: 'Fresh produce, daily dairy, packaged snacks, beverages & household cleaners',
    verticals: [
      'Fresh Fruits, Vegetables & Staples',
      'Milk, Butter, Paneer & Bread',
      'Packaged Snacks, Biscuits & Chocolates',
      'Tea, Coffee, Energy Drinks & Juices',
      'Atta, Rice, Dal, Oils & Spices',
      'Detergents, Dishwashers & Surface Cleaners',
      'Personal Hygiene & Baby Care',
    ],
  },
  {
    id: 'cat-stationery-sports',
    name: 'Books, Stationery, Toys & Sports',
    code: 'STATIONERY_SPORTS',
    iconName: 'FolderTree',
    description: 'Office stationery, notebooks, toys, fitness gear & sports equipment',
    verticals: [
      'Office & School Stationery Supplies',
      'Notebooks, Pens, Markers & Files',
      'Books, Fiction & Competitive Exam Guides',
      'Toys, Board Games & Puzzles',
      'Fitness, Gym Equipment & Dumbbells',
      'Sports Goods (Cricket, Badminton, Football)',
    ],
  },
];

export interface AdminSeller {
  id: string;
  name: string;
  ownerName: string;
  hubType: string;
  categories?: string[];
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
  suspensionReason?: string;
  documents: {
    gstVerified: boolean;
    panVerified: boolean;
    bankVerified: boolean;
    tradeLicenseVerified: boolean;
    tradeLicenseNumber?: string;
  };
  uploadedDocuments?: UploadedDocument[];
  bgvSummary?: BgvSummary;
  // Financial & Sales Metrics
  todaySales?: number;
  todayOrders?: number;
  weeklySales?: number;
  weeklyOrders?: number;
  monthlySales?: number;
  monthlyOrders?: number;
  lifetimeSales?: number;
  lifetimeOrders?: number;
  pendingPayableBalance?: number;
  settledBalance?: number;
  totalSettledPayouts?: number;
  ledgerEntries?: AdminSellerLedgerEntry[];
}

export interface AdminSellerLedgerEntry {
  id: string;
  sellerId: string;
  date: string;
  timestamp: string;
  type:
    | 'PRODUCT_SALE'
    | 'PACKAGING_INCENTIVE'
    | 'COMMISSION_DEDUCTION'
    | 'GST_TCS_DEDUCTION'
    | 'TDS_DEDUCTION'
    | 'SETTLEMENT_RELEASE'
    | 'REFUND_ADJUSTMENT'
    | 'ADJUSTMENT';
  category: 'CREDIT' | 'DEBIT';
  title: string;
  description: string;
  amount: number;
  orderCount?: number;
  orderNumber?: string;
  status: 'CLEARED' | 'PENDING' | 'RELEASED' | 'PROCESSING';
  payoutMode?: 'UPI' | 'IMPS' | 'NEFT' | 'RTGS';
  utrNumber?: string;
  releasedAt?: string;
  releasedBy?: string;
}

export interface UploadedDocument {
  id: string;
  docType:
    | 'AADHAAR'
    | 'DRIVING_LICENSE'
    | 'VEHICLE_RC'
    | 'INSURANCE'
    | 'BANK_PASSBOOK'
    | 'GST_CERTIFICATE'
    | 'PAN_CARD'
    | 'FSSAI_LICENSE'
    | 'STORE_PHOTO'
    | 'TRADE_LICENSE'
    | 'ELECTRICITY_BILL'
    | 'OTHER';
  title: string;
  documentNumber?: string;
  fileUrl?: string;
  fileName: string;
  fileSize: string;
  fileFormat: 'PDF' | 'JPG' | 'PNG';
  uploadedAt: string;
  uploadedVia: string; // e.g. "QCOM Rider App v2.4 (Android)" or "QCOM Seller Partner App v1.8 (Android)"
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  ocrData?: Record<string, string>;
  rejectionReason?: string;
}

export interface BgvCheckItem {
  id: string;
  checkType: string;
  title: string;
  authority: string;
  status: 'PASSED' | 'IN_PROGRESS' | 'FAILED' | 'FLAGGED';
  verifiedAt?: string;
  referenceId?: string;
  remarks?: string;
}

export interface BgvSummary {
  status: 'CLEARED' | 'IN_PROGRESS' | 'FLAGGED';
  riskLevel: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  provider: string;
  referenceNumber: string;
  completedAt?: string;
  overallScore?: number;
  checks: BgvCheckItem[];
}

export interface AdminRiderLedgerEntry {
  id: string;
  riderId: string;
  date: string;
  timestamp: string;
  type:
    | 'TRIP_EARNING'
    | 'SURGE_BONUS'
    | 'ON_TIME_INCENTIVE'
    | 'RAIN_PEAK_BONUS'
    | 'TDS_DEDUCTION'
    | 'PAYOUT_RELEASE'
    | 'ADJUSTMENT'
    | 'SECURITY_DEPOSIT';
  category: 'CREDIT' | 'DEBIT';
  title: string;
  description: string;
  amount: number;
  tripCount?: number;
  orderNumber?: string;
  status: 'CLEARED' | 'PENDING' | 'RELEASED' | 'PROCESSING';
  payoutMode?: 'UPI' | 'IMPS' | 'NEFT' | 'WALLET';
  utrNumber?: string;
  releasedAt?: string;
  releasedBy?: string;
}

export interface AdminRider {
  id: string;
  name: string;
  phone: string;
  email?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  bloodGroup?: string;
  avatar: string;
  cityId?: string;
  cityName?: string;
  assignedZoneId?: string;
  assignedZoneName?: string;
  vehicleType: 'EV_SCOOTER' | 'BIKE' | 'E_LOADER' | 'MINI_TRUCK' | 'ELECTRIC_VAN';
  vehicleMakeModel?: string;
  vehicleNumber: string;
  maxPayloadKg?: number;
  batteryPercent?: number;
  fuelType?: 'ELECTRIC' | 'PETROL' | 'CNG';
  hasInsulatedThermalBag?: boolean;
  hasHelmetAndSafetyGear?: boolean;
  status: 'ONLINE' | 'ON_DELIVERY' | 'OFFLINE' | 'SUSPENDED' | 'PENDING_APPROVAL';
  dutyType?: 'FULL_TIME' | 'PART_TIME' | 'WEEKEND_PEAK' | 'NIGHT_SHIFT';
  shiftHours?: string;
  suspensionReason?: string;
  suspendedAt?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    areaName: string;
  };
  currentOrderId?: string;
  rating: number;
  totalDeliveries: number;
  todayDeliveries: number;
  todayEarnings: number;
  weeklyDeliveries?: number;
  weeklyEarnings?: number;
  monthlyDeliveries?: number;
  monthlyEarnings?: number;
  pendingPayableBalance?: number;
  lastPayoutAmount?: number;
  lastPayoutDate?: string;
  lastPayoutUtr?: string;
  payoutStatus?: 'SETTLED' | 'PENDING_RELEASE' | 'PROCESSING' | 'ON_HOLD';
  payoutHoldReason?: string;
  ledgerEntries?: AdminRiderLedgerEntry[];
  totalLifetimeEarnings?: number;
  onTimeDeliveryRate?: number;
  cancellationRate?: number;
  activeSince: string;
  lastActiveTimestamp?: string;
  documents: {
    drivingLicenseNumber?: string;
    drivingLicenseVerified: boolean;
    drivingLicenseExpiry?: string;
    rcNumber?: string;
    rcVerified: boolean;
    aadharNumber?: string;
    aadharVerified: boolean;
    panNumber?: string;
    panVerified?: boolean;
    insurancePolicyNumber?: string;
    insuranceVerified?: boolean;
    backgroundCheckPassed: boolean;
    policeVerificationDocVerified?: boolean;
  };
  uploadedDocuments?: UploadedDocument[];
  bgvSummary?: BgvSummary;
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
    payoutFrequency?: 'DAILY' | 'WEEKLY';
  };
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  accountType: 'contractor' | 'electrician' | 'plumber' | 'individual';
  companyName?: string;
  status: 'ACTIVE' | 'FLAGGED' | 'SUSPENDED' | 'BANNED';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isVip?: boolean;
  creditLimitINR?: number;
  fraudFlags?: string[];
  suspensionReason?: string;
  bannedAt?: string;
  bannedBy?: string;
  notes?: {
    id: string;
    author: string;
    text: string;
    createdAt: string;
  }[];
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
  customerPhone?: string;
  customerEmail?: string;
  sellerId?: string;
  sellerName?: string;
  cityName?: string;
  amount: number;
  maxRefundable: number;
  refundType?: 'FULL' | 'PARTIAL' | 'GOODWILL' | 'TAX_INVOICE_ADJUSTMENT' | 'DELIVERY_FEE';
  channel?: 'UPI_INSTANT' | 'SOURCE_ACCOUNT' | 'TRADE_CREDIT' | 'BANK_NEFT_IMPS' | 'MANUAL_OFFSET';
  reason: string;
  requestedBy: string;
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'ON_HOLD';
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  transactionId?: string;
  bankUtr?: string;
  gatewayChannel?: string;
  sellerClawback?: boolean;
  sellerClawbackAmount?: number;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  holdReason?: string;
  internalNotes?: string;
  items?: {
    productName: string;
    quantity: number;
    price: number;
    refundAmount: number;
    reason?: string;
  }[];
  timeline?: {
    stage: string;
    timestamp: string;
    note: string;
    actor: string;
  }[];
}

export interface AdminRefundDispute {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  disputeAmount: number;
  claimReference: string;
  bankName: string;
  category: 'UNAUTHORISED_TXN' | 'DAMAGED_GOODS' | 'NON_DELIVERY' | 'DUPLICATE_CHARGE' | 'WRONG_ITEM';
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'CONTESTED' | 'SETTLED_REFUND' | 'CLOSED_WON';
  filedAt: string;
  evidenceDocs?: string[];
  podVerifiedOtp?: string;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface RefundPolicyConfig {
  autoApprovalThreshold: number;
  claimWindowHours: number;
  requireManagerApprovalAbove: number;
  instantUpiEnabled: boolean;
  allowPartialItemRefunds: boolean;
  sellerClawbackDefaultPercent: number;
  maxDailyRefundQuota: number;
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
  | 'CHECKOUT_PROMOTION'
  | 'ORDER_TRACKING_BANNER'
  | 'ORDER_TRACKING_MAP_COLLAPSED'
  | 'ORDER_TRACKING_BELOW_MAP'
  | 'ORDER_TRACKING_FOOTER'
  | 'TRACKING_TOP_VIDEO_MAP'
  | 'TRACKING_FLOATING_STICKY_BANNER'
  | 'TRACKING_WHILE_YOU_WAIT_CAROUSEL'
  | 'TRACKING_WHILE_YOU_WAIT_GRID'
  | 'TRACKING_ABOVE_ORDER_DETAILS';

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
  destinationUrl?: string; // Deep Link or External URL
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
  mediaType?: 'IMAGE' | 'VIDEO';
  videoUrl?: string;
  ctaText?: string; // e.g. "Know More", "Apply Now", "Get Card", "Book Free Scan"
  ctaUrl?: string; // e.g. "https://..." or "app://deals"
  actionType?: 'EXTERNAL_URL' | 'DEEP_LINK' | 'PRODUCT_PAGE' | 'CATEGORY_HUB';
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
  subtitle?: string;
  bannerBgColor: string;
  productIds: string[];
  cityScope?: string;
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
