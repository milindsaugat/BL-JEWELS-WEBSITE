import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { PriceDisplay } from '../common/PriceDisplay';
import { HallmarkBadge } from '../common/HallmarkBadge';

export const QuickViewModal = () => {
  const { quickViewProduct, closeQuickView } = useUIStore();
  const { addToCart } = useCartStore();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Reset image and variant when active product changes
  useEffect(() => {
    setSelectedVariantIdx(0);
    setActiveImageIdx(0);
  }, [quickViewProduct?._id]);

  // Lock background scroll when open & handle Escape key dismiss
  useEffect(() => {
    if (!quickViewProduct) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeQuickView();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [quickViewProduct, closeQuickView]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const variants = product.variants || [];
  const activeVariant = variants[selectedVariantIdx] || variants[0] || {};
  const images = product.images?.length ? product.images : [{ url: product.image }];
  const currentImageUrl = images[activeImageIdx]?.url || images[0]?.url || product.image;

  const handleAddToCart = () => {
    addToCart(product, activeVariant, 1);
    closeQuickView();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/70 backdrop-blur-sm transition-opacity"
        onClick={closeQuickView}
      />

      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6">
        {/* Modal Container: Max-h bounded, flex on mobile with scrollable content, 2-cols on desktop */}
        <div className="relative w-full max-w-3xl bg-pearl rounded-2xl sm:rounded-3xl shadow-2xl border border-gold-300/60 overflow-hidden z-10 flex flex-col md:grid md:grid-cols-2 max-h-[92dvh] sm:max-h-[88dvh] animate-in zoom-in-95 duration-200">
          
          {/* Close button */}
          <button
            onClick={closeQuickView}
            className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 transition-colors shadow-md backdrop-blur-xs"
            aria-label="Close Quick View"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Left: Luxury Jewelry Showcase (Proper Image Cover) */}
          <div className="relative w-full h-[280px] xs:h-[320px] sm:h-[380px] md:h-full md:min-h-[500px] bg-stone-100 shrink-0 overflow-hidden border-b md:border-b-0 md:border-r border-stone-200/80 flex items-center justify-center group">
            {/* Main Jewelry Image: 100% proper edge-to-edge cover */}
            <img
              src={currentImageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Subtle Vignette Gradient at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent pointer-events-none" />

            {/* Hallmark Badge Floating on Top-Left */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none">
              <HallmarkBadge purity={product.metal?.purity || '916'} karat={product.metal?.karat || '22K'} compact />
            </div>

            {/* Image Pagination Dots on Mobile */}
            {images.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5 md:hidden pointer-events-none">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeImageIdx === idx ? 'w-5 bg-white shadow-sm' : 'w-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Info, Variants & Actions with Internal Scroll */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-3 sm:space-y-4 overflow-y-auto overscroll-contain flex-1">
            <div className="space-y-2 sm:space-y-3">
              <p className="font-accent text-[11px] sm:text-xs tracking-wider text-gold-700 uppercase font-semibold">
                {product.metal?.karat || '22K'} Gold • {product.categorySlug || 'Fine Jewelry'}
              </p>
              
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-charcoal leading-snug">
                {product.name}
              </h2>
              
              <p className="text-[11px] text-stone-400 font-body">
                SKU: {activeVariant.sku || product.sku || 'BLJ-CUSTOM'}
              </p>

              {/* Price Display */}
              <div className="pt-1">
                <PriceDisplay
                  price={activeVariant.price}
                  discountPrice={activeVariant.discountPrice}
                  size="md"
                />
              </div>

              {/* Thumbnail Selector Strip (Inline below price, doesn't block the main photo) */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 pt-1 pb-1 overflow-x-auto scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white shrink-0 ${
                        activeImageIdx === idx
                          ? 'border-[#930303] ring-2 ring-gold-400/40 shadow-xs scale-105'
                          : 'border-stone-200 opacity-70 hover:opacity-100 hover:border-gold-300'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Short Description */}
              <p className="text-xs text-stone-600 line-clamp-2 sm:line-clamp-3 font-body leading-relaxed">
                {product.shortDescription || product.description}
              </p>

              {/* Variant Selector */}
              {variants.length > 1 && (
                <div className="pt-1">
                  <label className="text-[11px] sm:text-xs font-semibold text-stone-700 font-body block mb-1.5">
                    Select Weight & Configuration:
                  </label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {variants.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-body font-medium transition-all ${
                          selectedVariantIdx === idx
                            ? 'bg-[#930303] text-white border-[#930303] shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-gold-400'
                        }`}
                      >
                        {v.label || `${v.weight}g`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Sticky-feel CTA Group */}
            <div className="space-y-2.5 pt-3 border-t border-stone-200">
              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>

              <div className="text-center">
                <Link
                  to={`/products/${product.slug}`}
                  onClick={closeQuickView}
                  className="text-xs font-semibold text-gold-800 hover:text-[#930303] font-body inline-flex items-center gap-1 transition-colors"
                >
                  <span>View Full Product Details & Sizing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
