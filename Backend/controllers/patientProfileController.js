import PatientProfile from '../models/patientProfileModel.js';
import User from '../models/userModel.js';

//for checking the status of the patient's profile 
// Necessary details are filled or empty 
export const getPatientProfileStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const patientProfile = await PatientProfile.findOne({ userId });

    if (!patientProfile) {
      return res.status(200).json({
        success: true,
        isBasicProfileComplete: false,
        message: 'Patient profile not found. Please complete basic medical details.'
      });
    }

    // Define essential fields for basic profile completeness
    const essentialFields = [
      patientProfile.dateOfBirth,
      patientProfile.bloodGroup,
      patientProfile.height,
      patientProfile.weight,
      patientProfile.emergencyContact?.name,
      patientProfile.emergencyContact?.phoneNumber,
    ];

    // Check if allergies or medicalConditions arrays are empty
    const hasAllergies = patientProfile.allergies && patientProfile.allergies.length > 0;
    const hasMedicalConditions = patientProfile.medicalConditions && patientProfile.medicalConditions.length > 0;

    const isBasicProfileComplete = essentialFields.every(field => field !== null && field !== undefined && field !== '') &&
      (hasAllergies || hasMedicalConditions ||
        (patientProfile.allergies && patientProfile.allergies.length === 0 &&
          patientProfile.medicalConditions && patientProfile.medicalConditions.length === 0));

    res.status(200).json({
      success: true,
      isBasicProfileComplete,
      message: isBasicProfileComplete ? 'Basic medical profile is complete.' : 'Please complete your basic medical profile.'
    });
  } catch (error) {
    console.error('Error in getPatientProfileStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check profile status',
      error: error.message
    });
  }
};

// get the actual medical profile of the patient

export const getMedicalProfile = async (req, res) => {

  try {
    const userId = req.user._id;
    const patientProfile = await PatientProfile.findOne({ userId });

    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Medical profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medical profile fetched successfully',
      profile: patientProfile,
    });
  } catch (error) {
    console.error('Error in getMedicalProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical profile',
      error: error.message
    });
  }
};

// used to update the medical profile of the patient
// can be used by patient to update or doctor to add details or changes after consultation
export const updatePatientMedicalProfile = async (req, res) => {


  try {
    const userId = req.user._id;
    const {
      dateOfBirth,
      bloodGroup,
      height,
      weight,
      allergies,
      medicalConditions,
      medications,
      emergencyContact,
      insurance,
      healthMetrics,
      languages
    } = req.body;
    const profileImage = req.file ? `/${req.file.destination}/${req.file.filename}` : undefined; // Path to uploaded image

    let patientProfile = await PatientProfile.findOne({ userId });

    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found.'
      });
    }

    // Update fields
    patientProfile.dateOfBirth = dateOfBirth || patientProfile.dateOfBirth;
    patientProfile.bloodGroup = bloodGroup || patientProfile.bloodGroup;
    patientProfile.height = height || patientProfile.height;
    patientProfile.weight = weight || patientProfile.weight;
    patientProfile.allergies = allergies || patientProfile.allergies;
    patientProfile.medicalConditions = medicalConditions || patientProfile.medicalConditions; // Ensure it's an array
    patientProfile.medications = medications || patientProfile.medications;
    patientProfile.emergencyContact = emergencyContact || patientProfile.emergencyContact;
    patientProfile.insurance = insurance || patientProfile.insurance;
    patientProfile.healthMetrics = healthMetrics || patientProfile.healthMetrics;

    // Update languages if provided
    if (languages !== undefined) {
      patientProfile.languages = languages;
    }

    // Update profile image if a new one is uploaded
    if (profileImage) {
      patientProfile.profileImage = profileImage;
    }

    await patientProfile.save();

    res.status(200).json({
      success: true,
      message: 'Medical profile updated successfully',
      profile: patientProfile,
    });
  } catch (error) {
    console.error('Error in updatePatientMedicalProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medical profile',
      error: error.message,
    });
  }
};


export const updateAccountProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from authenticated request
    const profileImage = req.file ? `/${req.file.destination}/${req.file.filename}` : undefined; // Path to uploaded image
    let languages = req.body.languages; // languages will be a JSON string from formData

    if (languages) {
        try {
            languages = JSON.parse(languages); // Parse the JSON string back into an array
        } catch (parseError) {
            console.error('Error parsing languages JSON:', parseError);
            return res.status(400).json({ success: false, message: 'Invalid languages format' });
        }
    }

    let patientProfile = await PatientProfile.findOne({ userId });

    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found.'
      });
    }

    // Update profile image if a new one is uploaded
    if (profileImage) {
      patientProfile.profileImage = profileImage;
    }

    // Update languages if provided
    if (languages !== undefined) {
      patientProfile.languages = languages;
    }

    await patientProfile.save();

    res.status(200).json({
      success: true,
      message: 'Account profile updated successfully',
      profile: patientProfile, // Return the updated profile
    });
  } catch (error) {
    console.error('Error in updateAccountProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update account profile',
      error: error.message,
    });
  }
}