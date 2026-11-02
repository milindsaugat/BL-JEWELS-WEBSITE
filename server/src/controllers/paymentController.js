import { memoryStore } from '../config/memoryStore.js';

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
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide coupon code.' });
    }

    const coupon = memoryStore.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum cart value of ₹${coupon.minOrderValue.toLocaleString('en-IN')}.`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.min((cartTotal * coupon.value) / 100, coupon.maxDiscount);
    } else {
      discount = Math.min(coupon.value, coupon.maxDiscount);
    }

    return res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        calculatedDiscount: discount,
      },
      message: `Coupon ${coupon.code} applied! You save ₹${discount.toLocaleString('en-IN')}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

