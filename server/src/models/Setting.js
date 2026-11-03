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

