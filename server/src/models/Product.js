import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  shortDescription: {
    type: String,
    maxlength: 200,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  categorySlug: {
    type: String,
  },
  subcategory: {
    type: String,
  },
  tags: [{
    type: String,
    lowercase: true,
  }],
  metal: {
    type: {
      type: String,
      enum: ['gold', 'silver', 'platinum', 'diamond', 'mixed'],
      default: 'gold',
    },
    karat: {
      type: String,
      enum: ['14K', '18K', '22K', '24K', 'N/A'],
      default: '22K',
    },
    purity: {
      type: String,
      default: '916',
    },
    color: {
      type: String,
      enum: ['yellow', 'white', 'rose', 'mixed'],
      default: 'yellow',
    },
  },
  variants: [{
    label: String,        // e.g. "22K · 4.2g"
    weight: Number,       // grams
    size: String,         // ring size / length
    price: { type: Number, required: true },
    discountPrice: Number,
    stock: { type: Number, default: 10 },
    sku: String,
    isDefault: { type: Boolean, default: false },
  }],
  images: [{
    url: { type: String, required: true },
    publicId: String,
    alt: String,
    isPrimary: { type: Boolean, default: false },
  }],
  stone: {
    type: {
      type: String,
    },
    carats: Number,
    quality: String,
    color: String,
    clarity: String,
  },
  occasion: [String],        // e.g. ["wedding", "daily-wear", "gifting", "festive"]
  certifications: [String],  // e.g. ["BIS Hallmark", "GIA Certified"]
  careInstructions: {
    type: String,
    default: 'Store in an airtight velvet box. Keep away from harsh perfumes, water, and chemicals. Clean gently with a soft microfiber cloth.',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  ratings: {
    average: { type: Number, default: 4.8, min: 0, max: 5 },
    count: { type: Number, default: 12 },
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
}, { timestamps: true });

// Text search indexing
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;

