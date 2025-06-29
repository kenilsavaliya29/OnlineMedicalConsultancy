import React, { useContext, useState } from 'react'
import { FaEnvelope, FaUserMd, FaKey, FaSignOutAlt } from 'react-icons/fa';
import { AuthContext } from '../../../contexts/authContext';

// Assuming API_URL is accessible or passed as a prop if needed here
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const SettingsTab = () => {
    const { user } = useContext(AuthContext);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

    const handleLogout = () => { }

    const handleEditProfileClick = () => {
        setIsEditProfileModalOpen(true);
    };

    const handleCloseEditProfileModal = () => {
        setIsEditProfileModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-6">
                    <img
                        src={user.profileImage ? `${API_URL}${user.profileImage.startsWith('/') ? '' : '/'}${user.profileImage}` : "https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg"}
                        alt="Doctor Profile"
                        className="w-24 h-24 rounded-full border-4 border-[#007E85] object-cover"
                    />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{user?.fullName || "Doctor"}</h2>
                        <p className="text-gray-500">{user ? user.profile.specialization || 'Doctor' : 'Doctor'}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            <FaEnvelope className="inline mr-2" />
                            {user ? user.email : 'Loading...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* My Profile */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-[#007E85]/10 p-4 rounded-lg">
                            <FaUserMd className="text-2xl text-[#007E85]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">My Profile</h3>
                            <p className="text-sm text-gray-500">View and edit your information</p>
                        </div>
                    </div>
                    <button
                        onClick={handleEditProfileClick}
                        className="w-full bg-[#007E85] text-white py-2 rounded-lg hover:bg-[#006b6f] transition-colors">
                        Edit Profile
                    </button>
                </div>

            </div>
        </div>
    );
}

export default SettingsTab