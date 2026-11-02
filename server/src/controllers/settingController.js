import { getDbStatus } from '../config/db.js';
import Setting from '../models/Setting.js';

const DEFAULT_SETTINGS = {
  brandName: 'BL Jewels',
  tagline: 'Purity with Auspiciousness',
  announcements: [
    '✦ 100% Certified 22K (916) BIS Hallmarked Gold Guaranteed ✦',
    '✦ Complimentary Insured Express Delivery across India (Orders > ₹5,000) ✦',
    '✦ Auspicious Festive Offer: Use Code SHUBH10 for 10% Off ✦',
    '✦ Lifetime Gold Buyback Guarantee · 15-Day Easy Returns ✦',
  ],
  todayGoldRate: {
    rate22k: '₹7,280/g',
    rate24k: '₹7,940/g',
    rate18k: '₹5,960/g',
    silverRate: '₹95/g',
    lastUpdated: new Date().toISOString(),
  },
  brandStory: {
    eyebrow: 'Our Heritage & Philosophy',
    title: 'Where Auspicious Gold Meets Artisanal Royalty',
    paragraph1: 'Founded in the historic jewelry quarter of Zaveri Bazaar, Mumbai, BL Jewels was born from a singular sacred vow: Purity with Auspiciousness. We believe that fine jewelry is not merely an ornament — it is a blessing, a family heirloom, and a sacred celebration of love.',
    paragraph2: 'Every polki choker, auspicious mangalsutra, and solitaire ring is shaped by master karigars whose lineages have sculpted jewelry for generations. With 100% government BIS 916 hallmarking and transparent karat certifications, we guarantee that the beauty you wear today retains its auspicious value for generations to come.',
    legacyYears: '40+ YEARS LEGACY',
    legacySubtitle: 'Serving Indian royal families & connoisseurs since 1984',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85',
  },
  contact: {
    phone: '+91 98765 43210',
    email: 'concierge@bljewels.com',
    address: 'BL Jewels Heritage Flagship, Zaveri Bazaar, Mumbai 400002',
    whatsapp: '+91 98765 43210',
  },
};

export const getSettings = async (req, res) => {
  try {
    if (getDbStatus()) {
      let settings = await Setting.findOne({ key: 'global_site_settings' });
      if (!settings) {
        settings = await Setting.create({ key: 'global_site_settings', ...DEFAULT_SETTINGS });
      }
      return res.json({ success: true, settings });
    }
    return res.json({ success: true, settings: DEFAULT_SETTINGS });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    if (getDbStatus()) {
      const settings = await Setting.findOneAndUpdate(
        { key: 'global_site_settings' },
        { $set: updates },
        { new: true, upsert: true }
      );
      return res.json({ success: true, settings });
    }
    return res.json({ success: true, settings: { ...DEFAULT_SETTINGS, ...updates } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

