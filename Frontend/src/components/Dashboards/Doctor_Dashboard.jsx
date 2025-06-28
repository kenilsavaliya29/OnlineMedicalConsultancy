import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { FaCalendarCheck, FaUsers, FaWallet, FaComments, FaCog, FaChartBar, FaSignOutAlt, FaBell, FaClipboardList, FaClock, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../../contexts/authContext.jsx';
import { useNavigate } from 'react-router-dom';
import MessageBox from '../common/MessageBox.jsx';

import OverviewTab from './DocSideBar/OverviewTab.jsx';
import AppointmentsTab from './DocSideBar/AppointmentsTab.jsx';
import AvailabilityTab from './DocSideBar/AvailabilityTab.jsx';
import PatientsTab from './DocSideBar/PatientsTab.jsx';
import PaymentsTab from './DocSideBar/PaymentsTab.jsx';
import MessagesTab from './DocSideBar/MessagesTab.jsx';
import RecordsTab from './DocSideBar/RecordsTab.jsx';
import SettingsTab from './DocSideBar/SettingsTab.jsx';
import ReviewsSection from './DocSideBar/ReviewsSection.jsx';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const DoctorDashboard = () => {
    const { user, logout } = useContext(AuthContext);

    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState()
    const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
    const [messageBox, setMessageBox] = useState({ show: false, type: '', message: '' });

    const notificationsRef = useRef(null);
    const sidebarRef = useRef(null);
    const logoutModalRef = useRef(null);

    console.log(user)

    const showMessage = (type, message) => {
        setMessageBox({ show: true, type, message });
    };

    const closeMessageBox = () => {
        setMessageBox({ show: false, type: '', message: '' });
    };


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


    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    const closeSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);


    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    useEffect(() => {
        if (!user) {
            const timer = setTimeout(() => {
                showMessage('error', "Please log in to access the doctor dashboard");
                window.location.href = '/login';
            }, 500);
            return () => clearTimeout(timer);
        } else if (user.role !== 'doctor') {
            const timer = setTimeout(() => {
                showMessage('error', "You don't have permission to access the doctor dashboard. Redirecting...");
                if (user.role === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/patient/dashboard';
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [user, navigate]);

    const handleLogout = useCallback(async () => {
        try {
            const result = await logout();
            if (result.success) {
                showMessage('success', "Logged out successfully");
            } else {
                showMessage('error', result.message || "Failed to logout");
            }
        } catch (error) {
            showMessage('error', "An error occurred during logout");
        }
    }, [logout]);

    const openLogoutModal = useCallback(() => {
        setIsLogoutModalOpen(true);
    }, []);

    const closeLogoutModal = useCallback(() => {
        setIsLogoutModalOpen(false);
    }, []);

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

    const renderTabContent = useCallback(() => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab />;
            case 'appointments':
                return <AppointmentsTab />;
            case 'patients':
                return <PatientsTab />;
            case 'availability':
                return <AvailabilityTab />;
            case 'payments':
                return <PaymentsTab />;
            case 'messages':
                return <MessagesTab />;
            case 'records':
                return <RecordsTab />;
            case 'settings':
                return <SettingsTab />;
            default:
                return <div>Select a tab</div>;
        }
    }, [activeTab]);

    return (
        <>
            {messageBox.show && (
                <MessageBox
                    type={messageBox.type}
                    message={messageBox.message}
                    onClose={closeMessageBox}
                />
            )}
            <div className="flex bg-gray-50 relative mt-24">
                {/* Background Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden transition-opacity duration-300"
                        onClick={closeSidebar}>

                    </div>
                )}

                {/* Sidebar */}
                <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transition-transform transform duration-500 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 z-50' : '-translate-x-full z-auto'}`} ref={sidebarRef}> {/* Conditional z-index */}
                    <div className="p-4 h-full overflow-y-auto">

                        <div className="flex justify-between items-center mb-6 lg:hidden">

                        </div>

                        {/* Doctor Profile Summary in Sidebar */}
                        <div className="flex items-center gap-3 mb-6">
                            <img
                                src={`${API_URL}${user.profileImage.startsWith('/') ? '' : '/'}${user.profileImage}`}
                                alt="Doctor"
                                className="w-12 h-12 rounded-full border-2 border-[#007E85] object-cover"
                            />
                            <div>
                                <h3 className="font-bold text-gray-800 capitalize">{user.fullName || "Doctor"}</h3>
                                <p className="text-sm text-gray-500">{user.profile.specialization}</p>
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
            <ReviewsSection />

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