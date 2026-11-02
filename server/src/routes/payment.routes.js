import express from 'express';
import { createRazorpayOrder, verifyPayment, validateCoupon } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.post('/validate-coupon', validateCoupon);

export default router;

