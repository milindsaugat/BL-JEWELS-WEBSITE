import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { bannerService } from '../../services/api';

const DEFAULT_BANNERS = [
  {
    _id: 'ban_1',
    eyebrow: '✦ PURITY WITH AUSPICIOUSNESS • BRIDAL TROUSSEAU',
    title: 'Regal Rajputana & Kundan Bridal Sets',
    subtitle: 'Handcrafted in certified 22K (916) Hallmark Gold with syndicate uncut polki diamonds, Zambian emerald drops, and South Sea pearls.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=2000&q=90',
    ctaText: 'Explore Bridal Collection',
    ctaLink: '/collections/bridal-heritage',
    secondaryCtaText: 'Book VIP Appointment',
    secondaryCtaLink: '/contact',
    badgeText: '100% BIS 916 Hallmark Purity',
  },
  {
    _id: 'ban_2',
    eyebrow: '✦ HERITAGE GOLD • SACRED TRADITIONS',
    title: 'Pure 22K Auspicious Temple Gold Heirlooms',
    subtitle: 'Sculpted by master karigars with ancient nakshi carving, portraying divine Lakshmi and sacred lotus motifs for generational blessings.',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=2000&q=90',
    ctaText: 'Discover Temple Gold',
    ctaLink: '/collections/necklaces',
    secondaryCtaText: 'Our Heritage Story',
    secondaryCtaLink: '/about',
    badgeText: 'Guaranteed Lifetime Buyback',
  },
  {
    _id: 'ban_3',
    eyebrow: '✦ RARE BRILLIANCE • GIA & IGI CERTIFIED',
    title: 'Celestial Solitaires in 18K Rose & White Gold',
    subtitle: 'Exquisite round brilliant and cushion cut solitaires boasting VVS clarity and Colorless perfection for your sacred proposal.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=2000&q=90',
    ctaText: 'Explore Solitaires',
    ctaLink: '/collections/rings',
    secondaryCtaText: 'Styling Consultation',
    secondaryCtaLink: '/contact',
    badgeText: 'GIA Certified Diamonds',
  },
  {
    _id: 'ban_4',
    eyebrow: '✦ SACRED UNION • ETERNAL DEVOTION',
    title: 'The Auspicious Swarna Mangalsutra Collection',
    subtitle: 'Delicate brilliant-cut diamonds set in pure 22K gold medallions, hand-strung with sacred black onyx beads for timeless daily grace.',
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=2000&q=90',
    ctaText: 'Shop Mangalsutras',
    ctaLink: '/collections/mangalsutra',
    secondaryCtaText: 'View Bestsellers',
    secondaryCtaLink: '/collections',
    badgeText: 'Free Insured Express Delivery',
  }
];

export const HeroSection = ({ initialBanners = [] }) => {
  const [banners, setBanners] = useState(initialBanners.length > 0 ? initialBanners : DEFAULT_BANNERS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) {
      setBanners(initialBanners);
      return;
    }
    bannerService.getBanners()
      .then((res) => {
        if (res.banners && res.banners.length > 0) {
          setBanners(res.banners);
        }
      })
      .catch(() => {
        // Fallback to default luxury banners
      });
  }, [initialBanners]);

  // Autoplay slider (5.5s interval)
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % banners.length);
  };

  const activeBanner = banners[currentIdx] || banners[0];

  return (
    <section
      className={`group relative w-full overflow-hidden bg-[#140F0E] transition-all duration-300 ${
        activeBanner?.isImageOnly
          ? 'aspect-[2.4/1] sm:aspect-[2.8/1] md:aspect-[3/1] min-h-[220px] max-h-[640px]'
          : 'min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] h-[70vh] max-h-[700px]'
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides */}
      {banners.map((banner, idx) => {
        const isImageOnly = banner.isImageOnly === true || banner.isImageOnly === 'true';

        return (
          <div
            key={banner._id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center ${
              idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Ambient Blurred Background (Edge-to-edge luxury depth for graphic banners) */}
            {isImageOnly && (
              <img
                src={banner.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
              />
            )}

            {/* Banner Image: 100% full fit without cropping */}
            <img
              src={banner.image}
              alt={banner.title || 'Hero Banner'}
              className={`w-full h-full ${
                isImageOnly
                  ? 'relative z-10 object-contain object-center'
                  : 'object-cover object-center scale-100 transition-transform duration-7000 ease-out'
              }`}
              {...(idx === 0 ? { fetchpriority: 'high' } : { fetchpriority: 'low' })}
            />

            {/* Multi-layer Gradient Overlays (Only for banners with text overlay) */}
            {!isImageOnly && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal/95 via-charcoal/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-black/30" />
              </>
            )}

            {/* Full Banner Clickable Overlay (For image-only banners) */}
            {isImageOnly && (
              <Link
                to={banner.ctaLink || '/collections'}
                className="absolute inset-0 z-20 cursor-pointer block"
                aria-label={banner.title || 'Explore Collection'}
                title={banner.title || 'Click to view collection'}
              />
            )}
          </div>
        );
      })}

      {/* Slide Content Overlay (Only shown for banners with text overlay) */}
      {!activeBanner?.isImageOnly && (
        <div className="relative z-20 h-full container-bl flex items-center pointer-events-none">
          <div className="max-w-2xl lg:max-w-3xl space-y-6 text-white py-12 pointer-events-auto">
            
            {/* Eyebrow Pill */}
            {activeBanner.eyebrow && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-gold-400/50 shadow-gold-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span className="font-accent text-xs font-semibold tracking-wider text-gold-300 uppercase">
                  {activeBanner.eyebrow}
                </span>
              </div>
            )}

            {/* Main Title */}
            {activeBanner.title && (
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal sm:font-medium text-pearl leading-[1.08] tracking-tight drop-shadow-md">
                {activeBanner.title}
              </h1>
            )}

            {/* Subtitle */}
            {activeBanner.subtitle && (
              <p className="font-body text-sm sm:text-base md:text-lg text-stone-200 leading-relaxed max-w-2xl drop-shadow">
                {activeBanner.subtitle}
              </p>
            )}

            {/* Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to={activeBanner.ctaLink || '/collections'}
                className="px-8 py-4 bg-gradient-to-r from-crimson-700 via-crimson-600 to-crimson-700 hover:from-crimson-600 hover:to-crimson-500 text-white rounded-xl text-xs sm:text-sm font-semibold tracking-wider font-body shadow-crimson transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-gold-400/30"
              >
                <span>{activeBanner.ctaText || 'Explore Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {activeBanner.secondaryCtaText && (
                <Link
                  to={activeBanner.secondaryCtaLink || '/about'}
                  className="px-8 py-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-pearl border border-gold-400/60 hover:border-gold-300 rounded-xl text-xs sm:text-sm font-semibold tracking-wider font-body shadow-gold-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>{activeBanner.secondaryCtaText}</span>
                </Link>
              )}
            </div>

            {/* Floating Hallmark Purity Stamp */}
            <div className="pt-6 flex items-center gap-6 text-xs text-stone-300 font-body border-t border-white/15">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>{activeBanner.badgeText || '100% BIS 916 Hallmark Guaranteed'}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Award className="w-4 h-4 text-gold-400" />
                <span>Lifetime Gold Buyback</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Prev / Next Slider Arrow Controls (Completely hidden when single banner, reveals on hover when multiple) */}
      {banners.length > 1 && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-crimson-700/90 backdrop-blur-md border border-gold-400/40 text-white flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-crimson-700/90 backdrop-blur-md border border-gold-400/40 text-white flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Bottom Pagination Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIdx
                    ? 'w-8 bg-gradient-to-r from-gold-400 to-gold-200 shadow-gold-sm'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
