import React, { useState, useEffect, useContext } from 'react';
import MessageBox from '../common/MessageBox';
import { AuthContext } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

const WellnessProfile = () => {
  const { user, setRedirectPath } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [heightUnit, setHeightUnit] = useState('cm'); // 'cm' or 'ftIn'
  const [tempFeet, setTempFeet] = useState('');
  const [tempInches, setTempInches] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    medicalConditions: [],
    allergies: [],
    dietaryPreference: 'Vegetarian',
    fitnessGoal: '',
    activityLevel: '',
    targetDuration: 4,
    targetWeight: ''
  });
  
  const [tempMedicalCondition, setTempMedicalCondition] = useState('');
  const [tempAllergy, setTempAllergy] = useState('');
  
  const commonMedicalConditions = [
    'Diabetes', 
    'Hypertension', 
    'Cholesterol', 
    'Thyroid', 
    'Heart Disease',
    'Kidney Disease'
  ];
  
  const commonAllergies = [
    'Nuts', 
    'Dairy', 
    'Gluten', 
    'Seafood', 
    'Eggs', 
    'Soy'
  ];
  
  // Utility to convert centimeters to feet and inches
  const cmToFtIn = (cm) => {
    if (isNaN(cm) || cm === '') return { feet: '', inches: '' };
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  // Utility to convert feet and inches to centimeters
  const ftInToCm = (feet, inches) => {
    if (feet === '' && inches === '') return '';
    const totalInches = (parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0);
    return (totalInches * 2.54).toFixed(2); // Keep 2 decimal places for cm
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          console.log('User context not loaded yet, profile may fail to load');
        }
        
        console.log('Fetching profile...');
        console.log('API URL:', `${API_URL}/api/wellness/profile`);
        
        const response = await fetch(`${API_URL}/api/wellness/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        console.log('Response status:', response.status);
        
        if (response.status === 404) {
          setHasProfile(false);
          if (user) {
            setFormData(prev => ({
              ...prev,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              gender: user.gender || ''
            }));
          }
          setLoading(false);
          return;
        } else if (response.status === 401) {
          MessageBox.error('Your session has expired. Please login again.');
          setRedirectPath('/patient/wellness/profile');
          navigate('/login');
          return;
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok && data.success) {
          setHasProfile(true);
          const profileHeightCm = data.profile.height || '';
          setFormData({
            name: data.profile.name || '',
            age: data.profile.age || '',
            gender: data.profile.gender || '',
            height: profileHeightCm,
            weight: data.profile.weight || '',
            medicalConditions: data.profile.medicalConditions || [],
            allergies: data.profile.allergies || [],
            dietaryPreference: data.profile.dietaryPreference || 'Vegetarian',
            fitnessGoal: data.profile.fitnessGoal || '',
            activityLevel: data.profile.activityLevel || '',
            targetDuration: data.profile.targetDuration || 4,
            targetWeight: data.profile.targetWeight || '',
            firstName: data.profile.firstName || '',
            lastName: data.profile.lastName || '',
            email: data.profile.email || '',
            phone: data.profile.phone || ''
          });

          // Try to infer previous unit or default to cm display
          if (profileHeightCm) {
            const { feet, inches } = cmToFtIn(profileHeightCm);
            // If feet and inches are reasonably whole numbers, suggest ft/in display
            if (feet > 0 && inches >= 0 && (profileHeightCm % 2.54 !== 0)) { // Check if it's not a perfect CM conversion
              setHeightUnit('ftIn');
              setTempFeet(feet);
              setTempInches(inches);
            } else {
              setHeightUnit('cm');
            }
          }

        } else {
          MessageBox.error(`Failed to fetch profile data: ${data.message || 'Unknown error'}`);
          console.error('Failed to fetch profile:', data.message, 'Status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        MessageBox.error(`Failed to connect to server: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user, API_URL, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleHeightChange = (e) => {
    const { value, name } = e.target;
    
    if (heightUnit === 'cm') {
      if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setFormData(prev => ({ ...prev, height: value }));
      }
    } else { // ftIn
      if (name === 'feet') {
        if (value === '' || /^[0-9]*$/.test(value)) {
          setTempFeet(value);
        }
      } else if (name === 'inches') {
        if (value === '' || (/^[0-9]*$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 11)) {
          setTempInches(value);
        }
      }
    }
  };

  useEffect(() => {
    if (heightUnit === 'ftIn') {
      setFormData(prev => ({ ...prev, height: ftInToCm(tempFeet, tempInches) }));
    } else if (heightUnit === 'cm') {
      // If switching to cm, convert current ft/in to cm and set formData.height
      if (tempFeet !== '' || tempInches !== '') {
        setFormData(prev => ({ ...prev, height: ftInToCm(tempFeet, tempInches) }));
      }
      setTempFeet('');
      setTempInches('');
    }
  }, [heightUnit, tempFeet, tempInches]);

  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const addMedicalCondition = (condition) => {
    if (!condition.trim()) return;
    
    if (!formData.medicalConditions.includes(condition)) {
      setFormData(prev => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, condition]
      }));
    }
    
    setTempMedicalCondition('');
  };
  
  const removeMedicalCondition = (condition) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter(c => c !== condition)
    }));
  };
  
  const addAllergy = (allergy) => {
    if (!allergy.trim()) return;
    
    if (!formData.allergies.includes(allergy)) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy]
      }));
    }
    
    setTempAllergy('');
  };
  
  const removeAllergy = (allergy) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalHeightCm = formData.height;
    if (heightUnit === 'ftIn') {
      finalHeightCm = ftInToCm(tempFeet, tempInches);
    }

    if (!formData.name || !formData.age || !formData.gender || !finalHeightCm || 
        !formData.weight || !formData.fitnessGoal || !formData.activityLevel) {
      MessageBox.error('Please fill in all required fields');
      return;
    }

    // Update formData with the final calculated height before submission
    setFormData(prev => ({ ...prev, height: finalHeightCm }));
    
    try {
      setSubmitting(true);
      
      console.log('Submitting profile form');
      console.log('Form data:', JSON.stringify(formData, null, 2));
      
      const response = await fetch(`${API_URL}/api/wellness/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ...formData, height: finalHeightCm }) // Send final height
      });
      
      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        MessageBox.error('Your session has expired. Please login again.');
        setRedirectPath('/patient/wellness/profile');
        navigate('/login');
        return;
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        MessageBox.success(hasProfile ? 'Profile updated successfully!' : 'Profile created successfully!');
        setHasProfile(true);
        
        navigate('/patient/wellness/diet-plan');
      } else {
        MessageBox.error(data.message || 'Failed to save profile');
        console.error('Failed to save profile:', data);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      MessageBox.error(`Failed to connect to server: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007E85]"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white rounded-lg shadow-md my-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#007E85] mb-6">
        {hasProfile ? 'Update Your Wellness Profile' : 'Create Your Wellness Profile'}
      </h1>
      
      <p className="mb-6 text-gray-600">
        Fill in your details below to get a personalized diet plan based on your health goals and preferences.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Age*</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleNumericInput}
                min="18"
                max="100"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Gender*</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Height*</label>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    name="heightUnit"
                    value={heightUnit}
                    onChange={(e) => {
                      setHeightUnit(e.target.value);
                      if (e.target.value === 'cm') {
                        setTempFeet('');
                        setTempInches('');
                      }
                    }}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] w-24"
                  >
                    <option value="cm">cm</option>
                    <option value="ftIn">ft/in</option>
                  </select>

                  {heightUnit === 'cm' ? (
                    <input
                      type="text"
                      name="height"
                      value={formData.height}
                      onChange={handleHeightChange}
                      placeholder="e.g., 175"
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                      required
                    />
                  ) : (
                    <>
                      <input
                        type="text"
                        name="feet"
                        value={tempFeet}
                        onChange={handleHeightChange}
                        placeholder="Feet"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                        required={heightUnit === 'ftIn'}
                      />
                      <input
                        type="text"
                        name="inches"
                        value={tempInches}
                        onChange={handleHeightChange}
                        placeholder="Inches"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                        required={heightUnit === 'ftIn'}
                      />
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Weight (kg)*</label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleNumericInput}
                  placeholder="In kilograms"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Health & Preferences</h2>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Dietary Preference*</label>
              <select
                name="dietaryPreference"
                value={formData.dietaryPreference}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                required
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Eggetarian">Eggetarian</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Fitness Goal*</label>
              <select
                name="fitnessGoal"
                value={formData.fitnessGoal}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                required
              >
                <option value="">Select goal</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Weight Gain">Weight Gain</option>
                <option value="Muscle Building">Muscle Building</option>
                <option value="Maintenance">Maintenance</option>
                <option value="General Fitness">General Fitness</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Activity Level*</label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                required
              >
                <option value="">Select activity level</option>
                <option value="Sedentary">Sedentary (little or no exercise)</option>
                <option value="Lightly Active">Lightly Active (light exercise 1-3 days/week)</option>
                <option value="Moderately Active">Moderately Active (moderate exercise 3-5 days/week)</option>
                <option value="Very Active">Very Active (hard exercise 6-7 days/week)</option>
                <option value="Extremely Active">Extremely Active (very hard exercise, physical job or training twice a day)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Target Duration (weeks)*</label>
                <input
                  type="number"
                  name="targetDuration"
                  value={formData.targetDuration}
                  onChange={handleNumericInput}
                  min="1"
                  max="52"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Target Weight (kg)</label>
                <input
                  type="text"
                  name="targetWeight"
                  value={formData.targetWeight}
                  onChange={handleNumericInput}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Medical Conditions</h2>
            
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={tempMedicalCondition}
                  onChange={(e) => setTempMedicalCondition(e.target.value)}
                  placeholder="Add condition"
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
              
              <div className="flex flex-wrap gap-2 mt-3">
                {commonMedicalConditions.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => addMedicalCondition(condition)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300"
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.medicalConditions.map((condition, index) => (
                <div key={index} className="bg-[#e6f5f6] text-[#007E85] px-3 py-1 rounded-lg flex items-center">
                  <span>{condition}</span>
                  <button
                    type="button"
                    onClick={() => removeMedicalCondition(condition)}
                    className="ml-2 text-[#007E85] hover:text-[#006b6f]"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.medicalConditions.length === 0 && (
                <p className="text-gray-500 text-sm italic">No medical conditions added</p>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Allergies</h2>
            
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={tempAllergy}
                  onChange={(e) => setTempAllergy(e.target.value)}
                  placeholder="Add allergy"
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
              
              <div className="flex flex-wrap gap-2 mt-3">
                {commonAllergies.map((allergy) => (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => addAllergy(allergy)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300"
                  >
                    {allergy}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.allergies.map((allergy, index) => (
                <div key={index} className="bg-[#e6f5f6] text-[#007E85] px-3 py-1 rounded-lg flex items-center">
                  <span>{allergy}</span>
                  <button
                    type="button"
                    onClick={() => removeAllergy(allergy)}
                    className="ml-2 text-[#007E85] hover:text-[#006b6f]"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.allergies.length === 0 && (
                <p className="text-gray-500 text-sm italic">No allergies added</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#007E85] text-white px-6 py-2 rounded-lg hover:bg-[#006b6f] transition duration-300 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : hasProfile ? 'Update Profile' : 'Create Profile & Generate Diet Plan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WellnessProfile;