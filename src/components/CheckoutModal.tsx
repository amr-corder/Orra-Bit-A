import React, { useState, useEffect } from 'react';
import {
  Check,
  ShieldCheck,
  Truck,
  Smartphone,
  Banknote,
  Zap,
  Lock,
  ArrowLeft,
  ArrowRight,
  Copy,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { CartItem, PaymentMethod, StoreSettings } from '../types';
import { createOrderInDb } from '../services/supabaseOrderService';
import {
  Language,
  STORE_STRINGS,
  translateCurrency,
  translateProduct
} from '../utils/i18n';
import { DispatchAnimation } from './DispatchAnimation';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  storeSettings: StoreSettings;
  onOrderCompleted: () => void;
  language: Language;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  storeSettings,
  onOrderCompleted,
  language
}) => {
  const t = STORE_STRINGS[language].checkout;
  const currencyLabel = translateCurrency('EGP', language);
  const paymentMethodLabels: Record<PaymentMethod, string> = {
    instapay: t.instapayTitle,
    'vodafone-cash': t.vodafoneTitle,
    cod: t.codTitle
  };
  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('instapay');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: 'Karim',
    lastName: 'El-Sayed',
    email: 'karim@atelier-cairo.com',
    phone: '01012345678',
    address: '26th of July Corridor, Zamalek',
    city: 'Cairo',
    postalCode: '11211',
    country: 'Egypt',
    instapayHandle: '',
    vodafoneSenderNumber: '',
    codNotes: '',
    saveInfo: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [settledTotal, setSettledTotal] = useState(0);
  const [showDispatchAnim, setShowDispatchAnim] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setShowDispatchAnim(false);
      setSubmitError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee =
    subtotal === 0 || subtotal >= storeSettings.freeShippingThreshold
      ? 0
      : storeSettings.shippingFee;
  const total = subtotal + shippingFee;

  const handleCopy = (value: string, fieldKey: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopiedField(fieldKey);
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (cartItems.length === 0) {
      return;
    }

    const generatedOrderNumber = `OV-HD26-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentReference =
      paymentMethod === 'instapay'
        ? formData.instapayHandle
        : paymentMethod === 'vodafone-cash'
          ? formData.vodafoneSenderNumber
          : formData.codNotes;

    setIsSubmitting(true);
    try {
      await createOrderInDb({
        orderNumber: generatedOrderNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        paymentMethod,
        paymentReference: paymentReference || '',
        items: cartItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.images[0] || ''
        })),
        subtotal,
        shippingFee,
        total
      });

      setSettledTotal(total);
      setOrderNumber(generatedOrderNumber);
      setShowDispatchAnim(true);
      setStep('confirmed');
      onOrderCompleted();
    } catch (err) {
      let message = t.orderSaveFailedError;
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.error) message = `${t.orderSaveFailedPrefix} ${parsed.error}`;
        } catch {
          message = err.message;
        }
      }
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Semi-translucent backdrop */}
      <div
        className="fixed inset-0 bg-[#0A0A0A]/50 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      />

      <div
        className="relative min-h-screen flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-2xl overflow-hidden my-6"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="h-16 px-6 md:px-8 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FFFFFF]">
            <div className="flex items-center gap-3">
              <span className="font-serif text-2xl text-[#0A0A0A]">ORRA BIT</span>
              <span className="text-[#c4c7c7]">/</span>
              <span className="text-[11px] font-mono tracking-[0.14em] uppercase text-[#71717A]">
                {step === 'details' && t.stepDetails}
                {step === 'payment' && t.stepPayment}
                {step === 'confirmed' && t.stepConfirmed}
              </span>
            </div>
          </div>

          {step === 'confirmed' ? (
            showDispatchAnim ? (
              <DispatchAnimation
                orderNumber={orderNumber}
                language={language}
                onComplete={() => setShowDispatchAnim(false)}
              />
            ) : (
            /* Order Confirmed View */
            <div className="p-8 md:p-12 text-center max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="w-16 h-16 border border-[#0A0A0A] mx-auto flex items-center justify-center bg-[#0A0A0A] text-[#FFFFFF]">
                <Check size={32} />
              </div>

              <div>
                <span className="text-[11px] font-mono tracking-[0.18em] uppercase text-[#71717A] block mb-1">
                  {t.dispatchConfirm}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-[#0A0A0A]">
                  {t.orderHeading} {orderNumber}
                </h2>
                <p className="text-[13px] text-[#71717A] mt-2 leading-[22px]">
                  {t.receiptSentPrefix} <strong className="text-[#0A0A0A]">{formData.email}</strong>. {t.receiptSentMid} <strong className="text-[#0A0A0A]" dir="ltr">{formData.phone}</strong>.
                </p>
              </div>

              <div className="bg-[#F9F9F9] border border-[#E4E4E7] p-5 text-start text-[12px] font-mono space-y-2.5">
                <div className="flex justify-between border-b border-[#E4E4E7] pb-2 text-[11px] text-[#71717A] uppercase">
                  <span>{t.shipmentDest}</span>
                  <span>{t.estimatedDelivery}</span>
                </div>
                <div className="flex justify-between font-sans text-[13px] text-[#0A0A0A]">
                  <span>{formData.address}, {formData.city}</span>
                  <span className="font-mono text-[12px]">{t.deliveryDays}</span>
                </div>
                <div className="pt-2 border-t border-[#E4E4E7] flex justify-between text-[11px] text-[#71717A]">
                  <span>{t.paymentMethodLabel}</span>
                  <span className="text-[#0A0A0A] font-medium">{paymentMethodLabels[paymentMethod]}</span>
                </div>
                <div className="pt-2 border-t border-[#E4E4E7] flex justify-between font-bold text-[#0A0A0A]">
                  <span>{paymentMethod === 'cod' ? t.dueOnDelivery : t.totalSettled}</span>
                  <span>{settledTotal.toLocaleString()} {currencyLabel}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="w-full h-14 bg-[#0A0A0A] text-white text-[13px] font-semibold tracking-[0.12em] uppercase hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  {t.returnArchive}
                </button>
              </div>
            </div>
            )
          ) : (
            /* Checkout Form & Order Summary Split */
            <div className="grid grid-cols-1 lg:grid-cols-12">
              
              {/* Form Input Area (7 Cols) */}
              <div className="lg:col-span-7 p-6 md:p-8 border-b lg:border-b-0 lg:border-r rtl:lg:border-r-0 rtl:lg:border-l border-[#E4E4E7]">
                {step === 'details' ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setStep('payment');
                    }}
                    className="space-y-4"
                  >
                    <div className="pb-3 border-b border-[#E4E4E7] flex justify-between items-center">
                      <span className="text-[12px] font-semibold tracking-[0.1em] text-[#0A0A0A] uppercase">
                        {t.section1Title}
                      </span>
                      <span className="text-[10px] font-mono text-[#71717A]">{t.allRequired}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                          {t.firstName}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                          {t.lastName}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                          {t.email}
                        </label>
                        <input
                          type="email"
                          required
                          dir="ltr"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                          {t.mobile}
                        </label>
                        <input
                          type="tel"
                          required
                          dir="ltr"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="01XXXXXXXXX"
                          className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] font-mono text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                        {t.streetAddress}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                          {t.city}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                          {t.postalCode}
                        </label>
                        <input
                          type="text"
                          required
                          dir="ltr"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                          {t.country}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                        />
                      </div>
                    </div>

                    {/* Shipping Choice */}
                    <div className="pt-2">
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-2">
                        {t.deliveryMethodLabel}
                      </label>
                      <div className="border border-[#0A0A0A] p-3.5 flex items-center justify-between bg-[#F9F9F9]">
                        <div className="flex items-center gap-3">
                          <Truck size={18} className="text-[#0A0A0A]" />
                          <div>
                            <span className="block text-[13px] font-medium text-[#0A0A0A]">
                              {t.expressCourier}
                            </span>
                            <span className="text-[11px] text-[#71717A]">
                              {t.expressDesc}
                            </span>
                          </div>
                        </div>
                        <span className="text-[12px] font-mono font-semibold text-[#0A0A0A]">
                          {shippingFee === 0 ? t.free : `${storeSettings.shippingFee} ${currencyLabel}`}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full h-12 bg-[#0A0A0A] text-[#FFFFFF] text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors duration-200 hover:bg-[#27272A] flex items-center justify-center gap-2"
                      >
                        <span>{t.continuePayment}</span>
                        <ArrowRight size={16} className="rtl:rotate-180" />
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Payment Method Selection Form (InstaPay, Vodafone Cash, Cash on Delivery) */
                  <form onSubmit={handleCompleteOrder} className="space-y-5">
                    <div className="pb-3 border-b border-[#E4E4E7] flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setStep('details')}
                        className="text-[11px] font-mono text-[#71717A] hover:text-[#0A0A0A] flex items-center gap-1 uppercase"
                      >
                        <ArrowLeft size={13} className="rtl:rotate-180" />
                        <span>{t.editDestination}</span>
                      </button>
                      <span className="text-[10px] font-mono text-[#0A0A0A] flex items-center gap-1">
                        <Lock size={11} /> {t.secureCheckout}
                      </span>
                    </div>

                    <div className="p-3 bg-[#F9F9F9] border border-[#E4E4E7] text-[12px] flex justify-between items-center">
                      <span className="text-[#71717A]">{t.deliveringTo}</span>
                      <span className="font-medium text-[#0A0A0A] truncate max-w-[240px]">
                        {formData.address}, {formData.city}
                      </span>
                    </div>

                    {/* Payment Method Options */}
                    <div className="space-y-2.5">
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-[0.08em]">
                        {t.selectPaymentTitle}
                      </label>

                      {/* Option 1: InstaPay */}
                      <div
                        className={`border transition-colors ${
                          paymentMethod === 'instapay'
                            ? 'border-[#0A0A0A] bg-[#F9F9F9]'
                            : 'border-[#E4E4E7] bg-[#FFFFFF] hover:border-[#71717A]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('instapay')}
                          className="w-full p-4 flex items-center justify-between text-start"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
                                paymentMethod === 'instapay'
                                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#FFFFFF]'
                                  : 'border-[#0A0A0A] bg-[#FFFFFF]'
                              }`}
                            >
                              {paymentMethod === 'instapay' && <Check size={11} strokeWidth={2.5} />}
                            </span>
                            <Zap size={17} className="text-[#0A0A0A] shrink-0" />
                            <div>
                              <span className="block text-[13px] font-semibold text-[#0A0A0A]">
                                {t.instapayTitle}
                              </span>
                              <span className="text-[11px] text-[#71717A]">
                                {t.instapayDesc}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-[#0A0A0A] border border-[#E4E4E7] bg-[#FFFFFF] px-2 py-0.5 shrink-0">
                            {t.instantBadge}
                          </span>
                        </button>

                        {paymentMethod === 'instapay' && (
                          <div className="px-4 pb-4 pt-2 border-t border-[#E4E4E7] space-y-3 bg-[#FFFFFF]">
                            <div className="p-3 bg-[#F9F9F9] border border-[#E4E4E7] flex items-center justify-between gap-2">
                              <div>
                                <span className="block text-[10px] font-mono uppercase text-[#71717A]">
                                  {t.instapayIpaLabel}
                                </span>
                                <span className="text-[13px] font-mono font-semibold text-[#0A0A0A]" dir="ltr">
                                  {storeSettings.instapayIpa}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(storeSettings.instapayIpa, 'ipa')}
                                className="h-8 px-3 border border-[#0A0A0A] text-[10px] font-mono uppercase text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FFFFFF] transition-colors flex items-center gap-1.5"
                              >
                                {copiedField === 'ipa' ? <Check size={12} /> : <Copy size={12} />}
                                <span>{copiedField === 'ipa' ? t.copied : t.copyIpa}</span>
                              </button>
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                                {t.yourIpaLabel}
                              </label>
                              <input
                                type="text"
                                required
                                dir="ltr"
                                value={formData.instapayHandle}
                                onChange={(e) => setFormData({ ...formData, instapayHandle: e.target.value })}
                                placeholder={t.yourIpaPlaceholder}
                                className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] font-mono text-[#0A0A0A] placeholder-[#71717A] focus:outline-none focus:border-[#0A0A0A]"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Option 2: Vodafone Cash */}
                      <div
                        className={`border transition-colors ${
                          paymentMethod === 'vodafone-cash'
                            ? 'border-[#0A0A0A] bg-[#F9F9F9]'
                            : 'border-[#E4E4E7] bg-[#FFFFFF] hover:border-[#71717A]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('vodafone-cash')}
                          className="w-full p-4 flex items-center justify-between text-start"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
                                paymentMethod === 'vodafone-cash'
                                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#FFFFFF]'
                                  : 'border-[#0A0A0A] bg-[#FFFFFF]'
                              }`}
                            >
                              {paymentMethod === 'vodafone-cash' && <Check size={11} strokeWidth={2.5} />}
                            </span>
                            <Smartphone size={17} className="text-[#0A0A0A] shrink-0" />
                            <div>
                              <span className="block text-[13px] font-semibold text-[#0A0A0A]">
                                {t.vodafoneTitle}
                              </span>
                              <span className="text-[11px] text-[#71717A]">
                                {t.vodafoneDesc}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-[#0A0A0A] border border-[#E4E4E7] bg-[#FFFFFF] px-2 py-0.5 shrink-0">
                            {t.walletBadge}
                          </span>
                        </button>

                        {paymentMethod === 'vodafone-cash' && (
                          <div className="px-4 pb-4 pt-2 border-t border-[#E4E4E7] space-y-3 bg-[#FFFFFF]">
                            <div className="p-3 bg-[#F9F9F9] border border-[#E4E4E7] flex items-center justify-between gap-2">
                              <div>
                                <span className="block text-[10px] font-mono uppercase text-[#71717A]">
                                  {t.walletNumberLabel}
                                </span>
                                <span className="text-[13px] font-mono font-semibold text-[#0A0A0A]" dir="ltr">
                                  {storeSettings.vodafoneCashNumber}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(storeSettings.vodafoneCashNumber, 'vf')}
                                className="h-8 px-3 border border-[#0A0A0A] text-[10px] font-mono uppercase text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FFFFFF] transition-colors flex items-center gap-1.5"
                              >
                                {copiedField === 'vf' ? <Check size={12} /> : <Copy size={12} />}
                                <span>{copiedField === 'vf' ? t.copied : t.copyNumber}</span>
                              </button>
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                                {t.senderVodafoneLabel}
                              </label>
                              <input
                                type="tel"
                                required
                                dir="ltr"
                                value={formData.vodafoneSenderNumber}
                                onChange={(e) => setFormData({ ...formData, vodafoneSenderNumber: e.target.value })}
                                placeholder="010XXXXXXXX"
                                className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] font-mono text-[#0A0A0A] placeholder-[#71717A] focus:outline-none focus:border-[#0A0A0A]"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Option 3: Cash on Delivery */}
                      <div
                        className={`border transition-colors ${
                          paymentMethod === 'cod'
                            ? 'border-[#0A0A0A] bg-[#F9F9F9]'
                            : 'border-[#E4E4E7] bg-[#FFFFFF] hover:border-[#71717A]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className="w-full p-4 flex items-center justify-between text-start"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
                                paymentMethod === 'cod'
                                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#FFFFFF]'
                                  : 'border-[#0A0A0A] bg-[#FFFFFF]'
                              }`}
                            >
                              {paymentMethod === 'cod' && <Check size={11} strokeWidth={2.5} />}
                            </span>
                            <Banknote size={17} className="text-[#0A0A0A] shrink-0" />
                            <div>
                              <span className="block text-[13px] font-semibold text-[#0A0A0A]">
                                {t.codTitle}
                              </span>
                              <span className="text-[11px] text-[#71717A]">
                                {t.codDesc}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-[#0A0A0A] border border-[#E4E4E7] bg-[#FFFFFF] px-2 py-0.5 shrink-0">
                            {t.codBadge}
                          </span>
                        </button>

                        {paymentMethod === 'cod' && (
                          <div className="px-4 pb-4 pt-2 border-t border-[#E4E4E7] space-y-3 bg-[#FFFFFF]">
                            <div className="p-3 bg-[#F9F9F9] border border-[#E4E4E7] text-[12px] text-[#444748] space-y-1">
                              <div className="flex justify-between font-mono text-[11px] text-[#0A0A0A]">
                                <span>{t.totalDueDelivery}</span>
                                <span className="font-bold">{total.toLocaleString()} {currencyLabel}</span>
                              </div>
                              <p className="text-[11px] text-[#71717A]">
                                {t.courierCallPrefix} <span className="font-mono text-[#0A0A0A]" dir="ltr">{formData.phone}</span> {t.courierCallSuffix}
                              </p>
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                                {t.deliveryNotesLabel}
                              </label>
                              <input
                                type="text"
                                value={formData.codNotes}
                                onChange={(e) => setFormData({ ...formData, codNotes: e.target.value })}
                                placeholder={t.deliveryNotesPlaceholder}
                                className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] text-[#0A0A0A] placeholder-[#71717A] focus:outline-none focus:border-[#0A0A0A]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="saveInfo"
                        checked={formData.saveInfo}
                        onChange={(e) => setFormData({ ...formData, saveInfo: e.target.checked })}
                        className="w-4 h-4 rounded-none accent-[#0A0A0A]"
                      />
                      <label htmlFor="saveInfo" className="text-[12px] text-[#444748] cursor-pointer">
                        {t.savePrefs}
                      </label>
                    </div>

                    {submitError && (
                      <div className="p-3 border border-[#ba1a1a] bg-[#FFF5F5] text-[#ba1a1a] text-[12px] space-y-2.5">
                        <div className="flex items-start gap-2">
                          <AlertCircle size={15} className="shrink-0 mt-0.5" />
                          <span>{submitError}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-[#0A0A0A] text-[#FFFFFF] text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors duration-200 hover:bg-[#27272A] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>{t.savingOrder}</span>
                          </>
                        ) : (
                          <span>
                            {paymentMethod === 'cod'
                              ? `${t.confirmCod} — ${total.toLocaleString()} ${currencyLabel}`
                              : `${t.confirmOrder} — ${total.toLocaleString()} ${currencyLabel}`}
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Order Summary Column (5 Cols) */}
              <div className="lg:col-span-5 p-6 md:p-8 bg-[#F9F9F9] flex flex-col justify-between">
                <div>
                  <div className="pb-3 border-b border-[#E4E4E7] mb-4 flex justify-between items-center">
                    <span className="text-[11px] font-mono tracking-[0.14em] text-[#71717A] uppercase">
                      {t.curatedItems}
                    </span>
                    <span className="text-[10px] font-mono text-[#0A0A0A]">
                      [{cartItems.reduce((acc, i) => acc + i.quantity, 0)}]
                    </span>
                  </div>

                  <div className="divide-y divide-[#E4E4E7] max-h-60 overflow-y-auto pe-1 mb-6">
                    {cartItems.map((item) => {
                      const localized = translateProduct(item.product, language);
                      const itemCurrency = translateCurrency(item.product.currency || 'EGP', language);
                      return (
                        <div key={item.id} className="py-3 flex items-center justify-between text-[12px]">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product.images[0]}
                              alt={localized.name}
                              className="w-10 aspect-[3/4] object-cover border border-[#E4E4E7]"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="block font-medium text-[#0A0A0A] line-clamp-1">{localized.name}</span>
                              <span className="text-[11px] font-mono text-[#71717A]">
                                {t.qty} {item.quantity} · {t.size} {item.size}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono text-[#0A0A0A] font-medium whitespace-nowrap">
                            {language === 'ar'
                              ? `${(item.product.price * item.quantity).toLocaleString()} ${itemCurrency}`
                              : `${itemCurrency} ${(item.product.price * item.quantity).toLocaleString()}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 text-[12px] pt-4 border-t border-[#E4E4E7]">
                    <div className="flex justify-between text-[#71717A]">
                      <span>{t.subtotal}</span>
                      <span className="font-mono text-[#0A0A0A]">{subtotal.toLocaleString()} {currencyLabel}</span>
                    </div>
                    <div className="flex justify-between text-[#71717A]">
                      <span>{t.insuredCourier}</span>
                      <span className="font-mono text-[#0A0A0A]">
                        {shippingFee === 0 ? t.complimentary : `${shippingFee} ${currencyLabel}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#71717A]">
                      <span>{t.packagingTaxes}</span>
                      <span className="font-mono text-[#0A0A0A]">{t.included}</span>
                    </div>
                    <div className="pt-3 border-t border-[#E4E4E7] flex justify-between text-[15px] font-semibold text-[#0A0A0A]">
                      <span>{t.total}</span>
                      <span className="font-mono">{total.toLocaleString()} {currencyLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E4E4E7] flex items-center gap-2 text-[10px] font-mono text-[#71717A] uppercase tracking-[0.08em]">
                  <ShieldCheck size={14} className="text-[#0A0A0A] shrink-0" />
                  <span>{t.certificateNote}</span>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
