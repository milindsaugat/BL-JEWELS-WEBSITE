import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  badge: {
    type: String,
    default: 'FESTIVE OFFER',
    trim: true,
  },
  subtitle: {
    type: String,
    default: '',
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: true,
    default: 15,
  },
  bannerImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
  },
  targetCategories: {
    type: [String],
    default: ['necklaces', 'choker-sets', 'bridal-heritage'],
  },
  targetProducts: {
    type: [String],
    default: [],
  },
  startDate: {
    type: Date,
    default: () => new Date(),
  },
  endDate: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 14 * 24 * 60 * 60 * 1000), // 14 days default
  },
  placement: {
    type: String,
    enum: ['section', 'popup', 'both'],
    default: 'both',
    index: true,
  },
  showHeroSectionSale: {
    type: Boolean,
    default: true,
  },
  showPopupModal: {
    type: Boolean,
    default: true,
  },
  popupDelaySeconds: {
    type: Number,
    default: 0,
  },
  ctaText: {
    type: String,
    default: 'Shop Festive Sale',
  },
  ctaLink: {
    type: String,
    default: '/collections/necklaces',
  },
  couponCode: {
    type: String,
    default: 'SHUBH10',
    trim: true,
    uppercase: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, { timestamps: true });

offerSchema.index({ isActive: 1, endDate: 1 });

const Offer = mongoose.models.Offer || mongoose.model('Offer', offerSchema);
export default Offer;

