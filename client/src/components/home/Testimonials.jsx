import React from 'react';
import { useCarousel } from '../../hooks/useCarousel';
import { Star, ShieldCheck, Quote, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const Testimonials = ({ initialReviews = [] }) => {
  const reviews = initialReviews;

  const { sliderRef, isDragging, canScrollLeft, canScrollRight, scrollSlider,
    handlePointerDown, handlePointerMove, handlePointerUp, handleClickCapture } = useCarousel(reviews);

  if (!reviews.length) return null;

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

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#930303] tracking-tight leading-tight">
            Customer Stories
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
            className={`absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-stone-200 hidden md:flex items-center justify-center transition-all duration-200 ${
              canScrollLeft
                ? 'opacity-95 hover:opacity-100 hover:bg-[#930303] hover:text-white hover:border-[#930303] text-stone-800 cursor-pointer shadow-md'
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
            className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-stone-200 hidden md:flex items-center justify-center transition-all duration-200 ${
              canScrollRight
                ? 'opacity-95 hover:opacity-100 hover:bg-[#930303] hover:text-white hover:border-[#930303] text-stone-800 cursor-pointer shadow-md'
                : 'opacity-30 border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed pointer-events-none'
            }`}
            aria-label="Next Testimonials"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Native touch scrolling with mouse drag on desktop */}
          <div
            ref={sliderRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onLostPointerCapture={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onDragStart={(event) => event.preventDefault()}
            onClickCapture={handleClickCapture}
            className={`touch-carousel flex items-stretch gap-5 sm:gap-6 overflow-x-auto py-4 px-2 no-scrollbar ${
              isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'auto',
              scrollPaddingInline: '8px',
              overscrollBehaviorX: 'contain',
              touchAction: 'pan-x pan-y pinch-zoom',
            }}
          >
            {reviews.map((rev, idx) => {
              const displayImg = rev.image || rev.images?.[0];
              const avatarImg = rev.userImage || rev.avatar;

              return (
                <div
                  key={rev._id || idx}
                  data-testimonial-card="true"
                  className="w-[min(320px,85vw)] sm:w-[380px] md:w-[420px] shrink-0 flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm hover:shadow-gold hover:border-gold-300 transition-all duration-300 group"
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
                    <h4 className="font-display text-base sm:text-lg font-bold text-[#930303] leading-snug">
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
                          alt={rev.userName || 'Customer'}
                          draggable={false}
                          className="w-11 h-11 rounded-full object-cover border-2 border-gold-300 shadow-xs shrink-0 select-none pointer-events-none"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-gold-300 flex items-center justify-center text-[#930303] font-bold text-sm shrink-0">
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
