import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  // Reference to the appointment this chat belongs to
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  
  // Sender information
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  
  // Receiver information
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverRole: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  
  // Message content
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Message type
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  
  // File attachment (if any)
  attachment: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  },
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // Read status
  readAt: {
    type: Date
  },
  
  // Delivery status
  deliveredAt: {
    type: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
chatMessageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for efficient queries
chatMessageSchema.index({ appointmentId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1, receiverId: 1 });
chatMessageSchema.index({ appointmentId: 1, status: 1 });

// Virtual to populate sender and receiver details
chatMessageSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
});

chatMessageSchema.virtual('receiver', {
  ref: 'User',
  localField: 'receiverId',
  foreignField: '_id',
  justOne: true
});

chatMessageSchema.virtual('appointment', {
  ref: 'Appointment',
  localField: 'appointmentId',
  foreignField: '_id',
  justOne: true
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage; 