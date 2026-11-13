import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Landmark,
  Truck,
  ArrowRight,
  ChevronDown,
  Copy,
  Check,
  UploadCloud,
  Loader2,
  QrCode,
  ZoomIn,
  X,
  AlertCircle,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { orderService, settingService, checkoutUploadService } from '../services/api';
import { formatCurrency } from '../lib/utils';

export const CheckoutPage = () => {
  const { items, getSubtotal, getShipping, getTax, getTotal, coupon, discount, clearCart } =
    useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState(
    user?.addresses?.find((a) => a.isDefault) ||
      user?.addresses?.[0] || {
        name: user?.name || '',
        phone: user?.phone || '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      }
  );

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'bank_transfer' | 'cod'
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [selectedBankIdx, setSelectedBankIdx] = useState(0);
  const [transactionId, setTransactionId] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [qrZoomSrc, setQrZoomSrc] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  const txInputRef = useRef(null);
  const qrDialogRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('checkout');
    }
  }, [isAuthenticated, openAuthModal]);

  useEffect(() => {
    let active = true;
    settingService
      .getSettings()
      .then((res) => {
        if (!active) return;
        const list = (res?.settings?.bankAccounts || []).filter((b) => b.isActive !== false);
        setBankAccounts(list);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingBanks(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const dlg = qrDialogRef.current;
    if (!dlg) return;
    if (qrZoomSrc && !dlg.open) dlg.showModal();
    else if (!qrZoomSrc && dlg.open) dlg.close();
  }, [qrZoomSrc]);

  if (!isAuthenticated) return <Navigate to="/cart" replace />;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();
  const activeBank = bankAccounts[selectedBankIdx] || bankAccounts[0] || null;

  const copyValue = (key, val) => {
    if (!val) return;
    navigator.clipboard?.writeText(val);
    setCopiedField(key);
    setTimeout(() => setCopiedField(''), 1800);
  };

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubmitError('');
    setUploadingProof(true);
    try {
      const res = await checkoutUploadService.uploadPaymentProof(file);
      if (res?.url) {
        setProofImage(res.url);
      } else {
        setSubmitError('Payment proof upload did not return a URL. Please try another image.');
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Failed to upload payment proof image. Please try again.'
      );
    } finally {
      setUploadingProof(false);
      e.target.value = '';
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (paymentMethod === 'bank_transfer') {
      if (!activeBank) {
        setSubmitError(
          'No active bank account is currently available for transfer. Please select Razorpay or Pay on Delivery.'
        );
        return;
      }
      if (transactionId.trim().length < 4) {
        setSubmitError('Please enter your valid Transaction ID / UTR reference number.');
        txInputRef.current?.focus();
        return;
      }
      if (!proofImage) {
        setSubmitError(
          'Please upload your payment proof screenshot / receipt before placing a Bank Transfer order.'
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        items: items.map((item) => ({
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
        ...(paymentMethod === 'bank_transfer'
          ? {
              bankTransfer: {
                transactionId: transactionId.trim(),
                proofImage,
                bankAccountId: activeBank?._id || '',
                bankLabel: activeBank?.label || '',
                bankName: activeBank?.bankName || '',
                accountNumberLast4: String(activeBank?.accountNumber || '').slice(-4),
              },
            }
          : {}),
        couponCode: coupon?.code,
        isGift,
        giftNote,
      };

      const res = await orderService.createOrder(orderPayload);
      if (res.success && res.order) {
        clearCart();
        navigate(`/order/success/${res.order._id || res.order.orderNumber}`);
      } else {
        setSubmitError(res.message || 'Unable to place order. Please try again.');
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          err.message ||
          'Unable to authorize your order. Please verify your details and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const bankProofReady =
    paymentMethod !== 'bank_transfer' ||
    (Boolean(activeBank) && transactionId.trim().length >= 4 && Boolean(proofImage));

  return (
    <div className="py-10 bg-pearl min-h-screen">
      <style>{`
        dialog.qr-zoom-dialog:modal { overscroll-behavior: contain; }
        dialog.qr-zoom-dialog::backdrop {
          background: rgba(20, 14, 11, 0.65);
          overflow: hidden;
          overscroll-behavior: contain;
        }
        details.pay-acc > summary::-webkit-details-marker { display: none; }
      `}</style>

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

        {user?.addresses?.length > 0 && (
          <label className="block mb-4 text-sm">
            Use a saved address
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value !== '') setAddress(user.addresses[Number(e.target.value)]);
              }}
              className="block border rounded-xl p-3 mt-2 w-full bg-white"
            >
              <option value="">Choose address</option>
              {user.addresses.map((a, i) => (
                <option key={a._id || i} value={i}>
                  {a.label}: {a.line1}, {a.city}
                </option>
              ))}
            </select>
          </label>
        )}

        <form onSubmit={handlePlaceOrder} method="POST" className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Form (Shipping & Payment Accordion) */}
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
                  <label htmlFor="chk-name" className="block font-semibold text-stone-700 mb-1">
                    Full Recipient Name *
                  </label>
                  <input
                    id="chk-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label htmlFor="chk-phone" className="block font-semibold text-stone-700 mb-1">
                    Mobile Contact Phone *
                  </label>
                  <input
                    id="chk-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="chk-line1" className="block font-semibold text-stone-700 mb-1">
                    Premises / House / Street Address *
                  </label>
                  <input
                    id="chk-line1"
                    name="line1"
                    type="text"
                    required
                    autoComplete="street-address"
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label htmlFor="chk-city" className="block font-semibold text-stone-700 mb-1">
                    City *
                  </label>
                  <input
                    id="chk-city"
                    name="city"
                    type="text"
                    required
                    autoComplete="address-level2"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label htmlFor="chk-state" className="block font-semibold text-stone-700 mb-1">
                    State *
                  </label>
                  <input
                    id="chk-state"
                    name="state"
                    type="text"
                    required
                    autoComplete="address-level1"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label htmlFor="chk-pin" className="block font-semibold text-stone-700 mb-1">
                    Postal Pincode *
                  </label>
                  <input
                    id="chk-pin"
                    name="pincode"
                    type="text"
                    required
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label htmlFor="chk-country" className="block font-semibold text-stone-700 mb-1">
                    Country
                  </label>
                  <input
                    id="chk-country"
                    type="text"
                    disabled
                    value="India"
                    className="w-full px-3.5 py-2.5 bg-stone-100 border border-border-light rounded-xl text-base sm:text-xs text-stone-500 font-body"
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
                    className="w-full mt-2 p-3 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-800 font-body focus:outline-none focus:border-gold-400"
                    rows={2}
                  />
                )}
              </div>
            </div>

            {/* Step 2: Exclusive Accordion Payment Method */}
            <section
              aria-labelledby="payment-method-heading"
              className="bg-white rounded-2xl p-6 md:p-8 border border-border-light shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-border-light">
                <div className="w-6 h-6 rounded-full bg-[#930303] text-white text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <h2 id="payment-method-heading" className="font-display text-xl font-bold text-charcoal">
                  Payment Verification Method
                </h2>
              </div>

              <div className="space-y-3 font-body text-xs">
                {/* Accordion 1: Razorpay Secure */}
                <details
                  name="payment-accordion"
                  open={paymentMethod === 'razorpay'}
                  className={`pay-acc rounded-xl border transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#930303] bg-[#930303]/[0.03] ring-1 ring-[#930303]/20'
                      : 'border-border-light bg-pearl hover:border-gold-300'
                  }`}
                >
                  <summary
                    aria-disabled={paymentMethod === 'razorpay'}
                    onClick={(e) => {
                      e.preventDefault();
                      setPaymentMethod('razorpay');
                      setSubmitError('');
                    }}
                    className="list-none flex items-center justify-between gap-3 p-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          paymentMethod === 'razorpay' ? 'border-[#930303]' : 'border-stone-400'
                        }`}
                      >
                        {paymentMethod === 'razorpay' && (
                          <span className="w-2 h-2 rounded-full bg-[#930303]" />
                        )}
                      </span>
                      <CreditCard className="w-4 h-4 text-[#930303] shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-sm text-charcoal">
                        Razorpay Secure · UPI, Cards, NetBanking & EMI
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Instant Approval
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-500 transition-transform ${
                          paymentMethod === 'razorpay' ? 'rotate-180 text-[#930303]' : ''
                        }`}
                      />
                    </div>
                  </summary>
                  <div className="px-4 pb-4 pt-1 border-t border-stone-200/70 text-stone-600 leading-relaxed">
                    Pay securely with Google Pay, PhonePe, Paytm UPI, any Indian Debit/Credit Card, NetBanking, or 0% No-Cost EMI.
                  </div>
                </details>

                {/* Accordion 2: Direct Bank Account / UPI QR Transfer */}
                <details
                  name="payment-accordion"
                  open={paymentMethod === 'bank_transfer'}
                  className={`pay-acc rounded-xl border transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[#930303] bg-[#930303]/[0.03] ring-1 ring-[#930303]/20'
                      : 'border-border-light bg-pearl hover:border-gold-300'
                  }`}
                >
                  <summary
                    aria-disabled={paymentMethod === 'bank_transfer'}
                    onClick={(e) => {
                      e.preventDefault();
                      setPaymentMethod('bank_transfer');
                      setSubmitError('');
                    }}
                    className="list-none flex items-center justify-between gap-3 p-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          paymentMethod === 'bank_transfer' ? 'border-[#930303]' : 'border-stone-400'
                        }`}
                      >
                        {paymentMethod === 'bank_transfer' && (
                          <span className="w-2 h-2 rounded-full bg-[#930303]" />
                        )}
                      </span>
                      <Landmark className="w-4 h-4 text-[#930303] shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-sm text-charcoal">
                        Direct Bank Account / UPI QR Transfer
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline bg-[#FAF7F2] border border-[#D4AF66] text-[#930303] text-[10px] font-bold px-2 py-0.5 rounded">
                        NEFT / IMPS / RTGS / QR
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-500 transition-transform ${
                          paymentMethod === 'bank_transfer' ? 'rotate-180 text-[#930303]' : ''
                        }`}
                      />
                    </div>
                  </summary>

                  <div className="px-4 pb-5 pt-3 border-t border-stone-200/70 space-y-4">
                    {loadingBanks ? (
                      <p className="text-stone-500 py-3">Loading official BL Jewels bank details…</p>
                    ) : bankAccounts.length === 0 ? (
                      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-900">
                        Direct bank accounts have not been configured yet. Please use Razorpay Secure or Cash on Delivery.
                      </div>
                    ) : (
                      <>
                        {/* Account Switcher when Admin configured multiple accounts */}
                        {bankAccounts.length > 1 && (
                          <div className="space-y-1.5">
                            <p className="font-semibold text-stone-700">
                              Select Bank Account / QR Code ({bankAccounts.length} available):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {bankAccounts.map((acc, idx) => (
                                <button
                                  type="button"
                                  key={acc._id || idx}
                                  onClick={() => setSelectedBankIdx(idx)}
                                  className={`px-3 py-1.5 rounded-lg border font-semibold cursor-pointer transition ${
                                    selectedBankIdx === idx
                                      ? 'bg-[#930303] text-white border-[#930303]'
                                      : 'bg-white text-stone-700 border-stone-300 hover:border-[#930303]'
                                  }`}
                                >
                                  {acc.label || acc.bankName || `Account #${idx + 1}`}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Selected Bank Details + QR Card */}
                        {activeBank && (
                          <div className="rounded-2xl bg-white border border-[#E9DED2] p-4 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                              {activeBank.qrImage && (
                                <div className="w-full sm:w-40 shrink-0 rounded-xl border border-[#E9DED2] bg-[#FAF7F2] p-2.5 text-center space-y-1.5">
                                  <img
                                    src={activeBank.qrImage}
                                    alt={`${activeBank.label} Payment QR`}
                                    className="w-32 h-32 mx-auto object-contain rounded-lg bg-white p-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setQrZoomSrc(activeBank.qrImage)}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#930303] hover:underline cursor-pointer"
                                  >
                                    <ZoomIn className="w-3 h-3" />
                                    <span>Enlarge QR</span>
                                  </button>
                                </div>
                              )}

                              <div className="flex-1 w-full space-y-2">
                                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                                  <span className="font-bold text-sm text-[#930303]">
                                    {activeBank.label || 'BL Jewels Official Account'}
                                  </span>
                                  {activeBank.accountType && (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
                                      {activeBank.accountType}
                                    </span>
                                  )}
                                </div>

                                {activeBank.bankName && (
                                  <div className="flex justify-between gap-2">
                                    <span className="text-stone-500">Bank Name</span>
                                    <span className="font-semibold text-stone-900 text-right">
                                      {activeBank.bankName}
                                    </span>
                                  </div>
                                )}
                                {activeBank.accountHolder && (
                                  <div className="flex justify-between gap-2">
                                    <span className="text-stone-500">Account Holder</span>
                                    <span className="font-semibold text-stone-900 text-right">
                                      {activeBank.accountHolder}
                                    </span>
                                  </div>
                                )}
                                {activeBank.accountNumber && (
                                  <div className="flex justify-between items-center gap-2">
                                    <span className="text-stone-500">Account No.</span>
                                    <button
                                      type="button"
                                      onClick={() => copyValue('acc', activeBank.accountNumber)}
                                      className="inline-flex items-center gap-1 font-mono font-bold text-[#930303] cursor-pointer"
                                    >
                                      {activeBank.accountNumber}
                                      {copiedField === 'acc' ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                )}
                                {activeBank.ifsc && (
                                  <div className="flex justify-between items-center gap-2">
                                    <span className="text-stone-500">IFSC Code</span>
                                    <button
                                      type="button"
                                      onClick={() => copyValue('ifsc', activeBank.ifsc)}
                                      className="inline-flex items-center gap-1 font-mono font-bold text-stone-900 cursor-pointer"
                                    >
                                      {activeBank.ifsc}
                                      {copiedField === 'ifsc' ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                )}
                                {activeBank.branch && (
                                  <div className="flex justify-between gap-2">
                                    <span className="text-stone-500">Branch</span>
                                    <span className="text-stone-800 text-right">{activeBank.branch}</span>
                                  </div>
                                )}
                                {activeBank.upiId && (
                                  <div className="flex justify-between items-center gap-2">
                                    <span className="text-stone-500">UPI ID</span>
                                    <button
                                      type="button"
                                      onClick={() => copyValue('upi', activeBank.upiId)}
                                      className="inline-flex items-center gap-1 font-semibold text-[#930303] cursor-pointer"
                                    >
                                      {activeBank.upiId}
                                      {copiedField === 'upi' ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {activeBank.instructions && (
                              <p className="text-[11px] bg-[#FAF7F2] rounded-lg px-3 py-2 text-stone-600 border border-[#E9DED2]">
                                {activeBank.instructions}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Mandatory Verification Inputs */}
                        <div className="rounded-2xl bg-white border border-[#930303]/30 p-4 space-y-4">
                          <div className="flex items-center gap-2 text-[#930303] font-bold">
                            <QrCode className="w-4 h-4 shrink-0" />
                            <span>
                              Step Required: Transfer ₹{formatCurrency(total)} and attach Transaction ID + Payment Proof below
                            </span>
                          </div>

                          <div>
                            <label htmlFor="bank-tx-id" className="block font-semibold text-stone-700 mb-1">
                              Transaction ID / UTR Reference Number <span aria-hidden="true">*</span>
                            </label>
                            <input
                              ref={txInputRef}
                              id="bank-tx-id"
                              name="transactionId"
                              type="text"
                              required={paymentMethod === 'bank_transfer'}
                              autoCorrect="off"
                              spellCheck={false}
                              aria-invalid={Boolean(submitError && transactionId.trim().length < 4)}
                              value={transactionId}
                              onChange={(e) => {
                                setTransactionId(e.target.value);
                                if (submitError) setSubmitError('');
                              }}
                              placeholder="e.g. 431712345678 / HDFC-UTR-9988"
                              className="w-full px-3.5 py-2.5 bg-pearl border border-stone-300 rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-[#930303]"
                            />
                          </div>

                          <div>
                            <span className="block font-semibold text-stone-700 mb-1.5">
                              Upload Payment Proof Screenshot / Receipt <span aria-hidden="true">*</span>
                            </span>
                            {proofImage ? (
                              <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                                <img
                                  src={proofImage}
                                  alt="Uploaded payment proof"
                                  className="w-16 h-16 rounded-lg object-cover border border-emerald-300 bg-white"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-emerald-800 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" />
                                    Payment proof attached
                                  </p>
                                  <label
                                    htmlFor="bank-proof-upload"
                                    className="inline-block mt-1 text-[#930303] font-semibold underline cursor-pointer"
                                  >
                                    Replace screenshot
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <label
                                htmlFor="bank-proof-upload"
                                className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-stone-300 hover:border-[#930303] bg-pearl rounded-xl p-5 cursor-pointer text-center transition"
                              >
                                {uploadingProof ? (
                                  <>
                                    <Loader2 className="w-5 h-5 animate-spin text-[#930303]" />
                                    <span className="font-semibold text-stone-700">
                                      Uploading payment proof…
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <UploadCloud className="w-6 h-6 text-[#930303]" />
                                    <span className="font-semibold text-stone-800">
                                      Click to upload payment screenshot / receipt
                                    </span>
                                    <span className="text-[11px] text-stone-500">
                                      PNG, JPG or WEBP (Mandatory to proceed)
                                    </span>
                                  </>
                                )}
                              </label>
                            )}
                            <input
                              id="bank-proof-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleProofUpload}
                              className="sr-only"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </details>

                {/* Accordion 3: COD */}
                <details
                  name="payment-accordion"
                  open={paymentMethod === 'cod'}
                  className={`pay-acc rounded-xl border transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#930303] bg-[#930303]/[0.03] ring-1 ring-[#930303]/20'
                      : 'border-border-light bg-pearl hover:border-gold-300'
                  }`}
                >
                  <summary
                    aria-disabled={paymentMethod === 'cod'}
                    onClick={(e) => {
                      e.preventDefault();
                      setPaymentMethod('cod');
                      setSubmitError('');
                    }}
                    className="list-none flex items-center justify-between gap-3 p-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          paymentMethod === 'cod' ? 'border-[#930303]' : 'border-stone-400'
                        }`}
                      >
                        {paymentMethod === 'cod' && (
                          <span className="w-2 h-2 rounded-full bg-[#930303]" />
                        )}
                      </span>
                      <Truck className="w-4 h-4 text-[#930303] shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-sm text-charcoal">
                        Pay on Delivery / Showroom Collection
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-500 transition-transform ${
                        paymentMethod === 'cod' ? 'rotate-180 text-[#930303]' : ''
                      }`}
                    />
                  </summary>
                  <div className="px-4 pb-4 pt-1 border-t border-stone-200/70 text-stone-600 leading-relaxed">
                    Available for orders up to ₹2,00,000. Verified with one-time OTP upon dispatch.
                  </div>
                </details>
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}
            </section>
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
                      <p className="text-stone-500 text-[11px]">
                        Qty: {item.quantity} • {item.variant?.label}
                      </p>
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
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>
                      {coupon?.discountType === 'percentage'
                        ? `Auspicious Coupon (${coupon?.code} • ${coupon?.value}% OFF)`
                        : `Auspicious Coupon (${coupon?.code} • Flat ₹${formatCurrency(coupon?.value || discount)} OFF)`}
                    </span>
                    <span>-₹{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (3% Bullion & Jewelry)</span>
                  <span>₹{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transit Insurance & Express Shipping</span>
                  <span className="text-emerald-700 font-semibold">
                    {shipping > 0 ? `₹${formatCurrency(shipping)}` : 'FREE'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-charcoal border-t border-border-light pt-3">
                  <span>Total Payable Amount</span>
                  <span className="font-accent text-xl text-[#930303]">
                    ₹{formatCurrency(total)}
                  </span>
                </div>
              </div>

              {paymentMethod === 'bank_transfer' && !bankProofReady && (
                <p className="text-[11px] rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-amber-900">
                  Enter your Transaction / UTR ID and upload payment proof to unlock checkout.
                </p>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || uploadingProof}
                className="w-full py-4 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-semibold tracking-wider font-body shadow-md shadow-[#930303]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Authorizing Auspicious Order...</span>
                ) : (
                  <>
                    <span>
                      {paymentMethod === 'bank_transfer'
                        ? `Submit Proof & Place Order ₹${formatCurrency(total)}`
                        : `Confirm & Pay ₹${formatCurrency(total)}`}
                    </span>
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

      {/* QR Code Zoom Dialog */}
      <dialog
        ref={qrDialogRef}
        closedby="any"
        aria-labelledby="qr-zoom-title"
        onClose={() => setQrZoomSrc(null)}
        onCancel={() => setQrZoomSrc(null)}
        className="qr-zoom-dialog m-auto rounded-2xl border border-[#E9DED2] bg-white p-6 shadow-2xl max-w-sm w-[calc(100%-2rem)] text-center space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 id="qr-zoom-title" className="font-display font-bold text-lg text-[#930303]">
            Scan Official Payment QR
          </h3>
          <button
            type="button"
            autoFocus
            aria-label="Close QR zoom"
            onClick={() => setQrZoomSrc(null)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {qrZoomSrc && (
          <img
            src={qrZoomSrc}
            alt="Full size payment QR code"
            className="w-64 h-64 mx-auto object-contain rounded-xl border border-[#E9DED2] p-2 bg-[#FAF7F2]"
          />
        )}
        <p className="text-xs text-stone-600">
          Scan with GPay, PhonePe, Paytm or any BHIM UPI app and save the UTR screenshot to upload below.
        </p>
      </dialog>
    </div>
  );
};
