import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  ChevronRight,
  Check,
  Package,
  ShieldCheck,
  X,
  ZoomIn,
  MapPin,
  Truck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { productService } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { ProductSlider } from '../components/product/ProductSlider';
import { readRecent, rememberProduct, recentKey } from '../lib/recentProducts';

const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0);

const moneyPrecise = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

export const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(0);
  const [photo, setPhoto] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [added, setAdded] = useState(false);

  // Accordion state - Default ALL OFF / CLOSED as requested
  const [openAccordions, setOpenAccordions] = useState({
    productDetails: false,
    studdedDetails: false,
    priceBreakup: false,
  });

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Delivery Pincode state
  const [pincodeInput, setPincodeInput] = useState(() => {
    try {
      return localStorage.getItem('bl_delivery_pincode') || '';
    } catch {
      return '';
    }
  });
  const [pincodeStatus, setPincodeStatus] = useState(null); // null | 'available' | 'unavailable' | 'invalid'

  const { user, isAuthenticated, wishlist, toggleWishlist } = useAuthStore();
  const { addToCart } = useCartStore();
  const { openAuthModal } = useUIStore();
  const userId = user?.id || user?._id;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setProduct(null);
    setRelated([]);
    setRecent([]);
    setSelected(0);
    setPhoto(0);
    setQuantity(1);
    setAdded(false);
    setZoom(false);

    productService
      .getProductsByIds(readRecent(localStorage, userId))
      .then((r) => {
        if (active) setRecent(r.products || []);
      })
      .catch(() => {});

    productService
      .getProductBySlug(slug)
      .then((r) => {
        if (!active) return;
        setProduct(r.product);
        setRelated(r.related || []);
        const index = r.product.variants?.findIndex((v) => v.isDefault && v.stock > 0);
        setSelected(index >= 0 ? index : Math.max(0, r.product.variants?.findIndex((v) => v.stock > 0)));
        rememberProduct(localStorage, userId, r.product._id);

        // Pre-validate saved pincode if present
        const savedPincode = localStorage.getItem('bl_delivery_pincode');
        if (savedPincode && savedPincode.length === 6) {
          checkPincodeDelivery(savedPincode, r.product);
        }
      })
      .catch((e) => {
        if (active) setError(e.response?.data?.message || 'Could not load this product. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, userId]);

  useEffect(() => {
    if (!zoom) return;
    const close = (e) => {
      if (e.key === 'Escape') setZoom(false);
    };
    document.addEventListener('keydown', close);
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', close);
      document.body.style.overflow = old;
    };
  }, [zoom]);

  const checkPincodeDelivery = (code, prod = product) => {
    const trimmed = (code || '').trim();
    if (!/^[0-9]{6}$/.test(trimmed)) {
      setPincodeStatus('invalid');
      return;
    }
    try {
      localStorage.setItem('bl_delivery_pincode', trimmed);
    } catch {}

    const allowed = prod?.serviceablePincodes;
    if (Array.isArray(allowed) && allowed.length > 0) {
      if (allowed.includes(trimmed)) {
        setPincodeStatus('available');
      } else {
        setPincodeStatus('unavailable');
      }
    } else {
      // Pan-India delivery default
      setPincodeStatus('available');
    }
  };

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    checkPincodeDelivery(pincodeInput, product);
  };

  if (loading) {
    return (
      <div className="container-bl py-10 grid md:grid-cols-2 gap-8 animate-pulse" aria-label="Loading product">
        <div className="aspect-square rounded-3xl bg-stone-100" />
        <div className="space-y-5 pt-8">
          <div className="h-10 bg-stone-100 rounded-xl" />
          <div className="h-24 bg-stone-100 rounded-xl" />
          <div className="h-44 bg-stone-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-display text-stone-900">Product unavailable</h1>
        <p role="alert" className="text-stone-500 my-4 text-sm">
          {error || 'This royal creation is currently unavailable.'}
        </p>
        <Link to="/collections" className="text-[#930303] underline text-sm font-semibold">
          Browse jewellery
        </Link>
      </div>
    );
  }

  const variants = product.variants || [];
  const v = variants[selected] || {};
  const stock = Math.max(0, v.stock || 0);
  const price = v.discountPrice ?? v.price;
  const images = product.images || [];
  const image = images[photo] || images[0];
  const isFav = wishlist.includes(product._id);
  const canBuy = stock > 0 && Number.isFinite(price) && price > 0;

  const chooseOption = (i) => {
    setSelected(i);
    setQuantity(1);
    setAdded(false);
    const chosenVariant = variants[i];
    // If chosen variant has its own image, match and set photo
    if (chosenVariant?.image) {
      const imgIdx = images.findIndex((img) => img.url === chosenVariant.image);
      if (imgIdx >= 0) {
        setPhoto(imgIdx);
      }
    }
  };

  const add = (buy = false) => {
    if (!canBuy) return;
    addToCart(product, v, Math.min(stock, quantity));
    setAdded(true);
    if (buy) navigate(isAuthenticated ? '/checkout' : '/auth?next=checkout');
  };

  // Jewelry Specification Values (with user-provided sample fallbacks)
  const labelName = product.labelName || 'Set 18Kt';
  const branchLocation = product.branchLocation || 'Agra, Uttar Pradesh';
  const groupName = product.groupName || '18Kt Gold Ornaments';
  const varietyName = product.varietyName || 'TURK';
  const netWeight = product.netWeight || v.weight || 17.09;
  const grossWeight = product.grossWeight || product.netWeight || v.weight || 17.09;
  const pieces = product.pieces || 3;
  const labourRate = product.labourRate || 548.7;
  const labourPercent = product.labourPercent || 5.0;
  const todaysRate = product.todaysRate || 10974.0;
  const jewelType = product.jewelType || 'FLAT SET';
  const categoryName = product.categoryName || product.category?.name || 'Set';

  // Studded Details
  const studdedStyleName = product.studdedDetails?.styleName || 'Other Charges [H]';
  const studSalesAmount = product.studdedDetails?.studSalesAmount ?? 300.0;
  const salesAmount = product.studdedDetails?.salesAmount ?? 300.0;

  // Price Breakup Values
  const metalAmount = product.priceBreakup?.metalAmount || Math.round((price || 0) * 0.92);
  const otherCharge = product.priceBreakup?.otherCharge ?? 300.0;
  const makingCharge = product.priceBreakup?.makingCharge || Math.round((price || 0) * 0.05);
  const gstAmount = product.priceBreakup?.gstAmount || Math.round((price || 0) * 0.03);
  const grandTotal = product.priceBreakup?.grandTotal || price || (metalAmount + otherCharge + makingCharge + gstAmount);

  return (
    <main className="bg-[#FFFEFC]">
      <div className="container-bl py-5 sm:py-8">
        
        {/* ── Breadcrumb Navigation ── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 mb-6 overflow-hidden font-body">
          <Link to="/" className="hover:text-[#930303] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/collections" className="hover:text-[#930303] transition-colors">Jewellery</Link>
          <ChevronRight size={12} />
          <span className="truncate text-stone-800 font-medium">{product.name}</span>
        </nav>

        {/* ── Top Hero: Gallery (Cover Image) + Buying Panel ── */}
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-14 items-start">
          
          {/* Left: Product Media Gallery */}
          <section className="lg:sticky lg:top-36 space-y-4">
            
            {/* Main Luxury Frame - Full Cover Display */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square rounded-3xl overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#F2ECE4] border border-[#E9DED2] shadow-sm group">
              <button
                type="button"
                aria-label="Zoom product image"
                className="block w-full h-full cursor-zoom-in overflow-hidden"
                onClick={() => setZoom(true)}
              >
                {image?.url ? (
                  <img
                    src={image.url}
                    alt={image.alt || product.name}
                    fetchPriority="high"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 font-body text-sm">
                    Image unavailable
                  </div>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                aria-label={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={isFav}
                onClick={() => (isAuthenticated ? toggleWishlist(product._id) : openAuthModal('wishlist', product._id))}
                className="absolute right-4 top-4 bg-white/95 hover:bg-white backdrop-blur-sm rounded-full p-3 shadow-md hover:scale-105 transition-all cursor-pointer z-10"
              >
                <Heart
                  size={20}
                  fill={isFav ? '#930303' : 'none'}
                  className={isFav ? 'text-[#930303]' : 'text-stone-700'}
                />
              </button>

              {/* Zoom Pill */}
              <span className="absolute left-4 bottom-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-[11px] font-medium text-stone-700 flex items-center gap-1.5 shadow-xs pointer-events-none">
                <ZoomIn size={14} className="text-[#930303]" />
                <span>Tap to expand</span>
              </span>

              {/* Combo Pill */}
              {product.productType === 'combo' && (
                <span className="absolute left-4 top-4 text-xs font-semibold rounded-full bg-[#930303] text-white px-3.5 py-1.5 shadow-sm">
                  Full Jewellery Set
                </span>
              )}
            </div>

            {/* Gallery Thumbnails Carousel */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((im, i) => (
                  <button
                    key={im._id || i}
                    aria-label={`View photo ${i + 1}`}
                    aria-pressed={photo === i}
                    onClick={() => setPhoto(i)}
                    className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-stone-100 ${
                      photo === i
                        ? 'border-[#930303] ring-2 ring-[#930303]/20 shadow-md scale-100'
                        : 'border-stone-200 opacity-75 hover:opacity-100 hover:border-stone-400'
                    }`}
                  >
                    <img
                      src={im.url}
                      alt={im.alt || `Product thumbnail ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Right: Product Actions & Pricing */}
          <section className="space-y-6">
            
            {/* Header / Badges */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-accent text-[11px] uppercase tracking-[0.22em] text-[#C9A13B] font-semibold">
                  {product.category?.name || 'Exclusive Royal Creation'}
                </span>
                <span className="text-stone-300">•</span>
                <span className="font-body text-xs text-stone-500 font-medium">
                  {v.karat || product.metal?.karat || '22K'} Pure Gold
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-stone-900 mt-2 leading-tight">
                {product.name}
              </h1>

              {product.shortDescription && (
                <p className="text-xs sm:text-sm text-stone-500 font-body leading-relaxed mt-2.5">
                  {product.shortDescription}
                </p>
              )}

              {product.ratings?.count > 0 && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-stone-600 font-body">
                  <span className="text-amber-500">★</span>
                  <span className="font-semibold text-stone-800">{product.ratings.average}</span>
                  <span className="text-stone-400">({product.ratings.count} verified patron reviews)</span>
                </div>
              )}
            </div>

            {/* Price Banner */}
            <div className="p-4 sm:p-5 bg-[#FAF7F2] rounded-2xl border border-[#E9DED2]/80 space-y-1">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold font-display text-[#930303]">
                  {Number.isFinite(price) ? money(price) : 'Price unavailable'}
                </span>
                {v.discountPrice > 0 && v.discountPrice < v.price && (
                  <>
                    <del className="text-sm text-stone-400 font-body">{money(v.price)}</del>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full font-body">
                      Save {money(v.price - v.discountPrice)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-stone-500 font-body">
                Inclusive of all taxes & BIS Hallmarking certifications. Detailed price breakup provided below.
              </p>
            </div>

            {/* ── Choose Your Option with Variant Thumbnail Images ── */}
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <h2 className="font-semibold font-body text-stone-800 flex items-center gap-1.5">
                  <span>Choose your option</span>
                  <span className="text-stone-400 font-normal">({variants.length} available)</span>
                </h2>
                <span className={`text-xs font-semibold ${stock > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {stock > 0 ? `${stock} in vault` : 'Temporarily Reserved'}
                </span>
              </div>

              {/* Variant Cards with Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {variants.map((option, i) => {
                  const isOptSelected = i === selected;
                  const optImg = option.image || (images[i] ? images[i].url : image?.url);
                  const optPrice = option.discountPrice ?? option.price;

                  return (
                    <button
                      key={option._id || option.sku || i}
                      type="button"
                      onClick={() => chooseOption(i)}
                      aria-pressed={isOptSelected}
                      className={`flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isOptSelected
                          ? 'border-[#930303] bg-[#930303]/5 shadow-sm ring-1 ring-[#930303]'
                          : 'border-stone-200 hover:border-stone-400 bg-white'
                      } ${option.stock <= 0 ? 'opacity-60' : ''}`}
                    >
                      {/* Option Image Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        {optImg ? (
                          <img src={optImg} alt={option.label || option.sku} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">
                            BL
                          </div>
                        )}
                      </div>

                      {/* Option Meta */}
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold truncate ${isOptSelected ? 'text-[#930303]' : 'text-stone-800'}`}>
                          {option.label || [option.size, option.color, option.karat].filter(Boolean).join(' · ') || option.sku}
                        </p>
                        <p className="text-[11px] text-stone-500 font-body">
                          {option.weight ? `${option.weight}g weight` : option.size || option.sku}
                        </p>
                        <p className="text-xs font-bold text-stone-900 font-body mt-0.5">
                          {money(optPrice)}
                        </p>
                      </div>

                      {/* Radio dot */}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isOptSelected ? 'border-[#930303] bg-[#930303]' : 'border-stone-300'
                      }`}>
                        {isOptSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Quantity & Add to Bag / Buy Now ── */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                {/* Quantity selector */}
                <div className="flex items-center border border-stone-300 rounded-xl bg-white px-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => q - 1)}
                    className="p-2 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold font-body text-stone-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={quantity >= stock}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  type="button"
                  disabled={!canBuy}
                  onClick={() => add(false)}
                  className="flex-1 bg-[#930303] hover:bg-[#780303] text-white rounded-xl py-3.5 px-4 text-sm font-semibold font-body shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                  {added ? <Check size={18} /> : <ShoppingBag size={18} />}
                  <span>{added ? 'Added to bag' : 'Add to bag'}</span>
                </button>
              </div>

              {/* Buy Now */}
              <button
                type="button"
                disabled={!canBuy}
                onClick={() => add(true)}
                className="w-full bg-[#FAF7F2] hover:bg-[#F3EFEB] border-2 border-[#930303] text-[#930303] rounded-xl py-3 text-sm font-bold font-body transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Instant Buy Now
              </button>

              {added && (
                <p role="status" className="text-xs text-emerald-700 font-body flex items-center gap-1.5 pt-1">
                  <CheckCircle2 size={14} />
                  <span>Product successfully saved in your luxury cart.</span>
                </p>
              )}
            </div>

            {/* ── Delivery Pincode Checker ── */}
            <div className="p-4 bg-[#F8F5F0] rounded-2xl border border-[#E9DED2] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 uppercase tracking-wider font-accent">
                <Truck size={16} className="text-[#930303]" />
                <span>Armored Delivery & Availability</span>
              </div>

              <form onSubmit={handlePincodeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPincodeInput(val);
                      if (val.length === 6) checkPincodeDelivery(val, product);
                    }}
                    placeholder="Enter 6-digit delivery pincode"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-body text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#930303] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#930303] hover:bg-[#780303] text-white rounded-xl text-xs font-semibold font-body transition-colors cursor-pointer"
                >
                  Check
                </button>
              </form>

              {/* Status Display */}
              {pincodeStatus === 'available' && (
                <div className="text-[12px] text-emerald-800 font-body flex items-start gap-1.5 pt-1">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Delivery Available to {pincodeInput || 'your location'}</p>
                    <p className="text-stone-500 text-[11px]">
                      Complimentary Blue Dart Armored transit with 100% insurance. Dispatched within 24–48 hours.
                    </p>
                  </div>
                </div>
              )}

              {pincodeStatus === 'unavailable' && (
                <div className="text-[12px] text-amber-800 font-body flex items-start gap-1.5 pt-1">
                  <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Pincode {pincodeInput} not in direct route</p>
                    <p className="text-stone-500 text-[11px]">
                      Please contact our Royal Concierge for bespoke secure delivery arrangements.
                    </p>
                  </div>
                </div>
              )}

              {pincodeStatus === 'invalid' && (
                <p className="text-[11px] text-red-600 font-body">
                  Please enter a valid 6-digit Indian postal code.
                </p>
              )}
            </div>

            {/* Assurances Pill Ribbon */}
            <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 font-body">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#C9A13B]" />
                <span>100% BIS 916 Hallmarked</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Package size={16} className="text-[#C9A13B]" />
                <span>Insured Armored Dispatch</span>
              </span>
              <Link to="/contact" className="text-[#930303] underline font-medium">
                Need Help Choosing?
              </Link>
            </div>

          </section>
        </div>

        {/* ── SPECIFICATIONS ACCORDIONS & ABOUT THIS PIECE ── */}
        <div className="my-14 sm:my-16 space-y-8">
          
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
            
            {/* Left: About This Piece (Retained & Elevated) */}
            <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#930303] uppercase tracking-wider font-accent">
                <Sparkles size={15} className="text-[#C9A13B]" />
                <span>Archival Atelier Heritage</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl text-stone-900 leading-tight">
                About this piece
              </h2>
              <p className="text-sm leading-7 text-stone-600 font-body whitespace-pre-line">
                {product.description}
              </p>

              {/* Occasions / Auspicious tags */}
              {product.occasion?.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs uppercase tracking-wider text-stone-400 font-medium mb-2 font-accent">
                    Auspicious Occasions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.occasion.filter(Boolean).map((o) => (
                      <span
                        key={o}
                        className="text-xs capitalize bg-[#FAF7F2] border border-[#E9DED2] text-stone-800 px-3 py-1.5 rounded-full font-body font-medium"
                      >
                        {o.replaceAll('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Combo Set Components (if combo) */}
              {product.productType === 'combo' && product.comboItems?.length > 0 && (
                <div className="pt-4 border-t border-stone-100">
                  <h3 className="font-semibold text-sm text-stone-900 mb-3 font-body">Included In This Set</h3>
                  <div className="space-y-2.5">
                    {product.comboItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 text-xs font-body">
                        <div>
                          <p className="font-semibold text-stone-800">{item.product?.name || 'Set Component'}</p>
                          <p className="text-[11px] text-stone-500">Variant: {item.variantSku}</p>
                        </div>
                        <span className="px-2 py-1 bg-white border rounded-lg font-semibold">{item.quantity} pc</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Right: Technical Accordions (Product Details, Studded Details, Price Breakup) */}
            <div className="space-y-4">
              
              {/* 1. PRODUCT DETAILS ACCORDION */}
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('productDetails')}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50/70 transition-colors cursor-pointer"
                >
                  <span className="font-display text-lg sm:text-xl font-bold text-[#930303]">
                    Product Details
                  </span>
                  <span className="text-[#C9A13B]">
                    {openAccordions.productDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                </button>

                {openAccordions.productDetails && (
                  <div className="px-5 pb-6 pt-1 border-t border-stone-100">
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-xs sm:text-sm font-body">
                      <div>
                        <p className="text-stone-400 text-[11px] uppercase tracking-wider">Label/Tag Name</p>
                        <p className="font-semibold text-stone-800 mt-0.5">{labelName}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-[11px] uppercase tracking-wider">Branch Location</p>
                        <p className="font-semibold text-stone-800 mt-0.5">{branchLocation}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-[11px] uppercase tracking-wider">Group Name</p>
                        <p className="font-semibold text-stone-800 mt-0.5">{groupName}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-[11px] uppercase tracking-wider">Variety Name</p>
                        <p className="font-semibold text-stone-800 mt-0.5">{varietyName}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-[11px] uppercase tracking-wider">Net Weight</p>
                        <p className="font-semibold text-stone-800 mt-0.5">{Number(netWeight).toFixed(3)} gms</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-[11px] uppercase tracking-wider">Gross Weight</p>
                        <p className="font-semibold text-stone-800 mt-0.5">{Number(grossWeight).toFixed(2)} gms</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-[11px] uppercase tracking-wider">Pieces</p>
                        <p className="font-semibold text-stone-800 mt-0.5">{pieces}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-[11px] uppercase tracking-wider">Labour Rate</p>
                        <p className="font-semibold text-stone-800 mt-0.5">{moneyPrecise(labourRate)}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-[11px] uppercase tracking-wider">Labour %</p>
                        <p className="font-semibold text-stone-800 mt-0.5">{Number(labourPercent).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-[11px] uppercase tracking-wider">Today's Rate</p>
                        <p className="font-semibold text-stone-800 mt-0.5">{moneyPrecise(todaysRate)}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-[11px] uppercase tracking-wider">Type</p>
                        <p className="font-semibold text-stone-800 mt-0.5">{jewelType}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-[11px] uppercase tracking-wider">Category Name</p>
                        <p className="font-semibold text-stone-800 mt-0.5">{categoryName}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. STUDDED DETAILS ACCORDION */}
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('studdedDetails')}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50/70 transition-colors cursor-pointer"
                >
                  <span className="font-display text-lg sm:text-xl font-bold text-[#930303]">
                    Studded Details
                  </span>
                  <span className="text-[#C9A13B]">
                    {openAccordions.studdedDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                </button>

                {openAccordions.studdedDetails && (
                  <div className="px-5 pb-6 pt-1 border-t border-stone-100">
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200/80 space-y-3 font-body text-xs sm:text-sm">
                      <div className="inline-block px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-900 font-semibold rounded-lg text-xs">
                        {studdedStyleName}
                      </div>
                      <div className="flex justify-between items-center pt-1 border-b border-stone-200 pb-2">
                        <span className="text-stone-500">Style Name</span>
                        <span className="font-medium text-stone-900">{studdedStyleName}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                        <span className="text-stone-500">Stud Sales Amount</span>
                        <span className="font-medium text-stone-900">{Number(studSalesAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 font-medium">Sales Amount</span>
                        <span className="font-bold text-stone-900">{moneyPrecise(salesAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. PRICE BREAKUP ACCORDION */}
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('priceBreakup')}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50/70 transition-colors cursor-pointer"
                >
                  <span className="font-display text-lg sm:text-xl font-bold text-[#930303]">
                    Price Breakup
                  </span>
                  <span className="text-[#C9A13B]">
                    {openAccordions.priceBreakup ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                </button>

                {openAccordions.priceBreakup && (
                  <div className="px-5 pb-6 pt-1 border-t border-stone-100">
                    <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm font-body">
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-100">
                        <p className="text-stone-500 text-[11px]">Metal Amount</p>
                        <p className="text-sm font-bold text-stone-900 mt-1">{moneyPrecise(metalAmount)}</p>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-100">
                        <p className="text-stone-500 text-[11px]">Other Charge</p>
                        <p className="text-sm font-bold text-stone-900 mt-1">{moneyPrecise(otherCharge)}</p>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-100">
                        <p className="text-stone-500 text-[11px]">Making Charge</p>
                        <p className="text-sm font-bold text-stone-900 mt-1">{moneyPrecise(makingCharge)}</p>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-100">
                        <p className="text-stone-500 text-[11px]">GST Amt (aprx.)</p>
                        <p className="text-sm font-bold text-stone-900 mt-1">{moneyPrecise(gstAmount)}</p>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-[#930303]/5 rounded-xl border border-[#930303]/20 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-stone-500 font-body">Grand Total</p>
                        <p className="text-lg sm:text-xl font-bold font-display text-[#930303]">
                          {moneyPrecise(grandTotal)}
                        </p>
                      </div>
                      <span className="text-[11px] text-stone-500 font-body">
                        100% Transparency Guarantee
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ── Related & Recently Viewed ── */}
        <ProductSlider
          title="You may also like"
          subtitle="More pieces from this collection."
          products={related.filter((p) => p._id !== product._id)}
        />
        <ProductSlider
          title="Recently viewed"
          subtitle="Pieces you explored on this browser."
          products={recent.filter((p) => p._id !== product._id)}
          onClear={() => {
            try {
              localStorage.removeItem(recentKey(userId));
            } catch {}
            setRecent([]);
          }}
        />

      </div>

      {/* ── Zoom Dialog ── */}
      {zoom && image?.url && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product photo"
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setZoom(false)}
        >
          <button
            autoFocus
            aria-label="Close photo"
            onClick={() => setZoom(false)}
            className="absolute right-5 top-5 text-white p-3 hover:text-gold-400 transition-colors cursor-pointer"
          >
            <X size={26} />
          </button>
          <img
            onClick={(e) => e.stopPropagation()}
            src={image.url}
            alt={image.alt || product.name}
            className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </main>
  );
};
