import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  title: {
    type: String,
    default: '',
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    default: 'percentage',
  },
  value: {
    type: Number,
    required: true,
  },
  minOrderValue: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: null, // null means unlimited / uncapped for percentage, and not applicable for flat cash
  },
  validUntil: {
    type: Date,
    default: () => new Date(+new Date() + 90 * 24 * 60 * 60 * 1000), // 90 days default
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, { timestamps: true });

// Compound index for instant concurrent public coupon lookups
couponSchema.index({ isActive: 1, isPublic: 1, validUntil: 1 });

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
export default Coupon;
