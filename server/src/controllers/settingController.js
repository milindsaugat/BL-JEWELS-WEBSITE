import { getDbStatus } from '../config/db.js';
import Setting from '../models/Setting.js';

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

let memorySettingsCache = null;

export const getSettings = async (req, res) => {
  try {
    if (getDbStatus()) {
      let settings = await Setting.findOne({ key: 'global_site_settings' });
      if (!settings) {
        settings = await Setting.create({
          key: 'global_site_settings',
          announcementBar: DEFAULT_ANNOUNCEMENT_BAR,
        });
      } else if (!settings.announcementBar || !settings.announcementBar.mode) {
        settings.announcementBar = { ...DEFAULT_ANNOUNCEMENT_BAR, ...(settings.announcementBar?.toObject?.() || {}) };
        await settings.save();
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

