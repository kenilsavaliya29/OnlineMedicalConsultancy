import ChatMessage from '../models/chatModel.js';
import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';

/**
 * Get chat messages for a specific appointment
 */
export const getChatMessages = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;

    // First, verify the user has access to this appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is either the patient or doctor for this appointment
    const isPatient = appointment.patientId.toString() === userId.toString();
    const isDoctor = appointment.doctorId.toString() === userId.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this chat'
      });
    }

    // Get all messages for this appointment
    const messages = await ChatMessage.find({ appointmentId })
      .populate('senderId', 'firstName lastName fullName role')
      .populate('receiverId', 'firstName lastName fullName role')
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as delivered if the user is the receiver
    const messagesToMarkDelivered = messages.filter(msg => 
      msg.receiverId._id.toString() === userId.toString() && 
      msg.status === 'sent'
    );

    if (messagesToMarkDelivered.length > 0) {
      const messageIds = messagesToMarkDelivered.map(msg => msg._id);
      await ChatMessage.updateMany(
        { _id: { $in: messageIds } },
        { 
          status: 'delivered',
          deliveredAt: new Date()
        }
      );
    }

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat messages',
      error: error.message
    });
  }
};

/**
 * Send a new chat message
 */
export const sendMessage = async (req, res) => {
  try {
    const { appointmentId, message, messageType = 'text' } = req.body;
    const senderId = req.user._id;
    const senderRole = req.user.role;

    // Verify the appointment exists and user has access
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is either the patient or doctor for this appointment
    const isPatient = appointment.patientId.toString() === senderId.toString();
    const isDoctor = appointment.doctorId.toString() === senderId.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to send messages in this chat'
      });
    }

    // Determine receiver
    const receiverId = isPatient ? appointment.doctorId : appointment.patientId;
    const receiverRole = isPatient ? 'doctor' : 'patient';

    // Check if chat is allowed based on appointment timing
    const now = new Date();
    const appointmentTime = new Date(appointment.dateTime);
    const appointmentEndTime = new Date(appointmentTime.getTime() + ((appointment.duration || 30) * 60000)); // duration in minutes

    // Allow chat 15 minutes before appointment and during appointment + 30 minutes after
    const chatStartTime = new Date(appointmentTime.getTime() - (15 * 60000)); // 15 minutes before
    const chatEndTime = new Date(appointmentEndTime.getTime() + (30 * 60000)); // 30 minutes after

    // For testing purposes, allow chat if within 24 hours
    const timeDifference = Math.abs(appointmentTime - now) / (1000 * 60 * 60); // hours
    const isWithin24Hours = timeDifference <= 24;
    const isChatAllowed = (now >= chatStartTime && now <= chatEndTime) || isWithin24Hours;

    if (!isChatAllowed) {
      return res.status(400).json({
        success: false,
        message: `Chat is only available 15 minutes before appointment time and up to 30 minutes after the appointment ends. Current time difference: ${Math.round(timeDifference * 100) / 100} hours`
      });
    }

    // Create the message
    const chatMessage = new ChatMessage({
      appointmentId,
      senderId,
      senderRole,
      receiverId,
      receiverRole,
      message,
      messageType
    });

    await chatMessage.save();

    // Populate sender and receiver details
    await chatMessage.populate('senderId', 'firstName lastName fullName role');
    await chatMessage.populate('receiverId', 'firstName lastName fullName role');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      chatMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;

    // Verify the appointment exists and user has access
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is either the patient or doctor for this appointment
    const isPatient = appointment.patientId.toString() === userId.toString();
    const isDoctor = appointment.doctorId.toString() === userId.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this chat'
      });
    }

    // Mark all unread messages as read
    const result = await ChatMessage.updateMany(
      {
        appointmentId,
        receiverId: userId,
        status: { $in: ['sent', 'delivered'] }
      },
      {
        status: 'read',
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

/**
 * Get chat availability for an appointment
 */
export const getChatAvailability = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;

    // Verify the appointment exists and user has access
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is either the patient or doctor for this appointment
    const isPatient = appointment.patientId.toString() === userId.toString();
    const isDoctor = appointment.doctorId.toString() === userId.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this appointment'
      });
    }

    // Check if chat is available based on appointment timing
    const now = new Date();
    const appointmentTime = new Date(appointment.dateTime);
    const appointmentEndTime = new Date(appointmentTime.getTime() + ((appointment.duration || 30) * 60000));

    // Allow chat 15 minutes before appointment and during appointment + 30 minutes after
    const chatStartTime = new Date(appointmentTime.getTime() - (15 * 60000));
    const chatEndTime = new Date(appointmentEndTime.getTime() + (30 * 60000));

    const isChatAvailable = now >= chatStartTime && now <= chatEndTime;
    
    // For testing purposes, also allow if within 24 hours
    const timeDifference = Math.abs(appointmentTime - now) / (1000 * 60 * 60); // hours
    const isWithin24Hours = timeDifference <= 24;
    const finalChatAvailable = isChatAvailable || isWithin24Hours;
    
    const isBeforeWindow = now < chatStartTime && !isWithin24Hours;
    const isAfterWindow = now > chatEndTime && !isWithin24Hours;

    let timeUntilAvailable = null;
    let timeUntilExpiry = null;

    if (isBeforeWindow) {
      timeUntilAvailable = Math.ceil((chatStartTime - now) / (1000 * 60)); // minutes
    }

    if (finalChatAvailable) {
      timeUntilExpiry = Math.ceil((chatEndTime - now) / (1000 * 60)); // minutes
    }

    res.json({
      success: true,
      chatAvailable: finalChatAvailable,
      appointmentTime: appointmentTime.toISOString(),
      chatStartTime: chatStartTime.toISOString(),
      chatEndTime: chatEndTime.toISOString(),
      timeUntilAvailable,
      timeUntilExpiry,
      isBeforeWindow,
      isAfterWindow,
      isWithin24Hours,
      timeDifference: Math.round(timeDifference * 100) / 100
    });
  } catch (error) {
    console.error('Error checking chat availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check chat availability',
      error: error.message
    });
  }
};

/**
 * Get appointments with chat access for a user
 */
export const getChatAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    console.log(`Fetching chat appointments for user: ${userId}, role: ${userRole}`);

    let query = {};
    if (userRole === 'doctor') {
      query.doctorId = userId;
    } else if (userRole === 'patient') {
      query.patientId = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role for chat access'
      });
    }

    // Get appointments that are confirmed (status '0'), requested (pending), or cancelled (status '1')
    // Include all appointment types for chat access
    query.status = { $in: ['0', 'requested', '1'] };

    console.log('Query for appointments:', JSON.stringify(query, null, 2));

    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName')
      .populate('doctorProfile')
      .sort({ dateTime: -1 });

    console.log(`Found ${appointments.length} appointments for chat`);
    
    if (appointments.length > 0) {
      console.log('First appointment:', {
        id: appointments[0]._id,
        status: appointments[0].status,
        dateTime: appointments[0].dateTime,
        patientName: appointments[0].patientId?.fullName,
        doctorName: appointments[0].doctorId?.fullName,
        doctorProfile: appointments[0].doctorProfile
      });
    } else {
      console.log('No appointments found. Debug info:');
      console.log('User ID:', userId);
      console.log('User Role:', userRole);
      console.log('Query used:', JSON.stringify(query, null, 2));
      
      // Let's also check if there are ANY appointments for this user
      const debugQuery = {};
      if (userRole === 'doctor') {
        debugQuery.doctorId = userId;
      } else if (userRole === 'patient') {
        debugQuery.patientId = userId;
      }
      
      const allUserAppointments = await Appointment.find(debugQuery).lean();
      console.log(`Total appointments for user (any status): ${allUserAppointments.length}`);
      if (allUserAppointments.length > 0) {
        console.log('Sample appointment statuses:', allUserAppointments.map(apt => apt.status));
      }
    }

    // For each appointment, check if chat is currently available
    const now = new Date();
    const appointmentsWithChatStatus = appointments.map(appointment => {
      const appointmentTime = new Date(appointment.dateTime);
      const appointmentEndTime = new Date(appointmentTime.getTime() + ((appointment.duration || 30) * 60000));
      const chatStartTime = new Date(appointmentTime.getTime() - (15 * 60000));
      const chatEndTime = new Date(appointmentEndTime.getTime() + (30 * 60000));

      const isChatAvailable = now >= chatStartTime && now <= chatEndTime;

      // For testing purposes, let's make all appointments available if they're within 24 hours
      const timeDifference = Math.abs(appointmentTime - now) / (1000 * 60 * 60); // hours
      const isWithin24Hours = timeDifference <= 24;

      // Convert to plain object and add computed fields
      const appointmentObj = appointment.toObject();
      
      // Ensure fullName is available for populated users
      if (appointmentObj.patientId) {
        appointmentObj.patientId.fullName = `${appointmentObj.patientId.firstName} ${appointmentObj.patientId.lastName}`;
      }
      if (appointmentObj.doctorId) {
        appointmentObj.doctorId.fullName = `${appointmentObj.doctorId.firstName} ${appointmentObj.doctorId.lastName}`;
      }
      
      // Ensure doctorProfile is included (sometimes toObject() doesn't include populated virtuals)
      if (appointment.doctorProfile && !appointmentObj.doctorProfile) {
        appointmentObj.doctorProfile = appointment.doctorProfile.toObject ? appointment.doctorProfile.toObject() : appointment.doctorProfile;
      }

      return {
        ...appointmentObj,
        chatAvailable: isChatAvailable || isWithin24Hours, // Allow chat if within 24 hours for testing
        chatStartTime: chatStartTime.toISOString(),
        chatEndTime: chatEndTime.toISOString(),
        isWithin24Hours,
        timeDifference: Math.round(timeDifference * 100) / 100 // round to 2 decimal places
      };
    });

    console.log('Appointments with chat status:', appointmentsWithChatStatus.map(apt => ({
      id: apt._id,
      chatAvailable: apt.chatAvailable,
      isWithin24Hours: apt.isWithin24Hours,
      timeDifference: apt.timeDifference
    })));

    res.json({
      success: true,
      appointments: appointmentsWithChatStatus
    });
  } catch (error) {
    console.error('Error fetching chat appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat appointments',
      error: error.message
    });
  }
}; 

/**
 * Debug function to check all appointments for a user (temporary for testing)
 */
export const debugUserAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    console.log(`DEBUG: Checking all appointments for user: ${userId}, role: ${userRole}`);

    let query = {};
    if (userRole === 'doctor') {
      query.doctorId = userId;
    } else if (userRole === 'patient') {
      query.patientId = userId;
    }

    const allAppointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName fullName')
      .populate('doctorId', 'firstName lastName fullName')
      .sort({ dateTime: -1 })
      .lean();

    console.log(`DEBUG: Found ${allAppointments.length} total appointments`);
    
    const appointmentDetails = allAppointments.map(apt => ({
      id: apt._id,
      status: apt.status,
      dateTime: apt.dateTime,
      patientName: apt.patientId?.fullName || 'Unknown Patient',
      doctorName: apt.doctorId?.fullName || 'Unknown Doctor',
      duration: apt.duration || 30
    }));

    console.log('DEBUG: All appointments:', JSON.stringify(appointmentDetails, null, 2));

    res.json({
      success: true,
      message: 'Debug information',
      totalAppointments: allAppointments.length,
      appointments: appointmentDetails,
      userInfo: {
        userId,
        userRole,
        currentTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('DEBUG: Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
}; 