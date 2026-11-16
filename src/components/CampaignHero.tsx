import React from 'react';
import { ArrowDownRight } from 'lucide-react';
import { StoreSettings } from '../types';
import { Language, STORE_STRINGS, translateStoreSettings } from '../utils/i18n';
import heroStripImage from '../assets/images/solo_white_bg_hero_1794794333014.jpg';

interface CampaignHeroProps {
  settings: StoreSettings;
  language: Language;
  onExploreCatalog: () => void;
  onViewLookbook: () => void;
}

export const CampaignHero: React.FC<CampaignHeroProps> = ({
  settings,
  language,
  onExploreCatalog,
  onViewLookbook
}) => {
  const s = translateStoreSettings(settings, language);
  const t = STORE_STRINGS[language].hero;

  return (
    <section
      id="hero-section"
      className="relative w-full min-h-[100vh] flex flex-col justify-between bg-[#FFFFFF] text-[#0A0A0A] border-b border-[#E4E4E7] overflow-hidden"
    >
      {/* Full 100vh Background Image Layer */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none select-none overflow-hidden">
        <img
          src={heroStripImage}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-top lg:object-[50%_15%]"
          referrerPolicy="no-referrer"
        />
        {/* Desktop directional wash so text column stays sharp while center model stays clear */}
        <div className="hidden lg:block absolute inset-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-[#FFFFFF]/92 via-[#FFFFFF]/10 to-[#FFFFFF]/75" />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 py-10 md:py-14 my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* Left Column: Editorial Typography & Featured Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="w-full flex justify-center text-center">
            <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold tracking-[0.18em] uppercase text-[#0A0A0A]">
              {s.heroSeason.replace(/\s*2026\b/g, '').trim()}
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-[-0.03em] font-normal leading-[1.08] text-[#0A0A0A]">
            {s.heroTitle}
          </h1>

          <p className="font-serif text-xl sm:text-2xl italic text-[#27272A] leading-[1.38] max-w-xl">
            “{s.heroQuote}”
          </p>

          <p className="text-[13px] sm:text-[14px] text-[#52525B] leading-[24px] max-w-lg">
            {s.heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
            <button
              onClick={onExploreCatalog}
              className="h-12 px-8 bg-[#0A0A0A] text-[#FFFFFF] text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors duration-200 hover:bg-[#27272A] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.exploreBtn}</span>
              <ArrowDownRight size={16} />
            </button>
            <button
              onClick={onViewLookbook}
              className="h-12 px-8 bg-[#FFFFFF]/85 text-[#0A0A0A] border border-[#0A0A0A] text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors duration-200 hover:bg-[#0A0A0A] hover:text-[#FFFFFF] flex items-center justify-center cursor-pointer"
            >
              {t.lookbookBtn}
            </button>
          </div>

          {/* Highlighted Left Campaign Card */}
          <div className="pt-4">
            <div className="border border-[#E4E4E7] bg-[#FAFAFA]/95 backdrop-blur-xs p-4 flex items-center gap-4 max-w-md">
              <div className="w-16 aspect-[3/4] bg-[#F4F4F5] border border-[#E4E4E7] overflow-hidden shrink-0">
                <img
                  src={s.heroLeftImage}
                  alt={s.heroLeftLabel}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono tracking-[0.16em] uppercase text-[#71717A] block mb-1">
                  {t.featuredSilhouette}
                </span>
                <h2 className="text-[13px] font-semibold text-[#0A0A0A] truncate">
                  {s.heroLeftLabel}
                </h2>
                <span className="font-mono text-[12px] text-[#0A0A0A] font-semibold mt-1 block">
                  {s.heroLeftPrice}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Open Framing Space for 100vh Background Model on Desktop */}
        <div className="hidden lg:block lg:col-span-3" aria-hidden="true" />

        {/* Right Column: Dual Editorial Photographic Frame */}
        <div className="lg:col-span-4">
          <div className="border border-[#E4E4E7] bg-[#F9F9F9]/95 backdrop-blur-xs p-4 sm:p-5">
            <div className="relative aspect-[4/5] bg-[#F4F4F5] border border-[#E4E4E7] overflow-hidden group">
              <img
                src={s.heroRightImage}
                alt={s.heroRightTitle}
                className="w-full h-full object-cover object-center image-zoom-transition group-hover:scale-[1.03]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-[#FFFFFF]/95 border border-[#E4E4E7] px-3 py-1.5">
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#0A0A0A]">
                  {s.heroRightBadge}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-[13px] font-semibold tracking-[0.06em] uppercase text-[#0A0A0A]">
                  {s.heroRightTitle}
                </h3>
                <p className="text-[12px] text-[#71717A] mt-0.5 max-w-md">
                  {s.heroRightDescription}
                </p>
              </div>
              <button
                onClick={onExploreCatalog}
                className="text-[11px] font-mono uppercase tracking-[0.12em] text-[#0A0A0A] underline underline-offset-4 shrink-0 cursor-pointer"
              >
                {t.shopSeries}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
