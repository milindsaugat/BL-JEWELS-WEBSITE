import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, Percent, Sparkles, Copy, Check, Edit } from 'lucide-react';
import { couponService } from '../../services/api';
import { toast } from 'sonner';

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    value: 10,
    minOrderValue: 25000,
    maxDiscount: 10000,
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      const res = await couponService.getCoupons();
      if (res.coupons) {
        setCoupons(res.coupons);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (coupon) => {
    try {
      await couponService.updateCoupon(coupon._id || coupon.code, {
        isActive: !coupon.isActive,
      });
      fetchCoupons();
    } catch {
      alert('Failed to update coupon status');
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${coupon.code}"?`)) return;
    try {
      await couponService.deleteCoupon(coupon._id || coupon.code);
      fetchCoupons();
    } catch {
      alert('Failed to delete coupon');
    }
  };

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      value: 10,
      minOrderValue: 25000,
      maxDiscount: 10000,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code || '',
      discountType: c.discountType || 'percentage',
      value: c.value || 0,
      minOrderValue: c.minOrderValue || 0,
      maxDiscount: c.maxDiscount || 0,
      isActive: c.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon._id || editingCoupon.code, formData);
        toast.success(`Coupon code "${formData.code}" updated successfully!`);
        setEditingCoupon((prev) => ({ ...prev, ...formData }));
      } else {
        const res = await couponService.createCoupon(formData);
        toast.success(`Coupon code "${formData.code}" created successfully!`);
        const created = res?.coupon || res;
        if (created && (created._id || created.code)) {
          setEditingCoupon(created);
        }
      }
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to save coupon: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900">
            Auspicious Promotions & Coupon Codes
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Configure festive discount codes, auspicious savings, and seasonal wedding incentives.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold shadow-gold flex items-center gap-2 border border-gold-400/50 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-gold-300" />
          <span>Create New Promo Code</span>
        </button>
      </div>

      {/* Coupons List Grid */}
      {loading ? (
        <div className="p-12 text-center text-stone-500 text-sm">Loading auspicious coupons...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((coupon, idx) => (
            <div
              key={coupon._id || idx}
              className={`bg-white rounded-2xl border p-5 space-y-4 shadow-sm relative transition-all ${
                coupon.isActive ? 'border-gold-300/80 shadow-gold-sm' : 'border-stone-200 opacity-75'
              }`}
            >
              
              {/* Header inside card */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-300 flex items-center justify-center text-[#930303]">
                    <Tag className="w-5 h-5 text-[#930303]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm tracking-wider text-stone-900">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className="text-stone-400 hover:text-stone-700 p-1"
                        title="Copy coupon code"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gold-700 tracking-wider">
                      {coupon.discountType === 'percentage' ? `${coupon.value}% Discount` : `₹${coupon.value.toLocaleString('en-IN')} Flat Off`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActive(coupon)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors ${
                    coupon.isActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-stone-100 text-stone-500 border border-stone-200'
                  }`}
                >
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Conditions / Details */}
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-stone-200 text-xs space-y-1.5 text-stone-600">
                <div className="flex justify-between">
                  <span>Minimum Cart Value:</span>
                  <span className="font-semibold text-stone-800">
                    ₹{(coupon.minOrderValue || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum Discount Cap:</span>
                  <span className="font-semibold text-[#930303]">
                    ₹{(coupon.maxDiscount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                <span className="text-[11px] text-stone-400 font-medium">
                  {coupon.isActive ? '✦ Live in Store Checkout' : 'Paused'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(coupon)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                    title="Edit Coupon"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-accent uppercase tracking-widest text-gold-600 font-bold block">
                  BL Jewels • Promotion Engine
                </span>
                <h3 className="font-heading text-lg font-bold text-stone-900">
                  {editingCoupon ? 'Edit Promotional Code' : 'Create Promotional Code'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-body">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI15, BRIDAL2026"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-bold focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-gold-400"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash Off (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    {formData.discountType === 'percentage' ? 'Percentage Value (%)' : 'Flat Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Min. Order Value (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="500"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCoupon"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-[#930303] focus:ring-[#930303]"
                />
                <label htmlFor="isActiveCoupon" className="text-stone-700 font-semibold text-xs">
                  Activate coupon immediately for online shoppers
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl font-semibold shadow-gold border border-gold-400/50"
                >
                  {editingCoupon ? 'Update Promo Code' : 'Save & Publish Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

