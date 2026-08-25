import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { AdminUser, IndianCityConfig } from '../../types/admin';

interface AdminHeaderProps {
  currentUser: AdminUser;
  availableUsers: AdminUser[];
  onSwitchUser: (user: AdminUser) => void;
  onSearch: (query: string) => void;
  activeAlertsCount: number;
  onNavigateToTab: (tab: string) => void;
  selectedCity: string;
  onSelectCity: (cityId: string) => void;
  cities: IndianCityConfig[];
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser,
  availableUsers,
  onSwitchUser,
  onSearch,
  activeAlertsCount,
  onNavigateToTab,
  selectedCity,
  onSelectCity,
  cities,
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [searchVal, setSearchVal] = useState('');

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const activeCityObj = cities.find((c) => c.id === selectedCity);

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 px-5 py-2.5 sticky top-0 z-40 flex items-center justify-between">
      {/* Brand & Market Scope */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
            QC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-sm">QuickBuild</span>
              <span className="text-[11px] font-medium text-slate-500">Admin</span>
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
            placeholder="Search orders, sellers, contractors..."
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

        {/* User Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 hover:bg-slate-100 p-1 pr-2 rounded-lg transition-all text-left"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-7 w-7 rounded-full object-cover border border-slate-200"
            />
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                {currentUser.name}
                <span className="text-[10px] text-slate-500 font-mono">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Role / Persona
              </div>

              <div className="py-1 max-h-64 overflow-y-auto space-y-0.5">
                {availableUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user);
                        setIsUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-colors ${
                        isCurrent ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate flex items-center justify-between">
                          <span>{user.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{user.role.replace('_', ' ')}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{user.department}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
