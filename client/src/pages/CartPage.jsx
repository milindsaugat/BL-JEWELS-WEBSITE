import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ShoppingBag, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { paymentService } from '../services/api';
import { formatCurrency } from '../lib/utils';
import { PriceDisplay } from '../components/common/PriceDisplay';

export const CartPage = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
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
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      openAuthModal('checkout');
      return;
    }
    navigate('/checkout');
  };

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
        setCouponError(res.message || 'Invalid coupon code');
      }
    } catch {
      // Fallback discount
      const code = couponInput.trim().toUpperCase();
      if (code === 'SHUBH10' || code === 'WELCOME5') {
        const pct = code === 'SHUBH10' ? 10 : 5;
        const calc = Math.min((subtotal * pct) / 100, 15000);
        applyCoupon({ code, discountType: 'percentage', value: pct, calculatedDiscount: calc });
        setCouponInput('');
      } else {
        setCouponError('Invalid coupon code. Try SHUBH10');
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-24 bg-pearl min-h-[70vh] flex items-center justify-center">
        <div className="container-bl text-center max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-ivory border border-gold-300 flex items-center justify-center text-gold-600 shadow-gold-sm">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Your Shopping Bag is Empty</h1>
          <p className="text-xs sm:text-sm text-stone-500 font-body leading-relaxed">
            Begin curating your auspicious fine jewelry trousseau. Explore BIS 916 hallmarked bridal sets, mangalsutras, and solitaires.
          </p>
          <Link
            to="/collections"
            className="inline-block px-8 py-3.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25"
          >
            Explore Fine Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-pearl min-h-screen">
      <div className="container-bl">
        
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#930303] mb-8">
          Your Shopping Bag ({items.length} {items.length === 1 ? 'Design' : 'Designs'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Items Table / List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => {
              const variantKey = item.variant?.sku || item.variant?.label;
              return (
                <div
                  key={`${item.product._id}-${variantKey}`}
                  className="bg-white rounded-2xl p-4 sm:p-6 border border-border-light shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.product.images?.[0]?.url || item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 rounded-xl object-cover border border-gold-200/50 shrink-0 bg-parchment"
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="text-[10px] font-accent uppercase text-gold-700 font-bold tracking-wider">
                        {item.product.metal?.karat || '22K'} Gold • {item.variant?.label}
                      </span>
                      <Link to={`/products/${item.product.slug}`} className="block">
                        <h3 className="font-display text-base sm:text-lg font-semibold text-charcoal truncate hover:text-[#930303] transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <PriceDisplay price={item.price} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-border-light">
                    {/* Stepper */}
                    <div className="flex items-center border border-border-light rounded-xl overflow-hidden bg-pearl">
                      <button
                        onClick={() => updateQuantity(item.product._id, variantKey, item.quantity - 1)}
                        className="p-2 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-charcoal font-body">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product._id, variantKey, item.quantity + 1)}
                        className="p-2 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total item price */}
                    <span className="font-accent text-base font-bold text-[#930303] shrink-0">
                      ₹{formatCurrency(item.price * item.quantity)}
                    </span>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.product._id, variantKey)}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-2">
              <Link to="/collections" className="text-xs font-semibold text-[#930303] hover:underline font-body">
                ← Continue Exploring Collections
              </Link>
              <button onClick={clearCart} className="text-xs text-stone-400 hover:text-stone-700 font-body">
                Clear All
              </button>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gold-300/60 shadow-gold-sm space-y-5">
              <h2 className="font-accent text-sm font-bold text-charcoal tracking-wider uppercase pb-3 border-b border-border-light">
                Order Valuation Summary
              </h2>

              {/* Coupon Form */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between bg-gold-50 border border-gold-300 rounded-xl px-3.5 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-gold-900 font-medium font-body">
                      <Tag className="w-4 h-4 text-gold-600" />
                      <span>Coupon <strong>{coupon.code}</strong></span>
                      <span className="text-emerald-700">(-₹{formatCurrency(discount)})</span>
                    </div>
                    <button onClick={removeCoupon} className="text-stone-500 hover:text-stone-800 text-xs underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (SHUBH10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-pearl border border-border-light rounded-xl text-xs uppercase placeholder-stone-400 focus:outline-none focus:border-gold-400"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-4 py-2 bg-charcoal text-white rounded-xl text-xs font-semibold font-body hover:bg-stone-800 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-600 mt-1 font-body">{couponError}</p>}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-stone-600 font-body pt-2 border-t border-border-light">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal">₹{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Auspicious Discount</span>
                    <span>-₹{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (3% Indian Jewelry)</span>
                  <span>₹{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Express Shipping</span>
                  <span>{shipping === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-charcoal border-t border-border-light pt-3">
                  <span>Total Payable</span>
                  <span className="font-accent text-lg text-[#930303]">₹{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 font-body text-center">
                <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0" />
                <span>100% BIS 916 Hallmark • Secured Payment</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

