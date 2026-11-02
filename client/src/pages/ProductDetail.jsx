import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Truck,
  RefreshCw,
  Heart,
  ShoppingBag,
  Share2,
  ChevronRight,
  Sparkles,
  CreditCard,
  CheckCircle2,
  Plus,
  Minus
} from 'lucide-react';
import { productService } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { HallmarkBadge } from '../components/common/HallmarkBadge';
import { StarRating } from '../components/common/StarRating';
import { ProductCard } from '../components/product/ProductCard';
import { formatCurrency } from '../lib/utils';

export const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);

  const { addToCart, openDrawer } = useCartStore();
  const { wishlist, toggleWishlist } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const res = await productService.getProductBySlug(slug);
        if (res.product) {
          setProduct(res.product);
          setSelectedImageIdx(0);
          setSelectedVariantIdx(0);
          setQuantity(1);
        }
        if (res.related) {
          setRelated(res.related);
        }
      } catch (err) {
        console.error('Fetch product detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center bg-pearl min-h-screen">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-xs font-body text-stone-500">Unveiling fine jewelry details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center bg-pearl min-h-screen space-y-4">
        <h2 className="font-display text-2xl font-bold text-charcoal">Masterpiece Not Found</h2>
        <p className="text-xs text-stone-500 font-body">This piece may have been reserved or moved to our private vault.</p>
        <Link to="/collections" className="inline-block px-6 py-2.5 bg-crimson-700 text-white rounded-lg text-xs font-medium font-body">
          Explore Fine Collections
        </Link>
      </div>
    );
  }

  const isFav = wishlist.includes(product._id);
  const variants = product.variants || [];
  const currentVariant = variants[selectedVariantIdx] || variants[0] || {};
  const images = product.images?.length ? product.images : [{ url: product.image }];
  const currentPrice = currentVariant.discountPrice || currentVariant.price;

  // Calculate approximate 3-month EMI
  const emiPerMonth = Math.round(currentPrice / 3);

  const handleAddToCart = () => {
    addToCart(product, currentVariant, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, currentVariant, quantity);
    navigate('/checkout');
  };

  return (
    <div className="py-8 bg-pearl min-h-screen">
      <div className="container-bl">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 font-body mb-8">
          <Link to="/" className="hover:text-crimson-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link to="/collections" className="hover:text-crimson-700">Collections</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          {product.categorySlug && (
            <>
              <Link to={`/collections/${product.categorySlug}`} className="hover:text-crimson-700 capitalize">
                {product.categorySlug}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </>
          )}
          <span className="font-semibold text-charcoal truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Top Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Stage Image */}
            <div className="relative aspect-square bg-parchment rounded-3xl overflow-hidden border border-gold-300/60 shadow-md group">
              <img
                src={images[selectedImageIdx]?.url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                <HallmarkBadge purity={product.metal?.purity || '916'} karat={product.metal?.karat || '22K'} />
                {product.isNewArrival && (
                  <span className="bg-crimson-700 text-white font-body text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-pill shadow-sm">
                    New Design
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`absolute top-4 right-4 z-10 p-3 rounded-full backdrop-blur-md transition-all shadow-md ${
                  isFav
                    ? 'bg-crimson-700 text-white'
                    : 'bg-white/90 text-stone-700 hover:bg-white hover:text-crimson-700'
                }`}
                title={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIdx === idx
                        ? 'border-crimson-700 shadow-crimson scale-105'
                        : 'border-border-light hover:border-gold-400 opacity-80'
                    }`}
                  >
                    <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Assurance Card Below Gallery */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <ShieldCheck className="w-5 h-5 text-gold-600 mx-auto mb-1" />
                <p className="font-body text-[11px] font-bold text-stone-800">BIS 916</p>
                <p className="text-[10px] text-stone-500 font-body">100% Certified Purity</p>
              </div>
              <div>
                <Truck className="w-5 h-5 text-gold-600 mx-auto mb-1" />
                <p className="font-body text-[11px] font-bold text-stone-800">FREE INSURED</p>
                <p className="text-[10px] text-stone-500 font-body">Blue Dart Express</p>
              </div>
              <div>
                <RefreshCw className="w-5 h-5 text-gold-600 mx-auto mb-1" />
                <p className="font-body text-[11px] font-bold text-stone-800">15 DAYS</p>
                <p className="text-[10px] text-stone-500 font-body">Easy Returns</p>
              </div>
              <div>
                <Award className="w-5 h-5 text-gold-600 mx-auto mb-1" />
                <p className="font-body text-[11px] font-bold text-stone-800">LIFETIME</p>
                <p className="text-[10px] text-stone-500 font-body">Gold Buyback</p>
              </div>
            </div>

          </div>

          {/* Right Column: Info & Purchase Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header info */}
            <div className="space-y-2 border-b border-border-light pb-5">
              <div className="flex items-center justify-between">
                <span className="font-accent text-xs font-bold text-gold-800 tracking-wider uppercase">
                  {product.metal?.karat || '22K'} {product.metal?.color?.toUpperCase() || 'YELLOW'} GOLD
                </span>
                <span className="text-xs text-stone-400 font-body">
                  SKU: {currentVariant.sku || product.sku || 'BLJ-HEIRLOOM'}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold text-charcoal leading-tight">
                {product.name}
              </h1>

              {product.ratings && (
                <div className="pt-1">
                  <StarRating rating={product.ratings.average} count={product.ratings.count} size="md" />
                </div>
              )}
            </div>

            {/* Pricing Area */}
            <div className="bg-ivory rounded-2xl p-5 border border-gold-300/50 space-y-2">
              <PriceDisplay
                price={currentVariant.price}
                discountPrice={currentVariant.discountPrice}
                size="xl"
              />
              <p className="text-xs text-stone-500 font-body">
                Inclusive of all taxes & 3% GST. Price subject to daily bullion market rates.
              </p>

              {/* EMI Note */}
              <div className="pt-2 flex items-center gap-2 text-xs font-medium text-stone-700 font-body border-t border-border-light/60">
                <CreditCard className="w-4 h-4 text-gold-700 shrink-0" />
                <span>
                  No Cost EMI options available from <strong>₹{formatCurrency(emiPerMonth)}/month</strong>
                </span>
              </div>
            </div>

            {/* Metal & Karat Specs Bar */}
            <div className="grid grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-border-light text-center">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-body">Purity</span>
                <span className="font-body text-xs font-bold text-charcoal">{product.metal?.purity || '916'} Hallmarked</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-body">Gross Weight</span>
                <span className="font-body text-xs font-bold text-charcoal">{currentVariant.weight || '48.5'} grams</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-body">Stone</span>
                <span className="font-body text-xs font-bold text-charcoal truncate block">{product.stone?.type || 'Certified'}</span>
              </div>
            </div>

            {/* Variant Selector */}
            {variants.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-800 font-body uppercase tracking-wider block">
                  Select Weight & Configuration:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={`p-3 rounded-xl border text-left font-body transition-all ${
                        selectedVariantIdx === idx
                          ? 'border-crimson-700 bg-crimson-50/50 shadow-sm'
                          : 'border-border-light bg-white hover:border-gold-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-charcoal">{v.label || `${v.weight}g`}</span>
                        {selectedVariantIdx === idx && (
                          <CheckCircle2 className="w-4 h-4 text-crimson-700" />
                        )}
                      </div>
                      <span className="text-xs text-crimson-700 font-body font-bold mt-1 block">
                        ₹{formatCurrency(v.discountPrice || v.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                
                {/* Quantity */}
                <div className="flex items-center border border-border-light rounded-xl overflow-hidden bg-white shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-stone-100 text-stone-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-charcoal font-body">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-stone-100 text-stone-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 bg-gradient-to-r from-crimson-700 to-crimson-600 hover:from-crimson-800 hover:to-crimson-700 text-white rounded-xl text-xs sm:text-sm font-semibold tracking-wider font-body shadow-crimson transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Bag</span>
                </button>

              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-white hover:bg-gold-50/70 text-charcoal border-2 border-gold-400 hover:border-gold-500 rounded-xl text-xs sm:text-sm font-semibold tracking-wider font-body shadow-gold-sm transition-all"
              >
                Instant Buy Now
              </button>

            </div>

            {/* Concierge & Sizing Help */}
            <div className="pt-4 border-t border-border-light flex items-center justify-between text-xs text-stone-600 font-body">
              <span>Need bespoke sizing or bridal consultation?</span>
              <Link to="/contact" className="font-semibold text-crimson-700 hover:underline">
                Ask Boutique Concierge
              </Link>
            </div>

          </div>

        </div>

        {/* Product Details Tabs Section */}
        <div className="mt-16 bg-white rounded-3xl p-6 md:p-10 border border-border-light shadow-sm">
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-6 border-b border-border-light pb-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'description', label: 'Artisanal Story' },
              { id: 'specifications', label: 'Metal & Purity Specs' },
              { id: 'care', label: 'Jewelry Care Guide' },
              { id: 'certifications', label: 'BIS Hallmark Guarantee' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-accent text-xs md:text-sm tracking-wider uppercase font-semibold pb-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-crimson-700 text-crimson-700'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="pt-6 font-body text-xs sm:text-sm text-stone-600 leading-relaxed max-w-4xl">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p>{product.description}</p>
                <div className="pt-2 space-y-2">
                  <h4 className="font-display text-base font-bold text-charcoal">Celebration Occasions</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.occasion?.map((occ) => (
                      <span key={occ} className="bg-pearl border border-gold-200 px-3 py-1 rounded-pill text-xs capitalize text-stone-700">
                        {occ}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-pearl rounded-xl border border-border-light">
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Precious Metal</span>
                  <span className="font-semibold text-charcoal">{product.metal?.karat || '22K'} {product.metal?.color} Gold</span>
                </div>
                <div className="p-4 bg-pearl rounded-xl border border-border-light">
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Purity Benchmark</span>
                  <span className="font-semibold text-charcoal">BIS {product.metal?.purity || '916'} Hallmarked</span>
                </div>
                <div className="p-4 bg-pearl rounded-xl border border-border-light">
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Variant Weight</span>
                  <span className="font-semibold text-charcoal">{currentVariant.weight} grams</span>
                </div>
                <div className="p-4 bg-pearl rounded-xl border border-border-light">
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Gemstone Specs</span>
                  <span className="font-semibold text-charcoal">{product.stone?.type || 'Natural uncut gemstones'}</span>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-3">
                <p>
                  To preserve the royal luster and auspicious brilliance of your BL Jewels creations:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                  <li>Store in our signature velvet crimson box away from humidity.</li>
                  <li>Avoid direct contact with alcohol-based perfumes, hairsprays, or soaps.</li>
                  <li>Wipe gently after each wear using the complimentary microfiber cloth provided.</li>
                  <li>Enjoy lifetime complimentary cleaning at our Zaveri Bazaar boutique.</li>
                </ul>
              </div>
            )}

            {activeTab === 'certifications' && (
              <div className="space-y-4">
                <p>
                  Every piece in our catalog is governed by strict Bureau of Indian Standards (BIS) hallmark regulations. The laser-engraved hallmark guarantees the 22K (916) or 18K (750) fineness of the gold content.
                </p>
                <div className="p-4 bg-gold-50/70 border border-gold-300 rounded-xl text-gold-900 font-medium">
                  ✓ Certified with unique 6-digit HUID (Hallmark Unique Identification) stamped at licensed assay centers.
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-10 space-y-2">
              <span className="font-accent text-xs font-semibold text-gold-700 tracking-[0.2em] uppercase">
                Harmonious Pairings
              </span>
              <h2 className="font-display text-3xl font-bold text-crimson-900">
                You Might Also Adore
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
