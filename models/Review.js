import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  images: [{ type: String }],
  response: {
    text: String,
    date: Date
  },
  createdAt: { type: Date, default: Date.now }
});

export const Review = mongoose.model('Review', reviewSchema);