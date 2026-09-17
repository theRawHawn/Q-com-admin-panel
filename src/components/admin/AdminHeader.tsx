import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Bell, 
  ChevronDown, 
  Clock, 
  AlertTriangle, 
  Globe2, 
  MapPin, 
  Building2, 
  Check,
  X,
  Menu
} from 'lucide-react';
import { AdminUser, IndianCityConfig } from '../../types/admin';

interface AdminHeaderProps {
  currentUser: AdminUser;
  availableUsers: AdminUser[];
  onSwitchUser: (user: AdminUser) => void;
  onSearch: (query: string) => void;
  searchQuery?: string;
  activeTab?: string;
  activeAlertsCount: number;
  onNavigateToTab: (tab: string) => void;
  selectedCity: string;
  onSelectCity: (cityId: string) => void;
  cities: IndianCityConfig[];
  onToggleMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser,
  availableUsers,
  onSwitchUser,
  onSearch,
  searchQuery = '',
  activeTab = 'dashboard',
  activeAlertsCount,
  onNavigateToTab,
  selectedCity,
  onSelectCity,
  cities,
  onToggleMobileSidebar,
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [searchVal, setSearchVal] = useState(searchQuery);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchVal(searchQuery);
  }, [searchQuery, activeTab]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const getSearchPlaceholder = (tab?: string) => {
    switch (tab) {
      case 'sellers':
        return 'Search partner stores by name, GSTIN, owner, hub...';
      case 'orders':
        return 'Search orders by ID, customer, phone, store...';
      case 'riders':
        return 'Search delivery partners by name, phone, vehicle #...';
      case 'customers':
        return 'Search customers by name, phone, email, firm...';
      case 'inventory':
        return 'Search SKUs by name, brand, HSN code...';
      case 'payments':
      case 'refunds':
        return 'Search transactions, refunds, parties...';
      case 'settlements':
        return 'Search store settlements by seller or UTR...';
      case 'dispatch':
        return 'Search unassigned orders & fleet roster...';
      case 'promotions':
        return 'Search promo codes & campaigns...';
      case 'ads':
        return 'Search sponsored ad campaigns...';
      case 'cms':
        return 'Search CMS content & banners...';
      case 'employees':
        return 'Search staff members & roles...';
      case 'support':
        return 'Search support desk tickets...';
      case 'audit':
        return 'Search audit logs...';
      case 'service_areas':
        return 'Search hubs & service zones...';
      case 'pricing':
        return 'Search pricing parameters & rules...';
      default:
        return 'Search current module...';
    }
  };

  const activeCityObj = cities.find((c) => c.id === selectedCity);

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 px-3 sm:px-5 py-2.5 sticky top-0 z-40 flex items-center justify-between">
      {/* Brand & Market Scope */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden transition-colors"
            title="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div 
          onClick={() => onNavigateToTab('dashboard')} 
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          title="Go to Dashboard"
        >
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-xs">
            QC
          </div>
          <div className="hidden xs:block">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-xs sm:text-sm">QuickBuild</span>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 hidden sm:inline">Admin</span>
            </div>
          </div>
        </div>

        {/* Territory Selector */}
        <div className="relative ml-2">
          <button
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/70 px-2.5 py-1 rounded-lg transition-colors text-xs font-medium text-slate-700"
          >
            <MapPin className="h-3 w-3 text-emerald-600" />
            <span className="max-w-[120px] truncate">
              {selectedCity === 'all' ? 'All Hubs' : activeCityObj?.name || selectedCity}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isCityDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select City Hub
              </div>
              <div className="py-1 max-h-60 overflow-y-auto space-y-0.5">
                <button
                  onClick={() => {
                    onSelectCity('all');
                    setIsCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                    selectedCity === 'all' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Globe2 className="h-3.5 w-3.5 text-emerald-600" />
                    All India (National)
                  </span>
                  {selectedCity === 'all' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                </button>

                {cities.map((city) => {
                  const isSelected = city.id === selectedCity;
                  return (
                    <button
                      key={city.id}
                      onClick={() => {
                        onSelectCity(city.id);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                        isSelected ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{city.name}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Quick Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={getSearchPlaceholder(activeTab)}
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              onSearch(e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => {
                setSearchVal('');
                onSearch('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Time */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-500 text-xs font-mono">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{currentTime || '08:45 AM'}</span>
        </div>

        {/* Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setIsAlertDropdownOpen(!isAlertDropdownOpen)}
            className="relative p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Alerts"
          >
            <Bell className="h-4 w-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white font-bold text-[9px] h-3.5 w-3.5 rounded-full flex items-center justify-center">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {isAlertDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 animate-in fade-in">
              <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Alerts ({activeAlertsCount})</span>
              </div>
              <div className="divide-y divide-slate-100 py-1 max-h-60 overflow-y-auto">
                <div 
                  onClick={() => { onNavigateToTab('dispatch'); setIsAlertDropdownOpen(false); }}
                  className="p-2 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors"
                >
                  <div className="text-xs font-semibold text-rose-600">7 Orders Pending Dispatch</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Orders packed and waiting for rider assignment.</p>
                </div>
                <div 
                  onClick={() => { onNavigateToTab('sellers'); setIsAlertDropdownOpen(false); }}
                  className="p-2 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors"
                >
                  <div className="text-xs font-semibold text-amber-600">Partner Stores Offline</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">2 stores temporarily paused fulfillment.</p>
                </div>
                <div 
                  onClick={() => { onNavigateToTab('inventory'); setIsAlertDropdownOpen(false); }}
                  className="p-2 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors"
                >
                  <div className="text-xs font-semibold text-sky-600">Low Stock SKUs</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">5 high-velocity items need replenishment.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compact Admin Avatar Profile */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="p-0.5 rounded-full hover:ring-2 hover:ring-emerald-500/80 transition-all cursor-pointer focus:outline-none"
            title={`${currentUser.name} (${currentUser.roleTitle || currentUser.role})`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full object-cover border border-slate-200/90 shadow-2xs"
            />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 animate-in fade-in duration-150">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Logged In Admin Profile
              </div>

              <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{currentUser.email}</div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full inline-block mt-1">
                    {currentUser.roleTitle || (currentUser.role === 'SUPER_ADMIN' ? 'Main Admin / Super Admin' : currentUser.role.replace(/_/g, ' '))}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Department</span>
                  <span className="font-semibold text-slate-800 text-xs">{currentUser.department}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Session Status</span>
                  <span className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Session
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
