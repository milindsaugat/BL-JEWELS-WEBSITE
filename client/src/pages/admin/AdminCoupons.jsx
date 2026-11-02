import React, { useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([
    {
      code: 'SHUBH10',
      discountType: 'percentage',
      value: 10,
      minOrderValue: 20000,
      maxDiscount: 15000,
      isActive: true,
    },
    {
      code: 'WELCOME5',
      discountType: 'percentage',
      value: 5,
      minOrderValue: 10000,
      maxDiscount: 5000,
      isActive: true,
    },
    {
      code: 'FESTIVE2500',
      discountType: 'flat',
      value: 2500,
      minOrderValue: 50000,
      maxDiscount: 2500,
      isActive: true,
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    value: 10,
    minOrderValue: 25000,
    maxDiscount: 10000,
  });

  const handleAddCoupon = (e) => {
    e.preventDefault();
    setCoupons([
      ...coupons,
      {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        value: Number(formData.value),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscount: Number(formData.maxDiscount),
        isActive: true,
      }
    ]);
    setShowAddModal(false);
  };

  const handleDelete = (code) => {
    setCoupons(coupons.filter(c => c.code !== code));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">
            Promotional Coupons & Festival Offers
          </h1>
          <p className="text-xs text-stone-500 font-body">
            Create and manage promotional discount codes for festival celebrations and welcome gifts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-crimson-700 hover:bg-crimson-800 text-white rounded-xl text-xs font-semibold font-body flex items-center gap-2 shadow-crimson transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.code}
            className="bg-white rounded-2xl p-6 border border-gold-300 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-accent text-lg font-bold text-crimson-700 tracking-wider">
                  {c.code}
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-pill uppercase">
                  Active
                </span>
              </div>

              <p className="font-body text-xs text-stone-600">
                {c.discountType === 'percentage'
                  ? `Get ${c.value}% off up to ₹${formatCurrency(c.maxDiscount)}`
                  : `Flat ₹${formatCurrency(c.value)} off`}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-body">
              <span>Min Cart: ₹{formatCurrency(c.minOrderValue)}</span>
              <button
                onClick={() => handleDelete(c.code)}
                className="text-stone-400 hover:text-red-600 transition-colors p-1"
                title="Delete Coupon"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gold-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display text-xl font-bold text-crimson-900">
                Create Auspicious Coupon
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-charcoal text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCoupon} className="space-y-4 text-xs font-body">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

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
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
