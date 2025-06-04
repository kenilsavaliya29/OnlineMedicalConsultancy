import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/authContext.jsx';
import { FaUser, FaLock, FaBell, FaEnvelope, FaShieldAlt, FaEye, FaEyeSlash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';


const SuccessModal = ({ onClose }) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center max-w-md w-full"
      >
        <div className="w-20 h-20 bg-[#6EAB36]/20 rounded-full flex items-center justify-center mb-4">
          <FaCheck className="text-[#6EAB36] text-5xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
        <p className="text-center text-gray-600 mb-6">Your changes have been saved successfully.</p>
      </motion.div>
    </div>
  );
};

const SettingSection = ({ title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl custom-box-shadow p-6 mb-6"
  >
    <div className="flex items-center gap-4 mb-6 border-b-2 border-[#007E85]/20 pb-4">
      <div className="text-[#007E85] text-2xl">{icon}</div>
      <h2 className="text-2xl font-bold text-[#007E85] font-lexend">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const EditableField = ({ label, name, value, onChange, error }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState('');

  const handleEdit = () => {
    setTempValue(value || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    onChange({
      target: {
        name,
        value: tempValue
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setTempValue(e.target.value);
  };

  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2 font-lato">
        {label}
      </label>
      {isEditing ? (
        <div className="flex items-center">
          <input
            type="text"
            value={tempValue}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#007E85] focus:ring-1 focus:ring-[#007E85] outline-none transition duration-200"
            autoFocus
          />
          <div className="flex ml-2">
            <button
              type="button"
              onClick={handleSave}
              className="p-2 text-green-600 hover:text-green-800"
            >
              <FaCheck />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 text-red-600 hover:text-red-800"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="w-full px-4 py-3 rounded-lg border border-transparent">
            {value || <span className="text-gray-400 italic">Not set</span>}
          </div>
          <button
            type="button"
            onClick={handleEdit}
            className="ml-2 p-2 text-[#007E85] hover:text-[#00565c]"
          >
            <FaEdit />
          </button>
        </div>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);

  // Removed successMessage, showErrorBox, errorMessage states
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', // Corrected from fullName
    lastName: '',
    email: '',
    phone: '',
    notifications: true,
    currentPassword: '',
    newPassword: '',
    showPassword: false
  });

  // Initialize form with user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        firstName: user.firstName || '', // Use user.firstName
        lastName: user.lastName || '',   // Use user.lastName
        email: user.email || '',
        phone: user.phoneNumber || '' // Use user.phoneNumber
      }));
    }
  }, [user]);

  // Handle direct changes to form data
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: newValue
    }));

    // Clear specific error when the user starts typing in that field
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: undefined, // Clear the specific field error
      general: undefined // Clear general error on any change
    }));
  };

  const togglePasswordVisibility = () => {
    setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Different data structure and endpoint based on user role
      if (user.role === 'doctor') {
        // Data for doctor update
        const doctorUpdateData = {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`, // Combine first and last for doctor name
          phone: formData.phone,
          // Keep existing doctor specific fields if they exist on user object
          specialization: user.specialization,
          experience: user.experience,
          qualification: user.qualification,
          availability: user.availability
        };

        const response = await fetch(`http://localhost:3000/auth/update-doctor`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(doctorUpdateData)
        });

        const data = await response.json();

        if (data.success) {
          // Update the user in context with new information
          setUser(prev => ({
            ...prev,
            firstName: formData.firstName, // Update firstName
            lastName: formData.lastName,   // Update lastName
            email: formData.email,
            phoneNumber: formData.phone, // Update phoneNumber
            name: `${formData.firstName} ${formData.lastName}` // Update combined name
          }));

          // Show the success modal
          setShowSuccessModal(true);

          // Removed window.location.reload()
        } else {
          setErrors({
            general: data.message || 'Failed to update doctor profile'
          });
        }
      } else { // Assuming 'patient' or other roles
        const updateData = {
          firstname: formData.firstName, // Use firstname for patient endpoint
          lastname: formData.lastName,   // Use lastname for patient endpoint
          email: formData.email,
          phonenumber: formData.phone    // Use phonenumber for patient endpoint
        };

        const response = await fetch(`http://localhost:3000/auth/update-profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (data.success) {
          // Update the user in context with new information
          setUser(prev => ({
            ...prev,
            firstName: formData.firstName, // Update firstName
            lastName: formData.lastName,   // Update lastName
            email: formData.email,
            phoneNumber: formData.phone    // Update phoneNumber
          }));

          // Show the success modal
          setShowSuccessModal(true);

          // Removed window.location.reload()
        } else {
          setErrors({
            general: data.message || 'Failed to update profile'
          });
        }
      }
    } catch (error) {
      console.error("Profile update error:", error); // Log the error
      setErrors({
        general: 'An unexpected error occurred during profile update.'
      });
    }
  }; // Correctly closed handleProfileSubmit

  // Defined handleSecuritySubmit separately
  const handleSecuritySubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!formData.newPassword) newErrors.newPassword = "New password is required";
    // Add more validation for new password if needed (e.g., length, complexity)

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Data being sent to server
    const passwordData = {
      email: user.email, // Assuming email is needed for password change
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    };

    try {
      const response = await fetch(`http://localhost:3000/auth/update-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();
      console.log(data)
      if (data.success) {
        // Clear password fields
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        setErrors({}); // Clear any previous errors

        // Show success modal
        setShowSuccessModal(true);
        console.log("Password updated successfully")
        // Removed window.location.reload()
      } else {
        // Check for specific error messages from the backend
        if (data.message === 'Current password is incorrect') {
          setErrors({ currentPassword: 'Incorrect current password' });
        } else {
          setErrors({
            general: data.message || 'Failed to change password'
          });
        }
      }
    } catch (error) {
      console.error("Password update error:", error); // Log the error
      setErrors({
        general: 'An unexpected error occurred during password change.'
      });
    }
  }; // Correctly closed handleSecuritySubmit


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6e9f0] to-[#eef1f5] py-12 px-4 sm:px-6 lg:px-8"> {/* Added background */}
      {showSuccessModal && <SuccessModal onClose={() => setShowSuccessModal(false)} />}
      {/* Removed ErrorBox component usage */}

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-2 text-sm font-lato text-[#007E85]">
          <Link to="/" className="hover:text-[#00565c]">Home</Link>
          <span>/</span>
          <span className="text-gray-600">Settings</span>
        </div>

        <h1 className="text-4xl font-bold text-[#007E85] mb-8 font-dm">Account Settings</h1>

        {/* Removed successMessage display as showSuccessModal is used */}

        {errors.general && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-100 text-red-600 rounded-xl border border-red-300"
          >
            {errors.general}
          </motion.div>
        )}

        <SettingSection title="Profile Details" icon={<FaUser />}>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <EditableField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
              />

              {/* Last Name */}
              <EditableField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
              />

              {/* Email */}
              <EditableField
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              {/* Phone */}
              <EditableField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-[#007E85] text-white rounded-xl font-lexend hover:bg-[#006b6f] transition-colors"
            >
              Save Profile Changes
            </button>
          </form>
        </SettingSection>

        <SettingSection title="Account Security" icon={<FaLock />}>
          <form onSubmit={handleSecuritySubmit} className="space-y-6"> {/* Use handleSecuritySubmit */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 font-lato">Current Password</label>
                <div className="relative">
                  <input
                    name="currentPassword"
                    type={formData.showPassword ? 'text' : 'password'}
                    value={formData.currentPassword || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#007E85] focus:ring-0 transition-colors pr-12"
                    style={{ outline: 'none' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#007E85]"
                    aria-label="Toggle password visibility"
                  >
                    {formData.showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 font-lato">New Password</label>
                <input
                  name="newPassword"
                  type="password"
                  value={formData.newPassword || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#007E85] focus:ring-0 transition-colors"
                  style={{ outline: 'none' }}
                  required
                />
                 {/* Add error display for new password if needed */}
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 bg-[#6EAB36] text-white rounded-xl font-lexend hover:bg-[#5d942d] transition-colors"
              >
                Change Password
              </button>
            </div>
          </form>
        </SettingSection>

        <SettingSection title="Notification Preferences" icon={<FaBell />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#007E85]/5 rounded-xl">
              <div>
                <h3 className="font-medium text-gray-800 font-lato">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive important updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={formData.notifications}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${formData.notifications ? 'bg-[#007E85]' : 'bg-gray-300'
                  }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${formData.notifications ? 'translate-x-5 bg-white' : 'bg-white'
                    }`}></div>
                </div>
              </label>
            </div>
          </div>
        </SettingSection>

        {/* Corrected and cleaned up the Data & Privacy section */}
        <SettingSection title="Data & Privacy" icon={<FaShieldAlt />}> {/* Changed icon to FaShieldAlt */}
          <div className="space-y-4">
            <a href="/api/download/personal-data" download={user?.firstName || 'personal-data'}> {/* Added optional chaining and default filename */}
              <button className="w-full flex items-center justify-between p-4 bg-[#007E85]/5 hover:bg-[#007E85]/10 rounded-xl transition-colors">
                <span className="font-medium text-gray-800 font-lato">Download Personal Data</span>
                <FaEnvelope className="text-[#007E85]" />
              </button>
            </a>
            {/* Assuming Privacy Settings is just a link or placeholder */}
            <button className="w-full flex items-center justify-between p-4 bg-[#007E85]/5 hover:bg-[#007E85]/10 rounded-xl transition-colors">
              <span className="font-medium text-gray-800 font-lato">Privacy Settings</span> {/* Corrected typo "Settins" */}
              <FaShieldAlt className="text-[#007E85]" />
            </button>
          </div>
        </SettingSection>
      </div>
    </div>
  );
};

export default Settings;
