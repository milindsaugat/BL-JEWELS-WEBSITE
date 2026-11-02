import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Simple, standard, clean keywords (No bloated "Executive" buzzwords)
  const navItems = [
    { label: 'Dashboard', path: '/', iconClass: 'ri-dashboard-3-line', exact: true },
    { label: 'Categories', path: '/categories', iconClass: 'ri-shapes-line' },
    { label: 'Occasions', path: '/occasions', iconClass: 'ri-sparkling-line' },
    { label: 'Products', path: '/products', iconClass: 'uil uil-gold' },
    { label: 'Orders', path: '/orders', iconClass: 'fa-solid fa-truck-fast' },
    { label: 'Banners', path: '/banners', iconClass: 'ri-image-edit-line' },
    { label: 'Coupons', path: '/coupons', iconClass: 'uil uil-tag-alt' },
    { label: 'Testimonials', path: '/testimonials', iconClass: 'ri-chat-quote-line' },
  ];

  const getCurrentTitle = () => {
    const item = navItems.find(i => i.exact ? location.pathname === i.path : location.pathname.startsWith(i.path));
    return item?.label || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-[#1C1410] font-body antialiased">
      
      {/* ── Desktop Sidebar: Fixed/Sticky pinned, scrollable menu internally ── */}
      <aside className="hidden lg:flex w-64 bg-[#140D0F] text-white flex-col h-screen sticky top-0 border-r border-[#C9A44A]/25 shrink-0 z-40 overflow-hidden">
        
        {/* Brand Header (Fixed) */}
        <div className="p-5 border-b border-white/10 shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-[#C9A44A]/60 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/images/bl-jewels-icon.png"
                alt="BL Jewels Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#F3E5AB] tracking-wide">
                BL JEWELS
              </h2>
              <span className="text-[11px] text-stone-400 block -mt-0.5">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-3.5 space-y-1 text-xs">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
            Store Management
          </div>

          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-[#8B1A1A] text-white font-semibold shadow-sm border border-[#C9A44A]/40'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <i className={`${item.iconClass} text-base ${isActive ? 'text-[#F3E5AB]' : 'text-stone-400'}`}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer & User Profile (Fixed bottom) */}
        <div className="p-4 border-t border-white/10 space-y-3 shrink-0">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#F3E5AB] text-xs transition-colors border border-white/10 group"
          >
            <div className="flex items-center gap-2">
              <i className="ri-external-link-line text-sm text-[#C9A44A]"></i>
              <span>Customer Website</span>
            </div>
            <span className="text-[10px] text-stone-400 group-hover:text-white">Live ↗</span>
          </a>

          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#8B1A1A] text-white text-xs font-bold flex items-center justify-center border border-[#C9A44A]/50 shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || 'Store Admin'}
                </p>
                <p className="text-[10px] text-emerald-400 truncate">
                  ● Online
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-white/10 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* ── Main Content Container ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="text-stone-400 hidden sm:inline">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-300 hidden sm:inline" />
              <h1 className="font-semibold text-sm sm:text-base text-stone-900 tracking-tight">
                {getCurrentTitle()}
              </h1>
            </div>
          </div>

          {/* Right Header Status & Store Link */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Store Live & Cloud DB Connected</span>
            </div>

            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>
          </div>

        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#140D0F] text-white p-4 space-y-1.5 border-b border-[#C9A44A]/30 animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-stone-200 hover:bg-white/10"
              >
                <i className={`${item.iconClass} text-sm text-[#F3E5AB]`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10 mt-2 flex items-center justify-between">
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-[#F3E5AB] font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Storefront</span>
              </a>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 font-medium hover:underline"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
