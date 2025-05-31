import express from 'express';
import {
  getPatientProfileStatus,
  updatePatientMedicalProfile,
  getMedicalProfile
} from '../controllers/patientProfileController.js';
import { verifyUser, verifyPatient } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile-status', verifyUser, getPatientProfileStatus);
router.get('/medical-profile', verifyPatient, getMedicalProfile);
router.patch('/update-medical-profile', verifyPatient, updatePatientMedicalProfile);

export default router; 