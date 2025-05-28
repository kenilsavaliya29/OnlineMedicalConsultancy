import express from 'express';
import { getTimeSlotsByDoctorId, addTimeSlots, deleteTimeSlot, bulkDeleteTimeSlots } from '../controllers/timeSlotController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get time slots for a doctor
router.get('/doctor/:doctorId', verifyToken, authorizeRoles(['doctor']), getTimeSlotsByDoctorId);

// Add new time slots
router.post('/', verifyToken, authorizeRoles(['doctor']), addTimeSlots);

// Delete a time slot
router.delete('/:slotId', verifyToken, authorizeRoles(['doctor']), deleteTimeSlot);

// Delete all time slots for a day
router.delete('/bulk', verifyToken, authorizeRoles(['doctor']), bulkDeleteTimeSlots);

export default router; 