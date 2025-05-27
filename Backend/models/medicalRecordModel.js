import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  // Record information
  title: {
    type: String,
    required: true
  },
  recordType: {
    type: String,
    enum: ['consultation', 'lab_result', 'imaging', 'procedure', 'vaccination', 'prescription', 'other'],
    required: true
  },
  recordDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Clinical data
  diagnosis: [String],
  symptoms: [String],
  notes: String,
  treatmentPlan: String,
  
  // Vitals
  vitals: {
    bloodPressure: String, // e.g., "120/80"
    temperature: Number,   // in Celsius
    heartRate: Number,     // BPM
    respiratoryRate: Number, // breaths per minute
    oxygenSaturation: Number, // percentage
    height: Number,        // in cm
    weight: Number         // in kg
  },
  
  // Attachments
  attachments: [{
    name: String,
    fileType: String,
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  
  // Lab results
  labResults: [{
    testName: String,
    result: String,
    normalRange: String,
    units: String,
    remarks: String,
    isAbnormal: Boolean
  }],
  
  // Prescriptions
  prescriptions: [{
    medicationName: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Privacy & sharing
  visibility: {
    type: String,
    enum: ['patient_and_doctor', 'patient_only', 'doctor_only', 'all_doctors'],
    default: 'patient_and_doctor'
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessType: {
      type: String,
      enum: ['read', 'edit']
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
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
medicalRecordSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for frequent queries
medicalRecordSchema.index({ patientId: 1, recordDate: -1 });
medicalRecordSchema.index({ doctorId: 1 });
medicalRecordSchema.index({ appointmentId: 1 });
medicalRecordSchema.index({ recordType: 1 });
medicalRecordSchema.index({ 'labResults.testName': 1 });

// Add virtual populate fields
medicalRecordSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

medicalRecordSchema.virtual('doctor', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

medicalRecordSchema.virtual('appointment', {
  ref: 'Appointment',
  localField: 'appointmentId',
  foreignField: '_id',
  justOne: true
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord; 