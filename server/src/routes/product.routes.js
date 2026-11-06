import express from 'express';
import {
  getProducts,
  getAdminProducts,
  getProductsByIds,
  getFeaturedProducts,
  getNewArrivals,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/admin/all', protect, adminOnly, getAdminProducts);
router.get('/by-ids', getProductsByIds);
router.get('/:slug', getProductBySlug);

// Admin product endpoints
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;

