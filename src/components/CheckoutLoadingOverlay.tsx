import React from 'react';
import { Loader2 } from 'lucide-react';

interface CheckoutLoadingOverlayProps {
  message: string;
  language: 'en' | 'ar';
}

export const CheckoutLoadingOverlay: React.FC<CheckoutLoadingOverlayProps> = ({
  message,
  language
}) => (
  <div
    className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6"
    role="status"
    aria-live="polite"
    dir={language === 'ar' ? 'rtl' : 'ltr'}
  >
    <div className="flex flex-col items-center text-center">
      <span className="font-serif text-2xl tracking-tight text-[#0A0A0A]">ORRA BIT</span>
      <Loader2 size={24} className="mt-10 animate-spin text-[#0A0A0A]" />
      <p className="mt-5 text-[12px] font-mono tracking-[0.12em] text-[#71717A]">
        {message}
      </p>
      <div className="mt-6 h-px w-40 overflow-hidden bg-[#E4E4E7]">
        <div className="h-full w-1/2 animate-pulse bg-[#0A0A0A]" />
      </div>
    </div>
  </div>
);
