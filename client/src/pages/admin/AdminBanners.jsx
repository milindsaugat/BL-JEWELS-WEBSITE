import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, CheckCircle, XCircle, ArrowUpRight, Image as ImageIcon, Sparkles } from 'lucide-react';
import { bannerService } from '../../services/api';

export const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [formData, setFormData] = useState({
    eyebrow: 'PURITY WITH AUSPICIOUSNESS • FESTIVE 2026',
    title: '',
    subtitle: '',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=2000&q=90',
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

  const handleToggleActive = async (banner) => {
    try {
      await bannerService.updateBanner(banner._id, { isActive: !banner.isActive });
      fetchBanners();
    } catch {
      alert('Failed to update banner status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Hero Banner?')) return;
    try {
      await bannerService.deleteBanner(id);
      fetchBanners();
    } catch {
      alert('Failed to delete banner');
    }
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      eyebrow: 'PURITY WITH AUSPICIOUSNESS • FESTIVE 2026',
      title: '',
      subtitle: '',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=2000&q=90',
      ctaText: 'Explore Collection',
      ctaLink: '/collections',
      secondaryCtaText: 'Our Heritage Story',
      secondaryCtaLink: '/about',
      badgeText: '100% BIS 916 Hallmark Purity',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      eyebrow: banner.eyebrow || '',
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      ctaText: banner.ctaText || 'Explore Collection',
      ctaLink: banner.ctaLink || '/collections',
      secondaryCtaText: banner.secondaryCtaText || '',
      secondaryCtaLink: banner.secondaryCtaLink || '',
      badgeText: banner.badgeText || '',
      isActive: banner.isActive !== undefined ? banner.isActive : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner._id, formData);
      } else {
        await bannerService.createBanner(formData);
      }
      setShowModal(false);
      fetchBanners();
    } catch {
      alert('Failed to save banner');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Control Header */}
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

      {/* Banners List Grid */}
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
              {/* Image Preview with Overlay */}
              <div className="relative aspect-[16/8] bg-charcoal overflow-hidden group">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider font-body ${
                    banner.isActive ? 'bg-emerald-600 text-white' : 'bg-stone-600 text-white'
                  }`}>
                    {banner.isActive ? 'Live on Store' : 'Inactive'}
                  </span>
                  <span className="bg-black/60 text-gold-300 text-[10px] px-2 py-0.5 rounded font-body">
                    Slide #{idx + 1}
                  </span>
                </div>

                {/* Overlaid Title */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] text-gold-300 font-accent uppercase tracking-wider block font-semibold">
                    {banner.eyebrow}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white truncate">
                    {banner.title}
                  </h3>
                </div>
              </div>

              {/* Slide Details */}
              <div className="p-4 space-y-3 text-xs font-body">
                <p className="text-stone-600 line-clamp-2">
                  {banner.subtitle || 'No subtitle provided.'}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                  <span><strong>Primary CTA:</strong> {banner.ctaText} ({banner.ctaLink})</span>
                </div>

                {/* Actions */}
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

      {/* Add / Edit Banner Modal */}
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
                <label className="block font-semibold text-stone-700 mb-1">Main Banner Headline *</label>
                <input
                  type="text"
                  required
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

              <div>
                <label className="block font-semibold text-stone-700 mb-1">High-Resolution Background Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="text-crimson-700 rounded"
                  />
                  <span>Publish & Show in Live Homepage Hero Slider</span>
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
