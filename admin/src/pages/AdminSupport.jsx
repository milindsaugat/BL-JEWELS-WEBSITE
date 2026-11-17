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
  Lock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
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
  const [openChatIds, setOpenChatIds] = useState({});
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

  const handleSendAttachmentRequest = async () => {
    if (!selectedTicket) return;
    setBusy(true);
    try {
      const res = await ticketService.reply(selectedTicket._id, {
        message: `Dear ${selectedTicket.name},\n\nPlease upload clear photos (up to 4) and an unboxing video (up to 2) so our team can verify and process your claim quickly.\n\nUse the upload box below to share your files directly.\n\nWarm regards,\nBL Jewels Concierge Team`,
        status: replyStatus,
        sendEmail,
        replyType: 'attachment_request',
      });
      if (res.data) {
        setTickets((prev) => prev.map((t) => (t._id === selectedTicket._id ? res.data : t)));
        showToast('📎 Attachment request sent! Customer will see an upload box in their chat.');
        fetchTickets();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send attachment request', 'error');
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

      {/* Main Workspace: Full-Width Ticket View OR Full-Width Inbox Table */}
      {selectedTicket ? (
        /* ================= FULL-SCREEN TICKET WORKSPACE (UNIFIED LIKE USER DASHBOARD) ================= */
        (() => {
          const isClosed = selectedTicket.status === 'closed';
          const isChatOpen = isClosed
            ? Boolean(openChatIds[selectedTicket._id])
            : openChatIds[selectedTicket._id] !== false;

          return (
            <div className="w-full bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Top Navigation & Status Bar */}
              <div className="flex flex-wrap justify-between items-center gap-4 pb-5 border-b border-stone-200">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    <ArrowLeft size={14} />
                    <span>← Back to All Tickets ({tickets.length})</span>
                  </button>
                  <span className="text-stone-300">|</span>
                  <span className="text-xs font-mono font-bold text-[#930303] bg-[#FFF6F2] px-3 py-1 rounded-md border border-[#EADBD4]">
                    {selectedTicket.ticketNumber}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                    {selectedTicket.type === 'contact' ? 'Contact Form Inquiry' : 'Support Ticket'}
                  </span>
                  <span
                    className={`text-[11px] uppercase font-semibold px-2.5 py-1 rounded-full ${
                      PRIORITY_BADGES[selectedTicket.priority] || PRIORITY_BADGES.normal
                    }`}
                  >
                    {selectedTicket.priority || 'normal'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenChatIds((prev) => ({ ...prev, [selectedTicket._id]: !isChatOpen }))
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 cursor-pointer transition-colors shadow-2xs"
                    title={isChatOpen ? 'Hide conversation thread' : 'Click to view conversation thread'}
                  >
                    <span>
                      {isChatOpen
                        ? 'Hide Chat'
                        : isClosed
                          ? 'View Closed Chat'
                          : 'View Chat'}
                    </span>
                    {isChatOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  <div className="flex items-center gap-2">
                    <label htmlFor="detail-status-select" className="text-xs font-semibold text-stone-600">
                      Status:
                    </label>
                    {isClosed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-600 border border-stone-200 text-xs font-semibold shadow-2xs">
                        <Lock size={12} className="text-stone-400" />
                        <span>Closed (Final)</span>
                      </span>
                    ) : (
                      <select
                        id="detail-status-select"
                        disabled={busy}
                        value={selectedTicket.status}
                        onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                        className="border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold bg-white text-stone-800 shadow-2xs cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmDeleteTicket(selectedTicket)}
                    aria-label="Delete inquiry"
                    className="p-2.5 rounded-xl border border-stone-200 text-stone-500 hover:text-red-700 hover:border-red-200 hover:bg-red-50 cursor-pointer shadow-2xs"
                    title="Delete ticket"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Subject & Customer Details Overview Card */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-stone-900 font-heading">{selectedTicket.subject}</h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-600 bg-[#FAF7F2] border border-[#E9DED2] rounded-xl p-4">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-stone-900">
                    <User size={15} className="text-[#930303]" />
                    {selectedTicket.name}
                  </span>
                  {selectedTicket.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={15} className="text-[#930303]" />
                      <a href={`mailto:${selectedTicket.email}`} className="hover:underline font-medium text-stone-700">
                        {selectedTicket.email}
                      </a>
                    </span>
                  )}
                  {selectedTicket.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={15} className="text-[#930303]" />
                      <a href={`tel:${selectedTicket.phone}`} className="hover:underline font-medium text-stone-700">
                        {selectedTicket.phone}
                      </a>
                    </span>
                  )}
                  {selectedTicket.orderNumber && (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                      <ShoppingBag size={15} className="text-[#930303]" />
                      Order #{selectedTicket.orderNumber}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-stone-400 sm:ml-auto">
                    <Clock size={14} />
                    Created: {new Date(selectedTicket.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Collapsed Compact State (Just like User Dashboard) */}
              {!isChatOpen ? (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#E9DED2] text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    {isClosed ? (
                      <Lock size={15} className="text-stone-500" />
                    ) : (
                      <MessageSquare size={15} className="text-[#930303]" />
                    )}
                    <span className="font-semibold text-stone-800">
                      {isClosed
                        ? 'Ticket closed · Chat is closed'
                        : 'Chat conversation minimized'}
                    </span>
                    <span className="text-stone-400">({selectedTicket.replies?.length || 0} replies)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-stone-400 hidden sm:inline">
                      {isClosed
                        ? 'Permanently preserved in Admin · Purged from customer dashboard after 30 days'
                        : 'Click button to open complete conversation thread'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenChatIds((prev) => ({ ...prev, [selectedTicket._id]: true }))
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#930303] text-white hover:bg-[#7A0303] text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                    >
                      <MessageSquare size={13} />
                      <span>{isClosed ? 'View Closed Chat' : 'Open Chat & Reply'}</span>
                      <ChevronDown size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                /* ================= OPENED UNIFIED CONVERSATION (ONE SINGLE CONTAINER) ================= */
                <div className="space-y-5 pt-3 border-t border-stone-200">
                  {/* Return Reasons Callout */}
                  {Array.isArray(selectedTicket.returnReasons) && selectedTicket.returnReasons.length > 0 && (
                    <div className="rounded-2xl bg-red-50/70 border border-red-200 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-red-900 font-bold text-xs uppercase tracking-wider">
                        <ShieldAlert size={15} className="text-[#930303]" />
                        <span>Return & Refund Issues Specified by Customer</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.returnReasons.map((r, i) => (
                          <span
                            key={i}
                            className="text-xs px-3 py-1.5 rounded-lg bg-white text-red-900 font-medium border border-red-200 shadow-2xs"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unified Conversation Thread */}
                  <div className="space-y-3">
                    {/* 1. Initial Customer Message as first conversation bubble */}
                    <div className="rounded-2xl p-5 text-sm bg-stone-50 border border-stone-200 mr-6 space-y-3 shadow-2xs">
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-stone-200/60">
                        <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                          <User size={13} className="text-[#930303]" />
                          <span>{selectedTicket.name} (Customer · Initial Request)</span>
                        </span>
                        <span className="text-stone-400">
                          {new Date(selectedTicket.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-stone-800 whitespace-pre-line leading-relaxed">{selectedTicket.message}</p>

                      {/* Customer Attached Proof */}
                      {Array.isArray(selectedTicket.attachments) && selectedTicket.attachments.length > 0 && (
                        <div className="pt-3 border-t border-stone-200/60 space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                            <Camera size={14} className="text-[#930303]" />
                            <span>Customer Attached Proof ({selectedTicket.attachments.length} files)</span>
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
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
                                    <p className="text-[10px] text-stone-600 px-2 py-1 truncate">
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

                    {/* 2. All Subsequent Conversation Replies */}
                    {Array.isArray(selectedTicket.replies) && selectedTicket.replies.length > 0 && (
                      <div className="space-y-3">
                        {selectedTicket.replies.map((rep, idx) => (
                          <div
                            key={rep._id || idx}
                            className={`rounded-2xl p-4 text-sm border space-y-2 ${
                              rep.senderRole === 'admin'
                                ? 'bg-[#FFF6F2] border-[#EADBD4] ml-6'
                                : 'bg-stone-50 border-stone-200 mr-6'
                            }`}
                          >
                            <div className="flex justify-between items-center text-xs mb-1.5">
                              <span
                                className={`font-semibold ${
                                  rep.senderRole === 'admin' ? 'text-[#930303]' : 'text-stone-800'
                                }`}
                              >
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
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
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
                    )}
                  </div>

                  {/* 3. Bottom Composer OR Closed Notice */}
                  {isClosed ? (
                    <div className="pt-4 border-t border-stone-200">
                      <div className="rounded-2xl bg-stone-100 border border-stone-200 p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center shrink-0">
                          <Lock size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-stone-900">
                            Ticket Closed · Chat is Finalized (चैट बंद है)
                          </h4>
                          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                            This support ticket is permanently closed and cannot be reopened. The full chat conversation is preserved here in the Admin panel as a read-only audit log.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleReplySubmit} className="pt-4 border-t border-stone-200 space-y-3">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="admin-reply-message"
                            className="text-xs font-bold uppercase tracking-wider text-stone-700"
                          >
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
                          <button
                            type="button"
                            disabled={busy}
                            onClick={handleSendAttachmentRequest}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#930303]/10 hover:bg-[#930303]/20 border border-[#930303]/30 text-[#930303] text-[11px] font-semibold cursor-pointer transition-colors disabled:opacity-50"
                            title="Send an embedded upload box to the customer's chat (Blinkit/Zomato style)"
                          >
                            <Paperclip size={12} className="text-[#930303]" />
                            <span>📎 Send Proof Upload Box to Customer</span>
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
                            <option value="closed">Mark Closed</option>
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
                  )}
                </div>
              )}
            </div>
          );
        })()
      ) : (
        /* ================= FULL-WIDTH ALL INBOX TABLE ================= */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-stone-500">Loading inquiries & tickets…</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <MessageSquare className="mx-auto text-stone-300" size={32} />
              <p className="text-sm font-medium text-stone-700">No inquiries or tickets found</p>
              <p className="text-xs text-stone-500">Try clearing filters or search term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-stone-600 font-semibold uppercase tracking-wider text-[11px] border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4">Ticket ID & Date</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Subject & Category</th>
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Replies</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {tickets.map((t) => (
                    <tr
                      key={t._id}
                      onClick={() => setSelectedId(t._id)}
                      className="hover:bg-stone-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[#930303] text-xs">
                          {t.ticketNumber}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {new Date(t.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
                          {t.type === 'contact' ? 'Contact Form' : 'Support Ticket'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900">{t.name}</div>
                        <div className="text-[11px] text-stone-500">{t.email || 'No email'}</div>
                        {t.phone && <div className="text-[10px] text-stone-400">{t.phone}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900 line-clamp-1">{t.subject}</div>
                        <div className="text-[11px] text-stone-500">{t.category}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {t.orderNumber ? (
                          <span className="font-mono font-medium text-stone-800 bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E9DED2] text-[11px]">
                            {t.orderNumber}
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium">
                          {t.replies?.length || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full ${
                            PRIORITY_BADGES[t.priority] || PRIORITY_BADGES.normal
                          }`}
                        >
                          {t.priority || 'normal'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] capitalize font-semibold px-2.5 py-1 rounded-full border ${
                            STATUS_BADGES[t.status] || STATUS_BADGES.open
                          }`}
                        >
                          {t.status?.replaceAll('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(t._id);
                          }}
                          className="px-3.5 py-1.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                        >
                          View & Reply →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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

