import { cancelInventoryOrder } from '../services/orderInventory.js';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Challenge from '../models/EmailChallenge.js';
import { getDbStatus } from '../config/db.js';
import { generateTokens } from '../utils/generateToken.js';
import { isEmailConfigured } from '../services/emailService.js';

const digest = (email, purpose, otp) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${email}:${purpose}:${otp}`).digest('hex');
const emailOf = req => String(req.body.email || '').trim().toLowerCase();
const safeUser = u => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, addresses: u.addresses, wishlist: u.wishlist });
export const sendCode = purpose => async (req, res) => {
  const email = emailOf(req);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ message: 'Enter a valid email.' });
  if (!getDbStatus() || !process.env.JWT_SECRET || !isEmailConfigured()) return res.status(503).json({ message: 'Email sign-in is not available yet. Please try again later.' });
  try {
    const now = new Date();
    const otp = String(crypto.randomInt(100000, 1000000));
    // Unique index + conditional upsert reserve the resend slot across concurrent requests.
    await Challenge.findOneAndUpdate({ email, purpose, sentAt: { $lt: new Date(Date.now() - 60000) } },
      { $set: { digest: digest(email, purpose, otp), attempts: 0, sentAt: now, expiresAt: new Date(Date.now() + 600000) } }, { upsert: true });
    const user = await User.findOne({ email });
    if (purpose === 'login' || user) {
      await nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER || process.env.SMTP_USER, pass: (process.env.EMAIL_APP_PASSWORD || process.env.SMTP_PASS).replace(/\s/g, '') } }).sendMail({
        from: process.env.EMAIL_USER || process.env.SMTP_USER, to: email,
        subject: `BL Jewels ${purpose === 'login' ? 'sign-in' : 'password reset'} code`,
        text: `Your BL Jewels verification code is ${otp}. It expires in 10 minutes. Do not share this code.`,
      });
    }
    res.json({ success: true, message: 'If eligible, a code has been sent to your email.', retryAfter: 60 });
  } catch (error) {
    if (error.code === 11000) return res.status(429).json({ message: 'Please wait 60 seconds before requesting another code.' });
    res.status(503).json({ message: 'Could not send email. Please try again later.' });
  }
};
export const verifyCode = (purpose, consume = true) => async (req, res) => {
  try {
    const email = emailOf(req), otp = String(req.body.otp || '');
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ message: 'Enter the six-digit code.' });
    if (purpose === 'reset' && consume && (typeof req.body.newPassword !== 'string' || req.body.newPassword.length < 8)) return res.status(400).json({ message: 'Use at least 8 characters for your password.' });
    const challenge = await Challenge.findOneAndUpdate({ email, purpose, attempts: { $lt: 5 }, expiresAt: { $gt: new Date() } }, { $inc: { attempts: 1 } }, { new: true });
    if (!challenge || challenge.digest !== digest(email, purpose, otp)) return res.status(400).json({ message: 'Invalid or expired code. Request a new code if needed.' });
    if (!consume) return res.json({ success: true });
    const used = await Challenge.findOneAndDelete({ _id: challenge._id, digest: challenge.digest });
    if (!used) return res.status(400).json({ message: 'This code has already been used.' });
    let user = await User.findOne({ email });
    if (purpose === 'reset') {
      if (!user || !user.isActive) return res.status(400).json({ message: 'Unable to reset this account.' });
      user.password = req.body.newPassword; await user.save();
      return res.json({ success: true, message: 'Password updated. Please sign in.' });
    }
    if (!user) user = await User.create({ email, name: String(req.body.name || email.split('@')[0]).slice(0, 80), password: crypto.randomBytes(32).toString('hex') });
    if (!user.isActive) return res.status(403).json({ message: 'Account is inactive.' });
    const { accessToken } = generateTokens(user._id, user.role);
    res.json({ success: true, accessToken, user: safeUser(user) });
  } catch { res.status(503).json({ message: 'Unable to verify right now. Please try again.' }); }
};
export const saveProfile = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim(), phone = String(req.body.phone || '').trim();
    if (!name || name.length > 80 || (phone && !/^[+\d\s-]{7,20}$/.test(phone))) return res.status(400).json({ message: 'Enter a valid name and phone.' });
    req.user.name = name; req.user.phone = phone; await req.user.save();
    res.json({ success: true, user: safeUser(req.user) });
  } catch { res.status(503).json({ message: 'Could not save profile.' }); }
};
export const saveAddresses = async (req, res) => {
  try {
    const list = req.body.addresses;
    if (!Array.isArray(list) || list.length > 10) return res.status(400).json({ message: 'Up to 10 addresses allowed.' });
    const keys = ['label', 'name', 'phone', 'line1', 'line2', 'city', 'state', 'pincode'];
    const addresses = list.map(a => Object.fromEntries(keys.map(k => [k, String(a[k] || '').trim().slice(0, 200)])));
    if (addresses.some(a => !a.name || !a.line1 || !a.city || !a.state || !/^\d{6}$/.test(a.pincode) || !/^[+\d\s-]{7,20}$/.test(a.phone) || !['Home','Office','Other'].includes(a.label))) return res.status(400).json({ message: 'Complete every address and use a valid phone and six-digit PIN.' });
    req.user.addresses = addresses.map((a, i) => ({ ...a, isDefault: i === 0 })); await req.user.save();
    res.json({ success: true, user: safeUser(req.user) });
  } catch { res.status(503).json({ message: 'Could not save addresses.' }); }
};
export const orderAction = async (req, res) => {
  const action = req.body.action;
  const allowed = action === 'cancel' ? ['placed','confirmed'] : action === 'return' ? ['delivered'] : [];
  try {
    if (action === 'cancel') {
      const order = await cancelInventoryOrder({ _id: req.params.id, user: req.user._id, status: { $in: ['placed','confirmed'] } }, 'Cancelled by customer; refund subject to review.');
      return res.json({ success: true, order });
    }
    const status = 'return_requested';
    const order = await Order.findOneAndUpdate({ _id: req.params.id, user: req.user._id, status: { $in: allowed } }, { $set: { status }, $push: { statusHistory: { status, note: 'Requested by customer; refund/return subject to review.', updatedAt: new Date() } } }, { new: true });
    if (!order) return res.status(400).json({ message: 'This action is not available for this order.' });
    res.json({ success: true, order });
  } catch { res.status(400).json({ message: 'Unable to update this order.' }); }
};
