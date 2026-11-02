import React, { useState, useEffect } from 'react';
import {
  FileText,
  Coins,
  RotateCcw,
  Calculator,
  Sparkles,
  ArrowRight,
  Gem,
  X
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { rateService } from '../../services/api';

export const RoyalPromisesSection = () => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcWeight, setCalcWeight] = useState(24.5);
  const [calcKarat, setCalcKarat] = useState('22K');

  // Bullion rates per gram (synced with GoldAPI.io real live rates & Indian Domestic Benchmark)
  const [rates, setRates] = useState({
    '24K': 13901,
    '22K': 12743,
    '18K': 10426,
  });

  useEffect(() => {
    rateService.getLiveRates().then((res) => {
      if (res?.numericRates) {
        setRates({
          '24K': res.numericRates['24K'] || 13901,
          '22K': res.numericRates['22K'] || 12743,
          '18K': res.numericRates['18K'] || 10426,
        });
      }
    }).catch(() => {});
  }, []);

  const selectedRate = rates[calcKarat] || 12743;
  const goldValue = Math.round(Number(calcWeight || 0) * selectedRate);
  const makingCharge = Math.round(goldValue * 0.03); // 3% making charge
  const subtotal = goldValue + makingCharge;
  const gst = Math.round(subtotal * 0.03); // 3% GST
  const grandTotal = subtotal + gst;

  // 6 Sleek Promises with perfectly tailored concise copy (No ugly line-clamp ellipses)
  const promises = [
    {
      id: 'transparency',
      type: 'icon',
      icon: FileText,
      title: 'Complete Transparency',
      desc: 'Fair pricing with itemized tax invoice. Zero hidden markups or phantom wastage.',
    },
    {
      id: 'spot-rate',
      type: 'icon',
      icon: Coins,
      title: 'Live Gold Rate',
      desc: 'Real-time bullion spot rates directly synced via live official GoldAPI feed.',
    },
    {
      id: 'making-charges',
      type: 'custom-text',
      badgeText: '3%',
      title: 'Making Charges',
      desc: 'Save up to 40% with authentic karigar making charges starting from just 3%.',
    },
    {
      id: 'modern-designs',
      type: 'icon',
      icon: Gem,
      title: 'Modern Designs',
      desc: 'Royal bridal polki and daily minimalist designs crafted to perfection.',
    },
    {
      id: 'top-quality',
      type: 'icon',
      icon: RotateCcw,
      title: 'Lifetime Buyback',
      desc: '100% lifetime buyback & exchange calculated at prevailing market gold rate.',
    },
    {
      id: 'calculator',
      type: 'icon',
      icon: Calculator,
      title: 'Bill Yourself Calculator',
      desc: 'Instant transparent price estimation. Calculate pure gold, making & GST.',
      isAction: true,
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[#0E0507] border-b border-[#2D0D14] relative overflow-hidden w-full text-white">
      
      {/* ── Background Subtle Luxury Gold Glow ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-gradient-to-b from-[#C9A44A]/15 via-rose-950/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-9 sm:mb-12 space-y-2 px-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-8 h-px bg-gradient-to-r from-transparent to-[#C9A44A]" />
            <span className="font-accent text-[11px] font-semibold text-[#E6C875] tracking-[0.25em] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A44A]" />
              THE AUSPICIOUS STANDARD
            </span>
            <span className="w-8 h-px bg-gradient-to-l from-transparent to-[#C9A44A]" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-semibold text-white tracking-tight leading-tight">
            The BL Jewels <span className="text-[#E6C875]">Royal Promises</span>
          </h2>

          <p className="font-body text-xs sm:text-sm text-stone-300 max-w-md mx-auto font-normal leading-relaxed">
            Setting the standard in fine Indian jewelry with transparent pricing, certified BIS 916 purity, and zero hidden deductions.
          </p>
        </div>

        {/* ── 6 Compact Sleek Promise Cards (Single Row Layout on Desktop, Centered, Rich Contrast) ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5 items-stretch">
          {promises.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.isAction) setShowCalculator(true);
                }}
                className={`group relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#240C14] via-[#1B070E] to-[#120409] border transition-all duration-300 flex flex-col items-center text-center justify-between shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,230,150,0.1)] ${
                  item.isAction
                    ? 'border-[#C9A44A] ring-1 ring-[#C9A44A]/50 hover:shadow-[0_12px_32px_rgba(201,164,74,0.35)] hover:-translate-y-1.5 cursor-pointer bg-gradient-to-b from-[#2E0E1B] to-[#16060D]'
                    : 'border-[#C9A44A]/30 hover:border-[#F3E5AB]/80 hover:shadow-[0_12px_30px_rgba(201,164,74,0.22)] hover:-translate-y-1.5'
                }`}
              >
                {/* Top: Glowing Gold Icon / 3% Glyph */}
                <div className="mb-4">
                  {item.type === 'custom-text' ? (
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#6E1520] to-[#36080E] border border-[#C9A44A]/60 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#C9A44A] transition-all duration-300 mx-auto">
                      <span className="font-display text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 group-hover:text-[#120508] group-hover:bg-none transition-colors tracking-tight">
                        {item.badgeText}
                      </span>
                    </div>
                  ) : (
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#6E1520] to-[#36080E] border border-[#C9A44A]/60 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#C9A44A] transition-all duration-300 mx-auto">
                      <Icon className="w-6 h-6 text-[#E6C875] group-hover:text-[#120508] transition-colors" />
                    </div>
                  )}
                </div>

                {/* Middle: Title Centered */}
                <h3 className="font-display text-sm sm:text-base font-bold text-white group-hover:text-[#F3E5AB] transition-colors leading-snug mb-2 min-h-[38px] flex items-center justify-center">
                  {item.title}
                </h3>

                {/* Bottom: Crisp Description (Fully readable, no truncated words) */}
                <p className="font-body text-xs text-stone-300 font-normal leading-relaxed">
                  {item.desc}
                </p>

                {/* Interactive CTA for Calculator */}
                {item.isAction ? (
                  <div className="mt-3.5 pt-2.5 border-t border-[#C9A44A]/30 w-full flex items-center justify-center gap-1.5 text-xs font-bold text-[#F3E5AB] group-hover:text-white transition-colors">
                    <span>Calculate Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                ) : (
                  <div className="mt-2" />
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* ── Bill Yourself Price Breakdown Modal ── */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#240F15] text-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#C9A44A]/70 shadow-2xl relative space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C9A44A] text-[#160A0D] flex items-center justify-center font-bold shadow-md">
                  <Calculator className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">
                    Bill Yourself Calculator
                  </h3>
                  <p className="text-[11px] text-stone-300">
                    Live market valuation powered by GoldAPI.io
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCalculator(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs: Karat & Weight */}
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-accent text-stone-300 uppercase tracking-wider block mb-1.5">
                  Select Purity Standard
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['24K', '22K', '18K'].map((karat) => (
                    <button
                      key={karat}
                      type="button"
                      onClick={() => setCalcKarat(karat)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        calcKarat === karat
                          ? 'bg-[#C9A44A] text-[#160A0D] border-[#C9A44A] shadow-md font-bold'
                          : 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {karat} ({formatCurrency(rates[karat] || 0)}/g)
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-accent text-stone-300 uppercase tracking-wider">
                    Gross Gold Weight (Grams)
                  </label>
                  <span className="text-xs font-bold text-[#E6C875]">
                    {calcWeight} g
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="150"
                  step="0.5"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(parseFloat(e.target.value))}
                  className="w-full accent-[#C9A44A] bg-white/10 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>1g (Coin)</span>
                  <span>24.5g (Standard Kada)</span>
                  <span>150g (Bridal Set)</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="bg-[#18090E] rounded-2xl p-4 border border-[#C9A44A]/30 space-y-2 text-xs shadow-inner">
              <div className="flex justify-between text-stone-300">
                <span>Pure Gold Value ({calcWeight}g @ {formatCurrency(selectedRate)}):</span>
                <span className="font-semibold text-white">{formatCurrency(goldValue)}</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span className="flex items-center gap-1">
                  Making Charges (Fair 3% Direct-from-Karigar):
                </span>
                <span className="font-semibold text-emerald-400">{formatCurrency(makingCharge)}</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>Applicable GST (3% Govt. Sovereign Tax):</span>
                <span className="font-semibold text-white">{formatCurrency(gst)}</span>
              </div>
              <div className="border-t border-white/10 pt-2.5 flex justify-between items-baseline">
                <span className="font-display text-sm font-bold text-white">Estimated Invoice Total:</span>
                <span className="font-display text-lg font-bold text-[#E6C875]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Footer Trust Note */}
            <div className="text-center pt-1">
              <p className="text-[10px] text-stone-400">
                * Zero hidden wastage or deduction. Final invoice generated at boutique reflects exact certified scale reading.
              </p>
              <button
                onClick={() => setShowCalculator(false)}
                className="mt-3 w-full py-2.5 bg-gradient-to-r from-[#C9A44A] to-[#B68936] text-[#12070A] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:brightness-110 transition-all cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
