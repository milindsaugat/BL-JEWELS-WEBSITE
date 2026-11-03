import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import { formatCurrency } from '../../lib/utils';
import { PriceDisplay } from '../common/PriceDisplay';

export const ProductCard = ({ product }) => {
  const { wishlist, toggleWishlist } = useAuthStore();
  const { addToCart } = useCartStore();
  const { openQuickView } = useUIStore();

  const isFav = wishlist.includes(product._id);
  const primaryVariant = product.variants?.[0] || {};
  const primaryImage = product.images?.[0]?.url || product.image;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, primaryVariant, 1);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  return (
    <article
      draggable={false}
      className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200/90 hover:border-gold-300 hover:shadow-gold transition-all duration-300 flex flex-col justify-between shadow-sm select-none"
    >
      
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-parchment">
        <Link to={`/products/${product.slug}`} draggable={false}>
          <img
            src={primaryImage}
            alt={product.name}
            draggable={false}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
            loading="lazy"
            decoding="async"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isNewArrival && (
            <span className="bg-crimson-700 text-white font-body text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-pill shadow-sm">
              New
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-gold-500 text-charcoal font-body text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-pill shadow-gold-sm">
              Royal
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isFav
              ? 'bg-crimson-700 text-white shadow-crimson'
              : 'bg-white/85 text-stone-700 hover:bg-white hover:text-crimson-700'
          }`}
          title={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
        </button>

        {/* Hover / Mobile Quick Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-charcoal/25 md:backdrop-blur-[2px] opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-2.5 sm:p-3 gap-2 pointer-events-none">
          <button
            type="button"
            onClick={handleQuickView}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/95 hover:bg-charcoal text-charcoal hover:text-white transition-colors text-[11px] sm:text-xs font-semibold font-body shadow-md active:scale-95 cursor-pointer"
            aria-label="Quick View"
          >
            <Eye className="w-3.5 h-3.5 text-crimson-800" />
            <span>Quick View</span>
          </button>
          <button
            type="button"
            onClick={handleQuickAdd}
            className="pointer-events-auto p-1.5 sm:p-2 rounded-full bg-crimson-700 text-white hover:bg-crimson-800 transition-colors shadow-md active:scale-95 cursor-pointer"
            title="Quick add to bag"
            aria-label="Add to bag"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-body">
            <span>
              {product.metal?.karat || '22K'} {product.metal?.color ? `${product.metal.color.toUpperCase()} ` : ''}GOLD
            </span>
            {primaryVariant.weight && (
              <span className="text-stone-400">
                {primaryVariant.weight}g
              </span>
            )}
          </div>

          <Link to={`/products/${product.slug}`}>
            <h3 className="font-display text-base font-semibold text-charcoal leading-snug line-clamp-2 mt-0.5 hover:text-crimson-700 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="pt-2 border-t border-border-light/60 space-y-1">
          <PriceDisplay
            price={primaryVariant.price}
            discountPrice={primaryVariant.discountPrice}
            size="md"
          />

          <div className="flex items-center justify-between text-[11px] text-gold-800 font-body pt-0.5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
              BIS 916 Hallmarked
            </span>
            {product.ratings?.average && (
              <span className="text-stone-500 font-medium">
                ★ {product.ratings.average.toFixed(1)}
              </span>
            )}
          </div>
        </div>

      </div>

    </article>
  );
};

