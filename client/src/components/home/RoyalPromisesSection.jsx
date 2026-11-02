import React, { useState, useEffect } from 'react';
import {
  FileText,
  Coins,
  ShieldCheck,
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
    '24K': 13900,
    '22K': 12742,
    '18K': 10425,
  });

  useEffect(() => {
    rateService.getLiveRates().then((res) => {
      if (res?.numericRates) {
        setRates({
          '24K': res.numericRates['24K'] || 13900,
          '22K': res.numericRates['22K'] || 12742,
          '18K': res.numericRates['18K'] || 10425,
        });
      }
    }).catch(() => {});
  }, []);

  const selectedRate = rates[calcKarat] || 10900;
  const goldValue = Math.round(Number(calcWeight || 0) * selectedRate);
  const makingCharge = Math.round(goldValue * 0.03); // 3% making charge
  const subtotal = goldValue + makingCharge;
  const gst = Math.round(subtotal * 0.03); // 3% GST
  const grandTotal = subtotal + gst;

  // 6 Compact Sleek Promises (Directly modeled on Right Gold reference in dark luxury styling)
  const promises = [
    {
      id: 'transparency',
      type: 'icon',
      icon: FileText,
      title: 'Complete Transparency',
      desc: 'Complete transparency with fair pricing and itemized tax invoice. Zero hidden charges or phantom wastage.',
    },
    {
      id: 'spot-rate',
      type: 'icon',
      icon: Coins,
      title: 'Live Gold Rate',
      desc: 'Live gold rate - Get real-time spot bullion rates directly synced via official GoldAPI feed.',
    },
    {
      id: 'making-charges',
      type: 'custom-text',
      badgeText: '3%',
      title: 'Making Charges',
      desc: 'Save more with authentic karigar making charges starting from just 3% on certified gold jewellery.',
    },
    {
      id: 'modern-designs',
      type: 'icon',
      icon: Gem,
      title: 'Modern Designs',
      desc: 'Royal bridal polki and modern minimalist daily designs crafted to perfection by master artisans.',
    },
    {
      id: 'top-quality',
      type: 'icon',
      icon: RotateCcw,
      title: 'Lifetime Buyback',
      desc: '100% lifetime exchange guarantee at prevailing market gold rate with BIS 916 & HUID certification.',
    },
    {
      id: 'calculator',
      type: 'icon',
      icon: Calculator,
      title: 'Bill Yourself Calculator',
      desc: 'Get an instant, transparent jewellery price breakdown. Calculate gold, making charges, and GST live.',
      isAction: true,
    },
  ];

  return (
    <section className="py-10 sm:py-14 bg-[#12070A] border-b border-[#2D0D14] relative overflow-hidden w-full text-white">
      
      {/* ── Background Subtle Luxury Gold Glow ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-gradient-to-b from-[#C9A44A]/12 via-rose-950/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Section Header: Compact & Elegant */}
        <div className="text-center max-w-xl mx-auto mb-7 sm:mb-9 space-y-1.5 px-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gradient-to-r from-transparent to-[#C9A44A]" />
            <span className="font-accent text-[10px] font-semibold text-[#E6C875] tracking-[0.25em] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#C9A44A]" />
              THE AUSPICIOUS STANDARD
            </span>
            <span className="w-6 h-px bg-gradient-to-l from-transparent to-[#C9A44A]" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-semibold text-white tracking-tight">
            The BL Jewels <span className="text-[#E6C875]">Royal Promises</span>
          </h2>

          <p className="font-body text-xs text-stone-300 max-w-md mx-auto font-normal leading-relaxed">
            Setting the standard in fine Indian jewelry with transparent pricing, certified BIS 916 purity, and zero hidden deductions.
          </p>
        </div>

        {/* ── 6 Compact Sleek Promise Cards (Single Row Layout on Desktop, Centered, No Images) ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5 lg:gap-4 items-stretch">
          {promises.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.isAction) setShowCalculator(true);
                }}
                className={`group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#200C12]/95 via-[#18090E]/95 to-[#12060A]/95 border transition-all duration-300 flex flex-col items-center text-center justify-between shadow-lg ${
                  item.isAction
                    ? 'border-[#C9A44A] ring-1 ring-[#C9A44A]/40 hover:shadow-[0_8px_24px_rgba(201,164,74,0.3)] hover:-translate-y-1 cursor-pointer bg-gradient-to-b from-[#280F17] to-[#14060B]'
                    : 'border-[#C9A44A]/25 hover:border-[#F3E5AB]/60 hover:shadow-[0_8px_24px_rgba(201,164,74,0.18)] hover:-translate-y-1'
                }`}
              >
                {/* Top: Icon / Distinctive 3% Badge Centered */}
                <div className="mb-3.5">
                  {item.type === 'custom-text' ? (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7A1D28] to-[#450C14] border border-[#C9A44A]/50 flex items-center justify-center text-[#F3E5AB] group-hover:scale-105 group-hover:bg-[#C9A44A] group-hover:text-[#12070A] transition-all duration-200 shadow-sm mx-auto">
                      <span className="font-display text-lg font-bold tracking-tight">
                        {item.badgeText}
                      </span>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7A1D28] to-[#450C14] border border-[#C9A44A]/50 flex items-center justify-center text-[#F3E5AB] group-hover:scale-105 group-hover:bg-[#C9A44A] group-hover:text-[#12070A] transition-all duration-200 shadow-sm mx-auto">
                      <Icon className="w-5 h-5 text-[#E6C875] group-hover:text-[#12070A] transition-colors" />
                    </div>
                  )}
                </div>

                {/* Middle: Title Centered */}
                <h3 className="font-display text-sm sm:text-[15px] font-bold text-white group-hover:text-[#F3E5AB] transition-colors leading-snug mb-2 line-clamp-1">
                  {item.title}
                </h3>

                {/* Bottom: Crisp Short Description */}
                <p className="font-body text-[11px] sm:text-xs text-stone-300 font-normal leading-relaxed line-clamp-3">
                  {item.desc}
                </p>

                {/* Interactive CTA for Calculator */}
                {item.isAction && (
                  <div className="mt-3 pt-2 border-t border-[#C9A44A]/30 w-full flex items-center justify-center gap-1 text-[11px] font-bold text-[#F3E5AB] group-hover:text-white transition-colors">
                    <span>Calculate Now</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* ── Bill Yourself Price Breakdown Modal ── */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#240F15] text-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#C9A44A]/60 shadow-2xl relative space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C9A44A] text-[#160A0D] flex items-center justify-center font-bold">
                  <Calculator className="w-4 h-4" />
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
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs: Karat & Weight */}
            <div className="space-y-3">
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
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        calcKarat === karat
                          ? 'bg-[#C9A44A] text-[#160A0D] border-[#C9A44A] shadow-md'
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
            <div className="bg-[#18090E] rounded-2xl p-4 border border-[#C9A44A]/30 space-y-2 text-xs">
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
                className="mt-3 w-full py-2.5 bg-gradient-to-r from-[#C9A44A] to-[#B68936] text-[#12070A] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:brightness-110 transition-all"
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
