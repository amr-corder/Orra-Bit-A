import React, { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Product, ProductSize } from '../types';
import {
  Language,
  STORE_STRINGS,
  translateCurrency,
  translateProduct
} from '../utils/i18n';

interface WishlistDrawerProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onMoveToCart: (product: Product, size: ProductSize) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  language,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onMoveToCart,
  onSelectProduct
}) => {
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

  const t = STORE_STRINGS[language].wishlist;
  const isRtl = language === 'ar';

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 overflow-hidden transition-[opacity,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen
          ? 'opacity-100 visible pointer-events-auto'
          : 'opacity-0 invisible pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-[4px] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className="fixed inset-y-0 ltr:right-0 rtl:left-0 max-w-full flex ltr:pl-10 rtl:pr-10"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-screen max-w-[420px] bg-[#FFFFFF] ltr:border-l rtl:border-r border-[#E4E4E7] flex flex-col justify-between shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen
              ? 'translate-x-0'
              : isRtl
              ? '-translate-x-full'
              : 'translate-x-full'
          }`}
        >
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E4E4E7] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-serif text-xl tracking-tight text-[#0A0A0A]">{t.title}</span>
              <span className="text-[11px] font-mono tracking-[0.1em] text-[#71717A]">
                [{wishlist.length} {t.pieces}]
              </span>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-[#E4E4E7]">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <span className="font-serif text-3xl text-[#dadada] mb-3">{t.emptyTitle}</span>
                <p className="text-[13px] text-[#71717A] max-w-xs mb-6">
                  {t.emptyBody}
                </p>
                <button
                  onClick={onClose}
                  className="h-11 px-6 bg-[#0A0A0A] text-[#FFFFFF] text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#27272A] transition-colors"
                >
                  {t.exploreCollection}
                </button>
              </div>
            ) : (
              wishlist.map((product) => {
                const displayProd = translateProduct(product, language);
                return (
                  <div key={product.id} className="py-5 first:pt-0 last:pb-0 flex gap-4">
                    <div
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="w-20 aspect-[3/4] bg-[#F4F4F5] border border-[#E4E4E7] overflow-hidden shrink-0 cursor-pointer group"
                    >
                      <img
                        src={product.images[0]}
                        alt={displayProd.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            onClick={() => {
                              onSelectProduct(product);
                              onClose();
                            }}
                            className="text-[13px] font-medium leading-[18px] text-[#0A0A0A] hover:text-[#71717A] cursor-pointer transition-colors"
                          >
                            {displayProd.name}
                          </h4>
                          <button
                            onClick={() => onRemoveFromWishlist(product)}
                            className="text-[#71717A] hover:text-[#ba1a1a] p-1 transition-colors"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-[#71717A]">
                          <span>{displayProd.color}</span>
                          <span className="font-semibold text-[#0A0A0A]">
                            {product.price.toLocaleString()} {translateCurrency(product.currency, language)}
                          </span>
                        </div>
                      </div>

                      {/* Move to Bag Action */}
                      <div className="pt-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-[#71717A] uppercase mr-1">
                            {t.addLabel}
                          </span>
                          {product.inStockSizes.slice(0, 4).map((size) => (
                            <button
                              key={size}
                              onClick={() => {
                                onMoveToCart(product, size);
                              }}
                              className="h-7 px-2.5 text-[10px] font-mono border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-colors"
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {wishlist.length > 0 && (
            <div className="p-6 bg-[#FFFFFF] border-t border-[#E4E4E7]">
              <p className="text-[11px] font-mono text-[#71717A] text-center mb-3 uppercase tracking-[0.06em]">
                {t.reservedNote}
              </p>
              <button
                onClick={onClose}
                className="w-full h-11 bg-transparent border border-[#0A0A0A] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#0A0A0A] hover:text-white transition-colors"
              >
                {t.continueBrowsing}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
