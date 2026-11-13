import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, RefreshCw, Phone, ShieldCheck, ArrowLeft, ArrowUpRight, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { RateCacheNotice } from '../components/common/RateCacheNotice';
import { getRateDisplay, getRateError } from '../lib/rateDisplay';
import { rateService } from '../services/api';

export const LiveRatePage = () => {
  const [ratesData, setRatesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rateError, setRateError] = useState('');
  const [lastTickTime, setLastTickTime] = useState(() => new Date());
  
  // Track previous numeric rates to trigger flash highlights
  const prevRatesRef = useRef({});
  const [flashStates, setFlashStates] = useState({}); // { [rowId]: 'up' | 'down' }

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
      setLastTickTime(new Date());

      // Clear intense flash animation after 1.8s
      setTimeout(() => {
        setFlashStates({});
      }, 1800);

      return true;
    } catch (err) {
      setRateError(getRateError(err));
      return false;
    } finally {
      if (isManual) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // High-frequency live ticker sync (every 3.5 seconds for instant real-time feel)
    const intervalId = setInterval(() => {
      fetchRates(false);
    }, 3500);

    return () => clearInterval(intervalId);
  }, []);

  const { goldSpot, silverSpot, inrSpot, tableRows } = getRateDisplay(ratesData);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb & Live Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#930303] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Storefront</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE BULLION STREAM</span>
            </span>

            <button
              onClick={() => fetchRates(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#930303]' : ''}`} />
              <span>{loading ? 'Updating...' : 'Sync Ticks'}</span>
            </button>
          </div>
        </div>

        {/* Status notice */}
        <RateCacheNotice meta={ratesData?.meta} />
        {rateError && (
          <p role="alert" className="rounded-lg border border-amber-400/50 bg-amber-50 p-3 text-xs text-amber-950">
            {rateError}
          </p>
        )}

        {/* ── Main Maroon Container (Right Gold Inspiration with BL Jewels Royal Luxury) ── */}
        <div className="bg-[#6B0A11] text-white rounded-2xl shadow-2xl border border-[#C9A44A]/50 p-5 sm:p-8 space-y-6">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C9A44A]/30">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#F3E5AB]">
                  Purity with Auspiciousness
                </span>
                <span className="text-[#C9A44A]">•</span>
                <span className="text-[10px] text-stone-300 font-medium">
                  Last Tick: {lastTickTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#F3E5AB] tracking-wide flex items-center gap-2.5">
                TODAY'S LIVE BULLION & KARAT RATES
              </h1>
              <p className="text-xs text-stone-200 mt-1">
                Real-time MCX & spot benchmark rates for 22K (916 BIS Hallmarked), 18K Diamond Jewellery & 999 Fine Silver.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1.5 rounded-lg bg-[#52050B] text-[#F3E5AB] border border-[#C9A44A]/40 text-xs font-semibold shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A44A]" />
                <span>MCX National Spot Sync</span>
              </span>
            </div>
          </div>

          {/* ── 3 TOP SPOT ASK CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. GOLD MCX (10g) */}
            <div className="bg-[#52050B] border border-[#C9A44A]/60 rounded-xl p-4 sm:p-5 text-center shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-200 uppercase tracking-wider mb-1">
                <span>GOLD MCX (10g)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-[#F3E5AB] border border-[#C9A44A]/30">
                  MCX BENCHMARK
                </span>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold font-body tracking-tight my-2 py-1 rounded-lg transition-all duration-300 ${
                goldSpot.isUnavailable || goldSpot.ask === 'Not Available'
                  ? 'bg-black/40 text-stone-300 border border-stone-600/60 text-lg sm:text-xl'
                  : goldSpot.trend === 'up'
                  ? 'bg-[#107c41] text-white border border-emerald-400/60 shadow-md'
                  : 'bg-[#b91c1c] text-white border border-rose-400/60 shadow-md'
              }`}>
                {goldSpot.isUnavailable || goldSpot.ask === 'Not Available' ? 'Not Available' : `₹${goldSpot.ask}`}
              </div>
              <div className="flex items-center justify-between text-xs text-stone-300 font-body px-1">
                {goldSpot.isUnavailable || goldSpot.ask === 'Not Available' ? (
                  <span className="text-stone-400 text-center w-full text-[11px]">Updating with live exchange</span>
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
            <div className="bg-[#52050B] border border-[#C9A44A]/60 rounded-xl p-4 sm:p-5 text-center shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-200 uppercase tracking-wider mb-1">
                <span>999 SILVER MCX (1 Kg)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-[#F3E5AB] border border-[#C9A44A]/30">
                  MCX SPOT
                </span>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold font-body tracking-tight my-2 py-1 rounded-lg transition-all duration-300 ${
                silverSpot.isUnavailable || silverSpot.ask === 'Not Available'
                  ? 'bg-black/40 text-stone-300 border border-stone-600/60 text-lg sm:text-xl'
                  : silverSpot.trend === 'up'
                  ? 'bg-[#107c41] text-white border border-emerald-400/60 shadow-md'
                  : 'bg-[#b91c1c] text-white border border-rose-400/60 shadow-md'
              }`}>
                {silverSpot.isUnavailable || silverSpot.ask === 'Not Available' ? 'Not Available' : `₹${silverSpot.ask}`}
              </div>
              <div className="flex items-center justify-between text-xs text-stone-300 font-body px-1">
                {silverSpot.isUnavailable || silverSpot.ask === 'Not Available' ? (
                  <span className="text-stone-400 text-center w-full text-[11px]">Updating with live exchange</span>
                ) : (
                  <>
                    <span className="text-emerald-400 font-semibold">H-₹{silverSpot.high}</span>
                    <span className="text-stone-400">•</span>
                    <span className="text-rose-400 font-semibold">L-₹{silverSpot.low}</span>
                  </>
                )}
              </div>
            </div>

            {/* 3. USD / INR */}
            <div className="bg-[#52050B] border border-[#C9A44A]/60 rounded-xl p-4 sm:p-5 text-center shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-200 uppercase tracking-wider mb-1">
                <span>USD / INR</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-[#F3E5AB] border border-[#C9A44A]/30">
                  RBI FOREX
                </span>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold font-body tracking-tight my-2 py-1 rounded-lg transition-all duration-300 ${
                inrSpot.isUnavailable || inrSpot.ask === 'Not Available'
                  ? 'bg-black/40 text-stone-300 border border-stone-600/60 text-lg sm:text-xl'
                  : 'bg-black/20 text-[#F3E5AB] border border-[#C9A44A]/30'
              }`}>
                {inrSpot.isUnavailable || inrSpot.ask === 'Not Available' ? 'Not Available' : `₹${inrSpot.ask}`}
              </div>
              <div className="flex items-center justify-between text-xs text-stone-300 font-body px-1">
                {inrSpot.isUnavailable || inrSpot.ask === 'Not Available' ? (
                  <span className="text-stone-400 text-center w-full text-[11px]">Updating with live exchange</span>
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

          {/* ── LOWER SECTION: RIGHT GOLD STYLE TABLE + STORE SHOWCASE BANNER ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left: Rate Guarantee Table with Live Red/Green Flashing (7 cols) */}
            <div className="lg:col-span-7 bg-[#52050B] rounded-xl border border-[#C9A44A]/40 overflow-hidden shadow-xl flex flex-col">
              
              {/* Table Header */}
              <div className="px-5 py-3.5 bg-[#400308] border-b border-[#C9A44A]/40 flex items-center justify-between text-xs font-bold text-[#F3E5AB] uppercase tracking-wider">
                <span>BL Right Rate Guarantee</span>
                <span>Live Spot Rate</span>
              </div>

              {/* Table Rows with Dynamic Red / Green Flashing */}
              <div className="divide-y divide-[#6B0A11]/60 flex-1">
                {tableRows.map((row) => {
                  const flash = flashStates[row.id];
                  const isUp = flash === 'up' || (!flash && row.trend === 'up');

                  return (
                    <div
                      key={row.id}
                      className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#400308]/60 transition-colors"
                    >
                      {/* Left: Label & Purity Spec */}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs sm:text-sm font-semibold tracking-wide ${
                            row.isBold ? 'text-[#F3E5AB] font-bold' : 'text-stone-100'
                          }`}>
                            {row.label}
                          </span>
                          {row.isBold && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#C9A44A]/20 text-[#F3E5AB] border border-[#C9A44A]/40 font-mono">
                              BENCHMARK
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-300 font-medium">
                          {row.purity}
                        </span>
                      </div>

                      {/* Right: Flashing Live Rate Button Box (Exact Right Gold mechanism) */}
                      <div className="flex items-center gap-2">
                        {/* Delta Tag */}
                        {row.change && (
                          <span className={`hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                            isUp
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                          }`}>
                            {isUp ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                            <span>{row.change}</span>
                          </span>
                        )}

                        {/* Flashing Box */}
                        <div className={`px-4 py-1.5 rounded-lg font-bold font-mono text-sm sm:text-base tracking-tight transition-all duration-300 min-w-[110px] text-right shadow-md ${
                          row.isUnavailable || row.rate === 'Not Available'
                            ? 'bg-black/40 text-stone-300 border border-stone-600/60 text-xs sm:text-sm text-center'
                            : flash === 'up'
                            ? 'bg-[#107c41] text-white ring-2 ring-emerald-300 shadow-emerald-900/50 scale-102'
                            : flash === 'down'
                            ? 'bg-[#b91c1c] text-white ring-2 ring-rose-300 shadow-rose-900/50 scale-102'
                            : isUp
                            ? 'bg-[#107c41] text-white hover:bg-[#107c41]/90'
                            : 'bg-[#b91c1c] text-white hover:bg-[#b91c1c]/90'
                        }`}>
                          {row.rate}
                          {row.unit && !row.isUnavailable && row.rate !== 'Not Available' && (
                            <span className="text-[10px] font-normal text-stone-200 ml-1">{row.unit}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table Footer info */}
              <div className="p-3 bg-[#400308] border-t border-[#C9A44A]/30 text-center text-[11px] text-stone-300 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Rates change live every second based on Indian Commodity Exchange & Bullion Market movement.</span>
              </div>

            </div>

            {/* Right: Flagship Boutique Showcase & Trust (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F3EDE2] text-stone-900 rounded-xl p-6 border border-[#C9A44A] shadow-xl flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/bl-jewels-icon.png"
                      alt="BL Jewels"
                      className="w-8 h-8 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div>
                      <span className="text-xs font-serif font-bold text-[#6B0A11] tracking-wider uppercase block">
                        BL JEWELS
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        Since 1984 · 40+ Years Legacy
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#6B0A11] text-[#F3E5AB] text-[10px] font-bold">
                    FLAGSHIP ATELIER
                  </span>
                </div>

                <div className="text-center py-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#6B0A11] font-bold block mb-0.5">
                    TRANSPARENT VALUE GUARANTEE
                  </span>
                  <h3 className="text-lg font-serif font-extrabold text-[#6B0A11] tracking-tight">
                    Civil Lines Flagship, Agra
                  </h3>
                  <p className="text-xs text-stone-600 font-medium mt-0.5">
                    Experience Hallmark Verification & Bespoke Bridal Styling
                  </p>
                </div>

                {/* Boutique Address Box */}
                <div className="p-3.5 rounded-xl bg-white border border-[#C9A44A]/40 shadow-xs space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#6B0A11] shrink-0 mt-0.5" />
                    <span className="text-stone-700 text-xs leading-relaxed font-medium">
                      Upper Ground Floor, Shop No.01, Suresh Mall, Mahatma Gandhi Rd, Civil Lines, Agra, UP 282002
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#6B0A11]" />
                      <a href="tel:07454986610" className="text-stone-900 font-bold text-xs hover:text-[#6B0A11] transition-colors">
                        074549 86610
                      </a>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Open 10:30 AM – 8:30 PM
                    </span>
                  </div>
                </div>

                {/* Trust Pillars */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 rounded-lg bg-white/80 border border-stone-200/80 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-stone-800 font-medium">100% BIS 916 Hallmark</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-stone-200/80 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-stone-800 font-medium">Lifetime Buyback</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-stone-200/80 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-stone-800 font-medium">Zero Hidden Charges</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-stone-200/80 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-stone-800 font-medium">Insured Armored Dispatch</span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row gap-2.5">
                <Link
                  to="/collections/necklaces"
                  className="flex-1 py-2.5 px-4 bg-[#6B0A11] hover:bg-[#52050B] text-[#F3E5AB] rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <span>Shop 22K Gold Catalogue</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C9A44A]" />
                </Link>

                <a
                  href="https://wa.me/917454986610?text=Hello%20BL%20Jewels,%20I%20am%20checking%20today's%20live%20gold%20rate%20and%20want%20to%20inquire%20about%20jewellery."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default LiveRatePage;
