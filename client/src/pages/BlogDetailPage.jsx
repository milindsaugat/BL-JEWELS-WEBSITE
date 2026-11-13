import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { blogService } from '../services/api';
import { SeoHead } from '../components/common/SeoHead';
import { processEditorialHtml } from '../utils/editorialHtml';
import { ArticleHeader } from '../components/blog/ArticleHeader';
import { ArticleHero } from '../components/blog/ArticleHero';
import { ArticleContent } from '../components/blog/ArticleContent';
import { ArticleTableOfContents } from '../components/blog/ArticleTableOfContents';
import { ArticleTags } from '../components/blog/ArticleTags';
import { ArticleCTA } from '../components/blog/ArticleCTA';
import { RelatedArticles } from '../components/blog/RelatedArticles';

export const BlogDetailPage = () => {
  const { slug } = useParams();
  const [result, setResult] = useState({ slug: null, blog: null, related: [], notFound: false });
  const [copiedLink, setCopiedLink] = useState(false);

  const loading = result.slug !== slug;
  const blog = loading ? null : result.blog;
  const related = loading ? [] : result.related;
  const notFound = loading ? false : result.notFound;

  useEffect(() => {
    let active = true;

    blogService
      .getBlogBySlug(slug)
      .then((res) => {
        if (!active) return;
        if (res?.blog) {
          setResult({ slug, blog: res.blog, related: res.related || [], notFound: false });
        } else {
          setResult({ slug, blog: null, related: [], notFound: true });
        }
      })
      .catch(() => {
        if (active) setResult({ slug, blog: null, related: [], notFound: true });
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const { sanitizedHtml, tocItems } = useMemo(
    () => processEditorialHtml(blog?.content || ''),
    [blog?.content]
  );

  const allKeywords = useMemo(
    () => Array.from(new Set([...(blog?.seo?.metaKeywords || []), ...(blog?.tags || [])])).filter(Boolean),
    [blog?.seo?.metaKeywords, blog?.tags]
  );

  const jsonLd = useMemo(() => {
    if (!blog) return null;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: blog.seo?.metaTitle || blog.title,
        description: blog.seo?.metaDescription || blog.excerpt,
        image: blog.seo?.ogImage || blog.coverImage,
        datePublished: blog.publishedAt || blog.createdAt,
        dateModified: blog.updatedAt || blog.publishedAt,
        author: {
          '@type': 'Person',
          name: blog.authorName || 'BL Jewels Editorial Atelier',
        },
        publisher: {
          '@type': 'Organization',
          name: 'BL Jewels',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'The Royal Journal', item: `${origin}/blog` },
          { '@type': 'ListItem', position: 3, name: blog.title, item: `${origin}/blog/${blog.slug}` },
        ],
      },
    ];
  }, [blog]);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleNativeOrCopyShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: blog?.title, text: blog?.excerpt, url });
        return;
      } catch {}
    }
    handleCopyLink();
  };

  if (loading) {
    return (
      <div className="bg-[#FFFCF8] min-h-screen py-14 px-5 sm:px-8">
        <div className="max-w-[1120px] mx-auto space-y-7">
          <div className="h-5 w-52 bg-[#F8F2EC] rounded animate-pulse" />
          <div className="h-14 w-3/4 bg-[#F8F2EC] rounded-xl animate-pulse" />
          <div className="aspect-[16/9] max-h-[540px] bg-[#F8F2EC] rounded-[16px] animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_275px] gap-12 pt-4">
            <div className="space-y-4">
              <div className="h-4 bg-[#F8F2EC] rounded animate-pulse" />
              <div className="h-4 w-11/12 bg-[#F8F2EC] rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-[#F8F2EC] rounded animate-pulse" />
            </div>
            <div className="hidden lg:block h-72 bg-[#F8F2EC] rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="bg-[#FFFCF8] min-h-[70vh] flex items-center justify-center px-5">
        <div className="bg-white rounded-[16px] border border-[#E9DED2] p-10 max-w-md w-full text-center space-y-4">
          <Sparkles className="w-9 h-9 text-[#D4AF66] mx-auto" aria-hidden="true" />
          <h1 className="font-display text-3xl font-medium text-[#940303]">Article Not Found</h1>
          <p className="text-[15px] text-[#756B65] leading-relaxed">
            This editorial story may have moved or been archived. Explore our Royal Journal for current stories.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#940303] hover:bg-[#700202] text-white text-[12px] font-accent font-semibold uppercase tracking-[0.14em] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Journal</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-[#FFFCF8] min-h-screen font-body text-[#292321] pb-16 sm:pb-20">
      <SeoHead
        title={blog.seo?.metaTitle || `${blog.title} | BL Jewels — The Royal Journal`}
        description={blog.seo?.metaDescription || blog.excerpt}
        keywords={allKeywords}
        ogImage={blog.seo?.ogImage || blog.coverImage}
        canonicalUrl={blog.seo?.canonicalUrl || `/blog/${blog.slug}`}
        type="article"
        jsonLd={jsonLd}
      />

      {/* SECTION A & B: Breadcrumb + Editorial Header + Metadata + Author */}
      <ArticleHeader
        blog={blog}
        onShare={handleNativeOrCopyShare}
        copiedLink={copiedLink}
      />

      {/* SECTION C: Featured Hero Image */}
      <ArticleHero src={blog.coverImage} alt={blog.title} />

      {/* SECTION D & E: Main Magazine Reading Layout (740px Article + 48px Gap + 280px Sticky Sidebar) */}
      <section className="max-w-[1120px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,740px)_280px] lg:justify-between gap-10 lg:gap-12 items-start">
          {/* Left Main Editorial Column (740px) */}
          <div className="min-w-0 w-full">
            {/* Mobile/Tablet Collapsible TOC */}
            <ArticleTableOfContents
              tocItems={tocItems}
              articleTitle={blog.title}
              onCopyLink={handleCopyLink}
              copiedLink={copiedLink}
              variant="mobile"
            />

            <ArticleContent sanitizedHtml={sanitizedHtml} />

            {/* SECTION E: Article Tags & Mobile Share */}
            <ArticleTags
              tags={allKeywords}
              articleTitle={blog.title}
              onCopyLink={handleCopyLink}
              copiedLink={copiedLink}
            />
          </div>

          {/* Right Sticky Editorial Sidebar (280px) */}
          <ArticleTableOfContents
            tocItems={tocItems}
            articleTitle={blog.title}
            onCopyLink={handleCopyLink}
            copiedLink={copiedLink}
            variant="desktop"
          />
        </div>
      </section>

      {/* SECTION F: Premium Jewellery CTA */}
      <ArticleCTA />

      {/* SECTION G: Related Articles */}
      <RelatedArticles articles={related} />
    </article>
  );
};

export default BlogDetailPage;
