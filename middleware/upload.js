// backend/middleware/upload.js
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Only images allowed! Received: ${file.mimetype}`), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper function to upload buffer to Cloudinary
export const uploadToCloudinary = (buffer, folder = 'bricks_marketplace') => {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      reject(new Error('No buffer provided'));
      return;
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload success:', result.secure_url);
          resolve(result);
        }
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export default upload;