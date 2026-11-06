import { RateCacheNotice } from '../components/common/RateCacheNotice';
import { getRateDisplay, getRateError } from '../lib/rateDisplay';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, RefreshCw, Phone, ShieldCheck, ArrowLeft } from 'lucide-react';
import { rateService } from '../services/api';

export const LiveRatePage = () => {
  const [ratesData, setRatesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rateError, setRateError] = useState('');

  const fetchRates = async () => {
    try {
      setLoading(true);
      setRateError('');
      const res = await rateService.getLiveRates();
      if (!res?.success) throw new Error('Rates unavailable');
      setRatesData(res);
      return true;
    } catch (err) {
      setRateError(getRateError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId = null;

    fetchRates().then((ok) => {
      // Only start 30s auto-refresh loop if rates are active/ok
      if (ok) {
        intervalId = setInterval(fetchRates, 30000);
      }
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const { goldSpot, silverSpot, inrSpot, tableRows } = getRateDisplay(ratesData);

  return (
    <div className="min-h-screen bg-white text-stone-900 py-8 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-6xl mx-auto space-y-6">
          <RateCacheNotice meta={ratesData?.meta} />
          {rateError && <p role="alert" className="rounded-lg border border-amber-400/50 bg-amber-50 p-3 text-sm text-amber-950">{rateError}{ratesData ? ' Showing the last successfully loaded rates.' : ''}</p>}
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#930303] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Storefront</span>
          </Link>

          <button
            onClick={fetchRates}
              disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Rates</span>
          </button>
        </div>

        {/* ── Outer Maroon Container (matching Right Gold reference) ── */}
        <div className="bg-[#930303] text-white rounded-2xl shadow-xl border border-[#C9A44A]/50 p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C9A44A]/30">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#F3E5AB] tracking-wide flex items-center gap-2.5">
                TODAY'S LIVE BULLION RATES
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                Cached gold and silver reference prices with transparent update times.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#7A0303] text-[#F3E5AB] border border-[#C9A44A]/40 text-xs font-semibold self-start sm:self-auto">
              MCX National Sync
            </span>
          </div>

          {/* ── 3 SPOT CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. GOLD SPOT */}
            <div className="bg-[#7A0303] border border-[#C9A44A]/60 rounded-xl p-5 text-center shadow-lg">
              <div className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
                GOLD SPOT
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                ASK
              </div>
              <div className="text-3xl font-bold text-[#F3E5AB] font-body tracking-tight my-1.5">
                {goldSpot.ask}
              </div>
              <div className="flex items-center justify-center gap-3 text-xs text-stone-300 font-body">
                <span>H-{goldSpot.high}</span>
                <span>L-{goldSpot.low}</span>
              </div>
            </div>

            {/* 2. SILVER SPOT */}
            <div className="bg-[#7A0303] border border-[#C9A44A]/60 rounded-xl p-5 text-center shadow-lg">
              <div className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
                SILVER SPOT
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                ASK
              </div>
              <div className="text-3xl font-bold text-[#F3E5AB] font-body tracking-tight my-1.5">
                {silverSpot.ask}
              </div>
              <div className="flex items-center justify-center gap-3 text-xs text-stone-300 font-body">
                <span>H-{silverSpot.high}</span>
                <span>L-{silverSpot.low}</span>
              </div>
            </div>

            {/* 3. INR SPOT */}
            <div className="bg-[#7A0303] border border-[#C9A44A]/60 rounded-xl p-5 text-center shadow-lg">
              <div className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
                INR SPOT
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                ASK
              </div>
              <div className="text-3xl font-bold text-[#F3E5AB] font-body tracking-tight my-1.5">
                {inrSpot.ask}
              </div>
              <div className="flex items-center justify-center gap-3 text-xs text-stone-300 font-body">
                <span>H-{inrSpot.high}</span>
                <span>L-{inrSpot.low}</span>
              </div>
            </div>

          </div>

          {/* ── LOWER SECTION: TABLE + STORE BANNER ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left: Rate Guarantee Table (7 cols) */}
            <div className="lg:col-span-7 bg-[#7A0303] rounded-xl border border-[#C9A44A]/40 overflow-hidden shadow-lg flex flex-col">
              
              <div className="px-6 py-3.5 bg-[#5C0202] border-b border-[#C9A44A]/40 flex items-center justify-between text-xs font-bold text-[#F3E5AB] uppercase tracking-wider">
                <span>Right Rate Guarantee</span>
                <span>Rate</span>
              </div>

              <div className="divide-y divide-[#7A0303]/80 flex-1">
                {tableRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="px-6 py-3.5 flex items-center justify-between hover:bg-[#5C0202]/40 transition-colors"
                  >
                    <span className={`text-xs sm:text-sm ${row.isBold ? 'font-bold text-white' : 'text-stone-200'}`}>
                      {row.label}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white font-body tracking-tight">
                      {row.rate}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#5C0202] border-t border-[#C9A44A]/30 text-center text-xs text-stone-300">
                <p>
                  Live Gold Rate — Get real-time gold rate accurate to the minute.
                </p>
              </div>

            </div>

            {/* Right: Flagship Boutique Showcase (Agra) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#FFF9EE] to-[#F5ECE0] text-stone-900 rounded-xl p-6 border border-[#C9A44A] shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/bl-jewels-icon.png"
                      alt="BL Jewels"
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-xs font-bold text-[#930303] tracking-wider uppercase">
                      BL JEWELS
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#930303] text-white text-[10px] font-bold">
                    FLAGSHIP SHOWROOM
                  </span>
                </div>

                <div className="text-center my-4">
                  <span className="text-[10px] uppercase tracking-widest text-[#930303] font-bold block">
                    VISIT OUR ATELIER
                  </span>
                  <h3 className="text-xl font-extrabold text-[#930303] tracking-tight">
                    AGRA SHOWROOM
                  </h3>
                  <p className="text-xs text-stone-600 font-medium">
                    CIVIL LINES, AGRA
                  </p>
                </div>

                {/* Boutique Address Box */}
                <div className="p-4 rounded-xl bg-white/95 border border-[#C9A44A]/40 shadow-xs space-y-2.5 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#930303] shrink-0 mt-0.5" />
                    <span className="text-stone-800 text-xs leading-relaxed font-medium">
                      Upper Ground Floor, Shop No.01, Suresh Mall, Mahatma Gandhi Rd, Ramnagar Colony, Civil Lines, Agra, Uttar Pradesh 282002
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                    <Phone className="w-4 h-4 text-[#930303] shrink-0" />
                    <a href="tel:07454986610" className="text-stone-900 font-bold text-xs hover:text-[#930303] transition-colors">
                      074549 86610
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-stone-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs text-stone-700 font-medium">
                    100% BIS Hallmarked Showroom
                  </span>
                </div>

                <a
                  href="tel:07454986610"
                  className="px-4 py-1.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Store</span>
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

