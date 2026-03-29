// backend/controllers/productController.js (Updated with memory upload)
import { Product } from '../models/Product.js';
import { uploadToCloudinary } from '../middleware/upload.js';

export const getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      city,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = { isAvailable: true };
    
    if (category) query.category = category;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerUnit.$lte = parseFloat(maxPrice);
    }

    let sortOption = {};
    switch (sort) {
      case 'price_low':
        sortOption = { pricePerUnit: 1 };
        break;
      case 'price_high':
        sortOption = { pricePerUnit: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('sellerId', 'name rating'),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name email phone rating');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      sellerId: req.user.id
    };
    
    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const uploadedImages = await Promise.all(uploadPromises);
      productData.images = uploadedImages.map(img => img.secure_url);
    }
    
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updateData = { ...req.body };
    
    // Handle new images
    if (req.files && req.files.length > 0) {
      // Upload new images
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const uploadedImages = await Promise.all(uploadPromises);
      updateData.images = uploadedImages.map(img => img.secure_url);
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Delete images from Cloudinary if needed
    // Note: With memory upload, we don't have public IDs easily
    // You can skip deletion or implement later
    
    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Single image upload endpoint
export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ 
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Multiple images upload
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
    const uploadedImages = await Promise.all(uploadPromises);
    
    const images = uploadedImages.map(img => ({
      url: img.secure_url,
      publicId: img.public_id
    }));
    
    res.json({ images });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};