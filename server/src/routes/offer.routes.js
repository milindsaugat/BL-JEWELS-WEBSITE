import express from 'express';
import {
  getActiveOffers,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../controllers/offerController.js';

const router = express.Router();

// Storefront public active offers
router.get('/active', getActiveOffers);

// Executive Admin CMS routes
router.get('/', getOffers);
router.post('/', createOffer);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);

export default router;

