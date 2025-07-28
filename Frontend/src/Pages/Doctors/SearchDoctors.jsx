import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaUserMd, FaTooth, FaEye, FaHeartbeat, FaBrain, FaBone, FaChild, FaAllergies, FaStar, FaStarHalfAlt, FaCalendarAlt, FaClock, FaWallet } from 'react-icons/fa';
import { GiMedicines, GiStomach } from 'react-icons/gi';
import { MdPregnantWoman, MdOutlineVerified } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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
      const response = await fetch(`${API_URL}/api/doctors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
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

    // Apply active category filter (from Speciality cards)
    if (activeCategory) {
      result = result.filter(doctor =>
        doctor.profile?.specialization === activeCategory
      );
    }

    // Apply dropdown filters
    if (filters.specialization) {
      result = result.filter(doctor =>
        doctor.profile?.specialization === filters.specialization
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
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
            {/* Search and Filters Section */}
            <div className="bg-white rounded-xl shadow-sm mb-8">
                <div className="p-6">
                    {/* Main Search */}
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
                                placeholder="Find doctors by name or speciality..."
                                className="pl-10 w-full py-3 border border-gray-200 rounded-lg focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                                    <ul className="py-1">
                                        {suggestions.map((suggestion, index) => (
                                            <li
                                                key={index}
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer capitalize"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                                    showFilters 
                                        ? 'bg-[#007E85] text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <FaFilter />
                                <span>Filters</span>
                            </button>
                            <button
                                onClick={resetFilters}
                                className="px-4 py-3 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Quick Speciality Selection */}
                    <div className="mt-6 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                        {specializations.slice(0, 6).map((specialty) => (
                            <button
                                key={specialty.name}
                                onClick={() => handleCategoryClick(specialty.name)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                                    activeCategory === specialty.name
                                        ? 'bg-[#007E85] text-white'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span className="text-lg">{specialty.icon}</span>
                                <span className="text-sm font-medium">{specialty.name}</span>
                            </button>
                        ))}
                        <button
                            onClick={() => setShowFilters(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                        >
                            <span>More Specialities</span>
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <select
                                    name="experience"
                                    value={filters.experience}
                                    onChange={handleFilterChange}
                                    className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
                                >
                                    {experienceOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <select
                                    name="qualification"
                                    value={filters.qualification}
                                    onChange={handleFilterChange}
                                    className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
                                >
                                    {qualificationOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <select
                                    name="availability"
                                    value={filters.availability}
                                    onChange={handleFilterChange}
                                    className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
                                >
                                    {availabilityOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <select
                                    name="specialization"
                                    value={filters.specialization}
                                    onChange={handleFilterChange}
                                    className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
                                >
                                    <option value="">All Specialities</option>
                                    {specializations.map(spec => (
                                        <option key={spec.name} value={spec.name}>{spec.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={resetFilters}
                                className="mt-4 text-[#007E85] hover:text-[#006b6f] text-sm font-medium"
                            >
                                Reset filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                    {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Available
                </h2>
                {(activeCategory || searchQuery || Object.values(filters).some(v => v !== '')) && (
                    <button
                        onClick={resetFilters}
                        className="text-[#007E85] hover:text-[#006b6f] text-sm font-medium"
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Doctors Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007E85]"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
                    {error}
                </div>
            ) : filteredDoctors.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <FaUserMd className="mx-auto text-5xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No doctors found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                    <button
                        onClick={resetFilters}
                        className="px-6 py-2 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <div key={doctor._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-50 flex-shrink-0">
                                        {doctor.profile.profileImage ? (
                                            <img
                                                src={`${API_URL}${doctor.profile.profileImage.startsWith('/') ? '' : '/'}${doctor.profile.profileImage}`}
                                                alt={`Dr. ${doctor.firstName}`}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://via.placeholder.com/160x160.png?text=Doctor";
                                                }}
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-[#007E85]/10">
                                                <FaUserMd className="text-2xl text-[#007E85]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-gray-800 capitalize">
                                                Dr. {doctor.firstName} {doctor.lastName}
                                            </h3>
                                            <MdOutlineVerified className="text-blue-500" />
                                        </div>
                                        <p className="text-sm text-gray-600">{doctor.profile.specialization}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            {renderStars(4.5)}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">Experience</p>
                                        <p className="font-semibold text-gray-800">{doctor.profile.experience} Years</p>
                                    </div>
                                    <div className="text-center border-l border-gray-100">
                                        <p className="text-sm text-gray-500">Fee</p>
                                        <p className="font-semibold text-gray-800">₹{doctor.profile.consultationPrice || 300}</p>
                                    </div>
                                </div>

                                <div className="mt-4">
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <FaCalendarAlt className="text-[#007E85]" />
        <span className="font-medium">Available Days</span>
    </div>
    <div className="flex flex-wrap gap-1">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
            const isAvailable = doctor.profile.availability.recurringWeekly.some(
                schedule => schedule.dayOfWeek === day
            );
            return (
                <span
                    key={day}
                    className={`text-xs px-2 py-1 rounded-full ${
                        isAvailable 
                            ? 'bg-[#007E85]/10 text-[#007E85] font-medium' 
                            : 'bg-gray-100 text-gray-400'
                    }`}
                >
                    {day.slice(0, 3)}
                </span>
            );
        })}
    </div>
    {doctor.profile.availability.recurringWeekly.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">
            {doctor.profile.availability.recurringWeekly[0].startTime} - {doctor.profile.availability.recurringWeekly[0].endTime}
        </p>
    )}
</div>
                            </div>

                            <div className="flex border-t border-gray-100">
                                <button
                                    onClick={() => viewDoctorProfile(doctor._id)}
                                    className="flex-1 py-3 text-[#007E85] font-medium hover:bg-gray-50 transition-colors"
                                >
                                    View Profile
                                </button>
                                <button
                                    onClick={() => navigate(`/doctors/${doctor._id}/book`)}
                                    className="flex-1 py-3 bg-[#007E85] text-white font-medium hover:bg-[#006b6f] transition-colors"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Add custom styles for hiding scrollbar */}
        <style jsx>{`
            .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            .hide-scrollbar::-webkit-scrollbar {
                display: none;
            }
        `}</style>
    </div>
);
};

export default SearchDoctors;
