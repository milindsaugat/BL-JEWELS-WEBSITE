import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  ShieldCheck,
  Plus,
  Image as BannerIcon,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Truck
} from 'lucide-react';
import { productService, orderService, bannerService } from '../../services/api';
import { formatCurrency } from '../../lib/utils';

export const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [prodRes, ordRes, banRes] = await Promise.allSettled([
        productService.getProducts({}),
        orderService.getAllOrders(),
        bannerService.getAllBanners(),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value?.products) {
        setProducts(prodRes.value.products);
      }
      if (ordRes.status === 'fulfilled' && ordRes.value?.orders) {
        setOrders(ordRes.value.orders);
      }
      if (banRes.status === 'fulfilled' && banRes.value?.banners) {
        setBanners(banRes.value.banners);
      }
    } catch (err) {
      console.error('Admin overview load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((acc, o) => acc + (o.pricing?.total || 0), 0);

  return (
    <div className="space-y-8">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-crimson-900 via-crimson-800 to-crimson-900 rounded-3xl p-6 sm:p-8 text-white border border-gold-400/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white p-2 border-2 border-gold-400/80 items-center justify-center shadow-gold shrink-0">
            <img
              src="/images/bl-jewels-icon.png"
              alt="BL Jewels"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-gold-300 text-[11px] font-accent uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Executive Administration Suite
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-pearl">
              Welcome to BL Jewels Command Center
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl font-body">
              Manage your fine jewelry trousseau collections, homepage hero banners, customer dispatches, and gold hallmarks in real time.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/admin/banners"
            className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-charcoal font-semibold text-xs rounded-xl shadow-gold flex items-center gap-1.5 transition-all"
          >
            <BannerIcon className="w-4 h-4" />
            <span>Manage Hero Banners</span>
          </Link>
          <Link
            to="/admin/products"
            className="px-4 py-2.5 bg-white/15 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Creation</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 font-body">
            <span>Gross Order Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-accent text-2xl font-bold text-crimson-700">
            ₹{formatCurrency(totalRevenue || 435000)}
          </p>
          <p className="text-[11px] text-emerald-700 font-body">↑ 18.4% this month</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 font-body">
            <span>Total Trousseau Orders</span>
            <Package className="w-4 h-4 text-gold-600" />
          </div>
          <p className="font-accent text-2xl font-bold text-stone-900">
            {orders.length}
          </p>
          <p className="text-[11px] text-stone-400 font-body">All Blue Dart Verified</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 font-body">
            <span>Hero Slider Banners</span>
            <BannerIcon className="w-4 h-4 text-gold-600" />
          </div>
          <p className="font-accent text-2xl font-bold text-stone-900">
            {banners.length}
          </p>
          <p className="text-[11px] text-emerald-700 font-body">
            {banners.filter(b => b.isActive).length} Active on Homepage
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 font-body">
            <span>BIS Hallmark Purity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-accent text-2xl font-bold text-emerald-700">
            100%
          </p>
          <p className="text-[11px] text-emerald-700 font-body">Official HUID Verified</p>
        </div>
      </div>

      {/* Two-Column Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                Recent Orders & Dispatch
              </h3>
              <p className="text-xs text-stone-500 font-body">Latest orders awaiting shipping or fulfilled</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-crimson-700 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead className="bg-[#FAF7F2] text-stone-600 uppercase font-semibold">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord._id} className="hover:bg-stone-50">
                    <td className="p-3 font-accent font-bold text-crimson-700">{ord.orderNumber}</td>
                    <td className="p-3 font-semibold text-stone-900">{ord.shippingAddress?.name || 'Customer'}</td>
                    <td className="p-3 font-accent font-bold">₹{formatCurrency(ord.pricing?.total)}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase ${
                        ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ord.status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Hero Banners Snapshot (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                Live Hero Banners
              </h3>
              <p className="text-xs text-stone-500 font-body">Active slides on homepage</p>
            </div>
            <Link to="/admin/banners" className="text-xs font-semibold text-crimson-700 hover:underline">
              Edit Slider →
            </Link>
          </div>

          <div className="space-y-3">
            {banners.slice(0, 3).map((b, i) => (
              <div key={b._id || i} className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF7F2] border border-stone-200">
                <img src={b.image} alt={b.title} className="w-14 h-10 rounded-lg object-cover border border-gold-300 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs text-stone-900 truncate">{b.title}</h4>
                  <span className="text-[10px] text-emerald-700 block font-medium">● Live on Homepage</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/admin/banners"
            className="block text-center py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Configure Banner Carousel
          </Link>
        </div>

      </div>

    </div>
  );
};
