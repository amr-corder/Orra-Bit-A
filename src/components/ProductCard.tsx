import React, { useState } from 'react';
import { Heart, Check } from 'lucide-react';
import { Product, ProductSize } from '../types';
import {
  Language,
  STORE_STRINGS,
  translateCategory,
  translateCurrency,
  translateProduct
} from '../utils/i18n';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  language: Language;
  onToggleWishlist: (product: Product) => void;
  onQuickAdd: (product: Product, size: ProductSize) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  language,
  onToggleWishlist,
  onQuickAdd,
  onSelectProduct
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [justAddedSize, setJustAddedSize] = useState<ProductSize | null>(null);
  const [imgError, setImgError] = useState(false);

  const displayProduct = translateProduct(product, language);
  const t = STORE_STRINGS[language].card;

  const handleSizeClick = (e: React.MouseEvent, size: ProductSize) => {
    e.stopPropagation();
    if (!product.inStockSizes.includes(size)) return;
    onQuickAdd(product, size);
    setJustAddedSize(size);
    setTimeout(() => {
      setJustAddedSize(null);
    }, 1200);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  return (
    <div
      className="group relative flex flex-col bg-[#FFFFFF] border border-[#E4E4E7] transition-colors duration-200 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelectProduct(product)}
    >
      {/* 3:4 Vertical Aspect Ratio Container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F4F4F5]">
        {/* Main Image with smooth zoom transition */}
        {!imgError ? (
          <img
            src={product.images[0]}
            alt={displayProduct.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center image-zoom-transition group-hover:scale-[1.03]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#F3F3F4] text-[#71717A] text-center">
            <span className="font-serif text-lg text-[#0A0A0A] mb-1">ORRA BIT</span>
            <span className="text-[11px] font-mono uppercase tracking-[0.12em]">{product.sku}</span>
          </div>
        )}

        {/* Editorial kicker badge (quiet text) */}
        {product.isNew && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#FFFFFF]/90 backdrop-blur-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1 border border-[#E4E4E7]">
            <span className="text-[8px] sm:text-[10px] font-mono tracking-[0.08em] sm:tracking-[0.1em] text-[#0A0A0A] uppercase">
              {t.newEdition}
            </span>
          </div>
        )}

        {/* Circular Wishlist Badge */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#FFFFFF] border border-[#E4E4E7] flex items-center justify-center transition-all duration-200 hover:scale-[1.08] hover:border-[#0A0A0A] z-10 ${
            isWishlisted ? 'text-[#0A0A0A] border-[#0A0A0A]' : 'text-[#71717A]'
          }`}
          aria-label={isWishlisted ? t.removeWishlist : t.addWishlist}
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={`sm:w-4 sm:h-4 ${isWishlisted ? 'fill-[#0A0A0A]' : ''}`}
          />
        </button>

        {/* Quick-Add Overlay Panel: Slides up from the bottom of the card on hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#0A0A0A] p-3 transition-transform duration-300 ease-out z-20 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
          } sm:block hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#E4E4E7]">
              {t.instantSelect}
            </span>
            {justAddedSize && (
              <span className="text-[10px] font-mono tracking-[0.08em] text-emerald-400 flex items-center gap-1">
                <Check size={11} /> {t.added} {justAddedSize}
              </span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {product.sizes.map((size) => {
              const inStock = product.inStockSizes.includes(size);
              const isSelected = justAddedSize === size;
              return (
                <button
                  key={size}
                  disabled={!inStock}
                  onClick={(e) => handleSizeClick(e, size)}
                  className={`h-8 text-[11px] font-mono tracking-[0.08em] transition-all flex items-center justify-center ${
                    !inStock
                      ? 'bg-[#1C1B1B] text-[#555] line-through cursor-not-allowed border border-transparent'
                      : isSelected
                      ? 'bg-white text-[#0A0A0A] font-bold border border-white'
                      : 'bg-transparent text-white border border-[#333336] hover:bg-white hover:text-[#0A0A0A] hover:border-white'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metadata Area */}
      <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 bg-[#FFFFFF] border-t border-[#E4E4E7]">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3 mb-1.5">
          <h3 className="text-[12px] sm:text-[14px] font-medium leading-[17px] sm:leading-[20px] text-[#0A0A0A] group-hover:text-[#71717A] transition-colors line-clamp-2">
            {displayProduct.name}
          </h3>
          <span className="text-[11px] sm:text-[13px] font-semibold tracking-[0.06em] sm:tracking-[0.08em] text-[#0A0A0A] whitespace-nowrap font-mono">
            {product.price.toLocaleString()} {translateCurrency(product.currency, language)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-sans text-[#71717A] tracking-[0.02em] pt-1 border-t border-[#F4F4F5]">
          <span className="truncate">{displayProduct.color}</span>
          <span className="font-mono text-[9px] sm:text-[10px] text-[#71717A] truncate hidden sm:inline">
            {translateCategory(product.category, language)}
          </span>
        </div>

        {/* Mobile Quick Add Row */}
        <div className="mt-2 sm:hidden pt-2 border-t border-[#E4E4E7] flex flex-wrap items-center justify-between gap-1">
          <span className="text-[9px] font-mono text-[#71717A]">{t.sizeLabel}</span>
          <div className="flex items-center flex-wrap gap-1">
            {product.sizes.map((size) => {
              const inStock = product.inStockSizes.includes(size);
              const isSelected = justAddedSize === size;
              return (
                <button
                  key={size}
                  disabled={!inStock}
                  onClick={(e) => handleSizeClick(e, size)}
                  className={`min-w-[21px] h-[21px] px-1 text-[9px] font-mono flex items-center justify-center border transition-colors ${
                    !inStock
                      ? 'border-[#E4E4E7] text-[#c4c7c7] line-through'
                      : isSelected
                      ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#FFFFFF]'
                      : 'border-[#0A0A0A] text-[#0A0A0A]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
