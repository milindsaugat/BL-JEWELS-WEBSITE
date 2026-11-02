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
} from 'lucide-react';
import { bannerService, uploadService } from '../services/api';

export const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [formData, setFormData] = useState({
    isImageOnly: false,
    eyebrow: 'PURITY WITH AUSPICIOUSNESS • FESTIVE 2026',
    title: '',
    subtitle: '',
    image: '',
    cloudinaryPublicId: '',
    originalFilename: '',
    ctaText: 'Explore Collection',
    ctaLink: '/collections',
    secondaryCtaText: 'Our Heritage Story',
    secondaryCtaLink: '/about',
    badgeText: '100% BIS 916 Hallmark Purity',
    isActive: true,
  });

  const fetchBanners = async () => {
    try {
      const res = await bannerService.getAllBanners();
      if (res.banners) {
        setBanners(res.banners);
      }
    } catch (err) {
      console.error('Fetch admin banners error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);
    try {
      // Stream upload directly to Cloudinary folder bl-jewels/banners
      // The backend config enforces use_filename: true and unique_filename: false
      const res = await uploadService.uploadImage(file, 'bl-jewels/banners');
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

  const handleToggleActive = async (banner) => {
    try {
      await bannerService.updateBanner(banner._id, { isActive: !banner.isActive });
      fetchBanners();
    } catch {
      alert('Failed to update banner status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Hero Banner? Its associated image on Cloudinary will also be permanently deleted.')) return;
    try {
      await bannerService.deleteBanner(id);
      fetchBanners();
    } catch {
      alert('Failed to delete banner');
    }
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setUploadError(null);
    setFormData({
      isImageOnly: true, // Default to image-only for easy clean graphic upload
      title: '',
      subtitle: '',
      image: '',
      cloudinaryPublicId: '',
      originalFilename: '',
      ctaText: 'Explore Collection',
      ctaLink: '/collections',
      secondaryCtaText: '',
      secondaryCtaLink: '',
      badgeText: '100% BIS 916 Hallmark Purity',
      eyebrow: 'PURITY WITH AUSPICIOUSNESS • FESTIVE 2026',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setUploadError(null);
    setFormData({
      isImageOnly: banner.isImageOnly === true || banner.isImageOnly === 'true',
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      cloudinaryPublicId: banner.cloudinaryPublicId || '',
      originalFilename: banner.cloudinaryPublicId?.split('/')?.pop() || '',
      ctaText: banner.ctaText || 'Explore Collection',
      ctaLink: banner.ctaLink || '/collections',
      secondaryCtaText: banner.secondaryCtaText || '',
      secondaryCtaLink: banner.secondaryCtaLink || '',
      badgeText: banner.badgeText || '',
      eyebrow: banner.eyebrow || '',
      isActive: banner.isActive !== undefined ? banner.isActive : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      alert('Please upload a banner image via Cloudinary or enter an image URL.');
      return;
    }
    try {
      const submitPayload = {
        ...formData,
        title: formData.title?.trim() || (formData.isImageOnly ? 'Clickable Graphic Banner' : 'Hero Banner'),
        ctaLink: formData.ctaLink?.trim() || '/collections',
      };

      if (editingBanner) {
        await bannerService.updateBanner(editingBanner._id, submitPayload);
      } else {
        await bannerService.createBanner(submitPayload);
      }
      setShowModal(false);
      fetchBanners();
    } catch (err) {
      alert('Failed to save banner: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">
            Homepage Hero Banners & Slider CMS
          </h1>
          <p className="text-xs text-stone-500 font-body">
            Manage the full-width luxury banners rotating on the customer homepage hero section.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-crimson-700 hover:bg-crimson-800 text-white rounded-xl text-xs font-semibold font-body flex items-center gap-2 shadow-crimson transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hero Slide</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-stone-500">Loading hero slides...</div>
      ) : banners.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-stone-200">
          <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="font-display text-lg font-bold text-stone-800">No Hero Banners Configured</p>
          <button onClick={handleOpenAdd} className="mt-3 px-4 py-2 bg-crimson-700 text-white rounded-lg text-xs font-semibold">
            Create First Slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner, idx) => (
            <div
              key={banner._id || idx}
              className={`bg-white rounded-2xl overflow-hidden border shadow-sm flex flex-col justify-between transition-all ${
                banner.isActive ? 'border-gold-300/80 shadow-gold-sm' : 'border-stone-200 opacity-60'
              }`}
            >
              <div className="relative aspect-[16/8] bg-charcoal overflow-hidden group">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                {!banner.isImageOnly && (
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent" />
                )}
                
                <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider font-body ${
                    banner.isActive ? 'bg-emerald-600 text-white' : 'bg-stone-600 text-white'
                  }`}>
                    {banner.isActive ? 'Live on Store' : 'Inactive'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-body ${
                    banner.isImageOnly
                      ? 'bg-amber-100 text-[#8B1A1A] border border-[#C9A44A]/60'
                      : 'bg-black/60 text-gold-300'
                  }`}>
                    {banner.isImageOnly ? '🖼️ Only Banner (Clickable)' : '✍️ Text Overlay'}
                  </span>
                  <span className="bg-black/60 text-stone-300 text-[10px] px-2 py-0.5 rounded font-body">
                    Slide #{idx + 1}
                  </span>
                </div>

                {!banner.isImageOnly && (
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] text-gold-300 font-accent uppercase tracking-wider block font-semibold">
                      {banner.eyebrow}
                    </span>
                    <h3 className="font-display text-lg font-bold text-white truncate">
                      {banner.title}
                    </h3>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3 text-xs font-body">
                {banner.isImageOnly ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900">{banner.title || 'Clickable Banner'}</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Pure graphic banner without heading or paragraph text. Clicking anywhere on the banner navigates to link.
                    </p>
                  </div>
                ) : (
                  <p className="text-stone-600 line-clamp-2">
                    {banner.subtitle || 'No subtitle provided.'}
                  </p>
                )}

                <div className="flex items-center gap-4 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                  {banner.isImageOnly ? (
                    <span className="flex items-center gap-1.5 text-[#8B1A1A] font-semibold">
                      <span>🔗 Click Link:</span>
                      <span className="text-stone-700 font-mono font-normal">{banner.ctaLink || '/collections'}</span>
                    </span>
                  ) : (
                    <span><strong>Primary CTA:</strong> {banner.ctaText} ({banner.ctaLink})</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`flex items-center gap-1.5 text-xs font-semibold ${
                      banner.isActive ? 'text-emerald-700 hover:text-emerald-800' : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    {banner.isActive ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-stone-400" />}
                    <span>{banner.isActive ? 'Enabled' : 'Disabled'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(banner)}
                      className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                      title="Edit Slide"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gold-300 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display text-xl font-bold text-crimson-900">
                {editingBanner ? 'Edit Hero Slide' : 'Add New Hero Banner'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-charcoal text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-body">

              {/* 1. Banner Display Mode Selector */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <label className="block font-bold text-stone-800 text-xs">
                  Banner Style / Display Mode *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isImageOnly: true })}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      formData.isImageOnly
                        ? 'bg-[#8B1A1A]/10 border-[#8B1A1A] text-[#8B1A1A] ring-1 ring-[#8B1A1A]'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      formData.isImageOnly ? 'bg-[#8B1A1A] text-white' : 'bg-stone-100 text-stone-500'
                    }`}>
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-stone-900">
                        Only Banner (Clickable)
                      </span>
                      <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                        Pure graphic only. No heading, paragraph, or buttons. Entire banner is clickable to a link.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isImageOnly: false })}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      !formData.isImageOnly
                        ? 'bg-[#8B1A1A]/10 border-[#8B1A1A] text-[#8B1A1A] ring-1 ring-[#8B1A1A]'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      !formData.isImageOnly ? 'bg-[#8B1A1A] text-white' : 'bg-stone-100 text-stone-500'
                    }`}>
                      <Edit className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-stone-900">
                        Text Overlay Banner
                      </span>
                      <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                        Adds heading headline, subtitle description, and CTA action buttons over image.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Cloudinary Image Upload Section (Common for both modes) */}
              <div className="space-y-2">
                <label className="block font-semibold text-stone-700">
                  {formData.isImageOnly ? 'Upload Promotional Banner Graphic (Cloudinary Storage) *' : 'Hero Banner Background Image (Cloudinary Storage) *'}
                </label>

                {/* File picker button / dropzone */}
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
                          Click to select image file from computer
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
                  {formData.image && (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                      <img
                        src={formData.image}
                        alt="Banner Preview"
                        className="w-16 h-12 rounded-lg object-cover border border-stone-300 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Uploaded to Cloudinary</span>
                        </div>
                        <p className="text-[11px] text-stone-600 truncate font-mono mt-0.5">
                          {formData.originalFilename || formData.cloudinaryPublicId || 'Custom Asset'}
                        </p>
                        <a
                          href={formData.image}
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
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Fields for IMAGE ONLY Banner */}
              {formData.isImageOnly ? (
                <div className="space-y-3.5 p-4 bg-amber-50/40 rounded-2xl border border-[#C9A44A]/40 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8B1A1A]">
                    <i className="ri-cursor-line text-sm"></i>
                    <span>Banner Click Destination & Navigation</span>
                  </div>
                  
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Banner Click Destination Link <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="/collections/bridal-heritage (defaults to /collections)"
                      value={formData.ctaLink}
                      onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl font-mono text-stone-900"
                    />
                    
                    {/* Quick Link Selector Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-stone-500 font-medium">Quick links:</span>
                      {[
                        { label: 'All Collections', path: '/collections' },
                        { label: 'Bridal Heritage', path: '/collections/bridal-heritage' },
                        { label: 'Necklaces', path: '/collections/necklaces' },
                        { label: 'Rings', path: '/collections/rings' },
                        { label: 'Mangalsutras', path: '/collections/mangalsutra' },
                        { label: 'Live Rate', path: '/live-rate' },
                        { label: 'Contact', path: '/contact' },
                      ].map((link) => (
                        <button
                          key={link.path}
                          type="button"
                          onClick={() => setFormData({ ...formData, ctaLink: link.path })}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                            formData.ctaLink === link.path
                              ? 'bg-[#8B1A1A] text-white border-[#8B1A1A]'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Banner Reference Title (Admin reference only, not shown on website)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Festive Wedding Season Campaign Banner"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-800"
                    />
                  </div>
                </div>
              ) : (
                /* 4. Fields for TEXT OVERLAY Banner */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Eyebrow Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. ✦ PURITY WITH AUSPICIOUSNESS • BRIDAL TROUSSEAU"
                      value={formData.eyebrow}
                      onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Main Banner Headline <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Regal Rajputana & Kundan Bridal Sets"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Subtitle / Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief editorial copy explaining gold purity & craftsmanship..."
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Primary CTA Button Text</label>
                      <input
                        type="text"
                        value={formData.ctaText}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Primary CTA Link</label>
                      <input
                        type="text"
                        value={formData.ctaLink}
                        onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Secondary CTA Text</label>
                      <input
                        type="text"
                        value={formData.secondaryCtaText}
                        onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Secondary CTA Link</label>
                      <input
                        type="text"
                        value={formData.secondaryCtaLink}
                        onChange={(e) => setFormData({ ...formData, secondaryCtaLink: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Floating Trust Badge Text</label>
                    <input
                      type="text"
                      value={formData.badgeText}
                      onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="text-crimson-700 rounded"
                  />
                  <span>Publish & Show in Live Customer Hero Slider</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-stone-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-crimson-700 text-white rounded-xl text-xs font-semibold"
                >
                  {editingBanner ? 'Save Changes' : 'Add Hero Slide'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

