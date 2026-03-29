// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Debug: Check if credentials are loaded
console.log('🔧 Cloudinary Config:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌ Missing');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅' : '❌ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅' : '❌ Missing');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;