import { getDbStatus } from '../config/db.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { memoryStore } from '../config/memoryStore.js';
import {
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  uploadBufferToCloudinary,
} from '../config/cloudinary.js';

export const getCategories = async (req, res) => {
  try {
    if (getDbStatus()) {
      const categories = await Category.find().sort({ order: 1 });
      const counts = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      const countMap = {};
      counts.forEach(c => { countMap[c._id.toString()] = c.count; });

      const result = categories.map(cat => ({
        ...cat.toObject(),
        productCount: countMap[cat._id.toString()] || 0,
      }));

      return res.json({ success: true, count: result.length, categories: result });
    } else {
      const result = memoryStore.categories.map(cat => {
        const count = memoryStore.products.filter(p => p.categorySlug === cat.slug).length;
        return {
          ...cat,
          productCount: count,
        };
      });

      return res.json({ success: true, count: result.length, categories: result });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (getDbStatus()) {
      const category = await Category.findOne({ slug });
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

      const products = await Product.find({ category: category._id, isActive: true });
      return res.json({ success: true, category, products });
    } else {
      const category = memoryStore.categories.find(c => c.slug === slug);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

      const products = memoryStore.products.filter(p => p.categorySlug === slug);
      return res.json({ success: true, category, products });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const data = req.body;
    if (!data.name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    if (!data.slug || data.slug.trim() === '') {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Safety guard: Auto-upload base64 to Cloudinary
    if (data.image && data.image.startsWith('data:image/')) {
      const base64Data = data.image.split(';base64,').pop();
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `${data.slug || 'category'}.png`;
      const uploaded = await uploadBufferToCloudinary(buffer, filename, 'bl-jewels/categories');
      data.image = uploaded.secure_url;
      data.cloudinaryPublicId = uploaded.public_id;
    }

    if (getDbStatus()) {
      const category = await Category.create(data);
      return res.status(201).json({ success: true, category });
    } else {
      const category = {
        _id: `cat_${Date.now()}`,
        ...data,
      };
      memoryStore.categories.push(category);
      return res.status(201).json({ success: true, category });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getDbStatus()) {
      const existing = await Category.findById(id);
      if (!existing) return res.status(404).json({ success: false, message: 'Category not found' });

      // If new image replaces old Cloudinary image, purge old asset
      if (updates.image && updates.image !== existing.image) {
        const oldPublicId = existing.cloudinaryPublicId || extractPublicIdFromUrl(existing.image);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId);
        }
      }

      const category = await Category.findByIdAndUpdate(id, updates, { new: true });
      return res.json({ success: true, category });
    } else {
      const idx = memoryStore.categories.findIndex(c => c._id === id || c.slug === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Category not found' });
      memoryStore.categories[idx] = { ...memoryStore.categories[idx], ...updates };
      return res.json({ success: true, category: memoryStore.categories[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const category = await Category.findById(id);
      if (category) {
        const publicId = category.cloudinaryPublicId || extractPublicIdFromUrl(category.image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
        await Category.findByIdAndDelete(id);
      }
      return res.json({ success: true, message: 'Category and Cloudinary asset deleted successfully' });
    } else {
      const idx = memoryStore.categories.findIndex(c => c._id === id || c.slug === id);
      if (idx !== -1) {
        const cat = memoryStore.categories[idx];
        const publicId = cat.cloudinaryPublicId || extractPublicIdFromUrl(cat.image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
        memoryStore.categories.splice(idx, 1);
      }
      return res.json({ success: true, message: 'Category deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
