import React, { useState, useEffect } from 'react';
import { X, MapPin, RefreshCw, PhoneCall, ShieldCheck, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { rateService } from '../../services/api';

export const LiveRateModal = () => {
  const { isLiveRateOpen, closeLiveRate } = useUIStore();
  const [ratesData, setRatesData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await rateService.getLiveRates();
      if (res.success) {
        setRatesData(res);
      }
    } catch (err) {
      console.warn('Live rates fetch in modal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLiveRateOpen) {
      fetchRates();
      const interval = setInterval(fetchRates, 30000);
      return () => clearInterval(interval);
    }
  }, [isLiveRateOpen]);

  if (!isLiveRateOpen) return null;

  // Real live bullion benchmarks synced with GoldAPI.io feed
  const goldRateItem = ratesData?.goldRates?.[0]; // GOLD SPOT
  const goldSpot = {
    ask: ratesData?.goldSpotAsk?.toFixed ? ratesData.goldSpotAsk.toFixed(2) : (goldRateItem?.ask || '3897.58'),
    high: goldRateItem?.high || '3919.29',
    low: goldRateItem?.low || '3875.65',
  };
  const silverRateItem = ratesData?.silverRates?.[0]; // SILVER SPOT
  const silverSpot = {
    ask: ratesData?.silverSpotAsk?.toFixed ? ratesData.silverSpotAsk.toFixed(2) : (silverRateItem?.ask || '49.16'),
    high: silverRateItem?.high || '52.24',
    low: silverRateItem?.low || '48.87',
  };
  const inrSpot = { ask: ratesData?.inrSpotAsk?.toFixed ? ratesData.inrSpotAsk.toFixed(2) : '94.99', high: '95.28', low: '94.93' };

  const numRates = ratesData?.numericRates || {};
  const g24k = numRates['24K'] || 13900;
  const g22k = numRates['22K'] || 12742;
  const g18k = numRates['18K'] || 10425;
  const g14k = numRates['14K'] || 8108;
  const g9k = numRates['9K'] || 5212;
  const silverKg = (numRates.silverPerGram ? numRates.silverPerGram * 1000 : 165000).toLocaleString('en-IN');

  const tableRows = [
    { label: 'GOLD MCX (10g)', rate: (g24k * 10).toLocaleString('en-IN'), isBold: true },
    { label: '22KT BL RATE (92%)', rate: g22k.toLocaleString('en-IN') },
    { label: '18KT BL RATE (76%)', rate: g18k.toLocaleString('en-IN') },
    { label: '14KT BL RATE (60%)', rate: g14k.toLocaleString('en-IN') },
    { label: '9KT BL RATE (37.5%)', rate: g9k.toLocaleString('en-IN') },
    { label: '999 SILVER MCX (1 Kg)', rate: silverKg, isBold: true },
  ];

  const stores = [
    'Nirman Vihar',
    'Lajpat Nagar',
    'Laxmi Nagar',
    'Krishna Nagar',
    'Rohini',
    'Noida',
    'Gurgaon',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#4D0D18] text-white rounded-2xl shadow-2xl border border-[#C9A44A]/50 overflow-hidden max-h-[92vh] flex flex-col font-body">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-[#3B0711] border-b border-[#C9A44A]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
              <img src="/images/bl-jewels-icon.png" alt="BL Jewels" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#F3E5AB] tracking-wide flex items-center gap-2">
                BL JEWELS LIVE BULLION MATRIX
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <p className="text-[11px] text-stone-300">
                {ratesData?.source ? `✦ ${ratesData.source}` : 'Official MCX & Spot Rates'} • Govt BIS 916 Benchmark
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRates}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 transition-colors"
              title="Refresh Bullion Feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={closeLiveRate}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-900/60 text-stone-200 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* ── 3 SPOT CARDS GRID ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            
            {/* 1. GOLD SPOT */}
            <div className="bg-[#5C0F1E] border border-[#C9A44A]/60 rounded-xl p-4 text-center shadow-lg relative group">
              <div className="text-[11px] font-bold text-stone-200 tracking-wider uppercase mb-1">
                GOLD SPOT
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                ASK
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#F3E5AB] font-body tracking-tight my-1">
                {goldSpot.ask}
              </div>
              <div className="flex items-center justify-center gap-3 text-[11px] text-stone-300 font-body">
                <span>H-{goldSpot.high}</span>
                <span>L-{goldSpot.low}</span>
              </div>
            </div>

            {/* 2. SILVER SPOT */}
            <div className="bg-[#5C0F1E] border border-[#C9A44A]/60 rounded-xl p-4 text-center shadow-lg relative group">
              <div className="text-[11px] font-bold text-stone-200 tracking-wider uppercase mb-1">
                SILVER SPOT
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                ASK
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#F3E5AB] font-body tracking-tight my-1">
                {silverSpot.ask}
              </div>
              <div className="flex items-center justify-center gap-3 text-[11px] text-stone-300 font-body">
                <span>H-{silverSpot.high}</span>
                <span>L-{silverSpot.low}</span>
              </div>
            </div>

            {/* 3. INR SPOT */}
            <div className="bg-[#5C0F1E] border border-[#C9A44A]/60 rounded-xl p-4 text-center shadow-lg relative group">
              <div className="text-[11px] font-bold text-stone-200 tracking-wider uppercase mb-1">
                INR SPOT
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                ASK
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#F3E5AB] font-body tracking-tight my-1">
                {inrSpot.ask}
              </div>
              <div className="flex items-center justify-center gap-3 text-[11px] text-stone-300 font-body">
                <span>H-{inrSpot.high}</span>
                <span>L-{inrSpot.low}</span>
              </div>
            </div>

          </div>

          {/* ── LOWER SECTION: TABLE + STORES BANNER ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left: Rate Guarantee Table (7 cols) */}
            <div className="lg:col-span-7 bg-[#3B0711] rounded-xl border border-[#C9A44A]/40 overflow-hidden shadow-lg flex flex-col">
              
              {/* Table Header */}
              <div className="px-5 py-3 bg-[#2D040C] border-b border-[#C9A44A]/40 flex items-center justify-between text-xs font-bold text-[#F3E5AB] uppercase tracking-wider">
                <span>Right Rate Guarantee</span>
                <span>Rate</span>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-[#5C0F1E]/80 flex-1">
                {tableRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="px-5 py-3 flex items-center justify-between hover:bg-[#5C0F1E]/40 transition-colors"
                  >
                    <span className={`text-xs ${row.isBold ? 'font-bold text-stone-100' : 'text-stone-200'}`}>
                      {row.label}
                    </span>
                    <span className="text-sm font-bold text-white font-body tracking-tight">
                      {row.rate}
                    </span>
                  </div>
                ))}
              </div>

              {/* Table Footer */}
              <div className="p-3.5 bg-[#2D040C] border-t border-[#C9A44A]/30 text-center text-[11px] text-stone-300">
                <p>
                  Live Gold Rate — Get real-time gold rate accurate to the minute.
                </p>
              </div>

            </div>

            {/* Right: Multiple Stores Across Delhi NCR Banner (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#FFF9EE] to-[#F5ECE0] text-stone-900 rounded-xl p-5 border border-[#C9A44A] shadow-lg flex flex-col justify-between">
              
              <div>
                {/* Store Header Emblem */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/bl-jewels-icon.png"
                      alt="BL Jewels"
                      className="w-7 h-7 object-contain"
                    />
                    <span className="text-xs font-bold text-[#8B1A1A] tracking-wider uppercase">
                      BL JEWELS
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#8B1A1A] text-white text-[10px] font-bold">
                    NCR EXPANSION
                  </span>
                </div>

                <div className="text-center my-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#8B1A1A] font-bold block">
                    NOW AT
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#4D0D18] tracking-tight">
                    MULTIPLE STORES
                  </h3>
                  <p className="text-[11px] text-stone-600 font-medium">
                    ACROSS DELHI NCR
                  </p>
                </div>

                {/* Visit Us Label */}
                <div className="text-center mb-3">
                  <span className="text-xs font-bold text-[#8B1A1A] border-b border-[#8B1A1A]/40 pb-0.5">
                    Visit Us
                  </span>
                </div>

                {/* Store Locations Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {stores.map((store, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 border border-[#C9A44A]/40 shadow-xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#8B1A1A] shrink-0" />
                      <span className="font-semibold text-stone-800 text-[11px] truncate">
                        {store}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Showroom Visual Callout */}
              <div className="mt-4 pt-3 border-t border-stone-300/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-[11px] text-stone-700 font-medium">
                    100% BIS Hallmarked Showrooms
                  </span>
                </div>

                <a
                  href="tel:+919876543210"
                  className="px-3 py-1 bg-[#8B1A1A] hover:bg-[#721515] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call Us</span>
                </a>
              </div>

            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-stone-300 text-[11px]">
              Rates refreshed every 30 seconds via MCX live API benchmark.
            </span>
            <button
              onClick={closeLiveRate}
              className="px-5 py-2 bg-[#F3E5AB] hover:bg-[#E5D79B] text-stone-900 font-bold rounded-xl text-xs transition-colors shadow-md"
            >
              Back to Home
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

