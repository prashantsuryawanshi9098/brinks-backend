// backend/routes/reviews.js
import express from 'express';
import { protect, sellerOnly } from '../middleware/auth.js';
import {
  getSellerReviews,
  addReview,
  updateReview,
  deleteReview,
  respondToReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/seller/:sellerId', getSellerReviews);
router.post('/order/:orderId', protect, addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/respond', protect, sellerOnly, respondToReview);

export default router;