import { getDbStatus } from '../config/db.js';
import Setting from '../models/Setting.js';

const DEFAULT_FESTIVE_BANNER = {
  enabled: true,
  badgeText: 'AKSHAYA TRITIYA',
  topNotice: 'LIMITED PERIOD AUSPICIOUS SALE',
  title: 'Akshaya Tritiya Royal Heritage Sale',
  subtitle: 'Flat 20% Auspicious rebate on 22K hallmarked rings, bangles and royal bridal jewellery.',
  targetDate: '2027-05-08T00:00:00.000+05:30',
  validOn: ['Rings', 'Bangles & Bracelets', 'Royal Chokers'],
  promoCode: 'AKSHAYA20',
  ctaText: 'SHOP FESTIVE SALE',
  ctaLink: '/collections/necklaces',
  image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
  imageTagline: 'AN AUSPICIOUS CELEBRATION',
  imageSubtitle: 'Handcrafted Heritage Jewellery. Timeless Moments.',
};

const DEFAULT_ANNOUNCEMENT_BAR = {
  enabled: true,
  mode: 'static',
  staticText: 'Complimentary Insured Armored Delivery across India on orders above ₹5,000',
  pillText: 'Code: SHUBH10',
  pillLink: '',
  showPill: true,
  leftText1: '100% BIS 916 Hallmarked Gold',
  leftText2: 'Lifetime Buyback',
  rightText: '15-Day Easy Returns',
  phone: '074549 86610',
  marqueeRawText: '100% Certified 22K (916) BIS Hallmarked Gold Guaranteed, Complimentary Insured Armored Delivery across India on orders above ₹5,000, Auspicious Festive Offer: Use Code SHUBH10 for 10% Off, Lifetime Gold Buyback Guarantee · 15-Day Easy Returns, Call Showroom: 074549 86610',
  marqueeItems: [
    '✦ 100% Certified 22K (916) BIS Hallmarked Gold Guaranteed ✦',
    '✦ Complimentary Insured Armored Delivery across India on orders above ₹5,000 ✦',
    '✦ Auspicious Festive Offer: Use Code SHUBH10 for 10% Off ✦',
    '✦ Lifetime Gold Buyback Guarantee · 15-Day Easy Returns ✦',
    '✦ Call Showroom: 074549 86610 ✦'
  ],
  marqueeSpeed: 35,
};

const DEFAULT_SEO = {
  defaultMetaTitle: 'BL Jewels | Purity with Auspiciousness — 22K BIS 916 Fine Jewellery',
  defaultMetaDescription:
    'Discover certified 22K (916) BIS Hallmarked gold jewellery, uncut Polki Jadau, GIA solitaires, and royal bridal sets at BL Jewels.',
  defaultMetaKeywords: [
    'BL Jewels',
    '22K BIS 916 Gold Jewellery',
    'Bridal Gold Sets',
    'Polki Jadau Choker',
    'Indian Luxury Jewellery',
  ],
  ogImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=80',
  pages: {
    home: {
      metaTitle: 'BL Jewels | Purity with Auspiciousness — Certified 22K & Bridal Jewellery',
      metaDescription:
        'Shop 100% BIS 916 hallmarked 22K gold necklaces, bridal polki sets, diamond rings & live bullion rates with insured armored delivery across India.',
      metaKeywords: ['BL Jewels', '22K Gold Jewellery', 'Bridal Jewellery India', 'Live Gold Rate'],
    },
    collections: {
      metaTitle: 'Fine Jewellery Collections | 22K Gold, Diamond & Polki — BL Jewels',
      metaDescription:
        'Explore curated 22K hallmarked necklaces, bangles, mangalsutras, solitaire rings, and heritage bridal jewellery handcrafted by master karigars.',
      metaKeywords: ['Gold Necklaces', 'Diamond Rings', 'Bridal Chokers', '22K 916 Bangles'],
    },
    blog: {
      metaTitle: 'The Royal Journal | Gold Purity, Bridal Styling & Heritage Blog — BL Jewels',
      metaDescription:
        'Read expert guides on BIS 916 hallmarking, 24K vs 22K gold purity, bridal trousseau styling, and caring for heirloom Polki & diamond jewellery.',
      metaKeywords: ['Jewellery Blog', 'BIS 916 Guide', 'Bridal Styling Tips', 'Gold Purity Guide'],
    },
    liveRate: {
      metaTitle: 'Live Gold & Silver Bullion Rates Today | 24K, 22K, 18K — BL Jewels',
      metaDescription:
        'Track real-time 24K, 22K (916), 18K, 14K gold and 999 fine silver spot rates across India at BL Jewels.',
      metaKeywords: ['Today Gold Rate', '22K Gold Price India', 'Live Silver Rate', 'Bullion Ticker'],
    },
    about: {
      metaTitle: 'Our Heritage & Craftsmanship | 40+ Years Legacy — BL Jewels',
      metaDescription:
        'Born in Zaveri Bazaar since 1984, BL Jewels blends auspicious gold purity with generational karigar artistry and lifetime buyback.',
      metaKeywords: ['BL Jewels Heritage', 'Zaveri Bazaar Jewellers', 'Lifetime Gold Buyback'],
    },
    contact: {
      metaTitle: 'Contact Us & Showroom Visit — BL Jewels',
      metaDescription:
        'Get in touch with BL Jewels. Visit our showroom in Agra or send us your inquiry for pure gold and certified diamond jewellery.',
      metaKeywords: ['BL Jewels Contact', 'Jewellery Store Agra', 'BL Jewels Showroom'],
    },
  },
};

const mergeSeoDefaults = (curSeo = {}) => {
  const curPages = curSeo.pages || {};
  const mergedPages = {};
  for (const key of Object.keys(DEFAULT_SEO.pages)) {
    const def = DEFAULT_SEO.pages[key];
    const cur = curPages[key] || {};
    mergedPages[key] = {
      metaTitle: cur.metaTitle || def.metaTitle,
      metaDescription: cur.metaDescription || def.metaDescription,
      metaKeywords: Array.isArray(cur.metaKeywords) && cur.metaKeywords.length > 0 ? cur.metaKeywords : def.metaKeywords,
    };
  }
  return {
    defaultMetaTitle: curSeo.defaultMetaTitle || DEFAULT_SEO.defaultMetaTitle,
    defaultMetaDescription: curSeo.defaultMetaDescription || DEFAULT_SEO.defaultMetaDescription,
    defaultMetaKeywords:
      Array.isArray(curSeo.defaultMetaKeywords) && curSeo.defaultMetaKeywords.length > 0
        ? curSeo.defaultMetaKeywords
        : DEFAULT_SEO.defaultMetaKeywords,
    ogImage: curSeo.ogImage || DEFAULT_SEO.ogImage,
    pages: mergedPages,
  };
};

const DEFAULT_BANK_ACCOUNTS = [
  {
    label: 'HDFC Primary Showroom Account (Test)',
    bankName: 'HDFC Bank Ltd.',
    accountHolder: 'B.L. Jewels Atelier Pvt. Ltd.',
    accountNumber: '50200084917260',
    ifsc: 'HDFC0000412',
    branch: 'Civil Lines, MG Road, Agra',
    accountType: 'Current',
    upiId: 'bljewels.showroom@hdfcbank',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=upi%3A%2F%2Fpay%3Fpa%3Dbljewels.showroom%40hdfcbank%26pn%3DBL%2520Jewels%26cu%3DINR',
    instructions: 'Testing Account: Pay via NEFT/IMPS/RTGS or scan QR, enter any 8+ digit UTR number and upload payment screenshot at checkout.',
    isActive: true,
  },
  {
    label: 'ICICI Bridal Trousseau Escrow (Test)',
    bankName: 'ICICI Bank Ltd.',
    accountHolder: 'BL Jewels Heritage Trust',
    accountNumber: '004205019824',
    ifsc: 'ICIC0000042',
    branch: 'Sanjay Place Flagship Branch, Agra',
    accountType: 'Current',
    upiId: 'bljewels.bridal@icici',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=upi%3A%2F%2Fpay%3Fpa%3Dbljewels.bridal%40icici%26pn%3DBL%2520Jewels%2520Bridal%26cu%3DINR',
    instructions: 'Preferred for bridal sets & high-value bullion orders. Attach transfer screenshot & UTR reference to authorize.',
    isActive: true,
  },
];

let memorySettingsCache = null;

export const getSettings = async (req, res) => {
  try {
    if (getDbStatus()) {
      let settings = await Setting.findOne({ key: 'global_site_settings' });
      if (!settings) {
        settings = await Setting.create({
          key: 'global_site_settings',
          announcementBar: DEFAULT_ANNOUNCEMENT_BAR,
          festiveSaleBanner: DEFAULT_FESTIVE_BANNER,
          bankAccounts: DEFAULT_BANK_ACCOUNTS,
          seo: DEFAULT_SEO,
        });
      } else {
        let changed = false;
        if (!settings.announcementBar || !settings.announcementBar.mode) {
          settings.announcementBar = { ...DEFAULT_ANNOUNCEMENT_BAR, ...(settings.announcementBar?.toObject?.() || {}) };
          changed = true;
        }
        if (!settings.festiveSaleBanner) {
          settings.festiveSaleBanner = DEFAULT_FESTIVE_BANNER;
          changed = true;
        }
        if (!settings.seo || !settings.seo.pages?.home?.metaTitle || !settings.seo.defaultMetaKeywords?.length) {
          const curSeo = settings.seo?.toObject?.() || {};
          settings.seo = mergeSeoDefaults(curSeo);
          changed = true;
        }
        if (changed) {
          await settings.save();
        }
      }
      return res.json({ success: true, settings });
    }

    // Fallback if DB is disconnected
    if (!memorySettingsCache) {
      memorySettingsCache = {
        key: 'global_site_settings',
        brandName: 'BL Jewels',
        tagline: 'Purity with Auspiciousness',
        announcementBar: DEFAULT_ANNOUNCEMENT_BAR,
        festiveSaleBanner: DEFAULT_FESTIVE_BANNER,
        bankAccounts: DEFAULT_BANK_ACCOUNTS,
        seo: DEFAULT_SEO,
        announcements: DEFAULT_ANNOUNCEMENT_BAR.marqueeItems,
        contact: { phone: '074549 86610' },
      };
    }
    return res.json({ success: true, settings: memorySettingsCache });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (Array.isArray(updates.bankAccounts)) {
      updates.bankAccounts = updates.bankAccounts.map((acc) => ({
        ...(acc._id ? { _id: acc._id } : {}),
        label: String(acc.label || 'Showroom Bank Account').trim().slice(0, 120),
        bankName: String(acc.bankName || '').trim().slice(0, 120),
        accountHolder: String(acc.accountHolder || '').trim().slice(0, 140),
        accountNumber: String(acc.accountNumber || '').trim().slice(0, 60),
        ifsc: String(acc.ifsc || '').trim().toUpperCase().slice(0, 24),
        branch: String(acc.branch || '').trim().slice(0, 120),
        accountType: String(acc.accountType || 'Current').trim().slice(0, 40),
        upiId: String(acc.upiId || '').trim().slice(0, 120),
        qrImage: String(acc.qrImage || '').trim().slice(0, 1000),
        instructions: String(acc.instructions || '').trim().slice(0, 500),
        isActive: acc.isActive !== false,
      }));
    }

    // Parse marquee comma-separated text into structured items array
    if (updates.announcementBar) {
      const bar = { ...updates.announcementBar };

      if (typeof bar.marqueeRawText === 'string') {
        const parsedItems = bar.marqueeRawText
          .split(/[,;\n]+/)
          .map((s) => s.trim())
          .filter(Boolean);

        bar.marqueeItems = parsedItems.length > 0 ? parsedItems : DEFAULT_ANNOUNCEMENT_BAR.marqueeItems;
        updates.announcements = bar.marqueeItems;
      } else if (Array.isArray(bar.marqueeItems) && bar.marqueeItems.length > 0) {
        bar.marqueeRawText = bar.marqueeItems.join(', ');
        updates.announcements = bar.marqueeItems;
      }

      updates.announcementBar = bar;
    }

    if (getDbStatus()) {
      const settings = await Setting.findOneAndUpdate(
        { key: 'global_site_settings' },
        { $set: updates },
        { new: true, upsert: true }
      );
      return res.json({ success: true, settings });
    }

    // Fallback if DB is disconnected
    memorySettingsCache = {
      ...(memorySettingsCache || {}),
      ...updates,
      announcementBar: {
        ...DEFAULT_ANNOUNCEMENT_BAR,
        ...(memorySettingsCache?.announcementBar || {}),
        ...(updates.announcementBar || {}),
      },
    };
    return res.json({ success: true, settings: memorySettingsCache });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

