import Blog from '../models/Blog.js';
import { getDbStatus } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';

const slugify = (text = '') =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `journal-${Date.now()}`;

const estimateReadTime = (html = '') => {
  const plain = String(html).replace(/<[^>]+>/g, ' ').trim();
  const words = plain ? plain.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
};

// Strip executable tags/attributes while keeping editorial rich-text markup intact
const sanitizeEditorialHtml = (html = '') =>
  String(html)
    .replace(/<\s*(script|iframe|object|embed|style|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|iframe|object|embed|style|link|meta)[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1=$2#$2');

const normalizeKeywords = (val) => {
  if (Array.isArray(val)) return val.map((k) => String(k).trim()).filter(Boolean);
  if (typeof val === 'string') return val.split(',').map((k) => k.trim()).filter(Boolean);
  return [];
};

export const DEFAULT_BLOGS = [
  {
    _id: 'blog_bis_916_bridal_guide',
    title: "The Bride's Guide to BIS 916 Hallmarked 22K Polki & Bridal Sets",
    slug: 'brides-guide-bis-916-hallmarked-22k-polki-bridal-sets',
    excerpt:
      'From decoding the six-digit HUID laser stamp to balancing uncut Polki chokers with temple-gold haarams — everything an Indian bride should inspect before choosing her wedding heirloom.',
    content: `<p>Every auspicious Indian wedding begins with gold that carries both emotional permanence and verifiable purity. Whether you are curating a timeless Zaveri Bazaar bridal trousseau or commissioning a bespoke Polki Jadau choker, understanding how hallmarking protects your investment makes every choice effortless.</p>
<h2>1. What the BIS 916 &amp; HUID Hallmark Guarantees</h2>
<p>Since mandatory hallmarking came into force across India, every authentic 22-karat creation bears three distinct laser-etched marks: the triangular <strong>BIS logo</strong>, the purity grade <strong>22K916</strong> (signifying 91.6% pure gold), and a unique <strong>6-character alphanumeric HUID code</strong>.</p>
<blockquote>"True royal jewellery is never measured by weight alone — it lives in the harmony of certified 916 purity, master karigar balance, and generational craftsmanship."</blockquote>
<h2>2. Layering Polki Chokers with Heritage Rani Haars</h2>
<ul>
<li><strong>Balance the neckline:</strong> Pair a bold, collar-hugging Kundan Polki choker with a graduated 22K gold Rani Haar so each motif breathes cleanly without overlapping.</li>
<li><strong>Inspect the Meenakari reverse:</strong> Authentic Jadau bridal sets feature hand-enamelled Meenakari artistry on the back so the piece rests softly against silk bridal attire.</li>
<li><strong>Insist on transparent net weight:</strong> At BL Jewels, every Polki and gemstone deduction is itemized separately from the pure gold weight on your invoice.</li>
</ul>
<h2>3. Locking Lifetime Value with Zero-Stress Buyback</h2>
<p>Before finalizing your bridal suite, verify the showroom's exchange and lifetime buyback policy. All BL Jewels 22K hallmarked creations include certified purity documentation and complimentary insured armored delivery across India.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1400&q=80',
    category: 'Bridal Heritage',
    authorName: 'Aarav Jhaveri',
    authorRole: 'Chief Gemologist, BL Jewels',
    readTimeMinutes: 4,
    tags: ['Bridal Jewellery', 'BIS 916 Hallmark', 'Polki Jadau', 'Wedding Trousseau'],
    isFeatured: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    views: 342,
    seo: {
      metaTitle: "Bride's Guide to BIS 916 22K Polki & Bridal Gold Sets | BL Jewels",
      metaDescription:
        'Learn how to verify HUID 916 hallmarking, check net gold weight on Polki Jadau sets, and style timeless Indian bridal jewellery with BL Jewels.',
      metaKeywords: ['BIS 916 Hallmark', 'HUID Gold Check', 'Bridal Polki Set', '22K Bridal Jewellery'],
      ogImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1400&q=80',
      canonicalUrl: '/blog/brides-guide-bis-916-hallmarked-22k-polki-bridal-sets',
    },
  },
  {
    _id: 'blog_gold_purity_24k_22k_18k',
    title: '24K vs 22K vs 18K Gold: Choosing the Right Karat for Every Occasion',
    slug: '24k-vs-22k-vs-18k-gold-purity-guide',
    excerpt:
      'Why 24K coins shine as pure bullion while 22K (916) and 18K (750) alloy strength powers diamond solitaires, daily bangles, and heirloom necklaces.',
    content: `<p>Shoppers often wonder why fine jewellery showcases 22K and 18K creations rather than 24K gold. Pure 24-karat gold (99.9% purity) is extraordinarily malleable — ideal for auspicious Laxmi coins and bullion bars, yet too soft to hold delicate prongs or daily-wear clasps securely.</p>
<h2>Comparing Purity Grades at a Glance</h2>
<ul>
<li><strong>24K (999 Fine Gold):</strong> 99.9% pure bullion reserved for coins, bars, and ceremonial blessings.</li>
<li><strong>22K (916 Hallmarked):</strong> 91.67% gold blended with trace silver and copper — the gold standard for Indian necklaces, mangalsutras, kadas, and bridal heirlooms.</li>
<li><strong>18K (750 Gold):</strong> 75% pure gold engineered for superior tensile grip around natural VVS-EF diamonds, emeralds, and intricate solitaire settings.</li>
</ul>
<h2>How Live Bullion Rates Affect Your Jewellery Price</h2>
<p>At BL Jewels, retail pricing transparently combines the live spot bullion rate multiplied by net gold weight, itemized karigar making charges, and standard 3% GST — never hidden markups.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=80',
    category: 'Gold Care & Purity',
    authorName: 'Meera Zaveri',
    authorRole: 'Bullion & Assay Specialist',
    readTimeMinutes: 3,
    tags: ['22K vs 18K Gold', 'Gold Purity', '916 Gold Rate', 'Buying Guide'],
    isFeatured: false,
    isPublished: true,
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    views: 218,
    seo: {
      metaTitle: '24K vs 22K vs 18K Gold Purity Explained | BL Jewels Journal',
      metaDescription:
        'Understand the difference between 24K, 22K 916, and 18K 750 gold for bridal sets, diamond rings, and bullion investment at BL Jewels.',
      metaKeywords: ['24K vs 22K Gold', '18K Gold Diamond', '916 Hallmark Meaning', 'Gold Karat Guide'],
      ogImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=80',
      canonicalUrl: '/blog/24k-vs-22k-vs-18k-gold-purity-guide',
    },
  },
  {
    _id: 'blog_care_jadau_diamond_heirlooms',
    title: 'How to Store & Care for Kundan, Polki & Diamond Heirlooms',
    slug: 'care-for-kundan-polki-diamond-heirlooms',
    excerpt:
      'Simple atelier-approved rituals to preserve antique gold lustre, keep moisture away from lac-set Polki foil, and clean diamond brilliance safely at home.',
    content: `<p>Fine jewellery rewards gentle mindfulness. Different craft traditions — from lac-filled Jadau Polki to crisp VVS diamond settings — respond differently to humidity, perfume, and storage fabrics.</p>
<h2>Essential Care Rituals from Our Master Karigars</h2>
<ol>
<li><strong>Wear last, remove first:</strong> Apply fragrances, hairspray, and lotions at least ten minutes before fastening pearl strings, Polki chokers, or gold chains.</li>
<li><strong>Never soak Kundan or Polki in water:</strong> Uncut Polki stones sit over silver foil (<em>kundan/daak</em>) that can tarnish if submerged. Wipe gently with dry muslin cotton.</li>
<li><strong>Separate velvet pouches:</strong> Diamonds can scratch 22K gold surfaces; always house each piece in an individual anti-tarnish satin or suede compartment.</li>
</ol>
<blockquote>"An annual ultrasonic check on diamond prongs keeps heirloom rings brilliant and stone-secure for decades."</blockquote>`,
    coverImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1400&q=80',
    category: 'Styling & Care',
    authorName: 'BL Jewels Atelier',
    authorRole: 'Karigar Preservation Desk',
    readTimeMinutes: 3,
    tags: ['Jewellery Care', 'Polki Maintenance', 'Diamond Cleaning', 'Heirlooms'],
    isFeatured: false,
    isPublished: true,
    publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    views: 164,
    seo: {
      metaTitle: 'How to Care for Polki, Kundan & Diamond Jewellery | BL Jewels',
      metaDescription:
        'Master karigar tips for cleaning diamond rings safely, protecting Polki Kundan foil from moisture, and storing 22K gold heirlooms.',
      metaKeywords: ['Polki Jewellery Care', 'Clean Gold Jewellery', 'Diamond Maintenance', 'Heirloom Storage'],
      ogImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1400&q=80',
      canonicalUrl: '/blog/care-for-kundan-polki-diamond-heirlooms',
    },
  },
];

const ensureMemoryBlogs = () => {
  if (!Array.isArray(memoryStore.blogs) || memoryStore.blogs.length === 0) {
    memoryStore.blogs = [...DEFAULT_BLOGS];
  }
  return memoryStore.blogs;
};

const ensureMongoSeed = async () => {
  try {
    if (getDbStatus()) {
      const count = await Blog.countDocuments();
      if (count === 0) {
        await Blog.insertMany(
          DEFAULT_BLOGS.map(({ _id, ...rest }) => rest)
        );
        console.log('✦ Seeded initial editorial blog posts into MongoDB Atlas');
      }
    }
  } catch (err) {
    console.warn('Blog seed note:', err.message);
  }
};

ensureMemoryBlogs();
ensureMongoSeed().catch(() => {});

/**
 * GET /api/v1/blogs
 * Public published articles (supports ?category=, ?search=, ?limit=)
 */
export const getPublishedBlogs = async (req, res) => {
  try {
    const category = String(req.query.category || '').trim();
    const search = String(req.query.search || '').trim().toLowerCase();
    const limit = Number(req.query.limit) || 50;

    let blogs = [];
    if (getDbStatus()) {
      await ensureMongoSeed();
      const query = { isPublished: true };
      if (category && category.toLowerCase() !== 'all') {
        query.category = category;
      }
      blogs = await Blog.find(query).sort({ isFeatured: -1, publishedAt: -1 }).limit(limit).lean();
    } else {
      blogs = ensureMemoryBlogs()
        .filter((b) => b.isPublished !== false && (!category || category.toLowerCase() === 'all' || b.category === category))
        .slice(0, limit);
    }

    if (search) {
      blogs = blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(search) ||
          (b.excerpt || '').toLowerCase().includes(search) ||
          (b.tags || []).some((t) => t.toLowerCase().includes(search))
      );
    }

    return res.json({ success: true, count: blogs.length, blogs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/blogs/all
 * Admin listing of all blog posts (published + drafts)
 */
export const getAllBlogs = async (req, res) => {
  try {
    if (getDbStatus()) {
      await ensureMongoSeed();
      const blogs = await Blog.find().sort({ createdAt: -1 }).lean();
      return res.json({ success: true, count: blogs.length, blogs });
    }
    const blogs = ensureMemoryBlogs();
    return res.json({ success: true, count: blogs.length, blogs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/blogs/:slug
 * Public blog detail + related articles
 */
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (getDbStatus()) {
      const blog = await Blog.findOneAndUpdate(
        { slug: slug.toLowerCase(), isPublished: true },
        { $inc: { views: 1 } },
        { new: true }
      ).lean();

      if (!blog) {
        return res.status(404).json({ success: false, message: 'Journal article not found.' });
      }

      const related = await Blog.find({
        _id: { $ne: blog._id },
        isPublished: true,
      })
        .sort({ isFeatured: -1, publishedAt: -1 })
        .limit(3)
        .lean();

      return res.json({ success: true, blog, related });
    }

    const list = ensureMemoryBlogs();
    const blog = list.find((b) => b.slug === slug.toLowerCase() && b.isPublished !== false);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Journal article not found.' });
    }
    blog.views = (blog.views || 0) + 1;
    const related = list.filter((b) => b._id !== blog._id && b.isPublished !== false).slice(0, 3);
    return res.json({ success: true, blog, related });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/v1/blogs
 * Admin create blog post with WYSIWYG content & SEO metadata
 */
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      authorName,
      authorRole,
      tags,
      isFeatured,
      isPublished,
      seo,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Article title and content are required.' });
    }

    const sanitizedContent = sanitizeEditorialHtml(content);
    let finalSlug = slugify(slug || title);

    const payload = {
      title: String(title).trim(),
      slug: finalSlug,
      excerpt: String(excerpt || '').trim(),
      content: sanitizedContent,
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1400&q=80',
      category: String(category || 'Bridal Heritage').trim(),
      authorName: String(authorName || 'BL Jewels Editorial Atelier').trim(),
      authorRole: String(authorRole || 'Master Gemologists & Heritage Curators').trim(),
      readTimeMinutes: estimateReadTime(sanitizedContent),
      tags: normalizeKeywords(tags),
      isFeatured: Boolean(isFeatured),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      publishedAt: new Date(),
      seo: {
        metaTitle: String(seo?.metaTitle || title).trim(),
        metaDescription: String(seo?.metaDescription || excerpt || '').trim(),
        metaKeywords: normalizeKeywords(seo?.metaKeywords),
        ogImage: String(seo?.ogImage || coverImage || '').trim(),
        canonicalUrl: String(seo?.canonicalUrl || `/blog/${finalSlug}`).trim(),
      },
    };

    if (getDbStatus()) {
      const exists = await Blog.findOne({ slug: finalSlug }).lean();
      if (exists) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
        payload.slug = finalSlug;
      }
      const created = await Blog.create(payload);
      return res.status(201).json({ success: true, blog: created });
    }

    const list = ensureMemoryBlogs();
    if (list.some((b) => b.slug === finalSlug)) {
      payload.slug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }
    const memBlog = {
      _id: `blog_${Date.now()}`,
      ...payload,
      views: 0,
      createdAt: new Date().toISOString(),
    };
    list.unshift(memBlog);
    return res.status(201).json({ success: true, blog: memBlog });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/v1/blogs/:id
 * Admin update blog post & SEO meta
 */
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.title) updates.title = String(updates.title).trim();
    if (updates.slug) updates.slug = slugify(updates.slug);
    if (updates.content !== undefined) {
      updates.content = sanitizeEditorialHtml(updates.content);
      updates.readTimeMinutes = estimateReadTime(updates.content);
    }
    if (updates.tags !== undefined) {
      updates.tags = normalizeKeywords(updates.tags);
    }
    if (updates.seo) {
      updates.seo = {
        metaTitle: String(updates.seo.metaTitle || '').trim(),
        metaDescription: String(updates.seo.metaDescription || '').trim(),
        metaKeywords: normalizeKeywords(updates.seo.metaKeywords),
        ogImage: String(updates.seo.ogImage || '').trim(),
        canonicalUrl: String(updates.seo.canonicalUrl || '').trim(),
      };
    }
    if (updates.isPublished !== undefined) updates.isPublished = Boolean(updates.isPublished);
    if (updates.isFeatured !== undefined) updates.isFeatured = Boolean(updates.isFeatured);

    if (getDbStatus()) {
      const updated = await Blog.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Blog article not found.' });
      }
      return res.json({ success: true, blog: updated });
    }

    const list = ensureMemoryBlogs();
    const idx = list.findIndex((b) => b._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Blog article not found.' });
    }
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    return res.json({ success: true, blog: list[idx] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/v1/blogs/:id
 * Admin delete blog post
 */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (getDbStatus()) {
      const deleted = await Blog.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Blog article not found.' });
      }
      return res.json({ success: true, message: 'Article deleted.' });
    }

    const list = ensureMemoryBlogs();
    const prevLen = list.length;
    memoryStore.blogs = list.filter((b) => b._id !== id);
    if (memoryStore.blogs.length === prevLen) {
      return res.status(404).json({ success: false, message: 'Blog article not found.' });
    }
    return res.json({ success: true, message: 'Article deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

