import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  Truck,
} from 'lucide-react';

// Default Target date: Akshaya Tritiya 2027 (May 8, 2027 00:00:00 IST)
const DEFAULT_TARGET_DATE = new Date('2027-05-08T00:00:00.000+05:30');

// Flip Card Animated Digit Unit
const FlipBox = ({ value, label }) => {
  const formatted = String(value).padStart(2, '0');

  return (
    <div className="flex-1 sm:flex-none sm:w-[4.85rem] py-2 sm:py-2.5 px-1 bg-white border border-[#C9A44A]/50 rounded-xl shadow-xs text-center transition-all duration-300 hover:border-[#8B1A1A]/40 perspective-500">
      <div className="h-7 sm:h-8 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={formatted}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="block font-accent text-2xl sm:text-3xl font-bold text-[#8B1A1A] leading-none tracking-tight"
          >
            {formatted}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] uppercase tracking-wider text-[#6B5B52] font-semibold block mt-1 font-body">
        {label}
      </span>
    </div>
  );
};

export const FlashSaleBanner = ({ offer = null, config = null }) => {
  // If explicitly disabled, do not render
  if (offer && (offer.isActive === false || offer.showHeroSectionSale === false)) {
    return null;
  }
  if (!offer && config && config.enabled === false) {
    return null;
  }

  // Use dynamic offer values from Admin (Coupons & Offers -> Festival Offers)
  const badgeText = offer?.badge || config?.badgeText || 'DHANTERAS & DIWALI MAHOTSAV';
  const topNotice = offer?.topNotice || config?.topNotice || 'LIMITED PERIOD AUSPICIOUS SALE';
  const title = offer?.title || config?.title || 'Auspicious Diwali & Dhanteras Gold Mahotsav';
  const subtitle =
    offer?.subtitle ||
    config?.subtitle ||
    'Flat 15% Auspicious Rebate on all 22K (916) BIS Hallmarked Necklaces, Chokers & Bridal Sets.';
  const promoCode = offer?.couponCode || config?.promoCode || 'SHUBH10';
  const ctaText = offer?.ctaText || config?.ctaText || 'EXPLORE FESTIVE SALE';
  const ctaLink = offer?.ctaLink || config?.ctaLink || '/collections/necklaces';
  const image =
    offer?.bannerImage ||
    config?.image ||
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80';

  // Format category slugs to readable names (e.g. "choker-sets" -> "Choker Sets")
  const validOn = offer?.targetCategories?.length
    ? offer.targetCategories.map((c) =>
        c
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      )
    : config?.validOn?.length
    ? config.validOn
    : ['Necklaces', 'Choker Sets', 'Bridal Heritage'];

  const targetDate = offer?.endDate
    ? new Date(offer.endDate)
    : config?.targetDate
    ? new Date(config.targetDate)
    : DEFAULT_TARGET_DATE;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copied, setCopied] = useState(false);

  // Live countdown calculation to target date
  useEffect(() => {
    const calculateTime = () => {
      const difference = +targetDate - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [offer?.endDate, config?.targetDate]);

  // Promo Code Copy interaction
  const handleCopyCode = () => {
    navigator.clipboard?.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  // Staggered motion variants for smooth entrance
  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="w-full bg-[#FAF7F2] border-y border-[#C9A44A]/30 py-12 sm:py-16 lg:py-20 relative overflow-hidden font-body">
      {/* Subtle Ambient Gold Radial Glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(201,164,74,0.14)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(147,3,3,0.06)_0%,transparent_70%)] blur-3xl" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
        >
          {/* ══════════════════════════════════════════════════════════════
              LEFT COLUMN: Pure Clean Jewellery Editorial Portrait
          ══════════════════════════════════════════════════════════════ */}
          <motion.div variants={itemVariants} className="lg:col-span-5 relative group">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C9A44A]/40 bg-[#F5F0E8] aspect-[4/5] max-h-[560px]">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="eager"
              />
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT COLUMN: Full Editorial Campaign Content
          ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            
            {/* Top Badges: Festival Pill + Limited Period Pill */}
            <motion.div variants={itemVariants} className="flex items-center gap-2.5 flex-wrap">
              {badgeText && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#8B1A1A] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider font-accent shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#EDD98A]" />
                  <span>{badgeText}</span>
                </div>
              )}
              {topNotice && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#C9A44A] bg-white text-[#C9A44A] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] font-accent shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-[#C9A44A]" />
                  <span>{topNotice}</span>
                </div>
              )}
            </motion.div>

            {/* Headline: Cormorant Garamond Large */}
            <motion.h2
              variants={itemVariants}
              className="font-cormorant text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#8B1A1A] leading-[1.14] tracking-tight"
            >
              {title}
            </motion.h2>

            {/* Subtitle: DM Sans */}
            <motion.p
              variants={itemVariants}
              className="text-[#6B5B52] text-xs sm:text-sm font-body leading-relaxed max-w-xl"
            >
              {subtitle}
            </motion.p>

            {/* Countdown Timer with Flip Cards & Blinking Colons */}
            <motion.div variants={itemVariants} className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B5B52]">
                <span className="w-2 h-2 rounded-full bg-[#C9A44A] animate-pulse inline-block" />
                <span>OFFER CLOSES IN</span>
              </div>

              {/* 4 Flip Unit Boxes */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 text-center">
                <FlipBox value={timeLeft.days} label="DAYS" />
                <span className="text-[#C9A44A] font-bold text-lg select-none px-0.5 animate-colon-blink">:</span>
                <FlipBox value={timeLeft.hours} label="HOURS" />
                <span className="text-[#C9A44A] font-bold text-lg select-none px-0.5 animate-colon-blink">:</span>
                <FlipBox value={timeLeft.minutes} label="MINS" />
                <span className="text-[#C9A44A] font-bold text-lg select-none px-0.5 animate-colon-blink">:</span>
                <FlipBox value={timeLeft.seconds} label="SECS" />
              </div>
            </motion.div>

            {/* Valid On Tags */}
            <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap pt-0.5 text-xs">
              <span className="text-[#6B5B52] font-medium font-body text-xs">Valid on:</span>
              {validOn.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1 rounded-full bg-[#C9A44A]/12 border border-[#C9A44A]/30 text-[#1C1410] font-medium font-body text-xs shadow-2xs"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* Actions: CTA Button + Dashed Promo Code Box */}
            <motion.div variants={itemVariants} className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Primary CTA Button */}
              <Link
                to={ctaLink}
                className="relative overflow-hidden inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#8B1A1A] hover:bg-[#701212] text-white rounded-xl font-bold text-xs uppercase tracking-wider font-accent shadow-md shadow-[#8B1A1A]/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#8B1A1A]/35 group cursor-pointer shrink-0"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-[#EDD98A]/30 to-transparent transition-transform duration-1000 ease-in-out" />
                <span className="relative z-10">{ctaText}</span>
                <ArrowRight className="relative z-10 w-4 h-4 text-[#EDD98A] transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>

              {/* Promo Code Box */}
              <div className="inline-flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-white border border-dashed border-[#C9A44A] transition-all shadow-2xs">
                <div className="flex items-center gap-2 text-xs">
                  <Tag className="w-4 h-4 text-[#C9A44A] shrink-0" />
                  <span className="text-[#6B5B52] font-medium font-body">Code:</span>
                  <span className="font-accent font-bold text-[#8B1A1A] tracking-wider text-sm sm:text-base">
                    {promoCode}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`px-3 py-1.5 rounded-lg font-accent font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-xs ${
                    copied
                      ? 'bg-emerald-600 text-white scale-105 shadow-emerald-500/30'
                      : 'bg-[#C9A44A] hover:bg-[#B6923B] text-[#1C1410]'
                  }`}
                  title="Copy promo code"
                >
                  {copied ? (
                    <span className="inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>COPIED ✓</span>
                    </span>
                  ) : (
                    <span>COPY</span>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Trust Badges Bottom */}
            <motion.div
              variants={itemVariants}
              className="pt-3 border-t border-[#C9A44A]/30 flex items-center gap-3 sm:gap-4 text-[11px] text-[#6B5B52] flex-wrap font-body"
            >
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A44A] shrink-0" />
                <span>100% Certified BIS 916 Hallmark</span>
              </span>
              <span className="text-[#C9A44A]">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#C9A44A] shrink-0" />
                <span>Complimentary Insured Armored Delivery</span>
              </span>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FlashSaleBanner;
