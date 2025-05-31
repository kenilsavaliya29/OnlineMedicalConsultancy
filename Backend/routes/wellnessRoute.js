import express from 'express';
import {
  createWellnessProfile,
  updateWellnessProfile,
  getWellnessProfile,
  deleteWellnessProfile,
} from '../controllers/wellnessController.js';
import { verifyPatient } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-profile', verifyPatient, createWellnessProfile);
router.patch('/update-profile', verifyPatient, updateWellnessProfile);
router.get('/get-profile', verifyPatient, getWellnessProfile);
router.delete('/delete-profile', verifyPatient, deleteWellnessProfile);

export default router;
