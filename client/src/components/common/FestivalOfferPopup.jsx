import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Clock, ArrowRight, Tag, Check, Copy } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useOfferStore } from '../../store/offerStore';

export const FestivalOfferPopup = ({ initialOffers = [] }) => {
  const storeOffers = useOfferStore((s) => s.activeOffers);
  const offers = initialOffers && initialOffers.length > 0 ? initialOffers : storeOffers;
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const openedOfferIdRef = useRef(null);
  const navigate = useNavigate();
  const { openDrawer } = useCartStore();

  const activeOffer = offers.find(
    (o) =>
      o.isActive &&
      o.showPopupModal !== false &&
      (o.placement === 'popup' || o.placement === 'both' || !o.placement) &&
      new Date(o.endDate) > new Date()
  );

  useEffect(() => {
    if (!activeOffer) return;
    const offerId = activeOffer._id || activeOffer.title;
    if (openedOfferIdRef.current === offerId) return;
    openedOfferIdRef.current = offerId;

    // Clean up any legacy localStorage/sessionStorage dismiss flags
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('bl_offer_dismissed_')) localStorage.removeItem(key);
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('bl_session_offer_dismissed_')) sessionStorage.removeItem(key);
      });
    } catch {}

    // Open instantly when delay is 0, otherwise honor configured delay
    const rawDelay = activeOffer.popupDelaySeconds !== undefined ? Number(activeOffer.popupDelaySeconds) : 0;
    const delayMs = Math.max(0, (Number.isFinite(rawDelay) ? rawDelay : 0) * 1000);

    if (delayMs === 0) {
      setIsOpen(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [activeOffer]);

  // Live Countdown Timer
  useEffect(() => {
    if (!activeOffer?.endDate || !isOpen) return;

    const calculate = () => {
      const diff = +new Date(activeOffer.endDate) - +new Date();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [activeOffer?.endDate, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
  };

  const handleClaimOffer = () => {
    handleDismiss();
    if (activeOffer?.couponCode) {
      navigator.clipboard?.writeText(activeOffer.couponCode);
      setCopied(true);
    }
    if (activeOffer?.ctaLink) {
      navigate(activeOffer.ctaLink);
    } else {
      openDrawer();
    }
  };

  if (!isOpen || !activeOffer) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-[#1C1410] border border-[#C9A44A]/60 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-white my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-md"
          aria-label="Close offer modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Artwork Header */}
        <div className="relative aspect-[16/9] overflow-hidden bg-stone-900">
          <img
            src={activeOffer.bannerImage || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80'}
            alt={activeOffer.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1410] via-black/40 to-transparent" />
          
          <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#930303]/90 text-[#F9E59B] text-[10px] font-bold uppercase tracking-wider border border-[#C9A44A]/60 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#E6C975]" />
            <span>{activeOffer.badge || 'FESTIVE OFFER'}</span>
          </div>

          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[10px] font-accent uppercase tracking-widest text-[#E6C975] font-bold">
              Exclusive Auspicious Privilege
            </span>
            <h3 className="text-xl font-bold font-display text-white truncate">
              {activeOffer.title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-center">
          
          <p className="text-xs text-stone-300 font-body leading-relaxed max-w-sm mx-auto">
            {activeOffer.subtitle || 'Celebrate auspicious festivities with hallmark 22K (916) pure gold creations. Limited period festive benefits.'}
          </p>

          {/* Animated Countdown Timer */}
          <div className="p-3 bg-white/5 border border-[#C9A44A]/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#E6C975]">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Offer Expires In</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-center">
              {/* Days */}
              <div className="w-14 py-1.5 bg-black/40 border border-[#C9A44A]/30 rounded-xl">
                <span className="font-mono text-lg font-bold text-[#F9E59B] block">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                  Days
                </span>
              </div>

              <span className="text-sm font-bold text-[#C9A44A]">:</span>

              {/* Hours */}
              <div className="w-14 py-1.5 bg-black/40 border border-[#C9A44A]/30 rounded-xl">
                <span className="font-mono text-lg font-bold text-[#F9E59B] block">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                  Hours
                </span>
              </div>

              <span className="text-sm font-bold text-[#C9A44A]">:</span>

              {/* Mins */}
              <div className="w-14 py-1.5 bg-black/40 border border-[#C9A44A]/30 rounded-xl">
                <span className="font-mono text-lg font-bold text-[#F9E59B] block">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                  Mins
                </span>
              </div>

              <span className="text-sm font-bold text-[#C9A44A]">:</span>

              {/* Secs */}
              <div className="w-14 py-1.5 bg-[#930303]/40 border border-red-500/50 rounded-xl">
                <span className="font-mono text-lg font-bold text-white block animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-red-200 font-bold">
                  Secs
                </span>
              </div>
            </div>
          </div>

          {/* Coupon Code Pill */}
          {activeOffer.couponCode && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-950/40 border border-[#C9A44A]/50 text-xs">
              <Tag className="w-3.5 h-3.5 text-[#E6C975]" />
              <span className="text-stone-300">Use Code:</span>
              <span className="font-mono font-bold text-[#F9E59B] tracking-wider">
                {activeOffer.couponCode}
              </span>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleClaimOffer}
              className="w-full py-3.5 bg-gradient-to-r from-[#C9A44A] to-[#B6923B] hover:from-[#B6923B] hover:to-[#A07830] text-[#1C1410] font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#C9A44A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-accent"
            >
              <span>{activeOffer.ctaText || 'Claim Festive Offer & Shop'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleDismiss}
              className="text-[11px] text-stone-400 hover:text-stone-200 transition-colors cursor-pointer py-1 block w-full"
            >
              Continue Browsing Collections
            </button>
          </div>

        </div>

      </div>

    </div>,
    document.body
  );
};

export default FestivalOfferPopup;

