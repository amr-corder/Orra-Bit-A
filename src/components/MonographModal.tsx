import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Language, STORE_STRINGS } from '../utils/i18n';

interface MonographModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onExploreCollection: () => void;
}

export const MonographModal: React.FC<MonographModalProps> = ({
  isOpen,
  language,
  onClose,
  onExploreCollection
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const t = STORE_STRINGS[language].monograph;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#0A0A0A]/50 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      />

      <div
        className="relative min-h-screen flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-2xl p-6 md:p-12 overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#E4E4E7] mb-8">
            <div className="flex items-center gap-3">
              <span className="font-serif text-2xl text-[#0A0A0A]">ORRA BIT</span>
              <span className="text-[#c4c7c7]">/</span>
              <span className="text-[11px] font-mono tracking-[0.14em] uppercase text-[#71717A]">
                {t.subtitle}
              </span>
            </div>
          </div>

          {/* Manifesto Content */}
          <div className="space-y-8 max-w-3xl">
            <div>
              <span className="text-[11px] font-mono tracking-[0.16em] uppercase text-[#71717A] block mb-2">
                {t.s1Eyebrow}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] leading-tight mb-4">
                {t.s1Title}
              </h2>
              <blockquote className="font-serif text-xl italic text-[#1A1C1C] ltr:border-l-2 rtl:border-r-2 border-[#0A0A0A] ltr:pl-5 rtl:pr-5 my-4">
                {t.s1Quote}
              </blockquote>
              <p className="text-[14px] text-[#444748] leading-[24px]">
                {t.s1Body}
              </p>
            </div>

            {/* Ateliers & Origin Matrix */}
            <div className="pt-6 border-t border-[#E4E4E7]">
              <span className="text-[11px] font-mono tracking-[0.16em] uppercase text-[#71717A] block mb-4">
                {t.s2Eyebrow}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-[#F9F9F9] border border-[#E4E4E7]">
                  <span className="text-[11px] font-mono font-semibold text-[#0A0A0A] block mb-1">
                    {t.atelier1City}
                  </span>
                  <span className="text-[10px] font-mono text-[#71717A] block mb-2">
                    {t.atelier1Sub}
                  </span>
                  <p className="text-[12px] text-[#444748] leading-[18px]">
                    {t.atelier1Body}
                  </p>
                </div>

                <div className="p-4 bg-[#F9F9F9] border border-[#E4E4E7]">
                  <span className="text-[11px] font-mono font-semibold text-[#0A0A0A] block mb-1">
                    {t.atelier2City}
                  </span>
                  <span className="text-[10px] font-mono text-[#71717A] block mb-2">
                    {t.atelier2Sub}
                  </span>
                  <p className="text-[12px] text-[#444748] leading-[18px]">
                    {t.atelier2Body}
                  </p>
                </div>

                <div className="p-4 bg-[#F9F9F9] border border-[#E4E4E7]">
                  <span className="text-[11px] font-mono font-semibold text-[#0A0A0A] block mb-1">
                    {t.atelier3City}
                  </span>
                  <span className="text-[10px] font-mono text-[#71717A] block mb-2">
                    {t.atelier3Sub}
                  </span>
                  <p className="text-[12px] text-[#444748] leading-[18px]">
                    {t.atelier3Body}
                  </p>
                </div>
              </div>
            </div>

            {/* Ethos Actions */}
            <div className="pt-6 border-t border-[#E4E4E7] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-[0.08em]">
                {t.archiveFooter}
              </span>
              <button
                onClick={() => {
                  onClose();
                  onExploreCollection();
                }}
                className="h-11 px-6 bg-[#0A0A0A] text-white text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#27272A] transition-colors flex items-center gap-2"
              >
                <span>{t.exploreBtn}</span>
                <ArrowRight size={14} className="rtl:rotate-180" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
