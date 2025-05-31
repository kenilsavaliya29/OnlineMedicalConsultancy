import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../contexts/authContext.jsx';
import useDebounce from '../../../hooks/useDebounce.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MedicalProfileTab = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    bloodGroup: '',
    height: '',
    weight: '',
    allergies: [],
    medicalConditions: [],
    medications: [],
    emergencyContact: { name: '', relationship: '', phoneNumber: '', email: '' },
    insurance: { provider: '', policyNumber: '', validUntil: '' },
    healthMetrics: []
  });

  const [tempMedicalCondition, setTempMedicalCondition] = useState('');
  const [tempAllergy, setTempAllergy] = useState('');
  const [tempMedicationName, setTempMedicationName] = useState('');
  const [tempDosage, setTempDosage] = useState('');
  const [tempFrequency, setTempFrequency] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const [tempMetricType, setTempMetricType] = useState('');
  const [tempMetricValue, setTempMetricValue] = useState('');
  const [tempMetricUnit, setTempMetricUnit] = useState('');
  const [tempMetricDate, setTempMetricDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempMetricNotes, setTempMetricNotes] = useState('');


  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/patient/medical-profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();
        console.log(data)

        if (response.ok && data.success) {
          const profile = data.profile;
          setFormData({
            dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
            bloodGroup: profile.bloodGroup || '',
            height: profile.height || '',
            weight: profile.weight || '',
            allergies: profile.allergies || [],
            medicalConditions: profile.medicalConditions || [],
            medications: profile.medications || [],
            emergencyContact: profile.emergencyContact || { name: '', relationship: '', phoneNumber: '', email: '' },
            insurance: profile.insurance || { provider: '', policyNumber: '', validUntil: '' },
            healthMetrics: profile.healthMetrics || []
          });
          checkProfileCompletion(profile);
        } else if (response.status === 404) {

          setIsProfileComplete(false);
        } else {
          toast.error(data.message || 'Failed to fetch medical profile.');
          setIsProfileComplete(false);
        }
      } catch (error) {
        console.error('Error fetching medical profile:', error);
        toast.error('Error connecting to server.');
        setIsProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const checkProfileCompletion = (profile) => {
    const essentialFields = [
      profile.dateOfBirth,
      profile.bloodGroup,
      profile.height,
      profile.weight,
      profile.emergencyContact?.name,
      profile.emergencyContact?.phoneNumber,
    ];

    const hasAllergies = profile.allergies && profile.allergies.length > 0;
    const hasMedicalConditions = profile.medicalConditions && profile.medicalConditions.length > 0;

    const complete = essentialFields.every(field => field !== null && field !== undefined && field !== '') &&
      (hasAllergies || hasMedicalConditions ||
        (profile.allergies && profile.allergies.length === 0 &&
          profile.medicalConditions && profile.medicalConditions.length === 0));

    setIsProfileComplete(complete);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [field]: value }
      }));
    } else if (name.includes('insurance.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        insurance: { ...prev.insurance, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addMedicalCondition = (condition) => {
    if (condition && !formData.medicalConditions.includes(condition)) {
      setFormData(prev => ({ ...prev, medicalConditions: [...prev.medicalConditions, condition] }));
    }
    setTempMedicalCondition('');
  };

  const removeMedicalCondition = (condition) => {
    setFormData(prev => ({ ...prev, medicalConditions: prev.medicalConditions.filter(c => c !== condition) }));
  };

  const addAllergy = (allergy) => {
    if (allergy && !formData.allergies.includes(allergy)) {
      setFormData(prev => ({ ...prev, allergies: [...prev.allergies, allergy] }));
    }
    setTempAllergy('');
  };

  const removeAllergy = (allergy) => {
    setFormData(prev => ({ ...prev, allergies: prev.allergies.filter(a => a !== allergy) }));
  };

  const addMedication = () => {
    if (tempMedicationName && tempDosage && tempFrequency) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, {
          name: tempMedicationName,
          dosage: tempDosage,
          frequency: tempFrequency,
          startDate: tempStartDate || undefined,
          endDate: tempEndDate || undefined,
          isActive: true
        }]
      }));
      setTempMedicationName('');
      setTempDosage('');
      setTempFrequency('');
      setTempStartDate('');
      setTempEndDate('');
    } else {
      toast.error('Medication name, dosage, and frequency are required.');
    }
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const addHealthMetric = () => {
    if (tempMetricType && tempMetricValue && tempMetricUnit) {
      setFormData(prev => ({
        ...prev,
        healthMetrics: [...prev.healthMetrics, {
          type: tempMetricType,
          value: tempMetricValue,
          unit: tempMetricUnit,
          date: tempMetricDate || new Date().toISOString().split('T')[0],
          notes: tempMetricNotes || undefined,
        }]
      }));
      setTempMetricType('');
      setTempMetricValue('');
      setTempMetricUnit('');
      setTempMetricDate(new Date().toISOString().split('T')[0]);
      setTempMetricNotes('');
    } else {
      toast.error('Health metric type, value, and unit are required.');
    }
  };

  const removeHealthMetric = (index) => {
    setFormData(prev => ({
      ...prev,
      healthMetrics: prev.healthMetrics.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/patient/update-medical-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message);
        checkProfileCompletion(data.profile); // Re-check completion after update
      } else {
        toast.error(data.message || 'Failed to save medical profile.');
      }
    } catch (error) {
      console.error('Error submitting medical profile:', error);
      toast.error('Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

  console.log(formData)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007E85]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-[#007E85] mb-4">My Medical Profile</h2>
      {!isProfileComplete && (
        <p className="text-red-500 mb-4">Your basic medical profile is incomplete. Please fill in the required details below to book consultations.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Basic Information</h3>
          <div>
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="dateOfBirth">Date of Birth*</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="bloodGroup">Blood Group*</label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              required
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="height">Height (cm)*</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                placeholder="e.g., 175"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="weight">Weight (kg)*</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g., 70"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                required
              />
            </div>
          </div>
        </div>

        {/* Medical Conditions & Allergies */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Medical Conditions & Allergies</h3>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Medical Conditions</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {['Diabetes', 'Hypertension', 'Cholesterol', 'Thyroid'].map(condition => (
                <span key={condition} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-300"
                  onClick={() => addMedicalCondition(condition)}>{condition}</span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tempMedicalCondition}
                onChange={(e) => setTempMedicalCondition(e.target.value)}
                placeholder="Add a condition"
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              />
              <button
                type="button"
                onClick={() => addMedicalCondition(tempMedicalCondition)}
                className="bg-[#007E85] text-white px-4 py-2 rounded-r-lg hover:bg-[#006b6f]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.medicalConditions.map((condition, index) => (
                <span key={index} className="bg-[#e6f5f6] text-[#007E85] px-3 py-1 rounded-full flex items-center text-sm">
                  {condition}
                  <button type="button" onClick={() => removeMedicalCondition(condition)} className="ml-2 text-red-500 hover:text-red-700">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Allergies</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {['Nuts', 'Dairy', 'Gluten', 'Pollen'].map(allergy => (
                <span key={allergy} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-300"
                  onClick={() => addAllergy(allergy)}>{allergy}</span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tempAllergy}
                onChange={(e) => setTempAllergy(e.target.value)}
                placeholder="Add an allergy"
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              />
              <button
                type="button"
                onClick={() => addAllergy(tempAllergy)}
                className="bg-[#007E85] text-white px-4 py-2 rounded-r-lg hover:bg-[#006b6f]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.allergies.map((allergy, index) => (
                <span key={index} className="bg-[#e6f5f6] text-[#007E85] px-3 py-1 rounded-full flex items-center text-sm">
                  {allergy}
                  <button type="button" onClick={() => removeAllergy(allergy)} className="ml-2 text-red-500 hover:text-red-700">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Current Medications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="medicationName">Medication Name</label>
              <input
                type="text"
                id="medicationName"
                value={tempMedicationName}
                onChange={(e) => setTempMedicationName(e.target.value)}
                placeholder="e.g., Aspirin"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="dosage">Dosage</label>
              <input
                type="text"
                id="dosage"
                value={tempDosage}
                onChange={(e) => setTempDosage(e.target.value)}
                placeholder="e.g., 100mg"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="frequency">Frequency</label>
              <input
                type="text"
                id="frequency"
                value={tempFrequency}
                onChange={(e) => setTempFrequency(e.target.value)}
                placeholder="e.g., Once daily"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={addMedication}
                className="w-full bg-[#6EAB36] text-white px-4 py-2 rounded-lg hover:bg-[#5a9a2d]"
              >
                Add Medication
              </button>
            </div>
          </div>
          <div className="mt-4">
            {formData.medications.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {formData.medications.map((med, index) => (
                  <li key={index} className="bg-gray-100 p-2 rounded-lg flex justify-between items-center">
                    <span>{med.name} - {med.dosage} ({med.frequency})</span>
                    <button type="button" onClick={() => removeMedication(index)} className="ml-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm italic">No medications added.</p>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Emergency Contact*</h3>
          <div>
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="emergencyContactName">Name*</label>
            <input
              type="text"
              id="emergencyContactName"
              name="emergencyContact.name"
              value={formData.emergencyContact.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="emergencyContactRelationship">Relationship</label>
            <select
              id="emergencyContactRelationship"
              name="emergencyContact.relationship"
              value={formData.emergencyContact.relationship}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
            >
              <option value="">Select Relationship</option>
              <option value="Parent">Parent</option>
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="emergencyContactPhone">Phone Number*</label>
            <input
              type="tel"
              id="emergencyContactPhone"
              name="emergencyContact.phoneNumber"
              value={formData.emergencyContact.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="emergencyContactEmail">Email</label>
            <input
              type="email"
              id="emergencyContactEmail"
              name="emergencyContact.email"
              value={formData.emergencyContact.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
            />
          </div>
        </div>

        {/* Insurance Information */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Insurance Information</h3>
          <div>
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="insuranceProvider">Provider</label>
            <input
              type="text"
              id="insuranceProvider"
              name="insurance.provider"
              value={formData.insurance.provider}
              onChange={handleInputChange}
              placeholder="e.g., Blue Cross Blue Shield"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="policyNumber">Policy Number</label>
            <input
              type="text"
              id="policyNumber"
              name="insurance.policyNumber"
              value={formData.insurance.policyNumber}
              onChange={handleInputChange}
              placeholder="e.g., XYZ123456789"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="validUntil">Valid Until</label>
            <input
              type="date"
              id="validUntil"
              name="insurance.validUntil"
              value={formData.insurance.validUntil ? new Date(formData.insurance.validUntil).toISOString().split('T')[0] : ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
            />
          </div>
        </div>

        {/* Health Metrics */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Health Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="metricType">Metric Type*</label>
              <select
                id="metricType"
                value={tempMetricType}
                onChange={(e) => setTempMetricType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              >
                <option value="">Select Type</option>
                <option value="blood_pressure">Blood Pressure</option>
                <option value="heart_rate">Heart Rate</option>
                <option value="blood_sugar">Blood Sugar</option>
                <option value="cholesterol">Cholesterol</option>
                <option value="temperature">Temperature</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="metricValue">Value*</label>
              <input
                type="text"
                id="metricValue"
                value={tempMetricValue}
                onChange={(e) => setTempMetricValue(e.target.value)}
                placeholder="e.g., 120/80 (BP), 70 (HR)"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="metricUnit">Unit*</label>
              <input
                type="text"
                id="metricUnit"
                value={tempMetricUnit}
                onChange={(e) => setTempMetricUnit(e.target.value)}
                placeholder="e.g., mmHg, bpm, mg/dL, °C/°F"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="metricDate">Date</label>
              <input
                type="date"
                id="metricDate"
                value={tempMetricDate}
                onChange={(e) => setTempMetricDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="metricNotes">Notes</label>
              <textarea
                id="metricNotes"
                value={tempMetricNotes}
                onChange={(e) => setTempMetricNotes(e.target.value)}
                placeholder="Any additional notes for this metric"
                rows="2"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
              ></textarea>
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                type="button"
                onClick={addHealthMetric}
                className="w-full bg-[#6EAB36] text-white px-4 py-2 rounded-lg hover:bg-[#5a9a2d]"
              >
                Add Health Metric
              </button>
            </div>
          </div>
          <div className="mt-4">
            {formData.healthMetrics.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {formData.healthMetrics.map((metric, index) => (
                  <li key={index} className="bg-gray-100 p-2 rounded-lg flex justify-between items-center">
                    <span>{metric.type}: {metric.value} {metric.unit} (on {new Date(metric.date).toLocaleDateString()})</span>
                    <button type="button" onClick={() => removeHealthMetric(index)} className="ml-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm italic">No health metrics added.</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#007E85] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#006b6f] transition-colors duration-300 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Medical Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalProfileTab; 