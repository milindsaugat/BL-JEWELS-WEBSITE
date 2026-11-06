import { sendCode, verifyCode, saveProfile, saveAddresses, orderAction } from '../controllers/customerController.js';
import rateLimit from 'express-rate-limit';
import Subscriber from '../models/Subscriber.js';
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
const otpLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
router.post('/subscribe', otpLimit, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ message: 'Enter a valid email.' });
  try {
    await Subscriber.updateOne({ email }, { $setOnInsert: { email, consentAt: new Date() } }, { upsert: true });
    res.json({ success: true });
  } catch { res.status(503).json({ message: 'Unable to subscribe right now. Please try again.' }); }
});
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

export default router;

