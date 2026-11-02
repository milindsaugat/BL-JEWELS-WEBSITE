import { getDbStatus } from '../config/db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { memoryStore } from '../config/memoryStore.js';
import {
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  uploadBufferToCloudinary,
} from '../config/cloudinary.js';

export const getProducts = async (req, res) => {
  try {
    const { category, metal, karat, minPrice, maxPrice, sort, search, occasion } = req.query;

    if (getDbStatus()) {
      let query = { isActive: true };

      if (category) {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) query.category = catDoc._id;
      }

      if (metal) query['metal.type'] = metal;
      if (karat) query['metal.karat'] = karat;
      if (occasion) query.occasion = occasion;

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'price-asc') sortOptions = { 'variants.0.price': 1 };
      if (sort === 'price-desc') sortOptions = { 'variants.0.price': -1 };
      if (sort === 'rating') sortOptions = { 'ratings.average': -1 };

      const products = await Product.find(query).sort(sortOptions).populate('category', 'name slug');
      return res.json({ success: true, count: products.length, products });
    } else {
      // Memory store fallback
      let list = [...memoryStore.products];

      if (category) {
        list = list.filter(p => p.categorySlug === category);
      }
      if (metal) {
        list = list.filter(p => p.metal?.type?.toLowerCase() === metal.toLowerCase());
      }
      if (karat) {
        list = list.filter(p => p.metal?.karat === karat);
      }
      if (occasion) {
        list = list.filter(p => p.occasion?.includes(occasion));
      }
      if (minPrice) {
        list = list.filter(p => (p.variants?.[0]?.discountPrice || p.variants?.[0]?.price) >= Number(minPrice));
      }
      if (maxPrice) {
        list = list.filter(p => (p.variants?.[0]?.discountPrice || p.variants?.[0]?.price) <= Number(maxPrice));
      }
      if (search) {
        const term = search.toLowerCase();
        list = list.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.tags?.some(t => t.toLowerCase().includes(term))
        );
      }

      if (sort === 'price-asc') {
        list.sort((a, b) => (a.variants?.[0]?.discountPrice || a.variants?.[0]?.price) - (b.variants?.[0]?.discountPrice || b.variants?.[0]?.price));
      } else if (sort === 'price-desc') {
        list.sort((a, b) => (b.variants?.[0]?.discountPrice || b.variants?.[0]?.price) - (a.variants?.[0]?.discountPrice || a.variants?.[0]?.price));
      } else if (sort === 'rating') {
        list.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
      } else {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return res.json({ success: true, count: list.length, products: list });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    if (getDbStatus()) {
      const products = await Product.find({ isFeatured: true, isActive: true }).sort({ updatedAt: -1 }).limit(12);
      return res.json({ success: true, count: products.length, products });
    }
    const products = memoryStore.products.filter(p => p.isFeatured).slice(0, 12);
    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNewArrivals = async (req, res) => {
  try {
    if (getDbStatus()) {
      const products = await Product.find({ isNewArrival: true, isActive: true }).sort({ updatedAt: -1 }).limit(12);
      return res.json({ success: true, count: products.length, products });
    }
    const products = memoryStore.products.filter(p => p.isNewArrival).slice(0, 12);
    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (getDbStatus()) {
      const product = await Product.findOne({
        $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }]
      }).populate('category', 'name slug');

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const related = await Product.find({
        category: product.category,
        _id: { $ne: product._id }
      }).limit(4);

      return res.json({ success: true, product, related });
    } else {
      const product = memoryStore.products.find(p => p.slug === slug || p._id === slug);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const related = memoryStore.products
        .filter(p => p.categorySlug === product.categorySlug && p._id !== product._id)
        .slice(0, 4);

      return res.json({ success: true, product, related });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.description || !data.variants?.length) {
      return res.status(400).json({ success: false, message: 'Missing required product information.' });
    }

    // Safety guard: MongoDB never stores binary or raw base64 images.
    // If any base64 image was passed, auto-stream it to Cloudinary so only the CDN URL is saved in MongoDB.
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const img = data.images[i];
        if (img.url && img.url.startsWith('data:image/')) {
          const base64Data = img.url.split(';base64,').pop();
          const buffer = Buffer.from(base64Data, 'base64');
          const filename = `${data.name || 'product'}-${i + 1}.png`;
          const uploaded = await uploadBufferToCloudinary(buffer, filename, 'bl-jewels/products');
          data.images[i].url = uploaded.secure_url;
          data.images[i].publicId = uploaded.public_id;
        }
      }
    }

    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (getDbStatus()) {
      const newProduct = await Product.create({ ...data, slug });
      return res.status(201).json({ success: true, product: newProduct });
    } else {
      const newProduct = {
        _id: `prod_${Date.now()}`,
        slug,
        ...data,
        createdAt: new Date().toISOString(),
      };
      memoryStore.products.unshift(newProduct);
      return res.status(201).json({ success: true, product: newProduct });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getDbStatus()) {
      const updated = await Product.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product: updated });
    } else {
      const idx = memoryStore.products.findIndex(p => p._id === id || p.slug === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });

      memoryStore.products[idx] = { ...memoryStore.products[idx], ...updates };
      return res.json({ success: true, product: memoryStore.products[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const product = await Product.findById(id);
      if (product) {
        // Automatically purge all product gallery & primary images from Cloudinary
        if (product.images && product.images.length > 0) {
          for (const img of product.images) {
            const publicId = img.publicId || extractPublicIdFromUrl(img.url);
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          }
        }
        await Product.findByIdAndDelete(id);
      }
      return res.json({ success: true, message: 'Product and associated Cloudinary assets deleted successfully' });
    } else {
      const idx = memoryStore.products.findIndex(p => p._id === id || p.slug === id);
      if (idx !== -1) {
        const p = memoryStore.products[idx];
        if (p.images && p.images.length > 0) {
          for (const img of p.images) {
            const publicId = img.publicId || extractPublicIdFromUrl(img.url);
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          }
        }
        memoryStore.products.splice(idx, 1);
      }
      return res.json({ success: true, message: 'Product deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

