import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { paymentService } from '../../services/api';
import { formatCurrency } from '../../lib/utils';
import { PriceDisplay } from '../common/PriceDisplay';

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
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();

  const freeShippingThreshold = 5000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplying(true);
    setCouponError('');
    try {
      const res = await paymentService.validateCoupon({
        code: couponInput.trim(),
        cartTotal: subtotal,
      });

      if (res.success) {
        applyCoupon(res.coupon);
        setCouponInput('');
      } else {
        setCouponError(res.message || 'Invalid coupon');
      }
    } catch (err) {
      // Local fallback coupon validation
      const code = couponInput.trim().toUpperCase();
      if (code === 'SHUBH10' || code === 'WELCOME5') {
        const pct = code === 'SHUBH10' ? 10 : 5;
        const calc = Math.min((subtotal * pct) / 100, 15000);
        applyCoupon({ code, discountType: 'percentage', value: pct, calculatedDiscount: calc });
        setCouponInput('');
      } else {
        setCouponError('Invalid coupon code. Try SHUBH10 or WELCOME5');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

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
              <ShoppingBag className="w-5 h-5 text-crimson-700" />
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
                className="h-full bg-gradient-to-r from-gold-500 to-crimson-600 transition-all duration-300 rounded-full"
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
                  className="px-6 py-2.5 bg-crimson-700 hover:bg-crimson-800 text-white text-xs font-medium font-body rounded-lg transition-colors shadow-sm"
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
                        <span className="font-body text-sm font-bold text-crimson-800">
                          ₹{formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout button */}
          {items.length > 0 && (
            <div className="p-4 md:p-5 border-t border-border-light bg-white space-y-4">
              
              {/* Coupon Code Input */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between bg-gold-50 border border-gold-300 rounded-lg px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-gold-900 font-medium font-body">
                      <Tag className="w-3.5 h-3.5 text-gold-600" />
                      <span>Code <strong>{coupon.code}</strong> applied</span>
                      <span className="text-emerald-700">(-₹{formatCurrency(discount)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-stone-400 hover:text-stone-700 text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code (SHUBH10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-pearl border border-border-light rounded-lg text-xs uppercase placeholder-stone-400 focus:outline-none focus:border-gold-400"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium font-body transition-colors disabled:opacity-50"
                    >
                      {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-600 mt-1 font-body">{couponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 font-body border-t border-border-light pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">₹{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>-₹{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (3% Jewelry)</span>
                  <span>₹{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Shipping</span>
                  <span>{shipping === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-border-light pt-2">
                  <span>Total Payable</span>
                  <span className="font-body text-base font-bold text-crimson-800">
                    ₹{formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-gradient-to-r from-crimson-700 to-crimson-600 hover:from-crimson-600 hover:to-crimson-500 text-white rounded-xl text-xs font-semibold font-body tracking-wide transition-all shadow-crimson flex items-center justify-center gap-2"
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

