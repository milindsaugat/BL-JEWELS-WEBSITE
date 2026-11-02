import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Truck, Download, ArrowRight, Sparkles, Package } from 'lucide-react';
import { orderService } from '../services/api';
import { formatCurrency } from '../lib/utils';

export const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderById(id);
        if (res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error('Fetch order error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const orderNumber = order?.orderNumber || id;
  const items = order?.items || [];
  const total = order?.pricing?.total || 85387;

  return (
    <div className="py-16 bg-pearl min-h-screen">
      <div className="container-bl max-w-2xl mx-auto">
        
        {/* Celebration Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gold-300 shadow-xl text-center space-y-6">
          
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="font-accent text-xs font-bold text-gold-700 tracking-wider uppercase">
              Order Confirmed with Auspicious Blessings
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-crimson-900">
              Thank You for Choosing BL Jewels
            </h1>
            <p className="font-body text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Your heirloom piece is now being carefully packed in our signature velvet crimson gift box with the official BIS 916 Hallmark certificate.
            </p>
          </div>

          {/* Order Meta Box */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 text-left space-y-3 font-body text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border-light">
              <span className="text-stone-500">Auspicious Order Reference</span>
              <strong className="font-body text-sm text-crimson-800 font-bold tracking-tight">
                {orderNumber}
              </strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border-light">
              <span className="text-stone-500">Insured Carrier</span>
              <span className="font-medium text-stone-800 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-gold-600" />
                Blue Dart Luxury Express (Tracking: BLJ-TRK-889921)
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border-light">
              <span className="text-stone-500">Estimated Delivery</span>
              <span className="font-semibold text-stone-900">
                Within 3–5 Business Days
              </span>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <span className="font-semibold text-stone-900">Total Paid</span>
              <span className="font-body font-bold text-base text-crimson-800">
                ₹{formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Hallmark Trust Certificate Note */}
          <div className="p-4 bg-gold-50/80 border border-gold-300 rounded-xl flex items-center gap-3 text-left">
            <ShieldCheck className="w-8 h-8 text-gold-700 shrink-0" />
            <div className="text-xs font-body text-gold-900">
              <strong className="block font-semibold">BIS 916 Hallmark Purity Guarantee</strong>
              <span>An official certificate with weight verification and 100% lifetime buyback assurance is enclosed with your package.</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-white hover:bg-stone-50 text-charcoal border border-border-light rounded-xl text-xs font-semibold font-body transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-stone-500" />
              <span>Print Invoice / Receipt</span>
            </button>
            <Link
              to="/collections"
              className="px-8 py-3 bg-crimson-700 hover:bg-crimson-800 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-crimson flex items-center justify-center gap-1.5"
            >
              <span>Explore More Creations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
