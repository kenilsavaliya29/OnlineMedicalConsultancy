import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  // User references
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Appointment details
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  type: {
    type: String,
    enum: ['in-person', 'video', 'chat'],
    required: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['requested', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'requested'
  },
  statusUpdates: [{
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  
  // Clinical information
  reason: {
    type: String,
    required: true
  },
  symptoms: [String],
  notes: {
    patient: String, // Notes provided by patient
    doctor: String   // Notes added by doctor
  },
  
  // Follow-up
  followUpRecommended: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  
  // Payment information
  payment: {
    amount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded', 'failed'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'insurance', 'cash', 'other']
    },
    transactionId: String,
    receiptUrl: String,
    paidAt: Date
  },
  
  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'in-app']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['scheduled', 'sent', 'failed']
    }
  }],
  
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
appointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Add status update if status changed
  if (this.isModified('status')) {
    this.statusUpdates.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  
  next();
});

// Add indexes for frequent queries
appointmentSchema.index({ patientId: 1, dateTime: -1 });
appointmentSchema.index({ doctorId: 1, dateTime: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ dateTime: 1 });

// Add virtual populate fields
appointmentSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

appointmentSchema.virtual('doctor', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

appointmentSchema.virtual('doctorProfile', {
  ref: 'DoctorProfile',
  localField: 'doctorId',
  foreignField: 'userId',
  justOne: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment; 