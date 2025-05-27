import React, { useState, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaFilter, FaUserMd, FaTooth, FaEye, FaHeartbeat, FaBrain, FaBone, FaChild, FaAllergies, FaStar, FaStarHalfAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { GiMedicines, GiStomach } from 'react-icons/gi';
import { MdPregnantWoman, MdOutlineVerified } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000/api/doctors';

const SearchDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  
  const [filters, setFilters] = useState({
    specialization: '',
    experience: '',
    qualification: '',
    availability: '',
    rating: ''
  });

  const specializations = [
    { name: 'General Physician', icon: <FaUserMd />, color: 'bg-blue-100 text-blue-600' },
    { name: 'Dentist', icon: <FaTooth />, color: 'bg-purple-100 text-purple-600' },
    { name: 'Ophthalmologist', icon: <FaEye />, color: 'bg-teal-100 text-teal-600' },
    { name: 'Cardiologist', icon: <FaHeartbeat />, color: 'bg-red-100 text-red-600' },
    { name: 'Neurologist', icon: <FaBrain />, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Orthopedic', icon: <FaBone />, color: 'bg-green-100 text-green-600' },
    { name: 'Pediatrician', icon: <FaChild />, color: 'bg-pink-100 text-pink-600' },
    { name: 'Dermatologist', icon: <FaAllergies />, color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Gynecologist', icon: <MdPregnantWoman />, color: 'bg-orange-100 text-orange-600' },
    { name: 'Gastroenterologist', icon: <GiStomach />, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Psychiatrist', icon: <GiMedicines />, color: 'bg-cyan-100 text-cyan-600' }
  ];

  const experienceOptions = [
    { value: '', label: 'Any Experience' },
    { value: '1-5', label: '1-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10+', label: '10+ years' }
  ];

  const qualificationOptions = [
    { value: '', label: 'Any Qualification' },
    { value: 'MBBS', label: 'MBBS' },
    { value: 'MD', label: 'MD' },
    { value: 'MS', label: 'MS' },
    { value: 'DO', label: 'DO' },
    { value: 'PhD', label: 'PhD' },
    { value: 'DM', label: 'DM' }
  ];

  const availabilityOptions = [
    { value: '', label: 'Any Day' },
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
    { value: 'Sat', label: 'Saturday' },
    { value: 'Sun', label: 'Sunday' }
  ];

  // Fetch all doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Apply filters when filters or search query changes
  useEffect(() => {
    if (doctors.length > 0) {
      applyFilters();
    }
  }, [doctors, filters, searchQuery, activeCategory]);

  // Generate search suggestions
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Collect all searchable terms
    const allTerms = new Set();
    
    // Add specializations
    specializations.forEach(spec => allTerms.add(spec.name.toLowerCase()));
    
    // Add qualifications
    qualificationOptions.forEach(qual => {
      if (qual.value) allTerms.add(qual.value.toLowerCase());
    });
    
    // Add doctor names, specializations and qualifications from data
    doctors.forEach(doctor => {
      if (doctor.name) allTerms.add(doctor.name.toLowerCase());
      if (doctor.specialization) allTerms.add(doctor.specialization.toLowerCase());
      if (doctor.qualification) allTerms.add(doctor.qualification.toLowerCase());
    });
    
    // Filter terms that match the query
    const matchedSuggestions = Array.from(allTerms)
      .filter(term => term.includes(query))
      .sort()
      .slice(0, 5); // Limit to 5 suggestions
    
    setSuggestions(matchedSuggestions);
    setShowSuggestions(matchedSuggestions.length > 0);
  }, [searchQuery, doctors]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies if needed for authentication
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDoctors(data.doctors);
        setFilteredDoctors(data.doctors);
      } else {
        throw new Error(data.message || 'Error fetching doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...doctors];
    
    // Apply search query (case insensitive)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(doctor => 
        doctor.name?.toLowerCase().includes(query) ||
        doctor.specialization?.toLowerCase().includes(query) ||
        doctor.qualification?.toLowerCase().includes(query)
      );
    }
    
    // Apply active category filter (from specialty cards)
    if (activeCategory) {
      result = result.filter(doctor => 
        doctor.specialization === activeCategory
      );
    }
    
    // Apply dropdown filters
    if (filters.specialization) {
      result = result.filter(doctor => 
        doctor.specialization === filters.specialization
      );
    }
    
    if (filters.experience) {
      // Assuming experience is stored as "X years" in the database
      result = result.filter(doctor => {
        // Extract the numerical value
        const years = parseInt(doctor.experience);
        if (filters.experience === '1-5') return years >= 1 && years <= 5;
        if (filters.experience === '5-10') return years > 5 && years <= 10;
        if (filters.experience === '10+') return years > 10;
        return true;
      });
    }
    
    if (filters.qualification) {
      result = result.filter(doctor => 
        doctor.qualification === filters.qualification
      );
    }
    
    if (filters.availability) {
      result = result.filter(doctor => 
        doctor.availability && doctor.availability.includes(filters.availability)
      );
    }
    
    setFilteredDoctors(result);
  };

  const handleCategoryClick = (categoryName) => {
    if (activeCategory === categoryName) {
      // If clicking on already active category, deselect it
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryName);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      specialization: '',
      experience: '',
      qualification: '',
      availability: '',
      rating: ''
    });
    setSearchQuery('');
    setActiveCategory(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Helper function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half-star" className="text-yellow-400" />);
    }
    
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" />);
    }
    
    return (
      <div className="flex">
        {stars}
        <span className="ml-1 text-gray-600">({rating})</span>
      </div>
    );
  };

  // Add function to navigate to doctor profile
  const viewDoctorProfile = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-blue-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Find the Right Doctor for You</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search from our network of qualified healthcare professionals to get the care you need
          </p>
        </div>
        
        {/* Search Section */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md ">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onBlur={handleBlur}
                    onFocus={() => searchQuery.trim() !== '' && suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Search doctors by name, specialty, or qualification..."
                    className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 z-50 h-40 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-visible">
                      <ul className=" overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                          <li 
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer capitalize"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FaFilter />
                  <span>Filters</span>
                </button>
                
                <button
                  onClick={resetFilters}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors"
                >
                  Search
                </button>
              </div>
              
              {/* Filter Section */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                      <select
                        name="specialization"
                        value={filters.specialization}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
                      >
                        <option value="">Any Specialization</option>
                        {specializations.map(spec => (
                          <option key={spec.name} value={spec.name}>{spec.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                      <select
                        name="experience"
                        value={filters.experience}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
                      >
                        {experienceOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                      <select
                        name="qualification"
                        value={filters.qualification}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
                      >
                        {qualificationOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                      <select
                        name="availability"
                        value={filters.availability}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
                      >
                        {availabilityOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={resetFilters}
                    className="mt-4 text-[#007E85] hover:text-[#006b6f] font-medium"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Specialties Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Specialty</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {specializations.map((specialty) => (
              <div
                key={specialty.name}
                onClick={() => handleCategoryClick(specialty.name)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  activeCategory === specialty.name 
                    ? 'bg-[#007E85] text-white shadow-lg transform scale-105' 
                    : `${specialty.color} hover:shadow-md`
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`text-3xl mb-2 ${
                    activeCategory === specialty.name ? 'text-white' : ''
                  }`}>
                    {specialty.icon}
                  </div>
                  <div className="text-sm font-medium">{specialty.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Results Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
            </h2>
            
            {(activeCategory || searchQuery || Object.values(filters).some(v => v !== '')) && (
              <button
                onClick={resetFilters}
                className="text-[#007E85] hover:text-[#006b6f] font-medium flex items-center gap-2"
              >
                <span>Clear all filters</span>
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007E85]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
              {error}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-5xl text-gray-300 mb-4 flex justify-center">
                <FaUserMd />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No doctors found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any doctors matching your criteria. Try adjusting your filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor._id} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:transform hover:scale-[1.02]">
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-[#007E85]/10 flex items-center justify-center text-[#007E85] text-3xl mr-4">
                        {doctor.profileImage ? (
                          <img 
                            src={doctor.profileImage.startsWith('http') 
                              ? doctor.profileImage 
                              : `http://localhost:3000${doctor.profileImage}`} 
                            alt={`Dr. ${doctor.name}`} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentNode.innerHTML = '<FaUserMd className="text-3xl" />';
                            }}
                          />
                        ) : (
                          <FaUserMd />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                          Dr. {doctor.name}
                          <MdOutlineVerified className="ml-1 text-blue-500" />
                        </h3>
                        <p className="text-sm text-gray-600">{doctor.qualification} - {doctor.specialization}</p>
                        <div className="mt-1">
                          {/* Either use the real rating from the API or a default */}
                          {renderStars(4.5)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-gray-700 text-sm mb-2">
                        <FaClock className="mr-2 text-[#007E85]" />
                        <span>{doctor.experience}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-700 text-sm">
                        <FaCalendarAlt className="mr-2 text-[#007E85]" />
                        <span>Available: {doctor.availability || 'Contact for details'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex border-t border-gray-100">
                    <button 
                      onClick={() => viewDoctorProfile(doctor._id)}
                      className="flex-1 py-3 bg-gray-50 text-[#007E85] font-medium hover:bg-gray-100 transition-colors"
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => navigate(`/doctors/${doctor._id}/book`)}
                      className="flex-1 py-3 bg-[#007E85] text-white font-medium hover:bg-[#006b6f] transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchDoctors;
