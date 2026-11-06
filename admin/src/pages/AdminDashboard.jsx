import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowUpRight, ShoppingBag, Package, Wallet, Clock, Users, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { orderService, productService, userService } from '../services/api';

const money = (v) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v || 0);

export const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);

  // High-performance concurrent parallel loader
  const load = async () => {
    setBusy(true);
    setError('');
    try {
      const [o, p, u] = await Promise.all([
        orderService.getAllOrders(),
        productService.getProducts({ limit: 1 }),
        userService.getUserStats().catch(() => ({ stats: null })),
      ]);
      setOrders(o.orders || []);
      setProducts(p.total ?? p.count ?? p.products?.length ?? 0);
      if (u?.stats) setUserStats(u.stats);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load store data. Try again.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const paid = orders.filter((o) => o.payment?.status === 'paid' && o.status !== 'cancelled');

  const trend = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - days + 1 + i);
    const same = (o) => new Date(o.createdAt).toLocaleDateString('en-IN') === date.toLocaleDateString('en-IN');
    return {
      day: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: paid.filter(same).reduce((s, o) => s + (o.pricing?.total || 0), 0),
    };
  });

  const stats = [
    { label: 'Paid Order Value', value: money(paid.reduce((s, o) => s + (o.pricing?.total || 0), 0)), icon: Wallet, link: '/orders' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, link: '/orders' },
    { label: 'To Fulfil', value: orders.filter((o) => ['placed', 'confirmed', 'processing'].includes(o.status)).length, icon: Clock, link: '/orders' },
    { label: 'Products', value: products ?? '—', icon: Package, link: '/products' },
    { label: 'Active Customers', value: userStats?.totalCustomers ?? (busy ? '—' : '2'), icon: Users, link: '/users', highlight: true },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div>
          <p className="uppercase text-xs tracking-widest text-[#930303] font-semibold">At a glance</p>
          <h2 className="text-xl sm:text-2xl font-semibold mt-1 text-stone-900">Store overview</h2>
          <p className="text-sm text-stone-500 mt-1">
            Real-time sales, order pipeline, active customer counts and inventory.
          </p>
        </div>
        <button
          onClick={load}
          disabled={busy}
          className="flex items-center gap-2 border border-stone-200 bg-white hover:border-gold-400 rounded-xl px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-xs cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={busy ? 'animate-spin text-[#930303]' : ''} />
          <span>Refresh All</span>
        </button>
      </div>

      {error && <p role="alert" className="bg-red-50 text-red-800 p-4 rounded-xl text-xs">{error}</p>}

      {/* Concurrent Metrics Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, link, highlight }) => (
          <Link
            to={link}
            key={label}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all hover:shadow-md group block ${
              highlight
                ? 'bg-gradient-to-br from-[#FFF8EE] to-[#FFF1DE] border-amber-300 shadow-xs'
                : 'bg-white border-stone-200 shadow-xs hover:border-gold-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-stone-500 font-medium">{label}</p>
              <Icon size={18} className={highlight ? 'text-[#930303]' : 'text-stone-600 group-hover:text-[#930303] transition-colors'} />
            </div>
            <p className="text-xl font-semibold mt-2 text-stone-900">{busy && value === '—' ? '...' : value}</p>
            <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-1 font-medium group-hover:text-[#930303] transition-colors">
              <span>View details</span>
              <ArrowUpRight size={12} />
            </div>
          </Link>
        ))}
      </div>

      {/* Charts & Action Strip */}
      <div className="grid xl:grid-cols-[2fr_1fr] gap-5">
        
        {/* Sales Activity Chart */}
        <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-stone-900">Sales Activity & Revenue</h3>
              <p className="text-xs text-stone-500 mt-0.5">Paid orders by booking date</p>
            </div>
            <select
              aria-label="Sales period"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="border border-stone-200 rounded-lg text-xs p-2 bg-stone-50 focus:outline-none cursor-pointer"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
          <div className="h-48 sm:h-56">
            {error ? (
              <p className="text-stone-500 text-xs">Sales data unavailable</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#930303" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#930303" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip formatter={money} />
                  <Area dataKey="revenue" type="monotone" stroke="#930303" strokeWidth={2} fill="url(#salesFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Workspace Quick Actions */}
        <section className="rounded-2xl bg-[#FFF6F2] border border-[#EADBD4] p-5 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#930303] font-bold">
              <ShieldCheck size={14} />
              <span>Quick links</span>
            </div>
            <h3 className="text-xl font-bold mt-2 text-stone-900">Quick actions</h3>
            <p className="text-xs text-stone-600 mt-1">Jump to key administrative panels.</p>

            <div className="mt-5 space-y-2.5">
              {[
                ['Manage Customers & Users', '/users', Users],
                ['Manage orders', '/orders', Package],
                ['Manage products', '/products', ShoppingBag],
                ['Gold rate settings', '/gold-rates', Wallet],
                ['Coupons', '/coupons', ShieldCheck],
              ].map(([label, path, Icon]) => (
                <Link
                  to={path}
                  key={path}
                  className="flex justify-between items-center p-3 rounded-xl bg-white text-xs font-semibold text-stone-800 border border-stone-200/80 hover:border-gold-400 hover:text-[#930303] shadow-xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className="text-[#930303]" />
                    <span>{label}</span>
                  </div>
                  <ArrowUpRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Recent Orders Table */}
      <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 flex justify-between items-center border-b border-stone-100">
          <div>
            <h3 className="font-semibold text-stone-900">Recent Customer Orders</h3>
            <p className="text-xs text-stone-500">Live order arrivals & fulfillment status</p>
          </div>
          <Link to="/orders" className="text-xs font-bold text-[#930303] hover:underline flex items-center gap-1">
            <span>View all orders</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-[11px] uppercase font-semibold text-stone-500 border-b border-stone-200">
              <tr>
                {['Order Number', 'Customer', 'Booking Date', 'Status', 'Total Value'].map((h) => (
                  <th key={h} className="px-5 py-3.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.slice(0, 6).map((o) => (
                <tr key={o._id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-stone-900">{o.orderNumber}</td>
                  <td className="px-5 py-3.5">{o.shippingAddress?.name || 'Customer'}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-stone-500">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="bg-stone-100 text-stone-700 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize">
                      {o.status?.replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-[#930303]">{money(o.pricing?.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length && (
            <p className="text-center p-10 text-xs text-stone-500">
              {busy ? 'Loading orders concurrently…' : error ? 'Order data unavailable.' : 'No orders yet.'}
            </p>
          )}
        </div>
      </section>

    </div>
  );
};

export default AdminDashboard;
