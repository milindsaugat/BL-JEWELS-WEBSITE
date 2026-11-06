import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  ['My Orders',                 '/account/orders'],
  ['My Wishlist',               '/wishlist'],
  ['My Account',                '/account'],
  ['Shipping Information',      '/contact'],
  ['Return & Exchange Policy',  '/contact'],
  ['FAQs',                      '/contact'],
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
const FooterBrand = () => (
  <div className="flex flex-col gap-4">
    {/* Logo – natural on background, no white pill */}
    <Link to="/" aria-label="BL Jewels Home">
      <img
        src="/images/bl-jewels-logo.png"
        alt="BL Jewels"
        loading="lazy"
        className="h-11 w-auto object-contain"
        style={{ maxWidth: '185px' }}
      />
    </Link>

    {/* Tagline */}
    <p className="font-accent text-[11px] tracking-[0.22em] text-[#C9A13B] uppercase">
      Purity With Auspiciousness
    </p>

    {/* Display heading */}
    <h2 className="font-display text-[26px] leading-[1.3] text-[#292321]">
      Made for your<br />beautiful moments.
    </h2>

    {/* Description */}
    <p className="text-[14px] text-[#756B65] font-body leading-[1.7] max-w-[270px]">
      Discover timeless jewellery crafted with purity, elegance and tradition. Celebrate every special moment with BL Jewels.
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

// ─── Showroom Column ──────────────────────────────────────────────────────────
const FooterShowroom = () => (
  <div>
    <h3 className="font-accent text-[11px] tracking-[0.20em] uppercase font-semibold text-[#292321] mb-4">
      Visit Our Showroom
    </h3>

    {/* Address block */}
    <div className="flex gap-2.5 mb-3">
      <MapPin size={17} className="text-[#C9A13B] shrink-0 mt-[3px]" strokeWidth={1.6} />
      <p className="text-[14px] text-[#756B65] font-body leading-[1.7]">
        Shop No. 01, Upper Ground Floor,<br />
        Suresh Mall, Mahatma Gandhi Road,<br />
        Civil Lines, Agra,<br />
        Uttar Pradesh 282002
      </p>
    </div>

    {/* Get Directions */}
    <a
      href="https://maps.google.com/?q=Suresh+Mall+Mahatma+Gandhi+Road+Civil+Lines+Agra+UP+282002"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[13px] text-[#940303] hover:text-[#780303] font-body font-medium mb-5 group/d transition-colors duration-200"
    >
      <span className="border-b border-[#940303]/30 group-hover/d:border-[#780303]/50 pb-px">Get Directions</span>
      <ArrowUpRight size={12} className="transition-transform duration-200 group-hover/d:translate-x-0.5 group-hover/d:-translate-y-0.5" />
    </a>

    {/* Phone */}
    <a
      href="tel:07454986610"
      className="flex items-center gap-2.5 text-[14px] text-[#756B65] hover:text-[#940303] font-body transition-colors duration-200 group/p"
    >
      <Phone size={17} className="text-[#C9A13B] shrink-0 group-hover/p:text-[#940303] transition-colors duration-200" strokeWidth={1.6} />
      074549 86610
    </a>
  </div>
);

// ─── Newsletter ───────────────────────────────────────────────────────────────
const FooterNewsletter = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setMsg('error');
      setTimeout(() => setMsg(''), 3500);
      return;
    }
    // Placeholder – wire to backend newsletter endpoint when available
    setMsg('success');
    setEmail('');
    setTimeout(() => setMsg(''), 5000);
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
                placeholder="Your email address"
                className="w-full h-[44px] pl-9 pr-3 border border-[#E9DED2] rounded-[7px] text-[14px] text-[#292321] font-body placeholder-[#B0A49C] bg-white focus:outline-none focus:border-[#C9A13B] transition-colors duration-200"
                aria-describedby="nl-status"
              />
            </div>
            <button
              type="submit"
              className="h-[44px] px-6 bg-[#940303] hover:bg-[#780303] text-white rounded-[7px] text-[14px] font-semibold font-body transition-colors duration-200 cursor-pointer shrink-0 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Inline status */}
        <div id="nl-status" className="mt-2 h-5" aria-live="polite">
          {msg === 'success' && (
            <p className="text-[13px] text-emerald-600 font-body">Thank you! You'll be the first to know.</p>
          )}
          {msg === 'error' && (
            <p className="text-[13px] text-red-600 font-body">Please enter a valid email address.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Bottom Bar ───────────────────────────────────────────────────────────────
const FooterBottomBar = () => {
  const socials = [
    { Icon: IgIcon, href: 'https://www.instagram.com/', label: 'Instagram' },
    { Icon: FbIcon, href: 'https://www.facebook.com/', label: 'Facebook' },
    { Icon: YtIcon, href: 'https://www.youtube.com/', label: 'YouTube' },
  ];

  return (
    <div className="border-t border-[#E9DED2] bg-[#FFFCF8]">
      <div className="max-w-[1440px] mx-auto px-10 sm:px-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 h-auto sm:h-[62px] py-4 sm:py-0">

          {/* Copyright */}
          <p className="text-[12.5px] text-[#756B65] font-body order-3 sm:order-1">
            © {new Date().getFullYear()} BL Jewels. All rights reserved.
          </p>

          {/* Brand signature */}
          <p className="font-accent text-[10px] tracking-[0.26em] uppercase text-[#C9A13B] order-2">
            Purity With Auspiciousness
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-2.5 order-1 sm:order-3">
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
export const Footer = () => (
  <footer className="bg-[#FFFCF8] text-[#292321] border-t border-[#E9DED2] font-body">

    {/* 1. Trust Strip */}
    <FooterTrustStrip />

    {/* 2. Main Grid */}
    <div className="max-w-[1440px] mx-auto px-10 sm:px-12 py-12">
      <div className="grid grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.15fr] gap-x-10 xl:gap-x-14 gap-y-10">
        <div className="col-span-2 lg:col-span-1">
          <FooterBrand />
        </div>
        <FooterNavColumn title="Explore"       links={exploreLinks} />
        <FooterNavColumn title="Customer Care" links={careLinks}    />
        <FooterShowroom />
      </div>
    </div>

    {/* 3. Newsletter – compact horizontal strip */}
    <FooterNewsletter />

    {/* 4. Bottom bar */}
    <FooterBottomBar />

  </footer>
);

export default Footer;
