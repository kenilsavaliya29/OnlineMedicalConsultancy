import MedicalRecord from '../models/medicalRecordModel.js';
import User from '../models/userModel.js';

/**
 * Get prescriptions for a patient
 */
export const getPatientPrescriptions = async (req, res) => {
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
    
    // Only allow access to own prescriptions (if patient) or patient's doctor or admin
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these prescriptions'
      });
    }
    
    // Get all medical records with prescriptions for the patient
    const records = await MedicalRecord.find({ 
      patientId,
      'prescriptions.0': { $exists: true } // Only records with prescriptions
    }).sort({ recordDate: -1 });
    
    // Extract prescriptions from all records
    const prescriptions = records.flatMap(record => {
      return record.prescriptions.map(prescription => ({
        ...prescription.toObject(),
        recordId: record._id,
        recordTitle: record.title,
        recordDate: record.recordDate,
        doctorId: record.doctorId
      }));
    });
    
    res.json({
      success: true,
      prescriptions
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
};

/**
 * Create a new prescription for a patient
 */
export const createPrescription = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { 
      recordId,
      medicationName, 
      dosage, 
      frequency, 
      duration, 
      instructions
    } = req.body;
    
    // Check if the patient exists
    const patientExists = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Validate required fields
    if (!medicationName || !dosage || !frequency) {
      return res.status(400).json({
        success: false,
        message: 'Medication name, dosage, and frequency are required'
      });
    }
    
    // Find the medical record to update
    let record;
    if (recordId) {
      record = await MedicalRecord.findById(recordId);
      
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Medical record not found'
        });
      }
      
      // Only the doctor who created the record can update it
      if (record.doctorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this record'
        });
      }
      
      // Add the prescription to the existing record
      record.prescriptions.push({
        medicationName,
        dosage,
        frequency,
        duration,
        instructions,
        isActive: true
      });
      
      await record.save();
    } else {
      // Create a new medical record with the prescription
      record = new MedicalRecord({
        patientId,
        doctorId: req.user._id,
        title: `Prescription: ${medicationName}`,
        recordType: 'prescription',
        recordDate: new Date(),
        prescriptions: [{
          medicationName,
          dosage,
          frequency,
          duration,
          instructions,
          isActive: true
        }]
      });
      
      await record.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Prescription added successfully',
      record
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: error.message
    });
  }
};

/**
 * Update a prescription
 */
export const updatePrescription = async (req, res) => {
  try {
    const { recordId, prescriptionId } = req.params;
    const updates = req.body;
    
    // Find the record
    const record = await MedicalRecord.findById(recordId);
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
    
    // Find the prescription in the record
    const prescriptionIndex = record.prescriptions.findIndex(
      p => p._id.toString() === prescriptionId
    );
    
    if (prescriptionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found in the record'
      });
    }
    
    // Update prescription fields
    const allowedUpdates = [
      'medicationName', 'dosage', 'frequency', 'duration', 'instructions', 'isActive'
    ];
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        record.prescriptions[prescriptionIndex][key] = updates[key];
      }
    }
    
    await record.save();
    
    res.json({
      success: true,
      message: 'Prescription updated successfully',
      prescription: record.prescriptions[prescriptionIndex]
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prescription',
      error: error.message
    });
  }
}; 