import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUserMd, FaCalendarCheck, FaFileMedical, FaWallet, FaComments, FaCog, FaChartLine, FaSignOutAlt, FaBell, FaHeartbeat, FaNotesMedical, FaUserCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaKey, FaStar, FaDownload, FaSyncAlt, FaAppleAlt, FaHospitalUser, FaTimes, FaBars } from 'react-icons/fa'
import { AuthContext } from '../../contexts/authContext.jsx'

import OverViewTab from './PatientSideBar/OverViewTab.jsx'
import AppoinmentsTab from './PatientSideBar/AppoinmentsTab.jsx'
import RecordsTab from './PatientSideBar/RecordsTab.jsx'
import PrescriptionsTab from './PatientSideBar/PrescriptionsTab.jsx'
import HealthTab from './PatientSideBar/HealthTab.jsx'
import MessagesTab from './PatientSideBar/MessagesTab.jsx'
import SettingsTab from './PatientSideBar/SettingsTab.jsx'
import MyDoctorTab from './PatientSideBar/MyDoctorTab.jsx'
import MedicalProfileTab from './PatientSideBar/MedicalProfileTab.jsx'
import MessageBox from '../common/MessageBox.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const Patient_Dashboard = () => {

  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null)
  const [isBasicProfileComplete, setIsBasicProfileComplete] = useState(true); 
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [messageBox, setMessageBox] = useState({ show: false, type: '', message: '' });

  const showMessage = (type, message) => {
    setMessageBox({ show: true, type, message });
  };

  const closeMessageBox = () => {
    setMessageBox({ show: false, type: '', message: '' });
  };

  const sidebarRef = useRef(null);
  const notificationsRef = useRef(null); // Assuming patient dashboard will also have notifications
  const logoutModalRef = useRef(null);

  // Check if user is logged in and is a patient
  useEffect(() => {
    if (user && user.role === 'patient') {
      setPatientDetails(user)
    } else if (user && user.role !== 'patient') {

      const timer = setTimeout(() => {
        showMessage('error', "You don't have permission to access the patient dashboard. Redirecting...")

        if (user.role === 'doctor') {
          window.location.href = '/doctor/dashboard'
        } else if (user.role === 'admin') {
          window.location.href = '/admin/dashboard'
        }
      }, 500) // Small delay to avoid toast during normal navigation

      return () => clearTimeout(timer)
    } else {

      const timer = setTimeout(() => {
        showMessage('error', "Please log in to access the patient dashboard")
        window.location.href = '/login'
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [user, navigate]) // Removed API_URL from dependency array


  const handleChatRedirect = useCallback(() => {
    setActiveTab('messages');
  }, [setActiveTab]);

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

  // Toggle notification modal visibility
  const toggleNotificationsModal = useCallback(() => {
    setIsNotificationsModalOpen(prev => !prev);
  }, []);

  const closeNotificationsModal = useCallback(() => {
    setIsNotificationsModalOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const result = await logout()
      if (result.success) {
        showMessage('success', "Logged out successfully")
        // Redirect will be handled by AuthContext/ProtectedRoute
      } else {
        showMessage('error', result.message || "Failed to logout")
      }
    } catch (error) {
      showMessage('error', "An error occurred during logout")
    }
  }, [logout])

  // Functions to open and close logout confirmation modal
  const openLogoutModal = useCallback(() => {
    setIsLogoutModalOpen(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    setIsLogoutModalOpen(false);
  }, []);

  const sidebarLinks = useMemo(() => [
    { id: 'overview', name: 'Overview', icon: <FaChartLine /> },
    { id: 'appointments', name: 'My Appointments', icon: <FaCalendarCheck /> },
    { id: 'doctors', name: 'My Doctors', icon: <FaUserMd /> },
    { id: 'medical-profile', name: 'My Medical Profile', icon: <FaHospitalUser /> },
    { id: 'records', name: 'Medical Records', icon: <FaFileMedical /> },
    { id: 'prescriptions', name: 'Prescriptions', icon: <FaNotesMedical /> },
    { id: 'health', name: 'Health Metrics', icon: <FaHeartbeat /> },
    { id: 'wellness', name: 'Wellness Program', icon: <FaAppleAlt /> },
    { id: 'payments', name: 'Bills & Payments', icon: <FaWallet /> },
    { id: 'messages', name: 'Messages', icon: <FaComments /> },
    { id: 'settings', name: 'Account Settings', icon: <FaCog /> },
  ], [])

  // Memoize active tab title
  const activeTabTitle = useMemo(() => {
    const titles = {
      'overview': 'Dashboard Overview',
      'appointments': 'My Appointments',
      'doctors': 'My Doctors',
      'medical-profile': 'My Medical Profile',
      'records': 'Medical Records',
      'prescriptions': 'Prescriptions',
      'health': 'Health Metrics',
      'wellness': 'Wellness Program',
      'payments': 'Bills & Payments',
      'messages': 'Messages',
      'settings': 'Account Settings'
    };
    return titles[activeTab] || 'Dashboard';
  }, [activeTab]);

  // Add navigation handler for wellness program
  const handleNavigation = useCallback((tabId) => {
    if (tabId === 'wellness') {
      navigate('/patient/wellness');
    } else {
      setActiveTab(tabId);
    }
  }, [navigate])

  // Render content for different tabs
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'overview':
        return <OverViewTab />

      case 'appointments':
        return <AppoinmentsTab />

      case 'records':
        return <RecordsTab />

      case 'prescriptions':
        return <PrescriptionsTab  />

      case 'health':
        return <HealthTab />

      case 'messages':
        return <MessagesTab />

      case 'settings':
        return <SettingsTab patientDetails={patientDetails} setPatientDetails={setPatientDetails} handleLogout={handleLogout} />

      case 'doctors':
        return <MyDoctorTab />

      case 'medical-profile':
        return <MedicalProfileTab />

      default:
        return <div>Select a tab from the sidebar</div>;
    }
  }, [activeTab, patientDetails, handleLogout])

  // Close modal when clicking outside (for floating box)
  useEffect(() => {
    const handleClickOutside = (event) => {
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
            onClick={closeSidebar}
          ></div>
        )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transition-transform transform duration-500 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 z-50' : '-translate-x-full z-auto'}`} ref={sidebarRef}>
        <div className="p-4 h-full overflow-y-auto">
          {/* Sidebar Header with Toggle Button */}
          <div className="flex justify-between items-center mb-6 lg:hidden">
            {/* Removed h2 and close button */}
            {/* Add branding or logo here if needed in mobile sidebar */}
          </div>
          <div className="flex items-center gap-3 mb-6">
            <img
              src={patientDetails?.profileImage ? `${API_URL}${patientDetails.profileImage}` : "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=740&t=st=1693113479~exp=1693114079~hmac=740079bac9709276b095b4d1410b49850d0d9b1c27e95efcad33ad86ce483e26"}
              alt="Patient"
              className="w-12 h-12 rounded-full border-2 border-[#007E85] object-cover"
            />
            <div>
              <h3 className="font-bold text-gray-800 capitalize">{patientDetails?.fullName || "Patient"}</h3>
              <p className="text-sm text-gray-500">Patient</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavigation(link.id)}
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
              onClick={openLogoutModal}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-500 hover:bg-red-50"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto transition-all duration-300">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm sticky top-0 z-30 lg:left-64 transition-all duration-300">
          <div className="flex justify-between items-center px-4 lg:px-8 py-4">
            {/* Mobile sidebar toggle button */}
            <button onClick={toggleSidebar} className="lg:hidden z-20 cursor-pointer relative flex items-center gap-2">
              <img src="/assets/images/sidebar.svg" alt="Sidebar Toggle" className="w-6 h-6" />
              <span className='text-gray-500 hover:text-[#007E85] transition-colors'>Sidebar</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {activeTabTitle}
            </h1>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={handleChatRedirect}
                className="px-3 py-2 md:px-4 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors flex items-center gap-2 text-sm md:text-base"
              >
                <FaComments />
                <span className="hidden md:block">Chat with Doctor</span>
              </button>
              {/* Container for notification button and floating box */}
              <div className="relative" ref={notificationsRef}>
                <button
                  className="relative p-2 text-gray-500 hover:text-[#007E85] transition-colors"
                  onClick={toggleNotificationsModal}
                >
                  <FaBell className="text-xl" />
                  <span className="absolute -top-1 -right-1 bg-[#6EAB36] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">2</span>
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
    </div>
    </>
  )
}

export default Patient_Dashboard
