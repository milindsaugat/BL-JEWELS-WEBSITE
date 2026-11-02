import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'global_site_settings',
  },
  brandName: {
    type: String,
    default: 'BL Jewels',
  },
  tagline: {
    type: String,
    default: 'Purity with Auspiciousness',
  },
  announcements: [{
    type: String,
  }],
  todayGoldRate: {
    rate22k: { type: String, default: '₹7,280/g' },
    rate24k: { type: String, default: '₹7,940/g' },
    rate18k: { type: String, default: '₹5,960/g' },
    silverRate: { type: String, default: '₹95/g' },
    lastUpdated: { type: Date, default: Date.now },
  },
  brandStory: {
    eyebrow: { type: String, default: 'Our Heritage & Philosophy' },
    title: { type: String, default: 'Where Auspicious Gold Meets Artisanal Royalty' },
    paragraph1: {
      type: String,
      default: 'Founded in the historic jewelry quarter of Zaveri Bazaar, Mumbai, BL Jewels was born from a singular sacred vow: Purity with Auspiciousness. We believe that fine jewelry is not merely an ornament — it is a blessing, a family heirloom, and a sacred celebration of love.',
    },
    paragraph2: {
      type: String,
      default: 'Every polki choker, auspicious mangalsutra, and solitaire ring is shaped by master karigars whose lineages have sculpted jewelry for generations. With 100% government BIS 916 hallmarking and transparent karat certifications, we guarantee that the beauty you wear today retains its auspicious value for generations to come.',
    },
    legacyYears: { type: String, default: '40+ YEARS LEGACY' },
    legacySubtitle: { type: String, default: 'Serving Indian royal families & connoisseurs since 1984' },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85',
    },
  },
  contact: {
    phone: { type: String, default: '+91 98765 43210' },
    email: { type: String, default: 'concierge@bljewels.com' },
    address: { type: String, default: 'BL Jewels Heritage Flagship, Zaveri Bazaar, Mumbai 400002' },
    whatsapp: { type: String, default: '+91 98765 43210' },
  },
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;

