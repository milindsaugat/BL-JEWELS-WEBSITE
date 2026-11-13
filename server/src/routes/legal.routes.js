import express from 'express';
import {
  getPublicLegalPages,
  getLegalPageBySlug,
  getAdminLegalPages,
  createLegalPage,
  updateLegalPage,
  deleteLegalPage,
} from '../controllers/legalController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPublicLegalPages);
router.get('/:slug', getLegalPageBySlug);

// Admin-protected routes
router.get('/admin/all', protect, adminOnly, getAdminLegalPages);
router.post('/', protect, adminOnly, createLegalPage);
router.put('/:id', protect, adminOnly, updateLegalPage);
router.delete('/:id', protect, adminOnly, deleteLegalPage);

export default router;

