import React, { useState, useEffect } from 'react';
import { settingService } from '../../services/api';

const DEFAULT_MESSAGES = [
  '✦ 100% Certified 22K (916) BIS Hallmarked Gold Guaranteed ✦',
  '✦ Complimentary Insured Express Delivery across India (Orders > ₹5,000) ✦',
  '✦ Auspicious Festive Offer: Use Code SHUBH10 for 10% Off ✦',
  '✦ Lifetime Gold Buyback Guarantee · 15-Day Easy Returns ✦',
];

export const AnnouncementBar = () => {
  const [activeMessageIdx, setActiveMessageIdx] = useState(0);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [contactPhone, setContactPhone] = useState('074549 86610');

  useEffect(() => {
    settingService.getSettings()
      .then((res) => {
        if (res.settings?.announcements?.length > 0) {
          setMessages(res.settings.announcements);
        }
        if (res.settings?.contact?.phone) {
          setContactPhone(res.settings.contact.phone);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMessageIdx((prev) => (prev + 1) % messages.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="bg-[#330808] text-[#F3E5AB] text-[11px] md:text-xs font-body border-b border-[#C9A44A]/40 relative z-50 overflow-hidden">
      
      {/* Desktop Bar (Never Wraps, Full Max Width) */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 hidden lg:flex items-center justify-between py-2 whitespace-nowrap">
        
        {/* Left: Hallmarking & Heritage Assurance */}
        <div className="flex items-center gap-3 text-stone-200 whitespace-nowrap shrink-0">
          <div className="flex items-center gap-1.5 font-medium whitespace-nowrap">
            <i className="uil uil-shield-check text-[#E6C975] text-sm shrink-0"></i>
            <span className="whitespace-nowrap">100% BIS 916 Hallmarked Gold</span>
          </div>
          <span className="text-[#C9A44A]/40 shrink-0">•</span>
          <div className="flex items-center gap-1.5 text-stone-300 whitespace-nowrap">
            <i className="fa-solid fa-award text-[#E6C975] text-xs shrink-0"></i>
            <span className="whitespace-nowrap">Lifetime Buyback</span>
          </div>
        </div>

        {/* Center: Auspicious Promo & Insured Delivery */}
        <div className="flex items-center gap-2 font-medium tracking-wide whitespace-nowrap shrink-0 px-3">
          <i className="ri-sparkling-fill text-[#E6C975] text-xs animate-pulse shrink-0"></i>
          <span className="text-stone-100 whitespace-nowrap">
            Complimentary Insured Armored Delivery across India on orders above ₹5,000
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#521212] border border-[#C9A44A]/60 text-[10px] font-bold text-[#F9E59B] uppercase whitespace-nowrap ml-1 shadow-sm shrink-0">
            <i className="uil uil-tag-alt text-[10px]"></i>
            <span>Code: SHUBH10</span>
          </span>
        </div>

        {/* Right: Returns & Concierge */}
        <div className="flex items-center gap-3 text-stone-200 whitespace-nowrap shrink-0">
          <div className="flex items-center gap-1.5 text-stone-300 whitespace-nowrap">
            <i className="fa-solid fa-rotate-left text-[#E6C975] text-xs shrink-0"></i>
            <span className="whitespace-nowrap">15-Day Easy Returns</span>
          </div>

          <span className="text-[#C9A44A]/40 shrink-0">|</span>

          <a
            href={`tel:${contactPhone.replace(/\s+/g, '')}`}
            className="flex items-center gap-1.5 text-stone-200 hover:text-[#F3E5AB] transition-colors whitespace-nowrap font-medium"
          >
            <i className="ri-phone-line text-[#E6C975] text-xs shrink-0"></i>
            <span className="whitespace-nowrap">{contactPhone}</span>
          </a>
        </div>

      </div>

      {/* Mobile Rotating Bar */}
      <div className="lg:hidden py-1.5 px-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <i className="ri-sparkling-fill text-[#E6C975] text-xs shrink-0"></i>
          <p className="text-[11px] font-medium tracking-wide text-[#F3E5AB] leading-tight">
            {messages[activeMessageIdx]}
          </p>
        </div>
      </div>

    </div>
  );
};
export default AnnouncementBar;
