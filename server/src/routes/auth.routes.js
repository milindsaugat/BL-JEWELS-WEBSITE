import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  toggleWishlist,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/authController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.post('/wishlist/toggle', optionalAuth, toggleWishlist);

export default router;

