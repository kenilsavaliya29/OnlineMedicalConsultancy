import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { FaUserCircle, FaUtensils, FaHistory } from 'react-icons/fa';

// Import wellness components
import WellnessProfile from '../../components/Wellness/WellnessProfile';
import DietPlan from '../../components/Wellness/DietPlan';

const WellnessProgram = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    // Set active tab based on current route
    const path = location.pathname;
    if (path.includes('/profile')) {
      setActiveTab('profile');
    } else if (path.includes('/diet-plan')) {
      setActiveTab('diet-plan');
    }
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-10 pt-24">
      <div className="bg-[#007E85] text-white py-8 px-4 md:px-0">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Wellness Program</h1>
          <p className="text-[#e6f5f6]">Track your health journey and get personalized diet plans</p>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto">
            <NavLink 
              to="/patient/wellness/profile" 
              className={`py-4 px-6 flex items-center border-b-2 font-medium whitespace-nowrap ${
                activeTab === 'profile' 
                  ? 'border-[#007E85] text-[#007E85]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUserCircle className="mr-2" />
              <span>My Wellness Profile</span>
            </NavLink>
            <NavLink 
              to="/patient/wellness/diet-plan" 
              className={`py-4 px-6 flex items-center border-b-2 font-medium whitespace-nowrap ${
                activeTab === 'diet-plan' 
                  ? 'border-[#007E85] text-[#007E85]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('diet-plan')}
            >
              <FaUtensils className="mr-2" />
              <span>Diet Plan</span>
            </NavLink>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="max-w-6xl mx-auto mt-6 px-4 md:px-0">
        <Routes>
          <Route path="/profile" element={<WellnessProfile />} />
          <Route path="/diet-plan" element={<DietPlan />} />
          {/* Default route for /patient/wellness */}
          <Route path="/" element={<Navigate to="profile" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default WellnessProgram;