import { sendCode, verifyCode, saveProfile, saveAddresses, orderAction } from '../controllers/customerController.js';
import rateLimit from 'express-rate-limit';
import { subscribeEmail } from '../controllers/subscriberController.js';
import express from 'express';
import {
  register,
  initiateRegister,
  verifyRegisterOtp,
  login,
  verifyLoginOtp,
  resendAuthOtp,
  getMe,
  logout,
  toggleWishlist,
  forgotPassword,
  verifyOtp,
  resetPassword,
  requestAdminCredentialOtp,
  updateAdminCredentials,
  getAdminSidebarBadges,
} from '../controllers/authController.js';
import { protect, optionalAuth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

const otpLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

router.post('/register', register);
router.post('/register-otp', otpLimit, initiateRegister);
router.post('/register-verify', otpLimit, verifyRegisterOtp);
router.post('/login', login);
router.post('/login-verify', otpLimit, verifyLoginOtp);
router.post('/resend-otp', otpLimit, resendAuthOtp);
router.post('/logout', logout);
router.post('/subscribe', otpLimit, subscribeEmail);
router.post('/email-code', otpLimit, sendCode('login'));
router.post('/email-verify', otpLimit, verifyCode('login'));
router.put('/profile', protect, saveProfile);
router.put('/addresses', protect, saveAddresses);
router.post('/orders/:id/action', protect, orderAction);
router.post('/forgot-password', otpLimit, forgotPassword);
router.post('/verify-otp', otpLimit, verifyOtp);
router.post('/reset-password', otpLimit, resetPassword);
router.post('/change-password-otp', protect, otpLimit, (req, res) => {
  req.body.email = req.user.email;
  return forgotPassword(req, res);
});
router.post('/change-password', protect, otpLimit, (req, res) => {
  req.body.email = req.user.email;
  return resetPassword(req, res);
});
router.get('/me', protect, getMe);
router.post('/wishlist/toggle', protect, toggleWishlist);
router.post('/admin/request-credential-otp', protect, adminOnly, requestAdminCredentialOtp);
router.post('/admin/update-credentials', protect, adminOnly, updateAdminCredentials);
router.get('/admin/sidebar-badges', protect, adminOnly, getAdminSidebarBadges);

export default router;

