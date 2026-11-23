import express from 'express';
import {
  getUsers,
  getUserStats,
  getUserById,
  updateUserStatus,
  updateUserRole,
  updateUserDetails,
  deleteUser,
  markUserViewed,
  markAllUsersViewed,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Enforce admin privileges on all user management routes
router.use(protect, adminOnly);

router.get('/stats', getUserStats);
router.post('/mark-all-viewed', markAllUsersViewed);
router.get('/', getUsers);
router.patch('/:id/view', markUserViewed);
router.get('/:id', getUserById);
router.put('/:id', updateUserDetails);
router.patch('/:id/status', updateUserStatus);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;

