import { getDbStatus } from '../config/db.js';
import Banner from '../models/Banner.js';
import { memoryStore } from '../config/memoryStore.js';
import {
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  uploadBufferToCloudinary,
} from '../config/cloudinary.js';

export const getBanners = async (req, res) => {
  try {
    if (getDbStatus()) {
      const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
      return res.json({ success: true, count: banners.length, banners });
    }
    const banners = memoryStore.banners.filter(b => b.isActive).sort((a, b) => a.order - b.order);
    return res.json({ success: true, count: banners.length, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    if (getDbStatus()) {
      const banners = await Banner.find().sort({ order: 1 });
      return res.json({ success: true, count: banners.length, banners });
    }
    return res.json({ success: true, count: memoryStore.banners.length, banners: memoryStore.banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBanner = async (req, res) => {
  try {
    const data = req.body;
    if (!data.image) {
      return res.status(400).json({ success: false, message: 'Banner image is required.' });
    }

    const isImageOnly = data.isImageOnly === true || data.isImageOnly === 'true';
    data.isImageOnly = isImageOnly;
    if (!data.title || data.title.trim() === '') {
      data.title = isImageOnly ? 'Clickable Banner' : 'Hero Banner';
    }

    // Safety guard: MongoDB never stores raw image binary/base64 data.
    // If a base64 string is passed, auto-stream it to Cloudinary first so only the CDN link is stored.
    if (data.image && data.image.startsWith('data:image/')) {
      const base64Data = data.image.split(';base64,').pop();
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `${data.title || 'banner'}.png`;
      const uploaded = await uploadBufferToCloudinary(buffer, filename, 'bl-jewels/banners');
      data.image = uploaded.secure_url;
      data.cloudinaryPublicId = uploaded.public_id;
    }

    if (getDbStatus()) {
      const newBanner = await Banner.create(data);
      return res.status(201).json({ success: true, banner: newBanner });
    } else {
      const newBanner = {
        _id: `ban_${Date.now()}`,
        eyebrow: data.eyebrow || 'PURITY WITH AUSPICIOUSNESS',
        title: data.title,
        subtitle: data.subtitle || '',
        isImageOnly,
        image: data.image,
        ctaText: data.ctaText || 'Explore Collection',
        ctaLink: data.ctaLink || '/collections',
        secondaryCtaText: data.secondaryCtaText || 'Our Heritage Story',
        secondaryCtaLink: data.secondaryCtaLink || '/about',
        badgeText: data.badgeText || 'BIS 916 Hallmarked Certified',
        order: data.order || memoryStore.banners.length + 1,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date().toISOString(),
      };
      memoryStore.banners.push(newBanner);
      return res.status(201).json({ success: true, banner: newBanner });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getDbStatus()) {
      const existing = await Banner.findById(id);
      if (!existing) return res.status(404).json({ success: false, message: 'Banner not found' });

      // If a new image is provided and replaces an existing Cloudinary image, delete the old one
      if (updates.image && updates.image !== existing.image) {
        const oldPublicId = existing.cloudinaryPublicId || extractPublicIdFromUrl(existing.image);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId);
        }
      }

      const updated = await Banner.findByIdAndUpdate(id, updates, { new: true });
      return res.json({ success: true, banner: updated });
    } else {
      const idx = memoryStore.banners.findIndex(b => b._id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Banner not found' });

      memoryStore.banners[idx] = { ...memoryStore.banners[idx], ...updates };
      return res.json({ success: true, banner: memoryStore.banners[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const banner = await Banner.findById(id);
      if (banner) {
        // Automatically purge primary banner image from Cloudinary
        const publicId = banner.cloudinaryPublicId || extractPublicIdFromUrl(banner.image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
        // Also purge mobile image if present on Cloudinary
        const mobilePublicId = banner.mobileCloudinaryPublicId || extractPublicIdFromUrl(banner.mobileImage);
        if (mobilePublicId) {
          await deleteFromCloudinary(mobilePublicId);
        }
        await Banner.findByIdAndDelete(id);
      }
      return res.json({ success: true, message: 'Banner and Cloudinary asset deleted successfully' });
    } else {
      const idx = memoryStore.banners.findIndex(b => b._id === id);
      if (idx !== -1) {
        const b = memoryStore.banners[idx];
        const publicId = b.cloudinaryPublicId || extractPublicIdFromUrl(b.image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
        memoryStore.banners.splice(idx, 1);
      }
      return res.json({ success: true, message: 'Banner deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
