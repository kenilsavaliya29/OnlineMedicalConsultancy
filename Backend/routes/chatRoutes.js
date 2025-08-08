import express from 'express';
import {
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  getChatAvailability,
  getChatAppointments,
  debugUserAppointments
} from '../controllers/chatController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Debug route (temporary for testing)
router.get('/debug/appointments', verifyToken, authorizeRoles(['doctor', 'patient']), debugUserAppointments);

// Get appointments available for chat
router.get('/appointments', verifyToken, authorizeRoles(['doctor', 'patient']), getChatAppointments);

// Get chat messages for a specific appointment
router.get('/messages/:appointmentId', verifyToken, authorizeRoles(['doctor', 'patient']), getChatMessages);

// Send a new message
router.post('/messages', verifyToken, authorizeRoles(['doctor', 'patient']), sendMessage);

// Mark messages as read
router.put('/messages/:appointmentId/read', verifyToken, authorizeRoles(['doctor', 'patient']), markMessagesAsRead);

// Check chat availability for an appointment
router.get('/availability/:appointmentId', verifyToken, authorizeRoles(['doctor', 'patient']), getChatAvailability);

export default router; 