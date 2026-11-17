import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, Menu, Languages, Moon, Sun } from 'lucide-react';
import { ActivePage, Category } from '../types';
import { Language, STORE_STRINGS } from '../utils/i18n';

interface HeaderProps {
  cartCount: number;
  isBagAlertActive?: boolean;
  wishlistCount: number;
  activePage: ActivePage;
  isAdminUser: boolean;
  language: Language;
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onTogglePage: (page: ActivePage) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onSelectCategory: (category: Category) => void;
  onNavigateHome: () => void;
  onOpenLookbook: () => void;
  onOpenMonograph: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  isBagAlertActive = false,
  wishlistCount,
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onTogglePage,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onSelectCategory,
  onNavigateHome,
  onOpenLookbook,
  onOpenMonograph
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = STORE_STRINGS[language].nav;
  const isRtl = language === 'ar';

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFFFF] text-[#0A0A0A] border-b border-[#F4F4F5]">
        <div className="h-[64px] md:h-[72px] px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto flex items-center justify-between">
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#0A0A0A] hover:opacity-70 transition-opacity"
            aria-label={t.toggleMenu}
          >
            <Menu size={20} />
          </button>

          {/* Left Navigation Anchors (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#0A0A0A]">
            <button
              onClick={() => {
                onTogglePage('storefront');
                onNavigateHome();
                onSelectCategory('All');
              }}
              className="editorial-underline py-1 transition-colors hover:text-[#71717A]"
            >
              {t.collection}
            </button>
            <button
              onClick={() => {
                onTogglePage('storefront');
                onNavigateHome();
                onSelectCategory('Signature Editions');
              }}
              className="editorial-underline py-1 transition-colors hover:text-[#71717A]"
            >
              {t.signatures}
            </button>
            <button
              onClick={() => {
                onTogglePage('storefront');
                onNavigateHome();
                onSelectCategory('Graphic Series');
              }}
              className="editorial-underline py-1 transition-colors hover:text-[#71717A]"
            >
              {t.graphicSeries}
            </button>
            <button
              onClick={() => {
                onTogglePage('storefront');
                onOpenLookbook();
              }}
              className="editorial-underline py-1 transition-colors hover:text-[#71717A]"
            >
              {t.lookbook}
            </button>
            <button
              onClick={() => {
                onTogglePage('storefront');
                onOpenMonograph();
              }}
              className="editorial-underline py-1 transition-colors hover:text-[#71717A]"
            >
              {t.monograph}
            </button>
          </nav>

          {/* Centralized Logotype */}
          <div className="flex-1 text-center md:flex-initial">
            <button
              onClick={() => {
                onTogglePage('storefront');
                onNavigateHome();
              }}
              className="font-serif text-2xl md:text-3xl tracking-[-0.03em] font-normal text-[#0A0A0A] hover:opacity-85 transition-opacity"
            >
              ORRA BIT
            </button>
          </div>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5">
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 text-[#0A0A0A] hover:opacity-70 transition-opacity"
              aria-label={isDarkMode ? t.switchToLightMode : t.switchToDarkMode}
              title={isDarkMode ? t.switchToLightMode : t.switchToDarkMode}
            >
              {isDarkMode ? (
                <Sun size={17} strokeWidth={1.6} />
              ) : (
                <Moon size={17} strokeWidth={1.6} />
              )}
            </button>

            {/* Translate Site Toggle Icon */}
            <button
              onClick={onToggleLanguage}
              className="h-8 px-2 hover:bg-[#ECECEE] active:bg-[#E0E0E4] text-[#0A0A0A] transition-colors duration-200 flex items-center gap-1.5"
              aria-label={t.switchLangLabel}
              title={t.switchLangLabel}
            >
              <Languages size={15} strokeWidth={1.6} />
              <span className="text-[10px] font-mono font-semibold tracking-[0.06em]">
                {t.switchLangShort}
              </span>
            </button>

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 text-[#0A0A0A] hover:text-[#71717A] transition-colors flex items-center gap-1.5"
              aria-label={t.searchCollection}
            >
              <Search size={18} strokeWidth={1.5} />
              <span className="hidden xl:inline text-[11px] font-semibold tracking-[0.12em] uppercase">
                {t.search}
              </span>
            </button>

            {/* Wishlist Trigger */}
            <button
              onClick={onOpenWishlist}
              className="relative p-1.5 text-[#0A0A0A] hover:text-[#71717A] transition-colors"
              aria-label={t.viewWishlist}
            >
              <Heart size={18} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 text-[9px] font-mono flex items-center justify-center bg-[#0A0A0A] text-[#FFFFFF]">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-1.5 text-[#0A0A0A] hover:text-[#71717A] transition-colors flex items-center gap-2"
              aria-label={t.viewBag}
            >
              <span className="relative inline-flex items-center">
                <ShoppingBag size={18} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="sm:hidden absolute -top-1.5 -right-2 w-4 h-4 text-[9px] font-mono flex items-center justify-center bg-[#0A0A0A] text-[#FFFFFF]">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline text-[11px] font-semibold tracking-[0.12em] uppercase">
                {t.bag} {cartCount > 0 && `(${cartCount})`}
              </span>
              {isBagAlertActive && (
                <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FACC15] opacity-85" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EAB308] animate-pulse shadow-[0_0_8px_#FACC15]" />
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        aria-hidden={!mobileMenuOpen}
        className={`md:hidden fixed inset-0 top-[65px] z-50 bg-[#0A0A0A]/45 backdrop-blur-[3px] flex transition-[opacity,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          mobileMenuOpen
            ? 'opacity-100 visible pointer-events-auto'
            : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`w-[86%] max-w-sm h-full bg-[#FFFFFF] border-t ${
            isRtl ? 'border-l' : 'border-r'
          } border-[#E4E4E7] flex flex-col overflow-hidden shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileMenuOpen
              ? 'translate-x-0'
              : isRtl
              ? 'translate-x-full'
              : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-6 flex flex-col gap-1.5">
            <button
              onClick={() => {
                onTogglePage('storefront');
                onNavigateHome();
                onSelectCategory('All');
                setMobileMenuOpen(false);
              }}
              className={`${isRtl ? 'text-right' : 'text-left'} -mx-3 px-3 py-2.5 font-serif text-2xl text-[#0A0A0A] transition-colors duration-200 hover:bg-[#ECECEE] active:bg-[#E0E0E4]`}
            >
              {t.collectionFull}
            </button>
            <button
              onClick={() => {
                onTogglePage('storefront');
                onNavigateHome();
                onSelectCategory('Signature Editions');
                setMobileMenuOpen(false);
              }}
              className={`${isRtl ? 'text-right' : 'text-left'} -mx-3 px-3 py-2.5 text-sm font-semibold tracking-[0.08em] uppercase text-[#0A0A0A] transition-colors duration-200 hover:bg-[#ECECEE] active:bg-[#E0E0E4]`}
            >
              {t.signaturesFull}
            </button>
            <button
              onClick={() => {
                onTogglePage('storefront');
                onNavigateHome();
                onSelectCategory('Graphic Series');
                setMobileMenuOpen(false);
              }}
              className={`${isRtl ? 'text-right' : 'text-left'} -mx-3 px-3 py-2.5 text-sm font-semibold tracking-[0.08em] uppercase text-[#0A0A0A] transition-colors duration-200 hover:bg-[#ECECEE] active:bg-[#E0E0E4]`}
            >
              {t.graphicFull}
            </button>
            <button
              onClick={() => {
                onTogglePage('storefront');
                onNavigateHome();
                onSelectCategory('Minimalist Oversized');
                setMobileMenuOpen(false);
              }}
              className={`${isRtl ? 'text-right' : 'text-left'} -mx-3 px-3 py-2.5 text-sm font-semibold tracking-[0.08em] uppercase text-[#0A0A0A] transition-colors duration-200 hover:bg-[#ECECEE] active:bg-[#E0E0E4]`}
            >
              {t.minimalistFull}
            </button>
            <button
              onClick={() => {
                onTogglePage('storefront');
                onNavigateHome();
                onSelectCategory('Earthy Tones');
                setMobileMenuOpen(false);
              }}
              className={`${isRtl ? 'text-right' : 'text-left'} -mx-3 px-3 py-2.5 text-sm font-semibold tracking-[0.08em] uppercase text-[#0A0A0A] transition-colors duration-200 hover:bg-[#ECECEE] active:bg-[#E0E0E4]`}
            >
              {t.earthyFull}
            </button>
            <button
              onClick={() => {
                onTogglePage('storefront');
                onNavigateHome();
                onSelectCategory('Deep Navy');
                setMobileMenuOpen(false);
              }}
              className={`${isRtl ? 'text-right' : 'text-left'} -mx-3 px-3 py-2.5 text-sm font-semibold tracking-[0.08em] uppercase text-[#0A0A0A] transition-colors duration-200 hover:bg-[#ECECEE] active:bg-[#E0E0E4]`}
            >
              {t.navyFull}
            </button>
            <hr className="border-[#E4E4E7] my-2" />
            <button
              onClick={() => {
                onTogglePage('storefront');
                onOpenLookbook();
                setMobileMenuOpen(false);
              }}
              className={`${isRtl ? 'text-right' : 'text-left'} -mx-3 px-3 py-2.5 text-sm font-semibold tracking-[0.08em] uppercase text-[#71717A] transition-colors duration-200 hover:bg-[#ECECEE] active:bg-[#E0E0E4] hover:text-[#0A0A0A] active:text-[#0A0A0A]`}
            >
              {t.editorialLookbook}
            </button>
            <button
              onClick={() => {
                onTogglePage('storefront');
                onOpenMonograph();
                setMobileMenuOpen(false);
              }}
              className={`${isRtl ? 'text-right' : 'text-left'} -mx-3 px-3 py-2.5 text-sm font-semibold tracking-[0.08em] uppercase text-[#71717A] transition-colors duration-200 hover:bg-[#ECECEE] active:bg-[#E0E0E4] hover:text-[#0A0A0A] active:text-[#0A0A0A]`}
            >
              {t.theMonograph}
            </button>
          </div>

          <div className="px-6 py-4 border-t border-[#E4E4E7] text-[11px] font-mono text-[#71717A] flex justify-between items-center shrink-0 bg-[#FFFFFF]">
            <span>{t.footerTagLeft}</span>
            <span>{t.footerTagRight}</span>
          </div>
        </div>
      </div>
    </>
  );
};
