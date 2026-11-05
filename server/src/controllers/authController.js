import { getDbStatus } from '../config/db.js';
import User from '../models/User.js';
import { memoryStore } from '../config/memoryStore.js';
import { generateTokens } from '../utils/generateToken.js';
import { isEmailConfigured, sendPasswordResetOtpEmail } from '../services/emailService.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (getDbStatus()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone,
      });

      const { accessToken, refreshToken } = generateTokens(user._id, user.role);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          addresses: user.addresses,
          wishlist: user.wishlist,
        },
      });
    } else {
      // Memory store fallback
      const existing = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const newUser = {
        _id: `usr_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        role: 'customer',
        addresses: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
      };
      memoryStore.users.push(newUser);

      const { accessToken, refreshToken } = generateTokens(newUser._id, newUser.role);
      return res.status(201).json({
        success: true,
        accessToken,
        user: newUser,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password.' });
    }

    if (getDbStatus()) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
      }

      const { accessToken, refreshToken } = generateTokens(user._id, user.role);
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          addresses: user.addresses,
          wishlist: user.wishlist,
        },
      });
    }

    return res.status(503).json({
      success: false,
      message: 'Database service is currently unavailable. Please verify MongoDB connection.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    if (getDbStatus() && req.user) {
      return res.json({ success: true, user: req.user });
    }
    const user = memoryStore.users.find(u => u._id === (req.user?.id || 'usr_customer')) || memoryStore.users[1];
    return res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully.' });
};

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user?._id || req.user?.id || 'usr_customer';

    if (getDbStatus()) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const idx = user.wishlist.indexOf(productId);
      if (idx > -1) {
        user.wishlist.splice(idx, 1);
      } else {
        user.wishlist.push(productId);
      }
      await user.save();
      return res.json({ success: true, wishlist: user.wishlist });
    } else {
      const user = memoryStore.users.find(u => u._id === userId) || memoryStore.users[1];
      if (!user.wishlist) user.wishlist = [];
      const idx = user.wishlist.indexOf(productId);
      if (idx > -1) {
        user.wishlist.splice(idx, 1);
      } else {
        user.wishlist.push(productId);
      }
      return res.json({ success: true, wishlist: user.wishlist });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Initiates forgot password flow by dispatching 6-digit OTP via Google SMTP.
 * Strictly checks for real SMTP credentials - no mock, no fallback.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    if (!getDbStatus()) {
      return res.status(503).json({ success: false, message: 'Database service is currently unavailable.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered administrator or customer account found with this email.' });
    }

    // Check if live Google SMTP is configured
    if (!isEmailConfigured()) {
      return res.status(503).json({
        success: false,
        code: 'EMAIL_SERVICE_NOT_CONFIGURED',
        message: 'Google SMTP email service is not configured yet. Please configure EMAIL_USER and EMAIL_APP_PASSWORD in server/.env to enable live OTP delivery.',
      });
    }

    // Generate secure 6-digit verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity
    await user.save();

    await sendPasswordResetOtpEmail({
      to: user.email,
      otp,
      userName: user.name || 'Administrator',
    });

    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${user.email}.`,
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch password reset code.',
    });
  }
};

/**
 * Validates the 6-digit OTP before allowing password change.
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide both email address and verification code.' });
    }

    if (!getDbStatus()) {
      return res.status(503).json({ success: false, message: 'Database service is currently unavailable.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (!user.resetOtp || user.resetOtp !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code entered. Please check and try again.' });
    }

    if (!user.resetExpiry || user.resetExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    return res.json({
      success: true,
      message: 'Verification code confirmed successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Resets the password using confirmed OTP.
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, verification code, and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    if (!getDbStatus()) {
      return res.status(503).json({ success: false, message: 'Database service is currently unavailable.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (!user.resetOtp || user.resetOtp !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    if (!user.resetExpiry || user.resetExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    // Set new password (bcrypt hashing handled by User model pre-save hook)
    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetExpiry = undefined;
    await user.save();

    return res.json({
      success: true,
      message: 'Your administrator password has been updated successfully. Please log in with your new password.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

