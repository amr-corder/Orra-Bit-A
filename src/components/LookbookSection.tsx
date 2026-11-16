import React from 'react';
import { LookbookSpread, Product } from '../types';
import { ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import {
  Language,
  STORE_STRINGS,
  translateCurrency,
  translateLookbook,
  translateProduct
} from '../utils/i18n';

interface LookbookSectionProps {
  spreads: LookbookSpread[];
  products: Product[];
  language: Language;
  onSelectProduct: (product: Product) => void;
}

export const LookbookSection: React.FC<LookbookSectionProps> = ({
  spreads,
  products,
  language,
  onSelectProduct
}) => {
  if (spreads.length === 0) {
    return null;
  }

  const t = STORE_STRINGS[language].lookbook;

  return (
    <section id="lookbook" className="w-full bg-[#FFFFFF] border-b border-[#E4E4E7] py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <ScrollReveal>
          <div className="pb-12 border-b border-[#E4E4E7] flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-[11px] font-mono tracking-[0.16em] uppercase text-[#71717A]">
                <span>{t.eyebrow1}</span>
                <span>/</span>
                <span>{t.eyebrow2}</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#0A0A0A] font-normal tracking-[-0.02em]">
                {t.title}
              </h2>
            </div>

            <p className="max-w-md text-[13px] text-[#71717A] leading-[22px]">
              {t.subtitle}
            </p>
          </div>
        </ScrollReveal>

        {/* Spreads Collection */}
        <div className="divide-y divide-[#E4E4E7]">
          {spreads.map((rawSpread, index) => {
            const spread = translateLookbook(rawSpread, language);
            const isEven = index % 2 === 0;
            const featuredProducts = products.filter((p) =>
              spread.featuredProductIds.includes(p.id)
            );

            return (
              <div key={spread.id} className="py-16 md:py-24">
                <ScrollReveal>
                {/* Chapter Kicker & Quote */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-baseline">
                  <div className="lg:col-span-4">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#71717A] block mb-1">
                      {t.chapter} {spread.chapter}
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl text-[#0A0A0A]">
                      {spread.title}
                    </h3>
                  </div>

                  <div className="lg:col-span-8">
                    <blockquote className="font-serif text-xl md:text-2xl text-[#1A1C1C] italic leading-relaxed ltr:border-l-2 rtl:border-r-2 border-[#0A0A0A] ltr:pl-6 rtl:pr-6 my-2">
                      “{spread.quote}”
                    </blockquote>
                    <p className="text-[13px] text-[#71717A] leading-[22px] max-w-2xl mt-4">
                      {spread.narrative}
                    </p>
                  </div>
                </div>

                {/* Asymmetrical 5-column / 7-column Visual Split */}
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}>
                  
                  {/* Primary Visual Column */}
                  <div className={`${isEven ? 'lg:col-span-7' : 'lg:col-span-5'} flex flex-col justify-between`}>
                    <div className="relative aspect-[4/5] bg-[#F4F4F5] border border-[#E4E4E7] overflow-hidden group">
                      <img
                        src={spread.primaryImage}
                        alt={spread.title}
                        className="w-full h-full object-cover object-center image-zoom-transition group-hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 bg-[#FFFFFF]/95 px-3 py-1.5 border border-[#E4E4E7]">
                        <span className="font-mono text-[10px] tracking-[0.14em] text-[#0A0A0A] uppercase">
                          {t.figure} {spread.chapter}.1
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Visual + Curated Pieces Showcase Column */}
                  <div className={`${isEven ? 'lg:col-span-5' : 'lg:col-span-7'} flex flex-col justify-between space-y-6`}>
                    <div className="relative aspect-[4/3] bg-[#F4F4F5] border border-[#E4E4E7] overflow-hidden group">
                      <img
                        src={spread.secondaryImage}
                        alt={`${spread.title} ${t.detail}`}
                        className="w-full h-full object-cover object-center image-zoom-transition group-hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 bg-[#FFFFFF]/95 px-3 py-1.5 border border-[#E4E4E7]">
                        <span className="font-mono text-[10px] tracking-[0.14em] text-[#0A0A0A] uppercase">
                          {t.detail} {spread.chapter}.2
                        </span>
                      </div>
                    </div>

                    {/* Featured Pieces in this Spread */}
                    <div className="border border-[#E4E4E7] p-5 bg-[#F9F9F9]">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E4E4E7]">
                        <span className="text-[11px] font-mono tracking-[0.14em] uppercase text-[#71717A]">
                          {t.worksFeatured}
                        </span>
                        <span className="text-[10px] font-mono text-[#0A0A0A]">
                          [{featuredProducts.length} {t.pieces}]
                        </span>
                      </div>

                      <div className="space-y-3">
                        {featuredProducts.map((p) => {
                          const dp = translateProduct(p, language);
                          return (
                            <div
                              key={p.id}
                              onClick={() => onSelectProduct(p)}
                              className="p-3 bg-[#FFFFFF] border border-[#E4E4E7] flex items-center justify-between group cursor-pointer hover:border-[#0A0A0A] transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 aspect-[3/4] bg-[#F4F4F5] border border-[#E4E4E7] overflow-hidden shrink-0">
                                  <img
                                    src={p.images[0]}
                                    alt={dp.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div>
                                  <h4 className="text-[12px] font-medium text-[#0A0A0A] group-hover:text-[#71717A] transition-colors line-clamp-1">
                                    {dp.name}
                                  </h4>
                                  <span className="font-mono text-[11px] text-[#71717A]">
                                    {p.price.toLocaleString()} {translateCurrency(p.currency, language)} · {dp.color}
                                  </span>
                                </div>
                              </div>

                              <button
                                className="w-7 h-7 border border-[#E4E4E7] group-hover:border-[#0A0A0A] flex items-center justify-center transition-colors text-[#0A0A0A]"
                                aria-label={dp.name}
                              >
                                <ArrowUpRight size={14} className="rtl:-scale-x-100" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>
                </ScrollReveal>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
