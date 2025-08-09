import React, { useState, useContext } from 'react'
import { FaCalendarCheck, FaUsers, FaWallet, FaPhone, FaEnvelope, FaStar, FaClock, FaCalendarAlt, FaComments, FaCog } from 'react-icons/fa';
import { AuthContext } from '../../../contexts/authContext';
import { showMessage } from '../../common/MessageBox';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const OverviewTab = ({ setActiveTab }) => {
    const [appointments, setappointments] = useState([]);
    const { user } = useContext(AuthContext);
    const [showFeeModal, setShowFeeModal] = useState(false);
    const [consultationPrice, setConsultationPrice] = useState(user?.profile?.consultationPrice || 300);
    const [messageBox, setMessageBox] = useState({ show: false, type: '', message: '' });

    const handleUpdateFees = async () => {
        try {
            const response = await fetch(`${API_URL}/api/doctors/consultationFee`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ consultationPrice }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update consultation fee');
            }

            setMessageBox({ show: true, type: 'success', message: 'Consultation fee updated successfully' });
            setShowFeeModal(false);
        } catch (error) {
            setMessageBox({ show: true, type: 'error', message: error.message });
        }
    };

    const handleTabChange = () => {
        setActiveTab('update_availability')
    }

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
                                {user?.profile?.ratings ?
                                    `${user.profile.ratings.average?.toFixed(1)} (${user.profile.ratings.count})`
                                    : 'N/A'}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Consultation Fee Section - Prominent Placement */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Consultation Fee</h2>
                    <button
                        onClick={() => setShowFeeModal(true)}
                        className="bg-[#007E85] hover:bg-[#005f63] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <FaCog />
                        Edit Fee
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-[#007E85]/10 p-4 rounded-lg">
                        <FaWallet className="text-3xl text-[#007E85]" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Current Consultation Fee</p>
                        <h3 className="text-3xl font-bold text-gray-800">₹{consultationPrice}</h3>
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
                        {user ? (
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <img
                                        src={user.profile.profileImage ? `${API_URL}${user.profile.profileImage.startsWith('/') ? '' : '/'}${user.profile.profileImage}` : "https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg"}
                                        alt="Doctor Profile"
                                        className="w-20 h-20 rounded-full border-2 border-[#007E85] object-cover"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold capitalize">Dr. {user?.fullName || "Doctor"}</h3>
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

                                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">Specialization</h4>
                                        <div className="bg-[#007E85]/10 px-3 py-1 rounded-full inline-block">
                                            <span className="text-[#007E85] font-medium">{user.profile.specialization || 'Not specified'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">Experience</h4>
                                        <div className="flex items-center">
                                            <FaClock className="text-gray-400 mr-1" />
                                            <span>
                                                {user.profile.experience === 0
                                                    ? 'Not specified'
                                                    : user.profile.experience === 1
                                                        ? '1 Year'
                                                        : `${user.profile.experience} Years`}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">Qualification</h4>
                                        <p>{user.profile.qualification || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">Availability</h4>
                                        <button
                                            onClick={handleTabChange}
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

            {/* Fee Update Modal */}
            {showFeeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !mt-0">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-md mx-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Consultation Fee</h3>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Consultation Fee (₹)
                            </label>
                            <input
                                type="number"
                                min="300"
                                step="50"
                                value={consultationPrice}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 300;
                                    const roundedValue = Math.ceil(value / 50) * 50;
                                    setConsultationPrice(Math.max(300, roundedValue));
                                }}
                                className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                            <p className="text-sm text-gray-500 mt-2">Minimum fee: ₹300 (Increments of ₹50)</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowFeeModal(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateFees}
                                className="px-4 py-2 rounded-lg bg-[#007E85] text-white hover:bg-[#005f63] transition-colors"
                            >
                                Update Fee
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {messageBox.show && (
                <MessageBox
                    type={messageBox.type}
                    message={messageBox.message}
                    onClose={() => setMessageBox({ show: false, type: '', message: '' })}
                />
            )}
        </div>
    )
}

export default OverviewTab