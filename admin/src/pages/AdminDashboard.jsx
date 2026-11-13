import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  ArrowUpRight,
  ShoppingBag,
  Package,
  Wallet,
  Clock,
  Users,
  ShieldCheck,
  LifeBuoy,
  FileText,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  orderService,
  productService,
  userService,
  categoryService,
  ticketService,
} from '../services/api';
import { useAuthStore } from '../store/authStore';
import { ADMIN_NAV_GROUPS } from '../lib/navGroups';

const money = (v) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v || 0);

const STATUS_META = [
  { key: 'delivered', label: 'Delivered', color: '#10B981', match: ['delivered'] },
  {
    key: 'shipped',
    label: 'In Transit',
    color: '#D4AF66',
    match: ['shipped', 'out_for_delivery'],
  },
  {
    key: 'pending',
    label: 'To Fulfil',
    color: '#930303',
    match: ['placed', 'confirmed', 'processing'],
  },
  {
    key: 'cancelled',
    label: 'Cancelled / Return',
    color: '#78716C',
    match: ['cancelled', 'return_requested', 'returned'],
  },
];

const CustomSalesTooltip = ({ active, payload, label, metric }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-xl bg-[#1C1410] text-white px-3.5 py-2.5 shadow-xl border border-[#C9A44A]/30 text-xs space-y-1">
      <p className="text-[11px] font-semibold text-[#E8C98A]">{row?.rangeLabel || label}</p>
      <p className="font-bold text-sm">
        {metric === 'revenue' ? money(row?.revenue || 0) : `${row?.orders || 0} Orders`}
      </p>
      <p className="text-[10px] text-stone-300">
        {metric === 'revenue'
          ? `${row?.orders || 0} order${row?.orders === 1 ? '' : 's'}`
          : `${money(row?.revenue || 0)} revenue`}
      </p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="rounded-xl bg-[#1C1410] text-white px-3 py-2 shadow-xl border border-[#C9A44A]/30 text-xs">
      <p className="font-semibold text-[#E8C98A]">{item.label}</p>
      <p className="font-bold mt-0.5">
        {item.count} orders · {money(item.value)}
      </p>
    </div>
  );
};

export const AdminDashboard = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productTotal, setProductTotal] = useState(null);
  const [categories, setCategories] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [ticketStats, setTicketStats] = useState(null);

  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveSync, setLiveSync] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [error, setError] = useState('');

  // Dynamic Area Chart controls
  const [days, setDays] = useState(30);
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'orders'

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!isAuthenticated || !token) return;
      if (silent) {
        setRefreshing(true);
      } else {
        setBusy(true);
      }
      setError('');

      try {
        const [ordRes, prodRes, catRes, usrRes, tktRes] = await Promise.allSettled([
          orderService.getAllOrders(),
          productService.getProducts({ limit: 200 }),
          categoryService.getCategories(),
          userService.getUserStats(),
          ticketService.getAll({ type: 'all', status: 'all' }),
        ]);

        if (ordRes.status === 'fulfilled') {
          setOrders(ordRes.value?.orders || []);
        } else {
          setError('Some order analytics could not be refreshed.');
        }

        if (prodRes.status === 'fulfilled') {
          const list = prodRes.value?.products || [];
          setProducts(list);
          setProductTotal(prodRes.value?.total ?? prodRes.value?.count ?? list.length);
        }

        if (catRes.status === 'fulfilled') {
          setCategories(catRes.value?.categories || catRes.value?.data || []);
        }

        if (usrRes.status === 'fulfilled' && usrRes.value?.stats) {
          setUserStats(usrRes.value.stats);
        }

        if (tktRes.status === 'fulfilled') {
          setTicketStats(tktRes.value?.stats || null);
        }

        setLastSyncedAt(new Date());
      } catch (e) {
        setError(e.response?.data?.message || 'Unable to load store telemetry. Try again.');
      } finally {
        setBusy(false);
        setRefreshing(false);
      }
    },
    [isAuthenticated, token]
  );

  useEffect(() => {
    if (isAuthenticated && token) {
      load({ silent: false });
    }
  }, [isAuthenticated, token, load]);

  useEffect(() => {
    if (!isAuthenticated || !token || !liveSync) return;

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        load({ silent: true });
      }
    }, 15000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        load({ silent: true });
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isAuthenticated, token, liveSync, load]);

  // ── DERIVED ANALYTICS ──
  const paidOrders = useMemo(
    () => orders.filter((o) => o.payment?.status === 'paid' && o.status !== 'cancelled'),
    [orders]
  );

  const totalRevenue = useMemo(
    () => paidOrders.reduce((s, o) => s + (o.pricing?.total || 0), 0),
    [paidOrders]
  );

  const avgOrderValue = paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0;

  const trend = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - days + 1 + i);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const dayPaid = paidOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === key;
      });
      const dayAll = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === key;
      });
      const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return {
        day: label,
        rangeLabel: label,
        revenue: dayPaid.reduce((s, o) => s + (o.pricing?.total || 0), 0),
        orders: dayAll.length,
      };
    });
  }, [days, orders, paidOrders]);

  const periodRevenue = useMemo(() => trend.reduce((s, d) => s + d.revenue, 0), [trend]);
  const periodOrderCount = useMemo(() => trend.reduce((s, d) => s + d.orders, 0), [trend]);

  const statusBreakdown = useMemo(() => {
    const total = orders.length || 1;
    return STATUS_META.map((meta) => {
      const matched = orders.filter((o) => meta.match.includes(o.status));
      return {
        ...meta,
        count: matched.length,
        pct: Math.round((matched.length / total) * 100),
        value: matched.reduce((s, o) => s + (o.pricing?.total || 0), 0),
      };
    }).filter((item) => item.count > 0 || orders.length === 0);
  }, [orders]);

  const stats = [
    {
      label: 'Paid Order Value',
      value: money(totalRevenue),
      sub: paidOrders.length ? `Avg ${money(avgOrderValue)}` : 'No paid orders',
      icon: Wallet,
      link: '/orders',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      sub: `${orders.filter((o) => o.status === 'delivered').length} delivered`,
      icon: ShoppingBag,
      link: '/orders',
    },
    {
      label: 'To Fulfil',
      value: orders.filter((o) => ['placed', 'confirmed', 'processing'].includes(o.status)).length,
      sub: 'Pending dispatch',
      icon: Clock,
      link: '/orders',
    },
    {
      label: 'Catalog SKUs',
      value: productTotal ?? (products.length || '—'),
      sub: `${categories.length || 0} categories`,
      icon: Package,
      link: '/products',
    },
    {
      label: 'Active Customers',
      value: userStats?.totalCustomers ?? (busy ? '—' : 0),
      sub: 'Registered customers',
      icon: Users,
      link: '/users',
      highlight: true,
    },
    {
      label: 'Open Inquiries',
      value: ticketStats ? ticketStats.open : busy ? '—' : 0,
      sub: `${ticketStats?.total ?? 0} total tickets`,
      icon: LifeBuoy,
      link: '/support',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Live Sync Badge */}
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div>
          <p className="uppercase text-xs tracking-widest text-[#930303] font-semibold">
            Real-Time Executive Telemetry
          </p>
          <h2 className="text-xl sm:text-2xl font-semibold mt-1 text-stone-900">
            Store Overview & Live Analytics
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Auto-syncs on login and every 15s for revenue, order pipeline &amp; customer telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setLiveSync((v) => !v)}
            aria-pressed={liveSync}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold border cursor-pointer transition-colors ${
              liveSync
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-white border-stone-200 text-stone-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                liveSync ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
              }`}
            />
            <span>{liveSync ? 'Live Sync: ON' : 'Live Sync: Paused'}</span>
          </button>

          {lastSyncedAt && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-stone-500 bg-white border border-stone-200 rounded-xl px-3 py-2">
              <Activity size={12} className="text-[#930303]" />
              Updated{' '}
              {lastSyncedAt.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          )}

          <button
            type="button"
            onClick={() => load({ silent: true })}
            disabled={busy || refreshing}
            className="flex items-center gap-2 border border-stone-200 bg-white hover:border-amber-400 rounded-xl px-4 py-2 text-xs font-semibold text-stone-700 shadow-xs cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={busy || refreshing ? 'animate-spin text-[#930303]' : ''}
            />
            <span>{busy || refreshing ? 'Syncing…' : 'Refresh Now'}</span>
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs">
          {error}
        </p>
      )}

      {/* 6 Concurrent KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {stats.map(({ label, value, sub, icon: Icon, link, highlight }) => (
          <Link
            to={link}
            key={label}
            className={`p-4 rounded-2xl border transition-all hover:shadow-md group block ${
              highlight
                ? 'bg-gradient-to-br from-[#FFF8EE] to-[#FFF1DE] border-amber-300 shadow-xs'
                : 'bg-white border-stone-200 shadow-xs hover:border-[#EADBD4]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-stone-500 font-medium">{label}</p>
              <Icon
                size={17}
                className={
                  highlight
                    ? 'text-[#930303]'
                    : 'text-stone-500 group-hover:text-[#930303] transition-colors'
                }
              />
            </div>
            {busy ? (
              <div className="h-7 w-20 bg-stone-200/70 rounded-lg animate-pulse mt-2.5" />
            ) : (
              <p className="text-xl font-bold mt-2 text-stone-900">{value}</p>
            )}
            <div className="flex items-center justify-between gap-1 text-[11px] text-stone-500 mt-1.5">
              <span className="truncate">{sub}</span>
              <ArrowUpRight size={12} className="shrink-0 group-hover:text-[#930303]" />
            </div>
          </Link>
        ))}
      </div>

      {/* Primary Analytics Row: Smooth Sales Area Graph + Order Fulfillment Pipeline */}
      <div className="grid xl:grid-cols-[1.85fr_1fr] gap-5">
        {/* Sales Activity Area Graph */}
        <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-[#FFF6F2] text-[#930303] flex items-center justify-center">
                <TrendingUp size={15} />
              </span>
              <div>
                <h3 className="font-semibold text-stone-900">
                  {chartMetric === 'revenue' ? 'Sales Activity & Revenue' : 'Daily Order Volume'}
                </h3>
                <p className="text-xs text-stone-500">
                  Last {days} days total:{' '}
                  <strong className="text-stone-900">
                    {chartMetric === 'revenue'
                      ? money(periodRevenue)
                      : `${periodOrderCount} orders`}
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <div className="inline-flex rounded-xl bg-stone-100 p-0.5 text-[11px] font-semibold">
                {[
                  ['revenue', '₹ Revenue'],
                  ['orders', 'Orders'],
                ].map(([mKey, mLabel]) => (
                  <button
                    type="button"
                    key={mKey}
                    onClick={() => setChartMetric(mKey)}
                    aria-pressed={chartMetric === mKey}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${
                      chartMetric === mKey
                        ? 'bg-white text-[#930303] shadow-xs'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    {mLabel}
                  </button>
                ))}
              </div>

              <div className="inline-flex rounded-xl bg-stone-100 p-0.5 text-[11px] font-semibold">
                {[7, 14, 30, 90].map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDays(d)}
                    aria-pressed={days === d}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${
                      days === d
                        ? 'bg-[#930303] text-white shadow-xs'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-64">
            {busy ? (
              <div className="h-full w-full rounded-xl bg-stone-100 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaCrimson" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#930303" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#C9A44A" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1ECE6" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#78716C' }}
                    minTickGap={22}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#78716C' }}
                    tickFormatter={(v) =>
                      chartMetric === 'revenue' && v >= 1000 ? `₹${Math.round(v / 1000)}k` : v
                    }
                    axisLine={false}
                    tickLine={false}
                    width={54}
                  />
                  <Tooltip content={<CustomSalesTooltip metric={chartMetric} />} />
                  <Area
                    dataKey={chartMetric}
                    type="monotone"
                    stroke="#930303"
                    strokeWidth={2.25}
                    activeDot={{ r: 5, fill: '#930303', stroke: '#FFFFFF', strokeWidth: 2 }}
                    fill="url(#areaCrimson)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Order Fulfillment Pipeline (Donut + Stage Breakdown) */}
        <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-stone-900">Order Fulfillment Pipeline</h3>
              <p className="text-xs text-stone-500 mt-0.5">Live stage distribution &amp; value</p>
            </div>
            <Link to="/orders" className="text-xs font-semibold text-[#930303] hover:underline">
              All Orders
            </Link>
          </div>

          <div className="h-44 relative">
            {busy ? (
              <div className="h-full w-full rounded-xl bg-stone-100 animate-pulse" />
            ) : orders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                No orders recorded yet
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={56}
                      outerRadius={74}
                      paddingAngle={4}
                      cornerRadius={5}
                      stroke="none"
                    >
                      {statusBreakdown.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-stone-900 leading-none">
                    {orders.length}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-1">
                    Total Orders
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3 pt-1">
            {statusBreakdown.map((item) => (
              <div key={item.key} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 font-medium text-stone-800">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="text-stone-600 font-medium">
                    <strong className="text-stone-900">{item.count}</strong> ({item.pct}%) ·{' '}
                    <span className="text-stone-500">{money(item.value)}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Compact Quick Actions Strip */}
      <section className="rounded-2xl bg-[#FFF6F2] border border-[#EADBD4] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#930303] font-bold">
            <ShieldCheck size={14} />
            <span>Quick Actions</span>
          </div>
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            Jump directly to high-priority panels
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            ['Support & Inquiries', '/support', LifeBuoy],
            ['Bank & QR Accounts', '/payment-accounts', Wallet],
            ['Manage Orders', '/orders', Package],
            ['Manage Products', '/products', ShoppingBag],
            ['Manage Customers', '/users', Users],
            ['Blog & SEO Manager', '/blogs?tab=seo', FileText],
          ].map(([label, path, Icon]) => (
            <Link
              to={path}
              key={path}
              className="flex justify-between items-center gap-2 p-3 rounded-xl bg-white text-xs font-semibold text-stone-800 border border-stone-200/80 hover:border-amber-400 hover:text-[#930303] shadow-xs transition-all"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Icon size={14} className="text-[#930303] shrink-0" />
                <span className="truncate">{label}</span>
              </span>
              <ArrowUpRight size={13} className="shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Categorized Store Workspace Directory */}
      <section className="space-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#930303] font-bold">
            Organized by Category
          </p>
          <h3 className="text-lg font-semibold text-stone-900 mt-0.5">Store Management Modules</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {ADMIN_NAV_GROUPS.filter((g) => g.id !== 'overview').map((group) => (
            <div
              key={group.id}
              className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-xs"
            >
              <div className="pb-2.5 border-b border-stone-100 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#930303]">
                  {group.title}
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-stone-600 border border-stone-200">
                  {group.items.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {group.items.map(({ label, path, icon: Icon, description }) => (
                  <Link
                    key={path}
                    to={path}
                    className="flex items-start justify-between gap-2.5 p-2.5 rounded-xl hover:bg-[#FAF7F2] border border-transparent hover:border-[#EADBD4] group transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Icon size={16} className="text-[#930303] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-900 group-hover:text-[#930303] transition-colors">
                          {label}
                        </p>
                        <p className="text-[11px] text-stone-500 line-clamp-1">{description}</p>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={13}
                      className="text-stone-400 group-hover:text-[#930303] shrink-0 mt-0.5"
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Orders Table */}
      <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 flex justify-between items-center border-b border-stone-100">
          <div>
            <h3 className="font-semibold text-stone-900">Recent Customer Orders</h3>
            <p className="text-xs text-stone-500">Live order arrivals &amp; fulfillment status</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-bold text-[#930303] hover:underline flex items-center gap-1"
          >
            <span>View all orders</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-[11px] uppercase font-semibold text-stone-500 border-b border-stone-200">
              <tr>
                {['Order Number', 'Customer', 'Booking Date', 'Status', 'Total Value'].map((h) => (
                  <th key={h} className="px-5 py-3.5 font-medium">
                    {h}
                  </th>
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
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="bg-stone-100 text-stone-700 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize">
                      {o.status?.replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-[#930303]">
                    {money(o.pricing?.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length && (
            <p className="text-center p-10 text-xs text-stone-500">
              {busy
                ? 'Loading live orders…'
                : error
                  ? 'Order data unavailable.'
                  : 'No orders yet.'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
