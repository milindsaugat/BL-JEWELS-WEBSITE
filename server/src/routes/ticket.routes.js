import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  submitContactInquiry,
  createMyTicket,
  getMyTickets,
  replyToMyTicket,
  getAllTickets,
  replyTicket,
  updateTicketStatus,
  deleteTicket,
} from '../controllers/ticketController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many inquiries submitted. Please try again shortly.' },
});

// Public storefront contact form (attaches logged-in user if present)
router.post('/contact', contactLimiter, optionalAuth, submitContactInquiry);

// Authenticated customer support ticket endpoints
router.get('/my', protect, getMyTickets);
router.post('/my', protect, createMyTicket);
router.post('/my/:id/reply', protect, replyToMyTicket);

// Admin unified support & contact inquiry management
router.get('/', protect, adminOnly, getAllTickets);
router.post('/:id/reply', protect, adminOnly, replyTicket);
router.patch('/:id/status', protect, adminOnly, updateTicketStatus);
router.delete('/:id', protect, adminOnly, deleteTicket);

export default router;

