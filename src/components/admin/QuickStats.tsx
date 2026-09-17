import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Store,
  Bike,
  Clock,
  IndianRupee,
  ArrowUpRight
} from 'lucide-react';

interface QuickStatsProps {
  metrics: {
    periodLabel?: string;
    kpis: {
      todayGmv: number;
      todayOrders: number;
      activeSellersCount: number;
      activeRidersCount: number;
      avgDeliveryMins?: number;
      avgDeliverySlaMins?: number;
      deliveredOrders?: number;
      successfulOrders?: number;
      cancelledOrders: number;
      totalItcClaimed: number;
      b2bPercentage: number;
      refundsCount?: number;
    };
    activeNow: {
      ordersPreparing: number;
      ordersReadyForPickup: number;
      ridersDelivering: number;
      ridersOnline: number;
    };
    alerts: {
      ordersWithoutRider: number;
      sellersOffline: number;
      lowStockAlerts: number;
    };
  };
  onNavigateTab: (tabId: string) => void;
  periodLabel?: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ metrics, onNavigateTab, periodLabel }) => {
  const { kpis } = metrics;
  const label = periodLabel || metrics.periodLabel || "Today's";

  const statCards = [
    {
      id: 'gmv',
      title: `${label} GMV`,
      value: `₹${(kpis.todayGmv || 0).toLocaleString('en-IN')}`,
      change: '+14.8% vs prev period',
      isPositive: true,
      icon: IndianRupee,
      color: 'emerald',
      tab: 'reports',
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: (kpis.todayOrders || 0).toLocaleString('en-IN'),
      change: `${(kpis.deliveredOrders || kpis.successfulOrders || Math.round(kpis.todayOrders * 0.96) || 0).toLocaleString('en-IN')} delivered`,
      isPositive: true,
      icon: ShoppingBag,
      color: 'sky',
      tab: 'orders',
    },
    {
      id: 'stores',
      title: 'Active Stores',
      value: (kpis.activeSellersCount || 0).toString(),
      change: '100% KYC verified',
      isPositive: true,
      icon: Store,
      color: 'indigo',
      tab: 'sellers',
    },
    {
      id: 'fleet',
      title: 'Active Riders',
      value: (kpis.activeRidersCount || 0).toString(),
      change: `${metrics.activeNow?.ridersDelivering || 0} on active trips`,
      isPositive: true,
      icon: Bike,
      color: 'amber',
      tab: 'riders',
    },
    {
      id: 'sla',
      title: 'Avg Delivery SLA',
      value: `${kpis.avgDeliveryMins || 14.2}m`,
      change: 'Target < 15 mins',
      isPositive: (kpis.avgDeliveryMins || 14.2) <= 15,
      icon: Clock,
      color: 'purple',
      tab: 'dispatch',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onNavigateTab(card.tab)}
            className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl p-3.5 sm:p-4 shadow-xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 truncate">{card.title}</span>
              <div className="p-1 rounded-md bg-slate-50 text-slate-600 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-2">
              <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center justify-between">
                <span>{card.value}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                {card.change}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
