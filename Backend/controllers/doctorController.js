import User from '../models/userModel.js';
import DoctorProfile from '../models/doctorProfileModel.js';
import { sendEmail } from '../utils/email.js';

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

      // If profile exists and availability is in the old array format, transform it
      if (profile && Array.isArray(profile.availability)) {
        const transformedAvailability = {
          dateSpecific: [],
          recurringWeekly: [],
        };

        profile.availability.forEach(slot => {
          if (slot.availabilityType === 'dateSpecific') {
            transformedAvailability.dateSpecific.push({
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
            });
          } else if (slot.availabilityType === 'recurringWeekly') {
            transformedAvailability.recurringWeekly.push({
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
              recurringFromDate: slot.recurringFromDate,
              recurringToDate: slot.recurringToDate,
            });
          }
        });
        profile.availability = transformedAvailability;
      }

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
    const { dateSpecificAvailability, recurringWeeklyAvailability } = req.body;

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
    if (dateSpecificAvailability) {
      doctorProfile.availability.dateSpecific = dateSpecificAvailability;
    }
    if (recurringWeeklyAvailability) {
      doctorProfile.availability.recurringWeekly = recurringWeeklyAvailability;
    }

    await doctorProfile.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: doctorProfile.availability,
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

export const updateDoctorProfile = async (req, res) => {
  try {
    const { bio, languages } = req.body;
    const userId = req.user.id; // User ID from verifyToken
    const profileImage = req.file ? `/${req.file.destination}/${req.file.filename}` : undefined; // Path to uploaded image

    // Find the doctor profile associated with the user ID
    const doctorProfile = await DoctorProfile.findOne({ userId });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Update bio if provided
    if (bio !== undefined) {
      doctorProfile.bio = bio;
    }

    // Update profile image if a new one is uploaded
    if (profileImage) {
      // Optionally, delete the old profile image from the server if it exists
      // For now, we'll just update the path in the DB.
      doctorProfile.profileImage = profileImage;
    }

    // Handle languages if needed
    if (languages !== undefined) {
      doctorProfile.languages = languages; // Assuming languages is an array of strings
    }

    await doctorProfile.save();

    // Also update the main user model if the profile image is stored there as well
    if (profileImage) {
      await User.findByIdAndUpdate(userId, { profileImage });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      doctorProfile: doctorProfile,
      profileImage: profileImage // Send back the updated image path
    });

  }
  catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor profile',
      error: error.message
    });
  }
}

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

//random password generator fn
const generateRandomPassword = (length = 10) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};

//mail sender
const sendWelcomeEmail = async (doctorName, email, password) => {
  console.log("hello")
  const subject = 'Welcome to Medical Consultancy - Your Account Details';

  const body = `
Dear Dr. ${doctorName},

Welcome to our Medical Consultancy platform! Your account has been created by the administrator.

Here are your login credentials:
Email: ${email}
Password: ${password}

Please log in using these credentials and change your password as soon as possible for security reasons.

If you have any questions, please contact our support team.

Best regards,
Medical Consultancy Team
  `;

  return await sendEmail(email, subject, body);
};

/**
 * Create new doctor (admin only)
 * Creates both a user account with doctor role and a doctor profile
 */
export const createDoctor = async (req, res) => {
  try {
    console.log(req.body)
    const {
      fullName,
      email,
      phone,
      specialization,
      qualification,
      experience,
      dateSpecificAvailability,
      recurringWeeklyAvailability,
      registrationNumber
    } = req.body;

    const nameParts = fullName.split(' ');
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

    // Generate a random password
    const generatedPassword = generateRandomPassword();

    // 1. Create user account with doctor role
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: generatedPassword,
      phoneNumber: phone,
      role: 'doctor'
    });

    await newUser.save();

    // 2. Create doctor profile
    const doctorProfile = new DoctorProfile({
      userId: newUser._id,
      specialization,
      qualification,
      experience: parseInt(experience, 10) || 0,
      bio: req.body.bio || '',
      languages: req.body.languages ? JSON.parse(req.body.languages) : ['English'],
      availability: {
        dateSpecific: dateSpecificAvailability || [],
        recurringWeekly: recurringWeeklyAvailability || [],
      },
      registrationNumber: registrationNumber, // Add registrationNumber to profile
      profileImage: req.file ? `/uploads/doctors/${req.file.filename}` : null, // Add profileImage to doctor profile
    });

    await doctorProfile.save();

    // 3. Send welcome email with login credentials
    const emailResult = await sendWelcomeEmail(fullName, email, generatedPassword);

    if (!emailResult.success) {
      console.warn('Failed to send welcome email:', emailResult.error);
    }

    // Return combined data
    const doctor = {
      _id: newUser._id,
      name: `${newUser.firstName} ${newUser.lastName}`,
      email: newUser.email,
      phone: newUser.phoneNumber,
      profileImage: doctorProfile.profileImage,
      role: newUser.role,
      specialization: doctorProfile.specialization,
      qualification: doctorProfile.qualification,
      experience: doctorProfile.experience,
      availability: doctorProfile.availability,
      registrationNumber: doctorProfile.registrationNumber
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
      fullName,
      email,
      password,
      phone,
      specialization,
      qualification,
      experience,
      dateSpecificAvailability,
      recurringWeeklyAvailability,
      registrationNumber
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
    if (fullName) {
      const nameParts = fullName.split(' ');
      user.firstName = nameParts[0];
      user.lastName = nameParts.slice(1).join(' ');
    }

    if (email) user.email = email;
    if (phone) user.phoneNumber = phone;
    if (password && password.trim() !== '') user.password = password;

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
    if (dateSpecificAvailability) {
      doctorProfile.availability.dateSpecific = dateSpecificAvailability;
    }
    if (recurringWeeklyAvailability) {
      doctorProfile.availability.recurringWeekly = recurringWeeklyAvailability;
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
    // Update profile image if a new one is uploaded
    if (req.file) {
      doctorProfile.profileImage = `/uploads/doctors/${req.file.filename}`;
    }

    await doctorProfile.save();

    // Return updated doctor data
    const updatedDoctor = {
      _id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phoneNumber,
      profileImage: doctorProfile.profileImage,
      specialization: doctorProfile.specialization,
      qualification: doctorProfile.qualification,
      experience: doctorProfile.experience,
      availability: doctorProfile.availability,
      registrationNumber: doctorProfile.registrationNumber
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

export const updateConsultationFee = async (req, res) => {
    try {
        const doctorId = req.user._id; 
        const { consultationPrice } = req.body;

        // Validate consultation price
        if (!consultationPrice || consultationPrice < 100) {
            return res.status(400).json({
                success: false,
                message: 'Consultation price must be at least 100'
            });
        }

        // Find and update doctor profile
        const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });
        if (!doctorProfile) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        // Update consultation price
        doctorProfile.consultationPrice = consultationPrice;
        await doctorProfile.save();

        res.json({
            success: true,
            message: 'Consultation fee updated successfully',
            consultationPrice: doctorProfile.consultationPrice
        });
    } catch (error) {
        console.error('Error updating consultation fee:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update consultation fee',
            error: error.message
        });
    }
};