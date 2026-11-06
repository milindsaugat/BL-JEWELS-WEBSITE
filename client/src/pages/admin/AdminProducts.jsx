import React, { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Upload,
  Check,
  ChevronDown,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Calculator,
  Layers,
  Settings,
  Eye,
  Star,
  Tag,
  Truck,
  ArrowLeft,
  CheckSquare,
  Square,
  Package,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { toast } from 'sonner';
import { api, productService, categoryService, uploadService } from '../../services/api';

const newVariant = () => ({
  label: '',
  sku: '',
  size: '',
  color: '',
  karat: '22K',
  weight: 0,
  price: '',
  discountPrice: '',
  stock: 10,
  image: '',
  isDefault: false,
});

const defaultBlankProduct = () => ({
  name: '',
  slug: '',
  sku: '',
  description: '',
  shortDescription: '',
  category: '',
  categoryName: '',
  metal: {
    type: 'gold',
    karat: '22K',
    purity: '916',
    color: 'yellow',
  },
  stone: {
    type: '',
    carats: 0,
    quality: '',
    color: '',
    clarity: '',
  },
  variants: [{ ...newVariant(), isDefault: true }],
  images: [],
  tags: [],
  occasion: [],
  certifications: ['BIS Hallmark'],
  careInstructions: 'Store in an airtight velvet box. Keep away from harsh perfumes, water, and chemicals.',
  productType: 'single',
  comboItems: [],
  isActive: true,
  isFeatured: false,
  isNewArrival: false,
  seo: { metaTitle: '', metaDescription: '' },

  // Luxury Jewellery Specs - Defaulted to Agra as requested
  labelName: 'Set 18Kt',
  branchLocation: 'Agra, Uttar Pradesh',
  groupName: '18Kt Gold Ornaments',
  varietyName: 'TURK',
  netWeight: 17.09,
  grossWeight: 17.09,
  pieces: 3,
  labourRate: 548.7,
  labourPercent: 5.0,
  todaysRate: 10974.0,
  jewelType: 'FLAT SET',

  // Delivery & Serviceable Pincodes
  serviceablePincodes: ['282001', '282002', '110001', '110085', '400001'],

  // Studded Details
  studdedDetails: {
    styleName: 'Other Charges [H]',
    studSalesAmount: 300.0,
    salesAmount: 300.0,
    otherCharges: 300.0,
  },

  // Price Breakup
  priceBreakup: {
    metalAmount: 187545.66,
    otherCharge: 300.0,
    makingCharge: 9377.28,
    gstAmount: 5917.0,
    grandTotal: 203140.0,
  },
});

export const AdminProducts = () => {
  // View mode: 'list' | 'editor' (NO POPUP - Direct Full Page View)
  const [viewMode, setViewMode] = useState('list');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState('');

  // Filtering & Search
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | live | draft
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all | instock | lowstock | outofstock

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);

  // Editor State
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // basic | media | specs | pricing | pincodes | variants | combos

  // Pincode input string helper
  const [pincodeString, setPincodeString] = useState('');
  const [testPincode, setTestPincode] = useState('');
  const [testResult, setTestResult] = useState(null);

  // Direct Image URLs
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [customGalleryUrl, setCustomGalleryUrl] = useState('');

  // Concurrent Initial Load
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/products/admin/all').catch(() => api.get('/products?limit=100')),
        categoryService.getCategories(),
      ]);
      setProducts(pRes.data.products || []);
      setCategories(cRes.categories || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load products catalogue.');
      toast.error('Unable to fetch products catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Full-Page Editor (NO POPUP)
  const openEditor = (prod = null) => {
    setError('');
    setEditingId(prod?._id || null);
    setActiveTab('basic');
    setCustomCoverUrl('');
    setCustomGalleryUrl('');
    setTestPincode('');
    setTestResult(null);

    if (prod) {
      const blank = defaultBlankProduct();
      const current = {
        ...blank,
        ...prod,
        category: prod.category?._id || prod.category || '',
        categoryName: prod.categoryName || prod.category?.name || '',
        branchLocation: prod.branchLocation || 'Agra, Uttar Pradesh',
        metal: { ...blank.metal, ...prod.metal },
        stone: { ...blank.stone, ...prod.stone },
        seo: prod.seo || {},
        variants: (prod.variants || []).map((v) => ({
          ...v,
          discountPrice: v.discountPrice ?? '',
        })),
        comboItems: prod.comboItems || [],
        serviceablePincodes: Array.isArray(prod.serviceablePincodes) ? prod.serviceablePincodes : [],
        studdedDetails: { ...blank.studdedDetails, ...prod.studdedDetails },
        priceBreakup: { ...blank.priceBreakup, ...prod.priceBreakup },
      };
      setForm(current);
      setPincodeString(current.serviceablePincodes.join(', '));
    } else {
      const blank = defaultBlankProduct();
      setForm(blank);
      setPincodeString(blank.serviceablePincodes.join(', '));
    }
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeEditor = () => {
    setForm(null);
    setEditingId(null);
    setViewMode('list');
  };

  const updateForm = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const updateVariant = (index, key, val) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === index ? { ...v, [key]: val } : v)),
    }));
  };

  // ── INLINE STATUS TOGGLE DIRECT FROM TABLE ──
  const toggleProductStatus = async (product, e) => {
    if (e) e.stopPropagation();
    const newStatus = !product.isActive;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, isActive: newStatus } : p))
    );

    try {
      await productService.updateProduct(product._id, { isActive: newStatus });
      toast.success(
        newStatus ? `"${product.name}" published to storefront` : `"${product.name}" moved to drafts`
      );
    } catch (err) {
      // Revert on error
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isActive: !newStatus } : p))
      );
      toast.error('Failed to update product status.');
    }
  };

  // ── BULK ACTIONS (CONCURRENT EXECUTION) ──
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (makeActive) => {
    if (!selectedIds.length) return;
    setBulkBusy(true);
    try {
      // Run status updates concurrently
      await Promise.all(
        selectedIds.map((id) => productService.updateProduct(id, { isActive: makeActive }))
      );
      setProducts((prev) =>
        prev.map((p) => (selectedIds.includes(p._id) ? { ...p, isActive: makeActive } : p))
      );
      toast.success(
        `${selectedIds.length} products ${makeActive ? 'published' : 'moved to drafts'}.`
      );
      setSelectedIds([]);
    } catch {
      toast.error('Bulk status update failed.');
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected products?`)) return;
    setBulkBusy(true);
    try {
      await Promise.all(selectedIds.map((id) => productService.deleteProduct(id)));
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p._id)));
      toast.success(`${selectedIds.length} products deleted.`);
      setSelectedIds([]);
    } catch {
      toast.error('Bulk deletion failed.');
    } finally {
      setBulkBusy(false);
    }
  };

  // ── IMAGE UPLOAD HANDLING: MAIN COVER vs MULTI-GALLERY ──
  // 1. Upload Main Cover Image
  const handleUploadMainCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError('');
    try {
      const res = await uploadService.uploadImage(file, 'bl-jewels/products/covers');
      if (res?.url) {
        setForm((f) => {
          // Remove old primary or mark new as primary
          const restImages = (f.images || []).map((im) => ({ ...im, isPrimary: false }));
          return {
            ...f,
            images: [
              { url: res.url, publicId: res.publicId || '', alt: f.name || 'Cover', isPrimary: true },
              ...restImages,
            ],
          };
        });
        toast.success('Main cover image uploaded!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload cover image.');
      toast.error('Cover upload failed.');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  // Add Main Cover via URL
  const handleAddCoverUrl = () => {
    const url = customCoverUrl.trim();
    if (!url || !/^https?:\/\//i.test(url)) {
      toast.error('Please enter a valid HTTP/HTTPS image URL.');
      return;
    }
    setForm((f) => {
      const rest = (f.images || []).map((im) => ({ ...im, isPrimary: false }));
      return {
        ...f,
        images: [{ url, publicId: '', alt: f.name || 'Cover', isPrimary: true }, ...rest],
      };
    });
    setCustomCoverUrl('');
    toast.success('Main cover URL set!');
  };

  // 2. Upload Multi-Gallery Images
  const handleUploadGalleryFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingGallery(true);
    setError('');
    try {
      const results = await Promise.all(
        files.slice(0, 15).map((file) => uploadService.uploadImage(file, 'bl-jewels/products/gallery'))
      );
      setForm((f) => ({
        ...f,
        images: [
          ...f.images,
          ...results.map((r, idx) => ({
            url: r.url,
            publicId: r.publicId || '',
            alt: `${f.name} photo ${f.images.length + idx + 1}`,
            isPrimary: f.images.length === 0 && idx === 0,
          })),
        ],
      }));
      toast.success(`${results.length} gallery images added!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Gallery image upload failed.');
      toast.error('Gallery upload failed.');
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  // Add Multi-Gallery via URL
  const handleAddGalleryUrl = () => {
    const url = customGalleryUrl.trim();
    if (!url || !/^https?:\/\//i.test(url)) {
      toast.error('Please enter a valid HTTP/HTTPS image URL.');
      return;
    }
    setForm((f) => ({
      ...f,
      images: [
        ...f.images,
        { url, publicId: '', alt: `${f.name} photo`, isPrimary: f.images.length === 0 },
      ],
    }));
    setCustomGalleryUrl('');
    toast.success('Gallery photo added!');
  };

  // Remove Photo
  const handleRemoveImage = (index) => {
    const target = form.images[index];
    if (target?.publicId) {
      uploadService.deleteAsset(target.publicId, target.url).catch(() => {});
    }
    setForm((f) => {
      const next = f.images.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((im) => im.isPrimary)) {
        next[0].isPrimary = true;
      }
      return { ...f, images: next };
    });
    toast.success('Photo removed.');
  };

  const handleMakeCover = (index) => {
    setForm((f) => ({
      ...f,
      images: f.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
    toast.success('Set as primary cover image!');
  };

  // Auto calculate price breakup
  const handleAutoCalculateBreakup = () => {
    const net = Number(form.netWeight) || 0;
    const rate = Number(form.todaysRate) || 0;
    const metalAmt = Math.round(net * rate * 100) / 100;

    const labPct = Number(form.labourPercent) || 0;
    const labRate = Number(form.labourRate) || 0;
    const makingAmt = labPct > 0 ? Math.round(metalAmt * (labPct / 100) * 100) / 100 : Math.round(net * labRate * 100) / 100;

    const other = Number(form.studdedDetails?.salesAmount) || Number(form.priceBreakup?.otherCharge) || 0;
    const subtotal = metalAmt + makingAmt + other;
    const gst = Math.round(subtotal * 0.03 * 100) / 100;
    const grand = Math.round((subtotal + gst) * 100) / 100;

    setForm((f) => ({
      ...f,
      priceBreakup: {
        metalAmount: metalAmt,
        makingCharge: makingAmt,
        otherCharge: other,
        gstAmount: gst,
        grandTotal: grand,
      },
      variants: f.variants.map((v, i) => (i === 0 ? { ...v, price: Math.round(grand) } : v)),
    }));
    toast.success('Price breakup computed at 3% GST!');
  };

  // Save product
  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    const pincodesList = pincodeString
      .split(',')
      .map((p) => p.trim())
      .filter((p) => /^[0-9]{6}$/.test(p));

    try {
      const payload = {
        ...form,
        branchLocation: form.branchLocation || 'Agra, Uttar Pradesh',
        serviceablePincodes: pincodesList,
        netWeight: Number(form.netWeight) || 0,
        grossWeight: Number(form.grossWeight) || 0,
        pieces: Number(form.pieces) || 1,
        labourRate: Number(form.labourRate) || 0,
        labourPercent: Number(form.labourPercent) || 0,
        todaysRate: Number(form.todaysRate) || 0,
        variants: form.variants.map((v) => ({
          ...v,
          price: Number(v.price),
          stock: Number(v.stock),
          weight: Number(v.weight || 0),
          discountPrice: v.discountPrice === '' || v.discountPrice == null ? null : Number(v.discountPrice),
        })),
        images: form.images.map((im, i) => ({
          ...im,
          isPrimary: im.isPrimary || i === 0,
        })),
        comboItems:
          form.productType === 'combo'
            ? form.comboItems.map((c) => ({ ...c, quantity: Number(c.quantity) }))
            : [],
      };

      if (!payload.slug) delete payload.slug;
      if (!payload.sku) delete payload.sku;

      if (editingId) {
        const res = await productService.updateProduct(editingId, payload);
        const updated = res?.data || res?.product || res;
        toast.success(`"${payload.name}" updated successfully!`);
        if (updated && updated._id) {
          setProducts((prev) => prev.map((p) => (p._id === editingId ? { ...p, ...updated } : p)));
        } else {
          productService.getProducts({ limit: 100 }).then((refreshed) => {
            const list = refreshed?.products || refreshed?.data?.products || refreshed?.data || [];
            if (Array.isArray(list) && list.length > 0) setProducts(list);
          }).catch(() => {});
        }
      } else {
        const res = await productService.createProduct(payload);
        const created = res?.data || res?.product || res;
        toast.success(`"${payload.name}" published to catalog!`);
        if (created && created._id) {
          setEditingId(created._id);
          setForm((f) => ({ ...f, _id: created._id, slug: created.slug || f.slug }));
          setProducts((prev) => [created, ...prev]);
        } else {
          productService.getProducts({ limit: 100 }).then((refreshed) => {
            const list = refreshed?.products || refreshed?.data?.products || refreshed?.data || [];
            if (Array.isArray(list) && list.length > 0) setProducts(list);
          }).catch(() => {});
        }
      }
      // Stay in studio view without refresh or back navigation
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save product. Please check required fields.');
      toast.error('Failed to save product.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteProduct = async (p) => {
    if (!window.confirm(`Permanently remove "${p.name}" from your catalog?`)) return;
    setBusy(true);
    try {
      await productService.deleteProduct(p._id);
      setProducts((ps) => ps.filter((x) => x._id !== p._id));
      toast.success(`"${p.name}" removed.`);
    } catch (err) {
      toast.error('Could not delete product.');
    } finally {
      setBusy(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'live' ? p.isActive : !p.isActive);
    const matchesCategory = categoryFilter === 'all' || (p.category?._id || p.category) === categoryFilter;

    const totalStock = (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'instock' && totalStock > 5) ||
      (stockFilter === 'lowstock' && totalStock > 0 && totalStock <= 5) ||
      (stockFilter === 'outofstock' && totalStock === 0);

    const searchTarget = `${p.name} ${p.sku || ''} ${p.labelName || ''} ${p.categoryName || ''} ${(p.variants || []).map((v) => v.sku).join(' ')}`.toLowerCase();
    return matchesStatus && matchesCategory && matchesStock && searchTarget.includes(query.toLowerCase());
  });

  // Calculate Metrics
  const totalVaultValue = products.reduce((acc, p) => {
    const pStock = (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
    const pPrice = Math.min(...(p.variants || [{ price: 0 }]).map((v) => v.price || 0));
    return acc + pStock * pPrice;
  }, 0);

  const lowStockCount = products.filter((p) => {
    const s = (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
    return s > 0 && s <= 5;
  }).length;

  const primaryCoverImage = form?.images?.find((im) => im.isPrimary) || form?.images?.[0];
  const galleryImages = (form?.images || []).filter((im) => im !== primaryCoverImage);

  // ══════════════════════════════════════════════════════════════════
  // VIEW 1: FULL PAGE PRODUCTS LISTING (NO POPUP)
  // ══════════════════════════════════════════════════════════════════
  if (viewMode === 'list') {
    return (
      <div className="space-y-6 animate-fadeIn font-body">
        
        {/* Page Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest uppercase font-accent text-[#930303] font-bold">
              Agra Heritage Atelier · Port 5174
            </p>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 mt-1">
              Products & Jewellery Management
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Live vault inventory, Blue Dart delivery pincodes, weight specs, and instant status publishing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openEditor()}
              className="flex items-center gap-2 bg-[#930303] hover:bg-[#780303] text-white rounded-xl px-5 py-3 text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus size={18} />
              <span>Add New Jewellery</span>
            </button>
          </div>
        </header>

        {/* ── KPI Metrics Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex justify-between items-center text-xs text-stone-500">
              <span>Total Catalog Creations</span>
              <Boxes size={16} className="text-[#930303]" />
            </div>
            <p className="text-2xl font-bold font-display text-stone-900 mt-2">{products.length}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Hallmarked designs</p>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex justify-between items-center text-xs text-stone-500">
              <span>Storefront Published</span>
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-display text-emerald-700 mt-2">
              {products.filter((p) => p.isActive).length}
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">Live for patrons</p>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex justify-between items-center text-xs text-stone-500">
              <span>Low Vault Inventory</span>
              <AlertCircle size={16} className="text-amber-600" />
            </div>
            <p className="text-2xl font-bold font-display text-amber-700 mt-2">{lowStockCount}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">&le; 5 units remaining</p>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex justify-between items-center text-xs text-stone-500">
              <span>Vault Valuation</span>
              <TrendingUp size={16} className="text-[#C9A13B]" />
            </div>
            <p className="text-2xl font-bold font-display text-[#930303] mt-2">
              ₹{(totalVaultValue / 100000).toFixed(1)} Lakh
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">Estimated gross stock</p>
          </div>
        </div>

        {/* ── Search & Multi-Filter Controls ── */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product name, SKU, tag, or category..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#930303]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#930303]"
            >
              <option value="all">All Status</option>
              <option value="live">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#930303]"
            >
              <option value="all">All Vault Stock</option>
              <option value="instock">In Stock (&gt; 5)</option>
              <option value="lowstock">Low Stock (1-5)</option>
              <option value="outofstock">Out of Stock (0)</option>
            </select>

            <button
              onClick={loadData}
              className="bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-xl px-3.5 py-2 text-xs text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── BULK ACTIONS FLOATING TOOLBAR ── */}
        {selectedIds.length > 0 && (
          <div className="bg-[#930303] text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-lg animate-slideDown">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <CheckSquare size={16} />
              <span>{selectedIds.length} creations selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={bulkBusy}
                onClick={() => handleBulkStatus(true)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Publish All
              </button>
              <button
                type="button"
                disabled={bulkBusy}
                onClick={() => handleBulkStatus(false)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Draft All
              </button>
              <button
                type="button"
                disabled={bulkBusy}
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-800 hover:bg-red-900 border border-red-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Delete Selected
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="ml-2 text-xs text-stone-300 hover:text-white underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── PRODUCTS TABLE ── */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm font-body">
              <thead className="bg-[#FAF8F5] border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredProducts.length > 0 &&
                        filteredProducts.every((p) => selectedIds.includes(p._id))
                      }
                      onChange={handleSelectAll}
                      className="accent-[#930303] cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Jewelry Creation</th>
                  <th className="p-4">Tag / Branch</th>
                  <th className="p-4">Weight & Specs</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Vault Stock</th>
                  <th className="p-4">Pincodes</th>
                  <th className="p-4">Status (Click to toggle)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => {
                  const cover = p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url;
                  const minPrice = Math.min(
                    ...(p.variants || [{ price: 0 }]).map((v) => v.discountPrice ?? v.price)
                  );
                  const totalStock = (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
                  const pincodesCount = Array.isArray(p.serviceablePincodes) ? p.serviceablePincodes.length : 0;
                  const isRowSelected = selectedIds.includes(p._id);

                  return (
                    <tr
                      key={p._id}
                      onClick={() => openEditor(p)}
                      className={`hover:bg-stone-50/80 transition-colors cursor-pointer ${
                        isRowSelected ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={(e) => handleSelectRow(p._id, e)}
                          className="accent-[#930303] cursor-pointer"
                        />
                      </td>

                      {/* Creation & Image */}
                      <td className="p-4">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                            {cover ? (
                              <img src={cover} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 font-semibold">
                                NO PIC
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900 hover:text-[#930303] line-clamp-1">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {p.category?.name || p.categoryName || 'Jewellery'} · {p.variants?.length || 1} variants
                              {p.productType === 'combo' ? ' · Combo Set' : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Tag / Branch */}
                      <td className="p-4 text-stone-700 whitespace-nowrap">
                        <span className="font-semibold text-stone-900">{p.labelName || 'Set 18Kt'}</span>
                        <p className="text-[11px] text-stone-500">{p.branchLocation || 'Agra, Uttar Pradesh'}</p>
                      </td>

                      {/* Weight & Specs */}
                      <td className="p-4 text-stone-700 whitespace-nowrap">
                        <p className="font-medium">
                          Net: {Number(p.netWeight || p.variants?.[0]?.weight || 0).toFixed(2)}g
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Gross: {Number(p.grossWeight || p.netWeight || 0).toFixed(2)}g · {p.pieces || 1} pcs
                        </p>
                      </td>

                      {/* Price */}
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-stone-900">
                          ₹{Number(minPrice).toLocaleString('en-IN')}
                        </p>
                      </td>

                      {/* Vault Stock with badges */}
                      <td className="p-4 whitespace-nowrap">
                        {totalStock > 5 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{totalStock} in vault</span>
                          </span>
                        ) : totalStock > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Only {totalStock} left</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span>Out of Stock</span>
                          </span>
                        )}
                      </td>

                      {/* Delivery Pincodes */}
                      <td className="p-4 whitespace-nowrap">
                        {pincodesCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <MapPin size={11} />
                            <span>{pincodesCount} pincodes</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600">
                            Pan-India
                          </span>
                        )}
                      </td>

                      {/* STATUS (CLICKABLE TOGGLE) */}
                      <td className="p-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => toggleProductStatus(p, e)}
                          title="Click to toggle between Published & Draft"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 ${
                            p.isActive
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                              : 'bg-stone-200 hover:bg-stone-300 text-stone-700 border border-stone-300'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              p.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-stone-500'
                            }`}
                          />
                          <span>{p.isActive ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditor(p)}
                            className="p-2 border border-stone-200 hover:border-stone-400 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Edit full page"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDeleteProduct(p)}
                            className="p-2 border border-stone-200 hover:border-red-300 text-stone-400 hover:text-red-700 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!filteredProducts.length && (
              <div className="py-16 text-center text-stone-500 text-xs sm:text-sm">
                {loading ? 'Fetching luxury inventory...' : 'No products matched your search or filters.'}
              </div>
            )}
          </div>
        </div>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // VIEW 2: FULL-PAGE DIRECT STUDIO (NO POPUP / NO MODAL)
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-fadeIn font-body pb-16">
      
      {/* ── Studio Top Breadcrumb & Action Bar ── */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={closeEditor}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Products</span>
          </button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              {editingId ? `Edit Product: ${form.name || 'Untitled'}` : 'New Jewelry Creation'}
            </h1>
            <p className="text-xs text-stone-500 font-body">
              Agra Atelier Studio · Direct Full-Page Management
            </p>
          </div>
        </div>

        {/* Live Status Toggle + Discard / Save */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => updateForm('isActive', e.target.checked)}
              className="accent-[#930303]"
            />
            <span className={form.isActive ? 'text-emerald-700 font-bold' : 'text-stone-500'}>
              {form.isActive ? 'Published on Website' : 'Saved as Private Draft'}
            </span>
          </label>

          <button
            type="button"
            onClick={closeEditor}
            className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Discard
          </button>

          <button
            type="button"
            disabled={busy || uploadingCover || uploadingGallery}
            onClick={handleSave}
            className="px-6 py-2 bg-[#930303] hover:bg-[#780303] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
          >
            {busy ? 'Saving...' : editingId ? 'Update Creation' : 'Publish Creation'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border border-stone-200 rounded-2xl p-1.5 shadow-xs flex gap-1 overflow-x-auto">
        {[
          { id: 'basic', label: '1. Basic Details', icon: Tag },
          { id: 'media', label: `2. Photo Studio (${form.images.length})`, icon: ImageIcon },
          { id: 'specs', label: '3. Jewelry Specs (Agra/Weight)', icon: Layers },
          { id: 'pricing', label: '4. Pricing & Breakup', icon: Calculator },
          { id: 'pincodes', label: '5. Delivery Pincodes', icon: Truck },
          { id: 'variants', label: `6. Variants & Vault Stock (${form.variants.length})`, icon: Settings },
          { id: 'combos', label: '7. Combo & SEO', icon: Star },
        ].map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === id
                ? 'bg-[#930303] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── TAB 1: BASIC DETAILS ─── */}
      {activeTab === 'basic' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="font-display text-lg font-bold text-stone-900 border-b pb-3">
            Essential Jewelry Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Product Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder="e.g. Royal Turkish Kundan Bridal Set"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => {
                  const chosen = categories.find((c) => c._id === e.target.value);
                  updateForm('category', e.target.value);
                  if (chosen) updateForm('categoryName', chosen.name);
                }}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              >
                <option value="">Select a Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Product SKU
              </label>
              <input
                value={form.sku || ''}
                onChange={(e) => updateForm('sku', e.target.value)}
                placeholder="e.g. BLJ-SET-18K-001"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                URL Slug (Optional)
              </label>
              <input
                value={form.slug}
                onChange={(e) => updateForm('slug', e.target.value)}
                placeholder="e.g. royal-turkish-kundan-set"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Short Description (Card Teaser)
            </label>
            <input
              maxLength={200}
              value={form.shortDescription || ''}
              onChange={(e) => updateForm('shortDescription', e.target.value)}
              placeholder="e.g. 18K Hallmarked flat set with uncut Turkish karigar filigree."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Full Editorial Description (About This Piece) *
            </label>
            <textarea
              rows={5}
              required
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Crafted with pure 18Kt gold, this grand set features heirloom Turkish filigree..."
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Auspicious Occasions (comma-separated)
              </label>
              <input
                value={(form.occasion || []).join(', ')}
                onChange={(e) =>
                  updateForm(
                    'occasion',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="wedding, bridal, diwali, gifting"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Catalog Tags (comma-separated)
              </label>
              <input
                value={(form.tags || []).join(', ')}
                onChange={(e) =>
                  updateForm(
                    'tags',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="gold, 18kt, flat set, agra, heirloom"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: PHOTO STUDIO (SEPARATE MAIN COVER vs MULTI-GALLERY) ─── */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          
          {/* ── 2A. MAIN COVER IMAGE SECTION ── */}
          <div className="bg-white border-2 border-dashed border-[#930303]/30 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#930303]/10 text-[#930303] text-xs font-bold rounded-full uppercase tracking-wider">
                  <Star size={13} fill="#930303" />
                  <span>Main Primary Cover Photo</span>
                </span>
                <p className="text-xs text-stone-500 font-body mt-1">
                  This single photo will be the main cover on the homepage, collection cards, and initial product view.
                </p>
              </div>

              {/* Upload Main File Button */}
              <label className="flex items-center gap-2 bg-[#930303] hover:bg-[#780303] text-white rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                <Upload size={15} />
                <span>{uploadingCover ? 'Uploading Cover...' : 'Upload Cover Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingCover}
                  onChange={handleUploadMainCover}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Direct Cover URL input */}
            <div className="flex gap-2 max-w-xl">
              <input
                type="url"
                value={customCoverUrl}
                onChange={(e) => setCustomCoverUrl(e.target.value)}
                placeholder="Or paste external HTTPS URL for Main Cover..."
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#930303]"
              />
              <button
                type="button"
                onClick={handleAddCoverUrl}
                className="px-4 py-2 bg-stone-800 hover:bg-black text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Set Cover URL
              </button>
            </div>

            {/* Current Cover Preview Card */}
            {primaryCoverImage ? (
              <div className="flex items-center gap-4 p-4 bg-[#FAF8F5] border border-stone-200 rounded-2xl max-w-md">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-300">
                  <img src={primaryCoverImage.url} alt="Main Cover" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-[#930303] uppercase tracking-wider">
                    Active Primary Display
                  </span>
                  <p className="text-xs text-stone-600 truncate mt-0.5">{primaryCoverImage.url}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(form.images.indexOf(primaryCoverImage))}
                    className="mt-2 text-xs text-red-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Remove Cover</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-400 text-xs">
                No main cover image uploaded yet. Click "Upload Cover Photo" above.
              </div>
            )}
          </div>

          {/* ── 2B. ADDITIONAL MULTI-IMAGE GALLERY SECTION ── */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-stone-900">
                  Additional Gallery Images (Multi-Photos)
                </h3>
                <p className="text-xs text-stone-500 font-body mt-0.5">
                  Secondary carousel photos for angles, side views, hallmarking marks, and patron zoom.
                </p>
              </div>

              {/* Upload Multiple Gallery Files Button */}
              <label className="flex items-center gap-2 bg-stone-900 hover:bg-black text-white rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                <Upload size={15} />
                <span>{uploadingGallery ? 'Uploading Gallery...' : 'Upload Multi-Photos'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={uploadingGallery}
                  onChange={handleUploadGalleryFiles}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Direct Gallery URL input */}
            <div className="flex gap-2 max-w-xl">
              <input
                type="url"
                value={customGalleryUrl}
                onChange={(e) => setCustomGalleryUrl(e.target.value)}
                placeholder="Or paste external HTTPS URL for gallery..."
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#930303]"
              />
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                className="px-4 py-2 bg-stone-700 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add to Gallery
              </button>
            </div>

            {/* Multi-Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-2">
              {galleryImages.map((img) => {
                const origIndex = form.images.indexOf(img);
                return (
                  <div
                    key={origIndex}
                    className="group bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs flex flex-col"
                  >
                    <div className="aspect-square bg-stone-100 overflow-hidden relative">
                      <img src={img.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    </div>

                    <div className="p-2.5 space-y-2 flex-1 flex flex-col justify-between">
                      <input
                        value={img.alt || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((f) => ({
                            ...f,
                            images: f.images.map((im, n) => (n === origIndex ? { ...im, alt: val } : im)),
                          }));
                        }}
                        placeholder="Image caption"
                        className="w-full px-2 py-1 text-[11px] bg-stone-50 border border-stone-200 rounded-lg"
                      />

                      <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleMakeCover(origIndex)}
                          className="text-[11px] text-[#930303] hover:underline font-semibold cursor-pointer"
                        >
                          Make Cover
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(origIndex)}
                          className="text-stone-400 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!galleryImages.length && (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-400 text-xs">
                No secondary gallery images. Only the main cover will be shown on the storefront.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─── TAB 3: JEWELRY SPECS (AGRA ATELIER ENGINE) ─── */}
      {activeTab === 'specs' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">
                Jewelry Specifications & Tagging (BL Jewels Engine)
              </h2>
              <p className="text-xs text-stone-500 font-body">
                Powers the "Product Details" accordion on the patron product page.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Label / Tag Name
              </label>
              <input
                value={form.labelName || ''}
                onChange={(e) => updateForm('labelName', e.target.value)}
                placeholder="e.g. Set 18Kt"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Branch Location (Agra Atelier)
              </label>
              <input
                value={form.branchLocation || 'Agra, Uttar Pradesh'}
                onChange={(e) => updateForm('branchLocation', e.target.value)}
                placeholder="Agra, Uttar Pradesh"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Group Name
              </label>
              <input
                value={form.groupName || ''}
                onChange={(e) => updateForm('groupName', e.target.value)}
                placeholder="e.g. 18Kt Gold Ornaments"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Variety Name
              </label>
              <input
                value={form.varietyName || ''}
                onChange={(e) => updateForm('varietyName', e.target.value)}
                placeholder="e.g. TURK"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Net Weight (gms)
              </label>
              <input
                type="number"
                step="0.001"
                value={form.netWeight ?? ''}
                onChange={(e) => updateForm('netWeight', e.target.value)}
                placeholder="e.g. 17.090"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Gross Weight (gms)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.grossWeight ?? ''}
                onChange={(e) => updateForm('grossWeight', e.target.value)}
                placeholder="e.g. 17.09"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Pieces
              </label>
              <input
                type="number"
                min="1"
                value={form.pieces ?? 1}
                onChange={(e) => updateForm('pieces', e.target.value)}
                placeholder="e.g. 3"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Type
              </label>
              <input
                value={form.jewelType || ''}
                onChange={(e) => updateForm('jewelType', e.target.value)}
                placeholder="e.g. FLAT SET"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Category Name
              </label>
              <input
                value={form.categoryName || ''}
                onChange={(e) => updateForm('categoryName', e.target.value)}
                placeholder="e.g. Set"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
              Metal Karat & Hallmarking Purity
            </h3>
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Metal Type</label>
                <select
                  value={form.metal.type}
                  onChange={(e) => updateForm('metal', { ...form.metal, type: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                >
                  {['gold', 'silver', 'diamond', 'platinum', 'mixed'].map((m) => (
                    <option key={m} value={m}>{m.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Karat Purity</label>
                <select
                  value={form.metal.karat}
                  onChange={(e) => updateForm('metal', { ...form.metal, karat: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                >
                  {['14K', '18K', '22K', '24K', 'N/A'].map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Color Shade</label>
                <select
                  value={form.metal.color}
                  onChange={(e) => updateForm('metal', { ...form.metal, color: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                >
                  {['yellow', 'white', 'rose', 'mixed'].map((c) => (
                    <option key={c} value={c}>{c.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">BIS Stamp Mark</label>
                <input
                  value={form.metal.purity || '916'}
                  onChange={(e) => updateForm('metal', { ...form.metal, purity: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: PRICING & BREAKUP ENGINE ─── */}
      {activeTab === 'pricing' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-emerald-900">Right Gold Price Breakup Engine</p>
              <p className="text-[11px] text-emerald-700">
                Calculates Metal Amount = Net Weight × Today's Rate + Making Charge + Other Charges + 3% GST.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoCalculateBreakup}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Calculator size={14} />
              <span>Auto-Compute Breakup</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Today's Metal Rate (₹/g)
              </label>
              <input
                type="number"
                step="any"
                value={form.todaysRate ?? ''}
                onChange={(e) => updateForm('todaysRate', e.target.value)}
                placeholder="e.g. 10974.00"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Labour Rate (₹/g)
              </label>
              <input
                type="number"
                step="any"
                value={form.labourRate ?? ''}
                onChange={(e) => updateForm('labourRate', e.target.value)}
                placeholder="e.g. 548.70"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Labour % (Making Charge %)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.labourPercent ?? ''}
                onChange={(e) => updateForm('labourPercent', e.target.value)}
                placeholder="e.g. 5.00"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#930303]"
              />
            </div>
          </div>

          <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Storefront Price Breakup Accordion Fields
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Metal Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.priceBreakup?.metalAmount ?? ''}
                  onChange={(e) =>
                    updateForm('priceBreakup', {
                      ...form.priceBreakup,
                      metalAmount: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Making Charge (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.priceBreakup?.makingCharge ?? ''}
                  onChange={(e) =>
                    updateForm('priceBreakup', {
                      ...form.priceBreakup,
                      makingCharge: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Other Charge (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.priceBreakup?.otherCharge ?? ''}
                  onChange={(e) =>
                    updateForm('priceBreakup', {
                      ...form.priceBreakup,
                      otherCharge: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">GST Amount (₹ aprx.)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.priceBreakup?.gstAmount ?? ''}
                  onChange={(e) =>
                    updateForm('priceBreakup', {
                      ...form.priceBreakup,
                      gstAmount: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-stone-200">
              <div>
                <span className="text-xs text-stone-500">Storefront Grand Total:</span>
                <p className="text-2xl font-bold font-display text-[#930303]">
                  ₹{Number(form.priceBreakup?.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutoCalculateBreakup}
                className="text-xs text-[#930303] hover:underline font-semibold"
              >
                Re-calculate now
              </button>
            </div>
          </div>

          <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Studded Details Fields
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Style Name</label>
                <input
                  value={form.studdedDetails?.styleName || 'Other Charges [H]'}
                  onChange={(e) =>
                    updateForm('studdedDetails', {
                      ...form.studdedDetails,
                      styleName: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Stud Sales Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.studdedDetails?.studSalesAmount ?? ''}
                  onChange={(e) =>
                    updateForm('studdedDetails', {
                      ...form.studdedDetails,
                      studSalesAmount: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Sales Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.studdedDetails?.salesAmount ?? ''}
                  onChange={(e) =>
                    updateForm('studdedDetails', {
                      ...form.studdedDetails,
                      salesAmount: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: DELIVERY PINCODES ─── */}
      {activeTab === 'pincodes' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-2.5">
            <Truck size={18} className="text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-900">Blue Dart Armored Serviceable Delivery Pincodes</p>
              <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed font-body">
                Enter multiple delivery postal pincodes separated by commas. Leave empty or click "Clear" to allow <strong>Complimentary Pan-India Armored Delivery</strong>.
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Configured Serviceable Pincodes
              </label>
              <button
                type="button"
                onClick={() => setPincodeString('')}
                className="text-xs text-[#930303] hover:underline font-semibold"
              >
                Clear (Enable Pan-India)
              </button>
            </div>
            <textarea
              rows={4}
              value={pincodeString}
              onChange={(e) => setPincodeString(e.target.value)}
              placeholder="e.g. 282001, 282002, 110001, 110085, 400001"
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-[#930303]"
            />
            <p className="text-[11px] text-stone-500 font-body mt-1">
              Currently configured:{' '}
              <strong className="text-stone-800">
                {pincodeString.split(',').filter((p) => /^[0-9]{6}$/.test(p.trim())).length} active pincodes
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-stone-500 font-body py-1">Quick Add Hub Presets:</span>
            <button
              type="button"
              onClick={() =>
                setPincodeString((prev) =>
                  [...new Set([...prev.split(',').map((p) => p.trim()).filter(Boolean), '282001', '282002', '282004'])].join(', ')
                )
              }
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-xs"
            >
              + Agra Hubs (282001, 282002)
            </button>
            <button
              type="button"
              onClick={() =>
                setPincodeString((prev) =>
                  [...new Set([...prev.split(',').map((p) => p.trim()).filter(Boolean), '110001', '110085', '110034'])].join(', ')
                )
              }
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-xs"
            >
              + Delhi Hubs (110001, 110085)
            </button>
            <button
              type="button"
              onClick={() =>
                setPincodeString((prev) =>
                  [...new Set([...prev.split(',').map((p) => p.trim()).filter(Boolean), '400001', '400049', '400051'])].join(', ')
                )
              }
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-xs"
            >
              + Mumbai Hubs (400001, 400049)
            </button>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 max-w-lg">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Verify Pincode Dispatch Simulator
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={testPincode}
                onChange={(e) => setTestPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code to simulate"
                className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-body"
              />
              <button
                type="button"
                onClick={() => {
                  const code = testPincode.trim();
                  const list = pincodeString.split(',').map((p) => p.trim()).filter(Boolean);
                  if (!/^[0-9]{6}$/.test(code)) {
                    setTestResult({ status: 'invalid', message: 'Enter a valid 6-digit code' });
                  } else if (list.length === 0 || list.includes(code)) {
                    setTestResult({ status: 'valid', message: `✓ Delivery is AVAILABLE for ${code}!` });
                  } else {
                    setTestResult({ status: 'blocked', message: `✕ Delivery is NOT AVAILABLE for ${code}` });
                  }
                }}
                className="px-4 py-2 bg-[#930303] text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Simulate
              </button>
            </div>
            {testResult && (
              <p
                className={`text-xs font-semibold ${
                  testResult.status === 'valid'
                    ? 'text-emerald-700'
                    : testResult.status === 'blocked'
                    ? 'text-red-700'
                    : 'text-stone-500'
                }`}
              >
                {testResult.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 6: VARIANTS & VAULT STOCK ─── */}
      {activeTab === 'variants' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">
                Sizes, Weights & Vault Inventory ({form.variants.length})
              </h2>
              <p className="text-xs text-stone-500 font-body">
                Specify variant labels, individual SKUs, gram weights, stock count, and variant photos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, variants: [...f.variants, newVariant()] }))}
              className="px-4 py-2 bg-[#930303] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="space-y-4">
            {form.variants.map((v, i) => (
              <div
                key={i}
                className={`bg-stone-50 border rounded-2xl p-4 sm:p-5 space-y-4 ${
                  v.isDefault ? 'border-[#930303] ring-1 ring-[#930303] bg-white' : 'border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                    <input
                      type="radio"
                      name="default_variant"
                      checked={v.isDefault}
                      onChange={() =>
                        setForm((f) => ({
                          ...f,
                          variants: f.variants.map((x, n) => ({ ...x, isDefault: n === i })),
                        }))
                      }
                      className="accent-[#930303]"
                    />
                    <span>Default Storefront Option</span>
                  </label>

                  <button
                    type="button"
                    disabled={form.variants.length === 1}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        variants: f.variants.filter((_, n) => n !== i),
                      }))
                    }
                    className="text-xs text-red-700 hover:underline disabled:opacity-30 cursor-pointer"
                  >
                    Remove Option
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Option Label</label>
                    <input
                      value={v.label || ''}
                      onChange={(e) => updateVariant(i, 'label', e.target.value)}
                      placeholder="e.g. 24 Inch · 54.0g"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Variant SKU *</label>
                    <input
                      required
                      value={v.sku || ''}
                      onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                      placeholder="BLJ-SET-18K-A"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Size / Dimension</label>
                    <input
                      value={v.size || ''}
                      onChange={(e) => updateVariant(i, 'size', e.target.value)}
                      placeholder="24 Inch"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Weight (grams)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={v.weight ?? ''}
                      onChange={(e) => updateVariant(i, 'weight', e.target.value)}
                      placeholder="54.0"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={v.price ?? ''}
                      onChange={(e) => updateVariant(i, 'price', e.target.value)}
                      placeholder="420000"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Sale Price (₹ optional)</label>
                    <input
                      type="number"
                      value={v.discountPrice ?? ''}
                      onChange={(e) => updateVariant(i, 'discountPrice', e.target.value)}
                      placeholder="395000"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Vault Stock Count</label>
                    <input
                      type="number"
                      min="0"
                      value={v.stock ?? 0}
                      onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Option Image URL</label>
                    <input
                      value={v.image || ''}
                      onChange={(e) => updateVariant(i, 'image', e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 7: COMBOS & SEO ─── */}
      {activeTab === 'combos' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Product Architecture Type
            </label>
            <select
              value={form.productType}
              onChange={(e) => updateForm('productType', e.target.value)}
              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm font-semibold"
            >
              <option value="single">Single Standalone Jewel</option>
              <option value="combo">Combo Wedding Set (Multiple pieces)</option>
            </select>

            {form.productType === 'combo' && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-stone-500 font-body">
                  Select the individual catalog pieces bundled into this royal bridal set:
                </p>
                {form.comboItems.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select
                      value={item.product}
                      onChange={(e) => {
                        const prodId = e.target.value;
                        setForm((f) => ({
                          ...f,
                          comboItems: f.comboItems.map((c, n) => (n === i ? { ...c, product: prodId } : c)),
                        }));
                      }}
                      className="flex-1 p-2 bg-white border rounded-lg text-xs"
                    >
                      <option value="">Select piece from catalogue</option>
                      {products.filter((p) => p._id !== editingId).map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || 1}
                      onChange={(e) => {
                        const qty = e.target.value;
                        setForm((f) => ({
                          ...f,
                          comboItems: f.comboItems.map((c, n) => (n === i ? { ...c, quantity: qty } : c)),
                        }));
                      }}
                      className="w-16 p-2 bg-white border rounded-lg text-xs text-center"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          comboItems: f.comboItems.filter((_, n) => n !== i),
                        }))
                      }
                      className="p-2 text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      comboItems: [...f.comboItems, { product: '', quantity: 1, variantSku: '' }],
                    }))
                  }
                  className="text-xs text-[#930303] font-semibold hover:underline"
                >
                  + Add Set Component Piece
                </button>
              </div>
            )}
          </div>

          <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Promotional Badges
            </h3>
            <div className="flex flex-wrap gap-5 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => updateForm('isFeatured', e.target.checked)}
                  className="accent-[#930303]"
                />
                <span>Bestseller Jewel (Featured on Home)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNewArrival}
                  onChange={(e) => updateForm('isNewArrival', e.target.checked)}
                  className="accent-[#930303]"
                />
                <span>New Royal Arrival</span>
              </label>
            </div>
          </div>

          <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Search Engine Optimization (SEO)
            </h3>
            <div>
              <label className="block text-[11px] text-stone-500 mb-1">Meta Title</label>
              <input
                value={form.seo?.metaTitle || ''}
                onChange={(e) => updateForm('seo', { ...form.seo, metaTitle: e.target.value })}
                placeholder="e.g. Buy 18Kt Turkish Gold Set Online | BL Jewels Agra"
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-500 mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={form.seo?.metaDescription || ''}
                onChange={(e) => updateForm('seo', { ...form.seo, metaDescription: e.target.value })}
                placeholder="Discover BIS hallmarked 18K/22K gold jewellery handcrafted with auspicious purity in Agra..."
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Studio Bottom Sticky Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-6 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <span className={`w-2.5 h-2.5 rounded-full ${form.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
          <span>Status: <strong>{form.isActive ? 'Ready to Publish' : 'Draft Only'}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={closeEditor}
            className="px-5 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={busy || uploadingCover || uploadingGallery}
            onClick={handleSave}
            className="px-7 py-2 bg-[#930303] hover:bg-[#780303] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {busy ? 'Saving...' : editingId ? 'Update Creation' : 'Publish Creation'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdminProducts;
