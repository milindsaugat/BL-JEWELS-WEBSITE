import {
  LayoutDashboard,
  Shapes,
  Sparkles,
  Package,
  ShoppingBag,
  Image,
  Coins,
  Megaphone,
  Tag,
  MessageSquare,
  Mail,
  FileText,
  Globe,
  LifeBuoy,
  Users,
  Landmark,
  Settings,
} from 'lucide-react';

export const ADMIN_NAV_GROUPS = [
  {
    id: 'overview',
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        description: 'Live revenue, order pipeline & store metrics',
      },
    ],
  },
  {
    id: 'catalog',
    title: 'Catalog & Inventory',
    items: [
      {
        label: 'Products',
        path: '/products',
        icon: Package,
        description: '22K/18K SKUs, weight variants & pricing',
      },
      {
        label: 'Categories',
        path: '/categories',
        icon: Shapes,
        description: 'Necklaces, rings, bangles & hierarchy',
      },
      {
        label: 'Occasions',
        path: '/occasions',
        icon: Sparkles,
        description: 'Bridal, Akshaya Tritiya & curated edits',
      },
    ],
  },
  {
    id: 'orders-customers',
    title: 'Orders & Customers',
    items: [
      {
        label: 'Orders',
        path: '/orders',
        icon: ShoppingBag,
        description: 'Fulfillment, armored dispatch & invoices',
      },
      {
        label: 'Customers',
        path: '/users',
        icon: Users,
        description: 'Registered customer accounts & profiles',
      },
      {
        label: 'Support & Inquiries',
        path: '/support',
        icon: LifeBuoy,
        description: 'Contact forms & customer support tickets',
      },
      {
        label: 'Testimonials',
        path: '/testimonials',
        icon: MessageSquare,
        description: 'Customer stories & verified reviews',
      },
    ],
  },
  {
    id: 'marketing-pricing',
    title: 'Pricing & Promotions',
    items: [
      {
        label: 'Gold API & Rates',
        path: '/gold-rates',
        icon: Coins,
        description: '24K/22K/18K spot bullion & rate sync',
      },
      {
        label: 'Bank & QR Accounts',
        path: '/payment-accounts',
        icon: Landmark,
        description: 'Direct transfer bank accounts & UPI QR codes',
      },
      {
        label: 'Coupons & Offers',
        path: '/coupons',
        icon: Tag,
        description: 'Promo codes, festival timers & rebates',
      },
      {
        label: 'Banners',
        path: '/banners',
        icon: Image,
        description: 'Hero slides & promotional campaign banners',
      },
      {
        label: 'Announcements',
        path: '/announcements',
        icon: Megaphone,
        description: 'Top announcement ribbon & marquee',
      },
      {
        label: 'Subscribers',
        path: '/subscribers',
        icon: Mail,
        description: 'Newsletter & promotional mailing list',
      },
    ],
  },
  {
    id: 'seo',
    title: 'SEO & Content',
    items: [
      {
        label: 'Blog & SEO',
        path: '/blogs',
        icon: FileText,
        description: 'Royal Journal articles, meta tags & keywords',
      },
      {
        label: 'Page SEO Manager',
        path: '/blogs?tab=seo',
        icon: Globe,
        description: 'Global & per-page meta titles, descriptions & OG',
      },
    ],
  },
  {
    id: 'system',
    title: 'Store Settings',
    items: [
      {
        label: 'Settings & Legal Pages',
        path: '/settings',
        icon: Settings,
        description: 'Brand identity, legal policies CMS & admin credentials',
      },
    ],
  },
];

export const isNavItemActive = (itemPath, location) => {
  const pathname = location?.pathname || '/';
  const search = location?.search || '';
  if (itemPath === '/') return pathname === '/';
  if (itemPath.includes('?')) {
    return `${pathname}${search}` === itemPath;
  }
  if (itemPath === '/blogs') {
    return pathname === '/blogs' && search !== '?tab=seo';
  }
  return pathname.startsWith(itemPath);
};

export const findActiveNavMeta = (pathname, search = '') => {
  const loc = { pathname, search };
  for (const group of ADMIN_NAV_GROUPS) {
    const match = group.items.find((item) => isNavItemActive(item.path, loc));
    if (match) {
      return { groupTitle: group.title, groupId: group.id, label: match.label };
    }
  }
  return { groupTitle: 'Workspace', groupId: 'overview', label: 'Store management' };
};
