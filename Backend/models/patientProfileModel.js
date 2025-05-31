import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema({
  // Reference to the base user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  dateOfBirth: Date,
  allergies: [String],
  medicalConditions: [String],
  medications: [{
    name: String,
    dosage: String,
    frequent: Number,
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Wellness Program Information
  wellnessProgram: {
    dietaryPreference: {
      type: String,
      enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetaria  n'],
      default: 'Vegetarian'
    },
    fitnessGoal: String,
    activityLevel: {
      type: String,
    },
    targetDuration: {
      type: Number,
      min: 1,
      max: 52
    },
    targetWeight: Number,
    dietPlanContent: String,
  },


  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String,
    email: String
  },

  insurance: {
    provider: String,
    policyNumber: String,
    validUntil: Date
  },


  healthMetrics: [{
    type: {
      type: String,
      enum: ['blood_pressure', 'heart_rate', 'blood_sugar', 'cholesterol', 'temperature', 'height', 'weight', 'blood_group', 'other']
    },
    value: String,
    unit: String,
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],


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


  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Updat  e   timestamp before savin
patientProfileSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Calculate age as a virtual property
patientProfileSchema.virtual('age').get(function () {
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

// Add in  dexes for frequent queries
// patientProfileSchema.index({ userId: 1 }); // Removed to avoid duplicat  e index (already unique in schema)
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