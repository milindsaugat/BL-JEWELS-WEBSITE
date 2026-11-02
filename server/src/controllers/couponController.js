import { memoryStore } from '../config/memoryStore.js';
import Coupon from '../models/Coupon.js';

export const getCoupons = async (req, res) => {
  try {
    if (process.env.MONGODB_URI) {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return res.json({ success: true, coupons });
    }
    return res.json({ success: true, coupons: memoryStore.coupons });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, value, minOrderValue, maxDiscount, expiresAt, isActive } = req.body;
    if (!code || !value) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required' });
    }

    const newCoupon = {
      _id: `coup_${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType: discountType || 'percentage',
      value: Number(value),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: Number(maxDiscount) || 10000,
      expiresAt: expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
    };

    if (process.env.MONGODB_URI) {
      const created = await Coupon.create(newCoupon);
      return res.status(201).json({ success: true, coupon: created });
    }

    memoryStore.coupons.unshift(newCoupon);
    return res.status(201).json({ success: true, coupon: newCoupon });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (process.env.MONGODB_URI) {
      const updated = await Coupon.findByIdAndUpdate(id, updates, { new: true });
      return res.json({ success: true, coupon: updated });
    }

    const index = memoryStore.coupons.findIndex(c => c._id === id || c.code === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    memoryStore.coupons[index] = { ...memoryStore.coupons[index], ...updates };
    return res.json({ success: true, coupon: memoryStore.coupons[index] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (process.env.MONGODB_URI) {
      await Coupon.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Coupon deleted successfully' });
    }

    const prevLength = memoryStore.coupons.length;
    memoryStore.coupons = memoryStore.coupons.filter(c => c._id !== id && c.code !== id);

    if (memoryStore.coupons.length === prevLength) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    return res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

