// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
// import paymentRoutes from './routes/payment.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';


// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=================================');
console.log('🔍 ENVIRONMENT DEBUG INFO');
console.log('=================================');
console.log('📁 Current directory:', __dirname);
console.log('');

// Check if .env file exists
const envPath = join(__dirname, '.env');
console.log('📄 Looking for .env at:', envPath);

if (fs.existsSync(envPath)) {
  console.log('✅ .env file found!');
  console.log('📝 File size:', fs.statSync(envPath).size, 'bytes');
  console.log('');
  console.log('📄 .env file content:');
  console.log('---------------------------------');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(envContent);
  console.log('---------------------------------');
} else {
  console.log('❌ .env file NOT found!');
  console.log('💡 Please create .env file in:', __dirname);
  process.exit(1);
}

console.log('');

// Load environment variables
console.log('🔄 Loading .env with dotenv...');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env:', result.error);
  process.exit(1);
}

console.log('✅ dotenv loaded successfully');
console.log('');

// Check loaded variables
console.log('🔑 LOADED ENVIRONMENT VARIABLES:');
console.log('---------------------------------');
console.log('PORT:', process.env.PORT || 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('CLIENT_URL:', process.env.CLIENT_URL || 'NOT SET');
console.log('---------------------------------');
console.log('');

if (process.env.MONGODB_URI) {
  // Hide password in log
  const hiddenURI = process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log('📡 MongoDB URI (hidden):', hiddenURI);
  console.log('');
}

const app = express();

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  console.log('Please add MONGODB_URI to .env file');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    envLoaded: {
      port: process.env.PORT,
      mongoUri: !!process.env.MONGODB_URI,
      jwtSecret: !!process.env.JWT_SECRET
    }
  });
});

// Routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
// app.use('/api/payment', paymentRoutes);


// MongoDB Connection
console.log('🔄 Connecting to MongoDB...');
console.log('');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check if MongoDB is running');
    console.log('2. Check if username/password is correct');
    console.log('3. Check if IP is whitelisted in Atlas');
    console.log('4. Verify connection string format');
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('=================================');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Test API: http://localhost:${PORT}/api/test`);
  console.log('=================================');
});