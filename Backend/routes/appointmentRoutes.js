import express from 'express';
import { 
  getUserAppointments, 
  createAppointment, 
  getAppointmentById, 
  updateAppointmentStatus,
  getUpcomingAppointments,
  getAppointmentsForDoctor,
  updateAppointmentStatusByDoctor
} from '../controllers/appointmentController.js';
import { verifyUser, verifyDoctor, verifyPatient, verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';
import Appointment from '../models/appointmentModel.js';

const router = express.Router();

// Get all appointments for the logged-in user
router.get('/user', verifyUser, getUserAppointments);

// Get upcoming appointments
router.get('/upcoming', verifyUser, getUpcomingAppointments);

// Create a new appointment
router.post('/', verifyUser, createAppointment);

// Get a specific appointment
router.get('/:id', verifyUser, getAppointmentById);

// Update appointment status
router.put('/:id/status', verifyUser, updateAppointmentStatus);

// Get appointments for a doctor
router.get('/doctor/:doctorId', verifyToken, authorizeRoles(['doctor']), getAppointmentsForDoctor);

// Update appointment status (for doctor)
router.put('/:appointmentId/status', verifyToken, authorizeRoles(['doctor']), updateAppointmentStatusByDoctor);

export default router; 