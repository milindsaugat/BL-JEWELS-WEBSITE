import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Star,
} from 'lucide-react';
import { productService, aiService, uploadService } from '../services/api';
import { formatCurrency } from '../lib/utils';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    categorySlug: 'necklaces',
    metalType: 'gold',
    karat: '22K',
    purity: '916',
    price: 185000,
    weight: 24.5,
    description: '',
    shortDescription: '',
    imageUrl: '',
    imagePublicId: '',
    originalFilename: '',
    isFeatured: true,
    isNewArrival: true,
  });

  const fetchProducts = async () => {
    try {
      const res = await productService.getProducts({});
      if (res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);
    try {
      const res = await uploadService.uploadImage(file, 'bl-jewels/products');
      if (res.success && res.url) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: res.url,
          imagePublicId: res.publicId,
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this jewelry piece? Its images on Cloudinary will also be permanently deleted.')) return;
    try {
      await productService.deleteProduct(id);
      fetchProducts();
    } catch {
      alert('Delete failed');
    }
  };

  const handleToggleFeatured = async (product) => {
    const newStatus = !product.isFeatured;
    // Optimistically update
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, isFeatured: newStatus } : p))
    );
    try {
      await productService.updateProduct(product._id, { isFeatured: newStatus });
    } catch (err) {
      console.error('Failed to toggle bestseller star:', err);
      // Revert on error
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isFeatured: !newStatus } : p))
      );
      alert('Failed to update bestseller status');
    }
  };

  const handleToggleNewArrival = async (product) => {
    const newStatus = !product.isNewArrival;
    // Optimistically update
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, isNewArrival: newStatus } : p))
    );
    try {
      await productService.updateProduct(product._id, { isNewArrival: newStatus });
    } catch (err) {
      console.error('Failed to toggle new arrival status:', err);
      // Revert on error
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isNewArrival: !newStatus } : p))
      );
      alert('Failed to update new arrival status');
    }
  };

  const handleAIGenerateCopy = async () => {
    if (!formData.name) {
      alert('Please enter a product name first.');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const res = await aiService.generateDescription({
        name: formData.name,
        metal: formData.metalType,
        karat: formData.karat,
      });

      if (res.success && res.data) {
        setFormData(prev => ({
          ...prev,
          description: res.data.longDescription,
          shortDescription: res.data.shortDescription,
        }));
      }
    } catch {
      setFormData(prev => ({
        ...prev,
        description: `Handcrafted in certified ${formData.karat} BIS ${formData.purity} Hallmarked gold. Features authentic master karigar detailing, timeless symmetry, and guaranteed buyback.`,
        shortDescription: `BIS 916 certified ${formData.karat} gold ${formData.name}.`,
      }));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert('Please upload a product image via Cloudinary or enter an image URL.');
      return;
    }
    try {
      const payload = {
        name: formData.name,
        categorySlug: formData.categorySlug,
        description: formData.description || `Exquisite ${formData.karat} Hallmarked gold jewelry.`,
        shortDescription: formData.shortDescription || `${formData.karat} gold jewelry`,
        metal: {
          type: formData.metalType,
          karat: formData.karat,
          purity: formData.purity,
          color: 'yellow',
        },
        variants: [
          {
            label: `${formData.karat} · ${formData.weight}g`,
            weight: Number(formData.weight),
            price: Number(formData.price),
            stock: 8,
            isDefault: true,
          }
        ],
        images: [{ url: formData.imageUrl, publicId: formData.imagePublicId, alt: formData.name, isPrimary: true }],
        certifications: ['BIS 916 Hallmark'],
        isFeatured: Boolean(formData.isFeatured),
        isNewArrival: Boolean(formData.isNewArrival),
      };

      await productService.createProduct(payload);
      setShowAddModal(false);
      fetchProducts();
    } catch (err) {
      alert('Failed to publish product: ' + (err.response?.data?.message || err.message));
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categorySlug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">
            Jewelry Catalog Management
          </h1>
          <p className="text-xs text-stone-500 font-body">
            Manage your fine jewelry pieces, stock variants, purity stamps, and pricing.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-crimson-700 hover:bg-crimson-800 text-white rounded-xl text-xs font-semibold font-body flex items-center gap-2 shadow-crimson transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Creation</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm max-w-md">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search by piece title or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs text-stone-900 placeholder-stone-400 focus:outline-none font-body"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-[#FAF7F2] border-b border-stone-200 text-stone-600 uppercase font-semibold">
              <tr>
                <th className="p-4">Piece</th>
                <th className="p-4">Category</th>
                <th className="p-4">Purity & Karat</th>
                <th className="p-4">Gross Weight</th>
                <th className="p-4">Price</th>
                <th className="p-4">Certifications</th>
                <th className="p-4 text-center">Bestseller Star</th>
                <th className="p-4 text-center">New Arrival</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((p) => {
                const variant = p.variants?.[0] || {};
                return (
                  <tr key={p._id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.url || p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gold-300 shrink-0"
                      />
                      <div>
                        <strong className="block text-stone-900 font-display text-sm">{p.name}</strong>
                        <span className="text-stone-400 text-[11px]">SKU: {variant.sku || p.sku || 'BLJ-CUSTOM'}</span>
                      </div>
                    </td>
                    <td className="p-4 capitalize text-stone-600">{p.categorySlug}</td>
                    <td className="p-4 font-accent font-bold text-gold-800">
                      {p.metal?.karat || '22K'} ({p.metal?.purity || '916'})
                    </td>
                    <td className="p-4 font-semibold text-stone-700">{variant.weight || '—'}g</td>
                    <td className="p-4 font-accent font-bold text-crimson-700 text-sm">
                      ₹{formatCurrency(variant.discountPrice || variant.price)}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        BIS 916
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(p)}
                        className={`p-2 rounded-xl border transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer ${
                          p.isFeatured
                            ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs hover:bg-amber-100'
                            : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-amber-500 hover:border-amber-300'
                        }`}
                        title={p.isFeatured ? 'Starred as Bestseller (Click to remove from homepage)' : 'Click to Star as Bestseller (Show on homepage)'}
                      >
                        <Star className={`w-4 h-4 transition-transform active:scale-125 ${p.isFeatured ? 'fill-amber-400 text-amber-500' : 'text-stone-300'}`} />
                        <span className="text-[11px] font-semibold hidden md:inline">
                          {p.isFeatured ? 'Starred' : 'Star'}
                        </span>
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleNewArrival(p)}
                        className={`p-2 rounded-xl border transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer ${
                          p.isNewArrival
                            ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs hover:bg-rose-100'
                            : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-rose-500 hover:border-rose-300'
                        }`}
                        title={p.isNewArrival ? 'Marked as New Arrival (Click to remove from new arrivals)' : 'Click to Mark as New Arrival (Show in Fresh from the Atelier)'}
                      >
                        <Sparkles className={`w-4 h-4 transition-transform active:scale-125 ${p.isNewArrival ? 'fill-rose-500 text-rose-600' : 'text-stone-300'}`} />
                        <span className="text-[11px] font-semibold hidden md:inline">
                          {p.isNewArrival ? 'New' : 'Standard'}
                        </span>
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Piece"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gold-300 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display text-xl font-bold text-crimson-900">
                Publish New Fine Jewelry Creation
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-charcoal text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-body">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Creation Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navratna Polki Jadau Haram"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="necklaces">Necklaces</option>
                    <option value="rings">Rings</option>
                    <option value="earrings">Earrings</option>
                    <option value="bangles-bracelets">Bangles & Bracelets</option>
                    <option value="mangalsutra">Mangalsutras</option>
                    <option value="bridal-heritage">Bridal Heritage</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Gold Karat</label>
                  <select
                    value={formData.karat}
                    onChange={(e) => setFormData({ ...formData, karat: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="22K">22K (916 Purity)</option>
                    <option value="18K">18K (750 Purity)</option>
                    <option value="14K">14K (585 Purity)</option>
                    <option value="24K">24K (999 Purity)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Gross Weight (grams) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Cloudinary Image Upload Section */}
              <div className="space-y-2">
                <label className="block font-semibold text-stone-700">
                  Product Image (Cloudinary Storage) *
                </label>

                <div className="flex flex-col gap-2">
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#C9A44A]/50 hover:border-[#8B1A1A] rounded-2xl bg-amber-50/30 hover:bg-amber-50/60 cursor-pointer transition-colors group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#8B1A1A]">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Uploading directly to Cloudinary (preserving filename)...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <UploadCloud className="w-7 h-7 text-[#C9A44A] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-stone-800">
                          Click to select jewelry photo from computer
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Original filename is preserved on Cloudinary • JPEG, PNG, WEBP, AVIF
                        </span>
                      </div>
                    )}
                  </label>

                  {uploadError && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      ⚠️ {uploadError}
                    </p>
                  )}

                  {/* Uploaded File Confirmation & Live Preview */}
                  {formData.imageUrl && (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                      <img
                        src={formData.imageUrl}
                        alt="Product Preview"
                        className="w-16 h-16 rounded-lg object-cover border border-stone-300 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Uploaded to Cloudinary</span>
                        </div>
                        <p className="text-[11px] text-stone-600 truncate font-mono mt-0.5">
                          {formData.originalFilename || formData.imagePublicId || 'Custom Asset'}
                        </p>
                        <a
                          href={formData.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#8B1A1A] hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <span>View on Cloudinary CDN</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Or Manual URL Fallback Input */}
                  <div className="pt-1">
                    <span className="text-[11px] text-stone-400 block mb-1">Or paste custom image URL:</span>
                    <input
                      type="url"
                      placeholder="https://res.cloudinary.com/uuhuaten/..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-gold-300 flex items-center justify-between">
                <span className="text-xs text-stone-700 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  Auto-generate editorial luxury description with AI
                </span>
                <button
                  type="button"
                  onClick={handleAIGenerateCopy}
                  disabled={isGeneratingAI}
                  className="px-3 py-1 bg-crimson-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {isGeneratingAI ? 'Generating...' : '✨ Generate Copy'}
                </button>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              {/* Bestseller Star Feature Toggle */}
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 cursor-pointer hover:bg-amber-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 accent-amber-600"
                />
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${formData.isFeatured ? 'fill-amber-400 text-amber-500' : 'text-stone-400'}`} />
                  <div>
                    <span className="block text-xs font-bold text-stone-900">
                      Feature in "Bestselling Creations" on Storefront
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Starred items are prominently displayed on the homepage showcase.
                    </span>
                  </div>
                </div>
              </label>

              {/* New Arrival Feature Toggle */}
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 cursor-pointer hover:bg-rose-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300 accent-rose-600"
                />
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${formData.isNewArrival ? 'fill-rose-500 text-rose-600' : 'text-stone-400'}`} />
                  <div>
                    <span className="block text-xs font-bold text-stone-900">
                      Feature in "New Arrivals" on Storefront
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Marked pieces appear in the Fresh Heirloom Arrivals carousel.
                    </span>
                  </div>
                </div>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 bg-stone-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-crimson-700 text-white rounded-xl text-xs font-semibold"
                >
                  Publish Creation
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

