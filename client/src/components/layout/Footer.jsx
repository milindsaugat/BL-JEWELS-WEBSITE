import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, legalService, settingsService } from '../../services/api';
import {
  MapPin,
  Phone,
  ShieldCheck,
  HeartHandshake,
  Gem,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Mail,
  ArrowUpRight,
} from 'lucide-react';

// ─── Inline SVG social icons (lucide-react omits brand icons) ────────────────
const IgIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const FbIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const YtIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const exploreLinks = [
  ['All Jewellery',      '/collections'],
  ['Gold Jewellery',     '/collections/gold'],
  ['Diamond Jewellery',  '/collections/diamond'],
  ['Silver Jewellery',   '/collections/silver'],
  ['Bridal Jewellery',   '/collections/bridal-heritage'],
  ['Necklaces',          '/collections/necklaces'],
  ['Rings',              '/collections/rings'],
  ['Earrings',           '/collections/earrings'],
  ['Bangles & Kadas',    '/collections/bangles-kadas'],
];

const careLinks = [
  ['Contact Us',                '/contact'],
  ['Official Bank & QR Details','/bank-accounts'],
  ['Live Bullion Rates',        '/live-rate'],
  ['Blog & Royal Journal',      '/blog'],
  ['Our Heritage Story',        '/about'],
];

const userLinks = [
  ['My Profile & KYC',          '/account?tab=profile'],
  ['My Orders',                 '/account?tab=orders'],
  ['My Wishlist',               '/wishlist'],
  ['Support & Help Tickets',   '/account?tab=support'],
  ['Address Book',             '/account?tab=addresses'],
];

// ─── Trust Strip ──────────────────────────────────────────────────────────────
const FooterTrustStrip = () => {
  const items = [
    { icon: ShieldCheck, title: 'Purity You Can Trust',  desc: 'Authentic jewellery and transparent product details.' },
    { icon: Gem,         title: 'Secure Shopping',        desc: 'Safe and secure shopping experience.' },
    { icon: HeartHandshake, title: 'Personal Assistance', desc: "We're always here to help." },
  ];

  return (
    <div className="bg-[#F8F2EC] border-b border-[#E9DED2]">
      <div className="max-w-[1440px] mx-auto px-10 sm:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 py-6">
          {/* Three icon-based trust items */}
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5">
                <Icon size={20} className="text-[#C9A13B]" strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-[#292321] font-body leading-snug">{title}</p>
                <p className="text-[13px] text-[#756B65] font-body mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}

          {/* BIS Hallmark – original logo asset */}
          <div className="flex items-start gap-3">
            <img
              src="/images/bis-bureau-of-indian-standards.png"
              alt="BIS Bureau of Indian Standards"
              loading="lazy"
              className="w-11 h-11 object-contain shrink-0"
            />
            <div>
              <p className="text-[14px] font-semibold text-[#292321] font-body leading-snug">BIS Hallmark</p>
              <p className="text-[13px] text-[#756B65] font-body mt-0.5 leading-relaxed">Assured jewellery quality and purity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Brand Column ─────────────────────────────────────────────────────────────
const FooterBrand = ({ settings }) => (
  <div className="flex flex-col gap-4">
    {/* Logo – natural on background, no white pill */}
    <Link to="/" aria-label="BL Jewels Home">
      <img
        src="/images/bl-jewels-logo.png"
        alt={settings?.brandName || 'BL Jewels'}
        loading="lazy"
        className="h-11 w-auto object-contain"
        style={{ maxWidth: '185px' }}
      />
    </Link>

    {/* Tagline */}
    <p className="font-accent text-[11px] tracking-[0.22em] text-[#C9A13B] uppercase">
      {settings?.tagline || 'Purity With Auspiciousness'}
    </p>

    {/* Display heading */}
    <h2 className="font-display text-[26px] leading-[1.3] text-[#292321]">
      Made for your<br />beautiful moments.
    </h2>

    {/* Description */}
    <p className="text-[14px] text-[#756B65] font-body leading-[1.7] max-w-[270px]">
      Discover timeless jewellery crafted with purity, elegance and tradition. Celebrate every special moment with {settings?.brandName || 'BL Jewels'}.
    </p>

    {/* CTA */}
    <Link
      to="/collections"
      className="inline-flex items-center gap-1.5 text-[14px] font-semibold font-body text-[#940303] hover:text-[#780303] group transition-colors duration-200 self-start mt-1"
    >
      <span className="border-b border-[#940303]/40 group-hover:border-[#780303]/60 pb-px transition-colors duration-200">
        Explore Our Collection
      </span>
      <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  </div>
);

// ─── Nav Column (with mobile accordion) ──────────────────────────────────────
const FooterNavColumn = ({ title, links }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Heading row – acts as accordion toggle on mobile */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between mb-4 lg:pointer-events-none lg:cursor-default"
        aria-expanded={open}
      >
        <h3 className="font-accent text-[11px] tracking-[0.20em] uppercase font-semibold text-[#292321]">
          {title}
        </h3>
        <span className="lg:hidden text-[#756B65]">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      {/* Links list */}
      <ul className={`space-y-[11px] ${open ? 'block' : 'hidden'} lg:block`}>
        {links.map(([label, path]) => (
          <li key={path}>
            <Link
              to={path}
              className="relative text-[14px] text-[#756B65] font-body hover:text-[#940303] transition-colors duration-200 group/l inline-block"
            >
              {label}
              <span className="absolute -bottom-px left-0 w-0 group-hover/l:w-full h-px bg-[#940303]/40 transition-all duration-200" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Showroom Column with Live Google Map Embed ──────────────────────────────
const FooterShowroom = ({ settings }) => {
  const address = settings?.contact?.address || 'Shop No. 01, Upper Ground Floor, Suresh Mall, MG Road, Civil Lines, Agra, UP 282002';
  const phone = settings?.contact?.phone || '074549 86610';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const mapQuery = encodeURIComponent(
    settings?.contact?.address || 'Suresh Mall, Mahatma Gandhi Road, Civil Lines, Agra, Uttar Pradesh 282002'
  );
  const googleMapsUrl = `https://maps.google.com/?q=${mapQuery}`;

  return (
    <div className="flex flex-col">
      <h3 className="font-accent text-[11px] tracking-[0.20em] uppercase font-semibold text-[#292321] mb-3">
        Visit Our Showroom
      </h3>

      {/* Address block */}
      <div className="flex gap-2.5 mb-2.5">
        <MapPin size={16} className="text-[#C9A13B] shrink-0 mt-[3px]" strokeWidth={1.6} />
        <p className="text-[13px] text-[#756B65] font-body leading-[1.65] whitespace-pre-line">
          {address}
        </p>
      </div>

      {/* Showroom Timing if available */}
      {settings?.contact?.showroomTiming && (
        <p className="text-[11.5px] text-[#930303] font-semibold mb-2.5 flex items-center gap-1.5">
          <span>🕒</span>
          <span>{settings.contact.showroomTiming}</span>
        </p>
      )}

      {/* ── LIVE INTERACTIVE GOOGLE MAP EMBED (Replaces button with actual map) ── */}
      <div className="w-full my-2 rounded-xl overflow-hidden border border-[#E9DED2] bg-[#FAF7F2] shadow-xs relative group">
        <iframe
          title="BL Jewels Showroom Google Map Location"
          src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          width="100%"
          height="140"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-[140px] block border-0 transition-opacity duration-300 group-hover:opacity-95"
        />
        {/* Floating directions helper badge */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Google Maps app for live GPS navigation"
          className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-white/95 hover:bg-white text-[#930303] hover:text-[#780303] text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm border border-stone-200 backdrop-blur-xs transition-transform duration-150 hover:scale-[1.03]"
        >
          <span>Live Directions</span>
          <ArrowUpRight size={11} />
        </a>
      </div>

      {/* Phone & Direct Contact */}
      <div className="mt-2.5 pt-2 border-t border-[#E9DED2]/80 flex flex-wrap items-center justify-between gap-2 text-[13px]">
        <a
          href={`tel:${cleanPhone || '07454986610'}`}
          className="flex items-center gap-2 text-[#756B65] hover:text-[#940303] font-body transition-colors duration-200 group/p"
        >
          <Phone size={15} className="text-[#C9A13B] shrink-0 group-hover/p:text-[#940303] transition-colors duration-200" strokeWidth={1.6} />
          <span>{phone}</span>
        </a>

        <Link
          to="/contact"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#940303] hover:text-[#780303] transition-colors"
        >
          <span>Inquire</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
};

// ─── Newsletter ───────────────────────────────────────────────────────────────
const FooterNewsletter = () => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      setTimeout(() => setStatus({ type: '', text: '' }), 4000);
      return;
    }

    setBusy(true);
    setStatus({ type: '', text: '' });
    try {
      const res = await api.post('/auth/subscribe', { email: trimmed, source: 'footer' });
      setStatus({
        type: 'success',
        text: res.data?.message || "Thank you! You'll be the first to know.",
      });
      setEmail('');
      setTimeout(() => setStatus({ type: '', text: '' }), 5000);
    } catch (err) {
      setStatus({
        type: 'error',
        text: err.response?.data?.message || 'Unable to subscribe right now. Please try again.',
      });
      setTimeout(() => setStatus({ type: '', text: '' }), 4500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-[#E9DED2] pt-8 pb-2">
      <div className="max-w-[1440px] mx-auto px-10 sm:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

          {/* Heading + description */}
          <div className="max-w-sm">
            <h3 className="font-display text-[20px] text-[#292321] leading-snug mb-1">
              Stay Connected With BL Jewels
            </h3>
            <p className="text-[14px] text-[#756B65] font-body leading-relaxed">
              Discover new collections, exclusive launches and timeless inspirations.
            </p>
          </div>

          {/* Input + button */}
          <form onSubmit={handleSubmit} className="flex gap-2.5 w-full lg:w-auto lg:min-w-[400px]" noValidate>
            <label htmlFor="nl-email" className="sr-only">Email address</label>
            <div className="relative flex-1">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9A13B]" strokeWidth={1.5} />
              <input
                id="nl-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={busy}
                placeholder="Your email address"
                className="w-full h-[44px] pl-9 pr-3 border border-[#E9DED2] rounded-[7px] text-[14px] text-[#292321] font-body placeholder-[#B0A49C] bg-white focus:outline-none focus:border-[#C9A13B] transition-colors duration-200 disabled:opacity-60"
                aria-describedby="nl-status"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="h-[44px] px-6 bg-[#940303] hover:bg-[#780303] text-white rounded-[7px] text-[14px] font-semibold font-body transition-colors duration-200 cursor-pointer shrink-0 whitespace-nowrap disabled:opacity-60"
            >
              {busy ? 'Joining...' : 'Subscribe'}
            </button>
          </form>
        </div>

        {/* Inline status */}
        <div id="nl-status" className="mt-2 h-5" aria-live="polite">
          {status.type === 'success' && (
            <p className="text-[13px] text-emerald-600 font-body">{status.text}</p>
          )}
          {status.type === 'error' && (
            <p className="text-[13px] text-red-600 font-body">{status.text}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Bottom Bar ───────────────────────────────────────────────────────────────
const FooterBottomBar = ({ legalPages = [], settings }) => {
  const socials = [
    { Icon: IgIcon, href: settings?.socialLinks?.instagram || 'https://www.instagram.com/', label: 'Instagram' },
    { Icon: FbIcon, href: settings?.socialLinks?.facebook || 'https://www.facebook.com/', label: 'Facebook' },
    { Icon: YtIcon, href: settings?.socialLinks?.youtube || 'https://www.youtube.com/', label: 'YouTube' },
  ];

  return (
    <div className="border-t border-[#E9DED2] bg-[#FFFCF8]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-5">

          {/* Copyright & Brand signature */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3.5 order-3 md:order-1 text-center sm:text-left">
            <p className="text-[12.5px] text-[#756B65] font-body">
              © {new Date().getFullYear()} {settings?.brandName || 'BL Jewels'}. All rights reserved.
            </p>
            <span className="hidden sm:inline text-stone-300">·</span>
            <p className="font-accent text-[10px] tracking-[0.24em] uppercase text-[#C9A13B]">
              {settings?.tagline || 'Purity With Auspiciousness'}
            </p>
          </div>

          {/* Dynamic Legal & Compliance Links (Auto-updated from CMS) */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-[#756B65] order-2 font-body font-medium">
            {legalPages.map((p) => (
              <Link
                key={p.slug}
                to={`/page/${p.slug}`}
                className="hover:text-[#940303] transition-colors relative group py-0.5"
              >
                <span>{p.title}</span>
                <span className="absolute -bottom-px left-0 w-0 group-hover:w-full h-px bg-[#940303]/40 transition-all duration-200" />
              </Link>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-2.5 order-1 md:order-3">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`BL Jewels on ${label}`}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E9DED2] text-[#756B65] hover:text-[#940303] hover:border-[#940303]/30 transition-all duration-200"
              >
                <Icon />
              </a>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── Main Footer ──────────────────────────────────────────────────────────────
export const Footer = () => {
  const [legalPages, setLegalPages] = useState([
    { title: 'Privacy Policy', slug: 'privacy-policy' },
    { title: 'Terms & Conditions', slug: 'terms-and-conditions' },
  ]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let active = true;
    legalService.getPublicPages()
      .then((res) => {
        const pagesList = res?.pages || res?.data;
        if (active && res?.success && Array.isArray(pagesList) && pagesList.length > 0) {
          setLegalPages(pagesList);
        }
      })
      .catch(() => {});

    settingsService.getSettings()
      .then((res) => {
        const s = res?.settings || res?.data;
        if (active && res?.success && s) {
          setSettings(s);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Dynamically include legal pages into Customer Care links as well
  const dynamicCareLinks = [
    ...careLinks,
    ...legalPages.map((p) => [p.title, `/page/${p.slug}`]),
  ];

  return (
    <footer className="bg-[#FFFCF8] text-[#292321] border-t border-[#E9DED2] font-body">

      {/* 1. Trust Strip */}
      <FooterTrustStrip />

      {/* 2. Main Grid: Brand, Explore Collections, Customer Care, My Account (User Pages in Separate Grid), Showroom with Google Map */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 xl:gap-x-10 gap-y-10">
          <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
            <FooterBrand settings={settings} />
          </div>
          <FooterNavColumn title="Explore" links={exploreLinks} />
          <FooterNavColumn title="Customer Care" links={dynamicCareLinks} />
          <FooterNavColumn title="My Account" links={userLinks} />
          <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
            <FooterShowroom settings={settings} />
          </div>
        </div>
      </div>

      {/* 3. Newsletter – compact horizontal strip */}
      <FooterNewsletter />

      {/* 4. Dynamic Bottom bar */}
      <FooterBottomBar legalPages={legalPages} settings={settings} />

    </footer>
  );
};

export default Footer;
