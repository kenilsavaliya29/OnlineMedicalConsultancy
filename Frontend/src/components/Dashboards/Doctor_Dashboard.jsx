import React, { useState, useEffect, useContext } from 'react';
import { FaUserMd, FaCalendarCheck, FaUsers, FaWallet, FaComments, FaCog, FaChartBar, FaSignOutAlt, FaBell, FaSearch, FaClipboardList, FaUserCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEllipsisV, FaVideo, FaPaperclip, FaPaperPlane, FaKey, FaStar, FaClock, FaCalendarAlt, FaPlus, FaTrash, FaTimes, FaInfo, FaSyncAlt, FaRegClock, FaLock } from 'react-icons/fa';
import { AuthContext } from '../../contexts/authContext.jsx';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { user, logout } = useContext(AuthContext);
    
    const [timeSlots, setTimeSlots] = useState({});
    const [doctorDetails, setDoctorDetails] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState('Mon');
    const [newSlot, setNewSlot] = useState({ startTime: '09:00', endTime: '09:30' });
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [error, setError] = useState(null);
    
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const timeOptions = generateTimeOptions();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === 'doctor') {
            setDoctorDetails(user);
        } else if (user && user.role !== 'doctor') {
            // Only show toast if we've been on this page for a moment (not during initial navigation)
            const timer = setTimeout(() => {
                toast.error("You don't have permission to access the doctor dashboard. Redirecting...");
                // Use navigate instead of direct window.location change
                if (user.role === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/patient/dashboard';
                }
            }, 500); // Small delay to avoid toast during normal navigation
            
            return () => clearTimeout(timer);
        } else {
            // Only show toast if we've been on this page for a moment (not during initial navigation)
            const timer = setTimeout(() => {
                toast.error("Please log in to access the doctor dashboard");
                window.location.href = '/login';
            }, 500);
            
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Fetch doctor appointments
    useEffect(() => {
        if (doctorDetails && doctorDetails._id) {
            fetchAppointments();
            fetchTimeSlots();
        }
    }, [doctorDetails]);

    const fetchAppointments = async () => {
        if (!doctorDetails?._id) {
            return;
        }
        
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/appointments/doctor/${doctorDetails._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });
            
            if (response.status === 401) {
                toast.error('Your session has expired. Please log in again.');
                // No immediate logout - give the user a chance to see the error
                setTimeout(() => {
                    logout();
                }, 3000);
                return;
            }
            
            if (!response.ok) {
                toast.error(`Server error: ${response.status} ${response.statusText}`);
                setIsLoading(false);
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                setAppointments(data.appointments || []);
            } else {
                toast.error(`Failed to fetch appointments: ${data.message}`);
            }
        } catch (error) {
            toast.error(`Error fetching appointments: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTimeSlots = async () => {
        if (!doctorDetails?._id) return;
        
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/timeslots/doctor/${doctorDetails._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (response.status === 401) {
                toast.error('Authentication error - please try logging in again');
                logout(); // Force logout on auth error
                return;
            }
            
            if (!response.ok) {
                toast.error(`Server error: ${response.status} ${response.statusText}`);
                setIsLoading(false);
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                setTimeSlots(data.timeSlots);
            } else {
                toast.error(`Failed to fetch time slots: ${data.message}`);
            }
        } catch (error) {
            toast.error(`Error fetching time slots: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate 30-minute time intervals from 6am to 9pm
    function generateTimeOptions() {
        const options = [];
        for (let hour = 6; hour <= 21; hour++) {
            const hourStr = hour.toString().padStart(2, '0');
            options.push(`${hourStr}:00`);
            if (hour !== 21) { // Don't add 21:30 as it would make an appointment end at 22:00
                options.push(`${hourStr}:30`);
            }
        }
        return options;
    }

    // Handle adding time slots
    const handleAddTimeSlot = async () => {
        if (!newSlot.startTime || !newSlot.endTime) {
            toast.error('Please select both start and end times');
            return;
        }

        if (newSlot.startTime >= newSlot.endTime) {
            toast.error('End time must be after start time');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/timeslots`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    doctorId: doctorDetails._id,
                    slots: [{
                        day: selectedDay,
                        startTime: newSlot.startTime,
                        endTime: newSlot.endTime,
                        isAvailable: true
                    }]
                })
            });

            if (response.status === 401) {
                toast.error('Authentication error - please try logging in again');
                logout(); // Force logout on auth error
                return;
            }
            
            if (!response.ok) {
                toast.error(`Server error: ${response.status} ${response.statusText}`);
                setIsLoading(false);
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                toast.success('Time slot added successfully');
                fetchTimeSlots();
                setNewSlot({ startTime: '09:00', endTime: '09:30' });
            } else {
                toast.error(data.message || 'Failed to add time slot');
            }
        } catch (error) {
            toast.error('Error adding time slot');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTimeSlot = async (slotId) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/timeslots/${slotId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (response.status === 401) {
                toast.error('Authentication error - please try logging in again');
                logout(); // Force logout on auth error
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                toast.success('Time slot deleted successfully');
                fetchTimeSlots();
            } else {
                toast.error(data.message || 'Failed to delete time slot');
            }
        } catch (error) {
            toast.error('Error deleting time slot');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAllTimeSlots = async (day) => {
        if (!window.confirm(`Are you sure you want to delete all time slots for ${day}?`)) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/timeslots/bulk`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    doctorId: doctorDetails._id,
                    day: day
                })
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success(`All time slots for ${day} deleted successfully`);
                fetchTimeSlots();
            } else {
                toast.error(data.message || 'Failed to delete time slots');
            }
        } catch (error) {
            toast.error('Error deleting time slots');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const result = await logout();
            if (result.success) {
                toast.success("Logged out successfully");
                // Redirect will be handled by AuthContext/ProtectedRoute
            } else {
                toast.error(result.message || "Failed to logout");
            }
        } catch (error) {
            toast.error("An error occurred during logout");
        }
    };

    const sidebarLinks = [
        { id: 'overview', name: 'Overview', icon: <FaChartBar /> },
        { id: 'appointments', name: 'Appointments', icon: <FaCalendarCheck /> },
        { id: 'patients', name: 'My Patients', icon: <FaUsers /> },
        { id: 'availability', name: 'My Availability', icon: <FaClock /> },
        { id: 'payments', name: 'Payments', icon: <FaWallet /> },
        { id: 'messages', name: 'Messages', icon: <FaComments /> },
        { id: 'records', name: 'Medical Records', icon: <FaClipboardList /> },
        { id: 'settings', name: 'Settings', icon: <FaCog /> },
    ];  

    // Dummy data for different tabs
    const recentAppointments = [
        { id: 1, patient: 'John Smith', time: '09:00 AM', date: 'Today', status: 'Confirmed', 
          image: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: 2, patient: 'Sarah Johnson', time: '10:30 AM', date: 'Today', status: 'Pending', 
          image: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { id: 3, patient: 'Michael Brown', time: '02:00 PM', date: 'Tomorrow', status: 'Confirmed', 
          image: 'https://randomuser.me/api/portraits/men/86.jpg' },
    ];

    const patients = [
        { id: 1, name: 'John Smith', age: 45, condition: 'Hypertension', lastVisit: '2024-01-15', 
          image: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: 2, name: 'Sarah Johnson', age: 32, condition: 'Diabetes', lastVisit: '2024-01-18', 
          image: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { id: 3, name: 'Michael Brown', age: 28, condition: 'Asthma', lastVisit: '2024-01-20', 
          image: 'https://randomuser.me/api/portraits/men/86.jpg' },
    ];

    const payments = [
        { id: 1, patient: 'John Smith', amount: 150, date: '2024-01-15', status: 'Paid' },
        { id: 2, patient: 'Sarah Johnson', amount: 200, date: '2024-01-18', status: 'Pending' },
        { id: 3, patient: 'Michael Brown', amount: 175, date: '2024-01-20', status: 'Paid' },
    ];

    const messages = [
        { id: 1, sender: 'John Smith', message: 'Thank you for the consultation', time: '10:30 AM', 
          image: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: 2, sender: 'Sarah Johnson', message: 'When should I take the medicine?', time: '11:45 AM', 
          image: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { id: 3, sender: 'Michael Brown', message: 'Can we reschedule the appointment?', time: '12:15 PM', 
          image: 'https://randomuser.me/api/portraits/men/86.jpg' },
    ];

    // Get the doctor's full name from firstname and lastname
    const getDoctorFullName = () => {
        if (!doctorDetails) return "Doctor";
        return `Dr. ${doctorDetails.firstname || ''} ${doctorDetails.lastname || ''}`;
    };

    // Improve the getProfileImage function to properly handle image paths from the database
    const getProfileImage = () => {
        if (doctorDetails && doctorDetails.profileImage) {
            // If image path starts with http, it's a complete URL
            if (doctorDetails.profileImage.startsWith('http')) {
                return doctorDetails.profileImage;
            }
            // If it starts with / or doesn't have a prefix, append to API_URL
            return `${API_URL}${doctorDetails.profileImage.startsWith('/') ? '' : '/'}${doctorDetails.profileImage}`;
        }
        // Default image if no profile image is available
        return "https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg";
    };

    const renderAppointmentInfo = () => {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How Your Availability System Works</h3>
                <p className="text-gray-600 mb-4">
                    Your availability system is fully integrated with the database. Here's how it works:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                            <FaClock className="mr-2" /> Time Slots Collection
                        </h4>
                        <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                            <li>Stores your available time slots by day and time</li>
                            <li>Created when you add a time slot here</li>
                            <li>Each slot has doctorId, day, startTime, endTime</li>
                            <li>Has isAvailable flag (true/false)</li>
                            <li>References appointmentId when booked</li>
                        </ul>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-700 mb-2 flex items-center">
                            <FaCalendarCheck className="mr-2" /> Appointments Collection
                        </h4>
                        <ul className="text-sm text-green-600 space-y-1 list-disc list-inside">
                            <li>Created when a patient books an appointment</li>
                            <li>Contains doctorId, patientName, reason, etc.</li>
                            <li>References the time slot that was booked</li>
                            <li>Includes status: pending, confirmed, etc.</li>
                            <li>Time slot is marked unavailable when booked</li>
                        </ul>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                    <FaInfo className="text-gray-400" />
                    <span className="text-gray-600">
                        When a patient cancels, the time slot is automatically marked available again.
                    </span>
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
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
                                        <h3 className="text-2xl font-bold text-gray-800">5.0</h3>
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
                                                <span className={`px-3 py-1 rounded-full text-sm ${
                                                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
                                                    src={getProfileImage()} 
                                                    alt="Doctor Profile" 
                                                    className="w-20 h-20 rounded-full border-2 border-[#007E85] object-cover"
                                                />
                                                <div>
                                                    <h3 className="text-lg font-semibold">{getDoctorFullName()}</h3>
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
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 mb-1">Specialization</h4>
                                                    <div className="bg-[#007E85]/10 px-3 py-1 rounded-full inline-block">
                                                        <span className="text-[#007E85] font-medium">{doctorDetails.specialization || 'Not specified'}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 mb-1">Experience</h4>
                                                    <div className="flex items-center">
                                                        <FaClock className="text-gray-400 mr-1" />
                                                        <span>{doctorDetails.experience || 'Not specified'}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 mb-1">Qualification</h4>
                                                    <p>{doctorDetails.qualification || 'Not specified'}</p>
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
                    </div>
                );

            case 'appointments':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
                            <button 
                                onClick={fetchAppointments}
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
                        ) : appointments.length === 0 ? (
                            <div className="text-center py-10 flex flex-col items-center">
                                <FaCalendarCheck className="text-4xl text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No appointments scheduled yet</p>
                                <p className="text-gray-400 text-sm">Your upcoming appointments will appear here</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {appointments.map(appointment => (
                                            <tr key={appointment._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                                                            <div className="text-sm text-gray-500">{appointment.patientEmail}</div>
                                                            <div className="text-xs text-gray-500">{appointment.patientPhone}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{appointment.appointmentDate}</div>
                                                    <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${appointment.appointmentType === 'chat' ? 'bg-blue-100 text-blue-800' : 
                                                        appointment.appointmentType === 'video' ? 'bg-purple-100 text-purple-800' : 
                                                        'bg-green-100 text-green-800'}`}>
                                                        {appointment.appointmentType === 'inperson' ? 'In Person' : 
                                                        appointment.appointmentType.charAt(0).toUpperCase() + appointment.appointmentType.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    if (window.confirm(`Are you sure you want to cancel the appointment with ${appointment.patientName}?`)) {
                                                                        try {
                                                                            updateAppointmentStatus(appointment._id, 'cancelled');
                                                                        } catch (error) {
                                                                            toast.error("An error occurred while canceling");
                                                                        }
                                                                    }
                                                                    return false;
                                                                }}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                try {
                                                                    viewAppointmentDetails(appointment);
                                                                } catch (error) {
                                                                    toast.error("An error occurred while viewing details");
                                                                }
                                                                return false;
                                                            }}
                                                            className="text-[#007E85] hover:text-[#006b6f]"
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );

            case 'patients':
                return (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">My Patients</h2>
                        
                        {appointments && appointments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Get unique patients from appointments */}
                                {Array.from(new Set(appointments.map(a => a.patientEmail))).map((email, index) => {
                                    const patientAppointments = appointments.filter(a => a.patientEmail === email);
                                    const latestAppointment = patientAppointments[0];
                                    
                                    return (
                                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4 mb-4">
                                                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt={latestAppointment.patientName} className="w-16 h-16 rounded-full" />
                                                <div>
                                                    <h3 className="font-bold text-lg">{latestAppointment.patientName}</h3>
                                                    <p className="text-gray-500 text-sm">{latestAppointment.patientEmail}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm"><span className="font-medium">Phone:</span> {latestAppointment.patientPhone}</p>
                                                <p className="text-sm"><span className="font-medium">Last Visit:</span> {latestAppointment.appointmentDate}</p>
                                                <p className="text-sm"><span className="font-medium">Total Visits:</span> {patientAppointments.length}</p>
                                            </div>
                                            <button className="mt-4 w-full bg-[#007E85] text-white py-2 rounded-lg hover:bg-[#006b6f] transition-colors">
                                                View Details
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
                                <FaUsers className="text-5xl text-gray-300 mb-3" />
                                <h3 className="text-xl font-medium text-gray-600">No patients yet</h3>
                                <p className="text-gray-400 text-center max-w-md mt-2">
                                    When patients schedule appointments with you, they will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'availability':
                return (
                    <div className="space-y-6">
                        {renderAppointmentInfo()}
                        
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Manage Your Availability</h2>
                                
                                <div className="flex flex-wrap gap-4 mb-6">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(day)}
                                            className={`px-4 py-2 rounded-lg transition ${
                                                selectedDay === day 
                                                ? 'bg-[#007E85] text-white' 
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium mb-3">Add Time Slot</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="w-full md:w-auto">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                            <input
                                                type="time"
                                                value={newSlot.startTime}
                                                onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#007E85] focus:border-[#007E85]"
                                            />
                                        </div>
                                        <div className="w-full md:w-auto">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                            <input
                                                type="time"
                                                value={newSlot.endTime}
                                                onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#007E85] focus:border-[#007E85]"
                                            />
                                        </div>
                                        <div className="w-full md:w-auto flex items-end">
                                            <button
                                                onClick={handleAddTimeSlot}
                                                disabled={isLoading}
                                                className="h-[42px] bg-[#007E85] text-white py-2 px-4 rounded-lg hover:bg-[#006b6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        <span>Adding...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaPlus />
                                                        <span>Add Slot</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-medium mb-3">Time Slots for {selectedDay}</h3>
                                    
                                    {isLoading ? (
                                        <div className="flex justify-center py-10">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#007E85]"></div>
                                        </div>
                                    ) : timeSlots[selectedDay] && timeSlots[selectedDay].length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {timeSlots[selectedDay].map(slot => (
                                                <div 
                                                    key={slot._id} 
                                                    className={`rounded-lg border p-4 ${
                                                        slot.isAvailable 
                                                        ? 'border-green-200 bg-green-50' 
                                                        : 'border-red-200 bg-red-50'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-lg font-medium">
                                                            {slot.startTime} - {slot.endTime}
                                                        </span>
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                            slot.isAvailable 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {slot.isAvailable ? 'Available' : 'Booked'}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex mt-2 space-x-2">
                                                        {slot.isAvailable && (
                                                            <button
                                                                onClick={() => handleDeleteTimeSlot(slot._id)}
                                                                className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1 rounded"
                                                            >
                                                                <FaTrash className="inline mr-1" />
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
                                            <FaClock className="text-4xl text-gray-300 mb-2" />
                                            <p className="text-gray-500 font-medium">No time slots set for {selectedDay}</p>
                                            <p className="text-gray-400 text-sm text-center mt-1">
                                                Add time slots above to make yourself available for appointments
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'payments':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment History</h2>
                        
                        {payments.map((payment, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">{payment.patient}</p>
                                    <p className="text-sm text-gray-500">{payment.date}</p>
                                </div>
                                <div className="text-sm text-gray-500">{payment.amount}</div>
                                <div className={`text-sm text-gray-500 ${payment.status === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>
                                    {payment.status}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'messages':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Chat with Patients</h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh]">
                            {/* Appointment List Sidebar */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="font-semibold">Active Appointments</h3>
                                    <p className="text-sm text-gray-500">Select to chat</p>
                                </div>
                                
                                <div className="overflow-y-auto h-[calc(70vh-4rem)]">
                                    {isLoading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#007E85]"></div>
                                        </div>
                                    ) : appointments.filter(apt => 
                                        apt.status === 'confirmed' || apt.status === 'pending'
                                      ).length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <p>No active appointments</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {appointments
                                              .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
                                              .map(appointment => (
                                                <div
                                                  key={appointment._id}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedAppointment(appointment);
                                                  }}
                                                  className={`w-full text-left p-4 transition-colors hover:bg-gray-50 cursor-pointer ${
                                                    selectedAppointment?._id === appointment._id ? 'bg-[#007E85]/5 border-l-4 border-[#007E85]' : ''
                                                  }`}
                                                >
                                                  <p className="font-medium truncate">{appointment.patientName}</p>
                                                  <div className="flex justify-between items-center mt-1">
                                                    <p className="text-sm text-gray-500 truncate">
                                                      {appointment.appointmentDate}, {appointment.appointmentTime}
                                                    </p>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                      appointment.status === 'confirmed' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                      {appointment.status}
                                                    </span>
                                                  </div>
                                                </div>
                                              ))
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Chat Interface */}
                            <div className="lg:col-span-3 h-full">
                                {/* Chat Interface content will be updated later */}
                            </div>
                        </div>
                    </div>
                );

            case 'settings':
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
                                    <h2 className="text-2xl font-bold text-gray-800">{getDoctorFullName()}</h2>
                                    <p className="text-gray-500">{doctorDetails ? doctorDetails.specialization || 'Doctor' : 'Doctor'}</p>
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

            // Add more cases for other tabs as needed...
            
            default:
                return <div>Select a tab</div>;
        }
    };

    // Update appointment status with better error handling
    const updateAppointmentStatus = async (appointmentId, status) => {
        if (!appointmentId) {
            toast.error("Cannot update: Missing appointment ID");
            return;
        }
        
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ status })
            });
            
            if (response.status === 401) {
                toast.error('Authentication error - please try logging in again');
                // Don't force logout immediately, allow user to see error
                setTimeout(() => {
                    logout();
                }, 3000);
                return;
            }
            
            // Check for successful response status
            if (!response.ok) {
                toast.error(`Server error: ${response.status} ${response.statusText}`);
                setIsLoading(false);
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                toast.success(`Appointment ${status} successfully`);
                
                // Find the appointment to include details in the notification message
                const appointment = appointments.find(apt => apt._id === appointmentId);
                if (appointment && status === 'cancelled') {
                    toast.info(`A notification has been sent to ${appointment.patientName} about the cancellation`);
                }
                
                fetchAppointments(); // Refresh appointments
                
                // Also refresh time slots if the appointment was cancelled
                if (status === 'cancelled') {
                    fetchTimeSlots();
                }
            } else {
                toast.error(data.message || `Failed to ${status} appointment`);
            }
        } catch (error) {
            toast.error(`Error ${status} appointment: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // View appointment details
    const viewAppointmentDetails = (appointment) => {
        if (!appointment) {
            toast.error("Appointment details not available");
            return;
        }
        
        // Format appointment details for display
        const details = [
            `Patient Name: ${appointment.patientName}`,
            `Patient Email: ${appointment.patientEmail}`,
            `Patient Phone: ${appointment.patientPhone}`,
            `Date: ${appointment.appointmentDate}`,
            `Time: ${appointment.appointmentTime}`,
            `Type: ${appointment.appointmentType ? appointment.appointmentType.charAt(0).toUpperCase() + appointment.appointmentType.slice(1) : "Not specified"}`,
            `Status: ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}`,
            `Reason for Visit: ${appointment.reason || "Not specified"}`,
            `Additional Notes: ${appointment.notes || "None provided"}`
        ].join("\n");
        
        alert(`Appointment Details:\n\n${details}`);
        
        // In a real application, this would be shown in a modal with more styling
    };

    useEffect(() => {
        // Fetch doctor appointments when doctor details are loaded
        if (doctorDetails?._id) {
            fetchAppointments();
        }
    }, [doctorDetails]);

    useEffect(() => {
        // Update real-time data when the active tab changes
        if (activeTab === 'appointments' && doctorDetails?._id) {
            fetchAppointments();
            
            // Set up an interval to refresh appointments data every 30 seconds
            const refreshInterval = setInterval(() => {
                if (activeTab === 'appointments') {
                    console.log('Auto-refreshing appointments data');
                    fetchAppointments();
                }
            }, 30000); // 30 seconds
            
            // Clean up the interval when component unmounts or tab changes
            return () => clearInterval(refreshInterval);
        } else if (activeTab === 'availability' && doctorDetails?._id) {
            fetchTimeSlots();
        }
    }, [activeTab, doctorDetails]);

    // Fetch full doctor profile after authentication is confirmed
    useEffect(() => {
        const fetchDoctorProfile = async () => {
            if (user && user.role === 'doctor' && user._id) {
                try {
                    setIsLoading(true);
                    setError(null);
                    
                    const response = await fetch(`${API_URL}/api/doctors/${user._id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include' // Include cookies for auth
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        if (data.success && data.doctor) {
                            // Merge auth user data with additional doctor profile data
                            setDoctorDetails({
                                ...user,
                                ...data.doctor,
                                profileImage: data.doctor.profileImage || user.profileImage
                            });
                        } else {
                            setError("Failed to load doctor profile data");
                            console.error("Failed to fetch doctor profile:", data.message);
                        }
                    } else {
                        if (response.status === 404) {
                            setError("Doctor profile not found. Please contact support.");
                        } else if (response.status === 401) {
                            setError("Authentication failed. Please log in again.");
                            // Redirect to login after a delay
                            setTimeout(() => {
                                navigate('/login');
                            }, 2000);
                        } else {
                            setError(`Server error: ${response.status} ${response.statusText}`);
                        }
                        console.error("Failed to fetch doctor profile:", response.status);
                    }
                } catch (error) {
                    setError("An error occurred while loading your profile");
                    console.error("Error fetching doctor profile:", error);
                } finally {
                    setIsLoading(false);
                }
            } else if (user && user.role !== 'doctor') {
                // If user is not a doctor, redirect to appropriate dashboard
                toast.error("You don't have permission to access the doctor dashboard");
                setTimeout(() => {
                    navigate(user.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard');
                }, 1000);
            }
        };
        
        fetchDoctorProfile();
    }, [user, API_URL, navigate]);

    return (
        <div className="flex h-full pt-20 bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg">

                <div className="p-4">
                    <div className="flex items-center gap-3 mb-6">
                        <img 
                            src={getProfileImage()} 
                            alt="Doctor" 
                            className="w-12 h-12 rounded-full border-2 border-[#007E85] object-cover" 
                        />
                        <div>
                            <h3 className="font-bold text-gray-800">{getDoctorFullName()}</h3>
                            <p className="text-sm text-gray-500">{doctorDetails ? doctorDetails.specialization || 'Doctor' : 'Doctor'}</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {sidebarLinks.map(link => (
                            <button
                                key={link.id}
                                onClick={() => setActiveTab(link.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                    activeTab === link.id 
                                    ? 'bg-[#007E85] text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </button>
                        ))}
                        <button
                            onClick={handleLogout} 
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-500 hover:bg-red-50"
                        >
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {/* Top Navigation */}
                <div className="bg-white shadow-sm">
                    <div className="flex justify-between items-center px-8 py-4">
                        <h1 className="text-xl font-bold text-gray-800">
                            {activeTab === 'overview' ? 'Dashboard Overview' : 
                             activeTab === 'appointments' ? 'My Appointments' :
                             activeTab === 'patients' ? 'My Patients' :
                             activeTab === 'availability' ? 'Manage Availability' :
                             activeTab === 'payments' ? 'Payment History' :
                             activeTab === 'messages' ? 'Messages' :
                             activeTab === 'records' ? 'Medical Records' :
                             activeTab === 'settings' ? 'Account Settings' : 'Dashboard'}
                        </h1>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-500 hover:text-[#007E85] transition-colors">
                                <FaBell className="text-xl" />
                                <span className="absolute -top-1 -right-1 bg-[#6EAB36] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">0</span>
                            </button> 
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-8">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;

