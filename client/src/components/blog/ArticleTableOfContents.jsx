import React, { useEffect, useState } from 'react';
import { List, Mail, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';
import { ArticleShareButtons } from './ArticleShareButtons';

const ShareButtons = ({ title, onCopyLink, copiedLink }) => (
  <div className="space-y-3">
    <p className="font-accent text-[11.5px] uppercase tracking-[0.18em] font-semibold text-[#756B65]">
      Share Article
    </p>
    <ArticleShareButtons
      title={title}
      onCopyLink={onCopyLink}
      copiedLink={copiedLink}
      variant="sidebar"
    />
  </div>
);

const SidebarSubscribe = () => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus({ type: 'error', text: 'Enter a valid email.' });
      return;
    }
    setBusy(true);
    setStatus({ type: '', text: '' });
    try {
      const res = await api.post('/auth/subscribe', { email: trimmed, source: 'homepage' });
      setStatus({ type: 'success', text: res.data?.message || 'Subscribed to The Royal Journal.' });
      setEmail('');
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.message || 'Try again shortly.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-5 border-t border-[#E9DED2] space-y-2.5">
      <p className="font-accent text-[11.5px] uppercase tracking-[0.18em] font-semibold text-[#756B65]">
        The Royal Journal Dispatch
      </p>
      <p className="text-[12.5px] leading-relaxed text-[#756B65]">
        Receive heirloom guides and private previews directly in your inbox.
      </p>
      <form onSubmit={handleSubscribe} className="space-y-2" noValidate>
        <div className="relative">
          <Mail className="w-3.5 h-3.5 text-[#D4AF66] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="email"
            aria-label="Email for Royal Journal updates"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full pl-8 pr-3 py-2 text-[12.5px] bg-white border border-[#E9DED2] rounded-lg text-[#292321] placeholder-[#A49890] focus:outline-none focus:border-[#940303]"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 rounded-lg bg-[#940303] hover:bg-[#700202] text-white text-[12px] font-semibold cursor-pointer transition-colors disabled:opacity-55"
        >
          {busy ? 'Subscribing...' : 'Subscribe'}
        </button>
        {status.text && (
          <p
            role="status"
            className={`text-[11.5px] ${status.type === 'error' ? 'text-[#940303]' : 'text-emerald-700'}`}
          >
            {status.text}
          </p>
        )}
      </form>
    </div>
  );
};

export const ArticleTableOfContents = ({
  tocItems = [],
  articleTitle,
  onCopyLink,
  copiedLink,
  variant = 'desktop',
}) => {
  const [activeId, setActiveId] = useState('');
  const currentActiveId = tocItems.some((item) => item.id === activeId)
    ? activeId
    : tocItems[0]?.id || '';

  useEffect(() => {
    if (typeof window === 'undefined' || tocItems.length === 0) return;

    const elements = tocItems.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-150px 0px -60% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (variant === 'mobile') {
    if (tocItems.length === 0) return null;
    return (
      <details className="lg:hidden mb-8 rounded-xl border border-[#E9DED2] bg-[#F8F2EC] px-4 py-3.5 group">
        <summary className="list-none flex items-center justify-between cursor-pointer text-[12px] font-accent font-semibold uppercase tracking-[0.18em] text-[#292321]">
          <span className="inline-flex items-center gap-2">
            <List className="w-4 h-4 text-[#940303]" aria-hidden="true" />
            <span>In This Article ({tocItems.length})</span>
          </span>
          <ChevronDown className="w-4 h-4 text-[#756B65] transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <ul className="mt-3.5 pt-3.5 border-t border-[#E9DED2] space-y-2.5">
          {tocItems.map((item) => (
            <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
              <button
                type="button"
                onClick={() => scrollToHeading(item.id)}
                className={`text-left text-[14px] leading-snug cursor-pointer transition-colors ${
                  currentActiveId === item.id ? 'text-[#940303] font-semibold' : 'text-[#756B65] hover:text-[#940303]'
                }`}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </details>
    );
  }

  return (
    <aside
      aria-label="Article navigation and sharing tools"
      className="hidden lg:block w-[280px] shrink-0 lg:sticky lg:top-[150px] lg:self-start"
    >
      <div className="space-y-6 rounded-2xl bg-[#F8F2EC]/80 border border-[#E9DED2] p-6">
        {/* A. Table of Contents */}
        {tocItems.length > 0 && (
          <div className="space-y-3.5">
            <p className="font-accent text-[11.5px] uppercase tracking-[0.18em] font-semibold text-[#940303]">
              In This Article
            </p>
            <nav aria-label="Table of contents" className="relative border-l border-[#E9DED2] pl-3.5 space-y-3">
              {tocItems.map((item) => {
                const isActive = currentActiveId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToHeading(item.id)}
                    className={`relative block w-full text-left text-[13.5px] leading-[1.45] cursor-pointer transition-colors ${
                      item.level === 3 ? 'pl-3 text-[13px]' : ''
                    } ${
                      isActive ? 'text-[#940303] font-semibold' : 'text-[#756B65] hover:text-[#292321]'
                    }`}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute -left-[15px] top-0.5 bottom-0.5 w-[2px] rounded-full bg-[#940303]"
                      />
                    )}
                    <span>{item.text}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* B. Share Article */}
        <div className={tocItems.length > 0 ? 'pt-5 border-t border-[#E9DED2]' : ''}>
          <ShareButtons title={articleTitle} onCopyLink={onCopyLink} copiedLink={copiedLink} />
        </div>

        {/* C. Newsletter */}
        <SidebarSubscribe />
      </div>
    </aside>
  );
};

export default ArticleTableOfContents;

