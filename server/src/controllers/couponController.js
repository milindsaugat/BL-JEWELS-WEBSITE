import { memoryStore } from '../config/memoryStore.js';
import Coupon from '../models/Coupon.js';
import { getDbStatus } from '../config/db.js';

export const DEFAULT_COUPONS = [
  {
    _id: 'coup_shubh10',
    code: 'SHUBH10',
    title: 'Auspicious Festive 10% Off',
    description: 'Get 10% instant discount up to ₹15,000 on hallmark gold & bridal jewelry.',
    discountType: 'percentage',
    value: 10,
    minOrderValue: 20000,
    maxDiscount: 15000,
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 500,
    usedCount: 14,
    isPublic: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'coup_welcome5',
    code: 'WELCOME5',
    title: 'Royal Welcome Privilege',
    description: 'Special 5% privilege discount up to ₹5,000 on your first jewelry acquisition.',
    discountType: 'percentage',
    value: 5,
    minOrderValue: 10000,
    maxDiscount: 5000,
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 1000,
    usedCount: 28,
    isPublic: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'coup_festive2500',
    code: 'FESTIVE2500',
    title: 'Grand Festive ₹2,500 Off',
    description: 'Enjoy flat ₹2,500 off on bridal sets & heirloom collections above ₹50,000.',
    discountType: 'flat',
    value: 2500,
    minOrderValue: 50000,
    maxDiscount: 2500,
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 250,
    usedCount: 9,
    isPublic: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'coup_bridal5000',
    code: 'BRIDAL5000',
    title: 'Heritage Bridal Bespoke Offer',
    description: 'Flat ₹5,000 luxury rebate on royal bridal trousseau purchases above ₹1,00,000.',
    discountType: 'flat',
    value: 5000,
    minOrderValue: 100000,
    maxDiscount: 5000,
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 100,
    usedCount: 5,
    isPublic: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Ensure initial memory store seed
const ensureMemorySeed = () => {
  if (!Array.isArray(memoryStore.coupons) || memoryStore.coupons.length === 0) {
    memoryStore.coupons = [...DEFAULT_COUPONS];
  }
};

// Seed MongoDB if empty and connected
const ensureMongoSeed = async () => {
  try {
    if (getDbStatus()) {
      const count = await Coupon.countDocuments();
      if (count === 0) {
        await Coupon.insertMany(DEFAULT_COUPONS.map(c => {
          const { _id, ...rest } = c;
          return rest;
        }));
        console.log('✦ Seeded initial auspicious coupons into MongoDB Atlas');
      }
    }
  } catch (err) {
    console.warn('Coupon seed note:', err.message);
  }
};

// Seed on module evaluation
ensureMemorySeed();
ensureMongoSeed().catch(() => {});

/**
 * GET /api/v1/coupons/public
 * Returns active, public, non-expired coupons for storefront discovery (CartDrawer & Checkout)
 */
export const getPublicCoupons = async (req, res) => {
  try {
    const now = new Date();
    ensureMemorySeed();

    if (getDbStatus()) {
      const coupons = await Coupon.find({
        isActive: true,
        isPublic: { $ne: false },
        validUntil: { $gt: now },
      })
        .select('code title description discountType value minOrderValue maxDiscount validUntil')
        .sort({ minOrderValue: 1 })
        .lean();

      if (coupons && coupons.length > 0) {
        return res.json({ success: true, count: coupons.length, coupons });
      }
    }

    // Memory fallback
    const publicCoupons = memoryStore.coupons
      .filter(c => c.isActive && c.isPublic !== false && new Date(c.validUntil || c.expiresAt) > now)
      .map(c => ({
        _id: c._id,
        code: c.code,
        title: c.title || c.code,
        description: c.description || '',
        discountType: c.discountType,
        value: c.value,
        minOrderValue: c.minOrderValue,
        maxDiscount: c.maxDiscount,
        validUntil: c.validUntil || c.expiresAt,
      }))
      .sort((a, b) => a.minOrderValue - b.minOrderValue);

    return res.json({ success: true, count: publicCoupons.length, coupons: publicCoupons });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Unified coupon validation calculation logic
 */
export const calculateCouponDiscount = async (rawCode, rawCartTotal) => {
  if (!rawCode || typeof rawCode !== 'string') {
    return { valid: false, message: 'Please provide a promo code to apply.' };
  }

  const code = rawCode.trim().toUpperCase();
  const cartTotal = Math.max(0, Number(rawCartTotal) || 0);
  const now = new Date();

  ensureMemorySeed();

  let coupon = null;

  if (getDbStatus()) {
    coupon = await Coupon.findOne({ code }).lean();
  }

  if (!coupon) {
    coupon = memoryStore.coupons.find(c => c.code.toUpperCase() === code);
  }

  if (!coupon) {
    return {
      valid: false,
      message: `Promo code "${code}" is not recognized. Try SHUBH10 or WELCOME5.`,
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      message: `Coupon code "${code}" is currently disabled or expired.`,
    };
  }

  const expiryDate = new Date(coupon.validUntil || coupon.expiresAt);
  if (expiryDate <= now) {
    return {
      valid: false,
      message: `Coupon code "${code}" expired on ${expiryDate.toLocaleDateString('en-IN')}.`,
    };
  }

  if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
    return {
      valid: false,
      message: `Coupon code "${code}" has reached its maximum total redemption limit.`,
    };
  }

  if (cartTotal < (coupon.minOrderValue || 0)) {
    const shortfall = coupon.minOrderValue - cartTotal;
    return {
      valid: false,
      shortfall,
      minOrderValue: coupon.minOrderValue,
      message: `Add ₹${shortfall.toLocaleString('en-IN')} more to unlock ${code} (Min cart total ₹${coupon.minOrderValue.toLocaleString('en-IN')}).`,
    };
  }

  let calculatedDiscount = 0;
  if (coupon.discountType === 'percentage') {
    const rawDiscount = (cartTotal * coupon.value) / 100;
    // Only cap if maxDiscount is specified and > 0. Otherwise uncapped pure percentage!
    calculatedDiscount = (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined && Number(coupon.maxDiscount) > 0)
      ? Math.min(rawDiscount, Number(coupon.maxDiscount))
      : rawDiscount;
  } else {
    // Flat cash discount
    calculatedDiscount = Math.min(coupon.value, cartTotal);
  }

  calculatedDiscount = Math.round(calculatedDiscount);

  return {
    valid: true,
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      title: coupon.title || coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      value: coupon.value,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount,
      calculatedDiscount,
      savings: calculatedDiscount,
    },
    message: `Auspicious savings of ₹${calculatedDiscount.toLocaleString('en-IN')} applied with ${coupon.code}!`,
  };
};

/**
 * POST /api/v1/coupons/validate
 * Validates coupon and calculates discount
 */
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal = 0 } = req.body;
    const result = await calculateCouponDiscount(code, cartTotal);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: result.message,
        shortfall: result.shortfall,
        minOrderValue: result.minOrderValue,
      });
    }

    return res.json({
      success: true,
      valid: true,
      coupon: result.coupon,
      message: result.message,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/coupons (Admin listing)
 */
export const getCoupons = async (req, res) => {
  try {
    ensureMemorySeed();

    if (getDbStatus()) {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: coupons.length, coupons });
    }

    return res.json({ success: true, count: memoryStore.coupons.length, coupons: memoryStore.coupons });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/v1/coupons (Admin create coupon)
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      value,
      minOrderValue,
      maxDiscount,
      validUntil,
      expiresAt,
      usageLimit,
      isPublic,
      isActive,
    } = req.body;

    if (!code || value === undefined) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const expiry = validUntil || expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const isPercentage = (discountType || 'percentage') === 'percentage';
    const hasMaxDiscount = isPercentage &&
      maxDiscount !== undefined &&
      maxDiscount !== null &&
      maxDiscount !== '' &&
      Number(maxDiscount) > 0;

    const newCouponData = {
      code: cleanCode,
      title: title ? title.trim() : cleanCode,
      description: description ? description.trim() : '',
      discountType: discountType || 'percentage',
      value: Number(value),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: hasMaxDiscount ? Number(maxDiscount) : null,
      validUntil: expiry,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usedCount: 0,
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    if (getDbStatus()) {
      const existing = await Coupon.findOne({ code: cleanCode });
      if (existing) {
        return res.status(400).json({ success: false, message: `Coupon with code "${cleanCode}" already exists.` });
      }

      const created = await Coupon.create(newCouponData);
      return res.status(201).json({ success: true, coupon: created });
    }

    // Memory store
    ensureMemorySeed();
    const existingIndex = memoryStore.coupons.findIndex(c => c.code.toUpperCase() === cleanCode);
    if (existingIndex > -1) {
      return res.status(400).json({ success: false, message: `Coupon with code "${cleanCode}" already exists.` });
    }

    const memoryCoupon = {
      _id: `coup_${Date.now()}`,
      ...newCouponData,
      createdAt: new Date().toISOString(),
    };

    memoryStore.coupons.unshift(memoryCoupon);
    return res.status(201).json({ success: true, coupon: memoryCoupon });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/v1/coupons/:id (Admin update / toggle active)
 */
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.code) {
      updates.code = updates.code.trim().toUpperCase();
    }
    if (updates.expiresAt && !updates.validUntil) {
      updates.validUntil = updates.expiresAt;
    }
    if (updates.discountType === 'flat') {
      updates.maxDiscount = null;
    } else if (updates.maxDiscount !== undefined) {
      if (updates.maxDiscount === '' || updates.maxDiscount === null || Number(updates.maxDiscount) <= 0) {
        updates.maxDiscount = null;
      } else {
        updates.maxDiscount = Number(updates.maxDiscount);
      }
    }

    if (getDbStatus()) {
      const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { code: id.toUpperCase() };
      const updated = await Coupon.findOneAndUpdate(query, updates, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Coupon not found.' });
      }
      return res.json({ success: true, coupon: updated });
    }

    ensureMemorySeed();
    const index = memoryStore.coupons.findIndex(c => c._id === id || c.code.toUpperCase() === id.toUpperCase());
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    memoryStore.coupons[index] = {
      ...memoryStore.coupons[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return res.json({ success: true, coupon: memoryStore.coupons[index] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/v1/coupons/:id (Admin delete coupon)
 */
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { code: id.toUpperCase() };
      await Coupon.findOneAndDelete(query);
      return res.json({ success: true, message: 'Coupon deleted successfully.' });
    }

    ensureMemorySeed();
    const prevLength = memoryStore.coupons.length;
    memoryStore.coupons = memoryStore.coupons.filter(
      c => c._id !== id && c.code.toUpperCase() !== id.toUpperCase()
    );

    if (memoryStore.coupons.length === prevLength) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    return res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
