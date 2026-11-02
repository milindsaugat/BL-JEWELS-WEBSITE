import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Star, ShieldCheck, Quote, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const DEFAULT_REVIEWS = [
  {
    userName: 'Radhika Mehra',
    location: 'New Delhi',
    title: 'Our bridal choker was the highlight of my wedding!',
    comment: 'The Maya Royal Kundan Choker took everyone’s breath away. What surprised us most was the exquisite weight and the BIS 916 hallmarking report included in the velvet case. BL Jewels has our lifetime loyalty.',
    rating: 5,
    piece: 'Maya Royal Kundan Choker Necklace',
    userImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
  },
  {
    userName: 'Aditya & Priya Singhania',
    location: 'Mumbai',
    title: 'Flawless diamond solitaire proposal ring',
    comment: 'I consulted Priya, their AI stylist, late at night, and then visited their Zaveri Bazaar boutique. The 1.25ct solitaire diamond ring came with GIA certification. My fiancée couldn’t stop crying with joy!',
    rating: 5,
    piece: 'Eternity Solitaire Diamond Ring',
    userImage: 'https://images.unsplash.com/photo-1621784563330-caee0b138a00?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
  },
  {
    userName: 'Meenakshi Sundaram',
    location: 'Bengaluru',
    title: 'Sacred Swarna Mangalsutra with daily elegance',
    comment: 'The craftsmanship of the black beads paired with diamond floral motifs is pure auspicious perfection. Fast insured delivery right to our doorstep with blue ribbon packaging.',
    rating: 5,
    piece: 'Auspicious Swarna Mangalsutra 22K',
    userImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
  },
  {
    userName: 'Ananya Deshmukh',
    location: 'Pune',
    title: 'Purest 22K Antique Lakshmi Temple Kada',
    comment: 'The nakshi hand-carving of Goddess Lakshmi with sacred lotus petals is divine work. The solid gold weight and BIS stamp give complete peace of mind. Truly heirloom grade.',
    rating: 5,
    piece: 'Antique Temple Lakshmi Gold Kada',
    userImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=80',
  },
  {
    userName: 'Sunita & Rajesh Agarwal',
    location: 'Jaipur',
    title: 'Uncut Polki Chandbalis for daughter’s Sangeet',
    comment: 'Syndicate polki stones with natural Zambian emerald drops. Every relative complimented the regal look. Blue Dart armored express reached in 2 days safely!',
    rating: 5,
    piece: 'Royal Rajputana Uncut Polki Chandbalis',
    userImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
  },
  {
    userName: 'Kavita Chawla',
    location: 'Chandigarh',
    title: 'Auspicious Peacock Jhumkas in 22K Yellow Gold',
    comment: 'Traditional rawa ball detailing and peacock feathers sculpted to perfection. The lifetime buyback commitment gives absolute trust in BL Jewels.',
    rating: 5,
    piece: 'Mayura Royal Heritage Gold Jhumkas',
    userImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80',
  },
];

export const Testimonials = ({ initialReviews = [] }) => {
  const reviews = initialReviews && initialReviews.length > 0 ? initialReviews : DEFAULT_REVIEWS;

  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ startX: 0, scrollLeft: 0, moved: false });

  // Update arrow enabled states
  const checkScrollBounds = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScrollBounds();
    const el = sliderRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);

    return () => {
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [reviews, checkScrollBounds]);

  // Click scroll handler
  const scrollSlider = (direction) => {
    const el = sliderRef.current;
    if (!el) return;
    const card = el.querySelector('[data-testimonial-card]');
    const step = card ? card.clientWidth + 24 : Math.min(el.clientWidth * 0.75, 420);

    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  // Robust Pointer Events
  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    const el = sliderRef.current;
    if (!el) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };

    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const el = sliderRef.current;
    if (!el) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    if (Math.abs(deltaX) > 5) {
      dragStartRef.current.moved = true;
    }
    el.scrollLeft = dragStartRef.current.scrollLeft - deltaX;
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const el = sliderRef.current;
    if (el) {
      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch {}
    }
  };

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-stone-200/80 relative overflow-hidden w-full">
      
      {/* Background Subtle Luxury Glow */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-gold-200/15 rounded-full blur-3xl pointer-events-none" />

      {/* ── FULL WIDTH CONTAINER (max-w-[1720px]) ── */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Section Header: Centered Regal Heading & Editorial Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 space-y-2 px-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-400" />
            <span className="font-accent text-[11px] font-semibold text-gold-700 tracking-[0.25em] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              VOICES OF DEVOTION & TIMELESS TRUST
            </span>
            <span className="w-6 h-px bg-gold-400" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#5B101D] tracking-tight leading-tight">
            Patron Reflections
          </h2>

          <div className="flex items-center justify-center gap-3 pt-0.5">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-gold-400" />
            <span className="text-gold-600 text-xs font-serif">✦</span>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-gold-400" />
          </div>

          <p className="font-body text-xs sm:text-sm text-stone-500 max-w-xl mx-auto font-normal leading-relaxed pt-1">
            Cherished by royal families, modern brides, and fine jewelry connoisseurs who trust our 100% BIS 916 hallmarked pure craftsmanship.
          </p>
        </div>

        {/* ── Full Width Testimonials Carousel Slider Container ── */}
        <div className="relative group/slider">

          {/* Left Navigation Arrow */}
          <button
            onClick={() => scrollSlider('left')}
            disabled={!canScrollLeft}
            className={`absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-stone-200 flex items-center justify-center transition-all duration-200 ${
              canScrollLeft
                ? 'opacity-95 hover:opacity-100 hover:bg-[#7A1D28] hover:text-white hover:border-[#7A1D28] text-stone-800 cursor-pointer shadow-md'
                : 'opacity-30 border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed pointer-events-none'
            }`}
            aria-label="Previous Testimonials"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Navigation Arrow */}
          <button
            onClick={() => scrollSlider('right')}
            disabled={!canScrollRight}
            className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-stone-200 flex items-center justify-center transition-all duration-200 ${
              canScrollRight
                ? 'opacity-95 hover:opacity-100 hover:bg-[#7A1D28] hover:text-white hover:border-[#7A1D28] text-stone-800 cursor-pointer shadow-md'
                : 'opacity-30 border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed pointer-events-none'
            }`}
            aria-label="Next Testimonials"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Scroller Track: Hardware-accelerated, pointer-captured, touch & drag ready */}
          <div
            ref={sliderRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`flex items-stretch gap-5 sm:gap-6 overflow-x-auto py-4 px-2 no-scrollbar ${
              isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: isDragging ? 'none' : 'x proximity',
              scrollBehavior: isDragging ? 'auto' : 'smooth',
              overscrollBehaviorX: 'contain',
              touchAction: 'pan-y pinch-zoom',
            }}
          >
            {reviews.map((rev, idx) => {
              const displayImg = rev.image || rev.images?.[0];
              const avatarImg = rev.userImage || rev.avatar;

              return (
                <div
                  key={rev._id || idx}
                  data-testimonial-card="true"
                  className="w-[320px] sm:w-[380px] md:w-[420px] shrink-0 flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm hover:shadow-gold hover:border-gold-300 transition-all duration-300 group"
                  style={{
                    scrollSnapAlign: 'start',
                  }}
                >
                  <div className="space-y-4">
                    
                    {/* Top Row: Stars + Quote Icon */}
                    <div className="flex items-center justify-between">
                      <div className="flex text-gold-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-4 h-4 fill-gold-500 text-gold-500" />
                        ))}
                      </div>
                      <Quote className="w-7 h-7 text-gold-300/80 group-hover:text-gold-500 transition-colors" />
                    </div>

                    {/* Review Title */}
                    <h4 className="font-display text-base sm:text-lg font-bold text-[#5B101D] leading-snug">
                      "{rev.title}"
                    </h4>

                    {/* Review Body */}
                    <p className="text-xs sm:text-sm text-stone-600 font-body leading-relaxed line-clamp-4">
                      {rev.comment}
                    </p>

                    {/* Jewelry Creation Image Tag (If provided) */}
                    {displayImg && (
                      <div className="pt-1">
                        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 group-hover:border-gold-300 transition-colors">
                          <img
                            src={displayImg}
                            alt={rev.piece || 'Jewelry Piece'}
                            draggable={false}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
                            loading="lazy"
                          />
                          {rev.piece && (
                            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                              <span className="text-[11px] font-semibold text-white truncate block">
                                {rev.piece}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Bottom Patron Author Info */}
                  <div className="pt-5 border-t border-stone-100 mt-5 flex items-center justify-between gap-3">
                    
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Patron Avatar Image */}
                      {avatarImg ? (
                        <img
                          src={avatarImg}
                          alt={rev.userName || 'Patron'}
                          draggable={false}
                          className="w-11 h-11 rounded-full object-cover border-2 border-gold-300 shadow-xs shrink-0 select-none pointer-events-none"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-gold-300 flex items-center justify-center text-[#5B101D] font-bold text-sm shrink-0">
                          {(rev.userName || 'P').charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h5 className="font-display text-sm font-bold text-stone-900 truncate">
                          {rev.userName || rev.name}
                        </h5>
                        <p className="text-[11px] text-stone-400 font-body truncate">
                          {rev.location || 'India'}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-body font-medium shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified</span>
                    </span>

                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default Testimonials;
