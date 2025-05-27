import mongoose from "mongoose";

const doctorProfileSchema = new mongoose.Schema({
  // Reference to the base user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Professional details
  specialization: {
    type: String,
    required: true
  },
  qualification: {
    type: String,
    required: true
  },
  experience: {
    type: Number, // Years of experience
    required: true
  },
  registrationNumber: {
    type: String,
    unique: true
  },
  
  // Practice details
  bio: {
    type: String,
    default: ''
  },
  consultationFee: {
    type: Number,
    default: 0
  },
  availability: {
    type: [String],
    default: []
  },
  languages: {
    type: [String],
    default: ['English']
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: { 
      type: String,
      enum: ['license', 'degree', 'certification', 'other'],
    },
    fileUrl: String,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verificationDate: Date,
    notes: String
  }],
  
  // Ratings and reviews
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
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

// Calculate average rating when reviews change
doctorProfileSchema.pre('save', function(next) {
  // Update timestamp
  this.updatedAt = new Date();
  
  // Recalculate average rating if reviews exist
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = totalRating / this.reviews.length;
    this.ratings.count = this.reviews.length;
  }
  
  next();
});

// Add indexes for frequent queries
// doctorProfileSchema.index({ userId: 1 }); // Removed to avoid duplicate index (already unique in schema)
doctorProfileSchema.index({ specialization: 1 });
doctorProfileSchema.index({ 'ratings.average': -1 }); // For sorting by highest rated

// Add virtual to get full user info
doctorProfileSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);
export default DoctorProfile; 