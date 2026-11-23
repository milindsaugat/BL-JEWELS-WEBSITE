import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Printer,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowLeft,
  ShoppingBag,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { orderService } from '../services/api';

const money = (v) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v || 0);

const numberToWordsIndian = (num) => {
  if (!num || isNaN(num) || num <= 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  };

  const integerPart = Math.floor(num);
  return 'INR ' + inWords(integerPart) + ' Only';
};

export const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    orderService
      .getOrderById(id)
      .then((r) => {
        if (active) setOrder(r.order);
      })
      .catch((e) => {
        if (active) setError(e.response?.data?.message || 'Unable to load your order details.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 px-4">
        <div className="w-10 h-10 border-2 border-[#930303] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-stone-600">Retrieving official jewellery invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-[#930303] flex items-center justify-center mb-4">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-xl font-bold text-stone-900 font-display">Order Invoice Not Accessible</h1>
        <p className="text-sm text-stone-500 mt-2 max-w-md">{error || 'Could not locate this order invoice.'}</p>
        <div className="flex gap-3 mt-6">
          <Link
            to="/account"
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            My Account
          </Link>
          <Link
            to="/collections"
            className="px-5 py-2.5 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors"
          >
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = order.pricing?.subtotal || 0;
  const discount = order.pricing?.discount || 0;
  const shipping = order.pricing?.shipping || 0;
  const total = order.pricing?.total || 0;

  const orderDate = new Date(order.createdAt || Date.now());
  const formattedDate = orderDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const paymentStatus = order.payment?.status === 'paid' ? 'Paid & Verified' : (order.payment?.status || 'Paid');
  const paymentMethod = (order.payment?.method || 'Razorpay').toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 print:bg-white print:py-0 print:m-0 font-body">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 print:p-0 print:max-w-full">
        
        {/* ── Screen-Only Celebration & Controls Banner ── */}
        <div className="print:hidden bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Confirmed & Paid
                  </span>
                  <span className="text-xs text-stone-400 font-mono">Order #{order.orderNumber}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900 mt-0.5">
                  Thank you for choosing BL Jewels!
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Your certified 22K (916) BIS hallmarked jewellery order has been confirmed and scheduled for Blue Dart Armored transit.
                </p>
              </div>
            </div>

            {/* Print Action Button */}
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-[#930303] hover:bg-[#780303] text-white px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold shadow-md shadow-[#930303]/20 hover:shadow-lg transition-all cursor-pointer shrink-0"
            >
              <Printer size={17} />
              <span>Print Tax Invoice</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Truck size={15} className="text-[#930303]" />
              <span>Complimentary Blue Dart Armored Dispatch with 100% Transit Insurance</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/account"
                className="text-[#930303] font-semibold hover:underline flex items-center gap-1"
              >
                <span>View in My Account</span>
              </Link>
              <span className="text-stone-300">·</span>
              <Link
                to="/collections"
                className="text-stone-600 font-medium hover:text-stone-900 flex items-center gap-1"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            OFFICIAL TAX INVOICE & ORDER RECEIPT (Single Page A4 Sheet)
            ══════════════════════════════════════════════════════════════════ */}
        <div
          id="print-receipt-container"
          className="print-receipt-sheet bg-white rounded-2xl border-2 border-stone-800 p-6 sm:p-8 shadow-md text-stone-900 print:rounded-none print:shadow-none print:border print:p-6"
        >
          {/* Header Bar */}
          <div className="flex justify-between items-start gap-4 pb-4 border-b-2 border-stone-800">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/images/bl-jewels-logo.png"
                  alt="BL Jewels — Purity with Auspiciousness"
                  className="h-12 sm:h-14 w-auto object-contain"
                />
              </div>
              <p className="text-[10px] font-accent tracking-widest uppercase text-stone-600 font-semibold mt-1">
                Purity with Auspiciousness · Since 1984
              </p>
              <p className="text-[11px] text-stone-700 font-semibold mt-1">
                B.L. Jewels (P) Ltd.
              </p>
              <p className="text-[10px] text-stone-500 leading-tight">
                Shop No. 01, Upper Ground Floor, Suresh Mall, MG Road, Civil Lines, Agra, UP 282002
              </p>
              <p className="text-[10px] text-stone-500">
                Helpline: 074549 86610 · contact@bljewels.com · www.bljewels.com
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block bg-stone-900 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                TAX INVOICE / CASH MEMO
              </span>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mt-1">
                Original for Recipient
              </p>
              <div className="text-[10px] text-stone-600 mt-1.5 space-y-0.5 font-mono">
                <p><strong>GSTIN:</strong> 09AABCB1234F1Z5</p>
                <p><strong>State:</strong> Uttar Pradesh (09)</p>
                <p><strong>BIS Hallmark Reg:</strong> HM/C-7591823961</p>
              </div>
            </div>
          </div>

          {/* Meta Grid (Order Info & Consignee) */}
          <div className="grid grid-cols-2 gap-4 py-3.5 border-b border-stone-300 text-[11px]">
            {/* Left: Invoice & Payment */}
            <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-200/80 space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Invoice / Order No:</span>
                <span className="font-mono font-bold text-stone-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Invoice Date & Time:</span>
                <span className="font-medium text-stone-800">{formattedDate} · {formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Payment Mode:</span>
                <span className="font-semibold text-stone-800">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Payment Status:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  ✓ {paymentStatus}
                </span>
              </div>
              {order.payment?.transactionId && (
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Txn / UTR Ref:</span>
                  <span className="font-mono text-[10px] text-stone-700">{order.payment.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Transit Insurance:</span>
                <span className="text-emerald-800 font-medium">100% Blue Dart Armored Cover</span>
              </div>
            </div>

            {/* Right: Billed & Shipped To */}
            <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-200/80 space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                Billed & Delivered To (Consignee)
              </p>
              <p className="font-bold text-stone-900 text-xs">
                {order.shippingAddress?.name || 'Valued Customer'}
              </p>
              <p className="text-stone-600 font-mono text-[10px]">
                Phone: {order.shippingAddress?.phone}
              </p>
              <p className="text-stone-600 leading-snug pt-0.5">
                {[
                  order.shippingAddress?.line1,
                  order.shippingAddress?.line2,
                  order.shippingAddress?.city,
                  order.shippingAddress?.state,
                  order.shippingAddress?.pincode,
                ].filter(Boolean).join(', ')}
              </p>
              <p className="text-[10px] text-stone-500 font-medium">
                Country: {order.shippingAddress?.country || 'India'} (State Code: 09)
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-3">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-800 uppercase text-[10px] font-bold border-y-2 border-stone-800 tracking-wider">
                  <th className="py-2 px-2 text-center w-8">#</th>
                  <th className="py-2 px-2">Description of Jewellery</th>
                  <th className="py-2 px-2 text-center">Purity</th>
                  <th className="py-2 px-2 text-center">HSN</th>
                  <th className="py-2 px-2 text-center">Gross Wt.</th>
                  <th className="py-2 px-2 text-center w-12">Qty</th>
                  <th className="py-2 px-2 text-right">Unit Rate</th>
                  <th className="py-2 px-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {order.items?.map((item, index) => {
                  const snap = item.snapshot || {};
                  const variant = snap.variant || {};
                  const metal = snap.metal || {};
                  const karat = variant.karat || metal.karat || '22K (916)';
                  const weight = variant.weight ? `${variant.weight}g` : '—';

                  return (
                    <tr key={index} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-2 text-center font-mono text-stone-500">{index + 1}</td>
                      <td className="py-2.5 px-2">
                        <p className="font-bold text-stone-900">{snap.name || 'Fine Jewellery Article'}</p>
                        <p className="text-[10px] text-stone-500">
                          {variant.sku ? `SKU: ${variant.sku} · ` : ''}100% BIS Hallmarked Pure Gold
                        </p>
                      </td>
                      <td className="py-2.5 px-2 text-center font-semibold text-stone-800">{karat}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-[10px] text-stone-600">711319</td>
                      <td className="py-2.5 px-2 text-center font-mono text-stone-700">{weight}</td>
                      <td className="py-2.5 px-2 text-center font-semibold text-stone-800">{item.quantity}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-stone-700">{money(item.price)}</td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-stone-900">
                        {money(item.price * item.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation & Summary */}
          <div className="pt-2 border-t-2 border-stone-800 grid grid-cols-12 gap-4 text-[11px]">
            {/* Left: Amount in Words & Notes */}
            <div className="col-span-7 flex flex-col justify-between space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Amount Chargeable (in words)
                </p>
                <p className="font-bold text-stone-900 italic mt-0.5 text-xs">
                  {numberToWordsIndian(total)}
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/90 text-[10px] text-stone-600 space-y-0.5">
                <p className="font-bold text-stone-800 uppercase tracking-wider text-[9px]">
                  Tax & Composition Scheme Declaration:
                </p>
                <p>
                  * GST (3% Composite Scheme) is inclusive in all product rates as per Section 10 of the CGST Act 2017.
                </p>
                <p>
                  * Certified by BIS Hallmarking Centre under Bureau of Indian Standards Regulations.
                </p>
              </div>
            </div>

            {/* Right: Totals Breakdown Box */}
            <div className="col-span-5 bg-stone-50/80 p-3 rounded-lg border border-stone-200/90 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Gross Merchandise Value:</span>
                <span>{money(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Festive Discount {order.pricing?.coupon ? `(${order.pricing.coupon})` : ''}:</span>
                  <span>-{money(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Insured Armored Shipping:</span>
                <span className={shipping === 0 ? 'text-emerald-700 font-bold' : ''}>
                  {shipping === 0 ? 'FREE' : money(shipping)}
                </span>
              </div>

              <div className="flex justify-between text-stone-600 text-[10px]">
                <span>Integrated GST (3% Inclusive):</span>
                <span>Included</span>
              </div>

              <div className="border-t-2 border-stone-800 pt-2 flex justify-between text-sm font-bold text-stone-950">
                <span>Grand Total Paid:</span>
                <span className="text-[#930303] text-base">{money(total)}</span>
              </div>
            </div>
          </div>

          {/* Quality Guarantees Bar */}
          <div className="my-3 py-2 bg-amber-50/70 border border-amber-200/80 rounded-lg grid grid-cols-4 gap-2 text-center text-[9px] font-semibold text-stone-700">
            <div className="flex items-center justify-center gap-1.5">
              <img
                src="/images/bis-bureau-of-indian-standards.png"
                alt="BIS Hallmark"
                className="h-3.5 w-auto object-contain inline-block"
              />
              <span>100% BIS 916 Hallmarked</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Truck size={12} className="text-emerald-700" />
              <span>Insured Armored Dispatch</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-[#930303]" />
              <span>Lifetime Jewellery Buyback</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Clock size={12} className="text-stone-700" />
              <span>15-Day Easy Returns</span>
            </div>
          </div>

          {/* Signatures & Bottom Signoff */}
          <div className="pt-4 border-t border-stone-300 grid grid-cols-2 items-end text-[10px]">
            <div>
              <p className="text-stone-500 font-medium">Customer Acceptance Signature:</p>
              <div className="w-48 h-9 border-b border-dashed border-stone-400 mt-1" />
              <p className="text-[9px] text-stone-400 mt-1">Received in sealed tamper-evident armored packaging</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-stone-900 text-[11px]">For B.L. JEWELS (P) LTD.</p>
              <div className="inline-block border border-stone-300 rounded px-3 py-1 my-1.5 text-[9px] font-mono text-emerald-800 bg-emerald-50/50">
                [ BIS 916 CERTIFIED · DISPATCH AUTHORIZED ]
              </div>
              <p className="font-semibold text-stone-800">Authorised Signatory</p>
              <p className="text-[9px] text-stone-400 mt-0.5">Subject to Agra, UP Jurisdiction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
