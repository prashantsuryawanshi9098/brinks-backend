// backend/routes/products.js (Updated)
import express from 'express';
import { protect, sellerOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  uploadSingleImage,
  uploadMultipleImages
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes - Seller only
router.get('/my/products', protect, sellerOnly, getMyProducts);
router.post('/', protect, sellerOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, sellerOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, sellerOnly, deleteProduct);

// Image upload routes
router.post('/upload/single', protect, sellerOnly, upload.single('image'), uploadSingleImage);
router.post('/upload/multiple', protect, sellerOnly, upload.array('images', 5), uploadMultipleImages);

export default router;