import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  markOrderViewed,
  markAllOrdersViewed,
} from '../controllers/orderController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin order routes
router.get('/', protect, adminOnly, getAllOrders);
router.post('/mark-all-viewed', protect, adminOnly, markAllOrdersViewed);
router.patch('/:id/view', protect, adminOnly, markOrderViewed);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;

