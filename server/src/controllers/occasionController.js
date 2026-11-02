import { getDbStatus } from '../config/db.js';
import Occasion from '../models/Occasion.js';
import {
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  uploadBufferToCloudinary,
} from '../config/cloudinary.js';

// Default authentic Indian occasion wear seed data (6 Curated Segments)
export const DEFAULT_OCCASIONS = [
  {
    title: 'Everyday',
    subtitle: 'Working women • Light rings, studs, chains',
    badge: 'Everyday',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
    link: '/collections?occasion=everyday',
    order: 1,
    isActive: true,
  },
  {
    title: 'Office Wear',
    subtitle: 'Corporate women • Subtle, minimal pieces',
    badge: 'Office Wear',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80',
    link: '/collections?occasion=office',
    order: 2,
    isActive: true,
  },
  {
    title: 'Festive',
    subtitle: 'All Celebrations • Jhumkas, kadas, sets',
    badge: 'Festive',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=80',
    link: '/collections?occasion=festive',
    order: 3,
    isActive: true,
  },
  {
    title: 'Puja & Religious',
    subtitle: 'Traditional buyer • Temple jewelry, coins',
    badge: 'Puja & Devotion',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=80',
    link: '/collections?occasion=puja',
    order: 4,
    isActive: true,
  },
  {
    title: 'Wedding',
    subtitle: 'Family + guests • Heavy sets, necklaces',
    badge: 'Wedding',
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=700&q=80',
    link: '/collections?occasion=wedding',
    order: 5,
    isActive: true,
  },
  {
    title: 'Bridal',
    subtitle: 'The Bride • Full trousseau sets',
    badge: 'Bridal',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80',
    link: '/collections?occasion=bridal',
    order: 6,
    isActive: true,
  },
];

// Public Storefront: Get active occasions
export const getOccasions = async (req, res) => {
  try {
    if (getDbStatus()) {
      let occasions = await Occasion.find({ isActive: true }).sort({ order: 1 });
      
      // Auto-seed if collection is empty
      if (occasions.length === 0) {
        await Occasion.insertMany(DEFAULT_OCCASIONS);
        occasions = await Occasion.find({ isActive: true }).sort({ order: 1 });
      }

      return res.json({ success: true, count: occasions.length, occasions });
    } else {
      return res.json({ success: true, count: DEFAULT_OCCASIONS.length, occasions: DEFAULT_OCCASIONS });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all occasions
export const getAllOccasions = async (req, res) => {
  try {
    if (getDbStatus()) {
      let occasions = await Occasion.find().sort({ order: 1 });
      if (occasions.length === 0) {
        await Occasion.insertMany(DEFAULT_OCCASIONS);
        occasions = await Occasion.find().sort({ order: 1 });
      }
      return res.json({ success: true, count: occasions.length, occasions });
    } else {
      return res.json({ success: true, count: DEFAULT_OCCASIONS.length, occasions: DEFAULT_OCCASIONS });
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

