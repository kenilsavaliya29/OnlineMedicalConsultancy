import express from 'express';
import { 
  getAllDoctors, 
  getDoctorById, 
  updateAvailability, 
  getDoctorReviews,
  addDoctorReview,
  createDoctor,
  updateDoctor,
  deleteDoctor
} from '../controllers/doctorController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/reviews', getDoctorReviews);

// Protected routes
router.put('/:id/availability', verifyToken, authorizeRoles(['doctor']), updateAvailability);
router.post('/:id/reviews', verifyToken, authorizeRoles(['patient']), addDoctorReview);

// Admin routes
router.post(
  '/', 
  verifyToken, 
  authorizeRoles(['admin']), 
  upload.single('profileImage'),
  createDoctor
);

router.put(
  '/:id', 
  verifyToken, 
  authorizeRoles(['admin']), 
  upload.single('profileImage'),
  updateDoctor
);

router.delete(
  '/:id', 
  verifyToken, 
  authorizeRoles(['admin']), 
  deleteDoctor
);

export default router; 