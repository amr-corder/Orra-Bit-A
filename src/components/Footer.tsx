import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Category } from '../types';
import { Language, STORE_STRINGS, translateCategory } from '../utils/i18n';

interface FooterProps {
  language: Language;
  onSelectCategory: (category: Category) => void;
  onOpenLookbook: () => void;
  onOpenMonograph: () => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onSelectCategory,
  onOpenLookbook,
  onOpenMonograph,
  onOpenAdminLogin
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const t = STORE_STRINGS[language].footer;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
  };

  return (
    <footer className="relative z-30 w-full bg-[#FFFFFF] border-t border-[#E4E4E7] pt-16 pb-12 px-6 md:px-12 text-[#0A0A0A]">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-16 border-b border-[#E4E4E7]">
          
          {/* Brand & Ethos (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <span className="font-serif text-3xl tracking-[-0.03em] font-normal text-[#0A0A0A] block">
              ORRA BIT
            </span>
            <p className="text-[13px] text-[#71717A] leading-[22px] max-w-sm">
              {t.brandDesc}
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#71717A] uppercase tracking-[0.08em]">
              {t.permanentLabel}
            </div>
          </div>

          {/* Navigation Directory (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#0A0A0A] block mb-2">
              {t.seriesHeading}
            </span>
            <ul className="space-y-2 text-[12px] text-[#71717A]">
              <li>
                <button
                  onClick={() => onSelectCategory('Signature Editions')}
                  className="editorial-underline hover:text-[#0A0A0A] transition-colors"
                >
                  {translateCategory('Signature Editions', language)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Graphic Series')}
                  className="editorial-underline hover:text-[#0A0A0A] transition-colors"
                >
                  {translateCategory('Graphic Series', language)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Minimalist Oversized')}
                  className="editorial-underline hover:text-[#0A0A0A] transition-colors"
                >
                  {translateCategory('Minimalist Oversized', language)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Earthy Tones')}
                  className="editorial-underline hover:text-[#0A0A0A] transition-colors"
                >
                  {translateCategory('Earthy Tones', language)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Deep Navy')}
                  className="editorial-underline hover:text-[#0A0A0A] transition-colors"
                >
                  {translateCategory('Deep Navy', language)}
                </button>
              </li>
            </ul>
          </div>

          {/* Editorial & Client Services (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#0A0A0A] block mb-2">
              {t.monographHeading}
            </span>
            <ul className="space-y-2 text-[12px] text-[#71717A]">
              <li>
                <button
                  onClick={onOpenLookbook}
                  className="editorial-underline hover:text-[#0A0A0A] transition-colors"
                >
                  {t.lookbookSpreads}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenMonograph}
                  className="editorial-underline hover:text-[#0A0A0A] transition-colors"
                >
                  {t.brandManifesto}
                </button>
              </li>
              <li>
                <span className="text-[#c4c7c7] cursor-not-allowed">{t.service1}</span>
              </li>
              <li>
                <span className="text-[#c4c7c7] cursor-not-allowed">{t.service2}</span>
              </li>
              <li>
                <span className="text-[#c4c7c7] cursor-not-allowed">{t.service3}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Monograph Subscription (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#0A0A0A] block mb-2">
              {t.newsletterTitle}
            </span>
            <p className="text-[12px] text-[#71717A] leading-[20px]">
              {t.newsletterBody}
            </p>

            <form onSubmit={handleSubscribe} className="pt-2">
              <div className="flex">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="flex-1 h-11 px-3.5 bg-[#FFFFFF] border border-[#E4E4E7] text-[13px] text-[#0A0A0A] placeholder-[#71717A] focus:outline-none focus:border-[#0A0A0A] transition-colors"
                />
                <button
                  type="submit"
                  className="h-11 px-5 bg-[#0A0A0A] text-white text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#27272A] transition-colors shrink-0 flex items-center justify-center gap-1.5"
                >
                  {subscribed ? (
                    <>
                      <Check size={14} />
                      <span>{t.enrolled}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.enroll}</span>
                      <ArrowRight size={14} className="rtl:rotate-180" />
                    </>
                  )}
                </button>
              </div>
              {subscribed && (
                <span className="text-[11px] font-mono text-emerald-700 block mt-2">
                  {t.receiptConfirmed}
                </span>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Location anchors */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#71717A] uppercase tracking-[0.08em]">
          <div>
            © {new Date().getFullYear()} {t.rights}
          </div>
          <div className="flex items-center gap-6">
            {t.cities.map((city, i) => (
              <React.Fragment key={city}>
                {i > 0 && <span>·</span>}
                <span>{city}</span>
              </React.Fragment>
            ))}
          </div>
          <div>
            <span>{t.matrixBadge}</span>
          </div>
        </div>

        {/* Subtle Admin Text Link */}
        <div className="pt-4 text-center md:text-right">
          <a
            href="/admin-login"
            onClick={(e) => {
              e.preventDefault();
              onOpenAdminLogin();
            }}
            className="text-[11px] text-[#A1A1AA] hover:text-[#71717A] transition-colors"
          >
            Admin
          </a>
        </div>

      </div>
    </footer>
  );
};
