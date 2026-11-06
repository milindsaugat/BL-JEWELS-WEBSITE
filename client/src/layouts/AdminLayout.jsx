import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Image as BannerIcon,
  ShoppingBag,
  Package,
  Tag,
  Users,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const AdminLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Hero Banners & CMS', path: '/admin/banners', icon: BannerIcon },
    { label: 'Jewelry Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Orders & Dispatch', path: '/admin/orders', icon: Package },
    { label: 'Customers & Users', path: '/admin/users', icon: Users },
    { label: 'Coupons & Offers', path: '/admin/coupons', icon: Tag },
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => i.exact ? location.pathname === i.path : location.pathname.startsWith(i.path));
    return item?.label || 'Executive Suite';
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex text-[#1C1410] font-body">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-72 bg-[#17100D] text-white flex-col justify-between border-r border-[#C9A44A]/30 shrink-0">
        
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-white/10">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF7F2] p-1 border-2 border-gold-400/70 flex items-center justify-center shadow-gold-sm shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src="/images/bl-jewels-icon.png"
                  alt="BL Jewels Emblem"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h2 className="font-accent text-sm font-bold tracking-cinzel text-gold-300">
                  BL JEWELS
                </h2>
                <span className="text-[10px] font-accent uppercase tracking-[0.2em] text-stone-400 block -mt-0.5">
                  Executive Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 text-xs font-medium">
            <div className="px-3 py-2 text-[10px] font-accent uppercase tracking-widest text-stone-500 font-semibold">
              Management Modules
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#930303] text-white font-semibold shadow-md shadow-[#930303]/25 border border-gold-400/40'
                      : 'text-stone-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-300' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Info */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gold-300 text-xs transition-colors border border-gold-400/20"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>View Customer Storefront</span>
            </div>
            <span className="text-[10px] text-stone-400">Live ↗</span>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#930303] text-white text-xs font-bold flex items-center justify-center border border-gold-400">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {user?.name || 'Administrator'}
                </p>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Admin Authorized
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              title="Sign Out of Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Admin Top Header */}
        <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between sticky top-0 z-30">
          
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-xs text-stone-500 font-body">
              <span>Admin</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-stone-900">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-pill text-[11px] text-emerald-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Store Live & Active • BIS 916 Vault Online</span>
            </div>

            <Link
              to="/"
              className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-stone-200/80 border border-gold-300 rounded-lg text-xs font-semibold text-stone-800 transition-colors flex items-center gap-1.5"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3 text-stone-500" />
            </Link>
          </div>

        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#17100D] text-white p-4 space-y-2 border-b border-gold-400/30">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-stone-200 hover:bg-white/10"
              >
                <item.icon className="w-4 h-4 text-gold-400" />
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gold-300 border-t border-white/10 pt-3"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Customer Storefront</span>
            </Link>
          </div>
        )}

        {/* Dashboard Content Outlet */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};
