import express from 'express';
import {
  getOccasions,
  getAllOccasions,
  createOccasion,
  updateOccasion,
  deleteOccasion,
} from '../controllers/occasionController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getOccasions);
router.get('/all', requireAuth, requireAdmin, getAllOccasions);
router.post('/', requireAuth, requireAdmin, createOccasion);
router.put('/:id', requireAuth, requireAdmin, updateOccasion);
router.delete('/:id', requireAuth, requireAdmin, deleteOccasion);

export default router;

