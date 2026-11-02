import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { PriceDisplay } from '../common/PriceDisplay';
import { HallmarkBadge } from '../common/HallmarkBadge';

export const QuickViewModal = () => {
  const { quickViewProduct, closeQuickView } = useUIStore();
  const { addToCart } = useCartStore();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

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

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-pearl rounded-3xl shadow-2xl border border-gold-300/60 overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2 animate-in zoom-in-95 duration-200">
          
          {/* Close button */}
          <button
            onClick={closeQuickView}
            className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 transition-colors shadow-md"
            aria-label="Close Quick View"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Full-Bleed Luxury Jewelry Showcase (Ambient Cover + Proper Fit) */}
          <div className="relative w-full h-[360px] sm:h-[440px] md:h-full min-h-[380px] md:min-h-[520px] bg-[#F7F4EE] overflow-hidden border-b md:border-b-0 md:border-r border-stone-200/80 flex items-center justify-center group">
            
            {/* Ambient Blurred Background (Edge-to-edge luxury coverage) */}
            <img
              src={currentImageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-115 pointer-events-none"
            />

            {/* Subtle Vignette Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-black/5 pointer-events-none" />

            {/* Main Jewelry Image: 100% complete piece visible without cropping (Proper Fit) */}
            <img
              src={currentImageUrl}
              alt={product.name}
              className="relative z-10 w-full h-full max-h-[460px] object-contain object-center p-4 sm:p-6 drop-shadow-lg group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Hallmark Badge Tag Floating on Top-Left */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <HallmarkBadge purity={product.metal?.purity || '916'} karat={product.metal?.karat || '22K'} compact />
            </div>

            {/* Floating Thumbnail Strip at Bottom if multiple images exist */}
            {images.length > 1 && (
              <div className="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center px-3">
                <div className="bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-2xl shadow-lg border border-white/70 flex items-center gap-2 max-w-full overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white shrink-0 ${
                        activeImageIdx === idx
                          ? 'border-crimson-700 ring-2 ring-gold-400/40 shadow-sm scale-105'
                          : 'border-transparent opacity-75 hover:opacity-100 hover:border-gold-300'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Info & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-4">
            <div>
              <p className="font-accent text-xs tracking-wider text-gold-700 uppercase font-semibold">
                {product.metal?.karat || '22K'} Gold • {product.categorySlug || 'Fine Jewelry'}
              </p>
              <h2 className="font-display text-2xl font-bold text-charcoal mt-1 leading-snug">
                {product.name}
              </h2>
              <p className="text-[11px] text-stone-400 mt-1 font-body">
                SKU: {activeVariant.sku || product.sku || 'BLJ-CUSTOM'}
              </p>

              <div className="mt-4">
                <PriceDisplay
                  price={activeVariant.price}
                  discountPrice={activeVariant.discountPrice}
                  size="lg"
                />
              </div>

              <p className="text-xs text-stone-600 line-clamp-3 mt-3 font-body leading-relaxed">
                {product.shortDescription || product.description}
              </p>

              {/* Variant Selector */}
              {variants.length > 1 && (
                <div className="mt-4">
                  <label className="text-xs font-semibold text-stone-700 font-body block mb-2">
                    Select Weight & Configuration:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`text-xs px-3.5 py-1.5 rounded-lg border font-body font-medium transition-all ${
                          selectedVariantIdx === idx
                            ? 'bg-crimson-800 text-white border-crimson-800 shadow-sm'
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

            <div className="space-y-3 pt-4 border-t border-stone-200">
              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-gradient-to-r from-crimson-800 to-crimson-700 hover:from-crimson-700 hover:to-crimson-600 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>

              <div className="text-center">
                <Link
                  to={`/products/${product.slug}`}
                  onClick={closeQuickView}
                  className="text-xs font-semibold text-gold-800 hover:text-crimson-800 font-body inline-flex items-center gap-1 transition-colors"
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
