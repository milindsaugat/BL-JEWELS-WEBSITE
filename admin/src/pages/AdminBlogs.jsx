import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Globe,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Sparkles,
  UploadCloud,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Star,
  Save,
  Clock,
  Tag,
} from 'lucide-react';
import { blogService, settingService, uploadService } from '../services/api';
import { RichTextEditor } from '../components/RichTextEditor';
import { toast } from 'sonner';

const CATEGORIES = [
  'Bridal Heritage',
  'Gold Care & Purity',
  'Styling & Care',
  'Festive Trends',
  'Diamond 4Cs',
  'BL Jewels Journal',
];

const SEO_PAGES = [
  { key: 'home', label: 'Homepage', path: '/' },
  { key: 'collections', label: 'Collections', path: '/collections' },
  { key: 'blog', label: 'The Royal Journal (Blog)', path: '/blog' },
  { key: 'liveRate', label: 'Live Gold & Silver Rates', path: '/live-rate' },
  { key: 'about', label: 'Our Heritage (About Us)', path: '/about' },
  { key: 'contact', label: 'Contact & Showroom', path: '/contact' },
];

const slugify = (text = '') =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const SerpPreview = ({ title, description, path = '/' }) => (
  <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-1 shadow-2xs">
    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
      Google Search Result Preview
    </p>
    <p className="text-[11px] text-emerald-700 truncate font-mono">
      https://bljewels.com{path.startsWith('/') ? path : `/${path}`}
    </p>
    <p className="text-base font-semibold text-[#1a0dab] leading-snug line-clamp-1">
      {title || 'BL Jewels | Purity with Auspiciousness — 22K BIS 916 Fine Jewellery'}
    </p>
    <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
      {description ||
        'Discover certified 22K (916) BIS Hallmarked gold jewellery, uncut Polki Jadau, GIA solitaires, and royal bridal sets at BL Jewels.'}
    </p>
  </div>
);

const CharMeter = ({ len, max }) => {
  const over = len > max;
  return (
    <span className={`text-[10px] font-mono font-bold ${over ? 'text-rose-600' : len > 0 ? 'text-emerald-700' : 'text-stone-400'}`}>
      {len} / {max} chars
    </span>
  );
};

export const AdminBlogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mainTab = searchParams.get('tab') === 'seo' ? 'seo' : 'blogs';
  const setMainTab = (tab) =>
    setSearchParams(tab === 'seo' ? { tab: 'seo' } : {}, { replace: true });

  // ── BLOG STATE ──
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState('content'); // 'content' | 'seo'
  const [editingBlog, setEditingBlog] = useState(null);
  const [savingBlog, setSavingBlog] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '<p></p>',
    coverImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1400&q=80',
    category: 'Bridal Heritage',
    authorName: 'BL Jewels Editorial Atelier',
    authorRole: 'Master Gemologists & Heritage Curators',
    tagsInput: 'Bridal Jewellery, BIS 916, Gold Guide',
    isFeatured: false,
    isPublished: true,
    metaTitle: '',
    metaDescription: '',
    metaKeywordsInput: '',
    ogImage: '',
    canonicalUrl: '',
  });

  // ── WEBSITE SEO MANAGER STATE ──
  const [seoState, setSeoState] = useState({
    defaultMetaTitle: '',
    defaultMetaDescription: '',
    defaultMetaKeywordsInput: '',
    ogImage: '',
    pages: {},
  });
  const [activeSeoPage, setActiveSeoPage] = useState('home');
  const [loadingSeo, setLoadingSeo] = useState(true);
  const [savingSeo, setSavingSeo] = useState(false);

  const storefrontUrl = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173';

  const fetchBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const res = await blogService.getAllBlogs();
      setBlogs(res.blogs || []);
    } catch (err) {
      toast.error('Failed to load blog posts: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingBlogs(false);
    }
  };

  const fetchSeoSettings = async () => {
    setLoadingSeo(true);
    try {
      const res = await settingService.getSettings();
      const seo = res?.settings?.seo || {};
      const pagesObj = {};
      for (const p of SEO_PAGES) {
        const pg = seo.pages?.[p.key] || {};
        pagesObj[p.key] = {
          metaTitle: pg.metaTitle || '',
          metaDescription: pg.metaDescription || '',
          metaKeywordsInput: Array.isArray(pg.metaKeywords) ? pg.metaKeywords.join(', ') : '',
        };
      }
      setSeoState({
        defaultMetaTitle: seo.defaultMetaTitle || '',
        defaultMetaDescription: seo.defaultMetaDescription || '',
        defaultMetaKeywordsInput: Array.isArray(seo.defaultMetaKeywords) ? seo.defaultMetaKeywords.join(', ') : '',
        ogImage: seo.ogImage || '',
        pages: pagesObj,
      });
    } catch (err) {
      toast.error('Failed to load SEO settings');
    } finally {
      setLoadingSeo(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchSeoSettings();
  }, []);

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const filteredBlogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      if (
        q &&
        !b.title.toLowerCase().includes(q) &&
        !(b.excerpt || '').toLowerCase().includes(q) &&
        !(b.seo?.metaKeywords || []).some((k) => k.toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [blogs, search, categoryFilter]);

  const totalViews = useMemo(() => blogs.reduce((sum, b) => sum + (b.views || 0), 0), [blogs]);

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setModalTab('content');
    setBlogForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '<p></p>',
      coverImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1400&q=80',
      category: 'Bridal Heritage',
      authorName: 'BL Jewels Editorial Atelier',
      authorRole: 'Master Gemologists & Heritage Curators',
      tagsInput: 'Bridal Heritage, BIS 916 Gold',
      isFeatured: false,
      isPublished: true,
      metaTitle: '',
      metaDescription: '',
      metaKeywordsInput: '',
      ogImage: '',
      canonicalUrl: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBlog(b);
    setModalTab('content');
    setBlogForm({
      title: b.title || '',
      slug: b.slug || '',
      excerpt: b.excerpt || '',
      content: b.content || '<p></p>',
      coverImage: b.coverImage || '',
      category: b.category || 'Bridal Heritage',
      authorName: b.authorName || 'BL Jewels Editorial Atelier',
      authorRole: b.authorRole || 'Master Gemologists & Heritage Curators',
      tagsInput: Array.isArray(b.tags) ? b.tags.join(', ') : '',
      isFeatured: Boolean(b.isFeatured),
      isPublished: b.isPublished !== false,
      metaTitle: b.seo?.metaTitle || '',
      metaDescription: b.seo?.metaDescription || '',
      metaKeywordsInput: Array.isArray(b.seo?.metaKeywords) ? b.seo.metaKeywords.join(', ') : '',
      ogImage: b.seo?.ogImage || '',
      canonicalUrl: b.seo?.canonicalUrl || '',
    });
    setShowModal(true);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await uploadService.uploadImage(file, 'bl-jewels/blogs');
      if (res.success && res.url) {
        setBlogForm((prev) => ({ ...prev, coverImage: res.url }));
        toast.success('Cover image uploaded!');
      } else {
        toast.error(res.message || 'Upload failed');
      }
    } catch (err) {
      toast.error('Upload failed: ' + (err.message || 'Error'));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title.trim()) {
      toast.error('Please enter an article title.');
      return;
    }

    setSavingBlog(true);
    try {
      const finalSlug = slugify(blogForm.slug || blogForm.title);
      const payload = {
        title: blogForm.title.trim(),
        slug: finalSlug,
        excerpt: blogForm.excerpt.trim(),
        content: blogForm.content,
        coverImage: blogForm.coverImage.trim(),
        category: blogForm.category,
        authorName: blogForm.authorName.trim(),
        authorRole: blogForm.authorRole.trim(),
        tags: blogForm.tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        isFeatured: Boolean(blogForm.isFeatured),
        isPublished: Boolean(blogForm.isPublished),
        seo: {
          metaTitle: (blogForm.metaTitle || blogForm.title).trim(),
          metaDescription: (blogForm.metaDescription || blogForm.excerpt).trim(),
          metaKeywords: blogForm.metaKeywordsInput
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          ogImage: (blogForm.ogImage || blogForm.coverImage).trim(),
          canonicalUrl: (blogForm.canonicalUrl || `/blog/${finalSlug}`).trim(),
        },
      };

      if (editingBlog) {
        await blogService.updateBlog(editingBlog._id, payload);
        toast.success(`Article "${payload.title}" updated!`);
      } else {
        await blogService.createBlog(payload);
        toast.success(`Article "${payload.title}" published!`);
      }
      setShowModal(false);
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to save article: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingBlog(false);
    }
  };

  const handleTogglePublish = async (b) => {
    const next = !b.isPublished;
    setBlogs((prev) => prev.map((item) => (item._id === b._id ? { ...item, isPublished: next } : item)));
    try {
      await blogService.updateBlog(b._id, { isPublished: next });
      toast.success(`"${b.title}" is now ${next ? 'Published Live' : 'Saved as Draft'}`);
      fetchBlogs();
    } catch {
      toast.error('Failed to update status');
      fetchBlogs();
    }
  };

  const handleToggleFeatured = async (b) => {
    const next = !b.isFeatured;
    setBlogs((prev) => prev.map((item) => (item._id === b._id ? { ...item, isFeatured: next } : item)));
    try {
      await blogService.updateBlog(b._id, { isFeatured: next });
      toast.success(next ? 'Marked as Featured Journal Story' : 'Removed from Featured');
      fetchBlogs();
    } catch {
      toast.error('Failed to update featured flag');
      fetchBlogs();
    }
  };

  const handleDeleteBlog = async (b) => {
    if (!window.confirm(`Delete blog article "${b.title}"?`)) return;
    try {
      await blogService.deleteBlog(b._id);
      toast.success('Article deleted.');
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveSeoSettings = async (e) => {
    e.preventDefault();
    setSavingSeo(true);
    try {
      const formattedPages = {};
      for (const p of SEO_PAGES) {
        const cur = seoState.pages[p.key] || {};
        formattedPages[p.key] = {
          metaTitle: (cur.metaTitle || '').trim(),
          metaDescription: (cur.metaDescription || '').trim(),
          metaKeywords: (cur.metaKeywordsInput || '')
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        };
      }

      await settingService.updateSettings({
        seo: {
          defaultMetaTitle: seoState.defaultMetaTitle.trim(),
          defaultMetaDescription: seoState.defaultMetaDescription.trim(),
          defaultMetaKeywords: seoState.defaultMetaKeywordsInput
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          ogImage: seoState.ogImage.trim(),
          pages: formattedPages,
        },
      });
      toast.success('Website SEO meta tags saved & live!');
      fetchSeoSettings();
    } catch (err) {
      toast.error('Failed to save SEO settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingSeo(false);
    }
  };

  const currentSeoPageMeta = SEO_PAGES.find((p) => p.key === activeSeoPage) || SEO_PAGES[0];
  const currentSeoFields = seoState.pages[activeSeoPage] || {
    metaTitle: '',
    metaDescription: '',
    metaKeywordsInput: '',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#930303]/10 text-[#930303] text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editorial & Search Engine Suite</span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
            Blog Journal & SEO Manager
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Publish rich WYSIWYG editorial articles and control per-post &amp; sitewide meta titles, descriptions, and keywords.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <a
            href={`${storefrontUrl}/blog`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 bg-white border border-stone-200 hover:border-[#C9A44A] text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#930303]" />
            <span>View Blog</span>
          </a>

          {mainTab === 'blogs' && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-bold shadow-md shadow-[#930303]/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Write New Article</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 flex-wrap">
        <button
          type="button"
          onClick={() => setMainTab('blogs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            mainTab === 'blogs'
              ? 'bg-[#930303] text-white shadow-md shadow-[#930303]/20'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Editorial Blog Posts ({blogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('seo')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            mainTab === 'seo'
              ? 'bg-[#930303] text-white shadow-md shadow-[#930303]/20'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          <Globe className="w-4 h-4 text-amber-400" />
          <span>Website SEO Manager (Meta &amp; Keywords)</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: EDITORIAL BLOG POSTS
      ───────────────────────────────────────────────────────────── */}
      {mainTab === 'blogs' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-gradient-to-br from-[#FFF8EE] to-[#FFF1DE] border border-amber-300 rounded-xl p-4 shadow-xs">
              <p className="text-xs text-stone-600 font-medium">Total Articles</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{blogs.length}</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
              <p className="text-xs text-stone-500 font-medium">Published Live</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {blogs.filter((b) => b.isPublished !== false).length}
              </p>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
              <p className="text-xs text-stone-500 font-medium">Featured Spotlight</p>
              <p className="text-2xl font-bold text-[#930303] mt-1">
                {blogs.filter((b) => b.isFeatured).length}
              </p>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
              <p className="text-xs text-stone-500 font-medium">Total Article Reads</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{totalViews.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Search & Category Toolbar */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles or SEO keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
              {['all', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    categoryFilter === cat
                      ? 'bg-[#930303] text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Cards Grid */}
          {loadingBlogs ? (
            <div className="p-12 text-center text-stone-500 text-sm bg-white rounded-2xl border border-stone-200">
              Loading journal articles...
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="p-12 text-center text-stone-500 text-sm bg-white rounded-2xl border border-stone-200 space-y-2">
              <FileText className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-semibold text-stone-700">No blog posts found</p>
              <p className="text-xs text-stone-400">Click "Write New Article" to compose a story with SEO metadata.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredBlogs.map((blog) => {
                const hasSeo = Boolean(
                  blog.seo?.metaTitle && blog.seo?.metaDescription && blog.seo?.metaKeywords?.length
                );

                return (
                  <div
                    key={blog._id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 transition-all ${
                      blog.isPublished !== false
                        ? 'border-[#C9A44A]/60 hover:border-[#C9A44A]'
                        : 'border-stone-200 opacity-80'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="w-28 h-24 rounded-xl overflow-hidden bg-stone-900 border border-[#C9A44A]/30 shrink-0">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#930303] bg-[#930303]/10 px-2 py-0.5 rounded-full">
                            {blog.category}
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(blog)}
                              className={`p-1 rounded-lg border cursor-pointer transition-colors ${
                                blog.isFeatured
                                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                                  : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-amber-600'
                              }`}
                              title={blog.isFeatured ? 'Featured article' : 'Mark as featured'}
                            >
                              <Star className={`w-3.5 h-3.5 ${blog.isFeatured ? 'fill-amber-500' : ''}`} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTogglePublish(blog)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer border ${
                                blog.isPublished !== false
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-stone-200 text-stone-600 border-stone-300'
                              }`}
                            >
                              {blog.isPublished !== false ? 'Published' : 'Draft'}
                            </button>
                          </div>
                        </div>

                        <h3 className="font-heading text-base font-bold text-stone-900 line-clamp-1 mt-1">
                          {blog.title}
                        </h3>

                        <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                          {blog.excerpt || 'No excerpt written yet.'}
                        </p>
                      </div>
                    </div>

                    {/* SEO Meta Summary Strip */}
                    <div className="bg-[#FAF7F2] rounded-xl border border-stone-200 p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-stone-500 truncate">
                          /blog/{blog.slug}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                            hasSeo
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {hasSeo ? 'SEO Complete' : 'Needs SEO Meta'}
                        </span>
                      </div>

                      {blog.seo?.metaKeywords?.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {blog.seo.metaKeywords.slice(0, 4).map((kw) => (
                            <span
                              key={kw}
                              className="px-2 py-0.5 rounded bg-white border border-stone-200 text-[10px] text-stone-700 font-medium"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <div className="flex items-center gap-3 text-[11px] text-stone-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#C9A44A]" />
                          {blog.readTimeMinutes || 3} min read
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-stone-400" />
                          {blog.views || 0} reads
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <a
                          href={`${storefrontUrl}/blog/${blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-stone-400 hover:text-[#930303] hover:bg-red-50 rounded-lg transition-colors"
                          title="Open article on website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(blog)}
                          className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Article & SEO"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlog(blog)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: WEBSITE SEO MANAGER (Global & Page Meta)
      ───────────────────────────────────────────────────────────── */}
      {mainTab === 'seo' && (
        <form onSubmit={handleSaveSeoSettings} className="space-y-6">
          {loadingSeo ? (
            <div className="p-12 text-center text-stone-500 text-sm bg-white rounded-2xl border border-stone-200">
              Loading website SEO settings...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar: Page Selector + Global Fallback */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2 pb-1">
                    Select Storefront Page
                  </p>
                  {SEO_PAGES.map((pg) => (
                    <button
                      key={pg.key}
                      type="button"
                      onClick={() => setActiveSeoPage(pg.key)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        activeSeoPage === pg.key
                          ? 'bg-[#930303] text-white shadow-sm'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span>{pg.label}</span>
                      <span
                        className={`font-mono text-[10px] ${
                          activeSeoPage === pg.key ? 'text-amber-200' : 'text-stone-400'
                        }`}
                      >
                        {pg.path}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Global Fallback SEO */}
                <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 text-xs shadow-xs">
                  <p className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#C9A44A]" />
                    <span>Global Fallback Meta</span>
                  </p>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-semibold text-stone-600">Default Title</label>
                      <CharMeter len={seoState.defaultMetaTitle.length} max={60} />
                    </div>
                    <input
                      type="text"
                      value={seoState.defaultMetaTitle}
                      onChange={(e) => setSeoState({ ...seoState, defaultMetaTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-semibold text-stone-600">Default Description</label>
                      <CharMeter len={seoState.defaultMetaDescription.length} max={160} />
                    </div>
                    <textarea
                      rows={2}
                      value={seoState.defaultMetaDescription}
                      onChange={(e) => setSeoState({ ...seoState, defaultMetaDescription: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Default Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={seoState.defaultMetaKeywordsInput}
                      onChange={(e) =>
                        setSeoState({ ...seoState, defaultMetaKeywordsInput: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Default Social OG Image URL</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        value={seoState.ogImage}
                        onChange={(e) => setSeoState({ ...seoState, ogImage: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                      />
                      {seoState.ogImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setSeoState({ ...seoState, ogImage: '' });
                            toast.success('Default OG image cleared');
                          }}
                          className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0 border border-rose-200"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>
                    {seoState.ogImage && (
                      <div className="relative w-36 h-20 rounded-lg overflow-hidden border border-stone-200 mt-1.5">
                        <img src={seoState.ogImage} alt="Global OG Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Editor: Selected Page SEO + Live SERP Preview */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#930303]">
                      Page Meta Configuration
                    </span>
                    <h2 className="font-heading text-lg font-bold text-stone-900">
                      {currentSeoPageMeta.label}{' '}
                      <span className="text-xs font-mono text-stone-400 font-normal">
                        ({currentSeoPageMeta.path})
                      </span>
                    </h2>
                  </div>

                  <button
                    type="submit"
                    disabled={savingSeo}
                    className="px-5 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-bold shadow-md shadow-[#930303]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingSeo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save All SEO Settings</span>
                  </button>
                </div>

                {/* Live SERP Preview */}
                <SerpPreview
                  title={currentSeoFields.metaTitle || seoState.defaultMetaTitle}
                  description={currentSeoFields.metaDescription || seoState.defaultMetaDescription}
                  path={currentSeoPageMeta.path}
                />

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-stone-700">Meta Title *</label>
                      <CharMeter len={currentSeoFields.metaTitle.length} max={60} />
                    </div>
                    <input
                      type="text"
                      placeholder="Recommended: 50–60 characters"
                      value={currentSeoFields.metaTitle}
                      onChange={(e) =>
                        setSeoState((prev) => ({
                          ...prev,
                          pages: {
                            ...prev.pages,
                            [activeSeoPage]: { ...currentSeoFields, metaTitle: e.target.value },
                          },
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-[#930303]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-stone-700">Meta Description *</label>
                      <CharMeter len={currentSeoFields.metaDescription.length} max={160} />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Recommended: 120–160 characters summarizing purity, BIS 916 hallmark & collections"
                      value={currentSeoFields.metaDescription}
                      onChange={(e) =>
                        setSeoState((prev) => ({
                          ...prev,
                          pages: {
                            ...prev.pages,
                            [activeSeoPage]: { ...currentSeoFields, metaDescription: e.target.value },
                          },
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 leading-relaxed focus:outline-none focus:border-[#930303]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Meta Keywords <span className="text-stone-400 font-normal">(Comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BL Jewels, 22K Gold Jewellery, BIS 916 Hallmark, Bridal Polki"
                      value={currentSeoFields.metaKeywordsInput}
                      onChange={(e) =>
                        setSeoState((prev) => ({
                          ...prev,
                          pages: {
                            ...prev.pages,
                            [activeSeoPage]: { ...currentSeoFields, metaKeywordsInput: e.target.value },
                          },
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                    />

                    {currentSeoFields.metaKeywordsInput && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {currentSeoFields.metaKeywordsInput
                          .split(',')
                          .map((k) => k.trim())
                          .filter(Boolean)
                          .map((kw, i) => (
                            <span
                              key={`${kw}-${i}`}
                              className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#C9A44A]/40 text-[11px] font-medium text-[#8B1A1A] inline-flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5 text-[#C9A44A]" />
                              {kw}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          BLOG + SEO MODAL via createPortal
      ───────────────────────────────────────────────────────────── */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-6 space-y-4 shadow-2xl border border-stone-200 my-auto max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-accent uppercase tracking-widest text-[#930303] font-bold block">
                  BL Jewels • Editorial &amp; SEO Studio
                </span>
                <h3 className="font-heading text-lg font-bold text-stone-900 mt-0.5">
                  {editingBlog ? `Edit Article: ${editingBlog.title}` : 'Write New Editorial Article'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
              <button
                type="button"
                onClick={() => setModalTab('content')}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  modalTab === 'content'
                    ? 'bg-[#930303] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                1. Article &amp; WYSIWYG Editor
              </button>
              <button
                type="button"
                onClick={() => setModalTab('seo')}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  modalTab === 'seo'
                    ? 'bg-[#930303] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>2. SEO Meta Title, Description &amp; Keywords</span>
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4 text-xs font-body">
              {modalTab === 'content' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Article Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. The Bride's Guide to BIS 916 Polki"
                        value={blogForm.title}
                        onChange={(e) => {
                          const nextTitle = e.target.value;
                          setBlogForm((prev) => ({
                            ...prev,
                            title: nextTitle,
                            slug: editingBlog ? prev.slug : slugify(nextTitle),
                          }));
                        }}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-[#930303]"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">URL Slug *</label>
                      <input
                        type="text"
                        required
                        placeholder="brides-guide-bis-916-polki"
                        value={blogForm.slug}
                        onChange={(e) => setBlogForm({ ...blogForm, slug: slugify(e.target.value) })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 font-mono focus:outline-none focus:border-[#930303]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Category</label>
                      <select
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Author Name</label>
                      <input
                        type="text"
                        value={blogForm.authorName}
                        onChange={(e) => setBlogForm({ ...blogForm, authorName: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Author Role</label>
                      <input
                        type="text"
                        value={blogForm.authorRole}
                        onChange={(e) => setBlogForm({ ...blogForm, authorRole: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Editorial Excerpt (Summary)</label>
                    <textarea
                      rows={2}
                      placeholder="Short magazine summary shown on the blog listing card..."
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                    />
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-1.5">
                    <label className="block text-stone-700 font-semibold">Cover Artwork Image</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={blogForm.coverImage}
                        onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })}
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 text-xs focus:outline-none focus:border-[#930303]"
                      />
                      <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 border border-stone-300">
                        {uploadingCover ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#930303]" />
                        ) : (
                          <UploadCloud className="w-4 h-4" />
                        )}
                        <span>Upload</span>
                        <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                      </label>
                      {blogForm.coverImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setBlogForm({ ...blogForm, coverImage: '' });
                            toast.success('Cover image removed');
                          }}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 border border-rose-200 transition-colors"
                          title="Remove cover artwork"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    {blogForm.coverImage && (
                      <div className="w-full h-28 rounded-xl overflow-hidden border border-stone-200 mt-1">
                        <img src={blogForm.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* WYSIWYG Rich Text Editor */}
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1.5">
                      Article Body (WYSIWYG Rich Text Editor) *
                    </label>
                    <RichTextEditor
                      value={blogForm.content}
                      onChange={(html) => setBlogForm((prev) => ({ ...prev, content: html }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Article Tags <span className="text-stone-400 font-normal">(Comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        value={blogForm.tagsInput}
                        onChange={(e) => setBlogForm({ ...blogForm, tagsInput: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800"
                      />
                    </div>

                    <div
                      onClick={() => setBlogForm((p) => ({ ...p, isFeatured: !p.isFeatured }))}
                      className={`p-2.5 rounded-xl border cursor-pointer select-none flex items-center justify-between ${
                        blogForm.isFeatured ? 'bg-amber-50 border-amber-400' : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <span className="font-bold text-stone-800">Featured Story</span>
                      <span className="text-[11px] font-bold">{blogForm.isFeatured ? '★ Yes' : 'No'}</span>
                    </div>

                    <div
                      onClick={() => setBlogForm((p) => ({ ...p, isPublished: !p.isPublished }))}
                      className={`p-2.5 rounded-xl border cursor-pointer select-none flex items-center justify-between ${
                        blogForm.isPublished ? 'bg-emerald-50 border-emerald-400' : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <span className="font-bold text-stone-800">Publish Status</span>
                      <span className="text-[11px] font-bold">
                        {blogForm.isPublished ? '✓ Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {modalTab === 'seo' && (
                <div className="space-y-4">
                  <SerpPreview
                    title={blogForm.metaTitle || blogForm.title}
                    description={blogForm.metaDescription || blogForm.excerpt}
                    path={`/blog/${blogForm.slug || slugify(blogForm.title) || 'article-slug'}`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-stone-700">SEO Meta Title</label>
                      <CharMeter len={(blogForm.metaTitle || blogForm.title).length} max={60} />
                    </div>
                    <input
                      type="text"
                      placeholder="Defaults to article title if left blank (50–60 chars ideal)"
                      value={blogForm.metaTitle}
                      onChange={(e) => setBlogForm({ ...blogForm, metaTitle: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-[#930303]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-stone-700">SEO Meta Description</label>
                      <CharMeter len={(blogForm.metaDescription || blogForm.excerpt).length} max={160} />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Defaults to excerpt if left blank (120–160 chars ideal)"
                      value={blogForm.metaDescription}
                      onChange={(e) => setBlogForm({ ...blogForm, metaDescription: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      SEO Meta Keywords <span className="text-stone-400 font-normal">(Comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BIS 916 Hallmark, 22K Bridal Polki, Gold Purity Guide"
                      value={blogForm.metaKeywordsInput}
                      onChange={(e) => setBlogForm({ ...blogForm, metaKeywordsInput: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-[#930303]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        OG Social Image URL <span className="text-stone-400 font-normal">(Optional)</span>
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="url"
                          placeholder="Defaults to cover image"
                          value={blogForm.ogImage}
                          onChange={(e) => setBlogForm({ ...blogForm, ogImage: e.target.value })}
                          className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 text-xs"
                        />
                        {blogForm.ogImage && (
                          <button
                            type="button"
                            onClick={() => setBlogForm({ ...blogForm, ogImage: '' })}
                            className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0 border border-rose-200"
                            title="Remove OG Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Clear</span>
                          </button>
                        )}
                      </div>
                      {blogForm.ogImage && (
                        <div className="relative w-36 h-20 rounded-lg overflow-hidden border border-stone-200 mt-1.5">
                          <img src={blogForm.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Canonical URL <span className="text-stone-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder={`/blog/${blogForm.slug || 'article-slug'}`}
                        value={blogForm.canonicalUrl}
                        onChange={(e) => setBlogForm({ ...blogForm, canonicalUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Submit */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBlog}
                  className="px-5 py-2 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl font-bold shadow-md shadow-[#930303]/25 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {savingBlog ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingBlog ? 'Update Article & SEO' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminBlogs;

