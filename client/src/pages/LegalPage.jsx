import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Calendar,
  Printer,
  Share2,
  FileText,
  ChevronRight,
  LifeBuoy,
  Phone,
  Mail,
  ArrowRight,
  Check,
} from 'lucide-react';
import { legalService } from '../services/api';

export const LegalPage = () => {
  const { slug: paramSlug } = useParams();
  const location = useLocation();

  // Handle direct routes /privacy-policy and /terms-and-conditions
  let activeSlug = paramSlug;
  if (!activeSlug) {
    if (location.pathname.includes('privacy')) activeSlug = 'privacy-policy';
    else if (location.pathname.includes('terms')) activeSlug = 'terms-and-conditions';
    else activeSlug = 'privacy-policy';
  }

  const [page, setPage] = useState(null);
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    let isMounted = true;
    setLoading(true);
    setError('');

    Promise.all([
      legalService.getPageBySlug(activeSlug),
      legalService.getPublicPages().catch(() => ({ pages: [] })),
    ])
      .then(([pageRes, allRes]) => {
        if (!isMounted) return;
        if (pageRes?.success && pageRes.page) {
          setPage(pageRes.page);
        } else {
          setError('The requested legal policy or terms document could not be located.');
        }

        if (allRes?.success && Array.isArray(allRes.pages)) {
          setAllPages(allRes.pages);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Unable to load policy. Please try again.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSlug]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#292321] font-body selection:bg-[#C9A44A]/30">
      
      {/* ── Regal Hero Banner ── */}
      <section className="relative bg-gradient-to-b from-[#240B0B] via-[#1D0808] to-[#140505] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#C9A44A]/30 overflow-hidden">
        {/* Subtle royal background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C9A44A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#930303]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1240px] mx-auto relative z-10">
          
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-400 mb-6 font-body">
            <Link to="/" className="hover:text-[#C9A44A] transition-colors">Home</Link>
            <ChevronRight size={13} className="text-stone-600" />
            <span className="text-stone-300">Policies &amp; Legal</span>
            <ChevronRight size={13} className="text-stone-600" />
            <span className="text-[#C9A44A] font-medium">{page?.title || 'Policy Document'}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A44A]/15 border border-[#C9A44A]/40 text-[#C9A44A] text-[11px] font-accent uppercase tracking-[0.2em] font-semibold">
                <ShieldCheck size={14} className="text-[#C9A44A]" />
                <span>Royal Atelier Policy &amp; Compliance</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                {loading ? 'Loading Policy…' : page?.title || 'Legal Document'}
              </h1>

              {page?.summary && (
                <p className="text-sm sm:text-base text-stone-300 font-normal leading-relaxed pt-1">
                  {page.summary}
                </p>
              )}

              {page?.lastUpdated && (
                <div className="flex items-center gap-2 text-xs text-stone-400 pt-2 font-mono">
                  <Calendar size={13} className="text-[#C9A44A]" />
                  <span>
                    Effective &amp; Last Revised: {new Date(page.lastUpdated).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions (Print & Share) */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white border border-white/15 text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                title="Print policy document"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9A44A]/20 hover:bg-[#C9A44A]/30 text-[#C9A44A] border border-[#C9A44A]/40 text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                title="Copy policy URL"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Policy Content & Navigation ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
          
          {/* Sticky Sidebar: Legal Pages Directory */}
          <aside className="space-y-6 lg:sticky lg:top-24 order-2 lg:order-1">
            <div className="bg-white rounded-2xl border border-[#E9DED2] p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <FileText size={16} className="text-[#930303]" />
                <h3 className="font-accent text-xs uppercase tracking-wider font-bold text-stone-900">
                  All Policies &amp; Governance
                </h3>
              </div>

              <nav className="space-y-1">
                {allPages.map((p) => {
                  const isActive = p.slug === activeSlug;
                  return (
                    <Link
                      key={p.slug}
                      to={`/page/${p.slug}`}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#930303] text-white font-semibold shadow-xs'
                          : 'text-stone-700 hover:bg-stone-50 hover:text-[#930303]'
                      }`}
                    >
                      <span className="truncate">{p.title}</span>
                      <ChevronRight size={13} className={isActive ? 'text-white' : 'text-stone-400'} />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Concierge Assistance Card */}
            <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F5ECE1] rounded-2xl border border-[#C9A44A]/40 p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <LifeBuoy size={16} className="text-[#930303]" />
                <h4 className="font-display font-bold text-sm text-stone-900">
                  Concierge Support
                </h4>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-body">
                Have questions regarding hallmarking verification, armored transit insurance, or PAN compliance?
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <a
                  href="tel:07454986610"
                  className="flex items-center gap-2 text-stone-800 hover:text-[#930303] font-medium transition-colors"
                >
                  <Phone size={13} className="text-[#C9A44A]" />
                  <span>074549 86610</span>
                </a>
                <a
                  href="mailto:contact@bljewels.com"
                  className="flex items-center gap-2 text-stone-800 hover:text-[#930303] font-medium transition-colors"
                >
                  <Mail size={13} className="text-[#C9A44A]" />
                  <span>contact@bljewels.com</span>
                </a>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 text-xs text-[#930303] hover:text-[#7A0303] font-bold pt-1"
              >
                <span>Visit Showroom in Agra</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </aside>

          {/* Main Article Document Reader */}
          <main className="bg-white rounded-3xl border border-[#E9DED2] p-6 sm:p-10 lg:p-12 shadow-sm min-w-0 order-1 lg:order-2">
            {loading ? (
              <div className="space-y-6 animate-pulse py-8">
                <div className="h-6 bg-stone-200 rounded w-1/3" />
                <div className="space-y-3">
                  <div className="h-4 bg-stone-100 rounded w-full" />
                  <div className="h-4 bg-stone-100 rounded w-5/6" />
                  <div className="h-4 bg-stone-100 rounded w-4/6" />
                </div>
                <div className="h-6 bg-stone-200 rounded w-1/4 mt-8" />
                <div className="space-y-3">
                  <div className="h-4 bg-stone-100 rounded w-full" />
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16 space-y-4">
                <ShieldCheck size={40} className="mx-auto text-stone-300" />
                <h2 className="text-xl font-bold font-display text-stone-800">Document Unavailable</h2>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">{error}</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#930303] text-white text-xs font-semibold rounded-xl"
                >
                  Return to Storefront
                </Link>
              </div>
            ) : (
              <article className="prose-bl max-w-none text-stone-800 space-y-6">
                {/* BIS Hallmarking Trust Seal */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/70 flex items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/bis-bureau-of-indian-standards.png"
                      alt="BIS Bureau of Indian Standards"
                      className="w-10 h-10 object-contain shrink-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        100% Certified 22K (916) BIS Hallmarked Assurance
                      </p>
                      <p className="text-[11px] text-stone-600">
                        Official Government Hallmarking &amp; Income Tax Compliance
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-white px-2.5 py-1 rounded-full border border-stone-200 font-semibold text-stone-700 hidden sm:inline-block">
                    Verified
                  </span>
                </div>

                {/* Render HTML content safely */}
                <div
                  className="legal-content-body space-y-6 text-sm sm:text-base leading-relaxed text-stone-700 font-body"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />

                {/* Document Footer Verification */}
                <div className="mt-12 pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
                  <p>
                    Published by <strong>B.L. Jewels Atelier Pvt. Ltd.</strong> &bull; Registered in Agra, Uttar Pradesh
                  </p>
                  <p className="font-mono text-[11px]">
                    Document Slug: <code>{page.slug}</code>
                  </p>
                </div>
              </article>
            )}
          </main>

        </div>
      </section>
    </div>
  );
};

export default LegalPage;

