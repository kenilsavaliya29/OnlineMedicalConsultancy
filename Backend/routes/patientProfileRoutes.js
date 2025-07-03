import express from 'express';
import {
  getPatientProfileStatus,
  updatePatientMedicalProfile,
  getMedicalProfile,
  updateAccountProfile
} from '../controllers/patientProfileController.js';
import { verifyUser, verifyPatient } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/profile-status', verifyUser, getPatientProfileStatus);
router.get('/medical-profile', verifyPatient, getMedicalProfile);
router.patch('/update-medical-profile', verifyPatient, updatePatientMedicalProfile);
router.put('/update-account-profile', verifyPatient, upload.single('profileImage'), updateAccountProfile)

export default router; 