import User from '../models/userModel.js';
import DoctorProfile from '../models/doctorProfileModel.js';
import PatientProfile from '../models/patientProfileModel.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/email.js';
import crypto from 'crypto';


const generateToken = (user) => {
  const tokenData = {
    id: user._id.toString(),
    role: user.role,
    email: user.email
  };

  return jwt.sign(
    tokenData,
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Get complete user data with profile information
 */
const getUserWithProfile = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const userData = user.toObject();
    delete userData.password; // Remove password for security

    // Fetch role-specific profile
    if (user.role === 'doctor') {
      const doctorProfile = await DoctorProfile.findOne({ userId: user._id });
      if (doctorProfile) {
        userData.profile = doctorProfile.toObject();
      }
    } else if (user.role === 'patient') {
      const patientProfile = await PatientProfile.findOne({ userId: user._id });
      if (patientProfile) {
        userData.profile = patientProfile.toObject();
      }
    }

    return userData;
  } catch (error) {
    console.error('Error in getUserWithProfile:', error);
    return null;
  }
};

/**
 * User registration controller
 */
export const signUp = async (req, res) => {
  try {
    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = new User({
      email: userData.email,
      password: userData.password, // Will be hashed by pre-save hook
      firstName: userData.firstName || userData.firstname,
      lastName: userData.lastName || userData.lastname,
      phoneNumber: userData.phoneNumber || userData.phonenumber,
      gender: userData.gender,
      role: userData.role || 'patient'
    });

    // Save the user
    await newUser.save();

    // Create role-specific profile
    if (newUser.role === 'doctor') {
      const doctorProfile = new DoctorProfile({
        userId: newUser._id,
        specialization: userData.specialization || '',
        qualification: userData.qualification || '',
        experience: userData.experience || 0,
        bio: userData.bio || '',
        languages: userData.languages || ['English']
      });
      await doctorProfile.save();
    } else if (newUser.role === 'patient') {
      const patientProfile = new PatientProfile({
        userId: newUser._id
      });
      await patientProfile.save();
    }

    // Get complete user data
    const completeUser = await getUserWithProfile(newUser._id);
    
    // Generate JWT token
    const token = generateToken(newUser);

    // Set token as cookie
    res.cookie('authToken', token, {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      partitioned: process.env.NODE_ENV === 'production' ? true : undefined
    });
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: completeUser,
      token
    });
  } catch (error) {
    console.error('Error in signUp controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * User login controller
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    // Normalize email to ensure consistent format
    const normalizedEmail = email.trim().toLowerCase();

    // Find the user by email
    const user = await User.findOne({ email: normalizedEmail });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errorType: 'notFound'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
        errorType: 'invalidPassword'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get complete user data
    const userData = await getUserWithProfile(user._id);

    // Generate token
    const token = generateToken(user);
    
    // Set token as cookie
    res.cookie('authToken', token, {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      partitioned: process.env.NODE_ENV === 'production' ? true : undefined
    });

    return res.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Error in login controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      errorType: 'serverError',
      error: error.message
    });
  }
};

/**
 * User logout controller
 */
export const logout = async (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      partitioned: process.env.NODE_ENV === 'production' ? true : undefined
    });
    
    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error in logout controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed due to server error',
      error: error.message
    });
  }
};

/**
 * Get authenticated user data controller
 */
export const getUser = async (req, res) => {
  try {
    // Try to get user from middleware first
    if (req.user) {
      return res.json({
        success: true,
        user: req.user
      });
    }
    
    // Try to get user from cookie if middleware hasn't run
    const token = req.cookies.authToken;
    if (!token) {
      return res.json({
        success: false,
        message: 'Not logged in'
      });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    // Get user data
    const user = await getUserWithProfile(decoded.id);
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error in getUser controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user data',
      error: error.message
    });
  }
};

/**
 * Update user profile controller
 */
export const updateProfile = async (req, res) => {
  try {
    const profileData = req.body;
    const userId = req.user?._id; // From middleware
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update basic user fields
    if (profileData.firstName || profileData.firstname) {
      user.firstName = profileData.firstName || profileData.firstname;
    }
    
    if (profileData.lastName || profileData.lastname) {
      user.lastName = profileData.lastName || profileData.lastname;
    }
    
    if (profileData.phoneNumber || profileData.phonenumber) {
      user.phoneNumber = profileData.phoneNumber || profileData.phonenumber;
    }
    
    if (profileData.gender) {
      user.gender = profileData.gender;
    }
    
    if (profileData.profileImage) {
      user.profileImage = profileData.profileImage;
    }

    await user.save();

    // Update role-specific profile
    if (user.role === 'doctor') {
      const doctorProfile = await DoctorProfile.findOne({ userId: user._id });
      
      if (doctorProfile) {
        // Update doctor profile fields
        if (profileData.specialization) {
          doctorProfile.specialization = profileData.specialization;
        }
        
        if (profileData.qualification) {
          doctorProfile.qualification = profileData.qualification;
        }
        
        if (profileData.experience) {
          doctorProfile.experience = profileData.experience;
        }
        
        if (profileData.bio !== undefined) {
          doctorProfile.bio = profileData.bio;
        }
        
        if (profileData.consultationFee !== undefined) {
          doctorProfile.consultationFee = profileData.consultationFee;
        }
        
        if (profileData.languages && Array.isArray(profileData.languages)) {
          doctorProfile.languages = profileData.languages;
        }

        await doctorProfile.save();
      }
    } else if (user.role === 'patient') {
      // Update patient profile if needed
      const patientProfile = await PatientProfile.findOne({ userId: user._id });
      
      if (patientProfile && profileData.patientProfile) {
        const patientProfileData = profileData.patientProfile;
        
        if (patientProfileData.dateOfBirth) {
          patientProfile.dateOfBirth = patientProfileData.dateOfBirth;
        }
        
        if (patientProfileData.bloodGroup) {
          patientProfile.bloodGroup = patientProfileData.bloodGroup;
        }
        
        if (patientProfileData.allergies) {
          patientProfile.allergies = patientProfileData.allergies;
        }
        
        if (patientProfileData.chronicConditions) {
          patientProfile.chronicConditions = patientProfileData.chronicConditions;
        }
        
        await patientProfile.save();
      }
    }

    // Get updated user data
    const updatedUser = await getUserWithProfile(user._id);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in updateProfile controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: error.message
    });
  }
};

/**
 * Update user password controller
 */
export const updateUserPassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update the password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error in updateUserPassword controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Password update failed',
      error: error.message
    });
  }
};

/**
 * Handles the forgot password request.
 * Generates a reset token, saves it, and sends a reset email.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with that email does not exist'
      });
    }

    // Generate reset token and set expiry
    const resetToken = user.createPasswordResetToken(); // This method will be added to userModel.js
    await user.save();

    // Construct reset URL
    // The frontend will need a route to handle this, e.g., /reset-password/:token
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

    try {
      await sendEmail(user.email, 'Password Reset Link', message);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (emailError) {
      // If email sending fails, clear the reset token from the user to prevent security issues
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      console.error('Error sending password reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Error in forgotPassword controller:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
      error: error.message
    });
  }
};

/**
 * Resets user password using a valid token.
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    // Hash the incoming token for comparison with the one stored in DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired'
      });
    }

    // Set the new password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    console.error('Error in resetPassword controller:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};