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
  Sparkles,
  Search,
} from 'lucide-react';
import { occasionService, uploadService } from '../services/api';

export const AdminOccasions = () => {
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'Occasion',
    image: '',
    cloudinaryPublicId: '',
    originalFilename: '',
    link: '/collections',
    order: 1,
    isActive: true,
  });

  const fetchOccasions = async () => {
    try {
      setLoading(true);
      const res = await occasionService.getAllOccasions();
      if (res.occasions) {
        setOccasions(res.occasions);
      }
    } catch (err) {
      console.error('Fetch occasions error:', err);
      setActionError('Failed to load occasion cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccasions();
  }, []);

  const handleOpenAddModal = () => {
    setEditingOccasion(null);
    setUploadError(null);
    setActionError(null);
    setFormData({
      title: '',
      subtitle: '',
      badge: 'Occasion',
      image: '',
      cloudinaryPublicId: '',
      originalFilename: '',
      link: '/collections',
      order: occasions.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (occ) => {
    setEditingOccasion(occ);
    setUploadError(null);
    setActionError(null);
    setFormData({
      title: occ.title || '',
      subtitle: occ.subtitle || '',
      badge: occ.badge || 'Occasion',
      image: occ.image || '',
      cloudinaryPublicId: occ.cloudinaryPublicId || '',
      originalFilename: occ.originalFilename || '',
      link: occ.link || '/collections',
      order: occ.order ?? 0,
      isActive: occ.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);
    try {
      const res = await uploadService.uploadImage(file, 'bl-jewels/occasions');
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

    // Flexible fallback values: No field is strictly required
    const cleanData = {
      ...formData,
      title: formData.title?.trim() || (editingOccasion?.title || 'Special Occasion'),
      badge: formData.badge?.trim() || (formData.title?.trim() ? formData.title.trim().split(' ')[0] : 'Occasion'),
      link: formData.link?.trim() || '/collections',
      image: formData.image || (editingOccasion?.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80'),
    };

    setSaving(true);
    setActionError(null);
    try {
      if (editingOccasion) {
        await occasionService.updateOccasion(editingOccasion._id, cleanData);
        setActionSuccess(`Occasion card "${cleanData.title}" updated successfully`);
      } else {
        await occasionService.createOccasion(cleanData);
        setActionSuccess(`Occasion card "${cleanData.title}" created successfully`);
      }
      setShowModal(false);
      await fetchOccasions();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to save occasion card');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (occ) => {
    const confirmMsg = `Are you sure you want to delete "${occ.title}"?\nIts Cloudinary photo will also be removed automatically.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingId(occ._id);
      await occasionService.deleteOccasion(occ._id);
      setActionSuccess(`Occasion card "${occ.title}" deleted and asset purged`);
      await fetchOccasions();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete occasion card');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredOccasions = occasions.filter((o) =>
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* ── Top Header Banner ── */}
      <div className="bg-[#8B1A1A] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#C9A44A]/15 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F3E5AB] text-xs font-semibold uppercase tracking-wider mb-2 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              Occasion Wear CMS
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Occasion Collections
            </h1>
            <p className="text-stone-200 text-xs sm:text-sm mt-1 max-w-xl">
              Manage the 4 royal occasion cards shown on the customer storefront. Upload authentic photos of models wearing fine gold, diamond, festive, and bridal jewellery.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A44A] hover:bg-[#b08d3b] text-[#140D0F] font-bold text-xs rounded-xl shadow transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Occasion Card</span>
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

      {/* ── Visual Occasion Cards Grid Preview ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-stone-900">
            Live Storefront Cards ({occasions.filter(o => o.isActive).length} Active)
          </h2>
          <span className="text-xs text-stone-500">
            Rendered in "BL Jewels Royal World" section
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-stone-500 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#8B1A1A]" />
            <span>Loading occasions...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {occasions.map((occ) => (
              <div
                key={occ._id}
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border shadow-sm transition-all duration-300 bg-stone-900 flex flex-col justify-between ${
                  occ.isActive ? 'border-stone-200 hover:border-[#8B1A1A]' : 'opacity-60 border-dashed border-stone-300'
                }`}
              >
                {/* Background Model Image */}
                <img
                  src={occ.image}
                  alt={occ.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

                {/* Top Action Buttons & Badge */}
                <div className="relative z-10 p-3 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[#F3E5AB] font-accent text-[10px] uppercase font-bold tracking-wider border border-white/20">
                    {occ.badge}
                  </span>
                  
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/20">
                    <button
                      onClick={() => handleOpenEditModal(occ)}
                      className="p-1 text-white hover:text-[#F3E5AB] transition-colors"
                      title="Edit Card"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(occ)}
                      disabled={deletingId === occ._id}
                      className="p-1 text-stone-300 hover:text-rose-400 transition-colors"
                      title="Delete Card"
                    >
                      {deletingId === occ._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom Details */}
                <div className="relative z-10 p-4 text-white space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-300">
                    <span>Order #{occ.order}</span>
                    <span className={occ.isActive ? 'text-emerald-400 font-semibold' : 'text-stone-400'}>
                      {occ.isActive ? '● Live' : '○ Hidden'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">
                    {occ.title}
                  </h3>
                  <p className="text-xs text-stone-300 line-clamp-1">
                    {occ.subtitle}
                  </p>
                  <p className="text-[10px] text-stone-400 font-mono pt-1">
                    {occ.link}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="text-base font-bold text-stone-900">
                {editingOccasion ? `Edit Occasion: ${editingOccasion.title}` : 'Add New Occasion Card'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              
              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Occasion Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Bridal Heritage"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Badge Tag <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BRIDAL, FESTIVE, EVERYDAY"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Subtitle Description <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wedding Trousseau & Heirloom Sets"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                />
              </div>

              {/* Target Link */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Storefront Target URL Link <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. /collections?occasion=bridal (defaults to /collections)"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                />
              </div>

              {/* Model Image Upload to Cloudinary */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">
                  Model Wearing Occasion Jewellery (Cloudinary Storage) <span className="text-stone-400 font-normal">(Optional)</span>
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
                        Portrait 3:4 aspect ratio recommended • Cloudinary synced
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
                      alt="Occasion Preview"
                      className="w-12 h-16 rounded-lg object-cover border border-emerald-300 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-emerald-900 truncate">
                        {formData.originalFilename || 'Model Image'}
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

                {/* Direct Image URL input */}
                <input
                  type="url"
                  placeholder="Or paste direct image URL (Unsplash, CDN, etc.)"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-1.5 text-[11px] border border-stone-200 rounded-lg text-stone-600"
                />
              </div>

              {/* Order & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Display Order (Numeric)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-body font-semibold focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="activeCheckbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#8B1A1A] rounded border-stone-300 focus:ring-[#8B1A1A]"
                  />
                  <label htmlFor="activeCheckbox" className="text-xs font-semibold text-stone-700 cursor-pointer">
                    Show on Customer Storefront
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
                  <span>{editingOccasion ? 'Update Occasion' : 'Create Occasion'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOccasions;

