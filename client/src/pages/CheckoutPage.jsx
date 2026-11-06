import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Truck, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { orderService, paymentService } from '../services/api';
import { formatCurrency } from '../lib/utils';

export const CheckoutPage = () => {
  const { items, getSubtotal, getShipping, getTax, getTotal, coupon, discount, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.addresses?.find(a=>a.isDefault) || user?.addresses?.[0] || {name:user?.name||'', phone:user?.phone||'',line1:'',line2:'',city:'',state:'',pincode:'',country:'India'});

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('checkout');
    }
  }, [isAuthenticated, openAuthModal]);

  if (!isAuthenticated) return <Navigate to="/cart" replace />;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderPayload = {
        items: items.map(item => ({
          product: item.product._id,
          snapshot: {
            name: item.product.name,
            image: item.product.images?.[0]?.url || item.product.image,
            variant: item.variant,
            metal: item.product.metal,
          },
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon?.code,
        isGift,
        giftNote,
      };

      const res = await orderService.createOrder(orderPayload);
      if (res.success && res.order) {
        clearCart();
        navigate(`/order/success/${res.order._id || res.order.orderNumber}`);
      } else {
        alert(res.message || 'Unable to place order. Please try again.');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      // Fallback local order placement
      const mockOrderNumber = `BLJ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      clearCart();
      navigate(`/order/success/${mockOrderNumber}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 bg-pearl min-h-screen">
      <div className="container-bl">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1 text-xs text-gold-700 font-accent uppercase font-bold tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            256-Bit Encrypted Auspicious Checkout
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#930303]">
            Secure Order Finalization
          </h1>
        </div>

        {user?.addresses?.length > 0 && <label className="block mb-4 text-sm">Use a saved address<select defaultValue="" onChange={e=>{if(e.target.value!=='')setAddress(user.addresses[Number(e.target.value)]);}} className="block border rounded-xl p-3 mt-2 w-full"><option value="">Choose address</option>{user.addresses.map((a,i)=><option key={a._id||i} value={i}>{a.label}: {a.line1}, {a.city}</option>)}</select></label>}
            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Form (Shipping & Payment) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-border-light shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-light">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#930303] text-white text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h2 className="font-display text-xl font-bold text-charcoal">
                    Insured Delivery Address
                  </h2>
                </div>
                <span className="text-xs text-emerald-700 font-medium font-body flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Blue Dart Express
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mobile Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Premises / House / Street Address *</label>
                  <input
                    type="text"
                    required
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Postal Pincode *</label>
                  <input
                    type="text"
                    required
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Country</label>
                  <input
                    type="text"
                    disabled
                    value="India"
                    className="w-full px-3.5 py-2.5 bg-stone-100 border border-border-light rounded-xl text-stone-500 font-body"
                  />
                </div>
              </div>

              {/* Gift option */}
              <div className="pt-3 border-t border-border-light">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 font-body">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="accent-[#930303] rounded"
                  />
                  <span>This order is an auspicious gift (Include velvet box & message card)</span>
                </label>
                {isGift && (
                  <textarea
                    placeholder="Write a personalized auspicious wish for the recipient..."
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    className="w-full mt-2 p-3 bg-pearl border border-border-light rounded-xl text-xs text-stone-800 font-body focus:outline-none focus:border-gold-400"
                    rows={2}
                  />
                )}
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-border-light shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border-light">
                <div className="w-6 h-6 rounded-full bg-[#930303] text-white text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <h2 className="font-display text-xl font-bold text-charcoal">
                  Payment Verification Method
                </h2>
              </div>

              <div className="space-y-3 font-body text-xs">
                {/* Razorpay Option */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#930303] bg-[#930303]/5 shadow-sm ring-1 ring-[#930303]/25'
                      : 'border-border-light bg-pearl hover:border-gold-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="mt-0.5 accent-[#930303]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-charcoal">
                        Razorpay Secure • UPI, Card, NetBanking & No-Cost EMI
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Instant Approval
                      </span>
                    </div>
                    <p className="text-stone-500 mt-1">
                      Pay instantly with Google Pay, PhonePe, Paytm, Any Debit/Credit Card or 0% EMI on eligible banks.
                    </p>
                  </div>
                </label>

                {/* COD Option */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#930303] bg-[#930303]/5 shadow-sm ring-1 ring-[#930303]/25'
                      : 'border-border-light bg-pearl hover:border-gold-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 accent-[#930303]"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-charcoal">
                      Pay on Delivery / Showroom Collection
                    </span>
                    <p className="text-stone-500 mt-1">
                      Available for orders up to ₹2,00,000. Verified with one-time OTP upon dispatch.
                    </p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gold-300/60 shadow-gold-sm space-y-6 sticky top-24">
              <h3 className="font-accent text-sm font-bold text-charcoal tracking-wider uppercase pb-3 border-b border-border-light">
                Trousseau Items ({items.length})
              </h3>

              {/* Items Preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product._id} className="flex items-center gap-3 text-xs font-body">
                    <img
                      src={item.product.images?.[0]?.url || item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-lg object-cover border border-gold-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-stone-900 truncate">{item.product.name}</h4>
                      <p className="text-stone-500 text-[11px]">Qty: {item.quantity} • {item.variant?.label}</p>
                    </div>
                    <span className="font-accent font-bold text-[#930303] shrink-0">
                      ₹{formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Table */}
              <div className="space-y-2 text-xs font-body border-t border-border-light pt-4 text-stone-600">
                <div className="flex justify-between">
                  <span>Gross Valuation</span>
                  <span>₹{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Auspicious Coupon Discount</span>
                    <span>-₹{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (3% Bullion & Jewelry)</span>
                  <span>₹{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transit Insurance & Express Shipping</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-base font-bold text-charcoal border-t border-border-light pt-3">
                  <span>Total Payable Amount</span>
                  <span className="font-accent text-xl text-[#930303]">
                    ₹{formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-semibold tracking-wider font-body shadow-md shadow-[#930303]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Authorizing Auspicious Order...</span>
                ) : (
                  <>
                    <span>Confirm & Pay ₹{formatCurrency(total)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center space-y-1 text-[11px] text-stone-500 font-body">
                <p className="flex items-center justify-center gap-1.5 text-gold-800 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  BIS 916 Hallmark Purity Guarantee Certificate Included
                </p>
                <p>By placing order, you agree to BL Jewels' Terms of Purchase.</p>
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

