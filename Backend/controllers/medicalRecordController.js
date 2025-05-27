import MedicalRecord from '../models/medicalRecordModel.js';
import User from '../models/userModel.js';

/**
 * Get medical records for a patient
 */
export const getPatientMedicalRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Check if the patient exists
    const patientExists = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Only allow access to own records (if patient) or patient's doctor or admin
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these records'
      });
    }
    
    // Get all medical records for the patient
    const records = await MedicalRecord.find({ patientId })
      .sort({ recordDate: -1 });
    
    res.json({
      success: true,
      records
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records',
      error: error.message
    });
  }
};

/**
 * Create a new medical record
 */
export const createMedicalRecord = async (req, res) => {
  try {
    const { 
      patientId, appointmentId, title, recordType,
      diagnosis, symptoms, notes, treatmentPlan, vitals,
      prescriptions
    } = req.body;
    
    // Check if the patient exists
    const patientExists = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Create the medical record
    const record = new MedicalRecord({
      patientId,
      doctorId: req.user._id,
      appointmentId,
      title,
      recordType,
      diagnosis: diagnosis || [],
      symptoms: symptoms || [],
      notes: notes || '',
      treatmentPlan: treatmentPlan || '',
      vitals: vitals || {},
      prescriptions: prescriptions || []
    });
    
    await record.save();
    
    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      record
    });
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create medical record',
      error: error.message
    });
  }
};

/**
 * Get a specific medical record
 */
export const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await MedicalRecord.findById(id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check if user has access to this record
    if (req.user.role === 'patient' && record.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this record'
      });
    }
    
    if (req.user.role === 'doctor' && record.doctorId.toString() !== req.user._id.toString()) {
      // Check record visibility settings
      if (record.visibility !== 'all_doctors') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this record'
        });
      }
    }
    
    res.json({
      success: true,
      record
    });
  } catch (error) {
    console.error('Error fetching medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical record',
      error: error.message
    });
  }
};

/**
 * Update a medical record
 */
export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find the record
    const record = await MedicalRecord.findById(id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Only the doctor who created the record can update it
    if (record.doctorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this record'
      });
    }
    
    // Apply updates - protect certain fields
    const allowedUpdates = [
      'title', 'diagnosis', 'symptoms', 'notes', 
      'treatmentPlan', 'vitals', 'prescriptions', 'visibility'
    ];
    
    // Only update allowed fields
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        record[key] = updates[key];
      }
    }
    
    // Save the updated record
    await record.save();
    
    res.json({
      success: true,
      message: 'Medical record updated successfully',
      record
    });
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medical record',
      error: error.message
    });
  }
}; 