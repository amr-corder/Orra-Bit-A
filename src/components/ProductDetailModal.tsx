import React, { useState, useEffect } from 'react';
import { Heart, Ruler, ChevronDown, ChevronUp, Truck } from 'lucide-react';
import { Product, ProductSize } from '../types';
import {
  Language,
  STORE_STRINGS,
  translateCategory,
  translateCurrency,
  translateProduct
} from '../utils/i18n';

interface ProductDetailModalProps {
  product: Product | null;
  language: Language;
  onClose: () => void;
  onAddToCart: (product: Product, size: ProductSize) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  language,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('materials');

  useEffect(() => {
    if (product) {
      setActiveImageIdx(0);
      setSelectedSize(product.inStockSizes[0] || product.sizes[0]);
      setShowSizeGuide(false);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const displayProduct = translateProduct(product, language);
  const t = STORE_STRINGS[language].pdp;
  const currencyLabel = translateCurrency(product.currency, language);

  const handleAdd = () => {
    if (!product.inStockSizes.includes(selectedSize)) return;
    onAddToCart(product, selectedSize);
    onClose();
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  return (
    <div className="product-detail-modal fixed inset-0 z-50 overflow-y-auto">
      {/* Semi-translucent Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A0A0A]/50 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      />

      <div
        onClick={onClose}
        className="relative min-h-screen flex items-center justify-center p-4 md:p-8"
      >
        {/* Modal Container: strictly architectural sharp corners (rounded-0) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-2xl overflow-hidden my-8"
        >
          
          {/* Top Bar with SKU */}
          <div className="h-14 px-6 md:px-8 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FFFFFF]">
            <div className="flex items-center gap-3 text-[11px] font-mono tracking-[0.14em] text-[#71717A] uppercase">
              <span>{product.sku}</span>
              <span>/</span>
              <span>{translateCategory(product.category, language)}</span>
              {displayProduct.editorialKicker && (
                <>
                  <span>/</span>
                  <span className="text-[#0A0A0A] hidden sm:inline">{displayProduct.editorialKicker}</span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Multi-Angle Gallery (7 Cols) */}
            <div className="lg:col-span-7 p-6 md:p-8 border-b lg:border-b-0 lg:border-r rtl:lg:border-r-0 rtl:lg:border-l border-[#E4E4E7] bg-[#F9F9F9] flex flex-col justify-between">
              {/* Primary Image Viewport (3:4 ratio) */}
              <div className="relative w-full aspect-[3/4] bg-[#FFFFFF] border border-[#E4E4E7] overflow-hidden mb-4">
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={`${displayProduct.name} - ${activeImageIdx + 1}`}
                  className="w-full h-full object-cover object-center image-zoom-transition hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Thumbnails Row */}
              <div className="grid grid-cols-3 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-[3/4] border transition-all overflow-hidden ${
                      activeImageIdx === idx
                        ? 'border-[#0A0A0A] ring-1 ring-[#0A0A0A]'
                        : 'border-[#E4E4E7] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${displayProduct.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Contiguous Purchase Module (5 Cols) */}
            <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between bg-[#FFFFFF]">
              <div>
                {/* Header Metadata */}
                <div className="mb-6">
                  <span className="block text-[11px] font-mono tracking-[0.12em] text-[#71717A] uppercase mb-1">
                    {displayProduct.origin}
                  </span>
                  <h1 className="font-serif text-2xl md:text-3xl text-[#0A0A0A] leading-tight mb-2">
                    {displayProduct.name}
                  </h1>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="font-mono text-xl font-semibold text-[#0A0A0A]">
                      {product.price.toLocaleString()} {currencyLabel}
                    </span>
                    <span className="text-[12px] font-sans text-[#71717A]">
                      {t.color} <strong className="text-[#0A0A0A] font-medium">{displayProduct.color}</strong>
                    </span>
                  </div>
                </div>

                {/* Editorial Description */}
                <p className="text-[13px] leading-[22px] text-[#444748] mb-6 pb-6 border-b border-[#E4E4E7]">
                  {displayProduct.description}
                </p>

                {/* Size Selector */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold tracking-[0.1em] text-[#0A0A0A] uppercase">
                      {t.selectSize}
                    </span>
                    <button
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                      className="text-[11px] font-mono text-[#71717A] hover:text-[#0A0A0A] transition-colors flex items-center gap-1"
                    >
                      <Ruler size={13} />
                      <span className="underline">{t.sizingMonograph}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {product.sizes.map((size) => {
                      const inStock = product.inStockSizes.includes(size);
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          disabled={!inStock}
                          onClick={() => setSelectedSize(size)}
                          className={`h-11 text-[12px] font-mono tracking-[0.08em] transition-all flex items-center justify-center border ${
                            !inStock
                              ? 'bg-[#F4F4F5] text-[#c4c7c7] border-[#E4E4E7] line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#0A0A0A] text-[#FFFFFF] border-[#0A0A0A]'
                              : 'bg-[#FFFFFF] text-[#0A0A0A] border-[#E4E4E7] hover:border-[#0A0A0A]'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>

                  {/* Size Guide Preview Card */}
                  {showSizeGuide && (
                    <div className="mt-3 p-3 bg-[#F9F9F9] border border-[#E4E4E7] text-[11px] font-mono space-y-1.5 animate-in fade-in duration-150">
                      <div className="font-semibold text-[#0A0A0A] uppercase pb-1 border-b border-[#E4E4E7]">
                        {t.cutMatrixTitle}
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[#71717A]">
                        <span>{t.chestS}</span>
                        <span>{t.chestM}</span>
                        <span>{t.chestL}</span>
                        <span>{t.chestXL}</span>
                      </div>
                      <p className="text-[10px] text-[#71717A] pt-1">
                        {t.sizingNote}
                      </p>
                    </div>
                  )}
                </div>

                {/* Primary Buy & Wishlist CTAs */}
                <div className="space-y-2.5 mb-8">
                  <button
                    onClick={handleAdd}
                    disabled={!product.inStockSizes.includes(selectedSize)}
                    className="w-full h-12 bg-[#0A0A0A] text-[#FFFFFF] text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors duration-200 hover:bg-[#27272A] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {t.addToBag} — {product.price.toLocaleString()} {currencyLabel}
                    </span>
                  </button>

                  <button
                    onClick={() => onToggleWishlist(product)}
                    className="w-full h-11 bg-transparent text-[#0A0A0A] border border-[#0A0A0A] text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors duration-200 hover:bg-[#0A0A0A] hover:text-[#FFFFFF] flex items-center justify-center gap-2"
                  >
                    <Heart size={15} className={isWishlisted ? 'fill-current' : ''} />
                    <span>{isWishlisted ? t.savedArchive : t.saveArchive}</span>
                  </button>
                </div>

                {/* Architectural Accordion Specs */}
                <div className="border-t border-[#E4E4E7] divide-y divide-[#E4E4E7]">
                  {/* Accordion 1: Material & Provenance */}
                  <div>
                    <button
                      onClick={() => toggleAccordion('materials')}
                      className="w-full py-3.5 flex items-center justify-between text-[12px] font-semibold tracking-[0.08em] uppercase text-[#0A0A0A]"
                    >
                      <span>{t.materialsTitle}</span>
                      {openAccordion === 'materials' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {openAccordion === 'materials' && (
                      <div className="pb-3.5 text-[12px] text-[#71717A] space-y-1">
                        <p>
                          <strong className="text-[#0A0A0A]">{t.compositionLabel}</strong>{' '}
                          {displayProduct.composition}
                        </p>
                        <p>
                          <strong className="text-[#0A0A0A]">{t.originLabel}</strong>{' '}
                          {displayProduct.origin}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: Silhouette & Cut */}
                  <div>
                    <button
                      onClick={() => toggleAccordion('fit')}
                      className="w-full py-3.5 flex items-center justify-between text-[12px] font-semibold tracking-[0.08em] uppercase text-[#0A0A0A]"
                    >
                      <span>{t.fitTitle}</span>
                      {openAccordion === 'fit' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {openAccordion === 'fit' && (
                      <div className="pb-3.5 text-[12px] text-[#71717A]">
                        <p>{displayProduct.fit}</p>
                      </div>
                    )}
                  </div>

                  {/* Accordion 3: Care Guide */}
                  <div>
                    <button
                      onClick={() => toggleAccordion('care')}
                      className="w-full py-3.5 flex items-center justify-between text-[12px] font-semibold tracking-[0.08em] uppercase text-[#0A0A0A]"
                    >
                      <span>{t.careTitle}</span>
                      {openAccordion === 'care' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {openAccordion === 'care' && (
                      <div className="pb-3.5 text-[12px] text-[#71717A]">
                        <p>{displayProduct.care}</p>
                      </div>
                    )}
                  </div>

                  {/* Accordion 4: Insured Delivery */}
                  <div>
                    <button
                      onClick={() => toggleAccordion('shipping')}
                      className="w-full py-3.5 flex items-center justify-between text-[12px] font-semibold tracking-[0.08em] uppercase text-[#0A0A0A]"
                    >
                      <span>{t.shippingTitle}</span>
                      {openAccordion === 'shipping' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {openAccordion === 'shipping' && (
                      <div className="pb-3.5 text-[12px] text-[#71717A] space-y-1.5">
                        <p>{t.shippingBody1}</p>
                        <p>{t.shippingBody2}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Security Note */}
              <div className="pt-6 border-t border-[#E4E4E7] flex items-center gap-2 text-[10px] font-mono text-[#71717A] uppercase tracking-[0.08em]">
                <Truck size={13} />
                <span>{t.dispatchNote}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
