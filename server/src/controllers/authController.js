import { getDbStatus } from '../config/db.js';
import User from '../models/User.js';
import { memoryStore } from '../config/memoryStore.js';
import { generateTokens } from '../utils/generateToken.js';
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
    } else {
      // Memory store fallback
      let user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Auto-create if demo user or matches admin
      if (!user && (email.toLowerCase().includes('admin') || email.toLowerCase().includes('demo') || email.toLowerCase().includes('test'))) {
        user = {
          _id: email.includes('admin') ? 'usr_admin' : `usr_${Date.now()}`,
          name: email.includes('admin') ? 'BL Jewels Administrator' : 'Valued Customer',
          email: email.toLowerCase(),
          role: email.includes('admin') ? 'admin' : 'customer',
          addresses: [],
          wishlist: [],
        };
        memoryStore.users.push(user);
      } else if (!user) {
        // Allow instant login for demo simplicity
        user = {
          _id: `usr_${Date.now()}`,
          name: email.split('@')[0].toUpperCase(),
          email: email.toLowerCase(),
          role: 'customer',
          addresses: [],
          wishlist: [],
        };
        memoryStore.users.push(user);
      }

      const { accessToken, refreshToken } = generateTokens(user._id, user.role);
      return res.json({
        success: true,
        accessToken,
        user,
      });
    }
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

