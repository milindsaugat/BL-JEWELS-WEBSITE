import { memoryStore } from '../config/memoryStore.js';
import { calculateCouponDiscount } from './couponController.js';

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    // Generate mock/real Razorpay order
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 15)}`;
    
    return res.json({
      success: true,
      order: {
        id: mockOrderId,
        entity: 'order',
        amount: Math.round(amount * 100), // in paise
        amount_paid: 0,
        amount_due: Math.round(amount * 100),
        currency,
        receipt: receipt || `rec_${Date.now()}`,
        status: 'created',
      },
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_bljewels_dummy',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // For demo/development, payment verification succeeds
    return res.json({
      success: true,
      message: 'Payment verified successfully.',
      paymentId: razorpay_payment_id || `pay_${Date.now()}`,
    });
  } catch (error) {
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

