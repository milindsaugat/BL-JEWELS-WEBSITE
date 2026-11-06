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
    color: String,
    karat: String,
    price: { type: Number, required: true },
    discountPrice: Number,
    stock: { type: Number, default: 0, min: 0 },
    sku: String,
    image: String,        // variant image URL
    isDefault: { type: Boolean, default: false },
  }],
  // ── Luxury Jewellery Specifications ──
  labelName: { type: String, default: '' },         // e.g. "Set 18Kt"
  branchLocation: { type: String, default: 'Agra, Uttar Pradesh' },
  groupName: { type: String, default: '' },         // e.g. "18Kt Gold Ornaments"
  varietyName: { type: String, default: '' },       // e.g. "TURK"
  netWeight: { type: Number, default: 0 },          // e.g. 17.090
  grossWeight: { type: Number, default: 0 },        // e.g. 17.09
  pieces: { type: Number, default: 1 },             // e.g. 3
  labourRate: { type: Number, default: 0 },         // e.g. 548.70
  labourPercent: { type: Number, default: 0 },      // e.g. 5.00
  todaysRate: { type: Number, default: 0 },         // e.g. 10974.00
  jewelType: { type: String, default: '' },         // e.g. "FLAT SET"
  categoryName: { type: String, default: '' },      // e.g. "Set"
  serviceablePincodes: [{ type: String }],          // e.g. ["110085", "110001", "282002"]
  studdedDetails: {
    styleName: { type: String, default: 'Other Charges [H]' },
    studSalesAmount: { type: Number, default: 0 },
    salesAmount: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
  },
  priceBreakup: {
    metalAmount: { type: Number, default: 0 },
    otherCharge: { type: Number, default: 0 },
    makingCharge: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  productType: { type: String, enum: ['single', 'combo'], default: 'single' },
  comboItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: String,
    quantity: { type: Number, min: 1, required: true },
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
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
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

