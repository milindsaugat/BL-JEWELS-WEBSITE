import React, { useState, useEffect, useCallback } from 'react';
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
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../../services/api';

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
    totalAdmins: 0,
    activeUsers: 0,
    newThisMonth: 0,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Selected User Modal State
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  // Fast Concurrent Data Fetcher
  const loadData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        userService.getUsers({
          page,
          limit: 12,
          search: search.trim() || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
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
  }, [search, roleFilter, statusFilter, sortBy]);

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

  // Toggle Role (Customer <-> Admin)
  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Are you sure you want to change ${user.name}'s role to ${newRole.toUpperCase()}?`)) {
      return;
    }
    setActionBusy(true);
    try {
      const res = await userService.updateRole(user._id, newRole);
      if (res?.success) {
        toast.success(`Role updated to ${newRole.toUpperCase()}`);
        setUsers(prev =>
          prev.map(u => (u._id === user._id ? { ...u, role: newRole } : u))
        );
        if (selectedUserDetails?.user?._id === user._id) {
          setSelectedUserDetails(prev => ({
            ...prev,
            user: { ...prev.user, role: newRole },
          }));
        }
      } else {
        toast.error(res?.message || 'Failed to change role.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Role change failed.');
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
      
      {/* Top Header */}
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

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">Total Registered</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{stats.totalUsers}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Across pan-India</p>
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
            <p className="text-xs text-stone-500 font-medium">Customers</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{stats.totalCustomers}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Shoppers & clients</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
            <User size={20} />
          </div>
        </article>

        <article className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">Administrators</p>
            <p className="text-2xl font-bold text-[#930303] mt-1">{stats.totalAdmins}</p>
            <p className="text-[11px] text-[#930303]/70 mt-0.5">Executive Suite</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#930303]/10 text-[#930303] flex items-center justify-center border border-[#930303]/20">
            <ShieldCheck size={20} />
          </div>
        </article>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
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

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
            <span className="text-stone-400 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-stone-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

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

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF7F2] text-stone-500 uppercase font-accent font-semibold tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-5 py-3.5">User / Customer</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5">Orders & Lifetime Spend</th>
                <th className="px-5 py-3.5">Member Since</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-stone-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-[#930303] mb-2" />
                    <span>Loading customer directory concurrently...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 space-y-2 text-stone-500">
                    <Users size={32} className="mx-auto text-stone-300" />
                    <p className="font-semibold text-sm text-stone-700">No users found</p>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                      Try adjusting your search terms or clearing your status/role filters.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initial = u.name ? u.name[0].toUpperCase() : 'U';
                  const isBlocked = u.isActive === false;
                  return (
                    <tr key={u._id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                            u.role === 'admin'
                              ? 'bg-[#930303] text-white border border-gold-400/40'
                              : 'bg-stone-100 text-stone-800 border border-stone-200'
                          }`}>
                            {initial}
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
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#930303]/10 text-[#930303] border border-[#930303]/20 uppercase tracking-wide">
                            <ShieldCheck size={11} />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 uppercase tracking-wide">
                            <User size={11} />
                            <span>Customer</span>
                          </span>
                        )}
                      </td>

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

                      <td className="px-5 py-4 whitespace-nowrap text-stone-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openUserDetails(u._id)}
                            className="p-1.5 text-stone-500 hover:text-[#930303] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                            title="View Full Profile & Orders"
                          >
                            <Eye size={15} />
                          </button>

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

                          <button
                            onClick={() => handleToggleRole(u)}
                            disabled={actionBusy}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title={`Promote/Demote role (Current: ${u.role})`}
                          >
                            <ShieldAlert size={15} />
                          </button>

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

        {/* Pagination Footer */}
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

      {/* User Details Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#930303] text-white flex items-center justify-center font-bold text-sm">
                  {selectedUserDetails?.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    {selectedUserDetails?.user?.name || 'Customer Profile'}
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">
                    ID: {selectedUserId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs font-body">
              {modalLoading ? (
                <div className="py-12 text-center text-stone-400">
                  <RefreshCw size={24} className="animate-spin mx-auto text-[#930303] mb-2" />
                  <span>Loading user profile & order history...</span>
                </div>
              ) : selectedUserDetails?.user ? (
                <>
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
                      <span className="text-[10px] text-stone-400 uppercase font-semibold">Role</span>
                      <p className="font-semibold text-stone-900 uppercase mt-0.5">
                        {selectedUserDetails.user.role}
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
        </div>
      )}

    </div>
  );
};

export default AdminUsers;

