import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Promotional Banner',
    trim: true,
  },
  isImageOnly: {
    type: Boolean,
    default: false,
  },
  subtitle: {
    type: String,
    default: '',
  },
  eyebrow: {
    type: String,
    default: 'PURITY WITH AUSPICIOUSNESS',
  },
  image: {
    type: String,
    required: [true, 'Banner image URL is required'],
  },
  cloudinaryPublicId: {
    type: String,
  },
  mobileImage: {
    type: String,
  },
  mobileCloudinaryPublicId: {
    type: String,
  },
  ctaText: {
    type: String,
    default: 'Explore Collection',
  },
  ctaLink: {
    type: String,
    default: '/collections',
  },
  secondaryCtaText: {
    type: String,
    default: 'Our Heritage Story',
  },
  secondaryCtaLink: {
    type: String,
    default: '/about',
  },
  badgeText: {
    type: String,
    default: 'BIS 916 Hallmarked Certified',
  },
  order: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
