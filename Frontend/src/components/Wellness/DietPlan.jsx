import React, { useState, useEffect } from 'react';
import MessageBox from '../common/MessageBox';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaWeight, FaRunning, FaCalendarAlt, FaHistory, FaUserMd } from 'react-icons/fa';

const DietPlan = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const [loading, setLoading] = useState(true);
  const [dietPlan, setDietPlan] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [previousPlans, setPreviousPlan] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hasDietPlan, setHasDietPlan] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [showPlanPrompt, setShowPlanPrompt] = useState(false);
  
  // Fetch user's wellness profile and diet plan
  useEffect(() => {
    const fetchProfileAndPlan = async () => {
      try {
        setLoading(true);
        setShowProfilePrompt(false); // Hide prompts initially
        setShowPlanPrompt(false);
        
        // Fetch user profile
        const profileResponse = await fetch(`${API_URL}/api/wellness/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Include cookies for auth
        });
        
        if (profileResponse.status === 404) {
          // No profile found, show prompt
          setShowProfilePrompt(true);
          return;
        }
        
        const profileData = await profileResponse.json();
        
        if (!profileResponse.ok && profileResponse.status !== 404) { // Handle non-404 errors
          MessageBox.error(profileData.message || 'Failed to fetch profile');
          if (profileResponse.status === 401) {
            navigate('/login');
          }
          return;
        }
        
        setProfile(profileData.profile);
        
        // Check if we have a diet plan in the profile response
        if (profileData?.dietPlan) { // Use optional chaining for safety
          setDietPlan(profileData.dietPlan);
          setSelectedWeek(profileData.dietPlan.weekNumber);
          
          // Get diet plan history
          try {
            const historyResponse = await fetch(`${API_URL}/api/wellness/diet-plan/history`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include' // Include cookies for auth
            });
            
            if (historyResponse.ok) {
              const historyData = await historyResponse.json();
              if (historyData.success && historyData.dietPlans) {
                setPreviousPlan(historyData.dietPlans);
              }
            }
          } catch (historyError) {
            console.error('Error fetching diet plan history:', historyError);
          }
        } else {
          // No diet plan found, show prompt
          MessageBox.info('No diet plan found. Please update your wellness profile.');
          setShowPlanPrompt(true);
        }
      } catch (error) {
        console.error('Error fetching profile and diet plan:', error);
        MessageBox.error('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileAndPlan();
  }, [API_URL, navigate]);
  
  // Handle day selection
  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };
  
  // Generate a new diet plan
  const handleGenerateNewPlan = async () => {
    try {
      MessageBox.info('Generating new diet plan...');
      
      const response = await fetch(`${API_URL}/api/wellness/diet-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies for auth
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setDietPlan(data.dietPlan);
        setPreviousPlan(prev => [data.dietPlan, ...prev]);
        setSelectedWeek(data.dietPlan.weekNumber);
        MessageBox.success('New diet plan generated successfully!');
      } else {
        MessageBox.error(data.message || 'Failed to generate new diet plan');
        if (response.status === 401) {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error generating new diet plan:', error);
      MessageBox.error('Failed to connect to server');
    }
  };
  
  // Handle week selection from history
  const handleWeekSelect = async (week) => {
    try {
      // Check if we already have this plan loaded in state
      const existingPlan = previousPlans.find(plan => plan.weekNumber === week);
      
      if (existingPlan) {
        setDietPlan(existingPlan);
        setSelectedWeek(week);
        setShowHistory(false);
        return;
      }
      
      // Otherwise fetch it from the server
      const response = await fetch(`${API_URL}/api/wellness/diet-plan/${week}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies for auth
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setDietPlan(data.dietPlan);
        setSelectedWeek(week);
        setShowHistory(false);
      } else {
        MessageBox.error(data.message || 'Failed to fetch diet plan');
        if (response.status === 401) {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching diet plan:', error);
      MessageBox.error('Failed to connect to server');
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007E85]"></div>
      </div>
    );
  }
  
  // Render message if no profile exists
  if (showProfilePrompt) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md my-8 text-center">
        <h1 className="text-2xl font-bold text-[#007E85] mb-4">Wellness Profile Required</h1>
        <p className="mb-6 text-gray-600">You need a wellness profile to view your diet plan.</p>
        <button
          onClick={() => navigate('/patient/wellness/profile')}
          className="bg-[#007E85] text-white px-6 py-2 rounded-lg hover:bg-[#006b6f]"
        >
          Create Wellness Profile
        </button>
      </div>
    );
  }
  
  // Render message if no diet plan is available but profile exists
  if (showPlanPrompt || !dietPlan) { // Keep !dietPlan check as fallback
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md my-8 text-center">
        <h1 className="text-2xl font-bold text-[#007E85] mb-4">No Diet Plan Available</h1>
        <p className="mb-6 text-gray-600">You don't have a diet plan yet. Please create or update your wellness profile.</p>
        <button
          onClick={() => navigate('/patient/wellness/profile')}
          className="bg-[#007E85] text-white px-6 py-2 rounded-lg hover:bg-[#006b6f]"
        >
          Create Wellness Profile
        </button>
      </div>
    );
  }
  
  // Find the selected day's meal plan
  const selectedDayPlan = dietPlan.mealPlan?.find(day => day.day === selectedDay) || dietPlan.mealPlan?.[0];
  
  // If no day plan is found, show a message
  if (!selectedDayPlan) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md my-8 text-center">
        <h1 className="text-2xl font-bold text-[#007E85] mb-4">Diet Plan Format Error</h1>
        <p className="mb-6 text-gray-600">There seems to be an issue with your diet plan format. Please regenerate a new plan.</p>
        <button
          onClick={handleGenerateNewPlan}
          className="bg-[#007E85] text-white px-6 py-2 rounded-lg hover:bg-[#006b6f]"
        >
          Generate New Plan
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Profile Summary */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#007E85]">Your Diet Plan</h1>
          
          <div className="flex space-x-2 mt-2 md:mt-0">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <FaHistory className="mr-2" />
              <span>{showHistory ? 'Hide History' : 'View History'}</span>
            </button>
            
            <button
              onClick={handleGenerateNewPlan}
              className="flex items-center px-3 py-2 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f]"
            >
              <FaUtensils className="mr-2" />
              <span>Generate New Plan</span>
            </button>
          </div>
        </div>
        
        {/* Profile and nutrition summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#f0fafa] rounded-lg p-3 flex items-center">
            <FaWeight className="text-xl text-[#007E85] mr-3" />
            <div>
              <div className="text-sm text-gray-500">Current Weight</div>
              <div className="font-semibold">{profile?.weight} kg</div>
            </div>
          </div>
          
          <div className="bg-[#f0fafa] rounded-lg p-3 flex items-center">
            <FaRunning className="text-xl text-[#007E85] mr-3" />
            <div>
              <div className="text-sm text-gray-500">Goal</div>
              <div className="font-semibold">{profile?.fitnessGoal}</div>
            </div>
          </div>
          
          <div className="bg-[#f0fafa] rounded-lg p-3 flex items-center">
            <FaUtensils className="text-xl text-[#007E85] mr-3" />
            <div>
              <div className="text-sm text-gray-500">Daily Calories</div>
              <div className="font-semibold">{dietPlan?.dailyCalories} kcal</div>
            </div>
          </div>
          
          <div className="bg-[#f0fafa] rounded-lg p-3 flex items-center">
            <FaCalendarAlt className="text-xl text-[#007E85] mr-3" />
            <div>
              <div className="text-sm text-gray-500">Week</div>
              <div className="font-semibold">{dietPlan?.weekNumber} of {profile?.targetDuration}</div>
            </div>
          </div>
        </div>
        
        {/* Show history if toggled */}
        {showHistory && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Diet Plan History</h3>
            <div className="flex flex-wrap gap-2">
              {previousPlans.map(plan => (
                <button
                  key={plan.weekNumber}
                  onClick={() => handleWeekSelect(plan.weekNumber)}
                  className={`px-3 py-1 rounded-lg ${
                    selectedWeek === plan.weekNumber
                      ? 'bg-[#007E85] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Week {plan.weekNumber}
                </button>
              ))}
              {previousPlans.length === 0 && (
                <p className="text-gray-500">No previous plans available</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Day selection tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <div className="flex min-w-max border-b">
            {dietPlan.mealPlan.map(day => (
              <button
                key={day.day}
                onClick={() => handleDaySelect(day.day)}
                className={`px-4 py-3 font-medium ${
                  selectedDay === day.day
                    ? 'text-[#007E85] border-b-2 border-[#007E85]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* Selected day's meals */}
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedDay}'s Meal Plan</h2>
          
          <div className="space-y-6">
            {selectedDayPlan.meals.map((meal, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="bg-[#f0fafa] px-4 py-2 border-b">
                  <h3 className="text-lg font-semibold text-[#007E85]">{meal.type}</h3>
                  <p className="text-sm text-gray-600">{meal.totalCalories} calories</p>
                </div>
                
                <div className="p-4">
                  <ul className="space-y-2">
                    {meal.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className="flex-1">{item.name}</span>
                        <span className="text-gray-600 ml-4">{item.quantity}</span>
                        <span className="text-gray-500 ml-4 w-20 text-right">{item.calories} kcal</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Diet guidelines */}
      {dietPlan.guidelines && dietPlan.guidelines.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Diet Guidelines</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {dietPlan.guidelines.map((guideline, index) => (
              <li key={index}>{guideline}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Macronutrient breakdown */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Macronutrient Breakdown</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-[#007E85]">{dietPlan.proteinGrams}g</div>
            <div className="text-gray-600">Protein</div>
            <div className="text-xs text-gray-500">{Math.round(dietPlan.proteinGrams * 4)} calories</div>
          </div>
          
          <div className="border rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-[#007E85]">{dietPlan.carbsGrams}g</div>
            <div className="text-gray-600">Carbohydrates</div>
            <div className="text-xs text-gray-500">{Math.round(dietPlan.carbsGrams * 4)} calories</div>
          </div>
          
          <div className="border rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-[#007E85]">{dietPlan.fatGrams}g</div>
            <div className="text-gray-600">Fats</div>
            <div className="text-xs text-gray-500">{Math.round(dietPlan.fatGrams * 9)} calories</div>
          </div>
        </div>
      </div>
      
      {/* Doctor Recommendation */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Doctor Recommendation</h2>
        
        <div className="flex flex-col md:flex-row items-center bg-gray-50 rounded-lg p-4 md:p-6">
          <img 
            src="https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg" 
            alt="Dr. Amit Patel" 
            className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover border-2 border-[#007E85] mb-4 md:mb-0 md:mr-6"
          />
          <div>
            <h3 className="text-lg font-semibold text-[#007E85]">Dr. Amit Patel</h3>
            <p className="text-gray-700 mb-2">Specialist in Nutrition and Dietetics</p>
            <p className="text-gray-600 mb-4 text-sm">
              Dr. Patel specializes in personalized nutrition plans for various health conditions and fitness goals.
              With over 10 years of experience, he has helped thousands of patients achieve their health objectives.
            </p>
            <div className="flex items-center">
              <FaUserMd className="text-[#007E85] mr-2" />
              <p className="text-sm text-gray-700">
                This diet plan is professionally designed to match your specific profile and goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlan; 