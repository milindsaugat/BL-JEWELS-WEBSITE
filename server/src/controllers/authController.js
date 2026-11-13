import { getDbStatus } from '../config/db.js';
import User from '../models/User.js';
import { memoryStore } from '../config/memoryStore.js';
import { generateTokens } from '../utils/generateToken.js';
import { isEmailConfigured, sendPasswordResetOtpEmail, sendAdminSecurityOtpEmail } from '../services/emailService.js';
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
          username: user.username || '',
          phone: user.phone || '',
          avatar: user.avatar || '',
          panNumber: user.panNumber || '',
          panCardImage: user.panCardImage || '',
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
    const rawIdentifier = req.body.email || req.body.username || req.body.identifier;
    const password = req.body.password;
    if (!rawIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your email or username and password.' });
    }

    const identifier = String(rawIdentifier).trim().toLowerCase();

    if (getDbStatus()) {
      const user = await User.findOne({
        $or: [
          { email: identifier },
          { username: identifier }
        ]
      }).select('+password');

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email/username and password.' });
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
          username: user.username || '',
          username: user.username || '',
          phone: user.phone || '',
          avatar: user.avatar || '',
          panNumber: user.panNumber || '',
          panCardImage: user.panCardImage || '',
          role: user.role,
          addresses: user.addresses,
          wishlist: user.wishlist,
        },
      });
    }

    // Memory store fallback
    const memUser = (memoryStore.users || []).find(
      u =>
        (u.email && u.email.toLowerCase() === identifier) ||
        (u.username && u.username.toLowerCase() === identifier)
    );
    if (memUser) {
      const { accessToken, refreshToken } = generateTokens(memUser._id, memUser.role);
      return res.json({
        success: true,
        accessToken,
        user: { ...memUser, id: memUser._id },
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

/**
 * Request OTP for administrator credential changes (username, email, password)
 */
export const requestAdminCredentialOtp = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Administrative access required.' });
    }

    const { action } = req.body || {}; // 'email_username' | 'password' | 'credentials'
    const adminEmail = req.user.email;
    if (!adminEmail) {
      return res.status(400).json({ success: false, message: 'No registered admin email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (getDbStatus()) {
      const user = await User.findById(req.user._id || req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'Admin account not found.' });
      user.resetOtp = otp;
      user.resetExpiry = new Date(Date.now() + 10 * 60 * 1000);
      user.resetAction = action || 'credentials';
      await user.save();
    } else {
      const user = memoryStore.users.find(u => u._id === (req.user._id || req.user.id));
      if (user) {
        user.resetOtp = otp;
        user.resetExpiry = new Date(Date.now() + 10 * 60 * 1000);
        user.resetAction = action || 'credentials';
      }
    }

    if (isEmailConfigured()) {
      await sendAdminSecurityOtpEmail({
        to: adminEmail,
        otp,
        adminName: req.user.name || 'Administrator',
        action: action || 'credentials',
      });
    }

    const actionText = action === 'password'
      ? 'password change'
      : action === 'email_username'
      ? 'email & username update'
      : 'credential update';

    return res.json({
      success: true,
      message: `Security authorization code for ${actionText} sent to ${adminEmail}.`,
      ...(process.env.NODE_ENV !== 'production' && !isEmailConfigured() ? { demoOtp: otp } : {}),
    });
  } catch (error) {
    console.error('requestAdminCredentialOtp error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to dispatch security OTP.' });
  }
};

/**
 * Update administrator credentials (username, email, password, name) after verifying OTP
 */
export const updateAdminCredentials = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Administrative access required.' });
    }

    const { otp, username, email, newEmail, newPassword, password, name, action } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'Please enter the 6-digit security authorization code.' });
    }

    let user;
    if (getDbStatus()) {
      user = await User.findById(req.user._id || req.user.id);
    } else {
      user = memoryStore.users.find(u => u._id === (req.user._id || req.user.id));
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    if (!user.resetOtp || user.resetOtp !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }
    if (!user.resetExpiry || new Date(user.resetExpiry) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    const updatedFields = [];

    // Username update
    if (username && username.trim() && username.trim().toLowerCase() !== String(user.username || '').toLowerCase()) {
      const cleanUsername = String(username).trim().toLowerCase();
      if (!/^[a-z0-9_-]{3,30}$/.test(cleanUsername)) {
        return res.status(400).json({ success: false, message: 'Username must be 3-30 characters (letters, numbers, underscores, hyphens).' });
      }
      if (getDbStatus()) {
        const existing = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
        if (existing) {
          return res.status(400).json({ success: false, message: 'This username is already taken by another account.' });
        }
      }
      user.username = cleanUsername;
      updatedFields.push('username');
    }

    // Email update (check newEmail or email)
    const candidateEmail = newEmail || email;
    if (candidateEmail && candidateEmail.trim() && candidateEmail.trim().toLowerCase() !== String(user.email).toLowerCase()) {
      const cleanEmail = String(candidateEmail).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      }
      if (getDbStatus()) {
        const existing = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
        if (existing) {
          return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
        }
      }
      user.email = cleanEmail;
      updatedFields.push('email');
    }

    // Password update (check newPassword or password)
    const candidatePassword = newPassword || password;
    if (candidatePassword && candidatePassword.trim()) {
      if (candidatePassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
      }
      user.password = candidatePassword;
      updatedFields.push('password');
    }

    if (name && name.trim()) {
      user.name = String(name).trim();
    }

    user.resetOtp = undefined;
    user.resetExpiry = undefined;
    user.resetAction = undefined;

    if (getDbStatus() && typeof user.save === 'function') {
      await user.save();
    }

    const message = updatedFields.length > 0
      ? `Administrator ${updatedFields.join(' & ')} updated successfully!`
      : 'Administrator details verified and updated!';

    return res.json({
      success: true,
      message,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || '',
        role: user.role,
        avatar: user.avatar || '',
      },
    });
  } catch (error) {
    console.error('updateAdminCredentials error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update credentials.' });
  }
};

