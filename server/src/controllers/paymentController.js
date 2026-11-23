import Razorpay from 'razorpay';
import crypto from 'node:crypto';
import Order from '../models/Order.js';
import { getDbStatus } from '../config/db.js';
import { calculateCouponDiscount } from './couponController.js';

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret || key_id === 'rzp_test_bljewels_dummy') {
    return null;
  }
  return new Razorpay({ key_id, key_secret });
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, orderId } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    const rzp = getRazorpayInstance();

    let razorpayOrder;

    if (rzp) {
      razorpayOrder = await rzp.orders.create({
        amount: amountInPaise,
        currency,
        receipt: (receipt || `rec_${Date.now()}`).slice(0, 40),
        notes: {
          brand: 'BL Jewels',
          orderId: String(orderId || '').slice(0, 40),
        },
      });
    } else {
      // Mock fallback if keys not configured
      razorpayOrder = {
        id: `order_${Math.random().toString(36).substring(2, 15)}`,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency,
        receipt: receipt || `rec_${Date.now()}`,
        status: 'created',
      };
    }

    if (orderId && getDbStatus()) {
      try {
        await Order.findByIdAndUpdate(orderId, {
          'payment.razorpayOrderId': razorpayOrder.id,
        });
      } catch (e) {
        console.warn('Could not attach razorpayOrderId to order:', e.message);
      }
    }

    return res.json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_U1X7Tha64ITwiE',
    });
  } catch (error) {
    console.error('Razorpay createRazorpayOrder error:', error);
    res.status(500).json({
      success: false,
      message: error?.error?.description || error.message || 'Failed to initialize Razorpay payment',
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification parameters.',
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    let isValid = false;

    if (secret && secret !== 'dummy_secret') {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isValid = generatedSignature === razorpay_signature;
    } else {
      isValid = true;
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: invalid signature. Security check rejected.',
      });
    }

    // Update order status in MongoDB Atlas
    if (getDbStatus()) {
      const query = {
        $or: [
          ...(orderId && /^[0-9a-fA-F]{24}$/.test(orderId) ? [{ _id: orderId }] : []),
          ...(orderId ? [{ orderNumber: orderId }] : []),
          { 'payment.razorpayOrderId': razorpay_order_id },
        ],
      };

      const order = await Order.findOne(query);
      if (order) {
        order.payment.status = 'paid';
        order.payment.paidAt = new Date();
        order.payment.razorpayOrderId = razorpay_order_id;
        order.payment.razorpayPaymentId = razorpay_payment_id;
        order.payment.razorpaySignature = razorpay_signature;
        order.status = 'confirmed';
        order.statusHistory.push({
          status: 'confirmed',
          note: `Payment verified successfully via Razorpay (Payment ID: ${razorpay_payment_id}).`,
          updatedAt: new Date(),
        });
        await order.save();
      }
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully.',
      paymentId: razorpay_payment_id,
      orderId,
    });
  } catch (error) {
    console.error('Razorpay verifyPayment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal = 0 } = req.body;
    const result = await calculateCouponDiscount(code, cartTotal);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: result.message,
        shortfall: result.shortfall,
        minOrderValue: result.minOrderValue,
      });
    }

    return res.json({
      success: true,
      valid: true,
      coupon: result.coupon,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
