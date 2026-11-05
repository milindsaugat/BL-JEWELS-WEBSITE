import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Sparkles,
  Save,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Eye,
  Sliders,
  Phone,
  Tag,
  RotateCw,
  Layers,
  HelpCircle,
  PlusCircle,
  Smartphone,
  Monitor
} from 'lucide-react';
import { settingService } from '../services/api';

const DEFAULT_CONFIG = {
  enabled: true,
  mode: 'static',
  staticText: 'Complimentary Insured Armored Delivery across India on orders above ₹5,000',
  pillText: 'Code: SHUBH10',
  pillLink: '',
  showPill: true,
  leftText1: '100% BIS 916 Hallmarked Gold',
  leftText2: 'Lifetime Buyback',
  rightText: '15-Day Easy Returns',
  phone: '074549 86610',
  marqueeRawText: '100% Certified 22K (916) BIS Hallmarked Gold Guaranteed, Complimentary Insured Armored Delivery across India on orders above ₹5,000, Auspicious Festive Offer: Use Code SHUBH10 for 10% Off, Lifetime Gold Buyback Guarantee · 15-Day Easy Returns, Call Showroom: 074549 86610',
  marqueeItems: [
    '100% Certified 22K (916) BIS Hallmarked Gold Guaranteed',
    'Complimentary Insured Armored Delivery across India on orders above ₹5,000',
    'Auspicious Festive Offer: Use Code SHUBH10 for 10% Off',
    'Lifetime Gold Buyback Guarantee · 15-Day Easy Returns',
    'Call Showroom: 074549 86610'
  ],
  marqueeSpeed: 35,
};

export const AdminAnnouncement = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  const fetchSettings = async () => {
    try {
      const res = await settingService.getSettings();
      if (res.settings) {
        const bar = res.settings.announcementBar || {};
        const raw = bar.marqueeRawText || (bar.marqueeItems?.join(', ')) || DEFAULT_CONFIG.marqueeRawText;
        const items = bar.marqueeItems?.length > 0
          ? bar.marqueeItems
          : raw.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);

        setConfig({
          enabled: bar.enabled !== undefined ? bar.enabled : true,
          mode: bar.mode || 'static',
          staticText: bar.staticText || DEFAULT_CONFIG.staticText,
          pillText: bar.pillText !== undefined ? bar.pillText : DEFAULT_CONFIG.pillText,
          pillLink: bar.pillLink || '',
          showPill: bar.showPill !== undefined ? bar.showPill : true,
          leftText1: bar.leftText1 || DEFAULT_CONFIG.leftText1,
          leftText2: bar.leftText2 || DEFAULT_CONFIG.leftText2,
          rightText: bar.rightText || DEFAULT_CONFIG.rightText,
          phone: bar.phone || res.settings.contact?.phone || DEFAULT_CONFIG.phone,
          marqueeRawText: raw,
          marqueeItems: items,
          marqueeSpeed: bar.marqueeSpeed || DEFAULT_CONFIG.marqueeSpeed,
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleRawTextChange = (text) => {
    const items = text
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    setConfig((prev) => ({
      ...prev,
      marqueeRawText: text,
      marqueeItems: items,
    }));
  };

  const handleAppendQuickChip = (chipText) => {
    const current = config.marqueeRawText ? config.marqueeRawText.trim() : '';
    const updated = current ? `${current}, ${chipText}` : chipText;
    handleRawTextChange(updated);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        announcementBar: {
          ...config,
          marqueeItems: config.marqueeItems,
        },
      };

      const res = await settingService.updateSettings(payload);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save announcement bar:', err);
      alert('Error updating announcement bar. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const parsedMarqueeList = config.marqueeItems?.length > 0 ? config.marqueeItems : DEFAULT_CONFIG.marqueeItems;
  const previewSeamlessItems = [...parsedMarqueeList, ...parsedMarqueeList];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <RotateCw className="w-6 h-6 animate-spin text-[#8B1A1A]" />
          <p className="text-xs font-medium">Loading Announcement Bar configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#8B1A1A]/10 text-[#8B1A1A]">
              <Megaphone className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1410] font-heading">
              Announcement Bar CMS
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-body">
            Manage top bar announcements, promo coupon pills, customer assurances, and switch between Static and Infinite Marquee modes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-stone-600 hover:text-[#8B1A1A] hover:bg-white text-xs font-medium transition-colors shadow-xs"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B1A1A] to-[#6E1212] hover:from-[#7A1515] hover:to-[#5B0F0F] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save & Publish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Success Alert Banner */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs font-medium">
              Announcement Bar settings updated successfully! Changes are live on your customer storefront.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
            ● Live Synchronized
          </span>
        </div>
      )}

      {/* ── Interactive Live Preview Box ── */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#8B1A1A]" />
            <span className="text-xs font-bold text-stone-700 font-heading">
              Real-Time Live Preview
            </span>
            <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
              (Updates instantly as you edit below)
            </span>
          </div>

          {/* Device preview toggles */}
          <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                previewDevice === 'desktop'
                  ? 'bg-[#8B1A1A] text-white shadow-xs font-medium'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span className="text-[11px]">Desktop</span>
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                previewDevice === 'mobile'
                  ? 'bg-[#8B1A1A] text-white shadow-xs font-medium'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span className="text-[11px]">Mobile</span>
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="p-4 sm:p-6 bg-[#F8F6F2] flex items-center justify-center">
          <div
            className={`w-full transition-all duration-300 rounded-xl overflow-hidden shadow-md border border-[#C9A44A]/40 ${
              previewDevice === 'mobile' ? 'max-w-[420px]' : 'max-w-full'
            }`}
          >
            {/* Live Render Component inside Preview */}
            <div className="bg-[#330808] text-[#F3E5AB] text-[11px] font-body relative overflow-hidden select-none">
              
              {!config.enabled ? (
                <div className="py-2.5 px-4 text-center text-stone-400 text-xs italic">
                  [Announcement Bar is currently Disabled]
                </div>
              ) : config.mode === 'marquee' ? (
                /* Preview Marquee Track */
                <div className="relative w-full overflow-hidden py-2 sm:py-2.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#330808] to-transparent z-10" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#330808] to-transparent z-10" />

                  <div
                    className="flex items-center whitespace-nowrap"
                    style={{
                      width: 'max-content',
                      animation: `marquee-rtl ${config.marqueeSpeed || 35}s linear infinite`,
                    }}
                  >
                    {previewSeamlessItems.map((item, idx) => {
                      const hasCode = item.includes('Code:') || item.includes('SHUBH10');
                      return (
                        <div key={idx} className="flex items-center gap-3 shrink-0 px-4">
                          <i className="ri-sparkling-fill text-[#E6C975] text-[10px] animate-pulse shrink-0" />
                          <span className="text-stone-100 font-medium tracking-wide whitespace-nowrap text-[11px]">
                            {item}
                          </span>
                          {hasCode && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#521212] border border-[#C9A44A]/60 text-[9px] font-bold text-[#F9E59B] uppercase whitespace-nowrap">
                              <Tag className="w-2.5 h-2.5" />
                              <span>Offer</span>
                            </span>
                          )}
                          <span className="text-[#C9A44A]/50 text-xs shrink-0 select-none">✦</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : previewDevice === 'desktop' ? (
                /* Preview Static Desktop */
                <div className="px-4 py-2 flex items-center justify-between whitespace-nowrap">
                  <div className="flex items-center gap-2.5 text-stone-200">
                    {config.leftText1 && (
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#E6C975]" />
                        <span>{config.leftText1}</span>
                      </div>
                    )}
                    {config.leftText1 && config.leftText2 && <span className="text-[#C9A44A]/40">•</span>}
                    {config.leftText2 && <span className="text-stone-300">{config.leftText2}</span>}
                  </div>

                  <div className="flex items-center gap-2 font-medium tracking-wide">
                    <Sparkles className="w-3 h-3 text-[#E6C975]" />
                    <span className="text-stone-100">{config.staticText}</span>
                    {config.showPill && config.pillText && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#521212] border border-[#C9A44A]/60 text-[10px] font-bold text-[#F9E59B] uppercase ml-1">
                        <Tag className="w-2.5 h-2.5" />
                        <span>{config.pillText}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 text-stone-200">
                    {config.rightText && <span className="text-stone-300">{config.rightText}</span>}
                    {config.rightText && config.phone && <span className="text-[#C9A44A]/40">|</span>}
                    {config.phone && (
                      <span className="text-[#F3E5AB] font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#E6C975]" />
                        <span>{config.phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* Preview Static Mobile */
                <div className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 truncate">
                    <Sparkles className="w-3 h-3 text-[#E6C975] shrink-0" />
                    <p className="text-[11px] font-medium tracking-wide text-[#F3E5AB] truncate">
                      {config.staticText}
                    </p>
                    {config.showPill && config.pillText && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#521212] border border-[#C9A44A]/60 text-[9px] font-bold text-[#F9E59B] uppercase shrink-0">
                        <span>{config.pillText}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Mode Selection & Master Toggle ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Master Enabled / Disabled Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 font-heading">Bar Status</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                config.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
              }`}>
                {config.enabled ? 'Active / Visible' : 'Hidden'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Toggle the announcement bar visibility across all customer-facing storefront pages.
            </p>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.enabled ? 'bg-[#8B1A1A]' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  config.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs font-medium text-stone-700">
              {config.enabled ? 'Enabled on storefront' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Mode 1: Static Option Card */}
        <button
          type="button"
          onClick={() => setConfig(prev => ({ ...prev, mode: 'static' }))}
          className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
            config.mode === 'static'
              ? 'border-[#8B1A1A] bg-[#8B1A1A]/5 shadow-sm ring-1 ring-[#8B1A1A]/20'
              : 'border-stone-200 bg-white hover:border-stone-300 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-50 text-[#8B1A1A]">
                <Layers className="w-4 h-4" />
              </span>
              {config.mode === 'static' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8B1A1A] text-white">
                  Active Mode
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-stone-900 mt-3 font-heading">
              1. Static Assurance Bar
            </h3>
            <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
              Classical 3-segment luxury bar: BIS 916 assurances on left, custom offer with coupon pill in center, and returns & phone on right.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#8B1A1A] pt-3 block">
            Select Static Mode →
          </span>
        </button>

        {/* Mode 2: Marquee Option Card */}
        <button
          type="button"
          onClick={() => setConfig(prev => ({ ...prev, mode: 'marquee' }))}
          className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
            config.mode === 'marquee'
              ? 'border-[#8B1A1A] bg-[#8B1A1A]/5 shadow-sm ring-1 ring-[#8B1A1A]/20'
              : 'border-stone-200 bg-white hover:border-stone-300 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-50 text-[#8B1A1A]">
                <RotateCw className="w-4 h-4" />
              </span>
              {config.mode === 'marquee' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8B1A1A] text-white">
                  Active Mode
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-stone-900 mt-3 font-heading">
              2. Infinite Marquee Ticker
            </h3>
            <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
              Continuous smooth 360° infinite scrolling loop for multiple announcements, promo codes, and special festive offers separated by commas.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#8B1A1A] pt-3 block">
            Select Marquee Mode →
          </span>
        </button>

      </div>

      {/* ── Mode-Specific Configuration Editor ── */}
      {config.mode === 'marquee' ? (
        /* ══════════════════════════════════════════════════════════════
           MARQUEE MODE CONFIGURATION
           ══════════════════════════════════════════════════════════════ */
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-base font-bold text-stone-900 font-heading flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-[#8B1A1A]" />
              <span>Infinite Marquee Content & Speed</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Add multiple offers or announcements separated by commas (,). They will continuously scroll in an infinite smooth loop.
            </p>
          </div>

          {/* Comma-Separated Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700">
                Comma-Separated Marquee Items:
              </label>
              <span className="text-[11px] text-[#8B1A1A] font-semibold bg-[#8B1A1A]/10 px-2 py-0.5 rounded-md">
                {parsedMarqueeList.length} Items in Loop
              </span>
            </div>

            <textarea
              rows={4}
              value={config.marqueeRawText}
              onChange={(e) => handleRawTextChange(e.target.value)}
              placeholder="e.g. 100% Certified 22K (916) Gold, Free Insured Armored Delivery across India on orders above ₹5,000, Auspicious Festive Offer: Code SHUBH10, 15-Day Easy Returns"
              className="w-full px-3.5 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-body focus:bg-white focus:ring-2 focus:ring-[#8B1A1A] focus:outline-none transition-all leading-relaxed"
            />
            
            <p className="text-[11px] text-stone-400">
              💡 <strong>Tip:</strong> Simply separate multiple announcements or offers with a comma (<kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[10px]">,</kbd>). Each item will be separated by auspicious gold star sparkles.
            </p>
          </div>

          {/* Quick-Add Suggestion Chips */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold text-stone-600 block">
              Quick-Insert Royal Highlights:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                '✦ 100% BIS 916 Hallmark Purity Guaranteed ✦',
                'Festive Offer: Use Code SHUBH10 for 10% Instant Savings',
                'Complimentary Insured Armored Blue Dart Express Delivery',
                '100% Lifetime Buyback Guarantee at Prevailing Market Rate',
                'Visit Agra Boutique: Suresh Mall, Civil Lines · 074549 86610',
                'Direct Karigar Artisan Pricing · Zero Middleman Markup'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAppendQuickChip(chip)}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-50 hover:text-[#8B1A1A] border border-stone-200/80 text-[11px] text-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3 h-3 text-[#8B1A1A]" />
                  <span>{chip}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parsed Visual Pills Badges */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-700 block">
              Active Ticker Sequence ({parsedMarqueeList.length}):
            </span>
            <div className="flex flex-wrap gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
              {parsedMarqueeList.map((item, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#C9A44A]/40 text-stone-800 text-[11px] flex items-center gap-2 shadow-2xs font-medium"
                >
                  <span className="w-4 h-4 rounded-full bg-[#8B1A1A] text-[#F3E5AB] text-[9px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Marquee Speed Slider */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#8B1A1A]" />
                <span>Marquee Loop Speed:</span>
              </label>
              <span className="text-xs font-bold text-[#8B1A1A]">
                {config.marqueeSpeed || 35} seconds per cycle
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[11px] text-stone-400">Fast (15s)</span>
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={config.marqueeSpeed || 35}
                onChange={(e) => setConfig(prev => ({ ...prev, marqueeSpeed: Number(e.target.value) }))}
                className="flex-1 accent-[#8B1A1A] cursor-pointer"
              />
              <span className="text-[11px] text-stone-400">Gentle (60s)</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Higher value means a slower, more graceful luxury glide. Hovering the mouse over the ticker automatically pauses it.
            </p>
          </div>

        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════
           STATIC MODE CONFIGURATION
           ══════════════════════════════════════════════════════════════ */
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-base font-bold text-stone-900 font-heading flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8B1A1A]" />
              <span>Static 3-Column Luxury Bar Content</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Customize the left hallmarking assurances, the center promotional offer with coupon pill, and the right concierge contact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Center Main Text */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-stone-700">
                Center Main Announcement / Offer Message:
              </label>
              <input
                type="text"
                value={config.staticText}
                onChange={(e) => setConfig(prev => ({ ...prev, staticText: e.target.value }))}
                placeholder="e.g. Complimentary Insured Armored Delivery across India on orders above ₹5,000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-body focus:ring-2 focus:ring-[#8B1A1A] focus:outline-none transition-all"
              />
            </div>

            {/* Pill Offer Badge Text */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#8B1A1A]" />
                  <span>Promo Pill Text / Coupon Code:</span>
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showPill}
                    onChange={(e) => setConfig(prev => ({ ...prev, showPill: e.target.checked }))}
                    className="accent-[#8B1A1A] rounded"
                  />
                  <span>Show Pill</span>
                </label>
              </div>

              <input
                type="text"
                value={config.pillText}
                onChange={(e) => setConfig(prev => ({ ...prev, pillText: e.target.value }))}
                placeholder="e.g. Code: SHUBH10"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-body focus:ring-2 focus:ring-[#8B1A1A] focus:outline-none transition-all"
              />
            </div>

            {/* Optional Pill Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Pill Click Link (Optional):
              </label>
              <input
                type="text"
                value={config.pillLink}
                onChange={(e) => setConfig(prev => ({ ...prev, pillLink: e.target.value }))}
                placeholder="e.g. /collections/bridal-heritage or leave empty"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-body focus:ring-2 focus:ring-[#8B1A1A] focus:outline-none transition-all"
              />
            </div>

            {/* Left Badge 1 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B1A1A]" />
                <span>Left Badge 1 (BIS Hallmarking):</span>
              </label>
              <input
                type="text"
                value={config.leftText1}
                onChange={(e) => setConfig(prev => ({ ...prev, leftText1: e.target.value }))}
                placeholder="e.g. 100% BIS 916 Hallmarked Gold"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-body focus:ring-2 focus:ring-[#8B1A1A] focus:outline-none transition-all"
              />
            </div>

            {/* Left Badge 2 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Left Badge 2 (Heritage Trust):
              </label>
              <input
                type="text"
                value={config.leftText2}
                onChange={(e) => setConfig(prev => ({ ...prev, leftText2: e.target.value }))}
                placeholder="e.g. Lifetime Buyback"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-body focus:ring-2 focus:ring-[#8B1A1A] focus:outline-none transition-all"
              />
            </div>

            {/* Right Return Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Right Badge (Returns / Policy):
              </label>
              <input
                type="text"
                value={config.rightText}
                onChange={(e) => setConfig(prev => ({ ...prev, rightText: e.target.value }))}
                placeholder="e.g. 15-Day Easy Returns"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-body focus:ring-2 focus:ring-[#8B1A1A] focus:outline-none transition-all"
              />
            </div>

            {/* Right Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#8B1A1A]" />
                <span>Contact Phone (Click-to-Call):</span>
              </label>
              <input
                type="text"
                value={config.phone}
                onChange={(e) => setConfig(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. 074549 86610"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-body focus:ring-2 focus:ring-[#8B1A1A] focus:outline-none transition-all"
              />
            </div>

          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <HelpCircle className="w-4 h-4 text-stone-400" />
          <span>
            Changes saved here are instantly delivered to customer browsers without server restart.
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8B1A1A] to-[#6E1212] hover:from-[#7A1515] hover:to-[#5B0F0F] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save & Publish Live</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default AdminAnnouncement;

