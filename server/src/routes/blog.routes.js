import express from 'express';
import {
  getPublishedBlogs,
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Admin management endpoints (keep /all before /:slug)
router.get('/all', protect, adminOnly, getAllBlogs);
router.post('/', protect, adminOnly, createBlog);
router.put('/:id', protect, adminOnly, updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

// Public storefront endpoints
router.get('/', getPublishedBlogs);
router.get('/:slug', getBlogBySlug);

export default router;

