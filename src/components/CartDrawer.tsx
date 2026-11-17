import React, { useEffect } from 'react';
import { Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';
import {
  Language,
  STORE_STRINGS,
  translateCurrency,
  translateProduct
} from '../utils/i18n';

interface CartDrawerProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  items: CartItem[];
  freeShippingThreshold?: number;
  shippingFee?: number;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  onOpenProduct: (item: CartItem) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  language,
  onClose,
  items,
  freeShippingThreshold = 1500,
  shippingFee: baseShippingFee = 60,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onOpenProduct
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

  const t = STORE_STRINGS[language].cart;
  const isRtl = language === 'ar';
  const currencyLabel = translateCurrency('EGP', language);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const progressToFreeShipping =
    freeShippingThreshold > 0 ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 100;
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : baseShippingFee;

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
      {/* Semi-translucent backdrop with 4px blur */}
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
        {/* 420px Fixed Width Slide-Over Drawer */}
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
                [{items.reduce((acc, i) => acc + i.quantity, 0)} {t.items}]
              </span>
            </div>
          </div>

          {/* Complimentary Shipping Progress Banner */}
          <div className="px-6 py-3.5 bg-[#F9F9F9] border-b border-[#E4E4E7]">
            <div className="flex justify-between items-center text-[11px] font-mono tracking-[0.06em] text-[#0A0A0A] mb-1.5">
              <span>
                {remainingForFree === 0
                  ? t.freeUnlocked
                  : `${t.addPrefix} ${remainingForFree.toLocaleString()} ${t.addSuffix}`}
              </span>
              <span>{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full h-1 bg-[#E4E4E7] overflow-hidden">
              <div
                className="h-full bg-[#0A0A0A] transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Itemized List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-[#E4E4E7]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <span className="font-serif text-3xl text-[#dadada] mb-3">{t.voidTitle}</span>
                <p className="text-[13px] text-[#71717A] max-w-xs mb-6">
                  {t.voidBody}
                </p>
                <button
                  onClick={onClose}
                  className="h-11 px-6 bg-[#0A0A0A] text-[#FFFFFF] text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#27272A] transition-colors"
                >
                  {t.exploreHoodies}
                </button>
              </div>
            ) : (
              items.map((item) => {
                const displayProd = translateProduct(item.product, language);
                return (
                  <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex gap-4">
                    {/* Thumbnail (3:4 ratio) */}
                    <div
                      onClick={() => {
                        onOpenProduct(item);
                        onClose();
                      }}
                      className="w-20 aspect-[3/4] bg-[#F4F4F5] border border-[#E4E4E7] overflow-hidden shrink-0 cursor-pointer group"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={displayProd.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            onClick={() => {
                              onOpenProduct(item);
                              onClose();
                            }}
                            className="text-[13px] font-medium leading-[18px] text-[#0A0A0A] hover:text-[#71717A] cursor-pointer transition-colors"
                          >
                            {displayProd.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-[#71717A] hover:text-[#ba1a1a] p-1 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="mt-1 flex items-center gap-3 text-[11px] font-mono text-[#71717A]">
                          <span>{t.sizeLabel} {item.size}</span>
                          <span>·</span>
                          <span>{displayProd.color}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#E4E4E7]">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 h-7 flex items-center justify-center text-[12px] font-mono text-[#0A0A0A]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Line Item Total */}
                        <span className="font-mono text-[13px] font-semibold text-[#0A0A0A]">
                          {(item.product.price * item.quantity).toLocaleString()}{' '}
                          {translateCurrency(item.product.currency, language)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 bg-[#FFFFFF] border-t border-[#E4E4E7] space-y-4">
              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between text-[#71717A]">
                  <span>{t.subtotal}</span>
                  <span className="font-mono text-[#0A0A0A]">
                    {subtotal.toLocaleString()} {currencyLabel}
                  </span>
                </div>
                <div className="flex justify-between text-[#71717A]">
                  <span>{t.delivery}</span>
                  <span className="font-mono text-[#0A0A0A]">
                    {shippingFee === 0 ? t.complimentary : `${shippingFee} ${currencyLabel}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#71717A]">
                  <span>{t.taxes}</span>
                  <span className="font-mono text-[#0A0A0A]">{t.included}</span>
                </div>
                <div className="pt-2 border-t border-[#E4E4E7] flex justify-between text-[14px] font-semibold text-[#0A0A0A]">
                  <span>{t.total}</span>
                  <span className="font-mono">
                    {(subtotal + shippingFee).toLocaleString()} {currencyLabel}
                  </span>
                </div>
              </div>

              {/* Checkout Primary Button */}
              <button
                onClick={onProceedToCheckout}
                className="checkout-hover-button w-full h-12 bg-[#0A0A0A] text-[#FFFFFF] text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors duration-200 hover:bg-[#27272A] flex items-center justify-center gap-2"
              >
                <span>{t.proceedCheckout}</span>
                <ArrowRight size={16} className="rtl:rotate-180" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#71717A] uppercase tracking-[0.08em]">
                <ShieldCheck size={13} />
                <span>{t.authenticNote}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
