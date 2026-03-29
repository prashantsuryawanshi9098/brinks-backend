// backend/controllers/reviewController.js
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Seller } from '../models/User.js';

export const getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const reviews = await Review.find({ sellerId })
      .populate('userId', 'name')
      .sort('-createdAt');
    
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    
    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, comment, images } = req.body;
    
    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only review delivered orders' });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({ orderId, userId: req.user.id });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already submitted for this order' });
    }
    
    const review = await Review.create({
      userId: req.user.id,
      sellerId: order.sellerId,
      orderId,
      rating,
      comment,
      images
    });
    
    // Update seller's average rating
    const reviews = await Review.find({ sellerId: order.sellerId });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Seller.findOneAndUpdate(
      { userId: order.sellerId },
      { rating: averageRating }
    );
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.images = images || review.images;
    await review.save();
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the seller owns the reviewed order
    const order = await Order.findById(review.orderId);
    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    review.response = {
      text: response,
      date: new Date()
    };
    await review.save();
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};