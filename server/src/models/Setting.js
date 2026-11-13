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
  navbarDropdowns: {
    all: { type: Boolean, default: true },
    gold: { type: Boolean, default: true },
    diamond: { type: Boolean, default: true },
    silver: { type: Boolean, default: true },
    bridal: { type: Boolean, default: true },
  },
  festiveSaleBanner: {
    enabled: {
      type: Boolean,
      default: true,
    },
    badgeText: {
      type: String,
      default: 'AKSHAYA TRITIYA',
    },
    topNotice: {
      type: String,
      default: 'LIMITED PERIOD AUSPICIOUS SALE',
    },
    title: {
      type: String,
      default: 'Akshaya Tritiya Royal Heritage Sale',
    },
    subtitle: {
      type: String,
      default: 'Flat 20% Auspicious rebate on 22K hallmarked rings, bangles and royal bridal jewellery.',
    },
    targetDate: {
      type: String,
      default: '2027-05-08T00:00:00.000+05:30',
    },
    validOn: [{
      type: String,
    }],
    promoCode: {
      type: String,
      default: 'AKSHAYA20',
    },
    ctaText: {
      type: String,
      default: 'SHOP FESTIVE SALE',
    },
    ctaLink: {
      type: String,
      default: '/collections/necklaces',
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    },
    imageTagline: {
      type: String,
      default: 'AN AUSPICIOUS CELEBRATION',
    },
    imageSubtitle: {
      type: String,
      default: 'Handcrafted Heritage Jewellery. Timeless Moments.',
    },
  },
  announcementBar: {
    enabled: {
      type: Boolean,
      default: true,
    },
    mode: {
      type: String,
      enum: ['static', 'marquee'],
      default: 'static',
    },
    staticText: {
      type: String,
      default: 'Complimentary Insured Armored Delivery across India on orders above ₹5,000',
    },
    pillText: {
      type: String,
      default: 'Code: SHUBH10',
    },
    pillLink: {
      type: String,
      default: '',
    },
    showPill: {
      type: Boolean,
      default: true,
    },
    leftText1: {
      type: String,
      default: '100% BIS 916 Hallmarked Gold',
    },
    leftText2: {
      type: String,
      default: 'Lifetime Buyback',
    },
    rightText: {
      type: String,
      default: '15-Day Easy Returns',
    },
    phone: {
      type: String,
      default: '074549 86610',
    },
    marqueeRawText: {
      type: String,
      default: '100% Certified 22K (916) BIS Hallmarked Gold Guaranteed, Complimentary Insured Armored Delivery across India on orders above ₹5,000, Auspicious Festive Offer: Use Code SHUBH10 for 10% Off, Lifetime Gold Buyback Guarantee · 15-Day Easy Returns, Call Showroom: 074549 86610',
    },
    marqueeItems: [{
      type: String,
    }],
    marqueeSpeed: {
      type: Number,
      default: 35,
    },
  },
  todayGoldRate: {
    rate22k: { type: String },
    rate24k: { type: String },
    rate18k: { type: String },
    silverRate: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  },
  brandStory: {
    eyebrow: { type: String },
    title: { type: String },
    paragraph1: {
      type: String,
    },
    paragraph2: {
      type: String,
    },
    legacyYears: { type: String },
    legacySubtitle: { type: String },
    image: {
      type: String,
    },
  },
  contact: {
    phone: { type: String, default: '074549 86610' },
    email: { type: String, default: 'contact@bljewels.com' },
    address: { type: String, default: 'Shop No. 01, Upper Ground Floor, Suresh Mall, MG Road, Civil Lines, Agra, UP 282002' },
    whatsapp: { type: String, default: '+91 74549 88610' },
    showroomTiming: { type: String, default: 'Mon - Sun: 10:30 AM - 8:30 PM' },
    gstin: { type: String, default: '09AABCB1234F1Z5' },
  },
  socialLinks: {
    instagram: { type: String, default: 'https://www.instagram.com/' },
    facebook: { type: String, default: 'https://www.facebook.com/' },
    youtube: { type: String, default: 'https://www.youtube.com/' },
    whatsapp: { type: String, default: 'https://wa.me/917454988610' },
  },
  bankAccounts: [
    {
      label: { type: String, trim: true, default: 'Primary Showroom Account' },
      bankName: { type: String, trim: true, default: '' },
      accountHolder: { type: String, trim: true, default: '' },
      accountNumber: { type: String, trim: true, default: '' },
      ifsc: { type: String, trim: true, uppercase: true, default: '' },
      branch: { type: String, trim: true, default: '' },
      accountType: { type: String, trim: true, default: 'Current' },
      upiId: { type: String, trim: true, default: '' },
      qrImage: { type: String, trim: true, default: '' },
      instructions: { type: String, trim: true, default: '' },
      isActive: { type: Boolean, default: true },
    },
  ],
  seo: {
    defaultMetaTitle: { type: String },
    defaultMetaDescription: { type: String },
    defaultMetaKeywords: [{ type: String }],
    ogImage: { type: String },
    pages: {
      home: {
        metaTitle: String,
        metaDescription: String,
        metaKeywords: [String],
      },
      collections: {
        metaTitle: String,
        metaDescription: String,
        metaKeywords: [String],
      },
      blog: {
        metaTitle: String,
        metaDescription: String,
        metaKeywords: [String],
      },
      liveRate: {
        metaTitle: String,
        metaDescription: String,
        metaKeywords: [String],
      },
      about: {
        metaTitle: String,
        metaDescription: String,
        metaKeywords: [String],
      },
      contact: {
        metaTitle: String,
        metaDescription: String,
        metaKeywords: [String],
      },
    },
  },
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;

