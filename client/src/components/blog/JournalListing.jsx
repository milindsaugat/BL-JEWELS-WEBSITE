import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { JournalCard } from './JournalCard';

const DEFAULT_CATEGORIES = [
  'All',
  'Bridal Heritage',
  'Gold Care & Purity',
  'Styling & Care',
  'Festive Trends',
  'Diamond 4Cs',
  'BL Jewels Journal',
];

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const JournalListing = ({ blogs = [], loading = false }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const reduced = useReducedMotion();

  const categories = useMemo(() => {
    const present = Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)));
    const combined = [...DEFAULT_CATEGORIES];
    for (const c of present) {
      if (!combined.includes(c)) combined.push(c);
    }
    return combined;
  }, [blogs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      if (activeCategory !== 'All' && b.category !== activeCategory) return false;
      if (
        q &&
        !b.title.toLowerCase().includes(q) &&
        !(b.excerpt || '').toLowerCase().includes(q) &&
        !(b.tags || []).some((t) => t.toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [blogs, activeCategory, search]);

  const featuredBlog = useMemo(() => {
    if (activeCategory !== 'All' || search.trim()) return null;
    return filtered.find((b) => b.isFeatured) || filtered[0] || null;
  }, [filtered, activeCategory, search]);

  const gridBlogs = useMemo(() => {
    const list = featuredBlog ? filtered.filter((b) => b._id !== featuredBlog._id) : filtered;
    return list;
  }, [filtered, featuredBlog]);

  const visibleGridBlogs = gridBlogs.slice(0, visibleCount);
  const hasMore = gridBlogs.length > visibleCount;

  return (
    <div className="bg-[#FFFCF8] min-h-screen font-body text-[#292321]">
      {/* Masthead Hero */}
      <section className="bg-[#F8F2EC] border-b border-[#E9DED2] py-12 sm:py-16">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[1120px] mx-auto px-5 sm:px-8 text-center space-y-4"
        >
          <p className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white border border-[#E9DED2] text-[#940303] font-accent text-[11px] font-semibold uppercase tracking-[0.22em]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF66]" aria-hidden="true" />
            <span>BL Jewels — The Royal Journal</span>
          </p>

          <h1
            className="font-display font-medium text-[#292321] tracking-[-0.015em]"
            style={{ fontSize: 'clamp(32px, 4.4vw, 52px)', lineHeight: 1.12 }}
          >
            Heritage, Purity &amp; Royal Craft
          </h1>

          <p className="max-w-2xl mx-auto text-[16px] text-[#756B65] leading-[1.7]">
            Editorial stories from our gemologists and master karigars — exploring BIS 916 hallmarking, karat purity, and generational heirloom artistry.
          </p>

          {/* Search & Category Filter */}
          <div className="pt-4 space-y-4 max-w-4xl mx-auto">
            <div className="relative max-w-md mx-auto">
              <Search className="w-4 h-4 text-[#D4AF66] absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                aria-label="Search journal stories"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(6);
                }}
                placeholder="Search gold guides, bridal tips, Polki..."
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white border border-[#E9DED2] text-[14px] text-[#292321] placeholder-[#9D9088] focus:outline-none focus:border-[#940303]"
              />
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat);
                      setVisibleCount(6);
                    }}
                    className={`px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#940303] text-white'
                        : 'bg-white text-[#756B65] border border-[#E9DED2] hover:border-[#940303] hover:text-[#940303]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Main Listing */}
      <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-12 sm:py-14 space-y-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-[12px] bg-[#F8F2EC] animate-pulse border border-[#E9DED2]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[16px] border border-[#E9DED2] p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-[#D4AF66] mx-auto" aria-hidden="true" />
            <h2 className="font-display text-2xl font-medium text-[#940303]">No Journal Stories Found</h2>
            <p className="text-[14.5px] text-[#756B65]">Try clearing your search filter or selecting All categories.</p>
          </div>
        ) : (
          <>
            {/* Featured Editorial Spotlight */}
            {featuredBlog && (
              <Link
                to={`/blog/${featuredBlog.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-12 rounded-[16px] overflow-hidden bg-white border border-[#E9DED2] hover:border-[#D4AF66] transition-all duration-300 hover:shadow-[0_14px_36px_rgba(41,35,33,0.08)]"
              >
                <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto overflow-hidden bg-[#F8F2EC]">
                  <img
                    src={featuredBlog.coverImage}
                    alt={featuredBlog.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>

                <div className="lg:col-span-5 p-6 sm:p-9 flex flex-col justify-between bg-white space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full bg-[#F8F2EC] border border-[#E9DED2] font-accent text-[10px] font-semibold uppercase tracking-[0.2em] text-[#940303]">
                        Featured · {featuredBlog.category}
                      </span>
                    </div>

                    <h2 className="font-display text-[26px] sm:text-[32px] font-medium text-[#292321] group-hover:text-[#940303] transition-colors leading-[1.2]">
                      {featuredBlog.title}
                    </h2>

                    <p className="text-[15px] text-[#756B65] leading-[1.7] line-clamp-4">
                      {featuredBlog.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E9DED2] flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 text-[12px] text-[#756B65]">
                      {featuredBlog.publishedAt && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#D4AF66]" aria-hidden="true" />
                          <span>{formatDate(featuredBlog.publishedAt)}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF66]" aria-hidden="true" />
                        <span>{featuredBlog.readTimeMinutes || 4} min read</span>
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 font-accent text-[11px] font-semibold uppercase tracking-[0.16em] text-[#940303]">
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D4AF66] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Editorial Grid */}
            {visibleGridBlogs.length > 0 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleGridBlogs.map((blog) => (
                    <JournalCard key={blog._id || blog.slug} article={blog} />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((n) => n + 6)}
                      className="px-7 py-3 rounded-xl bg-white border border-[#E9DED2] hover:border-[#940303] text-[12px] font-accent font-semibold uppercase tracking-[0.16em] text-[#292321] hover:text-[#940303] cursor-pointer transition-colors"
                    >
                      Load More Stories
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JournalListing;

