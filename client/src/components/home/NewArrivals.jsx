import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';

export const NewArrivals = ({ products = [] }) => {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ startX: 0, scrollLeft: 0, moved: false });

  // Update button enabled/disabled states
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
  }, [products, checkScrollBounds]);

  // Click scroll by exact visible cards step
  const scrollSlider = (direction) => {
    const el = sliderRef.current;
    if (!el) return;
    const card = el.querySelector('[data-new-arrival-card]');
    const step = card ? (card.clientWidth + 24) * 2 : Math.min(el.clientWidth * 0.75, 720);

    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  // Robust Pointer Events
  const handlePointerDown = (e) => {
    // If clicked on button or interactive element, let the button handle it directly
    if (e.target.closest('button, a')) return;
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

  const handleClickCapture = (e) => {
    if (dragStartRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragStartRef.current.moved = false;
    }
  };

  return (
    <section className="py-20 sm:py-24 bg-stone-50/50 border-t border-stone-200/80 relative overflow-hidden w-full">
      
      {/* Background Subtle Rose Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* ── FULL WIDTH CONTAINER (max-w-[1720px]) ── */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Section Header: Centered Regal Heading & Editorial Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2 px-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-400" />
            <span className="font-accent text-[11px] font-semibold text-gold-700 tracking-[0.25em] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              HAUTE ATELIER LAUNCHES · SEASONAL PREMIERE
            </span>
            <span className="w-6 h-px bg-gold-400" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#5B101D] tracking-tight leading-tight">
            Fresh Heirloom Arrivals
          </h2>

          <p className="font-body text-xs sm:text-sm text-stone-500 max-w-xl mx-auto font-normal leading-relaxed pt-1">
            Newly sculpted silhouettes straight from master karigars of Zaveri Bazaar & Johari Bazaar. Limited-edition bridal & gala masterpieces celebrating fresh artistic majesty.
          </p>
        </div>

        {/* ── Full Width New Arrivals Carousel Slider Container ── */}
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
            aria-label="Previous New Arrivals"
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
            aria-label="Next New Arrivals"
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
            onClickCapture={handleClickCapture}
            className={`flex items-stretch gap-5 sm:gap-6 overflow-x-auto py-3 px-2 no-scrollbar ${
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
            {products.map((product) => (
              <div
                key={product._id}
                data-new-arrival-card="true"
                className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 flex flex-col"
                style={{
                  scrollSnapAlign: 'start',
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

        </div>

        {/* ── Centered Explore All Creations Link ── */}
        <div className="text-center mt-10">
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A1D28] hover:text-white hover:bg-[#7A1D28] font-body tracking-wider uppercase group px-6 py-3 rounded-full border border-[#7A1D28]/40 transition-all duration-200 shadow-xs"
          >
            <span>Explore All New Designs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default NewArrivals;
