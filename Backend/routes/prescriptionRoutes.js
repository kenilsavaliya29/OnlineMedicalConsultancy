import express from 'express';
import { 
  getPatientPrescriptions, 
  createPrescription, 
  updatePrescription 
} from '../controllers/prescriptionController.js';
import { verifyUser, verifyDoctor, verifyPatient } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get prescriptions for a patient
router.get('/patient/:patientId', verifyUser, getPatientPrescriptions);

// Create a new prescription for a patient
router.post('/patient/:patientId', verifyDoctor, createPrescription);

// Update an existing prescription
router.put('/:recordId/prescriptions/:prescriptionId', verifyDoctor, updatePrescription);

export default router; 