import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';
import DoctorProfile from '../models/doctorProfileModel.js';

/**
 * Get all appointments for the logged-in user
 */
export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let appointments;
    if (req.user.role === 'doctor') {
      // First get all appointments
      const appointmentsData = await Appointment.find({ doctorId: userId }).lean();
      
      // Then get all unique patient IDs
      const patientIds = [...new Set(appointmentsData.map(apt => apt.patientId.toString()))];
      
      // Fetch all patients data in one query
      const patients = await User.find({ _id: { $in: patientIds } })
        .select('firstName lastName profileImage')
        .lean();
      
      // Create a map of patient data for quick lookup
      const patientMap = {};
      patients.forEach(patient => {
        patientMap[patient._id.toString()] = {
          _id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          fullName: `${patient.firstName} ${patient.lastName}`,
          profileImage: patient.profileImage
        };
      });
      
      // Get doctor's profile once
      const doctorProfile = await DoctorProfile.findOne({ userId }).lean();
      
      // Map the appointments with patient data
      appointments = appointmentsData.map(apt => {
        const patientData = patientMap[apt.patientId.toString()];
        
        return {
          ...apt,
          patientId: patientData || { fullName: "Anonymous Patient" },
          doctorProfile: doctorProfile || {}
        };
      });

    } else if (req.user.role === 'patient') {
      // First get all appointments
      const appointmentsData = await Appointment.find({ patientId: userId }).lean();
      
      // Then get all unique doctor IDs
      const doctorIds = [...new Set(appointmentsData.map(apt => apt.doctorId.toString()))];
      
      // Fetch all doctors data and their profiles in parallel
      const [doctors, doctorProfiles] = await Promise.all([
        User.find({ _id: { $in: doctorIds } })
          .select('firstName lastName email')
          .lean(),
        DoctorProfile.find({ userId: { $in: doctorIds } }).lean()
      ]);
      
      // Create maps for quick lookup
      const doctorMap = {};
      doctors.forEach(doctor => {
        doctorMap[doctor._id.toString()] = {
          _id: doctor._id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          fullName: `${doctor.firstName} ${doctor.lastName}`,
          email: doctor.email
        };
      });
      
      const profileMap = {};
      doctorProfiles.forEach(profile => {
        profileMap[profile.userId.toString()] = profile;
      });
      
      // Map the appointments with doctor data
      appointments = appointmentsData.map(apt => ({
        ...apt,
        doctorId: doctorMap[apt.doctorId.toString()] || { fullName: "Doctor Not Found" },
        doctorProfile: profileMap[apt.doctorId.toString()] || {}
      }));

    } else {
      // Admin view - similar approach for both patient and doctor data
      const appointmentsData = await Appointment.find().lean();
      
      const patientIds = [...new Set(appointmentsData.map(apt => apt.patientId.toString()))];
      const doctorIds = [...new Set(appointmentsData.map(apt => apt.doctorId.toString()))];
      
      const [patients, doctors, doctorProfiles] = await Promise.all([
        User.find({ _id: { $in: patientIds } })
          .select('firstName lastName profileImage')
          .lean(),
        User.find({ _id: { $in: doctorIds } })
          .select('firstName lastName email')
          .lean(),
        DoctorProfile.find({ userId: { $in: doctorIds } }).lean()
      ]);
      
      const patientMap = {};
      patients.forEach(patient => {
        patientMap[patient._id.toString()] = {
          _id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          fullName: `${patient.firstName} ${patient.lastName}`,
          profileImage: patient.profileImage
        };
      });
      
      const doctorMap = {};
      doctors.forEach(doctor => {
        doctorMap[doctor._id.toString()] = {
          _id: doctor._id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          fullName: `${doctor.firstName} ${doctor.lastName}`,
          email: doctor.email
        };
      });
      
      const profileMap = {};
      doctorProfiles.forEach(profile => {
        profileMap[profile.userId.toString()] = profile;
      });
      
      appointments = appointmentsData.map(apt => ({
        ...apt,
        patientId: patientMap[apt.patientId.toString()] || { fullName: "Anonymous Patient" },
        doctorId: doctorMap[apt.doctorId.toString()] || { fullName: "Doctor Not Found" },
        doctorProfile: profileMap[apt.doctorId.toString()] || {}
      }));
    }

    // Convert status to new format ('0' for confirmed, '1' for cancelled)
    appointments = appointments.map(apt => {
      if (apt.status === 'confirmed') {
        apt.status = '0';
      } else if (apt.status === 'cancelled') {
        apt.status = '1';
      }
      return apt;
    });

    // Sort appointments by dateTime
    appointments.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    
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
    if (userIsPatient && status === '1') { // Changed from 'cancelled' to '1'
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

    // After saving, fetch the complete appointment data with populated fields
    let updatedAppointment;
    if (userIsDoctor) {
      // For doctor's view - populate patient details
      const patientData = await User.findById(appointment.patientId);
      const doctorProfile = await DoctorProfile.findOne({ userId: appointment.doctorId });

      updatedAppointment = {
        ...appointment.toObject(),
        patientId: patientData ? {
          _id: patientData._id,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          fullName: `${patientData.firstName} ${patientData.lastName}`,
          profileImage: patientData.profileImage
        } : { fullName: "Anonymous Patient" },
        doctorProfile: doctorProfile?.toObject() || {}
      };
    } else if (userIsPatient) {
      // For patient's view - populate doctor details
      const doctorData = await User.findById(appointment.doctorId);
      const doctorProfile = await DoctorProfile.findOne({ userId: appointment.doctorId });

      updatedAppointment = {
        ...appointment.toObject(),
        doctorId: doctorData ? {
          _id: doctorData._id,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          fullName: `${doctorData.firstName} ${doctorData.lastName}`,
          email: doctorData.email
        } : { fullName: "Doctor Not Found" },
        doctorProfile: doctorProfile?.toObject() || {}
      };
    }
    
    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment: updatedAppointment
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

/**
 * Get appointments for a specific doctor
 */
export const getAppointmentsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Verify the requesting doctor is accessing their own appointments
    if (req.user._id.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own appointments'
      });
    }
    
    // First get all appointments
    const appointmentsData = await Appointment.find({ doctorId }).lean();
    
    // Then get all unique patient IDs
    const patientIds = [...new Set(appointmentsData.map(apt => apt.patientId.toString()))];
    
    // Fetch all patients data in one query
    const patients = await User.find({ _id: { $in: patientIds } })
      .select('firstName lastName profileImage')
      .lean();
    
    // Create a map of patient data for quick lookup
    const patientMap = {};
    patients.forEach(patient => {
      patientMap[patient._id.toString()] = {
        _id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        fullName: `${patient.firstName} ${patient.lastName}`,
        profileImage: patient.profileImage
      };
    });
    
    // Get doctor's profile once
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId }).lean();
    
    // Map the appointments with patient data
    const appointments = appointmentsData.map(apt => {
      const patientData = patientMap[apt.patientId.toString()];
      
      return {
        ...apt,
        patientId: patientData || { fullName: "Anonymous Patient" },
        doctorProfile: doctorProfile || {}
      };
    });

    // Convert status to new format ('0' for confirmed, '1' for cancelled)
    const finalAppointments = appointments.map(apt => {
      if (apt.status === 'confirmed') {
        apt.status = '0';
      } else if (apt.status === 'cancelled') {
        apt.status = '1';
      }
      return apt;
    });

    // Sort appointments by dateTime
    finalAppointments.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
  
    res.json({
      success: true,
      appointments: finalAppointments
    });
  } catch (error) {
    console.error('Error fetching appointments for doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments for doctor',
      error: error.message
    });
  }
};

/**
 * Update appointment status by a doctor
 */
export const updateAppointmentStatusByDoctor = async (req, res) => {
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
    console.error('Error updating appointment status by doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status by doctor',
      error: error.message
    });
  }
}; 