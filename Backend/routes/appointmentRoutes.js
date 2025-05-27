import express from 'express';
import { 
  getUserAppointments, 
  createAppointment, 
  getAppointmentById, 
  updateAppointmentStatus,
  getUpcomingAppointments
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
router.get('/doctor/:doctorId', verifyToken, authorizeRoles(['doctor']), async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Verify the requesting doctor is accessing their own appointments
    if (req.user._id.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own appointments'
      });
    }
    
    const appointments = await Appointment.find({ doctorId })
      .sort({ appointmentDate: 1, appointmentTime: 1 });
      
    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// Update appointment status
router.put('/:appointmentId/status', verifyToken, authorizeRoles(['doctor']), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
});

export default router; 