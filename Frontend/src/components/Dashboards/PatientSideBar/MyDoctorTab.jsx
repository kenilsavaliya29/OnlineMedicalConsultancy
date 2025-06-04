import React, { useState, useEffect, useCallback , useContext} from 'react';
import { FaUserMd, FaSyncAlt } from 'react-icons/fa';
import MessageBox from '../../common/MessageBox.jsx';
import { AuthContext } from '../../../contexts/authContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MyDoctorTab = React.memo(() => {
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AuthContext);
    console.log(user)

    // Fetch patient's associated doctors
    const fetchDoctors = useCallback(async () => {
        if (!user?._id) {
            console.log("Patient details not available for doctor fetch");
            setIsLoading(false); 
            return;
        }

        try {
            setIsLoading(true);
            
            const response = await fetch(`${API_URL}/api/doctors/patient/${user._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (response.status === 401) {
                MessageBox.error('Your session has expired. Please log in again.');
                // In a real app, you might trigger a logout here
                // setTimeout(() => { logout(); }, 3000);
                return;
            }

            if (!response.ok) {
                MessageBox.error(`Server error: ${response.status} ${response.statusText}`);
                setIsLoading(false);
                return;
            }

            const data = await response.json();

            if (data.success) {
                setDoctors(data.doctors || []);
            } else {
                MessageBox.error(`Failed to fetch doctors: ${data.message}`);
            }
        } catch (error) {
            MessageBox.error(`Error fetching doctors: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [user?._id]); // Depend on user._id

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]); // Effect runs when fetchDoctors changes (which is only when user._id changes)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">My Doctors</h2>
                <button
                    onClick={fetchDoctors}
                    className="flex items-center gap-2 text-sm bg-[#007E85] text-white px-4 py-2 rounded-lg hover:bg-[#006b6f] transition-colors"
                >
                    <FaSyncAlt className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#007E85]"></div>
                </div>
            ) : doctors.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100">
                    <FaUserMd className="text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No doctors found</p>
                    <p className="text-gray-400 text-sm">Doctors you have appointments with or are linked to will appear here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {doctors.map(doctor => (
                            <div key={doctor._id || doctor.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex-shrink-0 h-12 w-12">
                                    <img
                                        className="h-12 w-12 rounded-full object-cover"
                                        src={
                                            doctor.profileImage
                                                ? `${API_URL}${doctor.profileImage}`
                                                : "https://randomuser.me/api/portraits/men/85.jpg" // Placeholder image
                                        }
                                        alt={`${doctor.name || 'Doctor'}'s profile`}
                                    />
                                </div>
                                <div className="flex-grow">
                                    <div className="text-lg font-semibold text-gray-900">
                                        {doctor.name || "Unknown Doctor"}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {doctor.specialization || "General Physician"}
                                    </div>
                                    {/* Add more doctor details here if available, e.g., contact info */}
                                </div>
                                {/* Optional: Add a button for booking appointment or viewing profile */}
                                {/* <button className="text-sm text-[#007E85] hover:underline">View Profile</button> */}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

export default MyDoctorTab;