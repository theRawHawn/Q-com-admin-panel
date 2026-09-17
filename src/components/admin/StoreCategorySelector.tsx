import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Search,
  Check,
  X,
  Layers,
  Zap,
  Cpu,
  ShoppingBag,
  Wrench,
  Activity,
  Utensils,
  FolderTree,
  CheckSquare,
  Square
} from 'lucide-react';
import { MAIN_CATEGORIES_WITH_VERTICALS, MainCategoryConfig } from '../../types/admin';

interface StoreCategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  helperText?: string;
  minRequired?: number;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Zap':
      return <Zap className="h-4 w-4 text-amber-500" />;
    case 'Cpu':
      return <Cpu className="h-4 w-4 text-blue-500" />;
    case 'ShoppingBag':
      return <ShoppingBag className="h-4 w-4 text-emerald-500" />;
    case 'Wrench':
      return <Wrench className="h-4 w-4 text-purple-500" />;
    case 'Activity':
      return <Activity className="h-4 w-4 text-rose-500" />;
    case 'Utensils':
      return <Utensils className="h-4 w-4 text-orange-500" />;
    default:
      return <FolderTree className="h-4 w-4 text-slate-500" />;
  }
};

export const StoreCategorySelector: React.FC<StoreCategorySelectorProps> = ({
  selectedCategories,
  onChange,
  helperText = 'Select primary master domain and authorized sub-category verticals for this store',
  minRequired = 1,
}) => {
  // Infer primary main category from currently selected sub-categories if possible, else default to first
  const initialMainCat = MAIN_CATEGORIES_WITH_VERTICALS.find((cat) =>
    cat.verticals.some((v) => selectedCategories.includes(v))
  ) || MAIN_CATEGORIES_WITH_VERTICALS[0];

  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategoryConfig>(initialMainCat);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'CURRENT' | 'ALL'>('CURRENT');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleVertical = (vertical: string) => {
    const exists = selectedCategories.includes(vertical);
    if (exists) {
      if (selectedCategories.length > minRequired) {
        onChange(selectedCategories.filter((c) => c !== vertical));
      }
    } else {
      onChange([...selectedCategories, vertical]);
    }
  };

  const handleRemoveCategory = (vertical: string) => {
    if (selectedCategories.length > minRequired) {
      onChange(selectedCategories.filter((c) => c !== vertical));
    }
  };

  const handleMainCategoryChange = (catId: string) => {
    const found = MAIN_CATEGORIES_WITH_VERTICALS.find((c) => c.id === catId);
    if (found) {
      setSelectedMainCategory(found);
    }
  };

  // Get verticals to show in multi-select dropdown
  const getDropdownCategories = () => {
    let categoriesToShow: { mainName: string; verticals: string[] }[] = [];

    if (filterMode === 'CURRENT') {
      categoriesToShow = [
        { mainName: selectedMainCategory.name, verticals: selectedMainCategory.verticals },
      ];
    } else {
      categoriesToShow = MAIN_CATEGORIES_WITH_VERTICALS.map((cat) => ({
        mainName: cat.name,
        verticals: cat.verticals,
      }));
    }

    if (!searchQuery.trim()) return categoriesToShow;

    const query = searchQuery.toLowerCase();
    return categoriesToShow
      .map((catGroup) => ({
        ...catGroup,
        verticals: catGroup.verticals.filter((v) => v.toLowerCase().includes(query)),
      }))
      .filter((catGroup) => catGroup.verticals.length > 0);
  };

  const handleSelectAllInCurrentMain = () => {
    const currentVerts = selectedMainCategory.verticals;
    const missing = currentVerts.filter((v) => !selectedCategories.includes(v));
    if (missing.length > 0) {
      onChange([...selectedCategories, ...missing]);
    }
  };

  const handleClearCurrentMain = () => {
    const currentVerts = selectedMainCategory.verticals;
    const remaining = selectedCategories.filter((c) => !currentVerts.includes(c));
    if (remaining.length >= minRequired) {
      onChange(remaining);
    } else if (remaining.length > 0) {
      onChange(remaining);
    }
  };

  const dropdownGroups = getDropdownCategories();

  return (
    <div className="space-y-3.5 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
      {/* Label & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Authorized Store Categories & Verticals *
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5">{helperText}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-2xs font-mono flex items-center gap-1">
            <Check className="h-3 w-3 text-emerald-400" />
            <span>{selectedCategories.length} Selected</span>
          </span>
        </div>
      </div>

      {/* Industry Standard Dual Dropdown Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Dropdown 1: Primary Master Category (Single Select) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>Primary Master Category *</span>
          </label>
          <div className="relative">
            <select
              value={selectedMainCategory.id}
              onChange={(e) => handleMainCategoryChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-xs text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs cursor-pointer transition-all"
            >
              {MAIN_CATEGORIES_WITH_VERTICALS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[10px] text-slate-500">
            {selectedMainCategory.description}
          </p>
        </div>

        {/* Dropdown 2: Sub-Categories & Verticals (Searchable Multi-Select Dropdown) */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Sub-Categories & Verticals *</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Multi-Select Menu</span>
          </label>

          {/* Trigger Dropdown Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full px-3 py-2.5 bg-white border rounded-xl flex items-center justify-between gap-2 text-xs font-semibold shadow-2xs transition-all ${
              isDropdownOpen
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900'
                : 'border-slate-300 hover:border-slate-400 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {getCategoryIcon(selectedMainCategory.iconName)}
              <span className="truncate">
                {selectedCategories.length === 0
                  ? 'Select Sub-Categories...'
                  : `${selectedCategories.length} Sub-Categories Selected`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold font-mono">
                {selectedCategories.length}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-emerald-600' : ''
                }`}
              />
            </div>
          </button>

          {/* Floating Dropdown Overlay Menu */}
          {isDropdownOpen && (
            <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 space-y-2.5 animate-in fade-in zoom-in-95 max-h-80 flex flex-col">
              {/* Search input & Filter mode inside dropdown */}
              <div className="space-y-2 shrink-0 pb-2 border-b border-slate-100">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search sub-categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setFilterMode('CURRENT')}
                      className={`px-2 py-0.5 rounded font-medium ${
                        filterMode === 'CURRENT'
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Current Primary Category
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('ALL')}
                      className={`px-2 py-0.5 rounded font-medium ${
                        filterMode === 'ALL'
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All Categories
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllInCurrentMain}
                      className="text-emerald-700 hover:underline font-bold text-[10px]"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearCurrentMain}
                      className="text-slate-500 hover:underline font-semibold text-[10px]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Sub-Category Checkbox Options */}
              <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                {dropdownGroups.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs font-medium">
                    No sub-categories matching "{searchQuery}"
                  </div>
                ) : (
                  dropdownGroups.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1">
                      {filterMode === 'ALL' && (
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 py-0.5 bg-slate-50 rounded">
                          {group.mainName}
                        </div>
                      )}
                      <div className="space-y-0.5">
                        {group.verticals.map((vertical) => {
                          const isSelected = selectedCategories.includes(vertical);
                          return (
                            <button
                              key={vertical}
                              type="button"
                              onClick={() => handleToggleVertical(vertical)}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'bg-emerald-50 text-emerald-950 font-semibold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {isSelected ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-300 shrink-0" />
                                )}
                                <span className="truncate">{vertical}</span>
                              </div>
                              {isSelected && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-1.5 py-0.2 rounded font-mono">
                                  Selected
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs">
                <span className="text-[11px] text-slate-500">
                  {selectedCategories.length} active verticals
                </span>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Selected Badges / Tags Container */}
      <div className="pt-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Active Authorized Verticals ({selectedCategories.length}):
          </span>
          {selectedCategories.length > minRequired && (
            <span className="text-[10px] text-slate-400">
              Click ✕ to remove any vertical
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 p-2.5 bg-white border border-slate-200/90 rounded-xl min-h-[44px] items-center">
          {selectedCategories.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No verticals selected</span>
          ) : (
            selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white shadow-2xs animate-in fade-in"
              >
                <span>{cat}</span>
                {selectedCategories.length > minRequired && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="p-0.5 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title={`Remove ${cat}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
