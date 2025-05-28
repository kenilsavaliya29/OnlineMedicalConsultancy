import React from 'react'
import { FaEnvelope, FaUserMd, FaKey, FaSignOutAlt } from 'react-icons/fa';

const SettingsTab = ({ doctorDetails, getProfileImage, handleLogout }) => {

    console.log("Doctor Details:", doctorDetails);
    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-6">
                    <img
                        src={getProfileImage()}
                        alt="Doctor Profile"
                        className="w-24 h-24 rounded-full border-4 border-[#007E85] object-cover"
                    />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{ }</h2>
                        <p className="text-gray-500">{doctorDetails ? doctorDetails.profile.specialization || 'Doctor' : 'Doctor'}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            <FaEnvelope className="inline mr-2" />
                            {doctorDetails ? doctorDetails.email : 'Loading...'}
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
                    <button className="w-full bg-[#007E85] text-white py-2 rounded-lg hover:bg-[#006b6f] transition-colors">
                        Edit Profile
                    </button>
                </div>

                {/* Change Password */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-[#6EAB36]/10 p-4 rounded-lg">
                            <FaKey className="text-2xl text-[#6EAB36]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Password</h3>
                            <p className="text-sm text-gray-500">Change your password</p>
                        </div>
                    </div>
                    <button className="w-full bg-[#6EAB36] text-white py-2 rounded-lg hover:bg-[#5a9025] transition-colors">
                        Change Password
                    </button>
                </div>

                {/* Logout */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-red-100 p-4 rounded-lg">
                            <FaSignOutAlt className="text-2xl text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Logout</h3>
                            <p className="text-sm text-gray-500">Sign out of your account</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsTab