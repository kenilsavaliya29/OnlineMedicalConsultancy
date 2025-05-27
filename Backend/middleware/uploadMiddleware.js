import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Setup storage location and filename strategy
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on user role or route
    let uploadPath = 'uploads';
    
    if (req.originalUrl.includes('/doctors')) {
      uploadPath = 'uploads/doctors';
    } else if (req.originalUrl.includes('/patients')) {
      uploadPath = 'uploads/patients';
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max size
  },
  fileFilter: fileFilter
}); 