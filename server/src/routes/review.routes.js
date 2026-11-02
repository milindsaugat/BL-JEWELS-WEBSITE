import express from 'express';
import {
  getFeaturedReviews,
  getAllReviews,
  getProductReviews,
  addReview,
  createDirectReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Specific routes first before wildcard :id / :productId
router.get('/featured', getFeaturedReviews);
router.get('/all', getAllReviews);
router.get('/', getFeaturedReviews);

router.post('/', optionalAuth, createDirectReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

router.get('/product/:productId', getProductReviews);
router.get('/:productId', getProductReviews);
router.post('/:productId', optionalAuth, addReview);

export default router;
