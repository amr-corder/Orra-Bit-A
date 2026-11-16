import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import {
  Language,
  STORE_STRINGS,
  translateCategory,
  translateCurrency,
  translateProduct
} from '../utils/i18n';

interface SearchOverlayProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onApplySearchFilter: (query: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  language,
  onClose,
  products,
  onSelectProduct,
  onApplySearchFilter
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setQuery('');
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const t = STORE_STRINGS[language].search;
  const qLower = query.trim().toLowerCase();

  const filtered = qLower
    ? products.filter((p) => {
        const ar = translateProduct(p, 'ar');
        return (
          p.name.toLowerCase().includes(qLower) ||
          p.category.toLowerCase().includes(qLower) ||
          p.color.toLowerCase().includes(qLower) ||
          p.description.toLowerCase().includes(qLower) ||
          p.sku.toLowerCase().includes(qLower) ||
          ar.name.toLowerCase().includes(qLower) ||
          ar.color.toLowerCase().includes(qLower) ||
          ar.description.toLowerCase().includes(qLower) ||
          translateCategory(p.category, 'ar').toLowerCase().includes(qLower)
        );
      })
    : [];

  const handleSelect = (product: Product) => {
    onSelectProduct(product);
    onClose();
  };

  const handleApplyFilter = () => {
    onApplySearchFilter(query);
    onClose();
  };

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 overflow-y-auto transition-[opacity,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen
          ? 'opacity-100 visible pointer-events-auto'
          : 'opacity-0 invisible pointer-events-none'
      }`}
    >
      {/* Semi-translucent backdrop */}
      <div
        className={`fixed inset-0 bg-[#0A0A0A]/50 backdrop-blur-[4px] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        onClick={onClose}
        className="relative min-h-screen flex items-start justify-center pt-20 px-4 pb-12"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-3xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-2xl p-6 md:p-8 transform transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-4 scale-[0.98]'
          }`}
        >
          
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#E4E4E7] mb-6">
            <span className="font-serif text-2xl text-[#0A0A0A]">{t.title}</span>
          </div>

          {/* Search Input Box */}
          <div className="relative mb-6">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  handleApplyFilter();
                }
              }}
              placeholder={t.placeholder}
              className="w-full h-12 ltr:pl-11 rtl:pr-11 ltr:pr-24 rtl:pl-24 bg-[#FFFFFF] border border-[#E4E4E7] text-[14px] text-[#0A0A0A] placeholder-[#71717A] focus:outline-none focus:border-[#0A0A0A] transition-colors"
            />
            <Search
              size={18}
              strokeWidth={1.5}
              className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-[#71717A]"
            />
            {query && (
              <button
                onClick={handleApplyFilter}
                className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 h-8 px-3 bg-[#0A0A0A] text-white text-[11px] font-mono uppercase tracking-[0.08em] hover:bg-[#27272A] transition-colors"
              >
                {t.filterAll}
              </button>
            )}
          </div>

          {/* Trending Suggestions */}
          {!query && (
            <div className="mb-6">
              <span className="block text-[11px] font-mono tracking-[0.12em] uppercase text-[#71717A] mb-3">
                {t.curatedQueries}
              </span>
              <div className="flex flex-wrap gap-2">
                {t.trending.map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="h-8 px-3.5 bg-[#FFFFFF] border border-[#E4E4E7] text-[11px] font-mono tracking-[0.04em] text-[#0A0A0A] hover:border-[#0A0A0A] hover:bg-[#F9F9F9] transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Search Results */}
          {query.trim() && (
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E4E4E7] text-[11px] font-mono uppercase tracking-[0.1em] text-[#71717A]">
                <span>{t.matchingWorks} [{filtered.length}]</span>
                <span>{t.pressEnter}</span>
              </div>

              {filtered.length === 0 ? (
                <div className="py-12 text-center text-[#71717A]">
                  <p className="font-serif text-xl text-[#0A0A0A] mb-1">{t.noFoundTitle}</p>
                  <p className="text-[12px]">{t.noFoundHint}</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E4E4E7] max-h-[380px] overflow-y-auto">
                  {filtered.map((product) => {
                    const displayProd = translateProduct(product, language);
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelect(product)}
                        className="py-3.5 flex items-center justify-between group cursor-pointer hover:bg-[#F9F9F9] px-2 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 aspect-[3/4] bg-[#F4F4F5] border border-[#E4E4E7] overflow-hidden shrink-0">
                            <img
                              src={product.images[0]}
                              alt={displayProd.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <h4 className="text-[13px] font-medium text-[#0A0A0A] group-hover:text-[#71717A] transition-colors">
                              {displayProd.name}
                            </h4>
                            <span className="text-[11px] font-mono text-[#71717A]">
                              {translateCategory(product.category, language)} · {displayProd.color} · {product.sku}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-mono text-[13px] font-semibold text-[#0A0A0A]">
                            {product.price.toLocaleString()} {translateCurrency(product.currency, language)}
                          </span>
                          <ArrowRight size={15} className="text-[#71717A] group-hover:text-[#0A0A0A] transition-colors rtl:rotate-180" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
