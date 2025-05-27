import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaUserMd, FaCalendarDay, FaClock, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { AuthContext } from '../../contexts/authContext.jsx';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AppointmentBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setRedirectPath } = useContext(AuthContext);
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Details, 2: Confirmation, 3: Success
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    appointmentType: 'chat',
    reason: '',
    notes: '',
    timeSlotId: ''
  });
  
  useEffect(() => {
    // Attempt to fetch the doctor's details
    fetchDoctorDetails();
    
    // Pre-fill form with user data if logged in
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : user.name || prevData.name,
        email: user.email || prevData.email,
        phone: user.phone || prevData.phone
      }));
    }
    
    // Handle data from DoctorProfile time slot selection
    if (location.state) {
      console.log("Location state received:", location.state);
      
      // If coming from a time slot selection in DoctorProfile
      if (location.state.selectedTime && location.state.selectedDay) {
        // Convert day name to date
        let dateToUse = "";
        
        // If selectedDay is in day name format (e.g., 'Mon', 'Tue')
        if (location.state.selectedDay && location.state.selectedDay.length === 3) {
          const dayMapping = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 0 };
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0-6, starting with Sunday
          const targetDay = dayMapping[location.state.selectedDay];
          
          // Calculate days until the target day
          const daysUntilTarget = (targetDay - dayOfWeek + 7) % 7;
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
          
          dateToUse = targetDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
        
        setFormData(prevData => ({
          ...prevData,
          date: dateToUse || prevData.date,
          time: location.state.selectedTime || prevData.time,
          timeSlotId: location.state.timeSlotId || ''
        }));
      }
      // For backward compatibility with the selectedSlot format
      else if (location.state.selectedSlot) {
        setFormData(prevData => ({
          ...prevData,
          date: location.state.selectedSlot.date || prevData.date,
          time: location.state.selectedSlot.time || prevData.time,
          timeSlotId: location.state.selectedSlot.id || ''
        }));
      }
    }
  }, [user, location.state]);
  
  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/doctors/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch doctor details. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Doctor data received:', data);
      
      if (data.success) {
        setDoctor(data.doctor);
      } else {
        throw new Error(data.message || 'Error fetching doctor details');
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Move to confirmation step
      setStep(2);
      return;
    }
    
    // Check if user is logged in
    if (!user) {
      toast.error("Please log in to book an appointment");
      // Store return URL path in context
      setRedirectPath(`/doctors/${id}/book`);
      // Attach appointment data as query params
      const queryParams = new URLSearchParams();
      queryParams.append('doctorId', id);
      Object.entries(formData).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      // Redirect to login
      navigate(`/login?${queryParams.toString()}`);
      return;
    }
    
    // Submit appointment to backend
    try {
      const appointmentData = {
        doctorId: doctor._id,
        patientName: formData.name,
        patientEmail: formData.email,
        patientPhone: formData.phone,
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        appointmentType: formData.appointmentType,
        reason: formData.reason,
        notes: formData.notes
      };
      
      // Add timeSlotId if available from either location state format
      if (formData.timeSlotId) {
        appointmentData.timeSlotId = formData.timeSlotId;
      } else if (location.state && location.state.timeSlotId) {
        appointmentData.timeSlotId = location.state.timeSlotId;
      }
      
      console.log('Sending appointment data:', appointmentData);
      
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(appointmentData)
      });
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      if (data.success) {
        // Move to success step
        setStep(3);
      } else {
        setError(data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007E85]"></div>
      </div>
    );
  }
  
  if (error && step !== 2) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex justify-center items-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md text-center">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => navigate(`/doctors/${id}`)}
            className="mt-4 px-4 py-2 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors"
          >
            Back to Doctor Profile
          </button>
        </div>
      </div>
    );
  }
  
  if (!doctor) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex justify-center items-center">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg max-w-md text-center">
          <p>Doctor not found</p>
          <button 
            onClick={() => navigate('/doctors')}
            className="mt-4 px-4 py-2 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors"
          >
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }
  
  const renderStepOne = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Book an Appointment with Dr. {doctor.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Your Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Your Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Your Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Appointment Type</label>
          <select
            name="appointmentType"
            value={formData.appointmentType}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
            required
          >
            <option value="chat">Chat Consultation</option>
            <option value="video">Video Consultation</option>
            <option value="inperson">In-Person Visit</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none ${(location.state && (location.state.selectedTime || location.state.selectedSlot)) ? 'bg-gray-100' : ''}`}
            readOnly={location.state && (location.state.selectedTime || location.state.selectedSlot)}
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Time</label>
          <input
            type="text"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none ${(location.state && (location.state.selectedTime || location.state.selectedSlot)) ? 'bg-gray-100' : ''}`}
            placeholder="e.g. 10:00 AM"
            readOnly={location.state && (location.state.selectedTime || location.state.selectedSlot)}
            required
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Reason for Visit</label>
        <input
          type="text"
          name="reason"
          value={formData.reason}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none"
          placeholder="Brief description of your health concern"
          required
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Additional Notes (Optional)</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#007E85] focus:border-[#007E85] focus:outline-none resize-none"
          placeholder="Any additional information you'd like to share"
        ></textarea>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => navigate(`/doctors/${id}`)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
        
        <button
          type="submit"
          className="px-6 py-2 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors"
        >
          Proceed to Confirmation
        </button>
      </div>
    </div>
  );
  
  const renderStepTwo = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Confirm Your Appointment</h2>
      
      <div className="bg-[#007E85]/5 p-6 rounded-lg mb-6">
        <div className="flex items-start mb-4">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-[#007E85]/10 flex items-center justify-center text-[#007E85] text-2xl mr-4">
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
                  e.target.parentNode.innerHTML = '<FaUserMd className="text-2xl" />';
                }}
              />
            ) : (
              <FaUserMd />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Dr. {doctor.name}</h3>
            <p className="text-gray-600">{doctor.qualification} - {doctor.specialization}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center">
            <FaCalendarDay className="text-[#007E85] mr-2" />
            <span className="text-gray-700">{formData.date}</span>
          </div>
          
          <div className="flex items-center">
            <FaClock className="text-[#007E85] mr-2" />
            <span className="text-gray-700">{formData.time}</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Appointment Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="text-gray-500 text-sm">Patient Name</p>
            <p className="text-gray-700">{formData.name}</p>
          </div>
          
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="text-gray-700">{formData.email}</p>
          </div>
          
          <div>
            <p className="text-gray-500 text-sm">Phone</p>
            <p className="text-gray-700">{formData.phone}</p>
          </div>
          
          <div>
            <p className="text-gray-500 text-sm">Appointment Type</p>
            <p className="text-gray-700">
              {formData.appointmentType === 'chat' && 'Chat Consultation'}
              {formData.appointmentType === 'video' && 'Video Consultation'}
              {formData.appointmentType === 'inperson' && 'In-Person Visit'}
            </p>
          </div>
          
          <div className="md:col-span-2">
            <p className="text-gray-500 text-sm">Reason for Visit</p>
            <p className="text-gray-700">{formData.reason}</p>
          </div>
          
          {formData.notes && (
            <div className="md:col-span-2">
              <p className="text-gray-500 text-sm">Additional Notes</p>
              <p className="text-gray-700">{formData.notes}</p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 flex items-start">
          <FaExclamationTriangle className="mr-2 mt-1 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Form
        </button>
        
        <button
          type="submit"
          className="px-6 py-2 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors"
        >
          Confirm Appointment
        </button>
      </div>
    </div>
  );
  
  const renderStepThree = () => (
    <div className="text-center py-8">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 bg-[#007E85]/10 rounded-full flex items-center justify-center text-[#007E85] text-4xl">
          <FaCheckCircle />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Confirmed!</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Your appointment with Dr. {doctor.name} has been scheduled for {formData.date} at {formData.time}.
        We've sent a confirmation to your email.
      </p>
      
      <div className="bg-[#007E85]/5 p-6 rounded-lg mb-6 max-w-md mx-auto">
        <div className="text-left">
          <p className="font-bold text-gray-800 mb-1">Next Steps:</p>
          <ul className="text-gray-600 space-y-2">
            <li>• Check your email for appointment details</li>
            <li>• Prepare any medical records if applicable</li>
            <li>• Be online 5 minutes before your appointment time</li>
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="px-6 py-2 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors"
        >
          Go to Dashboard
        </button>
        
        <button
          onClick={() => navigate('/doctors')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Find More Doctors
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              {step === 1 && renderStepOne()}
              {step === 2 && renderStepTwo()}
              {step === 3 && renderStepThree()}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking; 