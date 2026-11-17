import React from 'react';
import { LayoutGrid, Grid3X3, BookOpen } from 'lucide-react';
import { Category, SortOption, ViewLayout } from '../types';
import { Language, STORE_STRINGS, translateCategory } from '../utils/i18n';

interface FilterBarProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  categories: Category[];
  itemCount: number;
  totalCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewLayout: ViewLayout;
  onViewLayoutChange: (layout: ViewLayout) => void;
  searchQuery: string;
  onClearSearch: () => void;
  language: Language;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  categories,
  itemCount,
  totalCount,
  sortBy,
  onSortChange,
  viewLayout,
  onViewLayoutChange,
  searchQuery,
  onClearSearch,
  language
}) => {
  const t = STORE_STRINGS[language].filter;

  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#E4E4E7] py-6 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Category Chips: Rectangular 32px height, 1px border #E4E4E7 */}
        <div className="flex items-center flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`filter-button h-8 px-4 text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors duration-150 flex items-center justify-center border ${
                  isActive
                    ? 'bg-[#0A0A0A] text-[#FFFFFF] border-[#0A0A0A]'
                    : 'bg-[#FFFFFF] text-[#71717A] border-[#E4E4E7] hover:text-[#0A0A0A] hover:border-[#0A0A0A]'
                }`}
              >
                {translateCategory(category, language)}
              </button>
            );
          })}
        </div>

        {/* Right Controls: Sort & Layout Toggles */}
        <div className="flex items-center justify-between sm:justify-end gap-5">
          
          {/* Active Search Badge */}
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="h-8 px-3 bg-[#F4F4F5] border border-[#E4E4E7] text-[11px] font-mono flex items-center gap-2 hover:border-[#0A0A0A] transition-colors"
              aria-label={t.clear}
            >
              <span className="text-[#71717A]">
                {t.filterPrefix} &ldquo;{searchQuery}&rdquo;
              </span>
              <span className="text-[#0A0A0A] underline uppercase text-[10px]">{t.clear}</span>
            </button>
          )}

          {/* Catalog Count */}
          <span className="text-[11px] font-mono tracking-[0.1em] text-[#71717A] uppercase hidden lg:inline">
            {t.showing} {itemCount} {t.of} {totalCount} {t.works}
          </span>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-[11px] font-mono tracking-[0.08em] uppercase text-[#71717A] hidden sm:inline">
              {t.sortLabel}
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="h-8 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[11px] font-mono uppercase tracking-[0.08em] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-colors cursor-pointer"
            >
              <option value="featured">{t.sortFeatured}</option>
              <option value="price-asc">{t.sortPriceAsc}</option>
              <option value="price-desc">{t.sortPriceDesc}</option>
              <option value="name">{t.sortName}</option>
            </select>
          </div>

          {/* View Mode Toggle Icons */}
          <div className="hidden md:flex items-center border border-[#E4E4E7]">
            <button
              onClick={() => onViewLayoutChange('grid-4')}
              className={`filter-button w-8 h-8 flex items-center justify-center transition-colors ${
                viewLayout === 'grid-4' ? 'bg-[#0A0A0A] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#71717A] hover:text-[#0A0A0A]'
              }`}
              title={t.view4}
              aria-label={t.view4}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => onViewLayoutChange('grid-3')}
              className={`filter-button w-8 h-8 flex items-center justify-center border-l border-[#E4E4E7] transition-colors ${
                viewLayout === 'grid-3' ? 'bg-[#0A0A0A] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#71717A] hover:text-[#0A0A0A]'
              }`}
              title={t.view3}
              aria-label={t.view3}
            >
              <Grid3X3 size={15} />
            </button>
            <button
              onClick={() => onViewLayoutChange('lookbook')}
              className={`filter-button w-8 h-8 flex items-center justify-center border-l border-[#E4E4E7] transition-colors ${
                viewLayout === 'lookbook' ? 'bg-[#0A0A0A] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#71717A] hover:text-[#0A0A0A]'
              }`}
              title={t.viewLookbook}
              aria-label={t.viewLookbook}
            >
              <BookOpen size={15} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
