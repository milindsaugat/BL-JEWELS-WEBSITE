import express from 'express';
import { getLiveRates } from '../controllers/rateController.js';

const router = express.Router();

router.get('/', getLiveRates);
router.get('/live', getLiveRates);

export default router;

