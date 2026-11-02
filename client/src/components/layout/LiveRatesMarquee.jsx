import React, { useState, useEffect } from 'react';
import { rateService } from '../../services/api';

const DEFAULT_GOLD_RATES = [
  {
    type: 'spot',
    label: 'GOLD SPOT',
    ask: '3875.72',
    high: '4028.41',
    low: '3870.26',
    change: '+0.62%',
    icon: 'fa-solid fa-chart-line',
  },
  {
    type: 'rate',
    label: 'GOLD MCX (10g)',
    rate: '₹1,38,499',
    change: '+₹420',
    hub: 'National Benchmark',
    icon: 'ri-copper-coin-line',
  },
  {
    type: 'rate',
    label: '22KT BL RATE (92%)',
    rate: '₹12,742',
    unit: '/g',
    purity: '92.0% BIS 916',
    high: '12,850',
    low: '12,690',
    icon: 'uil uil-gold',
  },
  {
    type: 'rate',
    label: '18KT BL RATE (76%)',
    rate: '₹10,526',
    unit: '/g',
    purity: '76.0% Diamond Grade',
    high: '10,610',
    low: '10,480',
    icon: 'fa-solid fa-gem',
  },
  {
    type: 'rate',
    label: '14KT BL RATE (60%)',
    rate: '₹8,310',
    unit: '/g',
    purity: '60.0% Daily Wear',
    high: '8,390',
    low: '8,260',
    icon: 'ri-vip-crown-2-line',
  },
  {
    type: 'rate',
    label: '9KT BL RATE (37.5%)',
    rate: '₹5,195',
    unit: '/g',
    purity: '37.5% Modern Light',
    high: '5,240',
    low: '5,150',
    icon: 'uil uil-coins',
  },
  {
    type: 'spot',
    label: 'INR SPOT',
    ask: '94.99',
    high: '95.28',
    low: '94.93',
    change: '+0.15%',
    icon: 'fa-solid fa-arrow-trend-up',
  },
  {
    type: 'rate',
    label: 'MUMBAI ZAVERI BAZAAR',
    rate: '₹1,38,450',
    unit: '/10g',
    hub: 'Physical Spot',
    icon: 'ri-building-line',
  },
  {
    type: 'rate',
    label: 'DELHI CHANDNI CHOWK',
    rate: '₹1,38,510',
    unit: '/10g',
    hub: 'Bullion Spot',
    icon: 'ri-building-line',
  },
  {
    type: 'badge',
    label: '100% RIGHT RATE GUARANTEE',
    rate: 'Govt. BIS 916 Certified',
    hub: 'Zero Hidden Spread',
    icon: 'uil uil-shield-check',
    isBadge: true,
  },
];

const DEFAULT_SILVER_RATES = [
  {
    type: 'spot',
    label: 'SILVER SPOT',
    ask: '49.16',
    high: '52.24',
    low: '48.87',
    change: '+1.15%',
    icon: 'fa-solid fa-coins',
  },
  {
    type: 'rate',
    label: '999 SILVER MCX (1 Kg)',
    rate: '₹1,79,037',
    change: '+₹1,250',
    hub: 'National Benchmark',
    icon: 'ri-scales-line',
  },
  {
    type: 'rate',
    label: '999 PURE SILVER (10g)',
    rate: '₹1,790',
    hub: 'Refined Ingot',
    change: '+₹18',
    icon: 'uil uil-shield-check',
  },
  {
    type: 'rate',
    label: '925 STERLING SILVER',
    rate: '₹1,656',
    unit: '/10g',
    purity: '92.5% Ornaments',
    icon: 'fa-solid fa-award',
  },
  {
    type: 'rate',
    label: 'LAXMI-GANESH COIN (10g)',
    rate: '₹1,850',
    hub: 'Shubh Puja Edition',
    icon: 'ri-sparkling-fill',
  },
  {
    type: 'rate',
    label: 'NATIONAL BULLION SILVER',
    rate: '₹1,78,850',
    unit: '/Kg',
    hub: 'Spot Physical',
    icon: 'ri-bank-card-line',
  },
  {
    type: 'badge',
    label: 'BLUE DART ARMORED EXPRESS',
    rate: 'Free on Orders > ₹5,000',
    hub: 'Tamper-Proof Insured',
    icon: 'fa-solid fa-truck-fast',
    isSpecial: true,
  },
  {
    type: 'badge',
    label: 'FESTIVE CODE: SHUBH10',
    rate: '10% Instant Savings',
    hub: 'Apply at Checkout',
    icon: 'uil uil-tag-alt',
    isSpecial: true,
  },
  {
    type: 'badge',
    label: 'LIFETIME BUYBACK GUARANTEE',
    rate: '100% Metal Weight Valuation',
    hub: 'Assured Buyback',
    icon: 'ri-shield-check-line',
    isBadge: true,
  },
];

export const LiveRatesMarquee = ({ initialRates = null }) => {
  const [goldRates, setGoldRates] = useState(
    initialRates?.goldRates?.length > 0 ? initialRates.goldRates : DEFAULT_GOLD_RATES
  );
  const [silverRates, setSilverRates] = useState(
    initialRates?.silverRates?.length > 0 ? initialRates.silverRates : DEFAULT_SILVER_RATES
  );

  useEffect(() => {
    if (initialRates) {
      if (initialRates.goldRates?.length > 0) setGoldRates(initialRates.goldRates);
      if (initialRates.silverRates?.length > 0) setSilverRates(initialRates.silverRates);
    }
  }, [initialRates]);

  useEffect(() => {
    const fetchRates = () => {
      rateService.getLiveRates()
        .then((res) => {
          if (res.success) {
            if (res.goldRates && res.goldRates.length > 0) setGoldRates(res.goldRates);
            if (res.silverRates && res.silverRates.length > 0) setSilverRates(res.silverRates);
          }
        })
        .catch((err) => {
          console.warn('Live rates API fallback:', err);
        });
    };

    fetchRates();
    const interval = setInterval(fetchRates, 45000); // 45-second live refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full text-xs font-body bg-white border-y border-stone-200 relative z-30 overflow-hidden">
      {/* ── TRACK 1: GOLD LIVE SPOT & MCX RATES (FLOWS LEFT TO RIGHT) ── */}
      <div className="bg-white border-b border-stone-100 py-2.5 overflow-hidden marquee-pause">
        <div className="animate-marquee-ltr flex items-center">
          {[...goldRates, ...goldRates].map((item, idx) => (
            <div
              key={`gold-${idx}`}
              className="inline-flex items-center gap-3 px-4 py-2 mx-2 rounded-xl bg-[#4D0D18] hover:bg-[#5C101E] border border-[#C9A44A]/50 transition-all duration-200 shrink-0 group cursor-default shadow-md shadow-[#4D0D18]/15 hover:shadow-lg"
            >
              {/* Icon Badge using FontAwesome / Remix / Unicons */}
              <div className="w-7 h-7 rounded-lg bg-[#C9A44A]/20 border border-[#C9A44A]/50 flex items-center justify-center text-[#F3E5AB] shrink-0 group-hover:scale-110 transition-transform">
                <i className={`${item.icon} text-xs`}></i>
              </div>

              {/* Data Layout: Right Gold Spot vs Rate Format */}
              {item.type === 'spot' ? (
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#F3E5AB] uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#6B1120] border border-[#C9A44A]/60 font-semibold text-white font-body">
                      ASK {item.ask}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-300 font-body mt-0.5">
                    <span className="text-emerald-400 font-semibold">H-{item.high}</span>
                    <span className="text-stone-400">•</span>
                    <span className="text-rose-400 font-semibold">L-{item.low}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-stone-200 uppercase tracking-wider">
                      {item.label}
                    </span>
                    {item.change && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-500/50 font-body">
                        {item.change}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-body font-bold text-white text-xs tracking-tight">
                      {item.rate}
                      {item.unit && <span className="text-[10px] text-stone-300 font-normal">{item.unit}</span>}
                    </span>
                    {(item.high && item.low) ? (
                      <span className="text-[9px] text-[#F3E5AB] font-body">
                        H-{item.high} L-{item.low}
                      </span>
                    ) : item.hub ? (
                      <span className="text-[9px] text-[#C9A44A] uppercase tracking-widest font-body">
                        [{item.hub}]
                      </span>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── TRACK 2: SILVER LIVE SPOT & MCX RATES (FLOWS RIGHT TO LEFT) ── */}
      <div className="bg-white py-2.5 overflow-hidden marquee-pause">
        <div className="animate-marquee-rtl flex items-center">
          {[...silverRates, ...silverRates].map((item, idx) => (
            <div
              key={`silver-${idx}`}
              className="inline-flex items-center gap-3 px-4 py-2 mx-2 rounded-xl bg-[#1A1F29] hover:bg-[#242A38] border border-stone-600/50 transition-all duration-200 shrink-0 group cursor-default shadow-md shadow-stone-900/10 hover:shadow-lg"
            >
              {/* Icon Badge using FontAwesome / Remix / Unicons */}
              <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-600/60 flex items-center justify-center text-stone-200 shrink-0 group-hover:scale-110 transition-transform">
                <i className={`${item.icon} text-xs`}></i>
              </div>

              {/* Data Layout: Spot vs Rate Format */}
              {item.type === 'spot' ? (
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-900 border border-stone-500 font-semibold text-[#F3E5AB] font-body">
                      ASK {item.ask}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 font-body mt-0.5">
                    <span className="text-emerald-400 font-semibold">H-{item.high}</span>
                    <span className="text-stone-400">•</span>
                    <span className="text-rose-400 font-semibold">L-{item.low}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-stone-200 uppercase tracking-wider">
                      {item.label}
                    </span>
                    {item.change && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-200 font-semibold border border-stone-600/50 font-body">
                        {item.change}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`font-body font-bold text-xs tracking-tight ${item.isSpecial ? 'text-[#F3E5AB]' : 'text-white'}`}>
                      {item.rate}
                      {item.unit && <span className="text-[10px] text-stone-400 font-normal">{item.unit}</span>}
                    </span>
                    {item.hub && (
                      <span className="text-[9px] text-stone-400 uppercase tracking-widest font-body">
                        [{item.hub}]
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
export default LiveRatesMarquee;
