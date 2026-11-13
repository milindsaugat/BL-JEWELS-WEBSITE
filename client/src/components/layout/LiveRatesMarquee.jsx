import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { rateService } from '../../services/api';

export const LiveRatesMarquee = ({ initialRates = null }) => {
  const [goldRates, setGoldRates] = useState(initialRates?.goldRates ?? []);
  const [silverRates, setSilverRates] = useState(initialRates?.silverRates ?? []);
  const [flashes, setFlashes] = useState({});
  const prevRatesRef = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    if (initialRates) {
      setGoldRates(initialRates.goldRates ?? []);
      setSilverRates(initialRates.silverRates ?? []);
    }
  }, [initialRates]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const fetchRates = () => {
      rateService.getLiveRates()
        .then((res) => {
          if (!isMounted || !res?.success) return;

          const newFlashes = {};
          const allItems = [...(res.goldRates || []), ...(res.silverRates || [])];

          allItems.forEach((item) => {
            const val = item.numeric || parseFloat(item.ask) || 0;
            if (val > 0) {
              const prev = prevRatesRef.current[item.label];
              if (prev !== undefined && prev !== val) {
                newFlashes[item.label] = val > prev ? 'up' : 'down';
              } else if (item.trend) {
                newFlashes[item.label] = item.trend;
              }
              prevRatesRef.current[item.label] = val;
            }
          });

          setFlashes(newFlashes);
          setGoldRates(res.goldRates ?? []);
          setSilverRates(res.silverRates ?? []);

          timeoutId = setTimeout(() => {
            if (isMounted) setFlashes({});
          }, 1800);
        })
        .catch(() => {});
    };

    fetchRates();

    // High frequency live ticker sync (every 3.5 seconds)
    const intervalId = setInterval(fetchRates, 3500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (!goldRates.length && !silverRates.length) return null;

  // Duplicate items sufficiently so that one block alone spans >3500px on any display
  const goldBlockItems = [...goldRates, ...goldRates, ...goldRates];
  const silverBlockItems = [...silverRates, ...silverRates, ...silverRates, ...silverRates, ...silverRates, ...silverRates];

  const handleOpenLiveRates = () => {
    navigate('/live-rate');
  };

  // Helper to render an individual bullion card
  const renderCard = (item, isSilver, key) => {
    const isUnavailable =
      item.isUnavailable ||
      item.rate === 'Not Available' ||
      item.ask === 'Not Available';

    const flash = flashes[item.label];
    const isUp = flash === 'up' || (!flash && item.trend === 'up');

    return (
      <div
        key={key}
        onClick={handleOpenLiveRates}
        title="Click to view full Live Rates Board"
        className={`inline-flex items-center gap-3 px-3.5 py-2 mx-1.5 rounded-xl border transition-all duration-300 shrink-0 group cursor-pointer shadow-md hover:shadow-lg ${
          isSilver
            ? 'bg-[#18202A] hover:bg-[#202936] border-slate-700/80 shadow-slate-950/20'
            : 'bg-[#930303] hover:bg-[#7A0303] border-[#C9A44A]/50 shadow-[#52050B]/30'
        }`}
      >
        {/* Icon Badge */}
        <div
          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${
            isSilver
              ? 'bg-slate-400/20 border-slate-300/40 text-slate-100'
              : 'bg-[#C9A44A]/20 border-[#C9A44A]/50 text-[#F3E5AB]'
          }`}
        >
          <i className={`${item.icon || (isSilver ? 'uil uil-coins' : 'uil uil-gold')} text-xs`} />
        </div>

        {/* Spot vs Fixed Rate Display */}
        {item.type === 'spot' ? (
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isSilver ? 'text-slate-100' : 'text-[#F3E5AB]'
                }`}
              >
                {item.label}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold font-mono transition-all duration-300 shadow-xs ${
                  isUnavailable
                    ? 'bg-black/40 border border-stone-600/60 text-stone-300'
                    : flash === 'up'
                    ? 'bg-[#107c41] text-white ring-1 ring-emerald-300 shadow-emerald-900/50'
                    : flash === 'down'
                    ? 'bg-[#b91c1c] text-white ring-1 ring-rose-300 shadow-rose-900/50'
                    : isUp
                    ? 'bg-[#107c41] text-white border border-emerald-400/60'
                    : 'bg-[#b91c1c] text-white border border-rose-400/60'
                }`}
              >
                {isUnavailable ? 'Not Available' : `₹${item.ask}${item.unit || ''}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-stone-200 font-body mt-0.5">
              {isUnavailable ? (
                <span className="text-stone-300/80 font-medium text-[9px]">Rate Updating</span>
              ) : (
                <>
                  <span className="text-emerald-300 font-semibold">H-₹{item.high || item.ask}</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-rose-300 font-semibold">L-₹{item.low || item.ask}</span>
                  {item.change && (
                    <span className={`font-mono text-[9px] font-bold ${isUp ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {item.change}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isSilver ? 'text-slate-100' : 'text-[#F3E5AB]'
                }`}
              >
                {item.label}
              </span>

              {item.purity && (
                <span
                  className={`text-[9px] font-body opacity-85 hidden sm:inline ${
                    isSilver ? 'text-slate-300' : 'text-[#F3E5AB]'
                  }`}
                >
                  • {item.purity}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              {/* Dynamic Red / Green Rate Box - exact Right Gold style */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-xs shadow-xs transition-all duration-300 ${
                  isUnavailable
                    ? 'bg-black/40 text-stone-300 border border-stone-600/60'
                    : flash === 'up'
                    ? 'bg-[#107c41] text-white ring-1 ring-emerald-300 shadow-emerald-900/50'
                    : flash === 'down'
                    ? 'bg-[#b91c1c] text-white ring-1 ring-rose-300 shadow-rose-900/50'
                    : isUp
                    ? 'bg-[#107c41] text-white border border-emerald-400/60'
                    : 'bg-[#b91c1c] text-white border border-rose-400/60'
                }`}
              >
                {item.rate}
                {item.unit && !isUnavailable && (
                  <span className="text-[10px] text-stone-200 font-normal ml-0.5">{item.unit}</span>
                )}
              </span>

              {/* Dynamic Red / Green Up/Down Indicator Badge */}
              {item.change && !isUnavailable && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded font-bold font-mono border ${
                    isUp
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
                  )}
                  <span>{item.change}</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="w-full text-xs font-body bg-white border-y border-stone-200 relative z-30 overflow-hidden">
      {/* ── TRACK 1: GOLD LIVE RATES (FLOWS LEFT TO RIGHT) ── */}
      <div className="bg-white border-b border-stone-100 py-2 overflow-hidden marquee-pause relative group/track">
        <div className="animate-marquee-ltr flex items-center w-max">
          
          {/* Static Live Pill in stream */}
          <div
            onClick={handleOpenLiveRates}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 mx-2 rounded-xl bg-[#52050B] text-[#F3E5AB] border border-[#C9A44A]/50 shrink-0 cursor-pointer shadow-sm hover:bg-[#400308]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">🟢 LIVE GOLD MCX</span>
            <ExternalLink className="w-3 h-3 text-[#C9A44A]" />
          </div>

          {/* Block 1 */}
          <div className="flex items-center shrink-0">
            {goldBlockItems.map((item, idx) => renderCard(item, false, `g1-${idx}`))}
          </div>
          {/* Block 2 (Exact Duplicate for 100% Zero-Gap Seamless Loop) */}
          <div className="flex items-center shrink-0" aria-hidden="true">
            {goldBlockItems.map((item, idx) => renderCard(item, false, `g2-${idx}`))}
          </div>
        </div>
      </div>

      {/* ── TRACK 2: SILVER LIVE RATES (FLOWS RIGHT TO LEFT) ── */}
      <div className="bg-white py-2 overflow-hidden marquee-pause relative group/track">
        <div className="animate-marquee-rtl flex items-center w-max">
          
          {/* Static Live Pill in stream */}
          <div
            onClick={handleOpenLiveRates}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 mx-2 rounded-xl bg-[#18202A] text-slate-100 border border-slate-500/50 shrink-0 cursor-pointer shadow-sm hover:bg-[#202936]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">🟢 999 SILVER SPOT</span>
            <ExternalLink className="w-3 h-3 text-slate-300" />
          </div>

          {/* Block 1 */}
          <div className="flex items-center shrink-0">
            {silverBlockItems.map((item, idx) => renderCard(item, true, `s1-${idx}`))}
          </div>
          {/* Block 2 (Exact Duplicate for 100% Zero-Gap Seamless Loop) */}
          <div className="flex items-center shrink-0" aria-hidden="true">
            {silverBlockItems.map((item, idx) => renderCard(item, true, `s2-${idx}`))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveRatesMarquee;
