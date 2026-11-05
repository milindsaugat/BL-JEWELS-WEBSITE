import React, { useState, useEffect } from 'react';
import { settingService } from '../../services/api';

const DEFAULT_CONFIG = {
  enabled: true,
  mode: 'static',
  staticText: 'Complimentary Insured Armored Delivery across India on orders above ₹5,000',
  pillText: 'Code: SHUBH10',
  pillLink: '',
  showPill: true,
  leftText1: '100% BIS 916 Hallmarked Gold',
  leftText2: 'Lifetime Buyback',
  rightText: '15-Day Easy Returns',
  phone: '074549 86610',
  marqueeItems: [
    '100% Certified 22K (916) BIS Hallmarked Gold Guaranteed',
    'Complimentary Insured Armored Delivery across India on orders above ₹5,000',
    'Auspicious Festive Offer: Use Code SHUBH10 for 10% Off',
    'Lifetime Gold Buyback Guarantee · 15-Day Easy Returns',
    'Direct Artisan Pricing · Zero Hidden Karigar Deductions',
    'Visit Flagship Store: सुरेश मॉल, सिविल लाइन्स, आगरा · 074549 86610'
  ],
  marqueeSpeed: 35,
};

export const AnnouncementBar = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeMessageIdx, setActiveMessageIdx] = useState(0);

  useEffect(() => {
    settingService.getSettings()
      .then((res) => {
        if (res.settings) {
          const bar = res.settings.announcementBar || {};
          const fallbackItems = res.settings.announcements?.length > 0
            ? res.settings.announcements
            : DEFAULT_CONFIG.marqueeItems;

          setConfig({
            enabled: bar.enabled !== undefined ? bar.enabled : true,
            mode: bar.mode || 'static',
            staticText: bar.staticText || DEFAULT_CONFIG.staticText,
            pillText: bar.pillText !== undefined ? bar.pillText : DEFAULT_CONFIG.pillText,
            pillLink: bar.pillLink || '',
            showPill: bar.showPill !== undefined ? bar.showPill : true,
            leftText1: bar.leftText1 || DEFAULT_CONFIG.leftText1,
            leftText2: bar.leftText2 || DEFAULT_CONFIG.leftText2,
            rightText: bar.rightText || DEFAULT_CONFIG.rightText,
            phone: bar.phone || res.settings.contact?.phone || DEFAULT_CONFIG.phone,
            marqueeItems: bar.marqueeItems?.length > 0 ? bar.marqueeItems : fallbackItems,
            marqueeSpeed: bar.marqueeSpeed || DEFAULT_CONFIG.marqueeSpeed,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Timer for mobile rotation in static mode
  useEffect(() => {
    if (config.mode === 'marquee') return;
    const items = config.marqueeItems || [];
    if (items.length < 2) return;
    const timer = setInterval(() => {
      setActiveMessageIdx((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [config.mode, config.marqueeItems]);

  if (!config.enabled) return null;

  const isMarquee = config.mode === 'marquee';
  const marqueeList = config.marqueeItems?.length > 0 ? config.marqueeItems : DEFAULT_CONFIG.marqueeItems;
  // Duplicate items for a seamless, glitch-free 360-degree continuous loop
  const seamlessItems = [...marqueeList, ...marqueeList];

  return (
    <div className="bg-[#330808] text-[#F3E5AB] text-[11px] md:text-xs font-body border-b border-[#C9A44A]/40 relative z-50 overflow-hidden shadow-xs">
      
      {/* ────────────────────────────────────────────────────────────
          MODE 1: CONTINUOUS INFINITE MARQUEE (Storewide Ticker)
          ──────────────────────────────────────────────────────────── */}
      {isMarquee ? (
        <div className="relative w-full overflow-hidden marquee-pause py-2 sm:py-2.5">
          {/* Edge Luxury Vignettes for smooth entrance and exit */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-[#330808] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-[#330808] to-transparent z-10" />

          {/* Infinite Marquee Track (Smooth Hardware Accelerated) */}
          <div
            className="animate-marquee-rtl flex items-center whitespace-nowrap cursor-default select-none"
            style={{ animationDuration: `${Math.max(15, config.marqueeSpeed || 35)}s` }}
          >
            {seamlessItems.map((item, idx) => {
              // Highlight coupon codes or offers if present in text
              const hasCode = item.includes('Code:') || item.includes('SHUBH10');

              return (
                <div key={idx} className="flex items-center gap-3 sm:gap-4 shrink-0 px-4 sm:px-6">
                  <i className="ri-sparkling-fill text-[#E6C975] text-[11px] sm:text-xs animate-pulse shrink-0" />
                  
                  <span className="text-stone-100 font-medium tracking-wide whitespace-nowrap text-[11px] sm:text-xs">
                    {item}
                  </span>

                  {hasCode && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#521212] border border-[#C9A44A]/60 text-[10px] font-bold text-[#F9E59B] uppercase whitespace-nowrap shadow-sm">
                      <i className="uil uil-tag-alt text-[10px]" />
                      <span>Special Offer</span>
                    </span>
                  )}

                  <span className="text-[#C9A44A]/50 text-xs shrink-0 select-none">✦</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ────────────────────────────────────────────────────────────
           MODE 2: STATIC LUXURY LAYOUT (Assurances + Center Promo + Concierge)
           ──────────────────────────────────────────────────────────── */
        <div>
          {/* Desktop Bar (Never Wraps, Edge-to-Edge Container) */}
          <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 hidden lg:flex items-center justify-between py-2 whitespace-nowrap">
            
            {/* Left: Hallmarking & Heritage Assurance */}
            <div className="flex items-center gap-3 text-stone-200 whitespace-nowrap shrink-0">
              {config.leftText1 && (
                <div className="flex items-center gap-1.5 font-medium whitespace-nowrap">
                  <i className="uil uil-shield-check text-[#E6C975] text-sm shrink-0" />
                  <span className="whitespace-nowrap">{config.leftText1}</span>
                </div>
              )}

              {config.leftText1 && config.leftText2 && (
                <span className="text-[#C9A44A]/40 shrink-0">•</span>
              )}

              {config.leftText2 && (
                <div className="flex items-center gap-1.5 text-stone-300 whitespace-nowrap">
                  <i className="fa-solid fa-award text-[#E6C975] text-xs shrink-0" />
                  <span className="whitespace-nowrap">{config.leftText2}</span>
                </div>
              )}
            </div>

            {/* Center: Auspicious Promo & Insured Delivery */}
            <div className="flex items-center gap-2 font-medium tracking-wide whitespace-nowrap shrink-0 px-3">
              <i className="ri-sparkling-fill text-[#E6C975] text-xs animate-pulse shrink-0" />
              <span className="text-stone-100 whitespace-nowrap">
                {config.staticText}
              </span>

              {config.showPill && config.pillText && (
                config.pillLink ? (
                  <a
                    href={config.pillLink}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#521212] hover:bg-[#681818] border border-[#C9A44A]/60 text-[10px] font-bold text-[#F9E59B] uppercase whitespace-nowrap ml-1 shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    <i className="uil uil-tag-alt text-[10px]" />
                    <span>{config.pillText}</span>
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#521212] border border-[#C9A44A]/60 text-[10px] font-bold text-[#F9E59B] uppercase whitespace-nowrap ml-1 shadow-sm shrink-0">
                    <i className="uil uil-tag-alt text-[10px]" />
                    <span>{config.pillText}</span>
                  </span>
                )
              )}
            </div>

            {/* Right: Returns & Concierge */}
            <div className="flex items-center gap-3 text-stone-200 whitespace-nowrap shrink-0">
              {config.rightText && (
                <div className="flex items-center gap-1.5 text-stone-300 whitespace-nowrap">
                  <i className="fa-solid fa-rotate-left text-[#E6C975] text-xs shrink-0" />
                  <span className="whitespace-nowrap">{config.rightText}</span>
                </div>
              )}

              {config.rightText && config.phone && (
                <span className="text-[#C9A44A]/40 shrink-0">|</span>
              )}

              {config.phone && (
                <a
                  href={`tel:${config.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-1.5 text-stone-200 hover:text-[#F3E5AB] transition-colors whitespace-nowrap font-medium"
                >
                  <i className="ri-phone-line text-[#E6C975] text-xs shrink-0" />
                  <span className="whitespace-nowrap">{config.phone}</span>
                </a>
              )}
            </div>

          </div>

          {/* Mobile Display in Static Mode */}
          <div className="lg:hidden py-1.5 px-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <i className="ri-sparkling-fill text-[#E6C975] text-xs shrink-0" />
              <p className="text-[11px] font-medium tracking-wide text-[#F3E5AB] leading-tight truncate">
                {config.staticText}
              </p>
              {config.showPill && config.pillText && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#521212] border border-[#C9A44A]/60 text-[9px] font-bold text-[#F9E59B] uppercase whitespace-nowrap shrink-0">
                  <span>{config.pillText}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AnnouncementBar;
