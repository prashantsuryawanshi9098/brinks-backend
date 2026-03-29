import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },
  role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const sellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  gstNumber: { type: String },
  panNumber: { type: String },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountName: String
  },
  isApproved: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 }
});

export const User = mongoose.model('User', userSchema);
export const Seller = mongoose.model('Seller', sellerSchema);