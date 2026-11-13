import { RateCacheNotice } from './RateCacheNotice';
import { getRateDisplay, getRateError } from '../../lib/rateDisplay';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, MapPin, RefreshCw, Phone, ShieldCheck, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { rateService } from '../../services/api';

export const LiveRateModal = () => {
  const { isLiveRateOpen, closeLiveRate } = useUIStore();
  const [ratesData, setRatesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rateError, setRateError] = useState('');
  const prevRatesRef = useRef({});
  const [flashStates, setFlashStates] = useState({});

  const fetchRates = async (isManual = false) => {
    try {
      if (isManual) setLoading(true);
      setRateError('');
      const res = await rateService.getLiveRates();
      if (!res?.success) throw new Error('Rates unavailable');
      
      const { tableRows } = getRateDisplay(res);
      const newFlashes = {};
      tableRows.forEach(row => {
        const prev = prevRatesRef.current[row.id];
        if (prev !== undefined && prev !== row.numeric) {
          newFlashes[row.id] = row.numeric > prev ? 'up' : 'down';
        } else if (row.trend) {
          newFlashes[row.id] = row.trend;
        }
        prevRatesRef.current[row.id] = row.numeric;
      });

      setFlashStates(newFlashes);
      setRatesData(res);

      setTimeout(() => {
        setFlashStates({});
      }, 2500);

      return true;
    } catch (err) {
      setRateError(getRateError(err));
    } finally {
      if (isManual) setLoading(false);
    }
  };

  useEffect(() => {
    if (isLiveRateOpen) {
      fetchRates();
      const interval = setInterval(() => fetchRates(false), 6000);
      return () => clearInterval(interval);
    }
  }, [isLiveRateOpen]);

  if (!isLiveRateOpen) return null;

  const { goldSpot, silverSpot, inrSpot, tableRows } = getRateDisplay(ratesData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#6B0A11] text-white rounded-2xl shadow-2xl border border-[#C9A44A]/50 overflow-hidden max-h-[92vh] flex flex-col font-body">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-[#52050B] border-b border-[#C9A44A]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F3E5AB] font-serif tracking-wide">
                TODAY'S LIVE BULLION & SPOT RATES
              </h2>
              <span className="text-[10px] text-stone-300">
                MCX & Indian Bullion Spot Benchmark · Updated Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/live-rate"
              onClick={closeLiveRate}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#400308] border border-[#C9A44A]/40 text-[#F3E5AB] text-xs font-semibold hover:bg-[#300206] transition-colors"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3 h-3 text-[#C9A44A]" />
            </Link>

            <button
              onClick={() => fetchRates(true)}
              disabled={loading}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Refresh rates"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={closeLiveRate}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          <RateCacheNotice meta={ratesData?.meta} />
          {rateError && (
            <p role="alert" className="rounded-lg border border-amber-400/50 bg-amber-50 p-2.5 text-xs text-amber-950">
              {rateError}
            </p>
          )}
          
          {/* ── 3 SPOT CARDS GRID ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            
            {/* 1. GOLD MCX (10g) */}
            <div className="bg-[#52050B] border border-[#C9A44A]/60 rounded-xl p-4 text-center shadow-lg relative group">
              <div className="text-[11px] font-bold text-stone-200 tracking-wider uppercase mb-1">
                GOLD MCX (10g)
              </div>
              <div className={`text-2xl font-bold font-body tracking-tight my-1 py-1 rounded-md transition-all duration-300 ${
                goldSpot.isUnavailable || goldSpot.ask === 'Not Available'
                  ? 'bg-black/40 text-stone-300 border border-stone-600/60 text-lg'
                  : goldSpot.trend === 'up'
                  ? 'bg-[#107c41] text-white border border-emerald-400/60'
                  : 'bg-[#b91c1c] text-white border border-rose-400/60'
              }`}>
                {goldSpot.isUnavailable || goldSpot.ask === 'Not Available' ? 'Not Available' : `₹${goldSpot.ask}`}
              </div>
              <div className="flex items-center justify-center gap-3 text-[11px] text-stone-300 font-body">
                {goldSpot.isUnavailable || goldSpot.ask === 'Not Available' ? (
                  <span className="text-stone-400 text-xs">Updating with exchange</span>
                ) : (
                  <>
                    <span className="text-emerald-400 font-semibold">H-₹{goldSpot.high}</span>
                    <span className="text-stone-400">•</span>
                    <span className="text-rose-400 font-semibold">L-₹{goldSpot.low}</span>
                  </>
                )}
              </div>
            </div>

            {/* 2. 999 SILVER MCX (1 Kg) */}
            <div className="bg-[#52050B] border border-[#C9A44A]/60 rounded-xl p-4 text-center shadow-lg relative group">
              <div className="text-[11px] font-bold text-stone-200 tracking-wider uppercase mb-1">
                999 SILVER MCX (1 Kg)
              </div>
              <div className={`text-2xl font-bold font-body tracking-tight my-1 py-1 rounded-md transition-all duration-300 ${
                silverSpot.isUnavailable || silverSpot.ask === 'Not Available'
                  ? 'bg-black/40 text-stone-300 border border-stone-600/60 text-lg'
                  : silverSpot.trend === 'up'
                  ? 'bg-[#107c41] text-white border border-emerald-400/60'
                  : 'bg-[#b91c1c] text-white border border-rose-400/60'
              }`}>
                {silverSpot.isUnavailable || silverSpot.ask === 'Not Available' ? 'Not Available' : `₹${silverSpot.ask}`}
              </div>
              <div className="flex items-center justify-center gap-3 text-[11px] text-stone-300 font-body">
                {silverSpot.isUnavailable || silverSpot.ask === 'Not Available' ? (
                  <span className="text-stone-400 text-xs">Updating with exchange</span>
                ) : (
                  <>
                    <span className="text-emerald-400 font-semibold">H-₹{silverSpot.high}</span>
                    <span className="text-stone-400">•</span>
                    <span className="text-rose-400 font-semibold">L-₹{silverSpot.low}</span>
                  </>
                )}
              </div>
            </div>

            {/* 3. INR SPOT */}
            <div className="bg-[#52050B] border border-[#C9A44A]/60 rounded-xl p-4 text-center shadow-lg relative group">
              <div className="text-[11px] font-bold text-stone-200 tracking-wider uppercase mb-1">
                USD / INR
              </div>
              <div className={`text-2xl font-bold font-body tracking-tight my-1 py-1 rounded-md ${
                inrSpot.isUnavailable || inrSpot.ask === 'Not Available'
                  ? 'bg-black/40 text-stone-300 border border-stone-600/60 text-lg'
                  : 'bg-black/20 text-[#F3E5AB] border border-[#C9A44A]/30'
              }`}>
                {inrSpot.isUnavailable || inrSpot.ask === 'Not Available' ? 'Not Available' : `₹${inrSpot.ask}`}
              </div>
              <div className="flex items-center justify-center gap-3 text-[11px] text-stone-300 font-body">
                {inrSpot.isUnavailable || inrSpot.ask === 'Not Available' ? (
                  <span className="text-stone-400 text-xs">Updating with exchange</span>
                ) : (
                  <>
                    <span className="text-emerald-400 font-semibold">H-₹{inrSpot.high}</span>
                    <span className="text-stone-400">•</span>
                    <span className="text-rose-400 font-semibold">L-₹{inrSpot.low}</span>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* ── LOWER SECTION: TABLE + STORE INFO ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left: Rate Guarantee Table (7 cols) */}
            <div className="lg:col-span-7 bg-[#52050B] rounded-xl border border-[#C9A44A]/40 overflow-hidden shadow-lg flex flex-col">
              
              <div className="px-5 py-3 bg-[#400308] border-b border-[#C9A44A]/40 flex items-center justify-between text-xs font-bold text-[#F3E5AB] uppercase tracking-wider">
                <span>BL Rate Guarantee</span>
                <span>Live Rate</span>
              </div>

              <div className="divide-y divide-[#6B0A11]/60 flex-1">
                {tableRows.map((row) => {
                  const flash = flashStates[row.id];
                  const isUp = flash === 'up' || (!flash && row.trend === 'up');

                  return (
                    <div
                      key={row.id}
                      className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-[#400308]/50 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className={`text-xs ${row.isBold ? 'font-bold text-[#F3E5AB]' : 'text-stone-100'}`}>
                          {row.label}
                        </span>
                        <span className="text-[9px] text-stone-300">
                          {row.purity}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {row.change && (
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold font-mono px-1 py-0.2 rounded border ${
                            isUp
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                          }`}>
                            {isUp ? <TrendingUp className="w-2.5 h-2.5 text-emerald-400" /> : <TrendingDown className="w-2.5 h-2.5 text-rose-400" />}
                            <span>{row.change}</span>
                          </span>
                        )}

                        <div className={`px-3 py-1 rounded-md font-bold font-mono text-xs sm:text-sm tracking-tight transition-all duration-300 min-w-[90px] text-right ${
                          row.isUnavailable || row.rate === 'Not Available'
                            ? 'bg-black/40 text-stone-300 border border-stone-600/60 text-center text-xs'
                            : flash === 'up'
                            ? 'bg-[#107c41] text-white ring-2 ring-emerald-300'
                            : flash === 'down'
                            ? 'bg-[#b91c1c] text-white ring-2 ring-rose-300'
                            : isUp
                            ? 'bg-[#107c41] text-white'
                            : 'bg-[#b91c1c] text-white'
                        }`}>
                          {row.rate}
                          {row.unit && !row.isUnavailable && row.rate !== 'Not Available' && (
                            <span className="text-[9px] text-stone-200 ml-0.5">{row.unit}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 bg-[#400308] border-t border-[#C9A44A]/30 text-center text-[10px] text-stone-300">
                <span>100% BIS 916 certified rates updated with live exchange movements.</span>
              </div>
            </div>

            {/* Right: Boutique Showcase */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#FFFDF9] to-[#F3EDE2] text-stone-900 rounded-xl p-5 border border-[#C9A44A] shadow-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-xs font-serif font-bold text-[#6B0A11] tracking-wider uppercase">
                    BL JEWELS ATELIER
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#6B0A11] text-[#F3E5AB] text-[9px] font-bold">
                    FLAGSHIP STORE
                  </span>
                </div>

                <div className="text-center my-2">
                  <h4 className="text-sm font-serif font-bold text-[#6B0A11]">
                    Civil Lines Flagship, Agra
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    Handcrafted Heritage & 100% Hallmark Verification
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white border border-[#C9A44A]/30 space-y-1.5 text-[11px]">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#6B0A11] shrink-0 mt-0.5" />
                    <span className="text-stone-700">
                      Suresh Mall, MG Road, Civil Lines, Agra
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 border-t border-stone-100">
                    <Phone className="w-3 h-3 text-[#6B0A11]" />
                    <a href="tel:07454986610" className="font-bold text-stone-900">
                      074549 86610
                    </a>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Lifetime Buyback & 100% BIS Hallmarking</span>
                </div>
              </div>

              <Link
                to="/live-rate"
                onClick={closeLiveRate}
                className="w-full py-2 bg-[#6B0A11] hover:bg-[#52050B] text-[#F3E5AB] rounded-lg text-xs font-bold text-center block transition-colors shadow-sm"
              >
                View Full Live Rate Page →
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
