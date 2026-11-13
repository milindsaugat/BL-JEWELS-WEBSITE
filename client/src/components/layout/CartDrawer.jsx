import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { couponService } from '../../services/api';
import { formatCurrency } from '../../lib/utils';
import { PriceDisplay } from '../common/PriceDisplay';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export const CartDrawer = () => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    getShipping,
    getTax,
    getTotal,
    coupon,
    discount,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showOffers, setShowOffers] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();

  const freeShippingThreshold = 5000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Concurrent fetch of public active coupons when drawer opens
  useEffect(() => {
    if (!isDrawerOpen) return;
    let isMounted = true;
    setLoadingCoupons(true);

    couponService.getPublicCoupons()
      .then((res) => {
        if (isMounted && res.coupons) {
          setAvailableCoupons(res.coupons);
        }
      })
      .catch((err) => {
        console.warn('Failed to load public coupons:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoadingCoupons(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isDrawerOpen]);

  // Dynamic check: Has applied coupon fallen below minOrderValue?
  const couponShortfall = coupon && coupon.minOrderValue && subtotal < coupon.minOrderValue
    ? coupon.minOrderValue - subtotal
    : 0;

  const executeApplyCoupon = async (codeToApply) => {
    if (!codeToApply || !codeToApply.trim()) return;

    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await couponService.validateCoupon({
        code: codeToApply.trim(),
        cartTotal: subtotal,
      });

      if (res.success && res.coupon) {
        applyCoupon(res.coupon);
        setCouponInput('');
        setCouponSuccess(res.message || `Code ${res.coupon.code} applied successfully!`);
        setShowOffers(false);
      } else {
        setCouponError(res.message || 'Unable to apply coupon.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Invalid or expired coupon code.';
      setCouponError(errMsg);
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyForm = (e) => {
    e.preventDefault();
    executeApplyCoupon(couponInput);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      openAuthModal('checkout');
      return;
    }
    closeDrawer();
    navigate('/checkout');
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-pearl shadow-2xl flex flex-col border-l border-gold-300/40">
          
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-border-light bg-ivory flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#930303]" />
              <h2 className="font-display text-xl font-bold text-charcoal">
                Your Shopping Bag
              </h2>
              <span className="text-xs font-medium text-stone-500 font-body">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-full text-stone-500 hover:text-charcoal hover:bg-parchment/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-gold-50/80 px-5 py-3 border-b border-gold-200/50">
            <div className="flex items-center justify-between text-xs font-medium text-stone-700 mb-1.5">
              <span>
                {subtotal >= freeShippingThreshold ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    ✓ You have qualified for FREE Express Insured Shipping!
                  </span>
                ) : (
                  <span>
                    Add ₹{formatCurrency(freeShippingThreshold - subtotal)} more for <strong>FREE Insured Shipping</strong>
                  </span>
                )}
              </span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-500 to-[#930303] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-ivory border border-gold-200 flex items-center justify-center text-gold-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-display text-lg font-semibold text-charcoal">Your bag is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto font-body">
                  Explore our BIS 916 hallmarked collections and add pure auspicious jewels to your trousseau.
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/collections');
                  }}
                  className="px-6 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white text-xs font-medium font-body rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              items.map((item) => {
                const variantKey = item.variant?.sku || item.variant?.label;
                return (
                  <div
                    key={`${item.product._id}-${variantKey}`}
                    className="flex gap-3 bg-white p-3 rounded-xl border border-border-light shadow-sm"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-parchment rounded-lg overflow-hidden shrink-0 border border-gold-200/40">
                      <img
                        src={item.product.images?.[0]?.url || item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-display text-sm font-semibold text-charcoal truncate">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product._id, variantKey)}
                            className="text-stone-400 hover:text-red-600 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-500 font-body">
                          {item.variant?.label || `${item.product.metal?.karat || '22K'} Gold`}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-border-light rounded-lg overflow-hidden bg-pearl">
                          <button
                            onClick={() => updateQuantity(item.product._id, variantKey, item.quantity - 1)}
                            className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-charcoal font-body">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product._id, variantKey, item.quantity + 1)}
                            className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-body text-sm font-bold text-[#930303]">
                          ₹{formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-4 md:p-5 border-t border-border-light bg-white space-y-3.5 shadow-lg">
              
              {/* Dynamic Coupon Area */}
              <div className="space-y-2">
                
                {coupon ? (
                  <div className="bg-gradient-to-r from-emerald-50 to-gold-50/40 border border-emerald-300/80 rounded-xl p-3 text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-bold font-body flex-wrap">
                        <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 text-xs font-bold">
                          {coupon.code}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.value}% OFF`
                            : `Flat ₹${formatCurrency(coupon.value || discount)} OFF`}
                        </span>
                        <span className="text-emerald-700 font-bold ml-1">
                          (-₹{formatCurrency(discount)})
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-stone-400 hover:text-rose-600 text-[11px] font-semibold underline transition-colors cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    </div>

                    {couponShortfall > 0 ? (
                      <p className="text-[11px] text-amber-700 flex items-center gap-1 font-medium bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>
                          Cart is ₹{formatCurrency(couponShortfall)} below min. order of ₹{formatCurrency(coupon.minOrderValue)} for this offer.
                        </span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-700">
                        ✓ {coupon.title || 'Auspicious festive discount applied'}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Manual Coupon Input Form */}
                    <form onSubmit={handleApplyForm} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Enter Promo Code (e.g. SHUBH10)"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs uppercase font-mono font-bold placeholder-stone-400 focus:outline-none focus:border-[#930303] focus:ring-1 focus:ring-[#930303]"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isApplying || !couponInput.trim()}
                        className="px-4 py-2 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-bold font-body transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                      >
                        {isApplying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Apply</span>
                      </button>
                    </form>

                    {/* Toggle Available Auspicious Offers Drawer */}
                    {availableCoupons.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowOffers(!showOffers)}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-gold-50/60 hover:bg-gold-100/60 border border-gold-200/70 text-[11px] font-semibold text-stone-800 transition-colors"
                      >
                        <span className="flex items-center gap-1.5 text-stone-800">
                          <Sparkles className="w-3.5 h-3.5 text-[#C9A44A]" />
                          <span>View Auspicious Offers ({availableCoupons.length})</span>
                        </span>
                        {showOffers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {/* Available Offers Cards */}
                    {showOffers && availableCoupons.length > 0 && (
                      <div className="space-y-2 p-2 bg-[#FAF7F2] rounded-xl border border-stone-200 max-h-48 overflow-y-auto">
                        {availableCoupons.map((c) => {
                          const qualifies = subtotal >= (c.minOrderValue || 0);
                          const needed = (c.minOrderValue || 0) - subtotal;
                          return (
                            <div
                              key={c.code}
                              className="p-2.5 bg-white rounded-lg border border-stone-200 flex items-center justify-between gap-2 shadow-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-xs text-[#930303] tracking-wide">
                                    {c.code}
                                  </span>
                                  <span className="text-[10px] bg-gold-100 text-stone-800 px-1.5 py-0.5 rounded font-bold">
                                    {c.discountType === 'percentage' ? `${c.value}% OFF` : `₹${formatCurrency(c.value)} OFF`}
                                  </span>
                                </div>
                                <p className="text-[10px] text-stone-500 truncate mt-0.5">
                                  {c.title || `Min order ₹${formatCurrency(c.minOrderValue)}`}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => executeApplyCoupon(c.code)}
                                disabled={isApplying}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                                  qualifies
                                    ? 'bg-[#930303] text-white hover:bg-[#7A0303] shadow-xs'
                                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200 border border-stone-200'
                                }`}
                              >
                                {qualifies ? 'Apply' : `+₹${formatCurrency(needed)}`}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Error Notice */}
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium font-body flex items-center gap-1 bg-rose-50 p-2 rounded-lg border border-rose-200 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{couponError}</span>
                  </p>
                )}

                {/* Success Notice */}
                {couponSuccess && (
                  <p className="text-[11px] text-emerald-700 font-medium font-body flex items-center gap-1 bg-emerald-50 p-2 rounded-lg border border-emerald-200 animate-in fade-in">
                    <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>{couponSuccess}</span>
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 font-body border-t border-border-light pt-2.5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>
                        {coupon?.discountType === 'percentage'
                          ? `Festive Coupon (${coupon?.code} • ${coupon?.value}% OFF)`
                          : `Festive Coupon (${coupon?.code} • Flat ₹${formatCurrency(coupon?.value || discount)} OFF)`}
                      </span>
                    </span>
                    <span>-₹{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>GST (3% Jewelry)</span>
                  <span>₹{formatCurrency(tax)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Insured Armored Shipping</span>
                  <span>{shipping === 0 ? <strong className="text-emerald-700 font-bold">FREE</strong> : `₹${shipping}`}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-border-light pt-2">
                  <span>Total Payable</span>
                  <span className="font-body text-base font-bold text-[#930303]">
                    ₹{formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] text-white rounded-xl text-xs font-semibold font-body tracking-wide transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500 font-body">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                <span>BIS 916 Guaranteed • 256-bit Encrypted Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
