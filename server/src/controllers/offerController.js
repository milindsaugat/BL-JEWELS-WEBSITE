import { memoryStore } from '../config/memoryStore.js';
import Offer from '../models/Offer.js';
import { getDbStatus } from '../config/db.js';

export const DEFAULT_OFFERS = [
  {
    _id: 'off_festive_diwali_section',
    title: 'Auspicious Diwali & Dhanteras Gold Mahotsav',
    badge: 'DHANTERAS & DIWALI MAHOTSAV',
    subtitle: 'Flat 15% Auspicious Rebate on all 22K (916) BIS Hallmarked Necklaces, Chokers & Bridal Sets.',
    discountType: 'percentage',
    discountValue: 15,
    bannerImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    targetCategories: ['necklaces', 'choker-sets', 'bridal-heritage'],
    targetProducts: [],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    placement: 'section',
    showHeroSectionSale: true,
    showPopupModal: false,
    popupDelaySeconds: 0,
    ctaText: 'Explore Festive Sale',
    ctaLink: '/collections/necklaces',
    couponCode: 'SHUBH10',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'off_festive_diwali_popup',
    title: 'Auspicious Diwali & Dhanteras Royal Invite',
    badge: 'LIMITED TIME POPUP OFFER',
    subtitle: 'Enjoy Flat 15% Auspicious Rebate on certified 22K (916) BIS Hallmarked Collections.',
    discountType: 'percentage',
    discountValue: 15,
    bannerImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    targetCategories: ['necklaces', 'choker-sets', 'bridal-heritage'],
    targetProducts: [],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    placement: 'popup',
    showHeroSectionSale: false,
    showPopupModal: true,
    popupDelaySeconds: 0,
    ctaText: 'Claim Festive Offer',
    ctaLink: '/collections/necklaces',
    couponCode: 'SHUBH10',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Ensure initial memory seed
const ensureMemorySeed = () => {
  if (!Array.isArray(memoryStore.offers) || memoryStore.offers.length === 0) {
    memoryStore.offers = [...DEFAULT_OFFERS];
  }
};

// Split any legacy combined ('both' / unset placement) offer once into independent section & popup campaigns
const migrateLegacyOffersIfNeeded = async () => {
  try {
    if (!getDbStatus()) return;
    const all = await Offer.find().lean();
    const hasDedicated = all.some(o => o.placement === 'section' || o.placement === 'popup');
    const legacyCombined = all.filter(o => !o.placement || o.placement === 'both');

    if (!hasDedicated && legacyCombined.length > 0) {
      for (const leg of legacyCombined) {
        const sectionActive = Boolean(leg.isActive && leg.showHeroSectionSale !== false);
        const popupActive = Boolean(leg.isActive && leg.showPopupModal !== false);

        await Offer.findByIdAndUpdate(leg._id, {
          placement: 'section',
          showHeroSectionSale: true,
          showPopupModal: false,
          isActive: sectionActive,
        });

        const { _id, createdAt, updatedAt, __v, ...rest } = leg;
        await Offer.create({
          ...rest,
          placement: 'popup',
          showHeroSectionSale: false,
          showPopupModal: true,
          isActive: popupActive,
        });
      }
      console.log('✦ Separated legacy combined offers into independent Section & Popup campaigns');
    }
  } catch (err) {
    console.warn('Offer migration note:', err.message);
  }
};

// Seed MongoDB if empty and connected
const ensureMongoSeed = async () => {
  try {
    if (getDbStatus()) {
      const count = await Offer.countDocuments();
      if (count === 0) {
        await Offer.insertMany(DEFAULT_OFFERS.map(o => {
          const { _id, ...rest } = o;
          return rest;
        }));
        console.log('✦ Seeded initial festival offers into MongoDB Atlas');
      } else {
        await migrateLegacyOffersIfNeeded();
      }
    }
  } catch (err) {
    console.warn('Offer seed note:', err.message);
  }
};

ensureMemorySeed();
ensureMongoSeed().catch(() => {});

/**
 * GET /api/v1/offers/active
 * Concurrent fast endpoint for Storefront (Hero Sale Banner & Popup Modal)
 */
export const getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    ensureMemorySeed();

    if (getDbStatus()) {
      const offers = await Offer.find({
        isActive: true,
        endDate: { $gt: now },
      })
        .sort({ createdAt: -1 })
        .lean();

      return res.json({ success: true, count: offers.length, offers });
    }

    // Memory fallback only if DB is not connected
    const activeOffers = memoryStore.offers.filter(
      o => o.isActive && new Date(o.endDate) > now
    );

    return res.json({ success: true, count: activeOffers.length, offers: activeOffers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/offers
 * Admin listing of all offers
 */
export const getOffers = async (req, res) => {
  try {
    ensureMemorySeed();

    if (getDbStatus()) {
      await migrateLegacyOffersIfNeeded();
      let offers = await Offer.find().sort({ createdAt: -1 });
      if (offers.length === 0) {
        try {
          offers = await Offer.insertMany(DEFAULT_OFFERS.map(o => {
            const { _id, ...rest } = o;
            return rest;
          }));
        } catch {}
      }
      return res.json({ success: true, count: offers.length, offers });
    }

    return res.json({ success: true, count: memoryStore.offers.length, offers: memoryStore.offers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/v1/offers
 * Admin create festival offer
 */
export const createOffer = async (req, res) => {
  try {
    const {
      title,
      badge,
      subtitle,
      discountType,
      discountValue,
      bannerImage,
      targetCategories,
      targetProducts,
      startDate,
      endDate,
      placement,
      showHeroSectionSale,
      showPopupModal,
      popupDelaySeconds,
      ctaText,
      ctaLink,
      couponCode,
      isActive,
    } = req.body;

    if (!title || discountValue === undefined) {
      return res.status(400).json({ success: false, message: 'Offer title and discount value are required.' });
    }

    const resolvedPlacement = ['section', 'popup', 'both'].includes(placement) ? placement : 'both';
    const resolvedHeroSale =
      resolvedPlacement === 'section'
        ? true
        : resolvedPlacement === 'popup'
        ? false
        : showHeroSectionSale !== undefined
        ? Boolean(showHeroSectionSale)
        : true;
    const resolvedPopup =
      resolvedPlacement === 'popup'
        ? true
        : resolvedPlacement === 'section'
        ? false
        : showPopupModal !== undefined
        ? Boolean(showPopupModal)
        : true;

    const newOfferData = {
      title: title.trim(),
      badge: badge ? badge.trim() : 'FESTIVE OFFER',
      subtitle: subtitle ? subtitle.trim() : '',
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue) || 15,
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
      targetCategories: Array.isArray(targetCategories) ? targetCategories : ['necklaces'],
      targetProducts: Array.isArray(targetProducts) ? targetProducts : [],
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      placement: resolvedPlacement,
      showHeroSectionSale: resolvedHeroSale,
      showPopupModal: resolvedPopup,
      popupDelaySeconds: popupDelaySeconds !== undefined && popupDelaySeconds !== '' ? Number(popupDelaySeconds) : 0,
      ctaText: ctaText ? ctaText.trim() : 'Shop Festive Sale',
      ctaLink: ctaLink ? ctaLink.trim() : '/collections/necklaces',
      couponCode: couponCode ? couponCode.trim().toUpperCase() : 'SHUBH10',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    if (getDbStatus()) {
      const created = await Offer.create(newOfferData);
      return res.status(201).json({ success: true, offer: created });
    }

    ensureMemorySeed();
    const memoryOffer = {
      _id: `off_${Date.now()}`,
      ...newOfferData,
      createdAt: new Date().toISOString(),
    };

    memoryStore.offers.unshift(memoryOffer);
    return res.status(201).json({ success: true, offer: memoryOffer });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/v1/offers/:id
 * Admin update offer or toggle status
 */
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.placement === 'section') {
      updates.showHeroSectionSale = true;
      updates.showPopupModal = false;
    } else if (updates.placement === 'popup') {
      updates.showHeroSectionSale = false;
      updates.showPopupModal = true;
    } else {
      if (updates.showHeroSectionSale !== undefined) {
        updates.showHeroSectionSale = Boolean(updates.showHeroSectionSale);
      }
      if (updates.showPopupModal !== undefined) {
        updates.showPopupModal = Boolean(updates.showPopupModal);
      }
    }
    if (updates.isActive !== undefined) {
      updates.isActive = Boolean(updates.isActive);
    }
    if (updates.popupDelaySeconds !== undefined && updates.popupDelaySeconds !== '') {
      updates.popupDelaySeconds = Number(updates.popupDelaySeconds);
    }

    if (getDbStatus()) {
      const updated = await Offer.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Offer not found.' });
      }

      // Also sync to memoryStore if present
      ensureMemorySeed();
      const memIdx = memoryStore.offers.findIndex(o => o._id === id || String(o._id) === String(id));
      if (memIdx !== -1) {
        memoryStore.offers[memIdx] = {
          ...memoryStore.offers[memIdx],
          ...updated.toObject(),
        };
      }

      return res.json({ success: true, offer: updated });
    }

    ensureMemorySeed();
    const index = memoryStore.offers.findIndex(o => o._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    memoryStore.offers[index] = {
      ...memoryStore.offers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return res.json({ success: true, offer: memoryStore.offers[index] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/v1/offers/:id
 * Admin delete offer
 */
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      await Offer.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Offer deleted successfully.' });
    }

    ensureMemorySeed();
    const prevLen = memoryStore.offers.length;
    memoryStore.offers = memoryStore.offers.filter(o => o._id !== id);

    if (memoryStore.offers.length === prevLen) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    return res.json({ success: true, message: 'Offer deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
