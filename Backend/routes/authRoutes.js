import express from 'express';
import { 
  signUp, 
  login, 
  logout, 
  getUser, 
  updateProfile, 
  updateUserPassword, 
  forgotPassword 
} from '../controllers/authController.js';
import { 
  verifyUser, 
  verifyAdmin, 
  verifyDoctor, 
  verifyPatient 
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Authentication check
router.post('/user', getUser);
router.post('/logout', verifyUser, logout);

// Protected routes - User management
router.patch('/update-profile', verifyUser, updateProfile);
router.patch('/update-password', verifyUser, updateUserPassword);

// Role-specific profile routes
router.get('/admin/profile', verifyAdmin, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.get('/doctor/profile', verifyDoctor, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.get('/patient/profile', verifyPatient, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router; 