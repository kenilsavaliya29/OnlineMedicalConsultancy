import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { FaUserMd, FaCalendarCheck, FaUsers, FaWallet, FaComments, FaCog, FaChartBar, FaSignOutAlt, FaBell, FaSearch, FaClipboardList, FaUserCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEllipsisV, FaVideo, FaPaperclip, FaPaperPlane, FaKey, FaStar, FaClock, FaCalendarAlt, FaPlus, FaTrash, FaTimes, FaInfo, FaSyncAlt, FaRegClock, FaLock, FaBars } from 'react-icons/fa';
import { AuthContext } from '../../contexts/authContext.jsx';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Import refactored tab components
import OverviewTab from './DocSideBar/OverviewTab.jsx';
import AppointmentsTab from './DocSideBar/AppoinmentsTab.jsx';
import AvailabilityTab from './DocSideBar/AvailabilityTab.jsx';
import PatientsTab from './DocSideBar/PatientsTab.jsx';
import PaymentsTab from './DocSideBar/PaymentsTab.jsx';
import MessagesTab from './DocSideBar/MessagesTab.jsx';
import RecordsTab from './DocSideBar/RecordsTab.jsx';
import SettingsTab from './DocSideBar/SettingsTab.jsx';
import ReviewsSection from './DocSideBar/ReviewsSection.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);

    console.log(user)
    const [timeSlots, setTimeSlots] = useState({});
    const [doctorDetails, setDoctorDetails] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState('Mon');
    const [newSlot, setNewSlot] = useState({ startTime: '09:00', endTime: '09:30' });
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [error, setError] = useState(null);
    const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const navigate = useNavigate();


    // Ref for the notifications container to detect outside clicks
    const notificationsRef = useRef(null);

    const sidebarRef = useRef(null);
    const logoutModalRef = useRef(null);

    // Memoize sidebar links to prevent recreation on every render
    const sidebarLinks = useMemo(() => [
        { id: 'overview', name: 'Overview', icon: <FaChartBar /> },
        { id: 'appointments', name: 'Appointments', icon: <FaCalendarCheck /> },
        { id: 'patients', name: 'My Patients', icon: <FaUsers /> },
        { id: 'availability', name: 'My Availability', icon: <FaClock /> },
        { id: 'payments', name: 'Payments', icon: <FaWallet /> },
        { id: 'messages', name: 'Messages', icon: <FaComments /> },
        { id: 'records', name: 'Medical Records', icon: <FaClipboardList /> },
        { id: 'settings', name: 'Settings', icon: <FaCog /> },
    ], []);

    // Memoize specialization
    const specialization = useMemo(() => {
        return doctorDetails?.profile?.specialization || 'Doctor';
    }, [doctorDetails?.profile?.specialization]);

    // Memoize active tab title
    const activeTabTitle = useMemo(() => {
        const titles = {
            'overview': 'Dashboard Overview',
            'appointments': 'My Appointments',
            'patients': 'My Patients',
            'availability': 'Manage Availability',
            'payments': 'Payment History',
            'messages': 'Messages',
            'records': 'Medical Records',
            'settings': 'Account Settings'
        };
        return titles[activeTab] || 'Dashboard';
    }, [activeTab]);

    // Memoized toggle and close functions
    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    const closeSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    // Close sidebar on resize for larger screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // User permission check effect
    useEffect(() => {
        if (user && user.role === 'doctor') {
            setDoctorDetails(user);
        } else if (user && user.role !== 'doctor') {
            const timer = setTimeout(() => {
                toast.error("You don't have permission to access the doctor dashboard. Redirecting...");
                if (user.role === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/patient/dashboard';
                }
            }, 500);

            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                toast.error("Please log in to access the doctor dashboard");
                window.location.href = '/login';
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [user]);

    // Memoized fetch functions to prevent recreation
    const fetchAppointments = useCallback(async () => {
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
    }, [doctorDetails?._id, logout]);

    const fetchTimeSlots = useCallback(async () => {
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
                logout();
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
    }, [doctorDetails?._id, logout]);

    // Fetch doctor appointments when doctor details are loaded
    useEffect(() => {
        if (doctorDetails && doctorDetails._id) {
            fetchAppointments();
            fetchTimeSlots();
        }
    }, [doctorDetails?._id, fetchAppointments, fetchTimeSlots]);

    // Memoized time slot handlers
    const handleAddTimeSlot = useCallback(async () => {
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
                logout();
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
    }, [newSlot, selectedDay, doctorDetails?._id, fetchTimeSlots, logout]);

    const handleDeleteTimeSlot = useCallback(async (slotId) => {
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
                logout();
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
    }, [fetchTimeSlots, logout]);

    const handleLogout = useCallback(async () => {
        try {
            const result = await logout();
            if (result.success) {
                toast.success("Logged out successfully");
            } else {
                toast.error(result.message || "Failed to logout");
            }
        } catch (error) {
            toast.error("An error occurred during logout");
        }
    }, [logout]);

    // Functions to open and close logout confirmation modal
    const openLogoutModal = useCallback(() => {
        setIsLogoutModalOpen(true);
    }, []);

    const closeLogoutModal = useCallback(() => {
        setIsLogoutModalOpen(false);
    }, []);

    const updateAppointmentStatus = useCallback(async (appointmentId, status) => {
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
                toast.success(`Appointment ${status} successfully`);

                const appointment = appointments.find(apt => apt._id === appointmentId);
                if (appointment && status === 'cancelled') {
                    toast.info(`A notification has been sent to ${appointment.patientName} about the cancellation`);
                }

                fetchAppointments();

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
    }, [appointments, fetchAppointments, fetchTimeSlots, logout]);

    const viewAppointmentDetails = useCallback((appointment) => {
        if (!appointment) {
            toast.error("Appointment details not available");
            return;
        }

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
    }, []);

    // Memoized render functions
    const renderAppointmentInfo = useCallback(() => {
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
    }, []);

    // Memoized tab props to prevent unnecessary re-renders
    const tabProps = useMemo(() => ({
        overview: {
            doctorDetails,
            appointments,
            setActiveTab
        },
        appointments: {
            appointments,
            isLoading,
            fetchAppointments,
            updateAppointmentStatus,
            viewAppointmentDetails
        },
        patients: {
            appointments
        },
        availability: {
            renderAppointmentInfo,
            selectedDay,
            setSelectedDay,
            newSlot,
            setNewSlot,
            handleAddTimeSlot,
            isLoading,
            timeSlots,
            handleDeleteTimeSlot
        },
        messages: {
            isLoading,
            appointments,
            selectedAppointment,
            setSelectedAppointment
        },
        settings: {
            doctorDetails,
            handleLogout
        }
    }), [
        doctorDetails,
        appointments,
        isLoading,
        selectedDay,
        newSlot,
        timeSlots,
        selectedAppointment,
        fetchAppointments,
        updateAppointmentStatus,
        viewAppointmentDetails,
        renderAppointmentInfo,
        handleAddTimeSlot,
        handleDeleteTimeSlot,
        handleLogout
    ]);

    const renderTabContent = useCallback(() => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab {...tabProps.overview} />;
            case 'appointments':
                return <AppointmentsTab {...tabProps.appointments} />;
            case 'patients':
                return <PatientsTab {...tabProps.patients} />;
            case 'availability':
                return <AvailabilityTab {...tabProps.availability} />;
            case 'payments':
                return <PaymentsTab />;
            case 'messages':
                return <MessagesTab {...tabProps.messages} />;
            case 'records':
                return <RecordsTab />;
            case 'settings':
                return <SettingsTab {...tabProps.settings} />;
            default:
                return <div>Select a tab</div>;
        }
    }, [activeTab, tabProps]);

    // Tab change effect optimization
    useEffect(() => {
        if (activeTab === 'appointments' && doctorDetails?._id) {
            fetchAppointments();

            const refreshInterval = setInterval(() => {
                if (activeTab === 'appointments') {
                    console.log('Auto-refreshing appointments data');
                    fetchAppointments();
                }
            }, 30000);

            return () => clearInterval(refreshInterval);
        } else if (activeTab === 'availability' && doctorDetails?._id) {
            fetchTimeSlots();
        }
    }, [activeTab, doctorDetails?._id, fetchAppointments, fetchTimeSlots]);

    // Fetch full doctor profile effect
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
                        credentials: 'include'
                    });

                    if (response.ok) {
                        const data = await response.json();

                        if (data.success && data.doctor) {
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
                toast.error("You don't have permission to access the doctor dashboard");
                setTimeout(() => {
                    navigate(user.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard');
                }, 1000);
            }
        };

        fetchDoctorProfile();
    }, [user, navigate]);

    // Toggle notification modal visibility
    const toggleNotificationsModal = useCallback(() => {
        setIsNotificationsModalOpen(prev => !prev);
    }, []);

    // Close notification modal
    const closeNotificationsModal = useCallback(() => {
        setIsNotificationsModalOpen(false);
    }, []);

    // Close modal when clicking outside (for floating box)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close notifications modal if click is outside its container
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                closeNotificationsModal();
            }
            // Close logout modal if click is outside its container
            if (isLogoutModalOpen && logoutModalRef.current && !logoutModalRef.current.contains(event.target)) {
                closeLogoutModal();
            }
            // Close sidebar if click is outside the sidebar and sidebar toggle button
            // Need to check against both the sidebar element and the button that opens it
            // The button has class lg:hidden, so we only care about it on small screens
            const sidebarToggleButton = document.querySelector('button.lg\\:hidden');

            if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) &&
                (!sidebarToggleButton || !sidebarToggleButton.contains(event.target)) &&
                (!notificationsRef.current || !notificationsRef.current.contains(event.target)) && // Also ensure click isn't inside notification box
                (!logoutModalRef.current || !logoutModalRef.current.contains(event.target)) // Also ensure click isn't inside logout modal
            ) {
                closeSidebar();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closeNotificationsModal, closeSidebar, sidebarOpen, isLogoutModalOpen, closeLogoutModal]); // Add dependencies

    return (
        <>
            <div className="flex bg-gray-50 relative mt-24">
                {/* Background Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden transition-opacity duration-300"
                        onClick={closeSidebar}
                    ></div>
                )}

                {/* Sidebar */}
                <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transition-transform transform duration-500 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 z-50' : '-translate-x-full z-auto'}`} ref={sidebarRef}> {/* Conditional z-index */}
                    <div className="p-4 h-full overflow-y-auto">
                        {/* Sidebar Header with Toggle Button */}
                        <div className="flex justify-between items-center mb-6 lg:hidden">
                            {/* Removed h2 and close button */}
                            {/* Add branding or logo here if needed in mobile sidebar */}
                        </div>

                        {/* Doctor Profile Summary in Sidebar */}
                        <div className="flex items-center gap-3 mb-6">
                            <img
                                src={doctorDetails?.profileImage ? `${API_URL}${doctorDetails.profileImage.startsWith('/') ? '' : '/'}${doctorDetails.profileImage}` : "https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg"}
                                alt="Doctor"
                                className="w-12 h-12 rounded-full border-2 border-[#007E85] object-cover"
                            />
                            <div>
                                <h3 className="font-bold text-gray-800 capitalize">{doctorDetails?.fullName || "Doctor"}</h3>
                                <p className="text-sm text-gray-500">{specialization}</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {sidebarLinks.map(link => (
                                <button
                                    key={link.id}
                                    onClick={() => {
                                        setActiveTab(link.id);
                                        closeSidebar();
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === link.id
                                        ? 'bg-[#007E85] text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {link.icon}
                                    <span>{link.name}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    openLogoutModal();
                                    closeSidebar();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-500 hover:bg-red-50"
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content Wrapper */}
                <div className="flex-1 overflow-auto transition-all duration-300">
                    {/* Top Navigation */}
                    <div className="bg-white shadow-sm sticky top-0 z-30 lg:left-64 transition-all duration-300">
                        <div className="flex justify-between items-center px-4 lg:px-8 py-4 mx-6">
                            {/* Mobile sidebar toggle button */}
                            <button onClick={toggleSidebar} className="lg:hidden z-20 cursor-pointer relative flex items-center gap-2">
                                <img src="/assets/images/sidebar.svg" alt="Sidebar Toggle" className="w-6 h-6" />
                                <span className='text-gray-500 hover:text-[#007E85] transition-colors'>Sidebar</span>
                            </button>
                            <h1 className="text-xl font-bold text-gray-800">
                                {activeTabTitle}
                            </h1>
                            <div className="flex items-center gap-4">
                                {/* Container for notification button and floating box */}
                                <div className="relative" ref={notificationsRef}>
                                    <button 
                                        className="relative p-2 text-gray-500 hover:text-[#007E85] transition-colors"
                                        onClick={toggleNotificationsModal}
                                    >
                                        <FaBell className="text-xl" />
                                        <span className="absolute -top-1 -right-1 bg-[#6EAB36] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">0</span>
                                    </button>

                                    {/* Floating Notifications Box */}
                                    {isNotificationsModalOpen && (
                                        <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 transition-all duration-200 origin-top-right">
                                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                <div className="flex justify-between items-center px-4 py-2">
                                                    <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                                                    <button onClick={closeNotificationsModal} className="text-gray-400 hover:text-gray-600">
                                                        <FaTimes className="text-lg" />
                                                    </button>
                                                </div>
                                                <div className="border-t border-gray-100"></div> {/* Separator */}
                                                {/* Placeholder for notifications list */}
                                                <div className="p-4 text-sm text-gray-600">
                                                    <p>No new notifications.</p> {/* Placeholder message */}
                                                    {/* Example notification item (replace with map over notifications data) */}
                                                    {/*
                                                    <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                        <p className="font-medium">New appointment booked!</p>
                                                        <p className="text-xs text-gray-500">2 hours ago</p>
                                                    </div>
                                                    */}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="p-4 lg:p-8 max:mt-16 lg:mt-0">
                        {renderTabContent()}
                    </div>
                </div>
            </div>

            {/* Patient Reviews Section */}
            <ReviewsSection isLoading={isLoading} doctorDetails={doctorDetails} />

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-sm mx-auto" ref={logoutModalRef}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeLogoutModal}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                No, Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DoctorDashboard;