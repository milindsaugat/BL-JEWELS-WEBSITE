import express from 'express';
import { register, login, getMe, logout, toggleWishlist } from '../controllers/authController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/wishlist/toggle', optionalAuth, toggleWishlist);

export default router;

