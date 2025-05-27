import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';

/**
 * Get all appointments for the logged-in user
 */
export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let appointments;
    if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ doctorId: userId })
        .sort({ dateTime: -1 });
    } else if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patientId: userId })
        .sort({ dateTime: -1 });
    } else {
      // Admin can see all appointments
      appointments = await Appointment.find().sort({ dateTime: -1 });
    }
    
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
};

/**
 * Create a new appointment
 */
export const createAppointment = async (req, res) => {
  try {
    const { 
      doctorId, patientName, patientEmail, patientPhone,
      appointmentDate, appointmentTime, appointmentType,
      reason, notes
    } = req.body;
    
    // Format dateTime from date and time strings
    const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    
    // If the user is a patient, use their ID
    let patientId = req.user.role === 'patient' ? req.user._id : null;
    
    // If not a patient user, try to find a patient with the given email
    if (!patientId && patientEmail) {
      const patientUser = await User.findOne({ email: patientEmail, role: 'patient' });
      if (patientUser) {
        patientId = patientUser._id;
      }
    }
    
    // Check if doctorId exists
    const doctorExists = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Create the appointment
    const appointment = new Appointment({
      patientId: patientId,
      doctorId,
      dateTime,
      type: appointmentType,
      reason,
      notes: {
        patient: notes
      },
      // Add other fields
      status: 'requested'
    });
    
    await appointment.save();
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
};

/**
 * Get a specific appointment
 */
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user has access to this appointment
    if (req.user.role !== 'admin' && 
        appointment.patientId.toString() !== req.user._id.toString() && 
        appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this appointment'
      });
    }
    
    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['requested', 'confirmed', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user has permission to update this appointment
    const userIsPatient = appointment.patientId.toString() === req.user._id.toString();
    const userIsDoctor = appointment.doctorId.toString() === req.user._id.toString();
    
    if (req.user.role !== 'admin' && !userIsPatient && !userIsDoctor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this appointment'
      });
    }
    
    // If patient is cancelling, check if it's not too late
    if (userIsPatient && status === 'cancelled') {
      const appointmentDate = new Date(appointment.dateTime);
      const now = new Date();
      const hoursDifference = (appointmentDate - now) / (1000 * 60 * 60);
      
      if (hoursDifference < 24) {
        return res.status(400).json({
          success: false,
          message: 'Appointments can only be cancelled at least 24 hours in advance'
        });
      }
    }
    
    // Update the appointment status
    appointment.status = status;
    appointment.statusUpdates.push({
      status,
      updatedBy: req.user._id,
      timestamp: new Date()
    });
    
    await appointment.save();
    
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
};

/**
 * Get upcoming appointments
 */
export const getUpcomingAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    
    let query = { dateTime: { $gt: now } };
    
    if (req.user.role === 'doctor') {
      query.doctorId = userId;
    } else if (req.user.role === 'patient') {
      query.patientId = userId;
    }
    
    // Exclude cancelled appointments
    query.status = { $ne: 'cancelled' };
    
    const appointments = await Appointment.find(query)
      .sort({ dateTime: 1 })
      .limit(10); // Limit to 10 upcoming appointments
      
    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming appointments',
      error: error.message
    });
  }
}; 