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
const safeUser = u => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  avatar: u.avatar || '',
  panNumber: u.panNumber || '',
  panCardImage: u.panCardImage || '',
  role: u.role,
  addresses: u.addresses,
  wishlist: u.wishlist
});
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
      try {
        await nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER || process.env.SMTP_USER, pass: (process.env.EMAIL_APP_PASSWORD || process.env.SMTP_PASS).replace(/\s/g, '') } }).sendMail({
          from: process.env.EMAIL_USER || process.env.SMTP_USER, to: email,
          subject: `BL Jewels ${purpose === 'login' ? 'sign-in' : 'password reset'} code`,
          text: `Your BL Jewels verification code is ${otp}. It expires in 10 minutes. Do not share this code.`,
        });
      } catch (mailErr) {
        console.warn('customerController mail send error:', mailErr.message);
      }
    }
    res.json({ success: true, message: 'Verification code generated.', otp, demoOtp: otp, retryAfter: 60 });
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
    const requestedName = req.body.name !== undefined ? String(req.body.name).trim() : req.user.name;
    const requestedPhone = req.body.phone !== undefined ? String(req.body.phone).trim() : (req.user.phone || '');

    // Customer details (Name & Phone) are locked for non-admin users. They must raise a support ticket.
    if (req.user.role !== 'admin') {
      const isNameChanged = requestedName && requestedName !== req.user.name;
      const isPhoneChanged = requestedPhone !== (req.user.phone || '');
      if (isNameChanged || isPhoneChanged) {
        return res.status(403).json({
          message: 'Customer personal details (Name & Phone) are verified and locked. To update your profile details, please submit a Support Request.',
        });
      }
    } else {
      if (requestedName) req.user.name = requestedName;
      if (requestedPhone) req.user.phone = requestedPhone;
    }

    // Avatar can be updated or removed
    if (req.body.avatar !== undefined) {
      req.user.avatar = String(req.body.avatar || '').trim();
    }

    // PAN Card number & document image (KYC compliance)
    if (req.body.panNumber !== undefined) {
      const cleanPan = String(req.body.panNumber || '').trim().toUpperCase();
      if (cleanPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
        return res.status(400).json({
          message: 'Please provide a valid 10-character PAN number (e.g. ABCDE1234F).',
        });
      }
      req.user.panNumber = cleanPan;
    }

    if (req.body.panCardImage !== undefined) {
      req.user.panCardImage = String(req.body.panCardImage || '').trim();
    }

    if (typeof req.user.save === 'function') {
      await req.user.save();
    }
    res.json({ success: true, user: safeUser(req.user) });
  } catch {
    res.status(503).json({ message: 'Could not save profile.' });
  }
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
  const { action, reason, comments } = req.body;
  const allowed = action === 'cancel' ? ['placed','confirmed'] : action === 'return' ? ['delivered'] : [];
  try {
    if (action === 'cancel') {
      const selectedReason = (reason && String(reason).trim()) || 'Cancelled by customer';
      const cleanComments = (comments && String(comments).trim()) || '';
      const note = `Cancelled by customer. Reason: ${selectedReason}${cleanComments ? ` (${cleanComments})` : ''}; refund subject to review.`;
      const order = await cancelInventoryOrder(
        { _id: req.params.id, user: req.user._id, status: { $in: ['placed','confirmed'] } },
        note,
        selectedReason,
        cleanComments
      );
      return res.json({ success: true, order });
    }
    const status = 'return_requested';
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: { $in: allowed } },
      {
        $set: { status },
        $push: {
          statusHistory: {
            status,
            note: `Requested by customer; Reason: ${reason || 'Customer request'}; refund/return subject to review.`,
            updatedAt: new Date(),
          },
        },
      },
      { new: true }
    );
    if (!order) return res.status(400).json({ message: 'This action is not available for this order.' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to update this order.' });
  }
};
