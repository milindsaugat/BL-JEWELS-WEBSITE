import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  User,
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
  X,
  Eye,
  CheckCircle2,
  Ban,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  MapPin,
  Trash2,
  Pencil,
  FileText,
  UploadCloud,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { userService, uploadService } from '../services/api';

const money = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    verifiedMobile: 0,
    activeUsers: 0,
    newThisMonth: 0,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Selected User Modal State
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true,
    avatar: '',
    panNumber: '',
    panCardImage: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingEditPan, setUploadingEditPan] = useState(false);

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      isActive: user.isActive !== false,
      avatar: user.avatar || '',
      panNumber: user.panNumber || '',
      panCardImage: user.panCardImage || '',
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setSavingEdit(false);
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      toast.error('Name and Email are required.');
      return;
    }
    setSavingEdit(true);
    try {
      const res = await userService.updateUser(editingUser._id, editFormData);
      if (res?.success) {
        toast.success(res.message || 'Customer details updated successfully!');
        const updated = res.user;
        setUsers((prev) =>
          prev.map((u) => (u._id === editingUser._id ? { ...u, ...updated } : u))
        );
        if (selectedUserDetails?.user?._id === editingUser._id) {
          setSelectedUserDetails((prev) => ({
            ...prev,
            user: { ...prev.user, ...updated },
          }));
        }
        closeEditModal();
      } else {
        toast.error(res?.message || 'Failed to update customer details.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update customer details.');
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedUserId]);

  // Fast Concurrent Data Fetcher
  const loadData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // Concurrently run list query and statistics query in parallel
      const [usersRes, statsRes] = await Promise.all([
        userService.getUsers({
          page,
          limit: 12,
          search: search.trim() || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          sort: sortBy,
        }),
        userService.getUserStats().catch(() => ({ stats: null })),
      ]);

      if (usersRes?.success) {
        setUsers(usersRes.users || []);
        if (usersRes.pagination) {
          setPagination(usersRes.pagination);
        }
      }

      if (statsRes?.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to load user directory:', err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        toast.error('Session expired. Redirecting to admin sign-in...');
      } else {
        toast.error(err.response?.data?.message || 'Unable to fetch users directory.');
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  // Initial load & debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Load details for modal concurrently
  const openUserDetails = async (id) => {
    setSelectedUserId(id);
    setSelectedUserDetails(null);
    setModalLoading(true);
    try {
      const res = await userService.getUserById(id);
      if (res?.success) {
        setSelectedUserDetails(res);
      } else {
        toast.error('Could not load user details.');
      }
    } catch (err) {
      toast.error('Error loading user profile.');
    } finally {
      setModalLoading(false);
    }
  };

  // Toggle user status (Active <-> Blocked)
  const handleToggleStatus = async (user) => {
    const nextStatus = user.isActive === false;
    setActionBusy(true);
    try {
      const res = await userService.updateStatus(user._id, nextStatus);
      if (res?.success) {
        toast.success(res.message || 'Status updated successfully.');
        setUsers(prev =>
          prev.map(u => (u._id === user._id ? { ...u, isActive: nextStatus } : u))
        );
        if (selectedUserDetails?.user?._id === user._id) {
          setSelectedUserDetails(prev => ({
            ...prev,
            user: { ...prev.user, isActive: nextStatus },
          }));
        }
      } else {
        toast.error(res?.message || 'Failed to update status.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action rejected.');
    } finally {
      setActionBusy(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name}"? This cannot be undone.`)) {
      return;
    }
    setActionBusy(true);
    try {
      const res = await userService.deleteUser(user._id);
      if (res?.success) {
        toast.success('User account removed permanently.');
        setUsers(prev => prev.filter(u => u._id !== user._id));
        if (selectedUserId === user._id) {
          setSelectedUserId(null);
        }
      } else {
        toast.error(res?.message || 'Could not delete user.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete operation failed.');
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Top Header & Action Strip ── */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#930303] font-semibold">
            <Users size={14} />
            <span>Executive Customer Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            User & Customer Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-body">
            Monitor registered accounts, lifetime customer order values, and administrative permissions.
          </p>
        </div>

        <button
          onClick={() => loadData(pagination.page)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 hover:border-gold-400 rounded-xl text-xs font-semibold text-stone-700 hover:text-[#930303] shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#930303]' : ''} />
          <span>Sync Directory</span>
        </button>
      </div>

      {/* ── Metric Cards Grid (Concurrent Stats) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">Total Customers</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{stats.totalCustomers || stats.totalUsers}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Registered shoppers</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#930303] flex items-center justify-center border border-amber-200/60">
            <Users size={20} />
          </div>
        </article>

        <article className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">Active Accounts</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.activeUsers}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Verified & active</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
            <CheckCircle2 size={20} />
          </div>
        </article>

        <article className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">Verified Mobile</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{stats.verifiedMobile || stats.totalCustomers}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Direct contact on file</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
            <Phone size={20} />
          </div>
        </article>

        <article className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">New This Month</p>
            <p className="text-2xl font-bold text-[#930303] mt-1">{stats.newThisMonth}</p>
            <p className="text-[11px] text-[#930303]/70 mt-0.5">New customer registrations</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#930303]/10 text-[#930303] flex items-center justify-center border border-[#930303]/20">
            <Sparkles size={20} />
          </div>
        </article>
      </div>

      {/* ── Search & Filter Controls Bar ── */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or mobile..."
            className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-gold-400 focus:bg-white transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
            <span className="text-stone-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-stone-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Blocked Only</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
            <ArrowUpDown size={13} className="text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-stone-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name (A → Z)</option>
              <option value="name_desc">Name (Z → A)</option>
            </select>
          </div>

        </div>
      </div>

      {/* ── Dynamic Users Table ── */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF7F2] text-stone-500 uppercase font-accent font-semibold tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5">Orders & Lifetime Spend</th>
                <th className="px-5 py-3.5">Member Since</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-stone-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-[#930303] mb-2" />
                    <span>Loading customer directory concurrently...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 space-y-2 text-stone-500">
                    <Users size={32} className="mx-auto text-stone-300" />
                    <p className="font-semibold text-sm text-stone-700">No customers found</p>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                      Try adjusting your search terms or clearing your status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initial = u.name ? u.name[0].toUpperCase() : 'U';
                  const isBlocked = u.isActive === false;
                  return (
                    <tr key={u._id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs overflow-hidden ${
                            u.role === 'admin'
                              ? 'bg-[#930303] text-white border border-gold-400/40'
                              : 'bg-stone-100 text-stone-800 border border-stone-200'
                          }`}>
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              initial
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-900 truncate">
                              {u.name || 'Anonymous User'}
                            </p>
                            <p className="text-[11px] text-stone-400 font-mono">
                              ID: {String(u._id).slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-stone-700">
                            <Mail size={12} className="text-stone-400 shrink-0" />
                            <span className="truncate max-w-[190px]">{u.email}</span>
                          </div>
                          {u.phone ? (
                            <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                              <Phone size={12} className="text-stone-400 shrink-0" />
                              <span>{u.phone}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">No phone added</span>
                          )}
                          <div className="pt-0.5">
                            {u.panNumber ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-900 border border-amber-200/70 px-1.5 py-0.5 rounded font-mono font-bold">
                                <span>PAN: {u.panNumber}</span>
                                {u.panCardImage && <CheckCircle2 size={10} className="text-emerald-700 shrink-0" title="PAN card document uploaded" />}
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-400">PAN: Not added</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            <span>Suspended / Blocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Orders & Spend */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-semibold text-stone-900">
                            {money(u.totalSpent || 0)}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {u.totalOrders || 0} {u.totalOrders === 1 ? 'order' : 'orders'} placed
                          </p>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-4 whitespace-nowrap text-stone-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View Profile */}
                          <button
                            onClick={() => openUserDetails(u._id)}
                            className="p-1.5 text-stone-500 hover:text-[#930303] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                            title="View Full Profile & Orders"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit Customer Details */}
                          <button
                            onClick={() => openEditModal(u)}
                            disabled={actionBusy}
                            className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Customer Details (Name, Phone, Email)"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Toggle Active / Block */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={actionBusy}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isBlocked
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-red-500 hover:bg-red-50'
                            }`}
                            title={isBlocked ? 'Activate User Account' : 'Block / Suspend User'}
                          >
                            {isBlocked ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                          </button>

                          {/* Permanent Delete */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={actionBusy}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User Account"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        {!loading && pagination.pages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <p>
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} users)
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => loadData(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => loadData(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── User Details Modal (Drawer) ── */}
      {selectedUserId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div role="dialog" aria-modal="true" className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#930303] text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                  {selectedUserDetails?.user?.avatar ? (
                    <img src={selectedUserDetails.user.avatar} alt={selectedUserDetails.user.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedUserDetails?.user?.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    {selectedUserDetails?.user?.name || 'Customer Profile'}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    ID: {selectedUserId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedUserDetails?.user && (
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedUserDetails.user)}
                    className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Edit Customer Profile"
                  >
                    <Pencil size={13} />
                    <span>Edit Profile</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedUserId(null)}
                  className="w-7 h-7 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs font-body">
              {modalLoading ? (
                <div className="py-12 text-center text-stone-400">
                  <RefreshCw size={24} className="animate-spin mx-auto text-[#930303] mb-2" />
                  <span>Loading user profile & order history...</span>
                </div>
              ) : selectedUserDetails?.user ? (
                <>
                  {/* Account Information Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 uppercase font-semibold">Email</span>
                      <p className="font-semibold text-stone-900 truncate mt-0.5">
                        {selectedUserDetails.user.email}
                      </p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 uppercase font-semibold">Phone</span>
                      <p className="font-semibold text-stone-900 mt-0.5">
                        {selectedUserDetails.user.phone || 'Not added'}
                      </p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 uppercase font-semibold">Account Type</span>
                      <p className="font-semibold text-stone-900 mt-0.5">
                        Verified Customer
                      </p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 uppercase font-semibold">Status</span>
                      <p className={`font-semibold mt-0.5 ${
                        selectedUserDetails.user.isActive !== false ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {selectedUserDetails.user.isActive !== false ? 'Active' : 'Blocked'}
                      </p>
                    </div>
                  </div>

                  {/* Government PAN & KYC Compliance */}
                  <div className="p-4 bg-gradient-to-r from-amber-50/60 to-orange-50/40 rounded-2xl border border-amber-200/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#930303]" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                          Government PAN &amp; KYC Verification
                        </h4>
                      </div>
                      {selectedUserDetails.user.panNumber && selectedUserDetails.user.panCardImage ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} className="text-emerald-700" />
                          <span>KYC Complete</span>
                        </span>
                      ) : selectedUserDetails.user.panNumber ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          <span>PAN Added (No Document)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400 font-medium">Pending Submission</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold">PAN Card Number</span>
                        <p className="font-mono font-bold text-sm text-stone-900 tracking-wider mt-0.5">
                          {selectedUserDetails.user.panNumber || 'Not provided'}
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold">PAN Card Document</span>
                        {selectedUserDetails.user.panCardImage ? (
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={selectedUserDetails.user.panCardImage}
                                alt="PAN Document"
                                className="w-10 h-8 rounded object-cover border border-stone-300 shrink-0"
                              />
                              <span className="text-[11px] text-emerald-700 font-semibold truncate">Document Attached</span>
                            </div>
                            <a
                              href={selectedUserDetails.user.panCardImage}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#930303] hover:bg-[#7A0303] text-white text-[11px] font-semibold rounded-lg transition-colors shrink-0"
                            >
                              <ExternalLink size={11} />
                              <span>View</span>
                            </a>
                          </div>
                        ) : (
                          <p className="text-[11px] text-stone-400 mt-1 italic">No document copy uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Saved Delivery Addresses */}
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 mb-2.5 flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#930303]" />
                      <span>Delivery Addresses ({selectedUserDetails.user.addresses?.length || 0})</span>
                    </h4>

                    {selectedUserDetails.user.addresses?.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {selectedUserDetails.user.addresses.map((addr, idx) => (
                          <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-800">{addr.name}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-stone-600 text-[11px] leading-relaxed">
                              {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            {addr.phone && <p className="text-stone-400 text-[10px]">Mobile: {addr.phone}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-stone-400 italic">No delivery addresses saved yet.</p>
                    )}
                  </div>

                  {/* Recent Orders List */}
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 mb-2.5 flex items-center gap-1.5">
                      <ShoppingBag size={14} className="text-[#930303]" />
                      <span>Order History ({selectedUserDetails.orders?.length || 0})</span>
                    </h4>

                    {selectedUserDetails.orders?.length ? (
                      <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
                        {selectedUserDetails.orders.map((ord) => (
                          <div key={ord._id} className="p-3 flex items-center justify-between hover:bg-stone-50 transition-colors">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-stone-900">{ord.orderNumber}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full capitalize bg-stone-100 text-stone-700 font-medium">
                                  {ord.status?.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-400 mt-0.5">
                                {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })} • {ord.items?.length || 0} item(s)
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#930303] text-sm">
                                {money(ord.pricing?.total)}
                              </p>
                              <span className="text-[10px] text-stone-400 uppercase font-medium">
                                {ord.paymentMethod || 'Razorpay'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-stone-400 italic">No orders placed by this customer yet.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-center text-stone-500">User record not found.</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedUserId(null)}
                className="px-4 py-2 border border-stone-200 rounded-xl text-stone-700 hover:bg-white text-xs font-semibold cursor-pointer"
              >
                Close Details
              </button>
              {selectedUserDetails?.user && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(selectedUserDetails.user)}
                    disabled={actionBusy}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer ${
                      selectedUserDetails.user.isActive === false
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {selectedUserDetails.user.isActive === false ? 'Reactivate Account' : 'Suspend Account'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ── Edit Customer Modal ── */}
      {editingUser && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div role="dialog" aria-modal="true" className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#930303] text-white flex items-center justify-center font-bold text-xs">
                  <Pencil size={14} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    Edit Customer Details
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    ID: {editingUser._id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="w-7 h-7 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUserEdit} className="p-5 sm:p-6 space-y-4 text-xs font-body">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#930303]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Registered Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="customer@domain.com"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#930303]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="+91 98765 01234"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#930303]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Account Status
                </label>
                <select
                  value={editFormData.isActive ? 'active' : 'blocked'}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === 'active' })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#930303] cursor-pointer"
                >
                  <option value="active">Active (Permitted)</option>
                  <option value="blocked">Blocked / Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Profile Avatar Image URL (Optional)
                </label>
                <div className="flex items-center gap-3">
                  {editFormData.avatar && (
                    <img
                      src={editFormData.avatar}
                      alt="Avatar preview"
                      className="w-9 h-9 rounded-full object-cover border border-stone-300 shrink-0"
                    />
                  )}
                  <input
                    type="url"
                    value={editFormData.avatar}
                    onChange={(e) => setEditFormData({ ...editFormData, avatar: e.target.value })}
                    placeholder="https://res.cloudinary.com/... or https://..."
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 font-mono focus:outline-none focus:border-[#930303]"
                  />
                  {editFormData.avatar && (
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, avatar: '' })}
                      className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                      title="Clear avatar"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* PAN Card & KYC Compliance */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
                  <FileText size={14} className="text-[#930303]" />
                  <span>Government PAN Card &amp; KYC Compliance</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      PAN Card Number (10 Alphanumeric)
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={editFormData.panNumber || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          panNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10),
                        })
                      }
                      placeholder="e.g. ABCDE1234F"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-stone-800 focus:outline-none focus:border-[#930303]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      PAN Card Document Photo
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1 px-3 py-2 bg-[#930303] hover:bg-[#7A0303] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs shrink-0">
                        {uploadingEditPan ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                        <span>{uploadingEditPan ? 'Uploading…' : 'Upload Copy'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingEditPan}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingEditPan(true);
                            try {
                              const res = await uploadService.uploadImage(file, 'bl-jewels/pancards');
                              const url = res?.url || res?.secure_url || res?.imageUrl || res?.image;
                              if (url) {
                                setEditFormData((prev) => ({ ...prev, panCardImage: url }));
                                toast.success('PAN card image uploaded!');
                              }
                            } catch {
                              toast.error('Failed to upload PAN card image.');
                            } finally {
                              setUploadingEditPan(false);
                              e.target.value = '';
                            }
                          }}
                          className="sr-only"
                        />
                      </label>

                      {editFormData.panCardImage && (
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={editFormData.panCardImage}
                            alt="PAN"
                            className="w-8 h-8 rounded object-cover border border-stone-300 shrink-0"
                          />
                          <a
                            href={editFormData.panCardImage}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-[#930303] hover:underline shrink-0 font-semibold"
                          >
                            View
                          </a>
                          <button
                            type="button"
                            onClick={() => setEditFormData({ ...editFormData, panCardImage: '' })}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Remove PAN image"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                  className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-[#930303] hover:bg-[#7A0303] text-white font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Customer Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default AdminUsers;

