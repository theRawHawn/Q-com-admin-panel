import React from 'react';
import {
  ShoppingBag,
  RotateCcw,
  Bike,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  Zap,
  Clock
} from 'lucide-react';

interface QuickStatsProps {
  metrics: {
    kpis: {
      todayGmv: number;
      todayOrders: number;
      refundsCount: number;
      avgDeliverySlaMins?: number;
      b2bPercentage?: number;
    };
    activeNow: {
      ordersPreparing: number;
      ordersReadyForPickup: number;
      ridersDelivering: number;
      ridersOnline: number;
    };
    alerts?: {
      ordersWithoutRider?: number;
    };
  };
  onNavigateTab?: (tabId: string) => void;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ metrics, onNavigateTab }) => {
  const { kpis, activeNow } = metrics;

  const totalActiveOrders = (activeNow.ordersPreparing || 0) + (activeNow.ordersReadyForPickup || 0) + (activeNow.ridersDelivering || 0);
  const totalFleet = (activeNow.ridersOnline || 0) + (activeNow.ridersDelivering || 0);
  const fleetUtilization = totalFleet > 0 
    ? Math.round((activeNow.ridersDelivering / totalFleet) * 100) 
    : 0;

  const stats = [
    {
      id: 'active-orders',
      title: 'Active Orders',
      value: totalActiveOrders.toString(),
      subtext: `${activeNow.ridersDelivering} on way · ${activeNow.ordersPreparing + activeNow.ordersReadyForPickup} prep`,
      icon: ShoppingBag,
      iconColor: 'text-sky-600 bg-sky-50',
      badge: 'Live',
      badgeColor: 'bg-sky-50 text-sky-700',
      tab: 'orders',
    },
    {
      id: 'pending-refunds',
      title: 'Pending Refunds',
      value: kpis.refundsCount.toString(),
      subtext: kpis.refundsCount > 0 ? 'Requires desk action' : 'All cleared',
      icon: RotateCcw,
      iconColor: 'text-amber-600 bg-amber-50',
      badge: kpis.refundsCount > 0 ? 'Action needed' : 'Clear',
      badgeColor: kpis.refundsCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
      tab: 'refunds',
    },
    {
      id: 'fleet-capacity',
      title: 'Fleet Capacity',
      value: `${fleetUtilization}%`,
      subtext: `${activeNow.ridersOnline} ready · ${totalFleet} online`,
      icon: Bike,
      iconColor: 'text-emerald-600 bg-emerald-50',
      badge: `${totalFleet} Riders`,
      badgeColor: 'bg-emerald-50 text-emerald-700',
      tab: 'dispatch',
    },
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: `₹${kpis.todayGmv.toLocaleString('en-IN')}`,
      subtext: '+18.4% vs yesterday',
      icon: IndianRupee,
      iconColor: 'text-indigo-600 bg-indigo-50',
      badge: `${kpis.todayOrders} Orders`,
      badgeColor: 'bg-indigo-50 text-indigo-700',
      tab: 'payments',
    },
  ];

  return (
    <div id="quick-stats-container" className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Real-Time Quick Stats
        </span>
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <Clock className="h-3 w-3 text-emerald-500" />
          Auto-synced
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={`quick-stat-${item.id}`}
              onClick={() => item.tab && onNavigateTab && onNavigateTab(item.tab)}
              className={`bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs group ${
                item.tab && onNavigateTab ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <div className={`p-1.5 sm:p-2 rounded-lg ${item.iconColor} shrink-0`}>
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[80px] sm:max-w-none ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  {item.tab && onNavigateTab && (
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-600 transition-colors hidden sm:block" />
                  )}
                </div>
              </div>

              <div className="mt-2.5 sm:mt-3">
                <span className="text-[11px] sm:text-xs font-medium text-slate-500 block truncate">
                  {item.title}
                </span>
                <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                  {item.value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 font-normal truncate">
                  {item.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
