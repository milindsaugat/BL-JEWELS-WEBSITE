import { getDbStatus } from '../config/db.js';
import User from '../models/User.js';
import EmailChallenge from '../models/EmailChallenge.js';
import { memoryStore } from '../config/memoryStore.js';
import { generateTokens } from '../utils/generateToken.js';
import {
  isEmailConfigured,
  sendPasswordResetOtpEmail,
  sendAdminSecurityOtpEmail,
  sendAuthOtpEmail,
} from '../services/emailService.js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const makeDigest = (email, purpose, otp) =>
  crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'bl_jewels_super_secret_jwt_key_2026_dev')
    .update(`${String(email).toLowerCase().trim()}:${purpose}:${otp}`)
    .digest('hex');

const safeUser = (user) => ({
  id: user._id || user.id,
  name: user.name,
  email: user.email,
  username: user.username || '',
  phone: user.phone || '',
  avatar: user.avatar || '',
  panNumber: user.panNumber || '',
  panCardImage: user.panCardImage || '',
  role: user.role,
  addresses: user.addresses || [],
  wishlist: user.wishlist || [],
});

/**
 * Step 1 of Customer Registration:
 * Validates input and dispatches a 6-digit verification code to the customer's email.
 */
export const initiateRegister = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide your full name, email address, and password.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    if (getDbStatus()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please sign in.' });
      }
    } else {
      const existing = (memoryStore.users || []).find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please sign in.' });
      }
    }

    // Generate 6-digit verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const digest = makeDigest(cleanEmail, 'register', otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const pendingData = {
      name: String(name).trim(),
      email: cleanEmail,
      password: String(password),
      phone: String(phone || '').trim(),
    };

    if (getDbStatus()) {
      await EmailChallenge.findOneAndUpdate(
        { email: cleanEmail, purpose: 'register' },
        {
          $set: {
            digest,
            attempts: 0,
            sentAt: new Date(),
            expiresAt,
            pendingData,
          },
        },
        { upsert: true, new: true }
      );
    } else {
      if (!Array.isArray(memoryStore.challenges)) memoryStore.challenges = [];
      const idx = memoryStore.challenges.findIndex(c => c.email === cleanEmail && c.purpose === 'register');
      const challengeItem = { email: cleanEmail, purpose: 'register', digest, attempts: 0, sentAt: new Date(), expiresAt, pendingData };
      if (idx > -1) memoryStore.challenges[idx] = challengeItem;
      else memoryStore.challenges.push(challengeItem);
    }

    let emailSent = false;
    let emailReason = '';
    if (isEmailConfigured()) {
      try {
        const result = await sendAuthOtpEmail({
          to: cleanEmail,
          otp,
          userName: name,
          type: 'register',
        });
        emailSent = Boolean(result?.sent);
      } catch (err) {
        console.warn('Registration OTP email send error:', err.message);
        emailReason = err.message;
      }
    }

    return res.status(200).json({
      success: true,
      requireOtp: true,
      email: cleanEmail,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please enter it to complete registration.`,
      emailSent,
      emailReason,
      ...(process.env.NODE_ENV !== 'production' && !isEmailConfigured() ? { demoOtp: otp } : {}),
    });
  } catch (error) {
    console.error('initiateRegister error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Step 2 of Customer Registration:
 * Verifies the 6-digit OTP and creates the verified customer account.
 */
export const verifyRegisterOtp = async (req, res) => {
  try {
    const cleanEmail = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();

    if (!cleanEmail || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide both email address and verification code.' });
    }

    let challenge;
    if (getDbStatus()) {
      challenge = await EmailChallenge.findOne({ email: cleanEmail, purpose: 'register' });
    } else {
      challenge = (memoryStore.challenges || []).find(c => c.email === cleanEmail && c.purpose === 'register');
    }

    if (!challenge || !challenge.expiresAt || new Date(challenge.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (challenge.digest !== makeDigest(cleanEmail, 'register', otp)) {
      if (getDbStatus()) {
        await EmailChallenge.updateOne({ _id: challenge._id }, { $inc: { attempts: 1 } });
      }
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check your email and try again.' });
    }

    const { name, email, password, phone } = challenge.pendingData || req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Registration session expired. Please start registration again.' });
    }

    let user;
    if (getDbStatus()) {
      await EmailChallenge.deleteOne({ _id: challenge._id });

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      user = await User.create({
        name,
        email,
        password,
        phone,
        adminViewed: false,
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
        user: safeUser(user),
      });
    } else {
      memoryStore.challenges = (memoryStore.challenges || []).filter(c => !(c.email === cleanEmail && c.purpose === 'register'));

      const newUser = {
        _id: `usr_${Date.now()}`,
        name,
        email,
        phone: phone || '',
        role: 'customer',
        addresses: [],
        wishlist: [],
        adminViewed: false,
        createdAt: new Date().toISOString(),
      };
      if (!Array.isArray(memoryStore.users)) memoryStore.users = [];
      memoryStore.users.push(newUser);

      const { accessToken, refreshToken } = generateTokens(newUser._id, newUser.role);
      return res.status(201).json({
        success: true,
        accessToken,
        user: safeUser(newUser),
      });
    }
  } catch (error) {
    console.error('verifyRegisterOtp error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Universal registration endpoint:
 * If OTP is supplied, it verifies and creates the account.
 * If OTP is missing, it initiates registration and sends the OTP.
 */
export const register = async (req, res) => {
  if (req.body.otp) {
    return verifyRegisterOtp(req, res);
  }
  return initiateRegister(req, res);
};

/**
 * Step 1 of Sign-In:
 * Validates credentials and sends a 6-digit login verification code to customer email.
 * One-click demo account (demo@bljewels.com) and Administrator login proceed directly.
 */
export const login = async (req, res) => {
  try {
    // If OTP is supplied in login request, verify directly
    if (req.body.otp) {
      return verifyLoginOtp(req, res);
    }

    const rawIdentifier = req.body.email || req.body.username || req.body.identifier;
    const password = req.body.password;
    if (!rawIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your email or username and password.' });
    }

    const identifier = String(rawIdentifier).trim().toLowerCase();

    let user;
    if (getDbStatus()) {
      user = await User.findOne({
        $or: [
          { email: identifier },
          { username: identifier }
        ]
      }).select('+password');
    } else {
      user = (memoryStore.users || []).find(
        u =>
          (u.email && u.email.toLowerCase() === identifier) ||
          (u.username && u.username.toLowerCase() === identifier)
      );
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email/username and password.' });
    }

    // Compare password
    const isPasswordValid = typeof user.comparePassword === 'function'
      ? await user.comparePassword(password)
      : (password === 'DemoUser123!' || password === 'adminpassword123' || user.password === password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email/username and password.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Please contact support.' });
    }

    // 1-Click Demo User Bypass: demo@bljewels.com
    if (user.email === 'demo@bljewels.com' && password === 'DemoUser123!') {
      const { accessToken, refreshToken } = generateTokens(user._id || user.id, user.role);
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({
        success: true,
        accessToken,
        user: safeUser(user),
      });
    }

    // Admin direct access (preserves port 5174 executive panel login)
    if (user.role === 'admin') {
      const { accessToken, refreshToken } = generateTokens(user._id || user.id, user.role);
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({
        success: true,
        accessToken,
        user: safeUser(user),
      });
    }

    // Customer Login: Generate 6-digit Login OTP and send to registered email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const digest = makeDigest(user.email, 'login', otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (getDbStatus()) {
      await EmailChallenge.findOneAndUpdate(
        { email: user.email, purpose: 'login' },
        {
          $set: {
            digest,
            attempts: 0,
            sentAt: new Date(),
            expiresAt,
          },
        },
        { upsert: true, new: true }
      );
    } else {
      if (!Array.isArray(memoryStore.challenges)) memoryStore.challenges = [];
      const idx = memoryStore.challenges.findIndex(c => c.email === user.email && c.purpose === 'login');
      const challengeItem = { email: user.email, purpose: 'login', digest, attempts: 0, sentAt: new Date(), expiresAt };
      if (idx > -1) memoryStore.challenges[idx] = challengeItem;
      else memoryStore.challenges.push(challengeItem);
    }

    let emailSent = false;
    let emailReason = '';
    if (isEmailConfigured()) {
      try {
        const result = await sendAuthOtpEmail({
          to: user.email,
          otp,
          userName: user.name,
          type: 'login',
        });
        emailSent = Boolean(result?.sent);
      } catch (err) {
        console.warn('Login OTP email send error:', err.message);
        emailReason = err.message;
      }
    }

    return res.json({
      success: true,
      requireOtp: true,
      email: user.email,
      message: `A 6-digit verification code has been dispatched to ${user.email}.`,
      emailSent,
      emailReason,
      ...(process.env.NODE_ENV !== 'production' && !isEmailConfigured() ? { demoOtp: otp } : {}),
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Step 2 of Customer Sign-In:
 * Verifies the 6-digit Login OTP and authenticates the user session.
 */
export const verifyLoginOtp = async (req, res) => {
  try {
    const cleanEmail = String(req.body.email || req.body.identifier || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();

    if (!cleanEmail || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide both email address and verification code.' });
    }

    let challenge;
    if (getDbStatus()) {
      challenge = await EmailChallenge.findOne({ email: cleanEmail, purpose: 'login' });
    } else {
      challenge = (memoryStore.challenges || []).find(c => c.email === cleanEmail && c.purpose === 'login');
    }

    if (!challenge || !challenge.expiresAt || new Date(challenge.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (challenge.digest !== makeDigest(cleanEmail, 'login', otp)) {
      if (getDbStatus()) {
        await EmailChallenge.updateOne({ _id: challenge._id }, { $inc: { attempts: 1 } });
      }
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check your email and try again.' });
    }

    // Challenge verified: delete challenge
    if (getDbStatus()) {
      await EmailChallenge.deleteOne({ _id: challenge._id });
    } else {
      memoryStore.challenges = (memoryStore.challenges || []).filter(c => !(c.email === cleanEmail && c.purpose === 'login'));
    }

    let user;
    if (getDbStatus()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = (memoryStore.users || []).find(u => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id || user.id, user.role);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      accessToken,
      user: safeUser(user),
    });
  } catch (error) {
    console.error('verifyLoginOtp error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Resends 6-digit OTP for Registration or Login with 60-second cooldown rate limit.
 */
export const resendAuthOtp = async (req, res) => {
  try {
    const cleanEmail = String(req.body.email || '').trim().toLowerCase();
    const purpose = req.body.purpose === 'register' ? 'register' : 'login';

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Please provide email address.' });
    }

    let challenge;
    if (getDbStatus()) {
      challenge = await EmailChallenge.findOne({ email: cleanEmail, purpose });
    } else {
      challenge = (memoryStore.challenges || []).find(c => c.email === cleanEmail && c.purpose === purpose);
    }

    // Cooldown check (60 seconds)
    if (challenge && challenge.sentAt) {
      const elapsed = Date.now() - new Date(challenge.sentAt).getTime();
      if (elapsed < 60000) {
        const remaining = Math.ceil((60000 - elapsed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remaining} seconds before requesting another code.`,
          remainingSeconds: remaining,
        });
      }
    }

    let userName = 'Valued Customer';
    if (purpose === 'register') {
      userName = challenge?.pendingData?.name || 'Customer';
    } else {
      if (getDbStatus()) {
        const u = await User.findOne({ email: cleanEmail });
        if (u) userName = u.name;
      } else {
        const u = (memoryStore.users || []).find(u => u.email.toLowerCase() === cleanEmail);
        if (u) userName = u.name;
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const digest = makeDigest(cleanEmail, purpose, otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (getDbStatus()) {
      await EmailChallenge.findOneAndUpdate(
        { email: cleanEmail, purpose },
        {
          $set: {
            digest,
            attempts: 0,
            sentAt: new Date(),
            expiresAt,
          },
        },
        { upsert: true, new: true }
      );
    } else {
      if (!Array.isArray(memoryStore.challenges)) memoryStore.challenges = [];
      const idx = memoryStore.challenges.findIndex(c => c.email === cleanEmail && c.purpose === purpose);
      const challengeItem = { email: cleanEmail, purpose, digest, attempts: 0, sentAt: new Date(), expiresAt, pendingData: challenge?.pendingData };
      if (idx > -1) memoryStore.challenges[idx] = challengeItem;
      else memoryStore.challenges.push(challengeItem);
    }

    let emailSent = false;
    if (isEmailConfigured()) {
      try {
        const result = await sendAuthOtpEmail({
          to: cleanEmail,
          otp,
          userName,
          type: purpose,
        });
        emailSent = Boolean(result?.sent);
      } catch (err) {
        console.warn('Resend OTP email send error:', err.message);
      }
    }

    return res.json({
      success: true,
      message: `A new verification code has been dispatched to ${cleanEmail}.`,
      emailSent,
      ...(process.env.NODE_ENV !== 'production' && !isEmailConfigured() ? { demoOtp: otp } : {}),
    });
  } catch (error) {
    console.error('resendAuthOtp error:', error);
    return res.status(500).json({ success: false, message: error.message });
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

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+resetOtp +resetExpiry');
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

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+resetOtp +resetExpiry');
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

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+resetOtp +resetExpiry');
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
      message: 'Your password has been updated successfully. Please log in with your new password.',
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

export const getAdminSidebarBadges = async (req, res) => {
  try {
    let unviewedOrders = 0;
    let unviewedCustomers = 0;
    let unviewedSupport = 0;
    let unviewedSubscribers = 0;
    let pendingVerification = 0;
    let pendingReviews = 0;

    if (getDbStatus()) {
      const Order = (await import('../models/Order.js')).default;
      const SupportTicket = (await import('../models/SupportTicket.js')).default;
      const User = (await import('../models/User.js')).default;
      const Subscriber = (await import('../models/Subscriber.js')).default;
      const Review = (await import('../models/Review.js')).default;

      const [ordersPending, customersNew, ticketsUnviewed, subsUnviewed, verifications, unapprovedReviews] =
        await Promise.all([
          Order.countDocuments({
            adminViewed: false,
          }),
          User.countDocuments({
            role: { $ne: 'admin' },
            adminViewed: false,
          }),
          SupportTicket.countDocuments({
            adminViewed: false,
            status: { $ne: 'closed' },
          }),
          Subscriber.countDocuments({
            status: 'subscribed',
            adminViewed: false,
          }),
          Order.countDocuments({
            'payment.status': 'verification_pending',
          }),
          Review.countDocuments({
            isApproved: false,
          }).catch(() => 0),
        ]);

      unviewedOrders = ordersPending;
      unviewedCustomers = customersNew;
      unviewedSupport = ticketsUnviewed;
      unviewedSubscribers = subsUnviewed;
      pendingVerification = verifications;
      pendingReviews = unapprovedReviews;
    } else {
      unviewedOrders = (memoryStore.orders || []).filter((o) => o.adminViewed === false).length;
      unviewedCustomers = (memoryStore.users || []).filter(
        (u) => u.role !== 'admin' && u.adminViewed === false
      ).length;
      unviewedSupport = (memoryStore.tickets || []).filter(
        (t) => t.adminViewed === false && t.status !== 'closed'
      ).length;
      unviewedSubscribers = (memoryStore.subscribers || []).filter(
        (s) => s.status === 'subscribed' && s.adminViewed === false
      ).length;
      pendingVerification = (memoryStore.orders || []).filter(
        (o) => o.payment?.status === 'verification_pending'
      ).length;
      pendingReviews = 0;
    }

    return res.json({
      success: true,
      badges: {
        orders: unviewedOrders,
        customers: unviewedCustomers,
        support: unviewedSupport,
        subscribers: unviewedSubscribers,
        verificationPending: pendingVerification,
        reviews: pendingReviews,
      },
    });
  } catch (error) {
    console.error('getAdminSidebarBadges error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch badges.' });
  }
};

