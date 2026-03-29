// backend/routes/orders.js
import express from 'express';
import { protect, sellerOnly } from '../middleware/auth.js';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getSellerOrders
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/seller/orders', protect, sellerOnly, getSellerOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, sellerOnly, updateOrderStatus);

export default router;