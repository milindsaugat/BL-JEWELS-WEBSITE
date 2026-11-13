import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  subscribeEmail,
  getSubscribers,
  deleteSubscriber,
} from '../controllers/subscriberController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

const subscribeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

router.post('/', subscribeLimiter, subscribeEmail);

router.use(protect, adminOnly);
router.get('/', getSubscribers);
router.delete('/:id', deleteSubscriber);

export default router;

