import { getDbStatus } from '../config/db.js';
import Occasion from '../models/Occasion.js';
import {
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  uploadBufferToCloudinary,
} from '../config/cloudinary.js';


// Public Storefront: Get active occasions
export const getOccasions = async (req, res) => {
  try {
    if (getDbStatus()) {
      const occasions = await Occasion.find({ isActive: true }).sort({ order: 1 });
      

      return res.json({ success: true, count: occasions.length, occasions });
    } else {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all occasions
export const getAllOccasions = async (req, res) => {
  try {
    if (getDbStatus()) {
      const occasions = await Occasion.find().sort({ order: 1 });
      return res.json({ success: true, count: occasions.length, occasions });
    } else {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create Occasion
export const createOccasion = async (req, res) => {
  try {
    const data = {
      ...req.body,
      title: req.body.title?.trim() || 'Special Occasion',
      badge: req.body.badge?.trim() || (req.body.title?.trim() ? req.body.title.trim().split(' ')[0] : 'Occasion'),
      link: req.body.link?.trim() || '/collections',
      image: req.body.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80',
    };

    // Safety guard: Base64 to Cloudinary auto-upload
    if (data.image.startsWith('data:image/')) {
      const base64Data = data.image.split(';base64,').pop();
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `${data.badge?.toLowerCase() || 'occasion'}-${Date.now()}.png`;
      const uploaded = await uploadBufferToCloudinary(buffer, filename, 'bl-jewels/occasions');
      data.image = uploaded.secure_url;
      data.cloudinaryPublicId = uploaded.public_id;
    }

    if (getDbStatus()) {
      const occasion = await Occasion.create(data);
      return res.status(201).json({ success: true, occasion });
    } else {
      const occasion = { _id: `occ_${Date.now()}`, ...data };
      return res.status(201).json({ success: true, occasion });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update Occasion
export const updateOccasion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getDbStatus()) {
      const existing = await Occasion.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Occasion not found' });
      }

      // If image replaced and old one was Cloudinary, purge old asset
      if (updates.image && updates.image !== existing.image) {
        const oldPublicId = existing.cloudinaryPublicId || extractPublicIdFromUrl(existing.image);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId);
        }
      }

      const occasion = await Occasion.findByIdAndUpdate(id, updates, { new: true });
      return res.json({ success: true, occasion });
    } else {
      return res.json({ success: true, occasion: { _id: id, ...updates } });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete Occasion
export const deleteOccasion = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const occasion = await Occasion.findById(id);
      if (occasion) {
        const publicId = occasion.cloudinaryPublicId || extractPublicIdFromUrl(occasion.image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
        await Occasion.findByIdAndDelete(id);
      }
      return res.json({ success: true, message: 'Occasion and Cloudinary asset deleted successfully' });
    } else {
      return res.json({ success: true, message: 'Occasion deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

