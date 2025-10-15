import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUserMd, FaClock, FaStar, FaStarHalfAlt, FaRegStar, FaArrowLeft, FaCertificate, FaRegCalendarCheck, FaWallet } from 'react-icons/fa';
import { MdOutlineVerified } from 'react-icons/md';
import { AuthContext } from '../../contexts/authContext';
import { showMessage } from '../../components/common/MessageBox.jsx';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';


const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      setLoading(true);
      setError(null);


      if (!id) {
        console.error("Doctor ID is undefined or invalid");
        setError("Invalid doctor ID. Please go back and try again.");
        setLoading(false);
        return;
      }

      try {

        const response = await fetch(`${API_URL}/api/doctors/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });


        if (!response.ok) {
          throw new Error(`Failed to fetch doctor details. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data.doctor.profile.availability)

        if (data.success) {
          setDoctor(data.doctor);
          if (data.doctor.profile?.availability?.recurringWeekly?.length > 0) {
            setSelectedDay(data.doctor.profile.availability.recurringWeekly[0].dayOfWeek);
          } else if (data.doctor.profile?.availability?.dateSpecific?.length > 0) {
            setSelectedDay(new Date(data.doctor.profile.availability.dateSpecific[0].date).toLocaleDateString(undefined, { weekday: 'short' }));
          } else {
            setSelectedDay(null);
          }
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

    fetchDoctorDetails();
  }, [id]);

  useEffect(() => {
    if (doctor && selectedDay) {
      let slots = [];
      const dayName = daysOfWeek.find(day => day.startsWith(selectedDay.substring(0, 3)));

      if (doctor.profile?.availability?.recurringWeekly) {
        slots = slots.concat(doctor.profile.availability.recurringWeekly.filter(slot => slot.dayOfWeek.startsWith(dayName)));
      }

      if (doctor.profile?.availability?.dateSpecific) {
        const dateSpecificSlots = doctor.profile.availability.dateSpecific.filter(slot => {
          const slotDate = new Date(slot.date);
          return slotDate.toLocaleDateString(undefined, { weekday: 'short' }) === selectedDay;
        });
        slots = slots.concat(dateSpecificSlots);
      }

      setFilteredTimeSlots(slots);
    }
  }, [doctor, selectedDay]);

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
      stars.push(<FaRegStar key={`empty-${i}`} className="text-gray-300" />);
    }

    return (
      <div className="flex">
        {stars}
        <span className="ml-1 text-gray-600">({rating})</span>
      </div>
    );
  };

  // Helper function to check if a day is available
  const isDayAvailable = (day) => {
    const shortDay = day.substring(0, 3);
    const hasRecurring = doctor.profile.availability?.recurringWeekly?.some(item => item.dayOfWeek.startsWith(shortDay));
    const hasDateSpecific = doctor.profile.availability?.dateSpecific?.some(item => new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' }) === shortDay);
    return hasRecurring || hasDateSpecific;
  };

  // Function to handle booking appointment
  const handleBookAppointment = async (timeSlot) => {
    if (!user || user.role !== 'patient') {
      showMessage.error('Please login as a patient to book an appointment');
      return
    }
    if (user.role === 'patient') {
      const response = await fetch(`${API_URL}/api/patient-profiles/profile-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })
      const data = await response.json();

      if (!data.isBasicProfileComplete) {
        showMessage.warn('Your basic details are incomplete. Please complete them in My Medical Profile.');
        navigate('/patient/dashboard?tab=medical-profile')
      }
      
      else{
        navigate(`/doctors/${doctor._id}/payment`, {
          state: { appointmentDetails }
        });
      }
    }
    // Format the appointment date based on the slot type
    const appointmentDate = 'date' in timeSlot
      ? new Date(timeSlot.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]; // For recurring slots, use current date

    // Prepare appointment details
    const appointmentDetails = {
      doctorId: doctor._id,
      date: appointmentDate,
      time: timeSlot.startTime,
      fee: doctor.profile.consultationPrice,
      type: 'in-person', // You can make this selectable if needed
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.profile.specialization
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007E85]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex justify-center items-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md text-center">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/doctors')}
          className="mb-6 flex items-center text-[#007E85] hover:text-[#006b6f] transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Doctors</span>
        </button>

        {/* Doctor Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-[#007E85]/10 flex items-center justify-center text-[#007E85] text-6xl mx-auto md:mx-0 md:mr-8 mb-4 md:mb-0">
                {doctor.profile?.profileImage ? (
                  <img
                    src={`${API_URL}${doctor.profile.profileImage.startsWith('/') ? '' : '/'}${doctor.profile.profileImage}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = '<FaUserMd className="text-6xl" />';
                    }}
                  />
                ) : (
                  <FaUserMd />
                )}
              </div>

              <div className="text-center md:text-left flex-grow">
                <div className="flex items-center justify-center md:justify-start">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 capitalize">Dr. {doctor.firstName} {doctor.lastName}</h1>
                  <MdOutlineVerified className="ml-2 text-blue-500 text-xl" />
                </div>

                <p className="text-gray-600 text-lg mt-1">{doctor.profile.qualification} - {doctor.profile.specialization}</p>

                <div className="mt-2 flex items-center justify-center md:justify-start">
                  {renderStars(4.8)}
                </div>

                <div className="mt-4 justify-center md:justify-start gap-4">
                  <div className="flex items-center text-gray-700">
                    <FaClock className="mr-2 text-[#007E85]" />
                    <span>
                      {doctor.profile.experience > 0 ? doctor.profile.experience : '0'} {doctor.profile.experience > 1 ? 'Years' : 'Year'}
                    </span>
                  </div>

                  <div className="flex text-gray-700 mt-2">
                    <FaRegCalendarCheck className="mr-2 text-[#007E85]" />
                    <span>
                      {doctor.profile?.availability?.recurringWeekly?.length > 0 && (
                        <>
                          <span className="font-semibold">Weekly:</span>{" "}
                          {doctor.profile.availability.recurringWeekly.map((item, idx) => (
                            <span key={idx}>
                              {item.dayOfWeek} ({item.startTime} - {item.endTime}){idx < doctor.profile.availability.recurringWeekly.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </>
                      )}
                      {doctor.profile?.availability?.dateSpecific?.length > 0 && (
                        <>
                          {doctor.profile.availability.recurringWeekly?.length > 0 && <br />}
                          <span className="font-semibold">Dates:</span>{" "}
                          {doctor.profile.availability.dateSpecific.map((item, idx) => (
                            <span key={idx}>
                              {new Date(item.date).toLocaleDateString()} ({item.startTime} - {item.endTime}){idx < doctor.profile.availability.dateSpecific.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </>
                      )}
                      {!doctor.profile?.availability?.recurringWeekly?.length &&
                        !doctor.profile?.availability?.dateSpecific?.length &&
                        "Contact for details"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 md:mt-0">
                <button
                  onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#007E85] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#006b6f] transition-colors block w-full md:w-auto"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Fee Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-[#007E85]/10 p-4 rounded-lg">
                  <FaWallet className="text-2xl text-[#007E85]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <h3 className="text-2xl font-bold text-gray-800">₹{doctor.profile.consultationPrice}</h3>
                </div>
              </div>
              <button
                onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#007E85] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#006b6f] transition-colors w-full sm:w-auto"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Doctor Details */}

          <div id="booking-section">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Book an Appointment</h2>

                {/* Day Selector */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">Select Day</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        onClick={() => isDayAvailable(day) && setSelectedDay(day)}
                        className={`p-2 rounded-lg text-center text-sm ${isDayAvailable(day)
                          ? selectedDay === day
                            ? 'bg-[#007E85] text-white'
                            : 'bg-[#007E85]/10 text-[#007E85] hover:bg-[#007E85]/20'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        disabled={!isDayAvailable(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Select Time</h3>
                  {selectedDay ? (
                    filteredTimeSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {filteredTimeSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleBookAppointment(slot)}
                            className="p-3 border border-[#007E85] rounded-lg text-center text-sm text-[#007E85] hover:bg-[#007E85] hover:text-white transition-colors flex flex-col items-center gap-1"
                          >
                            <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                            {'date' in slot && (
                              <span className="text-xs opacity-75">
                                {new Date(slot.date).toLocaleDateString()}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-center">
                        No available time slots for this day
                      </div>
                    )
                  ) : (
                    <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-center">
                      Please select an available day first
                    </div>
                  )}
                </div>

                {/* Availability Summary */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor Availability</h3>

                  {/* Recurring Weekly Slots */}
                  {doctor.profile?.availability?.recurringWeekly?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-2">Recurring Weekly Slots</h4>
                      <div className="flex flex-col gap-3">
                        {doctor.profile.availability.recurringWeekly.map((slot) => (
                          <div
                            key={slot._id}
                            className="flex items-center justify-between border border-[#007E85]/50 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2 text-gray-700">
                              <FaRegCalendarCheck className="text-[#007E85]" />
                              <span className="font-semibold">{slot.dayOfWeek}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#007E85]">
                              <FaClock />
                              <span>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Date-Specific Slots */}
                  {doctor.profile?.availability?.dateSpecific?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Date-Specific Slots</h4>
                      <div className="flex flex-col gap-3">
                        {doctor.profile.availability.dateSpecific.map((slot) => (
                          <div
                            key={slot._id}
                            className="flex flex-col md:flex-row md:items-center md:justify-between border border-[#007E85]/50 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2 text-gray-700">
                              <FaRegCalendarCheck className="text-[#007E85]" />
                              <span className="font-semibold">
                                {new Date(slot.date).toLocaleDateString(undefined, {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center gap-2 text-[#007E85]">
                              <FaClock />
                              <span>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Availability */}
                  {!doctor.profile?.availability?.recurringWeekly?.length &&
                    !doctor.profile?.availability?.dateSpecific?.length && (
                      <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-center mt-4">
                        No availability information provided by the doctor.
                      </div>
                    )}
                </div>

              </div>
            </div>
          </div>

          {/* Right Column - Booking Section */}
          <div className="lg:col-span-2">
            {/* About Doctor */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About Doctor</h2>
                <p className="text-gray-600">
                  Dr. {doctor.firstName + " " + doctor.lastName} is a highly qualified {doctor.specialization} with {doctor.profile.experience} of experience.
                  They specialize in providing comprehensive healthcare services and are committed to delivering
                  personalized treatment plans for each patient.
                </p>
              </div>
            </div>

            {/* Qualifications & Specializations */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Qualifications & Specializations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Education</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start mb-2">
                        <FaCertificate className="text-[#007E85] mt-1 mr-2" />
                        <div>
                          <p className="font-medium">{doctor.qualification}</p>
                          <p className="text-sm text-gray-600">University Medical School</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Specialization</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium">{doctor.specialization}</p>
                      <p className="text-sm text-gray-600">{doctor.profile.experience} of experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default DoctorProfile; 