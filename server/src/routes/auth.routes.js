import { sendCode, verifyCode, saveProfile, saveAddresses, orderAction } from '../controllers/customerController.js';
import rateLimit from 'express-rate-limit';
import { subscribeEmail } from '../controllers/subscriberController.js';
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
  requestAdminCredentialOtp,
  updateAdminCredentials,
} from '../controllers/authController.js';
import { protect, optionalAuth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
const otpLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
router.post('/subscribe', otpLimit, subscribeEmail);
router.post('/email-code', otpLimit, sendCode('login'));
router.post('/email-verify', otpLimit, verifyCode('login'));
router.put('/profile', protect, saveProfile);
router.put('/addresses', protect, saveAddresses);
router.post('/orders/:id/action', protect, orderAction);
router.post('/forgot-password', otpLimit, sendCode('reset'));
router.post('/verify-otp', otpLimit, verifyCode('reset', false));
router.post('/reset-password', otpLimit, verifyCode('reset'));
router.get('/me', protect, getMe);
router.post('/wishlist/toggle', protect, toggleWishlist);
router.post('/admin/request-credential-otp', protect, adminOnly, requestAdminCredentialOtp);
router.post('/admin/update-credentials', protect, adminOnly, updateAdminCredentials);

export default router;

