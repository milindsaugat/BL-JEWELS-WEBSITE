import Order from '../models/Order.js';
import { productInput } from '../services/productValidation.js';
import { getDbStatus } from '../config/db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { memoryStore } from '../config/memoryStore.js';

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
        isActive: true,
        $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }]
      }).populate('category', 'name slug').populate('comboItems.product', 'name slug images isActive variants');

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const [matching, more] = await Promise.all([
        Product.find({ isActive: true, category: product.category?._id || product.category, _id: { $ne: product._id } }).limit(12),
        Product.find({ isActive: true, category: { $ne: product.category?._id || product.category }, _id: { $ne: product._id } }).sort({ updatedAt: -1 }).limit(12),
      ]);
      const related = [...matching, ...more].slice(0, 12);

      return res.json({ success: true, product, related });
    } else {
      const product = memoryStore.products.find(p => p.isActive !== false && (p.slug === slug || p._id === slug));
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

export const getAdminProducts = async (req, res) => {
  if (!getDbStatus()) return res.status(503).json({ message: 'Database unavailable. Please try again.' });
  try { const products = await Product.find().sort({ createdAt: -1 }).populate('category', 'name slug'); res.json({ success: true, products }); }
  catch { res.status(503).json({ message: 'Could not load products.' }); }
};
export const getProductsByIds = async (req, res) => {
  const ids = [...new Set(String(req.query.ids || '').split(',').filter(id => /^[a-f0-9]{24}$/i.test(id)))].slice(0, 24);
  if (!getDbStatus()) return res.status(503).json({ message: 'Products temporarily unavailable.' });
  try { const products = await Product.find({ _id: { $in: ids }, isActive: true }).populate('category', 'name slug'); res.json({ success: true, products: ids.map(id => products.find(p => String(p._id) === id)).filter(Boolean) }); }
  catch { res.status(503).json({ message: 'Could not load products.' }); }
};
const saveProduct = updating => async (req, res) => {
  if (!getDbStatus()) return res.status(503).json({ message: 'Database unavailable. Changes were not saved.' });
  try {
    const data = productInput(req.body, updating);
    if (updating && data.variants) {
      const existing = await Product.findById(req.params.id);
      const removed = (existing?.variants || []).filter(v => !data.variants.some(next => next.sku === v.sku)).map(v => v.sku);
      if (removed.length && await Order.exists({ inventoryReserved: true, items: { $elemMatch: { product: req.params.id, 'snapshot.variant.sku': { $in: removed } } } })) return res.status(409).json({ message: 'A removed SKU is used by an open order. Keep that SKU until the order is complete.' });
    }
    if (data.category) {
      const category = await Category.findById(data.category);
      if (!category) return res.status(400).json({ message: 'Select a valid category.' });
      data.categorySlug = category.slug;
    }
    if (!updating && !data.slug) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (data.productType === 'single') data.comboItems = [];
    for (const item of data.comboItems || []) {
      if (String(item.product) === req.params.id) return res.status(400).json({ message: 'A combo cannot include itself.' });
      const component = await Product.findOne({ _id: item.product, isActive: true, productType: { $ne: 'combo' } });
      if (!component || !component.variants.some(v => v.sku === item.variantSku)) return res.status(400).json({ message: 'Choose an active product and variant for every combo item.' });
    }
    const product = updating ? await Product.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: true }) : await Product.create(data);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.status(updating ? 200 : 201).json({ success: true, product });
  } catch (error) { res.status(error.code === 11000 ? 409 : error.status || 400).json({ success: false, message: error.code === 11000 ? 'This SKU or product URL already exists.' : error.message }); }
};
export const createProduct = saveProduct(false);
export const updateProduct = saveProduct(true);

export const deleteProduct = async (req, res) => {
  if (!getDbStatus()) return res.status(503).json({ message: 'Database unavailable. Nothing was deleted.' });
  try {
    if (await Order.exists({ inventoryReserved: true, 'items.product': req.params.id, status: { $nin: ['delivered','returned','cancelled'] } })) return res.status(409).json({ message: 'This product has open orders. Unpublish it instead.' });
    if (await Product.exists({ 'comboItems.product': req.params.id })) return res.status(409).json({ message: 'Remove this product from its combos before deleting it.' });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ success: true });
  } catch { res.status(400).json({ message: 'Could not delete this product.' }); }
};
