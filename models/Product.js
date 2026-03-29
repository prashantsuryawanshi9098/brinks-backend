import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['solid', 'hollow', 'fly_ash', 'clay', 'concrete', 'other'],
    required: true 
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  weight: { type: Number },
  material: String,
  color: String,
  pricePerUnit: { type: Number, required: true },
  pricePerThousand: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  description: String,
  location: {
    city: String,
    pincode: String,
    address: String
  },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Product = mongoose.model('Product', productSchema);