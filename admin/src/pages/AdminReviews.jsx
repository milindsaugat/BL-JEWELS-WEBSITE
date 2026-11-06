import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Star,
  Quote,
  UploadCloud,
  Loader2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles,
} from 'lucide-react';
import { reviewService, uploadService } from '../services/api';
import { toast } from 'sonner';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const [uploadingPatronImg, setUploadingPatronImg] = useState(false);
  const [uploadingJewelryImg, setUploadingJewelryImg] = useState(false);

  const [formData, setFormData] = useState({
    userName: '',
    location: 'India',
    rating: 5,
    title: '',
    comment: '',
    piece: '22K Hallmarked Gold Creation',
    userImage: '',
    image: '',
    isFeatured: true,
    verifiedPurchase: true,
  });

  const fetchReviews = async () => {
    try {
      const res = await reviewService.getAllReviews();
      if (res.reviews) {
        setReviews(res.reviews);
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenAdd = () => {
    setEditingReview(null);
    setFormData({
      userName: '',
      location: 'India',
      rating: 5,
      title: '',
      comment: '',
      piece: '22K Hallmarked Gold Creation',
      userImage: '',
      image: '',
      isFeatured: true,
      verifiedPurchase: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (rev) => {
    setEditingReview(rev);
    setFormData({
      userName: rev.userName || '',
      location: rev.location || 'India',
      rating: rev.rating || 5,
      title: rev.title || '',
      comment: rev.comment || '',
      piece: rev.piece || '22K Hallmarked Gold Creation',
      userImage: rev.userImage || '',
      image: rev.image || '',
      isFeatured: rev.isFeatured !== false,
      verifiedPurchase: rev.verifiedPurchase !== false,
    });
    setShowModal(true);
  };

  const handlePatronImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPatronImg(true);
    try {
      const res = await uploadService.uploadImage(file, 'bl-jewels/patrons');
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, userImage: res.url }));
      }
    } catch (err) {
      alert('Upload failed: ' + (err.message || 'Error'));
    } finally {
      setUploadingPatronImg(false);
    }
  };

  const handleJewelryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingJewelryImg(true);
    try {
      const res = await uploadService.uploadImage(file, 'bl-jewels/testimonials');
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
      }
    } catch (err) {
      alert('Upload failed: ' + (err.message || 'Error'));
    } finally {
      setUploadingJewelryImg(false);
    }
  };

  const handleToggleFeatured = async (rev) => {
    const newStatus = !rev.isFeatured;
    setReviews((prev) =>
      prev.map((r) => (r._id === rev._id ? { ...r, isFeatured: newStatus } : r))
    );
    try {
      await reviewService.updateReview(rev._id, { isFeatured: newStatus });
    } catch (err) {
      console.error('Failed to toggle featured review:', err);
      setReviews((prev) =>
        prev.map((r) => (r._id === rev._id ? { ...r, isFeatured: !newStatus } : r))
      );
      alert('Failed to update review status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patron reflection?')) return;
    try {
      await reviewService.deleteReview(id);
      fetchReviews();
    } catch {
      alert('Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanData = {
      ...formData,
      userName: formData.userName?.trim() || 'Valued Patron',
      location: formData.location?.trim() || 'India',
      title: formData.title?.trim() || 'Cherished Heirloom Experience',
      comment: formData.comment?.trim() || 'Exquisite BIS 916 craftsmanship and lifetime trust in BL Jewels.',
    };
    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview._id, cleanData);
        toast.success('Patron reflection updated successfully!');
        setEditingReview((prev) => ({ ...prev, ...cleanData }));
      } else {
        const res = await reviewService.createReview(cleanData);
        toast.success('Patron reflection created successfully!');
        const created = res?.review || res;
        if (created && created._id) {
          setEditingReview(created);
        }
      }
      fetchReviews();
    } catch (err) {
      toast.error('Failed to save reflection: ' + (err.response?.data?.message || err.message));
    }
  };

  const filtered = reviews.filter(
    (r) =>
      r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.piece?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">
            Patron Reflections (Testimonials)
          </h1>
          <p className="text-xs text-stone-500 font-body">
            Manage genuine patron testimonials, customer portraits, and worn jewelry showcase photos.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold font-body flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Reflection</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm max-w-md">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search by patron name, city, or jewelry piece..."
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
                <th className="p-4">Patron & Avatar</th>
                <th className="p-4">Reflection Title & Quote</th>
                <th className="p-4">Jewelry Piece & Image</th>
                <th className="p-4 text-center">Rating</th>
                <th className="p-4 text-center">Featured on Homepage</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((rev) => (
                <tr key={rev._id} className="hover:bg-stone-50 transition-colors">
                  
                  {/* Patron */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {rev.userImage ? (
                        <img
                          src={rev.userImage}
                          alt={rev.userName}
                          className="w-10 h-10 rounded-full object-cover border border-gold-300 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-100 border border-gold-300 flex items-center justify-center font-bold text-[#930303] text-xs shrink-0">
                          {(rev.userName || 'P').charAt(0)}
                        </div>
                      )}
                      <div>
                        <strong className="block text-stone-900 font-display text-sm">{rev.userName}</strong>
                        <span className="text-stone-400 text-[11px]">{rev.location || 'India'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Title & Comment */}
                  <td className="p-4 max-w-xs">
                    <strong className="block text-stone-800 text-xs font-semibold leading-snug">
                      "{rev.title}"
                    </strong>
                    <p className="text-stone-500 text-[11px] line-clamp-2 mt-0.5 font-body">
                      {rev.comment}
                    </p>
                  </td>

                  {/* Piece & Jewelry Image */}
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      {rev.image ? (
                        <img
                          src={rev.image}
                          alt={rev.piece}
                          className="w-12 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] text-stone-400 shrink-0">
                          No Img
                        </div>
                      )}
                      <span className="text-xs text-stone-700 font-medium truncate max-w-[140px] block">
                        {rev.piece || 'Creation'}
                      </span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-0.5 text-gold-500">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                      ))}
                    </div>
                  </td>

                  {/* Featured Toggle */}
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(rev)}
                      className={`p-2 rounded-xl border transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer ${
                        rev.isFeatured
                          ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs hover:bg-amber-100'
                          : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-amber-500 hover:border-amber-300'
                      }`}
                      title={rev.isFeatured ? 'Featured on Homepage (Click to hide)' : 'Click to Feature on Homepage'}
                    >
                      <Sparkles className={`w-4 h-4 ${rev.isFeatured ? 'fill-amber-400 text-amber-500' : 'text-stone-300'}`} />
                      <span className="text-[11px] font-semibold hidden md:inline">
                        {rev.isFeatured ? 'Featured' : 'Hidden'}
                      </span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(rev)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                        title="Edit Reflection"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rev._id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Reflection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Reflection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gold-300 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display text-xl font-bold text-[#930303]">
                {editingReview ? 'Edit Patron Reflection' : 'Publish New Patron Reflection'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-800 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-body">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Patron Name <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Radhika Mehra"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    City / Region <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Jewelry Piece Name <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maya Royal Kundan Choker Necklace"
                    value={formData.piece}
                    onChange={(e) => setFormData({ ...formData, piece: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Rating (Stars)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value={5}>5 Stars (★★★★★)</option>
                    <option value={4}>4 Stars (★★★★☆)</option>
                    <option value={3}>3 Stars (★★★☆☆)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Quote Headline <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Our bridal choker was the highlight of my wedding!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Testimonial Story <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Share the patron's authentic reflection and experience..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              {/* ── Two Image Uploaders: Patron Avatar + Worn Jewelry Piece ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* 1. Patron Photo Upload */}
                <div className="space-y-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="block font-bold text-stone-800 text-[11px]">
                    1. Patron Portrait / Avatar
                  </span>

                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gold-400/50 hover:border-[#930303] rounded-xl bg-white cursor-pointer transition-colors text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePatronImageUpload}
                      disabled={uploadingPatronImg}
                      className="hidden"
                    />
                    {uploadingPatronImg ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#930303]" />
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-gold-600 mb-1" />
                        <span className="text-[11px] font-semibold text-stone-700">Upload Customer Photo</span>
                      </>
                    )}
                  </label>

                  {formData.userImage && (
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={formData.userImage}
                        alt="Patron Preview"
                        className="w-10 h-10 rounded-full object-cover border border-stone-300 shrink-0"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold truncate">Uploaded ✓</span>
                    </div>
                  )}

                  <input
                    type="url"
                    placeholder="Or paste patron photo URL"
                    value={formData.userImage}
                    onChange={(e) => setFormData({ ...formData, userImage: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-[11px]"
                  />
                </div>

                {/* 2. Jewelry Creation Photo Upload */}
                <div className="space-y-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="block font-bold text-stone-800 text-[11px]">
                    2. Worn Jewelry / Piece Photo
                  </span>

                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gold-400/50 hover:border-[#930303] rounded-xl bg-white cursor-pointer transition-colors text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleJewelryImageUpload}
                      disabled={uploadingJewelryImg}
                      className="hidden"
                    />
                    {uploadingJewelryImg ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#930303]" />
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-gold-600 mb-1" />
                        <span className="text-[11px] font-semibold text-stone-700">Upload Jewelry Photo</span>
                      </>
                    )}
                  </label>

                  {formData.image && (
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={formData.image}
                        alt="Jewelry Preview"
                        className="w-12 h-10 rounded-lg object-cover border border-stone-300 shrink-0"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold truncate">Uploaded ✓</span>
                    </div>
                  )}

                  <input
                    type="url"
                    placeholder="Or paste jewelry photo URL"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-[11px]"
                  />
                </div>

              </div>

              {/* Feature Toggle */}
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 cursor-pointer hover:bg-amber-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 accent-amber-600"
                />
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${formData.isFeatured ? 'fill-amber-400 text-amber-500' : 'text-stone-400'}`} />
                  <div>
                    <span className="block text-xs font-bold text-stone-900">
                      Feature in "Patron Reflections" on Storefront
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Show in the homepage carousel slider.
                    </span>
                  </div>
                </div>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-stone-100 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                >
                  {editingReview ? 'Save Changes' : 'Publish Reflection'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReviews;

