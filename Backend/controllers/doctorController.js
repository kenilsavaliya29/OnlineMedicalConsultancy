import User from '../models/userModel.js';
import DoctorProfile from '../models/doctorProfileModel.js';

/**
 * Get all doctors
 */
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    
    // Get doctor profiles
    const doctorProfiles = await DoctorProfile.find({
      userId: { $in: doctors.map(doc => doc._id) }
    });
    
    // Combine user data with profile data
    const doctorsWithProfiles = doctors.map(doctor => {
      const profile = doctorProfiles.find(
        profile => profile.userId.toString() === doctor._id.toString()
      );
      
      return {
        ...doctor._doc,
        profile: profile || null
      };
    });
    
    res.json({
      success: true,
      doctors: doctorsWithProfiles
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
};

/**
 * Get doctor by ID
 */
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await User.findOne({ 
      _id: id,
      role: 'doctor'
    }).select('-password');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Get doctor profile
    const profile = await DoctorProfile.findOne({ userId: id });
    
    res.json({
      success: true,
      doctor: {
        ...doctor._doc,
        profile: profile || null
      }
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor',
      error: error.message
    });
  }
};

/**
 * Update doctor availability
 */
export const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    
    // Verify the doctor exists
    const doctor = await User.findOne({ _id: id, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Update the doctor profile
    const doctorProfile = await DoctorProfile.findOne({ userId: id });
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Update availability
    if (Array.isArray(availability)) {
      doctorProfile.availability = availability;
    } else if (typeof availability === 'string') {
      doctorProfile.availability = availability.split(',').map(day => day.trim());
    }
    await doctorProfile.save();
    
    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: doctorProfile.availability
    });
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message
    });
  }
};

/**
 * Get doctor reviews
 */
export const getDoctorReviews = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify the doctor exists
    const doctor = await User.findOne({ _id: id, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Find the doctor profile
    const doctorProfile = await DoctorProfile.findOne({ userId: id });
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Get populated reviews
    const populatedProfile = await DoctorProfile.findOne({ userId: id })
      .populate({
        path: 'reviews.patientId',
        select: 'firstName lastName profileImage'
      });
    
    res.json({
      success: true,
      reviews: populatedProfile.reviews,
      ratings: populatedProfile.ratings
    });
  } catch (error) {
    console.error('Error fetching doctor reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

/**
 * Add or update doctor review
 */
export const addDoctorReview = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { rating, comment } = req.body;
    const patientId = req.user._id;
    
    // Validate inputs
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Find doctor profile
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Check if patient has already reviewed this doctor
    const existingReviewIndex = doctorProfile.reviews.findIndex(
      review => review.patientId.toString() === patientId.toString()
    );
    
    if (existingReviewIndex !== -1) {
      // Update existing review
      doctorProfile.reviews[existingReviewIndex].rating = rating;
      doctorProfile.reviews[existingReviewIndex].comment = comment;
      doctorProfile.reviews[existingReviewIndex].date = new Date();
    } else {
      // Add new review
      doctorProfile.reviews.push({
        patientId,
        rating,
        comment,
        date: new Date()
      });
    }
    
    // Save profile - pre save hook will update average rating
    await doctorProfile.save();
    
    res.json({
      success: true,
      message: 'Review submitted successfully',
      ratings: doctorProfile.ratings,
      reviewCount: doctorProfile.reviews.length
    });
  } catch (error) {
    console.error('Error submitting doctor review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
};

/**
 * Create new doctor (admin only)
 * Creates both a user account with doctor role and a doctor profile
 */
export const createDoctor = async (req, res) => {
  try {

    const { 
      name, 
      email, 
      password, 
      phone, 
      specialization, 
      qualification, 
      experience, 
      availability,
      registrationNumber 
    } = req.body;

    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // 1. Create user account with doctor role
    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // Will be hashed by pre-save hook
      phoneNumber: phone,
      role: 'doctor'
    });

    // Handle profile image if provided
    if (req.file) {
      newUser.profileImage = `/uploads/doctors/${req.file.filename}`;
    }

    await newUser.save();

    // 2. Create doctor profile
    const doctorProfile = new DoctorProfile({
      userId: newUser._id,
      specialization,
      qualification,
      experience: parseInt(experience, 10) || 0,
      bio: req.body.bio || '',
      languages: req.body.languages ? JSON.parse(req.body.languages) : ['English'],
      availability: Array.isArray(availability) ? availability : 
                   (availability ? availability.split(',').map(day => day.trim()) : []),
      registrationNumber: registrationNumber // Add registrationNumber to profile
    });

    await doctorProfile.save();

    // Return combined data
    const doctor = {
      _id: newUser._id,
      name: `${newUser.firstName} ${newUser.lastName}`,
      email:newUser.email,
      phone: newUser.phoneNumber,
      profileImage: newUser.profileImage,
      role: newUser.role,
      specialization: doctorProfile.specialization,
      qualification: doctorProfile.qualification,
      experience: doctorProfile.experience,
      availability: doctorProfile.availability,
      registrationNumber: doctorProfile.registrationNumber // Include registrationNumber in response
    };

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      doctor
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor',
      error: error.message
    });
  }
};

/**
 * Update doctor (admin only)
 * Updates both user account and doctor profile
 */
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      password, 
      phone, 
      specialization, 
      qualification, 
      experience, 
      availability,
      registrationNumber // Extract registrationNumber
    } = req.body;

    // 1. Update user account
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Verify this is a doctor account
    if (user.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'This user is not a doctor'
      });
    }

    // Update user account fields
    if (name) {
      const nameParts = name.split(' ');
      user.firstName = nameParts[0];
      user.lastName = nameParts.slice(1).join(' ');
    }
    
    if (email) user.email = email;
    if (phone) user.phoneNumber = phone;
    if (password && password.trim() !== '') user.password = password;

    // Handle profile image if provided
    if (req.file) {
      user.profileImage = `/uploads/doctors/${req.file.filename}`;
    }

    await user.save();

    // 2. Update doctor profile
    const doctorProfile = await DoctorProfile.findOne({ userId: id });
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Update doctor profile fields
    if (specialization) doctorProfile.specialization = specialization;
    if (qualification) doctorProfile.qualification = qualification;
    if (experience) doctorProfile.experience = parseInt(experience, 10) || doctorProfile.experience;
    if (availability) {
      doctorProfile.availability = Array.isArray(availability) ? availability : 
                                  availability.split(',').map(day => day.trim());
    }
    if (req.body.bio) doctorProfile.bio = req.body.bio;
    if (req.body.languages) {
      try {
        doctorProfile.languages = JSON.parse(req.body.languages);
      } catch {
        doctorProfile.languages = req.body.languages.split(',').map(lang => lang.trim());
      }
    }
    if (registrationNumber) {
      doctorProfile.registrationNumber = registrationNumber;
    }

    await doctorProfile.save();

    // Return updated doctor data
    const updatedDoctor = {
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phoneNumber,
      profileImage: user.profileImage,
      specialization: doctorProfile.specialization,
      qualification: doctorProfile.qualification,
      experience: doctorProfile.experience,
      availability: doctorProfile.availability,
      registrationNumber: doctorProfile.registrationNumber // Include registrationNumber in response
    };

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor',
      error: error.message
    });
  }
};

/**
 * Delete doctor (admin only)
 * Deletes both user account and doctor profile
 */
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find and verify the user is a doctor
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (user.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'This user is not a doctor'
      });
    }

    // 2. Delete doctor profile
    await DoctorProfile.findOneAndDelete({ userId: id });

    // 3. Delete user account
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor',
      error: error.message
    });
  }
}; 