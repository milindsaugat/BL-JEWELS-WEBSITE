import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { categoryService, uploadService } from '../services/api';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    cloudinaryPublicId: '',
    originalFilename: '',
    metals: ['gold', 'diamond', 'silver'],
    featured: true,
    order: 0,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      if (res.categories) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
      setActionError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setUploadError(null);
    setActionError(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      cloudinaryPublicId: '',
      originalFilename: '',
      metals: ['gold', 'diamond', 'silver'],
      featured: true,
      order: categories.length + 1,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setUploadError(null);
    setActionError(null);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      cloudinaryPublicId: cat.cloudinaryPublicId || '',
      originalFilename: cat.originalFilename || '',
      metals: cat.metals && cat.metals.length > 0 ? cat.metals : ['gold', 'diamond', 'silver'],
      featured: cat.featured ?? true,
      order: cat.order ?? 0,
    });
    setShowModal(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      // Auto-generate slug if it hasn't been manually diverged or if creating new
      const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return {
        ...prev,
        name: val,
        slug: !editingCategory || prev.slug === '' ? autoSlug : prev.slug,
      };
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);
    try {
      // Cloudinary direct upload into bl-jewels/categories folder
      const res = await uploadService.uploadImage(file, 'bl-jewels/categories');
      if (res.success && res.url) {
        setFormData((prev) => ({
          ...prev,
          image: res.url,
          cloudinaryPublicId: res.publicId,
          originalFilename: res.originalName || file.name,
        }));
      } else {
        setUploadError(res.message || 'Upload failed');
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Cloudinary upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalName = formData.name?.trim() || 'New Category';
    const finalSlug = formData.slug?.trim() || finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
    const cleanData = {
      ...formData,
      name: finalName,
      slug: finalSlug,
    };

    setSaving(true);
    setActionError(null);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, cleanData);
        setActionSuccess(`Category "${finalName}" updated successfully`);
      } else {
        await categoryService.createCategory(cleanData);
        setActionSuccess(`Category "${finalName}" created successfully`);
      }
      setShowModal(false);
      await fetchCategories();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const confirmMsg = `Are you sure you want to delete category "${cat.name}"?\nIts Cloudinary cover image will also be automatically removed.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingId(cat._id);
      await categoryService.deleteCategory(cat._id);
      setActionSuccess(`Category "${cat.name}" deleted and Cloudinary asset purged`);
      await fetchCategories();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
  const featuredCount = categories.filter((c) => c.featured).length;

  return (
    <div className="space-y-6">
      
      {/* ── Top Header Banner ── */}
      <div className="bg-[#8B1A1A] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#C9A44A]/15 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F3E5AB] text-xs font-semibold uppercase tracking-wider mb-2 border border-white/10">
              <Layers className="w-3.5 h-3.5" />
              Taxonomy & Collections CMS
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Product Categories
            </h1>
            <p className="text-stone-200 text-xs sm:text-sm mt-1 max-w-xl">
              Manage category taxonomy, Cloudinary cover imagery, display sequence, and storefront carousel highlights in real time.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A44A] hover:bg-[#b08d3b] text-[#140D0F] font-bold text-xs rounded-xl shadow transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* ── Notification Banners ── */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-600 hover:text-rose-900 font-bold">×</button>
        </div>
      )}

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Total Categories</span>
          <p className="text-2xl font-bold font-body text-stone-900 mt-1">{categories.length}</p>
          <span className="text-[10px] text-stone-400">Live in catalog</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Featured in Slider</span>
          <p className="text-2xl font-bold font-body text-[#8B1A1A] mt-1">{featuredCount}</p>
          <span className="text-[10px] text-stone-400">Active on homepage</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Total Designs</span>
          <p className="text-2xl font-bold font-body text-stone-900 mt-1">{totalProducts}</p>
          <span className="text-[10px] text-stone-400">Products assigned</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Cloudinary CDN</span>
          <p className="text-base font-bold font-body text-emerald-700 mt-2 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Synced & Optimized
          </p>
          <span className="text-[10px] text-stone-400">Folder: bl-jewels/categories</span>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
          />
        </div>
        <span className="text-xs text-stone-500 self-end sm:self-auto">
          Showing {filteredCategories.length} of {categories.length} categories
        </span>
      </div>

      {/* ── Categories Table ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#8B1A1A]" />
            <span>Loading categories...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            <Layers className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="font-semibold text-stone-700">No categories found</p>
            <p className="text-stone-400 mt-1">Click "Add New Category" above to create your first category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Cover Image</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Designs</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-body font-semibold text-stone-700">
                      <span className="w-6 h-6 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-xs">
                        {cat.order ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-14 h-14 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden relative group">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-stone-900 text-sm block">
                        {cat.name}
                      </span>
                      {cat.description && (
                        <span className="text-[11px] text-stone-500 line-clamp-1 max-w-xs mt-0.5">
                          {cat.description}
                        </span>
                      )}
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {(cat.metals || ['gold', 'diamond', 'silver']).map((m) => (
                          <span
                            key={m}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              m === 'gold'
                                ? 'bg-amber-100 text-amber-900'
                                : m === 'diamond'
                                ? 'bg-sky-100 text-sky-900'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <code className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono text-[11px] border border-stone-200">
                        /{cat.slug}
                      </code>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-body font-semibold text-xs border border-amber-200">
                        {cat.productCount ?? 0} Designs
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {cat.featured ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[11px] border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Active Slider
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium text-[11px]">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`http://localhost:5173/collections/${cat.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-[#8B1A1A] hover:bg-stone-100 transition-colors"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-[#8B1A1A] hover:bg-stone-100 transition-colors"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          disabled={deletingId === cat._id}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Category"
                        >
                          {deletingId === cat._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="text-base font-bold text-stone-900">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mangalsutras, Solitaire Rings"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    URL Slug <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. mangalsutras (auto-generated)"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tagline / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Auspicious 22K gold sacred bonds crafted with eternal devotion"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                />
              </div>

              {/* Image Upload directly to Cloudinary */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">
                  Category Cover Image (Cloudinary CDN)
                </label>
                
                <div className="border-2 border-dashed border-stone-300 hover:border-[#8B1A1A] rounded-xl p-4 text-center cursor-pointer bg-stone-50 hover:bg-white transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  
                  {uploadingImage ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#8B1A1A]" />
                      <span className="text-xs font-medium text-stone-600">Uploading to Cloudinary CDN...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                      <UploadCloud className="w-7 h-7 text-stone-400" />
                      <span className="text-xs font-semibold text-stone-700">
                        Click or drag image file from computer
                      </span>
                      <span className="text-[11px] text-stone-400">
                        PNG, JPG, WEBP • Original filename preserved on Cloudinary
                      </span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
                )}

                {/* Preview Thumbnail */}
                {formData.image && (
                  <div className="flex items-center gap-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <img
                      src={formData.image}
                      alt="Category Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-emerald-300 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-emerald-900 truncate">
                        {formData.originalFilename || 'Uploaded Image'}
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        ✓ Stored on Cloudinary CDN
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '', cloudinaryPublicId: '', originalFilename: '' })}
                      className="text-stone-400 hover:text-rose-600 text-xs px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Fallback image URL */}
                <input
                  type="url"
                  placeholder="Or paste custom direct image URL (Unsplash, CDN, etc.)"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-1.5 text-[11px] border border-stone-200 rounded-lg text-stone-600"
                />
              </div>

              {/* Metal Tabs Availability */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Metal Tabs Availability (Where this category appears in storefront slider)
                </label>
                <div className="flex flex-wrap items-center gap-4 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  {[
                    { id: 'gold', label: 'Gold Jewellery' },
                    { id: 'diamond', label: 'Diamond Jewellery' },
                    { id: 'silver', label: 'Silver Jewellery' },
                  ].map((m) => {
                    const isChecked = (formData.metals || ['gold', 'diamond', 'silver']).includes(m.id);
                    return (
                      <label key={m.id} className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const cur = formData.metals || ['gold', 'diamond', 'silver'];
                            const updated = e.target.checked
                              ? [...cur, m.id]
                              : cur.filter((x) => x !== m.id);
                            setFormData({ ...formData, metals: updated });
                          }}
                          className="w-4 h-4 text-[#8B1A1A] rounded border-stone-300 focus:ring-[#8B1A1A]"
                        />
                        <span>{m.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Order & Featured Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Display Order (Numeric)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-body font-semibold focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                  />
                  <span className="text-[10px] text-stone-400">Lower numbers appear first</span>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-[#8B1A1A] rounded border-stone-300 focus:ring-[#8B1A1A]"
                  />
                  <label htmlFor="featuredCheckbox" className="text-xs font-semibold text-stone-700 cursor-pointer">
                    Show in Homepage Category Slider
                  </label>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#8B1A1A] hover:bg-[#721515] rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCategories;

