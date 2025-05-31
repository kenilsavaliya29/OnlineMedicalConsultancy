import React, { useState, useMemo, useContext, useEffect } from 'react'
import { FaUserMd, FaCalendarCheck, FaFileMedical, FaWallet, FaComments, FaCog, FaChartLine, FaSignOutAlt, FaBell, FaUser, FaHeartbeat, FaNotesMedical, FaUserCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaKey, FaStar, FaDownload, FaSyncAlt, FaAppleAlt } from 'react-icons/fa'
import { AuthContext } from '../../../contexts/authContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const OverViewTab = React.memo(() => {

    const { user } = useContext(AuthContext);

    const [appointments, setAppointments] = useState([]);

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#007E85]/10 p-4 rounded-lg">
                            <FaUserMd className="text-2xl text-[#007E85]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Doctors</p>
                            <h3 className="text-2xl font-bold text-gray-800">3</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#6EAB36]/10 p-4 rounded-lg">
                            <FaCalendarCheck className="text-2xl text-[#6EAB36]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Appointments</p>
                            <h3 className="text-2xl font-bold text-gray-800">{0}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#007E85]/10 p-4 rounded-lg">
                            <FaFileMedical className="text-2xl text-[#007E85]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Records</p>
                            <h3 className="text-2xl font-bold text-gray-800">5</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#6EAB36]/10 p-4 rounded-lg">
                            <FaHeartbeat className="text-2xl text-[#6EAB36]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Health Score</p>
                            <h3 className="text-2xl font-bold text-gray-800"></h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Health and Appointments Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Health Metrics</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {user.profile && (
                            <>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-gray-600 capitalize">Height</p>
                                    <p className="text-lg font-semibold text-[#007E85]">{user.profile.height} cm</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-gray-600 capitalize">Weight</p>
                                    <p className="text-lg font-semibold text-[#007E85]">{user.profile.weight} kg</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-gray-600 capitalize">Blood Group</p>
                                    <p className="text-lg font-semibold text-[#007E85]">{user.profile.bloodGroup}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-gray-600 capitalize">Date of Birth</p>
                                    <p className="text-lg font-semibold text-[#007E85]">{new Date(user.profile.dateOfBirth).toLocaleDateString('en-GB')}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Appointments</h2>
                    <div className="space-y-4">
                        {appointments && appointments.length > 0 ? (
                            appointments.slice(0, 3).map(apt => (
                                <div key={apt.id || apt._id} className="border-l-4 border-[#007E85] bg-gray-50 p-4 rounded-r-xl">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{apt.doctor || apt.doctorName}</p>
                                            <p className="text-sm text-gray-600">{apt.date || apt.appointmentDate} at {apt.time || apt.appointmentTime}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm ${(apt.status === "Upcoming" || apt.status === "confirmed") ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                                            }`}>
                                            {apt.status === "confirmed" ? "Upcoming" : apt.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
                                <FaCalendarCheck className="text-4xl text-gray-300 mb-2" />
                                <p className="text-gray-500 font-medium">No appointments yet</p>
                                <p className="text-gray-400 text-sm text-center mt-1">
                                    Schedule appointments with doctors to see them here
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Patient Profile */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Patient Profile</h2>
                <div className="space-y-4">
                    {user ? (
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={user?.profileImage ? `${API_URL}${user.profileImage}` : "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=740&t=st=1693113479~exp=1693114079~hmac=740079bac9709276b095b4d1410b49850d0d9b1c27e95efcad33ad86ce483e26"}
                                    alt="Patient Profile"
                                    className="w-20 h-20 rounded-full border-2 border-[#007E85] object-cover"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold capitalize">{user.fullName}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <FaEnvelope className="mr-1" />
                                        <span>{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <FaPhone className="mr-1" />
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-1">Date of Birth</h4>
                                    <p>{user.dob || 'Not specified'}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-1">Gender</h4>
                                    <p>{user.gender || 'Not specified'}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-1">Blood Type</h4>
                                    <p>{user.bloodType || 'Not specified'}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-1">Allergies</h4>
                                    <p>{user.profile.allergies || 'None reported'}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Loading patient information...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
})

export default OverViewTab
