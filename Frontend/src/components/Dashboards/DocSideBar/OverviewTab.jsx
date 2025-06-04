import React, { useState, useContext } from 'react'
import { useEffect } from 'react';
import { FaCalendarCheck, FaUsers, FaWallet, FaPhone, FaEnvelope, FaStar, FaClock, FaCalendarAlt, FaComments } from 'react-icons/fa';
import { AuthContext } from '../../../contexts/authContext';

// Assuming API_URL is accessible or passed as a prop if needed here
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const OverviewTab = ({ appointments, setActiveTab, isLoading, doctorDetails }) => {

    // Removed local doctorDetails state as it's passed as a prop
    // const { user } = useContext(AuthContext);
    // console.log(user.profile.rating)
    // const [doctorDetails, setDoctorDetails] = useState(null);
    // useEffect(() => {
    //     setDoctorDetails(user);
    // }, []); // Removed this effect


    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#007E85]/10 p-4 rounded-lg">
                            <FaUsers className="text-2xl text-[#007E85]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Patients</p>
                            <h3 className="text-2xl font-bold text-gray-800">{appointments.length || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#6EAB36]/10 p-4 rounded-lg">
                            <FaCalendarCheck className="text-2xl text-[#6EAB36]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Appointments</p>
                            <h3 className="text-2xl font-bold text-gray-800">{appointments.length || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#007E85]/10 p-4 rounded-lg">
                            <FaWallet className="text-2xl text-[#007E85]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-800">$0</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#6EAB36]/10 p-4 rounded-lg">
                            <FaStar className="text-2xl text-[#6EAB36]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Rating</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {doctorDetails?.profile?.ratings ?
                                    `${doctorDetails.profile.ratings.average?.toFixed(1)} (${doctorDetails.profile.ratings.count})`
                                : 'N/A'}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Appointments</h2>
                    <div className="space-y-4">
                        {appointments && appointments.length > 0 ? (
                            appointments.slice(0, 3).map(appointment => (
                                <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt={appointment.patientName} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <h4 className="font-semibold">{appointment.patientName}</h4>
                                            <p className="text-sm text-gray-500">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {appointment.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
                                <FaCalendarCheck className="text-4xl text-gray-300 mb-2" />
                                <p className="text-gray-500 font-medium">No appointments yet</p>
                                <p className="text-gray-400 text-sm text-center mt-1">
                                    When patients schedule appointments, they'll appear here
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Doctor Profile</h2>
                    <div className="space-y-4">
                        {doctorDetails ? (
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <img
                                        src={doctorDetails?.profileImage ? `${API_URL}${doctorDetails.profileImage.startsWith('/') ? '' : '/'}${doctorDetails.profileImage}` : "https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg"}
                                        alt="Doctor Profile"
                                        className="w-20 h-20 rounded-full border-2 border-[#007E85] object-cover"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold capitalize">Dr. {doctorDetails?.fullName || "Doctor"}</h3>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <FaEnvelope className="mr-1" />
                                            <span>{doctorDetails.email}</span>
                                        </div>
                                        {doctorDetails.phone && (
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <FaPhone className="mr-1" />
                                                <span>{doctorDetails.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">Specialization</h4>
                                        <div className="bg-[#007E85]/10 px-3 py-1 rounded-full inline-block">
                                            <span className="text-[#007E85] font-medium">{doctorDetails.profile.specialization || 'Not specified'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">Experience</h4>
                                        <div className="flex items-center">
                                            <FaClock className="text-gray-400 mr-1" />
                                            <span>
                                                {doctorDetails.profile.experience === 0
                                                    ? 'Not specified'
                                                    : doctorDetails.profile.experience === 1
                                                        ? '1 Year'
                                                        : `${doctorDetails.profile.experience} Years`}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">Qualification</h4>
                                        <p>{doctorDetails.profile.qualification || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">Availability</h4>
                                        <button
                                            onClick={() => setActiveTab('availability')}
                                            className="text-[#007E85] hover:underline flex items-center text-sm"
                                        >
                                            <FaCalendarAlt className="mr-1" />
                                            Manage Schedule
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">Loading doctor information...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Patient Reviews Section - Use the new component
            <ReviewsSection reviews={reviews} isLoading={isLoading} /> */}
        </div>
    )
}

export default OverviewTab