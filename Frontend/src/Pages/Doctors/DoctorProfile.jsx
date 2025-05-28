import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUserMd, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaStar, FaStarHalfAlt, FaRegStar, FaArrowLeft, FaCertificate, FaRegCalendarCheck } from 'react-icons/fa';
import { MdOutlineVerified } from 'react-icons/md';

const API_URL = 'http://localhost:3000/api/doctors';
const TIME_SLOTS_API_URL = 'http://localhost:3000/api/timeslots';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Days of the week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      setLoading(true);
      setError(null);

      // Check if ID is valid before making the API call
      if (!id) {
        console.error("Doctor ID is undefined or invalid");
        setError("Invalid doctor ID. Please go back and try again.");
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching doctor with ID: ${id}`);
        const response = await fetch(`${API_URL}/${id}`, {
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
        console.log('Doctor data received:', data);

        console.log(data.doctor.profile.availability)
        if (data.success) {
          setDoctor(data.doctor);
          if (data.doctor.availability) {
            const availableDays = data.doctor.availability.split(',').map(day => day.trim());
            if (availableDays.length > 0) {
              setSelectedDay(availableDays[0]);
              fetchTimeSlots(id, availableDays[0]);
            }
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

  // Fetch time slots when day changes
  useEffect(() => {
    if (id && selectedDay) {
      fetchTimeSlots(id, selectedDay);
    }
  }, [id, selectedDay]);

  const fetchTimeSlots = async (doctorId, day) => {
    if (!doctorId || !day) {
      console.error("Missing doctorId or day for time slots");
      return;
    }

    try {
      const response = await fetch(`${TIME_SLOTS_API_URL}/available/${doctorId}/${day}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch time slots. Status: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setAvailableTimeSlots(data.timeSlots);
      } else {
        console.error('Error fetching time slots:', data.message);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
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
    // Checks if doctor and profile and availability exist, and if the day is in the availability array
    return doctor.profile.availability?.includes(day);
  };

  // Function to handle booking appointment
  const handleBookAppointment = (timeSlot) => {
    navigate(`/doctors/${id}/book`, {
      state: {
        doctor,
        selectedDay,
        selectedTime: `${timeSlot.startTime} - ${timeSlot.endTime}`,
        timeSlotId: timeSlot._id
      }
    });
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
                {doctor.profileImage ? (
                  <img
                    src={doctor.profileImage.startsWith('http')
                      ? doctor.profileImage
                      : `http://localhost:3000${doctor.profileImage}`}
                    alt={`Dr. ${doctor.firstName}`}
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

                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center text-gray-700">
                    <FaClock className="mr-2 text-[#007E85]" />
                    <span>
                      {doctor.profile.experience > 0 ? doctor.profile.experience : '0'} {doctor.profile.experience > 1 ? 'Years' : 'Year'}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <FaRegCalendarCheck className="mr-2 text-[#007E85]" />
                    <span>Available: {doctor.availability || 'Contact for details'}</span>
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

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Doctor Details */}
          <div className="lg:col-span-2">
            {/* About Doctor */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About Doctor</h2>
                <p className="text-gray-600">
                  Dr. {doctor.name} is a highly qualified {doctor.specialization} with {doctor.experience} of experience.
                  {/* In a real app, you'd have a more detailed bio from the database */}
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
                      <p className="text-sm text-gray-600">{doctor.experience} of experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Section */}
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
                    availableTimeSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableTimeSlots.map((slot) => (
                          <button
                            key={slot._id}
                            onClick={() => handleBookAppointment(slot)}
                            className="p-2 border border-[#007E85] rounded-lg text-center text-sm text-[#007E85] hover:bg-[#007E85] hover:text-white transition-colors"
                          >
                            {slot.startTime} - {slot.endTime}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile; 