import express from 'express';
import {
  getPublicCoupons,
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';

const router = express.Router();

// Storefront concurrent public routes
router.get('/public', getPublicCoupons);
router.post('/validate', validateCoupon);

// Executive Admin management routes
router.get('/', getCoupons);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;
