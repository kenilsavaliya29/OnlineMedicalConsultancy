import React, { useState, useEffect, useContext } from 'react';
import { FaUserMd, FaPlus, FaTrash, FaEdit, FaSearch, FaFilter, FaTimes, FaCloudUploadAlt, FaUserCircle } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/authContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Define options
const qualificationOptions = [
  'MD', 'DO', 'MBBS', 'PhD', 'MS', 'DM'
];

const experienceYears = Array.from({ length: 20 }, (_, i) => `${i + 1} year${i > 0 ? 's' : ''}`);

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Admin = () => {
  const [doctors, setDoctors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterExperience, setFilterExperience] = useState('');
  const [filterQualification, setFilterQualification] = useState('');

  // Initial state for availability checkboxes
  const initialAvailabilityState = daysOfWeek.reduce((acc, day) => {
    acc[day] = false;
    return acc;
  }, {});

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phonenumber: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    qualification: '',
    role: 'doctor',
    availability: { ...initialAvailabilityState },
    registrationNumber: ''
  });

  const specializations = [
    'Orthopedic',
    'Neurologist',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Psychiatrist',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist',
    'Dentist'
  ];

  // Add this to the state variables section:
  const [viewType, setViewType] = useState('card');

  // Fetch doctors on component mount
  useEffect(() => {

    if (user && user.role !== 'admin') {
      console.warn("Non-admin user trying to access admin dashboard:", user.role);

      const timer = setTimeout(() => {
        toast.error("You don't have permission to access the admin dashboard");
        window.location.href = '/';
      }, 500); // Small delay to avoid toast during normal navigation

      return () => clearTimeout(timer);
    }

    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/doctors`, {
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Authentication failed. Please log in again.');
            setError('Authentication failed. Please log in again.');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          console.log("Doctors data received:", data.doctors);
          setDoctors(data.doctors);
        } else {
          const errorMsg = 'Failed to fetch doctors: ' + (data.message || 'Unknown error');
          toast.error(errorMsg);
          setError(errorMsg);
        }
      } catch (error) {
        const errorMsg = `Failed to fetch doctors: ${error.message}`;
        toast.error(errorMsg);
        console.error('Error fetching doctors:', error);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchDoctors();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && daysOfWeek.includes(name)) {
      // Handle availability checkboxes
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [name]: checked
        }
      }));

      // Clear validation error when checked
      if (checked) {
        setValidationErrors(prev => ({
          ...prev,
          availability: undefined
        }));
      }
    } else {
      // Handle regular inputs and selects
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Clear validation error when field is filled
      if (value) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);

      // Clear validation error
      setValidationErrors(prev => ({
        ...prev,
        profileImage: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation - only required for new doctors
    if (!editingDoctor) {
      // For new doctors, these fields are required
      if (!formData.firstname.trim()) errors.firstname = 'First name is required';
      if (!formData.lastname.trim()) errors.lastname = 'Last name is required';
      if (!formData.phonenumber.trim()) errors.phonenumber = 'Phone number is required';
      if (!formData.specialization) errors.specialization = 'Specialization is required';
      if (!formData.experience) errors.experience = 'Experience is required';
      if (!formData.qualification) errors.qualification = 'Qualification is required';

      // Email validation - required for new doctors
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }

      // Password validation for new doctors
      if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }

      // Profile image validation for new doctors
      if (!profileImage && !profileImagePreview) {
        errors.profileImage = 'Profile image is required';
      }

      // Availability validation for new doctors
      const hasAvailability = Object.values(formData.availability).some(v => v);
      if (!hasAvailability) errors.availability = 'Please select at least one day';

      // Registration Number validation if provided
      if (formData.registrationNumber.trim() && !/^[A-Za-z0-9]+$/.test(formData.registrationNumber.trim())) { // Example simple alphanumeric validation
        errors.registrationNumber = 'Registration number must be alphanumeric';
      }
    } else {
      // For editing doctors, only validate fields that are filled

      // Email validation if provided
      if (formData.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          errors.email = 'Please enter a valid email address';
        }
      }

      // Password validation if provided (optional when editing)
      if (formData.password.trim() && formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }

      // Registration Number validation if provided
      if (formData.registrationNumber.trim() && !/^[A-Za-z0-9]+$/.test(formData.registrationNumber.trim())) { // Example simple alphanumeric validation
        errors.registrationNumber = 'Registration number must be alphanumeric';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    console.log("Form data submitted:", formData);

    try {
      // Format availability from object to array
      const availableDays = Object.entries(formData.availability)
        .filter(([_, isAvailable]) => isAvailable)
        .map(([day]) => day);

      // Creating the data structure that matches what backend expects
      const doctorData = {
        name: `${formData.firstname} ${formData.lastname}`, // Combine first and last name
        specialization: formData.specialization,
        experience: formData.experience,
        qualification: formData.qualification,
        email: formData.email,
        phone: formData.phonenumber, // Map phonenumber to phone
        availability: availableDays, // Now it's an array
        registrationNumber: formData.registrationNumber
      };

      // Only include password if it's provided (not empty)
      if (formData.password.trim()) {
        doctorData.password = formData.password;
      }

      console.log("Sending doctor data to API:", doctorData);

      // If we have an image, we'll need FormData instead of JSON
      let payload;
      let headers = {};

      if (profileImage) {
        payload = new FormData();
        // Add all doctor data as form fields
        Object.entries(doctorData).forEach(([key, value]) => {
          if (value) { // Only add fields with values
            payload.append(key, value);
          }
        });
        // Add the image file
        payload.append("profileImage", profileImage);
        // FormData sets its own content-type with boundary
      } else {
        // For JSON payload, only include fields that have values
        const cleanedData = Object.fromEntries(
          Object.entries(doctorData).filter(([_, v]) => v !== undefined && v !== '')
        );
        payload = JSON.stringify(cleanedData);
        headers = { 'Content-Type': 'application/json' };
      }

      let response;
      let url = API_URL;
      let method = 'POST';

      if (editingDoctor) {
        url = `${API_URL}/api/doctors/${editingDoctor._id}`;
        method = 'PUT';
      } else {
        url = `${API_URL}/api/doctors`;
      }

      console.log(`Making ${method} request to ${url}`);

      response = await fetch(url, {
        method: method,
        headers: headers,
        body: payload,
        credentials: 'include'
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("API response:", result);

      if (result.success) {
        if (editingDoctor) {
          // Update the doctors array with the updated doctor
          setDoctors(doctors.map(doc =>
            doc._id === editingDoctor._id ? result.doctor : doc
          ));
          toast.success('Doctor updated successfully!');
          setEditingDoctor(null);
        } else {
          // Add the new doctor to the doctors array
          setDoctors([...doctors, result.doctor]);
          toast.success('Doctor added successfully!');
          console.log("New doctor added:", result.doctor);
        }

        // Reset form with correct field names
        setFormData({
          firstname: '',
          lastname: '',
          phonenumber: '',
          email: '',
          password: '',
          specialization: '',
          experience: '',
          qualification: '',
          role: 'doctor',
          availability: { ...initialAvailabilityState },
          registrationNumber: ''
        });
        setProfileImage(null);
        setProfileImagePreview(null);
        setValidationErrors({});
        setShowAddForm(false);
      } else {
        // Show detailed error message
        toast.error(`Operation failed: ${result.message}`);
        console.error("API returned error:", result);
      }
    } catch (error) {
      console.error("Error adding/updating doctor:", error);
      toast.error(`Error: ${error.message}`);

      // Try to log more details if possible
      if (error.response) {
        console.error("Error response:", error.response);
      }
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    console.log("Editing doctor data:", doctor);

    // Parse availability to set checkbox state
    const availabilityState = { ...initialAvailabilityState };
    if (doctor.availability) {
      // Handle both array and string formats
      const availableDays = Array.isArray(doctor.availability) ?
        doctor.availability :
        doctor.availability.split(',').map(day => day.trim());

      availableDays.forEach(day => {
        if (availabilityState.hasOwnProperty(day)) {
          availabilityState[day] = true;
        }
      });
    }

    // For mapping existing doctor fields to form fields
    let firstName = '';
    let lastName = '';

    if (doctor.name) {
      const nameParts = doctor.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Log all data to make debugging easier
    console.log("Doctor details:", {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone || doctor.phoneNumber,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      profileImage: doctor.profileImage,
      availability: doctor.availability,
      registrationNumber: doctor.registrationNumber || doctor.profile?.registrationNumber || ''
    });

    setFormData({
      firstname: firstName,
      lastname: lastName,
      phonenumber: doctor.phone || doctor.phoneNumber || '',
      email: doctor.email || '',
      password: '', // Password is always optional when editing
      specialization: doctor.specialization || '',
      experience: doctor.experience || '',
      qualification: doctor.qualification || '',
      role: doctor.role || 'doctor',
      availability: availabilityState,
      registrationNumber: doctor.registrationNumber || doctor.profile?.registrationNumber || ''
    });

    // Set profile image if available
    if (doctor.profileImage) {
      // Set the preview URL to the server's image path
      const imageUrl = doctor.profileImage.startsWith('http')
        ? doctor.profileImage
        : `${API_URL}${doctor.profileImage}`;

      console.log("Setting profile image preview:", imageUrl);
      setProfileImagePreview(imageUrl);
    } else {
      setProfileImagePreview(null);
    }

    setProfileImage(null); // Reset actual file
    setValidationErrors({});
    setShowAddForm(true);

    // Scroll to the form
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        const response = await fetch(`${API_URL}/api/doctors/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const result = await response.json();
        if (result.success) {
          setDoctors(doctors.filter(doctor => doctor._id !== id));
          toast.success('Doctor removed successfully!');
        } else {
          toast.error(result.message || 'Failed to delete doctor');
        }
      } catch (error) {
        toast.error('Failed to delete doctor');
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterSpecialization('');
    setFilterExperience('');
    setFilterQualification('');
  };

  const filteredDoctors = doctors.filter(doctor => {
    // Handle different name formats
    const docFirstName = doctor.firstName || doctor.firstname || (doctor.name ? doctor.name.split(' ')[0] : '');
    const docLastName = doctor.lastName || doctor.lastname || (doctor.name ? doctor.name.split(' ').slice(1).join(' ') : '');
    const docFullName = `${docFirstName} ${docLastName}`.toLowerCase();

    // Search term matching
    const nameMatch = searchTerm === '' ||
      docFullName.includes(searchTerm.toLowerCase()) ||
      (doctor.name && doctor.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Other filters
    const specMatch = !filterSpecialization || doctor.specialization === filterSpecialization;
    const expMatch = !filterExperience || doctor.experience === filterExperience;
    const qualMatch = !filterQualification || doctor.qualification === filterQualification;

    return nameMatch && specMatch && expMatch && qualMatch;
  });

  const formatAvailabilityForDisplay = (availability) => {
    if (!availability) return 'N/A';

    // Handle both string and array formats
    let days = Array.isArray(availability) ? availability :
      typeof availability === 'string' ? availability.split(',').map(day => day.trim()) : [];

    if (days.length === 0) return 'N/A';

    // Return the formatted days
    return days.map(day => (
      <span key={day} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1">
        {day}
      </span>
    ));
  };

  // Helper function to extract doctor information (add this before the return statement)
  const extractDoctorInfo = (doctor) => {
    // Extract doctor information from either direct properties or from profile
    return {
      id: doctor._id,
      firstName: doctor.firstName || doctor.firstname || (doctor.name?.split(' ')[0]) || '',
      lastName: doctor.lastName || doctor.lastname || (doctor.name?.split(' ').slice(1).join(' ')) || '',
      fullName: doctor.name || `${doctor.firstName || doctor.firstname || ''} ${doctor.lastName || doctor.lastname || ''}`.trim(),
      email: doctor.email || '',
      phone: doctor.phone || doctor.phoneNumber || doctor.phonenumber || '',
      profileImage: doctor.profileImage || (doctor.profile?.profileImage) || '',
      specialization: doctor.specialization || (doctor.profile?.specialization) || '',
      qualification: doctor.qualification || (doctor.profile?.qualification) || '',
      experience: doctor.experience || (doctor.profile?.experience) || '',
      availability: doctor.availability || (doctor.profile?.availability) || [],
      registrationNumber: doctor.registrationNumber || (doctor.profile?.registrationNumber) || ''
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <MdDashboard className="text-3xl text-[#007E85] mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingDoctor(null);
              setFormData({
                firstname: '',
                lastname: '',
                phonenumber: '',
                email: '',
                password: '',
                specialization: '',
                experience: '',
                qualification: '',
                role: 'doctor', // Always set role to doctor
                availability: { ...initialAvailabilityState },
                registrationNumber: ''
              });
              setProfileImage(null);
              setProfileImagePreview(null);
              setValidationErrors({});
            }}
            className="flex items-center bg-[#007E85] hover:bg-[#006b6f] text-white px-4 py-2 rounded-lg transition duration-300"
          >
            <FaPlus className="mr-2" />
            {showAddForm ? 'Cancel' : 'Add Doctor'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{editingDoctor ? 'Edit Doctor Details' : 'Add New Doctor'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* First Column - Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      First Name {!editingDoctor && <span className="text-red-500">*</span>}
                      {editingDoctor && <span className="text-gray-500 text-xs ml-2">(Optional when editing)</span>}
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] ${validationErrors.firstname ? 'border-red-500' : ''}`}
                      required={!editingDoctor}
                    />
                    {validationErrors.firstname && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.firstname}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Last Name {!editingDoctor && <span className="text-red-500">*</span>}
                      {editingDoctor && <span className="text-gray-500 text-xs ml-2">(Optional when editing)</span>}
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] ${validationErrors.lastname ? 'border-red-500' : ''}`}
                      required={!editingDoctor}
                    />
                    {validationErrors.lastname && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.lastname}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Email {!editingDoctor && <span className="text-red-500">*</span>}
                      {editingDoctor && <span className="text-gray-500 text-xs ml-2">(Optional when editing)</span>}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] ${validationErrors.email ? 'border-red-500' : ''}`}
                      required={!editingDoctor}
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Password {!editingDoctor && <span className="text-red-500">*</span>}
                      <span className="text-gray-500 text-xs ml-2">
                        {editingDoctor ? '(Leave blank to keep current)' : '(Min 6 characters)'}
                      </span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] ${validationErrors.password ? 'border-red-500' : ''}`}
                      required={!editingDoctor}
                      placeholder={editingDoctor ? "Enter new password (optional)" : "Enter password (min 6 characters)"}
                    />
                    {validationErrors.password && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                    )}
                  </div>
                </div>

                {/* Second Column - Professional Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Phone Number {!editingDoctor && <span className="text-red-500">*</span>}
                      {editingDoctor && <span className="text-gray-500 text-xs ml-2">(Optional when editing)</span>}
                    </label>
                    <input
                      type="text"
                      name="phonenumber"
                      value={formData.phonenumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] ${validationErrors.phonenumber ? 'border-red-500' : ''}`}
                      required={!editingDoctor}
                    />
                    {validationErrors.phonenumber && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.phonenumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Specialization {!editingDoctor && <span className="text-red-500">*</span>}
                      {editingDoctor && <span className="text-gray-500 text-xs ml-2">(Optional when editing)</span>}
                    </label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] ${validationErrors.specialization ? 'border-red-500' : ''}`}
                      required={!editingDoctor}
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map((spec, index) => (
                        <option key={index} value={spec}>{spec}</option>
                      ))}
                    </select>
                    {validationErrors.specialization && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.specialization}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Experience {!editingDoctor && <span className="text-red-500">*</span>}
                      {editingDoctor && <span className="text-gray-500 text-xs ml-2">(Optional when editing)</span>}
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] ${validationErrors.experience ? 'border-red-500' : ''}`}
                      required={!editingDoctor}
                    >
                      <option value="">Select Experience</option>
                      {experienceYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    {validationErrors.experience && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.experience}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Qualification {!editingDoctor && <span className="text-red-500">*</span>}
                      {editingDoctor && <span className="text-gray-500 text-xs ml-2">(Optional when editing)</span>}
                    </label>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] ${validationErrors.qualification ? 'border-red-500' : ''}`}
                      required={!editingDoctor}
                    >
                      <option value="">Select Qualification</option>
                      {qualificationOptions.map((qual) => (
                        <option key={qual} value={qual}>{qual}</option>
                      ))}
                    </select>
                    {validationErrors.qualification && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.qualification}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Registration Number {!editingDoctor && <span className="text-red-500">*</span>}
                      {editingDoctor && <span className="text-gray-500 text-xs ml-2">(Optional when editing)</span>}
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] ${validationErrors.registrationNumber ? 'border-red-500' : ''}`}
                      required={!editingDoctor}
                    />
                    {validationErrors.registrationNumber && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.registrationNumber}</p>
                    )}
                  </div>
                </div>

                {/* Third Column - Availability and Profile Image */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Availability {!editingDoctor && <span className="text-red-500">*</span>}
                      {editingDoctor && <span className="text-gray-500 text-xs ml-2">(Optional when editing)</span>}
                    </label>
                    <div className={`flex flex-wrap gap-x-4 gap-y-2 p-3 border rounded-lg ${validationErrors.availability ? 'border-red-500' : ''}`}>
                      {daysOfWeek.map((day) => (
                        <label key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name={day}
                            checked={formData.availability[day]}
                            onChange={handleInputChange}
                            className="focus:ring-[#007E85] h-4 w-4 text-[#007E85] border-gray-300 rounded"
                          />
                          <span>{day}</span>
                        </label>
                      ))}
                    </div>
                    {validationErrors.availability && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.availability}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Profile Image {!editingDoctor && <span className="text-red-500">*</span>}
                      {editingDoctor && <span className="text-gray-500 text-xs ml-2">(Optional when editing)</span>}
                    </label>
                    <div className="flex items-center mb-4">
                      <input
                        type="file"
                        onChange={handleProfileImageChange}
                        className="opacity-0 absolute"
                        id="profile-image-upload"
                        accept="image/*"
                        name="profileImage"
                        aria-label="Profile Image Upload"
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className={`cursor-pointer ${validationErrors.profileImage
                          ? 'bg-red-500 hover:bg-red-700'
                          : ' bg-[#007E85] hover:bg-[#006b6f]'
                          } text-white font-bold py-2 px-4 rounded`}
                      >
                        {editingDoctor ? 'Change Image' : 'Choose Image'}
                      </label>
                      <span className="ml-3 text-sm text-gray-600">
                        {profileImage ? profileImage.name : (profileImagePreview ? "Current image" : "No file chosen")}
                      </span>
                    </div>
                    {validationErrors.profileImage && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.profileImage}</p>
                    )}

                    {/* Preview Area */}
                    <div className="mt-4 w-fit">
                      {profileImagePreview ? (
                        <div className="relative">
                          <div className="pr-5">
                            <img
                              src={profileImagePreview}
                              alt="Profile Preview"
                              className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileImagePreview(null);
                              setProfileImage(null);
                              const fileInput = document.getElementById('profile-image-upload');
                              if (fileInput) fileInput.value = '';
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            title="Remove image"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-full border-2 border-gray-300">
                          <FaUserMd className="text-gray-400 text-4xl" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#007E85] hover:bg-[#006b6f] text-white px-6 py-2 rounded-lg transition duration-300"
                >
                  {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Doctors</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] w-full"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <select
                  value={filterSpecialization}
                  onChange={(e) => setFilterSpecialization(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] bg-white"
                >
                  <option value="">All</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <select
                  value={filterExperience}
                  onChange={(e) => setFilterExperience(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] bg-white"
                >
                  <option value="">All</option>
                  {experienceYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <select
                  value={filterQualification}
                  onChange={(e) => setFilterQualification(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] bg-white"
                >
                  <option value="">All</option>
                  {qualificationOptions.map((qual) => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                >
                  <FaTimes className="mr-2" /> Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Add toggle buttons right after the filters section: */}
          <div className="flex justify-between items-center mb-4 mt-6">
            <h3 className="text-xl font-semibold text-gray-800">Doctor Directory</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewType('card')}
                className={`px-3 py-1 rounded ${viewType === 'card'
                  ? 'bg-[#007E85] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Card View
              </button>
              <button
                onClick={() => setViewType('table')}
                className={`px-3 py-1 rounded ${viewType === 'table'
                  ? 'bg-[#007E85] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Table View
              </button>
            </div>
          </div>

          {/* All Doctor Profiles Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-[#007E85] to-[#00565b] p-4 rounded-t-lg">
              <p className="text-gray-200 text-sm mt-1">Showing all registered healthcare professionals ({filteredDoctors.length})</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12 bg-white border border-t-0 border-gray-200 rounded-b-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007E85]"></div>
                <span className="ml-3 text-gray-500">Loading doctor profiles...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 bg-red-50 border border-t-0 border-red-200 rounded-b-lg">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-8 bg-white border border-t-0 border-gray-200 rounded-b-lg">
                <FaFilter className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No doctors match the current filters.</p>
              </div>
            ) : viewType === 'card' ? (
              <div>
                {/* Schema Header */}
                <div className="hidden md:flex bg-gray-100 p-3 text-xs font-medium text-gray-600 uppercase border-b border-gray-200">
                  <div className="w-24 flex-shrink-0 mr-6">Profile</div>
                  <div className="flex-grow grid grid-cols-5 gap-4">
                    <div className="col-span-1">Doctor Info</div>
                    <div className="col-span-1">Qualifications</div>
                    <div className="col-span-1">Contact</div>
                    <div className="col-span-1">Registration / Availability</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                </div>

                {/* Doctor List - Card View */}
                <div className="space-y-3 bg-white border border-t-0 border-gray-200 rounded-b-lg p-3">
                  {filteredDoctors.map(doctor => {
                    const doctorInfo = extractDoctorInfo(doctor);
                    return (
                      <div key={doctorInfo.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow">
                        <div className="flex flex-wrap md:flex-nowrap items-center">
                          {/* Profile Image */}
                          <div className="w-24 flex-shrink-0 mr-6">
                            <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-[#007E85]">
                              {doctorInfo.profileImage ? (
                                <img
                                  src={doctorInfo.profileImage.startsWith('http')
                                    ? doctorInfo.profileImage
                                    : `${API_URL}${doctorInfo.profileImage}`}
                                  alt={`Dr. ${doctorInfo.firstName} ${doctorInfo.lastName}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/assets/images/profilephoto.svg';
                                  }}
                                />
                              ) : (
                                <FaUserMd className="text-3xl text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Doctor Info */}
                          <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 md:mt-0">
                            {/* Name and Specialization */}
                            <div className="md:col-span-1">
                              <h4 className="font-bold text-lg text-gray-800">
                                Dr. {doctorInfo.firstName} {doctorInfo.lastName}
                              </h4>
                              <span className="inline-block bg-[#007E85] bg-opacity-10 text-[#007E85] px-2 py-1 rounded text-sm mt-1">
                                {doctorInfo.specialization || 'N/A'}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                ID: {doctorInfo.id ? doctorInfo.id.substring(0, 8) : 'N/A'}
                              </div>
                            </div>

                            {/* Qualification and Experience */}
                            <div className="md:col-span-1">
                              <div className="mb-2">
                                <span className="block text-xs text-gray-500 uppercase">Qualification</span>
                                <span className="font-medium">{doctorInfo.qualification || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-xs text-gray-500 uppercase">Experience</span>
                                <span className="font-medium">{doctorInfo.experience || 'N/A'}</span>
                              </div>
                            </div>

                            {/* Contact Info */}
                            <div className="md:col-span-1">
                              <div className="mb-2">
                                <span className="block text-xs text-gray-500 uppercase">Email</span>
                                <span className="font-medium truncate block" title={doctorInfo.email}>{doctorInfo.email || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-xs text-gray-500 uppercase">Phone</span>
                                <span className="font-medium">{doctorInfo.phone || 'N/A'}</span>
                              </div>
                            </div>

                            {/* Registration and Availability */}
                            <div className="md:col-span-1">
                              <div className="mb-2">
                                <span className="block text-xs text-gray-500 uppercase">Registration No.</span>
                                <span className="font-medium">{doctorInfo.registrationNumber || 'N/A'}</span>
                              </div>
                              <span className="block text-xs text-gray-500 uppercase">Availability</span>
                              <div className="mt-1">
                                {formatAvailabilityForDisplay(doctorInfo.availability)}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-1 flex justify-end items-center space-x-2">
                              <button
                                onClick={() => handleEdit(doctor)}
                                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
                                title="Edit Doctor"
                              >
                                <FaEdit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(doctorInfo.id)}
                                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                                title="Delete Doctor"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Table View
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specialization
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qualification
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration No.
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Availability
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDoctors.map((doctor) => {
                      const doctorInfo = extractDoctorInfo(doctor);

                      return (
                        <tr key={doctorInfo.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 border-b">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                {doctorInfo.profileImage ? (
                                  <img
                                    src={doctorInfo.profileImage.startsWith('http')
                                      ? doctorInfo.profileImage
                                      : `${API_URL}${doctorInfo.profileImage}`}
                                    alt={`Dr. ${doctorInfo.fullName}`}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/assets/images/profilephoto.svg';
                                    }}
                                  />
                                ) : (
                                  <FaUserMd className="text-lg text-gray-400" />
                                )}
                              </div>
                              <div>
                                <span className="font-medium text-gray-800">Dr. {doctorInfo.fullName}</span>
                                <div className="text-xs text-gray-500">ID: {doctorInfo.id ? doctorInfo.id.substring(0, 8) : 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 border-b">{doctorInfo.specialization || 'N/A'}</td>
                          <td className="px-4 py-4 border-b">{doctorInfo.qualification || 'N/A'}</td>
                          <td className="px-4 py-4 border-b">{doctorInfo.experience || 'N/A'}</td>
                          <td className="px-4 py-4 border-b">{doctorInfo.registrationNumber || 'N/A'}</td>
                          <td className="px-4 py-4 border-b">
                            <div className="flex flex-wrap">
                              {formatAvailabilityForDisplay(doctorInfo.availability)}
                            </div>
                          </td>
                          <td className="px-4 py-4 border-b">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(doctor)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                title="Edit Doctor"
                              >
                                <FaEdit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(doctorInfo.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                title="Delete Doctor"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
