import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ChevronUp,
  ChevronRight,
  PhoneCall,
  Crown,
  ExternalLink,
  ShieldCheck,
  Package,
  MapPin,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { categoryService, rateService, productService, settingService } from '../../services/api';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [liveGoldPrice, setLiveGoldPrice] = useState('Unavailable');
  const [dbCategories, setDbCategories] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const [settings, setSettings] = useState(null);

  // Active compact dropdown: 'all' | 'gold' | 'diamond' | 'silver' | 'bridal' | 'necklaces' | 'rings' | ...
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownTimeoutRef = useRef(null);
  const [mobileExpandedSection, setMobileExpandedSection] = useState('gold');

  const { getItemCount, openDrawer } = useCartStore();
  const { user, isAuthenticated, logout, wishlist } = useAuthStore();
  const { openSearch, openLiveRate } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Concurrent fast fetch for bullion rates, categories, settings & product articles
  useEffect(() => {
    let active = true;
    rateService.getLiveRates().then((data) => {
      const rate = data?.goldRates?.find((item) => item.label?.includes('22KT'));
      if (active && rate?.rate) setLiveGoldPrice(rate.rate + '/g');
    }).catch(() => {});

    categoryService.getCategories().then((data) => {
      if (active && data?.categories) {
        setDbCategories(data.categories);
      }
    }).catch(() => {});

    settingService.getSettings().then((data) => {
      if (active && data?.settings) {
        setSettings(data.settings);
      }
    }).catch(() => {});

    productService.getProducts({ limit: 100 }).then((data) => {
      if (active && data?.products) {
        setDbProducts(data.products);
      }
    }).catch(() => {});

    return () => { active = false; };
  }, []);

  const cartCount = getItemCount();
  const wishlistCount = wishlist?.length || 0;

  // Keyboard shortcut for search (Cmd+K / Ctrl+K) & ESC to close dropdown
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      } else if (e.key === 'Escape') {
        setActiveDropdown(null);
        setAccountDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  // Handle scroll effect: IMMEDIATELY close open dropdown when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
      setActiveDropdown(null);
      setAccountDropdownOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(null);
  }, [location.pathname, location.search]);

  // Sorted dynamic categories
  const sortedCategories = useMemo(() => {
    return [...dbCategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [dbCategories]);

  // Dynamic metal filtering based on Admin Category settings
  const goldCategories = useMemo(() => {
    return sortedCategories.filter((c) =>
      (c.metals || ['gold', 'diamond', 'silver'])
        .map((m) => String(m).toLowerCase())
        .includes('gold')
    );
  }, [sortedCategories]);

  const diamondCategories = useMemo(() => {
    return sortedCategories.filter((c) =>
      (c.metals || [])
        .map((m) => String(m).toLowerCase())
        .includes('diamond')
    );
  }, [sortedCategories]);

  const silverCategories = useMemo(() => {
    return sortedCategories.filter((c) =>
      (c.metals || [])
        .map((m) => String(m).toLowerCase())
        .includes('silver')
    );
  }, [sortedCategories]);

  const bridalCategories = useMemo(() => {
    return sortedCategories.filter((c) => {
      const s = String(c.slug || '').toLowerCase();
      const n = String(c.name || '').toLowerCase();
      return (
        s.includes('bridal') ||
        s.includes('choker') ||
        s.includes('necklace') ||
        s.includes('bangle') ||
        s.includes('ring') ||
        n.includes('bridal') ||
        n.includes('choker')
      );
    });
  }, [sortedCategories]);

  // Anti-flicker hover handlers
  const handleMouseEnter = (key) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const closeDropdown = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(null);
  };

  // Direct category link helper
  const getCategoryCardUrl = (cat, metalKey) => {
    if (metalKey === 'gold') return `/collections/${cat.slug}?metal=gold`;
    if (metalKey === 'diamond') return `/collections/${cat.slug}?metal=diamond`;
    if (metalKey === 'silver') return `/collections/${cat.slug}?metal=silver`;
    if (metalKey === 'bridal') return `/collections/${cat.slug}?occasion=bridal`;
    return `/collections/${cat.slug}`;
  };

  // Filter specific product articles for a category
  const getArticlesForCategory = (key) => {
    const kw = String(key || '').toLowerCase();
    return dbProducts.filter((p) => {
      const catName = String(p.categoryName || p.category?.name || '').toLowerCase();
      const catSlug = String(p.category?.slug || '').toLowerCase();
      const prodSlug = String(p.slug || '').toLowerCase();
      const prodName = String(p.name || '').toLowerCase();

      if (kw === 'necklaces') {
        return catName.includes('necklace') || catSlug.includes('necklace') || prodSlug.includes('necklace') || prodName.includes('necklace') || catName.includes('choker') || prodName.includes('choker');
      }
      if (kw === 'rings') {
        return catName.includes('ring') || catSlug.includes('ring') || prodSlug.includes('ring') || prodName.includes('ring');
      }
      if (kw === 'earrings') {
        return catName.includes('earring') || catSlug.includes('earring') || prodSlug.includes('earring') || prodName.includes('earring') || prodName.includes('jhumka') || prodName.includes('chandbali');
      }
      if (kw === 'bangles-bracelets') {
        return catName.includes('bangle') || catSlug.includes('bangle') || prodSlug.includes('bangle') || prodName.includes('bangle') || catName.includes('bracelet') || prodName.includes('kada');
      }
      if (kw === 'mangalsutra') {
        return catName.includes('mangalsutra') || catSlug.includes('mangalsutra') || prodSlug.includes('mangalsutra') || prodName.includes('mangalsutra');
      }
      return catSlug.includes(kw) || catName.includes(kw);
    });
  };

  // Metadata for the compact dropdown box
  const getDropdownMeta = (key) => {
    switch (key) {
      case 'necklaces': {
        const articles = getArticlesForCategory('necklaces');
        const fallbackNecklaces = [
          {
            _id: 'nk-def-1',
            name: 'Lakshmi Kasu Mala Heritage Necklace 22K',
            slug: 'lakshmi-kasu-mala-heritage-necklace-22k',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80',
            subtitle: '₹3,95,000',
            url: '/products/lakshmi-kasu-mala-heritage-necklace-22k',
          },
          {
            _id: 'nk-def-2',
            name: 'Maya Royal Kundan Choker Necklace',
            slug: 'maya-royal-kundan-choker-necklace',
            image: 'https://images.unsplash.com/photo-1611591475836-8c4d29388147?auto=format&fit=crop&w=150&q=80',
            subtitle: '₹3,42,000',
            url: '/products/maya-royal-kundan-choker-necklace',
          },
        ];
        const displayItems = articles.length > 0 ? articles.map((p) => {
          const price = p.variants?.[0]?.discountPrice || p.variants?.[0]?.price || p.basePrice;
          return {
            _id: p._id,
            name: p.name,
            slug: p.slug,
            image: p.images?.[0]?.url || p.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80',
            subtitle: price ? `₹${Number(price).toLocaleString('en-IN')}` : 'View Article',
            url: `/products/${p.slug}`,
          };
        }) : fallbackNecklaces;

        return {
          title: 'Certified Necklace Articles & Creations',
          badge: 'Pure 22K & 18K Hallmarked',
          exploreAllLabel: 'View All Necklaces',
          exploreAllUrl: '/collections/necklaces',
          items: displayItems,
        };
      }
      case 'rings': {
        const articles = getArticlesForCategory('rings');
        const fallbackRings = [
          {
            _id: 'rg-def-1',
            name: 'Eternity Solitaire Diamond Ring 18K Rose Gold',
            slug: 'eternity-solitaire-diamond-ring-18k-rose-gold',
            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=150&q=80',
            subtitle: '₹1,72,000',
            url: '/products/eternity-solitaire-diamond-ring-18k-rose-gold',
          },
        ];
        const displayItems = articles.length > 0 ? articles.map((p) => {
          const price = p.variants?.[0]?.discountPrice || p.variants?.[0]?.price || p.basePrice;
          return {
            _id: p._id,
            name: p.name,
            slug: p.slug,
            image: p.images?.[0]?.url || p.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=150&q=80',
            subtitle: price ? `₹${Number(price).toLocaleString('en-IN')}` : 'View Article',
            url: `/products/${p.slug}`,
          };
        }) : fallbackRings;

        return {
          title: 'Certified Solitaire & Heritage Rings',
          badge: 'Hallmarked Perfection',
          exploreAllLabel: 'View All Rings',
          exploreAllUrl: '/collections/rings',
          items: displayItems,
        };
      }
      case 'earrings': {
        const articles = getArticlesForCategory('earrings');
        const fallbackEarrings = [
          {
            _id: 'er-def-1',
            name: 'Noor Chandbali Earrings with Emerald Accents',
            slug: 'noor-chandbali-earrings-with-emerald-accents',
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=150&q=80',
            subtitle: '₹1,98,000',
            url: '/products/noor-chandbali-earrings-with-emerald-accents',
          },
          {
            _id: 'er-def-2',
            name: 'Devi Traditional Temple Jhumka Earrings 22K',
            slug: 'devi-traditional-temple-jhumka-earrings-22k',
            image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=150&q=80',
            subtitle: '₹1,98,000',
            url: '/products/devi-traditional-temple-jhumka-earrings-22k',
          },
        ];
        const displayItems = articles.length > 0 ? articles.map((p) => {
          const price = p.variants?.[0]?.discountPrice || p.variants?.[0]?.price || p.basePrice;
          return {
            _id: p._id,
            name: p.name,
            slug: p.slug,
            image: p.images?.[0]?.url || p.images?.[0] || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=150&q=80',
            subtitle: price ? `₹${Number(price).toLocaleString('en-IN')}` : 'View Article',
            url: `/products/${p.slug}`,
          };
        }) : fallbackEarrings;

        return {
          title: 'Traditional & Modern Earrings',
          badge: 'Jhumkas, Studs & Drops',
          exploreAllLabel: 'View All Earrings',
          exploreAllUrl: '/collections/earrings',
          items: displayItems,
        };
      }
      case 'bangles-bracelets': {
        const articles = getArticlesForCategory('bangles-bracelets');
        const fallbackBangles = [
          {
            _id: 'bg-def-1',
            name: 'Celestial Diamond Tennis Bracelet 18K White Gold',
            slug: 'celestial-diamond-tennis-bracelet-18k-white-gold',
            image: 'https://images.unsplash.com/photo-1611591475836-8c4d29388147?auto=format&fit=crop&w=150&q=80',
            subtitle: '₹2,55,000',
            url: '/products/celestial-diamond-tennis-bracelet-18k-white-gold',
          },
          {
            _id: 'bg-def-2',
            name: 'Royal Rajwadi Polki Kada Bangle 22K Gold',
            slug: 'royal-rajwadi-polki-kada-bangle-22k-gold',
            image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=150&q=80',
            subtitle: '₹2,89,000',
            url: '/products/royal-rajwadi-polki-kada-bangle-22k-gold',
          },
        ];
        const displayItems = articles.length > 0 ? articles.map((p) => {
          const price = p.variants?.[0]?.discountPrice || p.variants?.[0]?.price || p.basePrice;
          return {
            _id: p._id,
            name: p.name,
            slug: p.slug,
            image: p.images?.[0]?.url || p.images?.[0] || 'https://images.unsplash.com/photo-1611591475836-8c4d29388147?auto=format&fit=crop&w=150&q=80',
            subtitle: price ? `₹${Number(price).toLocaleString('en-IN')}` : 'View Article',
            url: `/products/${p.slug}`,
          };
        }) : fallbackBangles;

        return {
          title: 'Royal Kadas & Bracelets',
          badge: 'Heritage & Modern',
          exploreAllLabel: 'View All Bangles',
          exploreAllUrl: '/collections/bangles-bracelets',
          items: displayItems,
        };
      }
      case 'mangalsutra': {
        const articles = getArticlesForCategory('mangalsutra');
        const fallbackMangalsutra = [
          {
            _id: 'mg-def-1',
            name: 'Auspicious Swarna Mangalsutra 22K Gold',
            slug: 'auspicious-swarna-mangalsutra-22k-gold',
            image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=150&q=80',
            subtitle: '₹82,900',
            url: '/products/auspicious-swarna-mangalsutra-22k-gold',
          },
        ];
        const displayItems = articles.length > 0 ? articles.map((p) => {
          const price = p.variants?.[0]?.discountPrice || p.variants?.[0]?.price || p.basePrice;
          return {
            _id: p._id,
            name: p.name,
            slug: p.slug,
            image: p.images?.[0]?.url || p.images?.[0] || 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=150&q=80',
            subtitle: price ? `₹${Number(price).toLocaleString('en-IN')}` : 'View Article',
            url: `/products/${p.slug}`,
          };
        }) : fallbackMangalsutra;

        return {
          title: 'Auspicious Sacred Mangalsutras',
          badge: '22K Gold & Diamond',
          exploreAllLabel: 'View All Mangalsutras',
          exploreAllUrl: '/collections/mangalsutra',
          items: displayItems,
        };
      }
      case 'gold':
        return {
          title: 'Gold Jewellery',
          badge: '22K & 18K Hallmarked',
          exploreAllLabel: 'View All Gold',
          exploreAllUrl: '/collections?metal=gold',
          items: goldCategories.map((c) => ({
            _id: c._id || c.slug,
            name: c.name,
            slug: c.slug,
            image: c.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80',
            subtitle: 'Explore →',
            url: getCategoryCardUrl(c, 'gold'),
          })),
        };
      case 'diamond':
        return {
          title: 'Diamond Jewellery',
          badge: 'Certified Solitaires',
          exploreAllLabel: 'View All Diamond',
          exploreAllUrl: '/collections?metal=diamond',
          items: diamondCategories.map((c) => ({
            _id: c._id || c.slug,
            name: c.name,
            slug: c.slug,
            image: c.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=150&q=80',
            subtitle: 'Explore →',
            url: getCategoryCardUrl(c, 'diamond'),
          })),
        };
      case 'silver':
        return {
          title: 'Silver Jewellery',
          badge: '925 Fine Sterling',
          exploreAllLabel: 'View All Silver',
          exploreAllUrl: '/collections?metal=silver',
          items: silverCategories.map((c) => ({
            _id: c._id || c.slug,
            name: c.name,
            slug: c.slug,
            image: c.image || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=150&q=80',
            subtitle: 'Explore →',
            url: getCategoryCardUrl(c, 'silver'),
          })),
        };
      case 'bridal':
        return {
          title: 'Bridal Heritage',
          badge: 'Wedding Trousseau',
          exploreAllLabel: 'View All Bridal',
          exploreAllUrl: '/collections/bridal-heritage',
          items: (bridalCategories.length > 0 ? bridalCategories : sortedCategories.slice(0, 7)).map((c) => ({
            _id: c._id || c.slug,
            name: c.name,
            slug: c.slug,
            image: c.image || 'https://images.unsplash.com/photo-1611591475836-8c4d29388147?auto=format&fit=crop&w=150&q=80',
            subtitle: 'Explore →',
            url: getCategoryCardUrl(c, 'bridal'),
          })),
        };
      case 'all':
      default:
        return {
          title: 'All Collections',
          badge: 'BL Jewels Catalog',
          exploreAllLabel: 'View All',
          exploreAllUrl: '/collections',
          items: sortedCategories.map((c) => ({
            _id: c._id || c.slug,
            name: c.name,
            slug: c.slug,
            image: c.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80',
            subtitle: 'Explore →',
            url: getCategoryCardUrl(c, 'all'),
          })),
        };
    }
  };

  // Check if dropdown is enabled (via Admin Settings or Category showDropdown toggle)
  const isDropdownEnabled = (key) => {
    // 1. Metal / Global collections
    if (['all', 'gold', 'diamond', 'silver', 'bridal'].includes(key)) {
      if (settings?.navbarDropdowns && typeof settings.navbarDropdowns[key] === 'boolean') {
        return settings.navbarDropdowns[key];
      }
      return true;
    }
    // 2. Specific product categories
    const cat = dbCategories.find((c) => c.slug === key);
    if (cat && typeof cat.showDropdown === 'boolean') {
      return cat.showDropdown;
    }
    return true;
  };

  // Nav Items definition with live dynamic dropdown toggles
  const navItems = [
    { key: 'all', label: 'All Collections', path: '/collections', hasDropdown: isDropdownEnabled('all') },
    { key: 'gold', label: 'Gold', path: '/collections?metal=gold', hasDropdown: isDropdownEnabled('gold'), isMetal: true },
    { key: 'diamond', label: 'Diamond', path: '/collections?metal=diamond', hasDropdown: isDropdownEnabled('diamond'), isMetal: true },
    { key: 'silver', label: 'Silver', path: '/collections?metal=silver', hasDropdown: isDropdownEnabled('silver'), isMetal: true },
    { key: 'bridal', label: 'Bridal Heritage', path: '/collections/bridal-heritage', hasDropdown: isDropdownEnabled('bridal'), isSpecial: true },
    { key: 'necklaces', label: 'Necklaces', path: '/collections/necklaces', hasDropdown: isDropdownEnabled('necklaces') },
    { key: 'rings', label: 'Rings', path: '/collections/rings', hasDropdown: isDropdownEnabled('rings') },
    { key: 'earrings', label: 'Earrings', path: '/collections/earrings', hasDropdown: isDropdownEnabled('earrings') },
    { key: 'bangles-bracelets', label: 'Bangles & Kadas', path: '/collections/bangles-bracelets', hasDropdown: isDropdownEnabled('bangles-bracelets') },
    { key: 'mangalsutra', label: 'Mangalsutras', path: '/collections/mangalsutra', hasDropdown: isDropdownEnabled('mangalsutra') },
    { label: 'Live Rate', path: '/live-rate', isLiveRate: true },
    { label: 'Contact Us', path: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200'
          : 'bg-white border-b border-stone-200'
      }`}
    >
      {/* ── MAIN HEADER (Logo, Search, Actions) ── */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3 md:py-3.5">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-stone-800 hover:text-[#930303] lg:hidden transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Official Brand Logo */}
            <Link to="/" className="flex items-center group shrink-0">
              <img
                src="/images/bl-jewels-logo.png"
                alt="BL Jewels — Purity with Auspiciousness"
                className="hidden sm:block h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
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
              className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F4EFE6] hover:bg-[#EFE9DD] border border-[#C9A44A]/40 hover:border-[#C9A44A] rounded-full text-stone-600 transition-all shadow-inner group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-[#A07830] group-hover:text-[#930303] transition-colors" />
                <span className="text-xs font-body tracking-wide text-stone-500">
                  Search 22K bridal sets, solitaire rings, polki kadas...
                </span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-stone-400 bg-white/80 rounded border border-stone-200">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3.5 lg:gap-4 shrink-0">
            
            {/* Live Gold Rate Chip */}
            <button
              onClick={openLiveRate}
              className="hidden xl:inline-flex items-center gap-2 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#E9DED2] rounded-full text-xs font-body transition-colors cursor-pointer"
              title="Click to view live gold & silver spot rates"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-stone-600 font-medium">Today's Gold Rate:</span>
              <span className="text-xs font-bold text-[#930303] font-body">{liveGoldPrice}</span>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-stone-700 hover:text-[#930303] transition-colors relative"
              aria-label="View Saved Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.75]" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#930303] text-white text-[10px] font-bold flex items-center justify-center font-body shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag */}
            <button
              onClick={openDrawer}
              className="p-2 text-stone-700 hover:text-[#930303] transition-colors relative cursor-pointer"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#930303] text-white text-[10px] font-bold flex items-center justify-center font-body shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Patron Account */}
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className={`flex items-center gap-1.5 p-1.5 rounded-full border transition-all cursor-pointer ${
                  isAuthenticated
                    ? 'border-[#930303]/40 bg-[#FAF7F2] text-[#930303]'
                    : 'border-stone-200 hover:border-stone-400 text-stone-700'
                }`}
                aria-label="User Account Menu"
              >
                <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#E9DED2] flex items-center justify-center text-xs font-bold text-[#930303]">
                  {isAuthenticated ? (user?.name?.[0]?.toUpperCase() || 'P') : <UserIcon className="w-4 h-4 text-stone-600" />}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 mr-0.5" />
              </button>

              {/* Account Dropdown Menu */}
              {accountDropdownOpen && (
                <div
                  onMouseLeave={() => setAccountDropdownOpen(false)}
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="p-4 bg-gradient-to-br from-[#FAF7F2] to-[#F5ECE1] border-b border-stone-200 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#930303] text-white flex items-center justify-center font-display font-bold text-sm shadow-xs shrink-0">
                          {user?.name?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-bold text-sm text-stone-900 truncate">
                            {user?.name || 'Customer'}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate font-body">
                            {user?.email}
                          </p>
                          {user?.role === 'admin' ? (
                            <span className="inline-block mt-0.5 bg-[#930303]/10 text-[#930303] text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-[#930303]/20 uppercase">
                              Authorized Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-gold-700 font-medium">
                              <Sparkles className="w-2.5 h-2.5 text-gold-600" />
                              <span>Privilege Member</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-1.5 text-xs text-stone-700 font-body space-y-0.5">
                        <Link
                          to="/account"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#FAF7F2] hover:text-[#930303] transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-stone-400" />
                          <span className="font-medium">My Profile & Account</span>
                        </Link>

                        <Link
                          to="/account/orders"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#FAF7F2] hover:text-[#930303] transition-colors"
                        >
                          <Package className="w-4 h-4 text-stone-400" />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="font-medium">Orders & Tracking</span>
                            <span className="text-[10px] text-stone-400">Armored Blue Dart</span>
                          </div>
                        </Link>

                        <Link
                          to="/wishlist"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#FAF7F2] hover:text-[#930303] transition-colors"
                        >
                          <Heart className="w-4 h-4 text-stone-400" />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="font-medium">Saved Wishlist</span>
                            {wishlistCount > 0 && (
                              <span className="text-[10px] bg-[#930303]/10 text-[#930303] font-bold px-1.5 py-0.2 rounded-full">
                                {wishlistCount}
                              </span>
                            )}
                          </div>
                        </Link>

                        {user?.role === 'admin' && (
                          <a
                            href="http://localhost:5174"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-3 py-2 text-xs text-[#930303] font-semibold bg-[#930303]/5 hover:bg-[#930303]/10 rounded-xl transition-colors my-1"
                          >
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A44A]" />
                              <span>Executive Admin Portal</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <div className="border-t border-stone-100 my-1 pt-1" />

                        <button
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 sm:p-5 space-y-3 font-body">
                      <div>
                        <p className="font-display text-base font-bold text-stone-900">
                          Welcome to BL Jewels
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                          Sign in to manage certified jewelry orders, track deliveries and save heirlooms.
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <Link
                          to="/auth"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="block w-full py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold tracking-wider shadow-sm hover:shadow transition-all text-center cursor-pointer uppercase"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/auth?tab=register"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="block w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-medium border border-stone-200 transition-colors text-center cursor-pointer"
                        >
                          New Registration
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ── CATEGORY NAVIGATION STRIP & FULL-WIDTH DROPDOWN ── */}
      <nav
        className="hidden lg:block border-t border-stone-200 bg-white relative w-full"
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 overflow-x-auto no-scrollbar">
          <ul className="flex items-center justify-between min-w-max gap-1 lg:gap-1.5 xl:gap-2.5 2xl:gap-3.5 py-2 text-[10.5px] lg:text-[11px] xl:text-[11.5px] 2xl:text-xs font-body font-medium whitespace-nowrap w-full">
            {navItems.map((item) => {
              const isDropdown = Boolean(item.hasDropdown);
              const isDropdownOpen = activeDropdown === item.key;
              const isCurrentActive =
                location.pathname === item.path ||
                (item.key === 'gold' && location.search.includes('metal=gold')) ||
                (item.key === 'diamond' && location.search.includes('metal=diamond')) ||
                (item.key === 'silver' && location.search.includes('metal=silver'));

              return (
                <li
                  key={item.key || item.path}
                  className="relative shrink-0 whitespace-nowrap"
                  onMouseEnter={() => {
                    if (isDropdown) handleMouseEnter(item.key);
                    else handleMouseLeave();
                  }}
                >
                  <Link
                    to={item.path}
                    onClick={(e) => {
                      if (item.isLiveRate) {
                        e.preventDefault();
                        openLiveRate();
                      } else {
                        closeDropdown();
                      }
                    }}
                    className={`relative py-1 px-1 lg:px-1.5 xl:px-2 flex items-center gap-0.5 lg:gap-1 tracking-wider uppercase transition-all duration-200 whitespace-nowrap shrink-0 group ${
                      isDropdownOpen || isCurrentActive
                        ? 'text-[#930303] font-bold'
                        : item.isSpecial || item.isMetal
                        ? 'text-[#930303] hover:text-[#7A0303] font-semibold'
                        : 'text-stone-700 hover:text-[#930303]'
                    }`}
                  >
                    {item.isSpecial && (
                      <Crown className="w-3 h-3 text-[#C9A44A] inline-block shrink-0 animate-bounce" />
                    )}
                    {item.isLiveRate && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    )}
                    <span className="whitespace-nowrap">{item.label}</span>
                    
                    {/* Small down chevron */}
                    {isDropdown && (
                      <ChevronDown
                        className={`w-2.5 h-2.5 transition-transform duration-200 shrink-0 ${
                          isDropdownOpen ? 'rotate-180 text-[#930303]' : 'text-stone-400 group-hover:text-stone-700'
                        }`}
                      />
                    )}

                    {/* Active Underline Gold Indicator */}
                    {(isCurrentActive || isDropdownOpen) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C9A44A] via-[#E6C975] to-[#C9A44A] rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── FULL-WIDTH LUXURY DROPDOWN (Sleek Compact Height with Image + Name Next to it) ── */}
        {activeDropdown && (
          <div
            onMouseEnter={() => {
              if (dropdownTimeoutRef.current) {
                clearTimeout(dropdownTimeoutRef.current);
                dropdownTimeoutRef.current = null;
              }
            }}
            onMouseLeave={handleMouseLeave}
            className="absolute left-0 right-0 top-full w-full bg-[#FFFDF9] border-b border-[#E9DED2] shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {(() => {
              const meta = getDropdownMeta(activeDropdown);
              return (
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-3.5 sm:py-4">
                  
                  {/* Top Bar: Metal/Category title, count badge & explore all */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#E9DED2]/80 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#930303]" />
                      <h3 className="font-display font-bold text-xs sm:text-sm text-[#930303] uppercase tracking-wider">
                        {meta.title}
                      </h3>
                      <span className="text-xs text-stone-300 font-body">✦</span>
                      <span className="text-[11px] font-semibold text-stone-500 font-body">
                        {meta.items.length} {meta.items.length === 1 ? 'Design' : 'Designs'} Live
                      </span>
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#930303]/10 text-[#930303] border border-[#930303]/20">
                        {meta.badge}
                      </span>
                    </div>

                    <Link
                      to={meta.exploreAllUrl}
                      onClick={closeDropdown}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#930303] hover:text-[#780303] uppercase tracking-wider font-body hover:underline transition-colors shrink-0"
                    >
                      <span>{meta.exploreAllLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* 100% Full-Width Uniform Grid: 5 columns on desktop so all cards have identical size across rows */}
                  {meta.items.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-2.5 sm:gap-3">
                      {meta.items.map((item) => (
                        <Link
                          key={item._id || item.slug}
                          to={item.url}
                          onClick={closeDropdown}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E9DED2] hover:border-[#930303]/40 hover:shadow-xs transition-all duration-200 group text-left cursor-pointer"
                        >
                          {/* Chote se box me cover image */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative shadow-2xs">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80'}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>

                          {/* Uske aage name */}
                          <div className="min-w-0 flex-1">
                            <p className="font-display font-semibold text-xs text-stone-900 group-hover:text-[#930303] transition-colors truncate">
                              {item.name}
                            </p>
                            <span className="text-[11px] font-bold text-[#930303] group-hover:text-[#7A0303] transition-colors font-body flex items-center gap-0.5 mt-0.5">
                              {item.subtitle} <span className="text-[10px] text-stone-400 group-hover:translate-x-0.5 transition-transform">→</span>
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-stone-500 font-body">
                      No items configured for this selection.
                    </div>
                  )}

                  {/* Compact Bottom Trust Strip */}
                  <div className="mt-3 pt-2 border-t border-[#E9DED2]/60 flex flex-wrap items-center justify-between gap-3 text-[10px] sm:text-[11px] text-stone-500 font-body">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C9A44A]" />
                      <span>100% Certified BIS 916 Hallmark Purity</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#C9A44A]" />
                      <span>Complimentary Insured Armored Blue Dart Dispatch</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C9A44A]" />
                      <span>Civil Lines, Agra Showroom</span>
                    </span>
                  </div>

                </div>
              );
            })()}
          </div>
        )}
      </nav>

      {/* ── MOBILE MENU DRAWER ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-5 py-6 space-y-5 animate-in slide-in-from-top duration-200 shadow-xl max-h-[85vh] overflow-y-auto">
          
          {/* Mobile Search Button */}
          <div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openSearch();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F4EFE6] border border-[#C9A44A]/40 rounded-xl text-stone-600 text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#A07830]" />
                <span>Search 22K jewelry designs...</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">Search</span>
            </button>
          </div>

          {/* Expandable Accordions for Metals with dynamic categories */}
          <div className="space-y-2 text-xs font-body">
            
            {/* 1. Gold Jewellery Accordion */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileExpandedSection(mobileExpandedSection === 'gold' ? null : 'gold')}
                className="w-full flex items-center justify-between p-3.5 bg-[#FAF7F2] font-semibold text-stone-900 cursor-pointer"
              >
                <span className="flex items-center gap-2 text-[#930303] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A44A]" />
                  <span>Gold Jewellery ({goldCategories.length})</span>
                </span>
                {mobileExpandedSection === 'gold' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {mobileExpandedSection === 'gold' && (
                <div className="p-3 bg-white grid grid-cols-2 gap-2 border-t border-stone-100">
                  {goldCategories.map((c) => (
                    <Link
                      key={c._id || c.slug}
                      to={`/collections/${c.slug}?metal=gold`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 hover:bg-stone-100"
                    >
                      <img src={c.image} alt={c.name} className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0" />
                      <span className="font-medium text-stone-800 text-[11px] truncate">{c.name}</span>
                    </Link>
                  ))}
                  <Link
                    to="/collections?metal=gold"
                    onClick={() => setMobileMenuOpen(false)}
                    className="col-span-2 text-center py-2 text-[#930303] font-bold text-xs bg-[#930303]/5 rounded-xl mt-1"
                  >
                    View All Gold Creations →
                  </Link>
                </div>
              )}
            </div>

            {/* 2. Diamond Jewellery Accordion */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileExpandedSection(mobileExpandedSection === 'diamond' ? null : 'diamond')}
                className="w-full flex items-center justify-between p-3.5 bg-[#FAF7F2] font-semibold text-stone-900 cursor-pointer"
              >
                <span className="flex items-center gap-2 text-[#930303] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A44A]" />
                  <span>Diamond Jewellery ({diamondCategories.length})</span>
                </span>
                {mobileExpandedSection === 'diamond' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {mobileExpandedSection === 'diamond' && (
                <div className="p-3 bg-white grid grid-cols-2 gap-2 border-t border-stone-100">
                  {diamondCategories.map((c) => (
                    <Link
                      key={c._id || c.slug}
                      to={`/collections/${c.slug}?metal=diamond`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 hover:bg-stone-100"
                    >
                      <img src={c.image} alt={c.name} className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0" />
                      <span className="font-medium text-stone-800 text-[11px] truncate">{c.name}</span>
                    </Link>
                  ))}
                  <Link
                    to="/collections?metal=diamond"
                    onClick={() => setMobileMenuOpen(false)}
                    className="col-span-2 text-center py-2 text-[#930303] font-bold text-xs bg-[#930303]/5 rounded-xl mt-1"
                  >
                    View All Diamond Creations →
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Silver Jewellery Accordion */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileExpandedSection(mobileExpandedSection === 'silver' ? null : 'silver')}
                className="w-full flex items-center justify-between p-3.5 bg-[#FAF7F2] font-semibold text-stone-900 cursor-pointer"
              >
                <span className="flex items-center gap-2 text-[#930303] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A44A]" />
                  <span>Silver Jewellery ({silverCategories.length})</span>
                </span>
                {mobileExpandedSection === 'silver' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {mobileExpandedSection === 'silver' && (
                <div className="p-3 bg-white grid grid-cols-2 gap-2 border-t border-stone-100">
                  {silverCategories.map((c) => (
                    <Link
                      key={c._id || c.slug}
                      to={`/collections/${c.slug}?metal=silver`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 hover:bg-stone-100"
                    >
                      <img src={c.image} alt={c.name} className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0" />
                      <span className="font-medium text-stone-800 text-[11px] truncate">{c.name}</span>
                    </Link>
                  ))}
                  <Link
                    to="/collections?metal=silver"
                    onClick={() => setMobileMenuOpen(false)}
                    className="col-span-2 text-center py-2 text-[#930303] font-bold text-xs bg-[#930303]/5 rounded-xl mt-1"
                  >
                    View All Silver Creations →
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <Link
                to="/collections/bridal-heritage"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-[#930303] font-bold flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 text-[#C9A44A]" />
                <span>Bridal Heritage</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLiveRate();
                }}
                className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-stone-800 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Gold Rate</span>
              </button>
              <Link
                to="/collections"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-white border border-stone-200 text-stone-700 font-medium"
              >
                All Collections
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-white border border-stone-200 text-stone-700 font-medium"
              >
                Contact Us
              </Link>
            </div>

          </div>

          {/* Showroom & Admin Footer */}
          <div className="pt-3 border-t border-stone-200 space-y-2 text-xs font-body">
            <a
              href="tel:07454986610"
              className="flex items-center gap-2.5 text-stone-800 font-medium py-1"
            >
              <PhoneCall className="w-4 h-4 text-[#930303]" />
              <span>Showroom Contact: 074549 86610</span>
            </a>

            {user?.role === 'admin' && (
              <a
                href="http://localhost:5174"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-[#930303] font-semibold py-1.5 px-3 bg-[#930303]/5 rounded-xl border border-[#930303]/20"
              >
                <span>Executive Admin Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

        </div>
      )}
    </header>
  );
};

export default Navbar;
