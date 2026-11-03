import React, { useState, useEffect } from 'react';
import { rateService } from '../../services/api';

export const LiveRatesMarquee = ({ initialRates = null }) => {
  const [goldRates, setGoldRates] = useState(
    initialRates?.goldRates ?? []
  );
  const [silverRates, setSilverRates] = useState(
    initialRates?.silverRates ?? []
  );

  useEffect(() => {
    if (initialRates) {
      setGoldRates(initialRates.goldRates ?? []);
      setSilverRates(initialRates.silverRates ?? []);
    }
  }, [initialRates]);

  useEffect(() => {
    const fetchRates = () => {
      rateService.getLiveRates()
        .then((res) => {
          if (res.success) {
            setGoldRates(res.goldRates ?? []);
            setSilverRates(res.silverRates ?? []);
          }
        })
        .catch((err) => {
          console.warn('Live rates API error:', err);
        });
    };

    fetchRates();
    const interval = setInterval(fetchRates, 45000); // 45-second live refresh
    return () => clearInterval(interval);
  }, []);

  if (!goldRates.length && !silverRates.length) return null;

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
