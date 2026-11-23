import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  LogOut,
  LogIn,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { adminBadgeService } from '../services/api';
import { ADMIN_NAV_GROUPS, findActiveNavMeta, isNavItemActive } from '../lib/navGroups';

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('bl_sidebar_collapsed') === 'true'
  );
  const [mobile, setMobile] = useState(false);
  const [profile, setProfile] = useState(false);
  const [closedGroups, setClosedGroups] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bl_sidebar_closed_groups') || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch {
      return {};
    }
  });

  const [badges, setBadges] = useState({
    orders: 0,
    customers: 0,
    support: 0,
    subscribers: 0,
    verificationPending: 0,
    reviews: 0,
  });

  const { user, logout, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const profileRef = useRef(null);
  const activeMeta = findActiveNavMeta(location.pathname, location.search);

  const fetchBadges = async () => {
    try {
      const data = await adminBadgeService.getBadges();
      if (data && typeof data === 'object') {
        setBadges((prev) => ({ ...prev, ...data }));
      }
    } catch {
      // Ignore background badge fetch error
    }
  };

  useEffect(() => {
    fetchBadges();
    const timer = setInterval(fetchBadges, 25000);
    const onFocus = () => fetchBadges();
    const onRefresh = () => fetchBadges();
    window.addEventListener('focus', onFocus);
    window.addEventListener('bl-badges-refresh', onRefresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('bl-badges-refresh', onRefresh);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setProfile(false);
    setMobile(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = (e) => {
      if (!profileRef.current?.contains(e.target)) setProfile(false);
    };
    const escape = (e) => {
      if (e.key === 'Escape') {
        setProfile(false);
        setMobile(false);
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  useEffect(() => {
    if (!mobile) return;
    const old = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = old;
    };
  }, [mobile]);

  const toggle = () =>
    setCollapsed((v) => {
      localStorage.setItem('bl_sidebar_collapsed', String(!v));
      return !v;
    });

  const toggleGroup = (groupId) => {
    setClosedGroups((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      localStorage.setItem('bl_sidebar_closed_groups', JSON.stringify(next));
      return next;
    });
  };

  const storefront = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173';
  const initials = (user?.name || 'Admin')
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  return (
    <div className="admin-shell min-h-screen bg-[#F5F6F8] text-stone-900 font-body">
      {mobile && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 bg-stone-950/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobile(false)}
        />
      )}

      <aside
        aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-stone-200/80 flex flex-col transition-[width,transform] duration-200 ${
          collapsed ? 'lg:w-[76px]' : 'lg:w-[244px]'
        } w-[256px] ${mobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <Link
          to="/"
          className="h-16 shrink-0 flex items-center gap-2.5 px-5 border-b border-stone-100"
        >
          <img
            src="/images/bl-jewels-icon.png"
            alt="BL Jewels"
            className="h-9 w-9 object-contain shrink-0"
          />
          <div className={collapsed ? 'lg:hidden' : ''}>
            <p className="font-bold text-sm tracking-wide text-[#930303]">BL JEWELS</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Executive Atelier</p>
          </div>
        </Link>

        <nav className="admin-sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-4">
          {ADMIN_NAV_GROUPS.map((group, groupIdx) => {
            const isOverview = group.id === 'overview';
            const isGroupClosed = !collapsed && !isOverview && Boolean(closedGroups[group.id]) && activeMeta.groupId !== group.id;

            return (
              <div
                key={group.id}
                className={groupIdx > 0 ? 'pt-3 border-t border-stone-100 first:border-t-0 first:pt-0' : ''}
              >
                {!isOverview && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={!isGroupClosed}
                    className={`w-full flex items-center justify-between px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-stone-400 hover:text-[#930303] transition-colors cursor-pointer ${
                      collapsed ? 'lg:hidden' : ''
                    }`}
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-150 ${
                        isGroupClosed ? '-rotate-90' : ''
                      }`}
                    />
                  </button>
                )}

                {!isGroupClosed && (
                  <div className="space-y-0.5">
                    {group.items.map(({ label, path, icon: Icon, badgeKey }) => {
                      const active = isNavItemActive(path, location);
                      const badgeCount = badgeKey ? Number(badges[badgeKey] || 0) : 0;

                      let badgeStyle = 'bg-[#930303] text-white';
                      if (badgeKey === 'support') {
                        badgeStyle = active
                          ? 'bg-amber-200 text-amber-950'
                          : 'bg-amber-600 text-white animate-pulse shadow-xs';
                      } else if (badgeKey === 'orders') {
                        badgeStyle = active
                          ? 'bg-white text-[#930303]'
                          : 'bg-[#930303] text-white shadow-xs';
                      } else if (badgeKey === 'customers') {
                        badgeStyle = active
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-blue-600 text-white shadow-xs';
                      } else if (badgeKey === 'subscribers') {
                        badgeStyle = active
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-emerald-600 text-white shadow-xs';
                      } else if (badgeKey === 'verificationPending') {
                        badgeStyle = active
                          ? 'bg-amber-200 text-amber-950'
                          : 'bg-amber-600 text-white';
                      } else if (badgeKey === 'products') {
                        badgeStyle = active
                          ? 'bg-white/25 text-white'
                          : 'bg-stone-200 text-stone-700 font-medium';
                      }

                      return (
                        <NavLink
                          key={path}
                          to={path}
                          title={`${group.title} — ${label}${badgeCount > 0 ? ` (${badgeCount} active)` : ''}`}
                          onClick={() => setMobile(false)}
                          className={() =>
                            `flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-colors relative group/item ${
                              collapsed ? 'lg:justify-center lg:px-2' : ''
                            } ${
                              active
                                ? 'bg-[#930303] text-white shadow-sm shadow-red-900/10 font-semibold'
                                : 'text-stone-600 hover:bg-[#FBF3F0] hover:text-[#930303]'
                            }`
                          }
                        >
                          <div className="relative shrink-0 flex items-center justify-center">
                            <Icon size={17} strokeWidth={1.75} />
                            {/* Dot indicator when sidebar is collapsed on desktop */}
                            {collapsed && badgeCount > 0 && (
                              <span
                                className={`hidden lg:block absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                                  badgeKey === 'support' ? 'bg-amber-600 animate-ping' : 'bg-[#930303]'
                                }`}
                                title={`${label}: ${badgeCount}`}
                              />
                            )}
                          </div>

                          <span className={collapsed ? 'lg:hidden truncate' : 'truncate'}>{label}</span>

                          {/* Full Badge Counter when sidebar is expanded */}
                          {badgeCount > 0 && (
                            <span
                              className={`ml-auto shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full transition-transform group-hover/item:scale-105 ${
                                collapsed ? 'lg:hidden' : ''
                              } ${badgeStyle}`}
                            >
                              {badgeCount > 99 ? '99+' : badgeCount}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 p-3 border-t border-stone-100">
          <a
            href={storefront}
            target="_blank"
            rel="noreferrer"
            title="Open storefront"
            className={`flex items-center gap-3 rounded-xl bg-stone-50 border border-stone-100 px-3 py-2.5 text-xs text-stone-600 hover:text-[#930303] hover:border-stone-200 transition-colors ${
              collapsed ? 'lg:justify-center' : ''
            }`}
          >
            <ExternalLink size={16} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Open storefront</span>
          </a>
        </div>
      </aside>

      <div
        className={`min-w-0 transition-[padding] duration-200 ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[244px]'
        }`}
      >
        <header
          className={`fixed top-0 right-0 left-0 ${
            collapsed ? 'lg:left-[76px]' : 'lg:left-[244px]'
          } h-16 z-20 bg-white border-b border-stone-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 transition-[left] duration-200`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Toggle sidebar"
              aria-expanded={!collapsed}
              onClick={toggle}
              className="hidden lg:flex p-2 rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer"
            >
              {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            </button>
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={mobile}
              onClick={() => setMobile(true)}
              className="lg:hidden p-2 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#930303]/80">
                {activeMeta.groupTitle}
              </p>
              <h1 className="font-semibold text-sm truncate text-stone-900">{activeMeta.label}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={storefront}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-2 border rounded-lg text-xs text-stone-600 hover:bg-stone-50"
            >
              View store
              <ExternalLink size={13} />
            </a>
            <span className="hidden sm:block h-7 w-px bg-stone-200" />
            <div ref={profileRef} className="relative">
              <button
                type="button"
                aria-label="Account menu"
                aria-expanded={profile}
                aria-controls="admin-account-menu"
                onClick={() => setProfile((v) => !v)}
                className="flex items-center gap-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#930303] cursor-pointer"
              >
                <span className="h-9 w-9 rounded-full bg-[#930303] text-white flex items-center justify-center text-xs font-semibold ring-4 ring-[#FAF0ED]">
                  {initials}
                </span>
                <ChevronDown size={13} className="text-stone-400" />
              </button>
              {profile && (
                <div
                  id="admin-account-menu"
                  className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2"
                >
                  <div className="px-3 py-3 border-b border-stone-100">
                    <p className="text-sm font-semibold truncate">{user?.name || 'Your account'}</p>
                    <p className="text-xs text-stone-500 truncate mt-1">{user?.email}</p>
                    <p className="mt-2 text-[10px] text-[#930303] flex items-center gap-1">
                      <ShieldCheck size={12} />
                      Administrator
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setProfile(false)}
                      className="flex items-center gap-2 text-xs text-stone-700 hover:bg-stone-50 rounded-xl px-3 py-2.5 w-full cursor-pointer transition-colors"
                    >
                      <Settings size={15} className="text-[#930303]" />
                      <span>Store & Security Settings</span>
                    </Link>
                  </div>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProfile(false);
                        logout();
                      }}
                      className="flex items-center gap-2 text-sm text-red-800 hover:bg-red-50 rounded-xl p-3 w-full cursor-pointer"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  ) : (
                    <Link to="/login" className="flex gap-2 p-3 text-sm">
                      <LogIn size={16} />
                      Sign in
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-w-0 w-full px-4 sm:px-6 pt-[84px] pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
