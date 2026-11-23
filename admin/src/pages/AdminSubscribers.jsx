import React, { useEffect, useState, useMemo } from 'react';
import {
  Mail,
  Download,
  Copy,
  Check,
  Search,
  Trash2,
  Sparkles,
  Users,
  Calendar,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { subscriberService } from '../services/api';
import { toast } from 'sonner';

const SOURCE_LABELS = {
  homepage: { label: 'Homepage Circle', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  footer: { label: 'Footer Strip', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  admin: { label: 'Admin Added', cls: 'bg-stone-100 text-stone-700 border-stone-200' },
  checkout: { label: 'Checkout Opt-In', cls: 'bg-rose-50 text-rose-800 border-rose-200' },
};

// Escape CSV fields and guard spreadsheet formula prefixes (=, +, -, @)
const escapeCsvCell = (value) => {
  const str = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, newThisWeek: 0, homepageCount: 0, footerCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await subscriberService.getSubscribers();
      setSubscribers(res.subscribers || []);
      if (res.stats) setStats(res.stats);

      if (res.subscribers?.some((s) => s.adminViewed === false)) {
        subscriberService.markAllViewed().catch(() => {});
        window.dispatchEvent(new CustomEvent('bl-badges-refresh'));
      }
    } catch (err) {
      toast.error('Failed to load subscribers: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers.filter((s) => {
      const src = (s.source || 'homepage').toLowerCase();
      if (sourceFilter !== 'all' && src !== sourceFilter) return false;
      if (q && !String(s.email || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [subscribers, search, sourceFilter]);

  const handleCopySingle = (id, email) => {
    navigator.clipboard?.writeText(email);
    setCopiedId(id);
    toast.success(`Copied ${email}`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyAll = () => {
    if (filtered.length === 0) {
      toast.info('No subscribers to copy.');
      return;
    }
    const joined = filtered.map((s) => s.email).join(', ');
    navigator.clipboard?.writeText(joined);
    setCopiedAll(true);
    toast.success(`Copied ${filtered.length} email(s) to clipboard`);
    setTimeout(() => setCopiedAll(false), 2200);
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.info('No subscribers available to export.');
      return;
    }

    const headers = ['Email', 'Source', 'Status', 'Subscribed At', 'Consent At'];
    const rows = filtered.map((s) => [
      escapeCsvCell(s.email),
      escapeCsvCell(SOURCE_LABELS[s.source || 'homepage']?.label || s.source || 'homepage'),
      escapeCsvCell(s.status || 'subscribed'),
      escapeCsvCell(formatDateTime(s.createdAt || s.consentAt)),
      escapeCsvCell(formatDateTime(s.consentAt || s.createdAt)),
    ]);

    const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bl-jewels-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} subscriber(s) to CSV`);
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) return;

    setAdding(true);
    try {
      const res = await subscriberService.addSubscriber({ email: trimmed, source: 'admin' });
      if (res.alreadySubscribed) {
        toast.info('This email is already in your VIP subscriber list.');
      } else {
        toast.success(`Added ${trimmed} to VIP Subscribers!`);
      }
      setNewEmail('');
      fetchSubscribers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to add subscriber.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (sub) => {
    if (!window.confirm(`Remove "${sub.email}" from VIP subscribers?`)) return;
    try {
      await subscriberService.deleteSubscriber(sub._id);
      toast.success(`Removed ${sub.email}`);
      fetchSubscribers();
    } catch (err) {
      toast.error('Failed to remove subscriber: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#930303]/10 text-[#930303] text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The BL Jewels Circle</span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
            Newsletter & VIP Subscribers
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            View, manage, and export customer emails captured from the homepage and website footer for festive promotions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchSubscribers}
            disabled={loading}
            className="px-3.5 py-2.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#930303]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleCopyAll}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'Copied All' : 'Copy Emails'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-bold shadow-md shadow-[#930303]/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-gradient-to-br from-[#FFF8EE] to-[#FFF1DE] border border-amber-300 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
            <span>Total VIP Subscribers</span>
            <Users className="w-4 h-4 text-[#930303]" />
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-1.5">{stats.total}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>New (Last 7 Days)</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-1.5">{stats.newThisWeek}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Homepage Circle</span>
            <Sparkles className="w-4 h-4 text-[#C9A44A]" />
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-1.5">{stats.homepageCount}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Footer Signups</span>
            <Mail className="w-4 h-4 text-stone-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-1.5">{stats.footerCount}</p>
        </div>
      </div>

      {/* Quick Add + Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subscriber email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#930303]"
            />
          </div>

          {/* Add Subscriber Manually */}
          <form onSubmit={handleAddSubscriber} className="flex items-center gap-2 w-full lg:w-auto">
            <input
              type="email"
              required
              placeholder="Manually add VIP email..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 lg:w-64 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#930303]"
            />
            <button
              type="submit"
              disabled={adding}
              className="px-3.5 py-2 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{adding ? 'Adding...' : 'Add Email'}</span>
            </button>
          </form>
        </div>

        {/* Source Filters */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-stone-100 overflow-x-auto text-xs">
          {[
            { id: 'all', label: `All Sources (${subscribers.length})` },
            { id: 'homepage', label: 'Homepage Circle' },
            { id: 'footer', label: 'Footer Strip' },
            { id: 'admin', label: 'Admin Added' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSourceFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                sourceFilter === f.id
                  ? 'bg-[#930303] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-sm">Loading VIP subscribers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm space-y-2">
            <Mail className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="font-semibold text-stone-700">No subscribers found</p>
            <p className="text-xs text-stone-400">
              Customer emails submitted via the homepage or footer newsletter forms will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Subscriber Email</th>
                  <th className="py-3 px-4 font-bold">Source</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Subscribed Date</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((sub) => {
                  const srcMeta = SOURCE_LABELS[sub.source || 'homepage'] || SOURCE_LABELS.homepage;
                  return (
                    <tr key={sub._id || sub.email} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-stone-900">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#C9A44A] shrink-0" />
                          <span>{sub.email}</span>
                          {sub.adminViewed === false && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-emerald-600 text-white animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${srcMeta.cls}`}>
                          {srcMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                          {sub.status || 'subscribed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-500">
                        {formatDateTime(sub.createdAt || sub.consentAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopySingle(sub._id || sub.email, sub.email)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Copy email"
                          >
                            {copiedId === (sub._id || sub.email) ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(sub)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove subscriber"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscribers;

