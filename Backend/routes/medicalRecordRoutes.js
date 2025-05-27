import express from 'express';
import { 
  getPatientMedicalRecords, 
  createMedicalRecord,
  getMedicalRecordById,
  updateMedicalRecord
} from '../controllers/medicalRecordController.js';
import { verifyUser, verifyDoctor, verifyPatient } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get medical records for a patient
router.get('/patient/:patientId', verifyUser, getPatientMedicalRecords);

// Create a new medical record
router.post('/', verifyDoctor, createMedicalRecord);

// Get a specific medical record
router.get('/:id', verifyUser, getMedicalRecordById);

// Update a medical record
router.put('/:id', verifyDoctor, updateMedicalRecord);

export default router; 