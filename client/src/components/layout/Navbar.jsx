import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  PhoneCall,
  Crown,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { categoryService, rateService } from '../../services/api';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [liveGoldPrice, setLiveGoldPrice] = useState('₹12,742/g');
  const [dbCategories, setDbCategories] = useState([]);

  const { getItemCount, openDrawer } = useCartStore();
  const { user, isAuthenticated, logout, wishlist } = useAuthStore();
  const { openSearch, openLiveRate } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Concurrent fetch for header live rate and category navigation
    Promise.allSettled([
      rateService.getLiveRates(),
      categoryService.getCategories(),
    ]).then(([rateRes, catRes]) => {
      if (rateRes.status === 'fulfilled' && rateRes.value?.goldRates) {
        const bl22k = rateRes.value.goldRates.find(r => r.label?.includes('22KT'));
        if (bl22k?.rate) {
          setLiveGoldPrice(`${bl22k.rate}/g`);
        }
      }
      if (catRes.status === 'fulfilled' && catRes.value?.categories?.length > 0) {
        setDbCategories(catRes.value.categories);
      }
    });
  }, []);

  const cartCount = getItemCount();
  const wishlistCount = wishlist?.length || 0;

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const categoryLinks = [
    { label: 'All Collections', path: '/collections' },
    { label: 'Gold', path: '/collections?metal=gold', isMetal: true, metalType: 'gold' },
    { label: 'Diamond', path: '/collections?metal=diamond', isMetal: true, metalType: 'diamond' },
    { label: 'Silver', path: '/collections?metal=silver', isMetal: true, metalType: 'silver' },
    { label: 'Bridal Heritage', path: '/collections/bridal-heritage', isSpecial: true },
    { label: 'Necklaces', path: '/collections/necklaces' },
    { label: 'Rings', path: '/collections/rings' },
    { label: 'Earrings', path: '/collections/earrings' },
    { label: 'Bangles & Kadas', path: '/collections/bangles-bracelets' },
    { label: 'Mangalsutras', path: '/collections/mangalsutra' },
    { label: 'Live Rate', path: '/live-rate', isLiveRate: true },
    { label: 'Our Heritage', path: '/about' },
    { label: 'Boutique Contact', path: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200'
          : 'bg-white border-b border-stone-200'
      }`}
    >
      {/* ── MAIN HEADER (Full Max Width: Logo, Search, Actions) ── */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3 md:py-3.5">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-stone-800 hover:text-crimson-800 lg:hidden transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Official Brand Logo */}
            <Link to="/" className="flex items-center group shrink-0">
              {/* Full Horizontal Logo (Desktop & Tablet) */}
              <img
                src="/images/bl-jewels-logo.png"
                alt="BL Jewels — Purity with Auspiciousness"
                className="hidden sm:block h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {/* Scaled Logo on small mobile screens */}
              <img
                src="/images/bl-jewels-logo.png"
                alt="BL Jewels"
                className="sm:hidden h-10 w-auto object-contain transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Center: Search Bar Trigger */}
          <div className="flex-1 max-w-md xl:max-w-xl hidden md:block mx-2 lg:mx-4">
            <button
              onClick={openSearch}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F4EFE6] hover:bg-[#EFE9DD] border border-[#C9A44A]/40 hover:border-[#C9A44A] rounded-full text-stone-600 transition-all shadow-inner group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <i className="uil uil-search text-[#A07830] text-sm group-hover:scale-110 transition-transform"></i>
                <span className="text-xs font-body text-stone-600 truncate">
                  Search <span className="text-stone-900 font-medium">22K bridal sets, solitaire rings, polki kadas...</span>
                </span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-body text-stone-500 bg-white border border-stone-200 rounded shadow-sm">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Quick Actions (Mobile Search, Wishlist, Cart, Account) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Mobile Search Icon Trigger */}
            <button
              onClick={openSearch}
              className="p-2 md:hidden text-stone-700 hover:text-crimson-800 transition-colors"
              aria-label="Open search"
            >
              <i className="uil uil-search text-xl text-stone-800"></i>
            </button>

            {/* Today's Gold Rate Trigger (Right Gold Reference Benchmark) */}
            <button
              onClick={openLiveRate}
              className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FFF9EE] border border-[#C9A44A] text-xs whitespace-nowrap shrink-0 shadow-xs cursor-pointer group transition-all duration-200 hover:shadow-sm"
              title="Click to view live bullion rates matrix"
            >
              <i className="fa-solid fa-bell text-[#A07830] text-xs group-hover:scale-110 transition-transform"></i>
              <span className="text-stone-800 font-semibold text-[11px] whitespace-nowrap">Today's Gold Rate</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-bold text-crimson-900 font-body text-[11px] whitespace-nowrap">{liveGoldPrice}</span>
              <span className="text-[10px] text-[#A07830] font-semibold whitespace-nowrap">(22K)</span>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 text-stone-700 hover:text-crimson-800 transition-colors rounded-full hover:bg-stone-100 flex items-center justify-center"
              title="My Auspicious Wishlist"
            >
              <i className="ri-heart-3-line text-lg"></i>
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-crimson-700 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={openDrawer}
              className="relative p-2.5 text-stone-700 hover:text-crimson-800 transition-colors rounded-full hover:bg-stone-100 flex items-center justify-center"
              title="Shopping Cart"
            >
              <i className="ri-shopping-bag-3-line text-lg"></i>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C9A44A] text-stone-900 text-[10px] font-bold flex items-center justify-center shadow-gold-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account / User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-stone-100 text-stone-800 transition-colors"
                aria-label="Account menu"
              >
                <div className="w-8 h-8 rounded-full bg-[#F4EFE6] border border-[#C9A44A]/60 flex items-center justify-center text-stone-800 shadow-sm">
                  <i className="uil uil-user text-base text-stone-700"></i>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 hidden sm:block" />
              </button>

              {accountDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="font-semibold text-xs text-stone-900 truncate">{user?.name || 'Valued Patron'}</p>
                        <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                        {user?.role === 'admin' && (
                          <span className="inline-block mt-1 bg-crimson-100 text-crimson-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-crimson-200">
                            BL Authorized Admin
                          </span>
                        )}
                      </div>
                      <Link to="/account" className="block px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors">
                        My Vault & Profile
                      </Link>
                      <Link to="/account/orders" className="block px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors">
                        Order Dispatches & Tracking
                      </Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors">
                        Saved Heirlooms ({wishlistCount})
                      </Link>
                      
                      {/* Standalone Admin Portal Link */}
                      <a
                        href="http://localhost:5174"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-2 text-xs text-crimson-800 font-semibold bg-crimson-50/70 hover:bg-crimson-100/70 transition-colors my-1"
                      >
                        <span>Executive Admin Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <div className="border-t border-stone-100 my-1" />
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2.5 border-b border-stone-100 text-center">
                        <p className="font-display text-sm font-semibold text-stone-900">BL Jewels Privilege</p>
                        <p className="text-[11px] text-stone-500">Sign in for certified jewelry orders & insured tracking</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          to="/auth"
                          className="block w-full text-center py-2 bg-crimson-800 hover:bg-crimson-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                        >
                          Sign In / Register
                        </Link>
                        <a
                          href="http://localhost:5174/login"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-1.5 text-stone-600 hover:text-crimson-800 text-[11px] font-medium"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                          <span>Admin Portal Access ↗</span>
                        </a>
                      </div>
                      <div className="border-t border-stone-100 pt-1">
                        <Link to="/about" className="block px-4 py-1.5 text-xs text-stone-600 hover:bg-stone-50">
                          Our Karigar Heritage
                        </Link>
                        <Link to="/contact" className="block px-4 py-1.5 text-xs text-stone-600 hover:bg-stone-50">
                          Book VIP Appointment
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ── CATEGORY NAVIGATION STRIP (Full Max Width, No Scrollbar) ── */}
      <nav className="hidden lg:block border-t border-stone-200 bg-white">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <ul className="flex items-center justify-center gap-3.5 lg:gap-6 xl:gap-8 py-2.5 text-xs font-body font-medium whitespace-nowrap">
            {categoryLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path} className="shrink-0 whitespace-nowrap">
                  <Link
                    to={link.path}
                    onClick={(e) => {
                      if (link.isLiveRate) {
                        e.preventDefault();
                        openLiveRate();
                      }
                    }}
                    className={`relative py-1.5 flex items-center gap-1.5 tracking-wider uppercase transition-all duration-200 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-crimson-900 font-bold'
                        : link.isSpecial
                        ? 'text-crimson-800 hover:text-crimson-900 font-semibold'
                        : link.isMetal
                        ? 'text-[#8B1A1A] hover:text-[#5B101D] font-semibold'
                        : 'text-stone-700 hover:text-crimson-800'
                    }`}
                  >
                    {link.isSpecial && (
                      <i className="ri-vip-crown-2-line text-[#C9A44A] inline-block shrink-0 animate-bounce"></i>
                    )}
                    {link.isLiveRate && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    )}
                    <span className="whitespace-nowrap">{link.label}</span>
                    
                    {/* Active Underline Gold Indicator */}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C9A44A] via-[#E6C975] to-[#C9A44A] rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* ── MOBILE MENU DRAWER ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-6 py-6 space-y-5 animate-in slide-in-from-top duration-200 shadow-xl">
          
          {/* Mobile Search Button */}
          <div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openSearch();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F4EFE6] border border-[#C9A44A]/40 rounded-xl text-stone-600 text-xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#A07830]" />
                <span>Search 22K jewelry designs...</span>
              </div>
              <span className="text-[10px] text-stone-400">Search</span>
            </button>
          </div>

          <div>
            <p className="font-accent text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-2.5">
              Fine Jewelry Collections
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {categoryLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    if (link.isLiveRate) {
                      e.preventDefault();
                      openLiveRate();
                    }
                  }}
                  className={`py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors ${
                    location.pathname === link.path
                      ? 'bg-crimson-800 text-white font-semibold'
                      : 'bg-white/60 text-stone-800 hover:bg-white hover:text-crimson-800 border border-stone-200/60'
                  }`}
                >
                  {link.isSpecial && <Crown className="w-3.5 h-3.5 text-[#C9A44A]" />}
                  <span className="truncate">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
            <a
              href="tel:07454986610"
              className="flex items-center gap-2.5 text-stone-800 font-medium py-1"
            >
              <PhoneCall className="w-4 h-4 text-crimson-800" />
              <span>Direct Concierge: 074549 86610</span>
            </a>

            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-crimson-800 font-semibold py-1.5 px-3 bg-crimson-50 rounded-xl border border-crimson-200"
            >
              <span>Executive Admin Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      )}
    </header>
  );
};
export default Navbar;
