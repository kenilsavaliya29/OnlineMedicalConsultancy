import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import ChatMessage from '../models/chatModel.js';
import Appointment from '../models/appointmentModel.js';

// Store active socket connections
const activeConnections = new Map();

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    // Get token from handshake auth or headers
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization?.split(' ')[1] ||
                  socket.handshake.headers.cookie?.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.user = user;
    
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
};

// Check if user has access to appointment
const hasAppointmentAccess = async (userId, appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return false;

    const isPatient = appointment.patientId.toString() === userId;
    const isDoctor = appointment.doctorId.toString() === userId;
    
    return isPatient || isDoctor;
  } catch (error) {
    return false;
  }
};

// Check if chat is available based on appointment timing
const isChatAvailable = (appointment) => {
  const now = new Date();
  const appointmentTime = new Date(appointment.dateTime);
  const appointmentEndTime = new Date(appointmentTime.getTime() + ((appointment.duration || 30) * 60000));
  
  // Allow chat 15 minutes before appointment and during appointment + 30 minutes after
  const chatStartTime = new Date(appointmentTime.getTime() - (15 * 60000));
  const chatEndTime = new Date(appointmentEndTime.getTime() + (30 * 60000));
  
  const normalChatAvailable = now >= chatStartTime && now <= chatEndTime;
  
  // For testing purposes, also allow if within 24 hours
  const timeDifference = Math.abs(appointmentTime - now) / (1000 * 60 * 60); // hours
  const isWithin24Hours = timeDifference <= 24;
  
  return normalChatAvailable || isWithin24Hours;
};

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.fullName} (${socket.userId})`);
    
    // Store the connection
    activeConnections.set(socket.userId, {
      socket,
      user: socket.user,
      connectedAt: new Date()
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle joining appointment chat room
    socket.on('join_appointment', async (appointmentId) => {
      try {
        // Verify user has access to this appointment
        if (!await hasAppointmentAccess(socket.userId, appointmentId)) {
          socket.emit('error', { message: 'You do not have access to this appointment' });
          return;
        }

        // Get appointment details
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
          socket.emit('error', { message: 'Appointment not found' });
          return;
        }

        // Check if chat is available
        if (!isChatAvailable(appointment)) {
          socket.emit('chat_unavailable', {
            message: 'Chat is only available 15 minutes before appointment time and up to 30 minutes after the appointment ends',
            appointmentTime: appointment.dateTime,
            chatStartTime: new Date(new Date(appointment.dateTime).getTime() - (15 * 60000)),
            chatEndTime: new Date(new Date(appointment.dateTime).getTime() + ((appointment.duration + 30) * 60000))
          });
          return;
        }

        // Join the appointment room
        socket.join(`appointment_${appointmentId}`);
        socket.currentAppointment = appointmentId;

        // Notify others in the room that user has joined
        socket.to(`appointment_${appointmentId}`).emit('user_joined', {
          userId: socket.userId,
          userName: socket.user.fullName,
          userRole: socket.userRole,
          joinedAt: new Date()
        });

        // Send confirmation to the user
        socket.emit('joined_appointment', {
          appointmentId,
          message: 'Successfully joined appointment chat'
        });

        console.log(`User ${socket.user.fullName} joined appointment ${appointmentId}`);
      } catch (error) {
        console.error('Error joining appointment:', error);
        socket.emit('error', { message: 'Failed to join appointment chat' });
      }
    });

    // Handle leaving appointment chat room
    socket.on('leave_appointment', (appointmentId) => {
      socket.leave(`appointment_${appointmentId}`);
      socket.to(`appointment_${appointmentId}`).emit('user_left', {
        userId: socket.userId,
        userName: socket.user.fullName,
        userRole: socket.userRole,
        leftAt: new Date()
      });
      
      if (socket.currentAppointment === appointmentId) {
        socket.currentAppointment = null;
      }

      console.log(`User ${socket.user.fullName} left appointment ${appointmentId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      console.log('BACKEND RECEIVED send_message:', data);
      try {
        const { appointmentId, message, messageType = 'text' } = data;

        // Verify user has access to this appointment
        if (!await hasAppointmentAccess(socket.userId, appointmentId)) {
          socket.emit('error', { message: 'You do not have access to this appointment' });
          return;
        }

        // Get appointment details
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
          socket.emit('error', { message: 'Appointment not found' });
          return;
        }

        // Check if chat is available
        if (!isChatAvailable(appointment)) {
          socket.emit('error', { message: 'Chat is not available at this time' });
          return;
        }

        // Determine receiver
        const isPatient = appointment.patientId.toString() === socket.userId;
        const receiverId = isPatient ? appointment.doctorId : appointment.patientId;
        const receiverRole = isPatient ? 'doctor' : 'patient';

        // Create and save the message
        const chatMessage = new ChatMessage({
          appointmentId,
          senderId: socket.userId,
          senderRole: socket.userRole,
          receiverId,
          receiverRole,
          message,
          messageType
        });

        await chatMessage.save();

        // Populate sender details
        await chatMessage.populate('senderId', 'firstName lastName fullName role');

        // Emit message to all users in the appointment room
        io.to(`appointment_${appointmentId}`).emit('new_message', {
          _id: chatMessage._id,
          appointmentId,
          senderId: {
            _id: chatMessage.senderId._id,
            firstName: chatMessage.senderId.firstName,
            lastName: chatMessage.senderId.lastName,
            fullName: chatMessage.senderId.fullName,
            role: chatMessage.senderId.role
          },
          senderRole: chatMessage.senderRole,
          receiverId: chatMessage.receiverId,
          receiverRole: chatMessage.receiverRole,
          message: chatMessage.message,
          messageType: chatMessage.messageType,
          status: chatMessage.status,
          createdAt: chatMessage.createdAt
        });

        // If receiver is online, mark message as delivered
        const receiverConnection = activeConnections.get(receiverId.toString());
        if (receiverConnection) {
          chatMessage.status = 'delivered';
          chatMessage.deliveredAt = new Date();
          await chatMessage.save();
          
          // Notify sender about delivery
          socket.emit('message_delivered', {
            messageId: chatMessage._id,
            deliveredAt: chatMessage.deliveredAt
          });
        }

        console.log(`Message sent in appointment ${appointmentId} by ${socket.user.fullName}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle marking messages as read
    socket.on('mark_messages_read', async (appointmentId) => {
      try {
        // Verify user has access to this appointment
        if (!await hasAppointmentAccess(socket.userId, appointmentId)) {
          socket.emit('error', { message: 'You do not have access to this appointment' });
          return;
        }

        // Mark messages as read
        const result = await ChatMessage.updateMany(
          {
            appointmentId,
            receiverId: socket.userId,
            status: { $in: ['sent', 'delivered'] }
          },
          {
            status: 'read',
            readAt: new Date()
          }
        );

        // Notify other users in the room about read status
        socket.to(`appointment_${appointmentId}`).emit('messages_read', {
          readBy: socket.userId,
          readAt: new Date(),
          count: result.modifiedCount
        });

        console.log(`${result.modifiedCount} messages marked as read by ${socket.user.fullName}`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (appointmentId) => {
      socket.to(`appointment_${appointmentId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.fullName,
        isTyping: true
      });
    });

    socket.on('typing_stop', (appointmentId) => {
      socket.to(`appointment_${appointmentId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.fullName,
        isTyping: false
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.fullName} (${socket.userId})`);
      
      // Remove from active connections
      activeConnections.delete(socket.userId);
      
      // Notify appointment room if user was in one
      if (socket.currentAppointment) {
        socket.to(`appointment_${socket.currentAppointment}`).emit('user_left', {
          userId: socket.userId,
          userName: socket.user.fullName,
          userRole: socket.userRole,
          leftAt: new Date()
        });
      }
    });
  });

  return io;
}; 