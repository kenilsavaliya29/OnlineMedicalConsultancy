import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

const WellnessProfile = () => {
  const { user, setRedirectPath } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '', // in cm
    weight: '', // in kg
    medicalConditions: [],
    allergies: [],
    dietaryPreference: 'Vegetarian',
    fitnessGoal: '',
    activityLevel: '',
    targetDuration: 4, // default 4 weeks
    targetWeight: '' // optional
  });
  
  const [tempMedicalCondition, setTempMedicalCondition] = useState('');
  const [tempAllergy, setTempAllergy] = useState('');
  
  // Common medical conditions for quick selection
  const commonMedicalConditions = [
    'Diabetes', 
    'Hypertension', 
    'Cholesterol', 
    'Thyroid', 
    'Heart Disease',
    'Kidney Disease'
  ];
  
  // Common allergies for quick selection
  const commonAllergies = [
    'Nuts', 
    'Dairy', 
    'Gluten', 
    'Seafood', 
    'Eggs', 
    'Soy'
  ];
  
  // Fetch user's existing profile if available
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // We don't need to check for token in localStorage anymore,
        // it's now handled by cookies automatically
        
        // Proceed even if user object is not in context yet
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
          credentials: 'include' // Include cookies for auth
        });
        
        console.log('Response status:', response.status);
        
        if (response.status === 404) {
          // No profile exists yet
          setHasProfile(false);
          // Pre-fill name from user data if available
          if (user) {
            setFormData(prev => ({
              ...prev,
              name: `${user.firstname || ''} ${user.lastname || ''}`.trim()
            }));
          }
          setLoading(false);
          return;
        } else if (response.status === 401) {
          // Unauthorized - session might have expired
          toast.error('Your session has expired. Please login again.');
          navigate('/login');
          return;
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok && data.success) {
          setHasProfile(true);
          // Populate form with existing data
          setFormData({
            name: data.profile.name || '',
            age: data.profile.age || '',
            gender: data.profile.gender || '',
            height: data.profile.height || '',
            weight: data.profile.weight || '',
            medicalConditions: data.profile.medicalConditions || [],
            allergies: data.profile.allergies || [],
            dietaryPreference: data.profile.dietaryPreference || 'Vegetarian',
            fitnessGoal: data.profile.fitnessGoal || '',
            activityLevel: data.profile.activityLevel || '',
            targetDuration: data.profile.targetDuration || 4,
            targetWeight: data.profile.targetWeight || ''
          });
        } else {
          toast.error(`Failed to fetch profile data: ${data.message || 'Unknown error'}`);
          console.error('Failed to fetch profile:', data.message, 'Status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error(`Failed to connect to server: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user, API_URL, navigate]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle numeric input changes with validation
  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers and decimal point
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Add medical condition
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
  
  // Remove medical condition
  const removeMedicalCondition = (condition) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter(c => c !== condition)
    }));
  };
  
  // Add allergy
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
  
  // Remove allergy
  const removeAllergy = (allergy) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.age || !formData.gender || !formData.height || 
        !formData.weight || !formData.fitnessGoal || !formData.activityLevel) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Create or update profile - always use POST, the server will handle updating if profile exists
      console.log('Submitting profile form');
      console.log('Form data:', JSON.stringify(formData, null, 2));
      
      const response = await fetch(`${API_URL}/api/wellness/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify(formData)
      });
      
      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        toast.error('Your session has expired. Please login again.');
        // Store the current path in context instead of localStorage
        setRedirectPath('/patient/wellness/profile');
        navigate('/login');
        return;
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        toast.success(hasProfile ? 'Profile updated successfully!' : 'Profile created successfully!');
        setHasProfile(true);
        
        // Navigate to the diet plan page
        navigate('/patient/wellness/diet-plan');
      } else {
        toast.error(data.message || 'Failed to save profile');
        console.error('Failed to save profile:', data);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(`Failed to connect to server: ${error.message}`);
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
          {/* Basic Information */}
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Height (cm)*</label>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleNumericInput}
                  placeholder="In centimeters"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
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
          
          {/* Health & Preferences */}
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
        
        {/* Medical Conditions and Allergies */}
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