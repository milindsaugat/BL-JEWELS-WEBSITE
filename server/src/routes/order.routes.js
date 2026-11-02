import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', optionalAuth, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', getOrderById);

// Admin order routes
router.get('/', optionalAuth, getAllOrders);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;

