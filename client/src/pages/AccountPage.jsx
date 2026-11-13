import React, { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  Package, Heart, MapPin, User, LogOut, ArrowUpRight, LifeBuoy, Plus, Send,
  UploadCloud, Camera, Trash2, Loader2, CheckCircle2, Lock, ShieldCheck,
  FileText, ExternalLink, Eye, AlertCircle
} from 'lucide-react';
import { api, orderService, authService, ticketService, uploadService } from '../services/api';
import { useAuthStore } from '../store/authStore';

const emptyAddress = { label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };
const emptyTicket = { category: 'Order & Delivery', orderNumber: '', priority: 'normal', subject: '', message: '' };
const money = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const STATUS_BADGE = {
  open: 'bg-amber-50 text-amber-800 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-800 border-blue-200',
  replied: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  resolved: 'bg-stone-100 text-stone-700 border-stone-200',
  closed: 'bg-stone-100 text-stone-500 border-stone-200',
};

export const AccountPage = () => {
  const { user, isAuthenticated, logout, updateUser, wishlist } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const validTabs = ['orders', 'support', 'addresses', 'profile'];
  const [tab, setTab] = useState(
    urlTab && validTabs.includes(urlTab) ? urlTab : 'orders'
  );

  useEffect(() => {
    if (urlTab && validTabs.includes(urlTab)) {
      setTab(urlTab);
    }
  }, [urlTab]);

  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState(emptyTicket);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    panNumber: user?.panNumber || '',
    panCardImage: user?.panCardImage || '',
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [uploadingPan, setUploadingPan] = useState(false);
  const [panError, setPanError] = useState('');
  const [savingPan, setSavingPan] = useState(false);
  const [panSuccessNotice, setPanSuccessNotice] = useState('');
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [address, setAddress] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    Promise.all([
      orderService.getMyOrders(),
      authService.getMe(),
      ticketService.getMyTickets().catch(() => ({ data: [] })),
    ])
      .then(([o, u, t]) => {
        if (active) {
          setOrders(o.orders || []);
          updateUser(u.user);
          setAddresses(u.user.addresses || []);
          setProfile({
            name: u.user.name,
            phone: u.user.phone || '',
            avatar: u.user.avatar || '',
            panNumber: u.user.panNumber || '',
            panCardImage: u.user.panCardImage || '',
          });
          setTickets(t?.data || []);
        }
      })
      .catch((e) => {
        if (active) setError(e.response?.data?.message || 'Unable to load your account. Please reload.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const run = async (fn) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveAddresses = async (list) => {
    const { data } = await api.put('/auth/addresses', { addresses: list });
    updateUser(data.user);
    setAddresses(data.user.addresses);
    setAddress(null);
    setNotice('Addresses saved.');
  };

  const action = (id, act) =>
    run(async () => {
      const { data } = await api.post(`/auth/orders/${id}/action`, { action: act });
      setOrders(orders.map((o) => (o._id === id ? data.order : o)));
      setNotice('Request recorded. Contact us for refund or return assistance.');
    });

  const handleCreateTicket = (e) => {
    e.preventDefault();
    run(async () => {
      const res = await ticketService.createMyTicket(ticketForm);
      if (res?.data) {
        setTickets((prev) => [res.data, ...prev]);
        setTicketForm(emptyTicket);
        setShowNewTicket(false);
        setNotice(`Support ticket ${res.data.ticketNumber} created. Our concierge will respond shortly.`);
      }
    });
  };

  const handleCustomerReply = (e, ticketId) => {
    e.preventDefault();
    const msg = (replyDrafts[ticketId] || '').trim();
    if (!msg) return;
    run(async () => {
      const res = await ticketService.replyMyTicket(ticketId, msg);
      if (res?.data) {
        setTickets((prev) => prev.map((t) => (t._id === ticketId ? res.data : t)));
        setReplyDrafts((prev) => ({ ...prev, [ticketId]: '' }));
        setNotice('Your reply has been sent to our concierge team.');
      }
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image file size must be less than 5MB.');
      return;
    }
    setUploadingAvatar(true);
    setAvatarError('');
    setError('');
    try {
      const res = await uploadService.uploadImage(file, 'bl-jewels/avatars');
      if (res?.url) {
        const nextProfile = { ...profile, avatar: res.url };
        setProfile(nextProfile);
        const { data } = await api.put('/auth/profile', nextProfile);
        if (data?.user) {
          updateUser(data.user);
        }
        setNotice('Profile photo updated successfully!');
      } else {
        setAvatarError('Photo upload did not return a valid URL.');
      }
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    setAvatarError('');
    try {
      const nextProfile = { ...profile, avatar: '' };
      setProfile(nextProfile);
      const { data } = await api.put('/auth/profile', nextProfile);
      if (data?.user) {
        updateUser(data.user);
      }
      setNotice('Profile photo removed.');
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to remove photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePanNumberChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setProfile((prev) => ({ ...prev, panNumber: val }));
    setPanError('');
    setPanSuccessNotice('');
  };

  const handlePanCardUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPanError('PAN Card file size must be less than 5MB.');
      e.target.value = '';
      return;
    }

    setUploadingPan(true);
    setPanError('');
    setPanSuccessNotice('');
    try {
      const res = await uploadService.uploadImage(file, 'bl-jewels/pancards');
      const url = res?.url || res?.secure_url || res?.imageUrl || res?.image;
      if (url) {
        setProfile((prev) => ({ ...prev, panCardImage: url }));
        setPanSuccessNotice('PAN card image uploaded! Click "Save PAN Details" to apply.');
      } else {
        setPanError('Upload did not return a valid URL.');
      }
    } catch (err) {
      setPanError(err.response?.data?.message || 'Failed to upload PAN card. Please try again.');
    } finally {
      setUploadingPan(false);
      e.target.value = '';
    }
  };

  const handleRemovePanCard = () => {
    setProfile((prev) => ({ ...prev, panCardImage: '' }));
    setPanSuccessNotice('PAN card image removed. Click "Save PAN Details" to apply changes.');
  };

  const handleSavePan = async (e) => {
    if (e) e.preventDefault();
    const pan = (profile.panNumber || '').trim().toUpperCase();
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      setPanError('Please enter a valid 10-character Indian PAN number (e.g. ABCDE1234F).');
      return;
    }

    setSavingPan(true);
    setPanError('');
    setPanSuccessNotice('');
    try {
      const { data } = await api.put('/auth/profile', {
        panNumber: pan,
        panCardImage: profile.panCardImage || '',
      });
      if (data?.user) {
        updateUser(data.user);
        setProfile((prev) => ({
          ...prev,
          panNumber: data.user.panNumber || '',
          panCardImage: data.user.panCardImage || '',
        }));
      }
      setPanSuccessNotice('PAN card & KYC compliance details updated successfully!');
    } catch (err) {
      setPanError(err.response?.data?.message || 'Failed to update PAN details.');
    } finally {
      setSavingPan(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  const openTicketCount = tickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length;
  const tabs = [
    ['orders', 'My orders', Package],
    ['support', `Support tickets${openTicketCount ? ` (${openTicketCount})` : ''}`, LifeBuoy],
    ['addresses', 'Address book', MapPin],
    ['profile', 'My profile', User],
  ];

  return (
    <section className="bg-[#FAF7F4] py-8 sm:py-12 min-h-[70vh]">
      <div className="container-bl">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FAF7F2] border-2 border-[#C9A44A]/40 overflow-hidden flex items-center justify-center font-display font-bold text-2xl sm:text-3xl text-[#930303] shadow-sm shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || 'Customer'} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-[#930303] font-semibold">My account</p>
              <h1 className="font-display text-2xl sm:text-3xl mt-1 text-stone-900">Hello, {user?.name}</h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">Your jewellery, orders, support tickets and details. All in one place.</p>
            </div>
          </div>
          <button type="button" onClick={logout} className="flex items-center gap-2 text-sm text-stone-600 hover:text-[#930303] cursor-pointer self-start sm:self-center transition-colors">
            <LogOut size={16} />
            Sign out
          </button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
          {[
            ['Orders', orders.length],
            ['On the way', orders.filter((o) => ['shipped', 'out_for_delivery'].includes(o.status)).length],
            ['Support tickets', tickets.length],
            ['Saved favourites', wishlist.length],
          ].map(([label, value]) => (
            <div key={label} className="p-5 bg-white border border-stone-200 rounded-2xl">
              <p className="text-xs text-stone-500">{label}</p>
              <p className="text-2xl font-semibold mt-2 text-[#930303]">{loading ? '—' : value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[235px_1fr] gap-6">
          <nav className="flex flex-wrap lg:flex-col gap-2 self-start bg-white border rounded-2xl p-3">
            {tabs.map(([id, label, Icon]) => (
              <button
                type="button"
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-3 p-3 text-sm rounded-xl text-left cursor-pointer ${
                  tab === id ? 'bg-[#930303] text-white' : 'hover:bg-stone-50'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
            <Link to="/wishlist" className="flex gap-3 p-3 text-sm hover:bg-stone-50 rounded-xl">
              <Heart size={18} />
              Wishlist
            </Link>
            <Link to="/contact" className="flex gap-3 p-3 text-sm hover:bg-stone-50 rounded-xl">
              <ArrowUpRight size={18} />
              Showroom inquiry
            </Link>
          </nav>

          <div className="min-w-0 space-y-4">
            {error && (
              <p role="alert" className="bg-red-50 text-red-800 p-4 rounded-xl text-sm">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="bg-green-50 text-green-800 p-4 rounded-xl text-sm">
                {notice}
              </p>
            )}
            {loading ? (
              <p role="status">Loading your account…</p>
            ) : (
              <>
                {tab === 'orders' && (
                  <>
                    <h2 className="text-xl font-semibold">Order history</h2>
                    {!orders.length && (
                      <div className="bg-white rounded-2xl border p-10 text-center">
                        <Package className="mx-auto text-[#930303]" />
                        <h3 className="text-lg mt-4">Your first favourite awaits</h3>
                        <p className="text-stone-500 text-sm my-3">Your orders will appear here after checkout.</p>
                        <Link to="/collections" className="text-[#930303] underline">
                          Explore jewellery
                        </Link>
                      </div>
                    )}
                    {orders.map((o) => (
                      <article key={o._id} className="bg-white border rounded-2xl p-5 space-y-4">
                        <div className="flex flex-wrap justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">{o.orderNumber}</h3>
                            <p className="text-xs text-stone-500">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-[#930303] capitalize">{o.status?.replaceAll('_', ' ')}</p>
                            <p className="font-semibold">{money(o.pricing?.total)}</p>
                          </div>
                        </div>
                        {o.items?.map((i, n) => (
                          <div key={n} className="flex items-center gap-3 text-sm">
                            {i.snapshot?.image && (
                              <img src={i.snapshot.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            )}
                            <div>
                              <p>{i.snapshot?.name}</p>
                              <p className="text-stone-500 text-xs">
                                Quantity {i.quantity} · {money(i.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-3 text-xs text-stone-500">
                          Payment: {o.payment?.status || 'Status unavailable'}
                          {o.tracking?.trackingId && (
                            <p className="mt-2">
                              {o.tracking.carrier} · Tracking: {o.tracking.trackingId}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-[#930303]">
                          <Link to={`/order/success/${o._id}`}>Order details & receipt</Link>
                          <button
                            type="button"
                            onClick={() => {
                              setTicketForm({
                                ...emptyTicket,
                                category: 'Order & Delivery',
                                orderNumber: o.orderNumber || '',
                                subject: `Help with Order ${o.orderNumber}`,
                              });
                              setShowNewTicket(true);
                              setTab('support');
                            }}
                            className="cursor-pointer hover:underline"
                          >
                            Need help with this order?
                          </button>
                          {['placed', 'confirmed'].includes(o.status) && (
                            <button type="button" disabled={busy} onClick={() => action(o._id, 'cancel')}>
                              Cancel order
                            </button>
                          )}
                          {o.status === 'delivered' && (
                            <button type="button" disabled={busy} onClick={() => action(o._id, 'return')}>
                              Request a return
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-stone-500">Returns and refunds are subject to store review and policy.</p>
                      </article>
                    ))}
                  </>
                )}

                {tab === 'support' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <h2 className="text-xl font-semibold">Support Tickets & Inquiries</h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Raise a ticket or track responses to your contact form inquiries in one place.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewTicket((v) => !v)}
                        className="inline-flex items-center gap-2 bg-[#930303] hover:bg-[#7A0303] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
                      >
                        <Plus size={15} />
                        <span>{showNewTicket ? 'Close Form' : 'Raise Support Ticket'}</span>
                      </button>
                    </div>

                    {showNewTicket && (
                      <form
                        onSubmit={handleCreateTicket}
                        aria-labelledby="new-ticket-heading"
                        className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4"
                      >
                        <h3 id="new-ticket-heading" className="text-base font-semibold text-stone-900">
                          New Support Ticket
                        </h3>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="tkt-category" className="block text-xs font-medium text-stone-700 mb-1">
                              Category
                            </label>
                            <select
                              id="tkt-category"
                              name="category"
                              value={ticketForm.category}
                              onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                              className="w-full border border-stone-300 rounded-xl p-2.5 text-base sm:text-sm bg-white"
                            >
                              <option value="Order & Delivery">Order & Delivery</option>
                              <option value="BIS Hallmark & Purity">BIS Hallmark & Purity</option>
                              <option value="Sizing & Custom Jewellery">Sizing & Custom Jewellery</option>
                              <option value="Return / Exchange / Refund">Return / Exchange / Refund</option>
                              <option value="General Concierge">General Concierge</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="tkt-order" className="block text-xs font-medium text-stone-700 mb-1">
                              Related Order (optional)
                            </label>
                            <select
                              id="tkt-order"
                              name="orderNumber"
                              value={ticketForm.orderNumber}
                              onChange={(e) => setTicketForm({ ...ticketForm, orderNumber: e.target.value })}
                              className="w-full border border-stone-300 rounded-xl p-2.5 text-base sm:text-sm bg-white"
                            >
                              <option value="">No specific order</option>
                              {orders.map((ord) => (
                                <option key={ord._id} value={ord.orderNumber}>
                                  {ord.orderNumber} ({money(ord.pricing?.total)})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="tkt-priority" className="block text-xs font-medium text-stone-700 mb-1">
                              Priority
                            </label>
                            <select
                              id="tkt-priority"
                              name="priority"
                              value={ticketForm.priority}
                              onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                              className="w-full border border-stone-300 rounded-xl p-2.5 text-base sm:text-sm bg-white"
                            >
                              <option value="normal">Normal</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="tkt-subject" className="block text-xs font-medium text-stone-700 mb-1">
                            Subject <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="tkt-subject"
                            name="subject"
                            type="text"
                            required
                            value={ticketForm.subject}
                            onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                            placeholder="Brief summary of your request..."
                            className="w-full border border-stone-300 rounded-xl p-2.5 text-base sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="tkt-message" className="block text-xs font-medium text-stone-700 mb-1">
                            Describe Your Concern <span aria-hidden="true">*</span>
                          </label>
                          <textarea
                            id="tkt-message"
                            name="message"
                            rows={4}
                            required
                            value={ticketForm.message}
                            onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                            placeholder="Share details so our jewellery concierge can resolve this quickly..."
                            className="w-full border border-stone-300 rounded-xl p-2.5 text-base sm:text-sm"
                          />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={busy}
                            className="bg-[#930303] hover:bg-[#7A0303] disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer"
                          >
                            {busy ? 'Submitting…' : 'Submit Ticket'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewTicket(false)}
                            className="text-xs text-stone-600 px-4 py-2.5 rounded-xl border border-stone-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {!tickets.length && !showNewTicket ? (
                      <div className="bg-white rounded-2xl border p-10 text-center space-y-3">
                        <LifeBuoy className="mx-auto text-[#930303]" size={28} />
                        <h3 className="text-lg font-medium">No support tickets or inquiries yet</h3>
                        <p className="text-stone-500 text-sm max-w-md mx-auto">
                          Have a question about an order, custom sizing, or hallmarking? Raise a ticket and our concierge team will respond directly here.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowNewTicket(true)}
                          className="inline-flex items-center gap-2 bg-[#930303] text-white text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer"
                        >
                          <Plus size={15} />
                          <span>Raise Support Ticket</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tickets.map((t) => (
                          <article key={t._id} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
                            <div className="flex flex-wrap justify-between items-start gap-3">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-mono font-semibold text-[#930303]">{t.ticketNumber}</span>
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
                                    {t.type === 'contact' ? 'Contact Inquiry' : 'Support Ticket'}
                                  </span>
                                  {t.orderNumber && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E9DED2] text-stone-700">
                                      Order: {t.orderNumber}
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-semibold text-stone-900">{t.subject}</h3>
                                <p className="text-xs text-stone-500">
                                  {t.category} · {new Date(t.createdAt).toLocaleString('en-IN')}
                                </p>
                              </div>
                              <span
                                className={`text-xs capitalize font-medium px-2.5 py-1 rounded-full border ${
                                  STATUS_BADGE[t.status] || STATUS_BADGE.open
                                }`}
                              >
                                {t.status?.replaceAll('_', ' ')}
                              </span>
                            </div>

                            <div className="rounded-xl bg-[#FAF7F2] border border-[#E9DED2] p-3.5 text-sm text-stone-800 whitespace-pre-line">
                              {t.message}
                            </div>

                            {Array.isArray(t.replies) && t.replies.length > 0 && (
                              <div className="space-y-2.5 pl-3 border-l-2 border-[#D4AF66]">
                                {t.replies.map((rep, idx) => (
                                  <div
                                    key={rep._id || idx}
                                    className={`rounded-xl p-3 text-sm ${
                                      rep.senderRole === 'admin'
                                        ? 'bg-[#FFF6F2] border border-[#EADBD4]'
                                        : 'bg-stone-50 border border-stone-200'
                                    }`}
                                  >
                                    <div className="flex flex-wrap justify-between gap-2 text-xs mb-1">
                                      <span className={`font-semibold ${rep.senderRole === 'admin' ? 'text-[#930303]' : 'text-stone-800'}`}>
                                        {rep.senderRole === 'admin' ? `${rep.senderName || 'BL Jewels Concierge'} (Admin)` : 'You'}
                                      </span>
                                      <span className="text-stone-400">
                                        {rep.createdAt ? new Date(rep.createdAt).toLocaleString('en-IN') : ''}
                                      </span>
                                    </div>
                                    <p className="text-stone-700 whitespace-pre-line">{rep.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            <form onSubmit={(e) => handleCustomerReply(e, t._id)} className="flex flex-col sm:flex-row gap-2 pt-1">
                              <label htmlFor={`reply-${t._id}`} className="sr-only">
                                Follow-up reply
                              </label>
                              <input
                                id={`reply-${t._id}`}
                                name="reply"
                                type="text"
                                value={replyDrafts[t._id] || ''}
                                onChange={(e) => setReplyDrafts({ ...replyDrafts, [t._id]: e.target.value })}
                                placeholder="Write a follow-up message..."
                                className="flex-1 border border-stone-300 rounded-xl px-3.5 py-2 text-base sm:text-sm"
                              />
                              <button
                                type="submit"
                                disabled={busy || !(replyDrafts[t._id] || '').trim()}
                                className="inline-flex items-center justify-center gap-1.5 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                              >
                                <Send size={13} />
                                <span>Send Reply</span>
                              </button>
                            </form>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'profile' && (
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-stone-900 font-display">Personal Details & Profile</h2>
                      <p className="text-xs text-stone-500 mt-1">
                        Manage your profile photo and contact information.
                      </p>
                    </div>

                    {/* Profile Picture / Avatar Management */}
                    <div className="p-5 bg-gradient-to-br from-[#FAF7F2] to-[#F5ECE1] rounded-2xl border border-[#E9DED2] flex flex-col sm:flex-row items-center gap-5">
                      <div className="relative group shrink-0">
                        <div className="w-24 h-24 rounded-full bg-white border-2 border-[#C9A44A] shadow-md overflow-hidden flex items-center justify-center font-display font-bold text-3xl text-[#930303]">
                          {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            profile.name?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        {uploadingAvatar && (
                          <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white">
                            <Loader2 className="w-6 h-6 animate-spin text-[#C9A44A]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#930303] hover:bg-[#7A0303] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs">
                            <UploadCloud size={15} />
                            <span>{uploadingAvatar ? 'Uploading…' : profile.avatar ? 'Change Profile Photo' : 'Upload Profile Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingAvatar}
                              onChange={handleAvatarUpload}
                              className="sr-only"
                            />
                          </label>

                          {profile.avatar && (
                            <button
                              type="button"
                              disabled={uploadingAvatar}
                              onClick={handleRemoveAvatar}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                              title="Remove profile photo"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-stone-500 font-body">
                          Supported formats: JPEG, PNG, WEBP (Max 5MB). Stored securely on Cloudinary CDN.
                        </p>

                        {avatarError && (
                          <p className="text-xs text-rose-600 font-medium">
                            ⚠️ {avatarError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Protected Personal Details Notice & Support Trigger */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50/40 rounded-2xl border border-[#C9A44A]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                          <Lock className="w-4 h-4 text-[#930303]" />
                          <span>Personal Details Are Protected</span>
                        </div>
                        <p className="text-xs text-stone-600 max-w-xl">
                          To update your registered Full Name or Mobile Phone, please submit a support ticket. For security and billing compliance, our administration team verifies and updates customer records directly.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTicketForm({
                            category: 'Account & Profile Update',
                            orderNumber: '',
                            priority: 'normal',
                            subject: 'Request to update personal details (Name / Phone)',
                            message: `Hello Support Team,\n\nI would like to request an official update to my registered account details:\n\n• Current Registered Name: ${user.name}\n• Current Registered Phone: ${user.phone || 'Not added'}\n• Registered Email: ${user.email}\n\nRequested Updates:\n• New Full Name: \n• New Phone Number: \n• Reason for Change: \n\nPlease verify and update my account details.\nThank you!`,
                          });
                          setShowNewTicket(true);
                          setTab('support');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs shrink-0"
                      >
                        <LifeBuoy size={14} />
                        <span>Request Detail Change</span>
                      </button>
                    </div>

                    {/* Verified Customer Details (Read-only for security) */}
                    <div className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            <span>Full Name</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 font-normal lowercase">
                              <Lock size={11} className="text-stone-400" />
                              locked
                            </span>
                          </label>
                          <div className="w-full border border-stone-200 bg-stone-100/70 rounded-xl px-4 py-2.5 text-sm text-stone-800 font-medium select-text cursor-not-allowed">
                            {user.name}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            <span>Phone Number</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 font-normal lowercase">
                              <Lock size={11} className="text-stone-400" />
                              locked
                            </span>
                          </label>
                          <div className="w-full border border-stone-200 bg-stone-100/70 rounded-xl px-4 py-2.5 text-sm text-stone-800 font-medium select-text cursor-not-allowed">
                            {user.phone || 'No phone number added'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Verified Email Address</span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <CheckCircle2 size={12} />
                            verified
                          </span>
                        </label>
                        <div className="w-full border border-stone-200 bg-stone-100/70 rounded-xl px-4 py-2.5 text-sm text-stone-800 font-medium select-text cursor-not-allowed">
                          {user.email}
                        </div>
                      </div>

                      {/* Government PAN Card & KYC Compliance Section */}
                      <div className="p-5 sm:p-6 bg-gradient-to-br from-[#FAF7F2] to-[#FFFDFB] rounded-2xl border border-[#E9DED2] space-y-5 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9DED2]">
                          <div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-[#930303]" />
                              <h3 className="font-display font-bold text-base sm:text-lg text-stone-900">
                                Government PAN Card &amp; KYC Compliance
                              </h3>
                            </div>
                            <p className="text-xs text-stone-600 mt-1 max-w-xl leading-relaxed">
                              As per Indian Income Tax guidelines (Rule 114B), submitting your PAN card details is required for fine jewellery purchases exceeding ₹2,00,000. Verified for insured armored transit and official GST billing.
                            </p>
                          </div>

                          <div className="shrink-0">
                            {profile.panNumber && profile.panCardImage ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                <span>KYC Complete (PAN On File)</span>
                              </span>
                            ) : profile.panNumber ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <AlertCircle size={13} className="text-amber-600" />
                                <span>PAN Number Added (Upload Photo)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                                <span>Pending PAN Submission</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                          {/* PAN Card Number */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                              PAN Card Number *
                            </label>
                            <input
                              type="text"
                              maxLength={10}
                              value={profile.panNumber || ''}
                              onChange={handlePanNumberChange}
                              placeholder="e.g. ABCDE1234F"
                              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl font-mono text-sm uppercase tracking-widest font-bold text-stone-900 focus:outline-none focus:border-[#930303] shadow-xs"
                            />
                            {profile.panNumber && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profile.panNumber) ? (
                              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 pt-0.5">
                                <CheckCircle2 size={12} />
                                <span>Valid Indian PAN format</span>
                              </p>
                            ) : profile.panNumber ? (
                              <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1 pt-0.5">
                                <AlertCircle size={12} />
                                <span>Enter complete 10 alphanumeric characters (5 letters, 4 digits, 1 letter)</span>
                              </p>
                            ) : (
                              <p className="text-[11px] text-stone-500 pt-0.5">
                                Format: 5 uppercase letters, 4 numbers, 1 letter (e.g. ABCDE1234F)
                              </p>
                            )}
                          </div>

                          {/* PAN Card Photo Upload */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                              PAN Card Document Copy / Photo
                            </label>

                            {profile.panCardImage ? (
                              <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={profile.panCardImage}
                                    alt="PAN Card Preview"
                                    className="w-16 h-12 rounded-lg object-cover border border-stone-300 shadow-xs shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-stone-800 flex items-center gap-1">
                                      <CheckCircle2 size={12} className="text-emerald-600" />
                                      <span>Document Uploaded</span>
                                    </p>
                                    <p className="text-[11px] text-stone-500 truncate">
                                      Secured on Cloudinary CDN
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <a
                                    href={profile.panCardImage}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg transition-colors"
                                    title="View full document"
                                  >
                                    <Eye size={13} />
                                    <span>View</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={handleRemovePanCard}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors cursor-pointer"
                                    title="Remove PAN card photo"
                                  >
                                    <Trash2 size={13} />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-[#C9A44A]/60 hover:border-[#930303] rounded-xl bg-white cursor-pointer transition-colors text-center group">
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={uploadingPan}
                                  onChange={handlePanCardUpload}
                                  className="sr-only"
                                />
                                {uploadingPan ? (
                                  <div className="flex items-center gap-2 text-xs text-[#930303] font-semibold py-1">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Uploading PAN Card…</span>
                                  </div>
                                ) : (
                                  <>
                                    <UploadCloud className="w-6 h-6 text-[#C9A44A] group-hover:text-[#930303] transition-colors mb-0.5" />
                                    <span className="text-xs font-semibold text-stone-700">
                                      Upload PAN Card Photo / Scan
                                    </span>
                                    <span className="text-[11px] text-stone-400">
                                      Supported formats: JPEG, PNG, WEBP (Max 5MB)
                                    </span>
                                  </>
                                )}
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Error & Success Feedback */}
                        {panError && (
                          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                            ⚠️ {panError}
                          </p>
                        )}
                        {panSuccessNotice && (
                          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium">
                            ✓ {panSuccessNotice}
                          </p>
                        )}

                        {/* Save Button */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <p className="text-[11px] text-stone-500">
                            PAN details are securely stored and verified for high-value invoice compliance.
                          </p>
                          <button
                            type="button"
                            disabled={savingPan || uploadingPan}
                            onClick={handleSavePan}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs"
                          >
                            {savingPan ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <ShieldCheck size={14} />
                            )}
                            <span>{savingPan ? 'Saving KYC Details…' : 'Save PAN Details'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2 text-xs text-stone-500 border-t border-stone-100">
                        <ShieldCheck size={14} className="text-[#C9A44A]" />
                        <span>All customer identity records are encrypted &amp; verified by BL Jewels Agra Flagship.</span>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'addresses' && (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Address book</h2>
                      <button
                        type="button"
                        disabled={busy || addresses.length >= 10}
                        onClick={() => {
                          setEditIndex(-1);
                          setAddress({ ...emptyAddress, name: user.name, phone: user.phone || '' });
                        }}
                        className="text-sm text-[#930303]"
                      >
                        + Add address
                      </button>
                    </div>
                    {!addresses.length && !address && (
                      <p className="bg-white border rounded-2xl p-8 text-stone-500">No saved addresses yet.</p>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map((a, i) => (
                        <article key={a._id || i} className="bg-white border rounded-2xl p-5 space-y-2">
                          <p className="text-xs text-[#930303]">
                            {a.label}
                            {i === 0 ? ' · Default' : ''}
                          </p>
                          <h3 className="font-semibold">{a.name}</h3>
                          <p className="text-sm text-stone-500">
                            {[a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-sm">{a.phone}</p>
                          <div className="flex gap-4 text-xs text-[#930303] pt-3">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                setEditIndex(i);
                                setAddress(a);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => run(() => saveAddresses(addresses.filter((_, n) => n !== i)))}
                            >
                              Remove
                            </button>
                            {i > 0 && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  run(() => saveAddresses([a, ...addresses.filter((_, n) => n !== i)]))
                                }
                              >
                                Make default
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                    {address && (
                      <form
                        className="bg-white border rounded-2xl p-6 grid sm:grid-cols-2 gap-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          run(() =>
                            saveAddresses(
                              editIndex < 0 ? [...addresses, address] : addresses.map((a, i) => (i === editIndex ? address : a))
                            )
                          );
                        }}
                      >
                        <h3 className="sm:col-span-2 font-semibold">{editIndex < 0 ? 'New' : 'Edit'} address</h3>
                        <label className="text-sm">
                          Label
                          <select
                            value={address.label}
                            onChange={(e) => setAddress({ ...address, label: e.target.value })}
                            className="block border rounded-xl p-3 w-full mt-1"
                          >
                            {['Home', 'Office', 'Other'].map((l) => (
                              <option key={l}>{l}</option>
                            ))}
                          </select>
                        </label>
                        {Object.keys(emptyAddress)
                          .filter((k) => k !== 'label')
                          .map((k) => (
                            <label key={k} className="text-sm capitalize">
                              {{ line1: 'Street address', line2: 'Apartment / landmark', pincode: 'PIN code' }[k] || k}
                              <input
                                required={k !== 'line2'}
                                value={address[k] || ''}
                                onChange={(e) => setAddress({ ...address, [k]: e.target.value })}
                                className="block border rounded-xl p-3 w-full mt-1"
                              />
                            </label>
                          ))}
                        <div className="sm:col-span-2 flex gap-4">
                          <button disabled={busy} className="bg-[#930303] text-white px-5 py-3 rounded-xl">
                            Save address
                          </button>
                          <button type="button" onClick={() => setAddress(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
