import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { settingService } from '../../services/api';

const upsertMeta = (attr, key, content) => {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertCanonical = (href) => {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!href) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  const fullUrl = href.startsWith('http')
    ? href
    : `${window.location.origin}${href.startsWith('/') ? href : `/${href}`}`;
  el.setAttribute('href', fullUrl);
};

export const SeoHead = ({
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
  type = 'website',
  jsonLd = null,
}) => {
  useEffect(() => {
    if (title) document.title = title;
    upsertMeta('name', 'description', description || '');

    const kwStr = Array.isArray(keywords) ? keywords.join(', ') : String(keywords || '');
    upsertMeta('name', 'keywords', kwStr);

    upsertMeta('property', 'og:title', title || '');
    upsertMeta('property', 'og:description', description || '');
    upsertMeta('property', 'og:type', type);
    if (ogImage) upsertMeta('property', 'og:image', ogImage);
    if (canonicalUrl) upsertCanonical(canonicalUrl);

    let ldScript = document.head.querySelector('script[data-bl-jsonld="true"]');
    if (jsonLd) {
      if (!ldScript) {
        ldScript = document.createElement('script');
        ldScript.type = 'application/ld+json';
        ldScript.setAttribute('data-bl-jsonld', 'true');
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(jsonLd);
    } else if (ldScript) {
      ldScript.remove();
    }
  }, [title, description, keywords, ogImage, canonicalUrl, type, jsonLd]);

  return null;
};

const resolvePageKey = (pathname) => {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/collections')) return 'collections';
  if (pathname === '/blog') return 'blog';
  if (pathname.startsWith('/live-rate')) return 'liveRate';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/contact')) return 'contact';
  return null;
};

export const GlobalSeoSync = () => {
  const { pathname } = useLocation();
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    let active = true;
    settingService
      .getSettings()
      .then((res) => {
        if (active && res?.settings?.seo) setSeo(res.settings.seo);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  // Article detail and product detail pages apply their own dedicated SeoHead
  const isDetailManaged = pathname.startsWith('/blog/') || pathname.startsWith('/products/');
  if (!seo || isDetailManaged) return null;

  const pageKey = resolvePageKey(pathname);
  const pageSeo = pageKey ? seo.pages?.[pageKey] : null;

  return (
    <SeoHead
      title={pageSeo?.metaTitle || seo.defaultMetaTitle}
      description={pageSeo?.metaDescription || seo.defaultMetaDescription}
      keywords={pageSeo?.metaKeywords?.length ? pageSeo.metaKeywords : seo.defaultMetaKeywords}
      ogImage={seo.ogImage}
      canonicalUrl={pathname}
    />
  );
};

export default SeoHead;

