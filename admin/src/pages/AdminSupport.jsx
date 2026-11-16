import React, { useEffect, useRef, useState } from 'react';
import {
  LifeBuoy,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  ShoppingBag,
  X,
  Eye,
  Video,
  Camera,
  Paperclip,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { ticketService } from '../services/api';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'replied', label: 'Replied' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const STATUS_BADGES = {
  open: 'bg-amber-50 text-amber-800 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-800 border-blue-200',
  replied: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  resolved: 'bg-stone-100 text-stone-700 border-stone-200',
  closed: 'bg-stone-100 text-stone-500 border-stone-200',
};

const PRIORITY_BADGES = {
  normal: 'bg-stone-100 text-stone-600',
  high: 'bg-amber-100 text-amber-800',
  urgent: 'bg-red-100 text-red-800',
};

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    replied: 0,
    resolved: 0,
    contactCount: 0,
    ticketCount: 0,
  });
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('replied');
  const [sendEmail, setSendEmail] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDeleteTicket, setConfirmDeleteTicket] = useState(null);
  const deleteDialogRef = useRef(null);

  const showToast = (message, kind = 'success') => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTickets = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await ticketService.getAll({
        type: typeFilter,
        status: statusFilter,
        search: search.trim() || undefined,
      });
      const list = res.data || [];
      setTickets((prev) => {
        const prevStr = JSON.stringify(prev.map(t => ({ id: t._id, rCount: t.replies?.length, status: t.status, updatedAt: t.updatedAt })));
        const newStr = JSON.stringify(list.map(t => ({ id: t._id, rCount: t.replies?.length, status: t.status, updatedAt: t.updatedAt })));
        return prevStr !== newStr ? list : prev;
      });
      if (res.stats) setStats(res.stats);
      setSmtpConfigured(Boolean(res.smtpConfigured));
      if (!isBackground) {
        if (list.length > 0 && (!selectedId || !list.some((t) => t._id === selectedId))) {
          setSelectedId(list[0]._id);
        } else if (list.length === 0) {
          setSelectedId(null);
        }
      }
    } catch (err) {
      if (!isBackground) {
        showToast(err.response?.data?.message || 'Failed to load inquiries & tickets', 'error');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(false);

    // Live Real-Time Chat Sync (Every 2 seconds, silent without refresh)
    const syncInterval = setInterval(() => {
      if (!document.hidden) {
        fetchTickets(true);
      }
    }, 2000);

    return () => clearInterval(syncInterval);
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    const dialog = deleteDialogRef.current;
    if (!dialog) return;
    if (confirmDeleteTicket && !dialog.open) {
      dialog.showModal();
    } else if (!confirmDeleteTicket && dialog.open) {
      dialog.close();
    }
  }, [confirmDeleteTicket]);

  const selectedTicket = tickets.find((t) => t._id === selectedId) || null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleStatusChange = async (ticketId, nextStatus) => {
    setBusy(true);
    try {
      const res = await ticketService.updateStatus(ticketId, { status: nextStatus });
      if (res.data) {
        setTickets((prev) => prev.map((t) => (t._id === ticketId ? res.data : t)));
        showToast(`Status updated to ${nextStatus.replaceAll('_', ' ')}.`);
        fetchTickets();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Status update failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    setBusy(true);
    try {
      const res = await ticketService.reply(selectedTicket._id, {
        message: replyText.trim(),
        status: replyStatus,
        sendEmail,
      });
      if (res.data) {
        setTickets((prev) => prev.map((t) => (t._id === selectedTicket._id ? res.data : t)));
        setReplyText('');
        const emailSuffix = res.emailSent
          ? ' Customer emailed.'
          : selectedTicket.email
            ? ' Saved to customer dashboard (SMTP not configured for email).'
            : ' Saved to customer dashboard.';
        showToast(`Reply posted.${emailSuffix}`);
        fetchTickets();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send reply', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteTicket) return;
    setBusy(true);
    try {
      await ticketService.remove(confirmDeleteTicket._id);
      setTickets((prev) => prev.filter((t) => t._id !== confirmDeleteTicket._id));
      if (selectedId === confirmDeleteTicket._id) setSelectedId(null);
      setConfirmDeleteTicket(null);
      showToast('Ticket / inquiry deleted.');
      fetchTickets();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        dialog.support-confirm-dialog:modal { overscroll-behavior: contain; }
        dialog.support-confirm-dialog::backdrop {
          background: rgba(20, 14, 11, 0.55);
          overflow: hidden;
          overscroll-behavior: contain;
        }
      `}</style>

      {toast && (
        <div
          role={toast.kind === 'error' ? 'alert' : 'status'}
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-medium border flex items-center gap-2 ${
            toast.kind === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.kind === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#930303] flex items-center gap-1.5">
            <LifeBuoy size={13} />
            <span>Unified Customer Support Inbox</span>
          </p>
          <h1 className="text-2xl font-bold text-stone-900 mt-1">Support Tickets & Contact Inquiries</h1>
          <p className="text-xs text-stone-500 mt-1">
            All Contact Us appointments and logged-in customer support tickets arrive here so your team can reply from one workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Chat Active</span>
          </span>
          <button
            type="button"
            onClick={() => fetchTickets(false)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Records', val: stats.total, accent: 'text-stone-900' },
          { label: 'Open / New', val: stats.open, accent: 'text-amber-700' },
          { label: 'Replied', val: stats.replied, accent: 'text-emerald-700' },
          { label: 'User Tickets', val: stats.ticketCount, accent: 'text-[#930303]' },
          { label: 'Contact Forms', val: stats.contactCount, accent: 'text-[#930303]' },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="text-xs text-stone-500">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.accent}`}>{card.val}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            ['all', 'All Inbox'],
            ['ticket', 'User Support Tickets'],
            ['contact', 'Contact Form Inquiries'],
          ].map(([key, label]) => (
            <button
              type="button"
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                typeFilter === key
                  ? 'bg-[#930303] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label htmlFor="support-status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="support-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2 text-xs bg-stone-50 text-stone-800"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <search>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
              <label htmlFor="support-search-input" className="sr-only">
                Search tickets or contact inquiries
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="support-search-input"
                  name="q"
                  type="search"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, ref #, order..."
                  className="pl-8 pr-3 py-2 border border-stone-200 rounded-xl text-xs w-56 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#930303]"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium cursor-pointer"
              >
                Search
              </button>
            </form>
          </search>
        </div>
      </div>

      {/* Master-Detail Workspace */}
      <div className="grid lg:grid-cols-[400px_1fr] gap-5 items-start">
        {/* Left List */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100 max-h-[680px] overflow-y-auto">
          {loading ? (
            <p className="p-8 text-center text-xs text-stone-500">Loading inbox…</p>
          ) : tickets.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <MessageSquare className="mx-auto text-stone-300" size={28} />
              <p className="text-sm font-medium text-stone-700">No inquiries or tickets found</p>
              <p className="text-xs text-stone-500">Try clearing filters or waiting for new submissions.</p>
            </div>
          ) : (
            tickets.map((t) => {
              const active = selectedId === t._id;
              return (
                <button
                  type="button"
                  key={t._id}
                  onClick={() => setSelectedId(t._id)}
                  className={`w-full text-left p-4 transition space-y-1.5 cursor-pointer ${
                    active ? 'bg-[#FFF6F2] border-l-4 border-[#930303]' : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#930303]">{t.ticketNumber}</span>
                    <span
                      className={`text-[10px] capitalize font-semibold px-2 py-0.5 rounded-full border ${
                        STATUS_BADGES[t.status] || STATUS_BADGES.open
                      }`}
                    >
                      {t.status?.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-stone-900 line-clamp-1">{t.subject}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                    <span>
                      {t.name} ·{' '}
                      <strong className="font-medium text-stone-700">
                        {t.type === 'contact' ? 'Contact Form' : 'Support Ticket'}
                      </strong>
                    </span>
                    <span>{t.replies?.length || 0} replies</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Detail & Reply Thread */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 min-h-[480px]">
          {!selectedTicket ? (
            <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center text-stone-500 space-y-2">
              <LifeBuoy size={32} className="text-stone-300" />
              <p className="text-sm font-medium text-stone-700">Select a ticket or contact inquiry</p>
              <p className="text-xs max-w-sm">
                Click any item on the left to inspect customer details, order reference, conversation history, and send your reply.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Top Meta */}
              <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-stone-100">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#930303] bg-[#FFF6F2] px-2.5 py-0.5 rounded-full border border-[#EADBD4]">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {selectedTicket.type === 'contact' ? 'Contact Form Inquiry' : 'User Support Ticket'}
                    </span>
                    <span
                      className={`text-[11px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                        PRIORITY_BADGES[selectedTicket.priority] || PRIORITY_BADGES.normal
                      }`}
                    >
                      {selectedTicket.priority || 'normal'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-900">{selectedTicket.subject}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                    <span className="inline-flex items-center gap-1">
                      <User size={13} className="text-[#930303]" />
                      {selectedTicket.name}
                    </span>
                    {selectedTicket.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail size={13} className="text-[#930303]" />
                        {selectedTicket.email}
                      </span>
                    )}
                    {selectedTicket.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={13} className="text-[#930303]" />
                        {selectedTicket.phone}
                      </span>
                    )}
                    {selectedTicket.orderNumber && (
                      <span className="inline-flex items-center gap-1 font-medium text-stone-800">
                        <ShoppingBag size={13} className="text-[#930303]" />
                        Order: {selectedTicket.orderNumber}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-stone-400">
                      <Clock size={13} />
                      {new Date(selectedTicket.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="detail-status-select" className="sr-only">
                    Change status
                  </label>
                  <select
                    id="detail-status-select"
                    disabled={busy}
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                    className="border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold bg-white text-stone-800"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmDeleteTicket(selectedTicket)}
                    aria-label="Delete inquiry"
                    className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-red-700 hover:border-red-200 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Return Reasons Callout */}
              {Array.isArray(selectedTicket.returnReasons) && selectedTicket.returnReasons.length > 0 && (
                <div className="rounded-2xl bg-red-50/70 border border-red-200 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-red-900 font-bold text-xs uppercase tracking-wider">
                    <ShieldAlert size={15} className="text-[#930303]" />
                    <span>Return & Refund Issues Specified by Customer</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTicket.returnReasons.map((r, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white text-red-900 font-medium border border-red-200 shadow-2xs"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Original Customer Message */}
              <div className="rounded-2xl bg-[#FAF7F2] border border-[#E9DED2] p-4 space-y-3">
                <div className="flex justify-between text-xs text-stone-500">
                  <span className="font-semibold text-stone-800">Initial Customer Message ({selectedTicket.category})</span>
                  <span>{new Date(selectedTicket.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-sm text-stone-800 whitespace-pre-line leading-relaxed">{selectedTicket.message}</p>

                {/* Customer Attached Proof */}
                {Array.isArray(selectedTicket.attachments) && selectedTicket.attachments.length > 0 && (
                  <div className="pt-3 border-t border-[#E9DED2] space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                      <Camera size={14} className="text-[#930303]" />
                      <span>Customer Attached Proof ({selectedTicket.attachments.length} files)</span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {selectedTicket.attachments.map((att, aIdx) => (
                        <div
                          key={aIdx}
                          className="rounded-xl overflow-hidden border border-stone-200 bg-white shadow-2xs"
                        >
                          {att.fileType === 'video' ? (
                            <div className="space-y-1">
                              <video
                                src={att.url}
                                controls
                                className="w-full aspect-video object-cover bg-black"
                                preload="metadata"
                              />
                              <p className="text-[10px] text-stone-600 px-1.5 py-0.5 truncate">
                                {att.originalName || 'Unboxing Video'}
                              </p>
                            </div>
                          ) : (
                            <div
                              onClick={() => setLightboxImage(att.url)}
                              className="relative aspect-video bg-stone-100 cursor-pointer overflow-hidden group"
                            >
                              <img
                                src={att.url}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-5 h-5 text-white drop-shadow" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Conversation Thread */}
              {Array.isArray(selectedTicket.replies) && selectedTicket.replies.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Conversation History</p>
                  <div className="space-y-2.5">
                    {selectedTicket.replies.map((rep, idx) => (
                      <div
                        key={rep._id || idx}
                        className={`rounded-2xl p-4 text-sm border space-y-2 ${
                          rep.senderRole === 'admin'
                            ? 'bg-[#FFF6F2] border-[#EADBD4] ml-4'
                            : 'bg-stone-50 border-stone-200 mr-4'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className={`font-semibold ${rep.senderRole === 'admin' ? 'text-[#930303]' : 'text-stone-800'}`}>
                            {rep.senderRole === 'admin'
                              ? `${rep.senderName || 'BL Jewels Concierge'} (Admin Reply)`
                              : `${rep.senderName || selectedTicket.name} (Customer)`}
                          </span>
                          <span className="text-stone-400">
                            {rep.createdAt ? new Date(rep.createdAt).toLocaleString('en-IN') : ''}
                          </span>
                        </div>
                        <p className="text-stone-700 whitespace-pre-line leading-relaxed">{rep.message}</p>

                        {/* Attached Proof in Replies */}
                        {Array.isArray(rep.attachments) && rep.attachments.length > 0 && (
                          <div className="pt-2 border-t border-stone-200/60 space-y-1.5">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                              Attached Files ({rep.attachments.length})
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {rep.attachments.map((att, aIdx) => (
                                <div
                                  key={aIdx}
                                  className="rounded-lg overflow-hidden border border-stone-200 bg-white shadow-2xs"
                                >
                                  {att.fileType === 'video' ? (
                                    <video
                                      src={att.url}
                                      controls
                                      className="w-full aspect-video object-cover bg-black"
                                      preload="metadata"
                                    />
                                  ) : (
                                    <div
                                      onClick={() => setLightboxImage(att.url)}
                                      className="relative aspect-video bg-stone-100 cursor-pointer overflow-hidden group"
                                    >
                                      <img
                                        src={att.url}
                                        alt=""
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Eye className="w-4 h-4 text-white" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Reply Composer */}
              <form onSubmit={handleReplySubmit} className="pt-4 border-t border-stone-200 space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label htmlFor="admin-reply-message" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Send Official Reply
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyText(
                          `Dear ${selectedTicket.name},\n\nTo verify and process your return/refund immediately, please attach 4 clear photos of the defect and BIS hallmark, along with the parcel unboxing video using the "Attach Proof" button in your customer dashboard.\n\nOur concierge team is standing by to resolve this.\n\nWarm regards,\nBL Jewels Concierge Team`
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-semibold cursor-pointer transition-colors"
                      title="Insert message asking customer to attach photos and unboxing video"
                    >
                      <Sparkles size={12} className="text-amber-700" />
                      <span>Ask Customer for Unboxing Video & Photos</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedTicket.email && (
                      <label className="inline-flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendEmail}
                          onChange={(e) => setSendEmail(e.target.checked)}
                          className="accent-[#930303]"
                        />
                        <span>
                          Email copy {smtpConfigured ? '(SMTP active)' : '(SMTP inactive — dashboard only)'}
                        </span>
                      </label>
                    )}
                    <select
                      aria-label="Status after reply"
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      className="border border-stone-200 rounded-lg px-2.5 py-1 text-xs bg-stone-50"
                    >
                      <option value="replied">Mark as Replied</option>
                      <option value="in_progress">Mark In Progress</option>
                      <option value="resolved">Mark Resolved</option>
                    </select>
                  </div>
                </div>

                <textarea
                  id="admin-reply-message"
                  name="replyMessage"
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Write your response to ${selectedTicket.name}... This appears directly in the customer's Account → Support Tickets thread.`}
                  className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#930303]"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={busy || !replyText.trim()}
                    className="inline-flex items-center gap-2 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    <Send size={14} />
                    <span>{busy ? 'Sending…' : 'Send Reply'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Native Delete Confirmation Dialog */}
      <dialog
        ref={deleteDialogRef}
        closedby="any"
        aria-labelledby="delete-ticket-title"
        onClose={() => setConfirmDeleteTicket(null)}
        onCancel={() => setConfirmDeleteTicket(null)}
        className="support-confirm-dialog m-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl max-w-md w-[calc(100%-2rem)]"
      >
        <div className="flex justify-between items-start gap-3">
          <h2 id="delete-ticket-title" className="text-lg font-bold text-stone-900">
            Delete Inquiry / Ticket?
          </h2>
          <button
            type="button"
            onClick={() => setConfirmDeleteTicket(null)}
            aria-label="Close"
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-stone-600 mt-2">
          Are you sure you want to permanently remove{' '}
          <strong>{confirmDeleteTicket?.ticketNumber}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2.5 mt-5">
          <button
            type="button"
            autoFocus
            onClick={() => setConfirmDeleteTicket(null)}
            className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleDeleteConfirmed}
            className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold cursor-pointer"
          >
            {busy ? 'Deleting…' : 'Delete Permanently'}
          </button>
        </div>
      </dialog>

      {/* Admin Photo Lightbox Modal */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-stone-900/90 border-b border-stone-800 flex justify-between items-center text-xs text-stone-300">
              <span className="font-semibold text-stone-200">Customer Proof Inspection</span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="text-stone-400 hover:text-white p-1 cursor-pointer"
                aria-label="Close image preview"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-black/40">
              <img
                src={lightboxImage}
                alt="Enlarged customer proof"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="p-3 bg-stone-900 border-t border-stone-800 flex justify-between items-center text-xs text-stone-300">
              <a
                href={lightboxImage}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1.5 underline"
              >
                <ExternalLink size={14} /> Open original image in new tab
              </a>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;

