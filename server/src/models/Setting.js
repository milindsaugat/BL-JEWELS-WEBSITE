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
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    whatsapp: { type: String },
  },
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;

