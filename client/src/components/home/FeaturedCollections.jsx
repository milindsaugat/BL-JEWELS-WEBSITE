import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { occasionService } from '../../services/api';

// Authentic Indian occasion wear default state (6 Curated Segments)
const INITIAL_OCCASIONS = [
  {
    title: 'Everyday',
    subtitle: 'Working women • Light rings, studs, chains',
    badge: 'Everyday',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
    link: '/collections?occasion=everyday',
  },
  {
    title: 'Office Wear',
    subtitle: 'Corporate women • Subtle, minimal pieces',
    badge: 'Office Wear',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80',
    link: '/collections?occasion=office',
  },
  {
    title: 'Festive',
    subtitle: 'All Celebrations • Jhumkas, kadas, sets',
    badge: 'Festive',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=80',
    link: '/collections?occasion=festive',
  },
  {
    title: 'Puja & Religious',
    subtitle: 'Traditional buyer • Temple jewelry, coins',
    badge: 'Puja & Devotion',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=80',
    link: '/collections?occasion=puja',
  },
  {
    title: 'Wedding',
    subtitle: 'Family + guests • Heavy sets, necklaces',
    badge: 'Wedding',
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=700&q=80',
    link: '/collections?occasion=wedding',
  },
  {
    title: 'Bridal',
    subtitle: 'The Bride • Full trousseau sets',
    badge: 'Bridal',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80',
    link: '/collections?occasion=bridal',
  },
];

export const FeaturedCollections = ({ categories = [], initialOccasions = [] }) => {
  // Metal Tabs: Gold, Diamond, Silver
  const [activeMetal, setActiveMetal] = useState('gold');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [occasions, setOccasions] = useState(
    initialOccasions.length > 0 ? initialOccasions : INITIAL_OCCASIONS
  );

  const sliderRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ startX: 0, scrollLeft: 0, moved: false });

  // Dedicated smooth scroll & drag state for Occasion Horizontal Slider (Pure Drag & Mouse Wheel, No Buttons)
  const occSliderRef = useRef(null);
  const occDraggingRef = useRef(false);
  const occDragStartRef = useRef({ startX: 0, scrollLeft: 0, moved: false });

  useEffect(() => {
    const scroller = occSliderRef.current;
    if (!scroller) return;

    // Mouse wheel horizontal translation for effortless desktop scrolling
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const isRight = e.deltaY > 0;
        const canScroll = isRight
          ? scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 5
          : scroller.scrollLeft > 5;

        if (canScroll) {
          e.preventDefault();
          scroller.scrollBy({ left: e.deltaY * 1.4, behavior: 'auto' });
        }
      }
    };

    scroller.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      scroller.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Robust mouse click & drag events for occasion slider
  const handleOccPointerDown = (e) => {
    if (e.button !== 0) return;
    const scroller = occSliderRef.current;
    if (!scroller) return;

    occDraggingRef.current = true;
    occDragStartRef.current = {
      startX: e.clientX,
      scrollLeft: scroller.scrollLeft,
      moved: false,
    };

    try {
      scroller.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleOccPointerMove = (e) => {
    if (!occDraggingRef.current) return;
    const scroller = occSliderRef.current;
    if (!scroller) return;

    const deltaX = e.clientX - occDragStartRef.current.startX;
    if (Math.abs(deltaX) > 6) {
      occDragStartRef.current.moved = true;
    }
    scroller.scrollLeft = occDragStartRef.current.scrollLeft - deltaX;
  };

  const handleOccPointerUp = (e) => {
    if (!occDraggingRef.current) return;
    occDraggingRef.current = false;

    const scroller = occSliderRef.current;
    if (scroller) {
      try {
        if (scroller.hasPointerCapture(e.pointerId)) {
          scroller.releasePointerCapture(e.pointerId);
        }
      } catch {}
    }
  };

  const handleOccClickCapture = (e) => {
    if (occDragStartRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      occDragStartRef.current.moved = false;
    }
  };

  const metalTabs = [
    { id: 'gold', label: 'Gold Jewellery' },
    { id: 'diamond', label: 'Diamond Jewellery' },
    { id: 'silver', label: 'Silver Jewellery' },
  ];

  // Sync when parent provides concurrent occasions
  useEffect(() => {
    if (initialOccasions && initialOccasions.length > 0) {
      setOccasions(initialOccasions);
    }
  }, [initialOccasions]);

  // Fallback direct fetch if mounted standalone
  useEffect(() => {
    if (initialOccasions.length > 0) return;
    let isMounted = true;
    const fetchOccasions = async () => {
      try {
        const res = await occasionService.getOccasions();
        if (isMounted && res?.occasions && res.occasions.length > 0) {
          setOccasions(res.occasions);
        }
      } catch (err) {
        console.error('Fetch occasions error:', err);
      }
    };
    fetchOccasions();
    return () => { isMounted = false; };
  }, [initialOccasions]);

  // Filter categories by the active metal
  const filteredCategories = categories.filter((cat) => {
    if (!cat.metals || cat.metals.length === 0) return true;
    return cat.metals.includes(activeMetal);
  });

  // Performance-driven scroll state update
  const updateArrowStates = useCallback(() => {
    const scroller = sliderRef.current;
    if (!scroller) return;
    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  useEffect(() => {
    const scroller = sliderRef.current;
    if (!scroller) return;

    updateArrowStates();

    scroller.addEventListener('scroll', updateArrowStates, { passive: true });
    window.addEventListener('resize', updateArrowStates);

    return () => {
      scroller.removeEventListener('scroll', updateArrowStates);
      window.removeEventListener('resize', updateArrowStates);
    };
  }, [filteredCategories, activeMetal, updateArrowStates]);

  // Smooth button scroll by exact card steps
  const scrollSlider = (direction) => {
    const scroller = sliderRef.current;
    if (!scroller) return;

    const firstCard = scroller.querySelector('a');
    const step = firstCard ? (firstCard.clientWidth + 24) * 2 : Math.min(scroller.clientWidth * 0.75, 500);

    scroller.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  // Robust Pointer Events: captures mouse/touch even outside container
  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    const scroller = sliderRef.current;
    if (!scroller) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      scrollLeft: scroller.scrollLeft,
      moved: false,
    };

    try {
      scroller.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const scroller = sliderRef.current;
    if (!scroller) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    if (Math.abs(deltaX) > 5) {
      dragStartRef.current.moved = true;
    }
    scroller.scrollLeft = dragStartRef.current.scrollLeft - deltaX;
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const scroller = sliderRef.current;
    if (scroller) {
      try {
        if (scroller.hasPointerCapture(e.pointerId)) {
          scroller.releasePointerCapture(e.pointerId);
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
    <section className="py-14 sm:py-20 bg-white relative overflow-hidden w-full">
      
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-50/40 via-white to-stone-50/30 pointer-events-none" />

      {/* ── FULL WIDTH CONTAINER ── */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">

        {/* ── 1. Top Section Header & Centered Metal Tabs ── */}
        <div className="text-center max-w-2xl mx-auto mb-6 space-y-2 px-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-400" />
            <span className="font-accent text-[11px] font-semibold text-gold-700 tracking-[0.25em] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              ARCHIVAL ATELIER CREATIONS
            </span>
            <span className="w-6 h-px bg-gold-400" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-[40px] font-semibold text-[#5B101D] tracking-tight leading-tight">
            Curated Jewelry Collections
          </h2>
          <p className="font-body text-xs sm:text-sm text-stone-500 max-w-lg mx-auto font-normal leading-relaxed">
            Handcrafted in certified 22K (916) pure gold, uncut Polki Jadau, and natural solitaires — tailored for timeless royal distinction.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-8 border-b border-stone-200/90 pb-3 max-w-xl mx-auto mb-8 sm:mb-10 px-4">
          {metalTabs.map((tab, idx) => {
            const isActive = activeMetal === tab.id;
            return (
              <React.Fragment key={tab.id}>
                <button
                  onClick={() => setActiveMetal(tab.id)}
                  className={`text-sm sm:text-base md:text-lg tracking-wide transition-colors duration-150 relative pb-1 ${
                    isActive
                      ? 'text-[#7A1D28] font-bold after:content-[""] after:absolute after:-bottom-[13px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#7A1D28] after:rounded-full'
                      : 'text-stone-600 hover:text-stone-900 font-medium'
                  }`}
                >
                  {tab.label}
                </button>
                {idx < metalTabs.length - 1 && (
                  <span className="text-stone-300 font-light text-base sm:text-lg">
                    |
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── 2. Full Width SQUARE Category Slider (Hardware-Accelerated 120 FPS, No Scrollbar) ── */}
        <div className="relative group/slider">
          
          {/* Left Arrow Button */}
          <button
            onClick={() => scrollSlider('left')}
            disabled={!canScrollLeft}
            className={`absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-stone-200 flex items-center justify-center transition-all duration-200 ${
              canScrollLeft
                ? 'opacity-95 hover:opacity-100 hover:bg-[#7A1D28] hover:text-white hover:border-[#7A1D28] text-stone-800 cursor-pointer shadow-md'
                : 'opacity-30 border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed pointer-events-none'
            }`}
            aria-label="Previous Categories"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scrollSlider('right')}
            disabled={!canScrollRight}
            className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-stone-200 flex items-center justify-center transition-all duration-200 ${
              canScrollRight
                ? 'opacity-95 hover:opacity-100 hover:bg-[#7A1D28] hover:text-white hover:border-[#7A1D28] text-stone-800 cursor-pointer shadow-md'
                : 'opacity-30 border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed pointer-events-none'
            }`}
            aria-label="Next Categories"
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
            className={`flex items-stretch gap-4 sm:gap-5 md:gap-6 overflow-x-auto py-3 px-2 no-scrollbar ${
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
            {filteredCategories.map((cat) => (
              <Link
                key={cat._id || cat.slug}
                to={`/collections/${cat.slug}?metal=${activeMetal}`}
                draggable={false}
                className="group relative w-36 sm:w-44 md:w-52 lg:w-56 shrink-0 flex flex-col focus:outline-none"
                style={{
                  scrollSnapAlign: 'start',
                }}
              >
                {/* Square Card Box */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/90 group-hover:border-gold-400 group-hover:shadow-gold transition-all duration-200 shadow-xs">
                  {/* Jewelry Image */}
                  <img
                    src={cat.image || '/images/categories/default.jpg'}
                    alt={cat.name}
                    draggable={false}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out pointer-events-none"
                    loading="lazy"
                  />

                  {/* Gradient Vignette for Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-200 pointer-events-none" />

                  {/* Bottom Category Label & Action */}
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white flex items-end justify-between gap-1 z-10">
                    <div className="min-w-0">
                      <span className="font-display font-semibold text-xs sm:text-sm md:text-base text-white tracking-wide group-hover:text-gold-200 transition-colors drop-shadow-sm block leading-tight line-clamp-2">
                        {cat.name}
                      </span>
                      {cat.productCount !== undefined && (
                        <span className="text-[10px] text-stone-300 font-body block opacity-90">
                          {cat.productCount} Designs
                        </span>
                      )}
                    </div>
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-gold-500 group-hover:text-stone-900 transition-colors shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>

        {/* ── 3. Centered Heading: BL Jewels Royal World / A Companion for Every Occasion ── */}
        <div className="text-center max-w-2xl mx-auto mt-16 sm:mt-20 mb-8 sm:mb-11 space-y-2 px-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-8 h-px bg-gold-400/80" />
            <span className="font-accent text-[11px] font-semibold text-gold-700 tracking-[0.25em] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              HEIRLOOMS FOR SACRED MILESTONES
            </span>
            <span className="w-8 h-px bg-gold-400/80" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#5B101D] tracking-tight leading-tight">
            BL Jewels Royal World
          </h2>
          <div className="flex items-center justify-center gap-3 pt-0.5">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-gold-400" />
            <span className="text-gold-600 text-xs font-serif">✦</span>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-gold-400" />
          </div>
          <p className="font-display italic text-base sm:text-lg text-gold-800 font-medium">
            "A Companion For Every Auspicious Occasion"
          </p>
          <p className="font-body text-xs sm:text-sm text-stone-500 max-w-xl mx-auto font-normal leading-relaxed">
            From intimate morning pujas & festive muhurats to grand royal wedding trousseaus — timeless ornaments masterfully sculpted to sanctify every generation.
          </p>
        </div>

        {/* ── 4. The 6 Occasion Cards: Seamless Horizontal Slider (No Arrow Buttons) ── */}
        <div className="relative w-full">
          {/* Smooth Mouse Wheel & Drag Responsive Horizontal Slider */}
          <div
            ref={occSliderRef}
            onPointerDown={handleOccPointerDown}
            onPointerMove={handleOccPointerMove}
            onPointerUp={handleOccPointerUp}
            onPointerCancel={handleOccPointerUp}
            onClickCapture={handleOccClickCapture}
            className="flex items-stretch gap-5 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-5 pt-2 px-1 select-none cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {occasions.map((occ, i) => (
              <Link
                key={occ._id || i}
                to={occ.link}
                draggable={false}
                className="group relative shrink-0 w-[280px] sm:w-[320px] md:w-[350px] aspect-[3/4] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-gold-500/25 transition-all duration-500 bg-stone-900 block border border-stone-200/90 hover:border-gold-400 transform hover:-translate-y-2 select-none"
              >
                {/* High-res Model Image actively wearing occasion jewelry */}
                <img
                  src={occ.image}
                  alt={occ.title}
                  draggable={false}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out pointer-events-none select-none"
                  loading="lazy"
                />

                {/* Minimalist Top Badge Tag (Always Visible) */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <span className="text-xs font-accent text-white uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 shadow-xs">
                    {occ.badge}
                  </span>
                </div>

                {/* Gradient Vignette: Only Appears on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Bottom Details: Slides Up & Only Appears on Hover */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white flex flex-col justify-end space-y-1.5 z-10 pointer-events-none translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                  <span className="text-xs font-accent text-gold-300 uppercase tracking-widest font-semibold">
                    {occ.badge} Collection
                  </span>
                  <h3 className="font-display text-2xl sm:text-[26px] font-bold text-white group-hover:text-gold-200 transition-colors leading-tight">
                    {occ.title}
                  </h3>
                  {occ.subtitle && (
                    <p className="text-xs sm:text-[13px] text-stone-200 font-body leading-relaxed line-clamp-2 opacity-95">
                      {occ.subtitle}
                    </p>
                  )}
                  <div className="pt-1.5 flex items-center gap-1.5 text-xs font-semibold font-body text-gold-300 group-hover:text-gold-200">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturedCollections;
