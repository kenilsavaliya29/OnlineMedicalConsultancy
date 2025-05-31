import PatientProfile from '../models/patientProfileModel.js';
import User from '../models/userModel.js';

//Create new wellness profile
export const createWellnessProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const existingProfile = await PatientProfile.findOne({ userId });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: 'Wellness profile already exists for this user. Use PATCH to update.'
      });
    }

    const {
      height,
      weight,
      medicalConditions,
      allergies,
      dietaryPreference,
      fitnessGoal,
      activityLevel,
      targetDuration,
      targetWeight
    } = req.body;

    const newPatientProfile = new PatientProfile({
      userId,
      height,
      weight,
      medicalConditions,
      allergies,
      wellnessProgram: {
        dietaryPreference,
        fitnessGoal,
        activityLevel,
        targetDuration,
        targetWeight,
      }
    });

    await newPatientProfile.save();

    res.status(201).json({
      success: true,
      message: 'Wellness profile created successfully',
      profile: newPatientProfile,
    });

  } catch (error) {
    console.error('Error in createWellnessProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create wellness profile',
      error: error.message,
    });
  }
};

//update the exisiting wellness profile 
export const updateWellnessProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      height,
      weight,
      medicalConditions,
      allergies,
      dietaryPreference,
      fitnessGoal,
      activityLevel,
      targetDuration,
      targetWeight,
      dietPlanContent // Assuming this can also be updated
    } = req.body;

    let patientProfile = await PatientProfile.findOne({ userId });

    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Wellness profile not found. Please create one first.'
      });
    }

    // Update fields if provided
    if (height !== undefined) patientProfile.height = height;
    if (weight !== undefined) patientProfile.weight = weight;
    if (medicalConditions !== undefined) patientProfile.medicalConditions = medicalConditions;
    if (allergies !== undefined) patientProfile.allergies = allergies;

    // Update nested wellnessProgram fields
    if (patientProfile.wellnessProgram === undefined) {
      patientProfile.wellnessProgram = {};
    }
    if (dietaryPreference !== undefined) patientProfile.wellnessProgram.dietaryPreference = dietaryPreference;
    if (fitnessGoal !== undefined) patientProfile.wellnessProgram.fitnessGoal = fitnessGoal;
    if (activityLevel !== undefined) patientProfile.wellnessProgram.activityLevel = activityLevel;
    if (targetDuration !== undefined) patientProfile.wellnessProgram.targetDuration = targetDuration;
    if (targetWeight !== undefined) patientProfile.wellnessProgram.targetWeight = targetWeight;
    if (dietPlanContent !== undefined) patientProfile.wellnessProgram.dietPlanContent = dietPlanContent;

    await patientProfile.save();

    res.status(200).json({
      success: true,
      message: 'Wellness profile updated successfully',
      profile: patientProfile,
    });
  } catch (error) {
    console.error('Error in updateWellnessProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wellness profile',
      error: error.message,
    });
  }
};

// used to get wellness profile details of user

export const getWellnessProfile = async (req, res) => {
  try {
    const userId = req.user._id; // User ID from authenticated token

    const patientProfile = await PatientProfile.findOne({ userId }).populate('userId', 'firstName lastName email gender');

    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Wellness profile not found for this user',
      });
    }
    
    // Construct data to send back to frontend, combining user info and wellness data
    const profileData = {
      name: `${patientProfile.userId.firstName || ''} ${patientProfile.userId.lastName || ''}`.trim(),
      age: patientProfile.age, // Virtual property
      gender: patientProfile.userId.gender,
      height: patientProfile.height,
      weight: patientProfile.weight,
      medicalConditions: patientProfile.medicalConditions || [],
      allergies: patientProfile.allergies || [],
      dietaryPreference: patientProfile.wellnessProgram?.dietaryPreference || '',
      fitnessGoal: patientProfile.wellnessProgram?.fitnessGoal || '',
      activityLevel: patientProfile.wellnessProgram?.activityLevel || '',
      targetDuration: patientProfile.wellnessProgram?.targetDuration || '',
      targetWeight: patientProfile.wellnessProgram?.targetWeight || '',
      dietPlanContent: patientProfile.wellnessProgram?.dietPlanContent || '',
    };

    res.status(200).json({
      success: true,
      message: 'Wellness profile retrieved successfully',
      profile: profileData,
    });
  } catch (error) {
    console.error('Error in getWellnessProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wellness profile',
      error: error.message,
    });
  }
};

// Delete a wellness program of a user if he wants to delete it

export const deleteWellnessProfile = async (req, res) => {
  try {
    const userId = req.user._id; // User ID from authenticated token

    const patientProfile = await PatientProfile.findOne({ userId });

    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Wellness profile not found for this user',
      });
    }

    await PatientProfile.updateOne({ userId }, { $unset: { wellnessProgram: "" } });

    res.status(200).json({
      success: true,
      message: 'Wellness profile deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteWellnessProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete wellness profile',
      error: error.message,
    });
  }
}; 