import express from 'express';
import { handleChat, handleSearchSuggest, handleGenerateDescription } from '../controllers/aiController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', handleChat);
router.post('/search-suggest', handleSearchSuggest);
router.post('/generate-description', protect, adminOnly, handleGenerateDescription);

export default router;

