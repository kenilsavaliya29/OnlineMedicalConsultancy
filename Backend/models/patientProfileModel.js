import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema({
  // Reference to the base user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Medical information
  dateOfBirth: Date,
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
  },
  height: Number, // in cm
  weight: Number, // in kg
  allergies: [String],
  chronicConditions: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Emergency contact
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String,
    email: String
  },
  
  // Insurance information
  insurance: {
    provider: String,
    policyNumber: String,
    validUntil: Date
  },
  
  // Health metrics
  healthMetrics: [{
    type: {
      type: String,
      enum: ['blood_pressure', 'heart_rate', 'blood_sugar', 'cholesterol', 'temperature', 'other']
    },
    value: String,
    unit: String,
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  
  // Preferences
  communicationPreferences: {
    appointmentReminders: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    newsletterSubscription: {
      type: Boolean,
      default: false
    }
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
patientProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate age as a virtual property
patientProfileSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Add indexes for frequent queries
// patientProfileSchema.index({ userId: 1 }); // Removed to avoid duplicate index (already unique in schema)
patientProfileSchema.index({ 'healthMetrics.date': -1 });

// Add virtual to get full user info
patientProfileSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);
export default PatientProfile; 