import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  // Authentication fields
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
    required: true
  },
  
  // Common profile fields
  firstName: { 
    type: String, 
    required: true,
    trim: true
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  profileImage: {
    type: String,
    default: null
  },
  
  // Authentication management
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetToken: String,
  resetTokenExpiry: Date,
  lastLogin: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // This enables virtual properties to be included when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual properties
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  // Update the timestamp
  this.updatedAt = new Date();
  
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate a password reset token
userSchema.methods.createPasswordResetToken = function() {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token and save it to resetToken field in the schema
  this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token expiry to 1 hour from now
  this.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour in milliseconds

  return resetToken; // Return the unhashed token to be sent to the user
};

// Add indexes for common queries
// userSchema.index({ email: 1 }); // Removed to avoid duplicate index (already unique in schema)
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
export default User; 