import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  }
}, {
  timestamps: true
});

// Add index for faster queries
timeSlotSchema.index({ doctorId: 1, day: 1 });

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

export default TimeSlot; 