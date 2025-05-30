import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUserMd, FaCalendarCheck, FaFileMedical, FaWallet, FaComments, FaCog, FaChartLine, FaSignOutAlt, FaBell, FaUser, FaHeartbeat, FaNotesMedical, FaUserCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaKey, FaStar, FaDownload, FaSyncAlt, FaAppleAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { AuthContext } from '../../contexts/authContext.jsx'

import OverViewTab from './PatientSideBar/OverViewTab.jsx'
import AppoinmentsTab from './PatientSideBar/AppoinmentsTab.jsx'
import RecordsTab from './PatientSideBar/RecordsTab.jsx'
import PrescriptionsTab from './PatientSideBar/PrescriptionsTab.jsx'
import HealthTab from './PatientSideBar/HealthTab.jsx'
import MessagesTab from './PatientSideBar/MessagesTab.jsx'
import SettingsTab from './PatientSideBar/SettingsTab.jsx'
import MyDoctorTab from './PatientSideBar/MyDoctorTab.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const Patient_Dashboard = () => {

  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('overview')
  const [patientDetails, setPatientDetails] = useState(null)

  // Check if user is logged in and is a patient
  useEffect(() => {
    if (user && user.role === 'patient') {
      setPatientDetails(user)
    } else if (user && user.role !== 'patient') {

      const timer = setTimeout(() => {
        toast.error("You don't have permission to access the patient dashboard. Redirecting...")

        if (user.role === 'doctor') {
          window.location.href = '/doctor/dashboard'
        } else if (user.role === 'admin') {
          window.location.href = '/admin/dashboard'
        }
      }, 500) // Small delay to avoid toast during normal navigation

      return () => clearTimeout(timer)
    } else {

      const timer = setTimeout(() => {
        toast.error("Please log in to access the patient dashboard")
        window.location.href = '/login'
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [user])


  const handleChatRedirect = useCallback(() => {
    setActiveTab('messages');
  }, [setActiveTab]);

  const handleLogout = useCallback(async () => {
    try {
      const result = await logout()
      if (result.success) {
        toast.success("Logged out successfully")
        // Redirect will be handled by AuthContext/ProtectedRoute
      } else {
        toast.error(result.message || "Failed to logout")
      }
    } catch (error) {
      toast.error("An error occurred during logout")
    }
  }, [logout])

  const sidebarLinks = useMemo(() => [
    { id: 'overview', name: 'Overview', icon: <FaChartLine /> },
    { id: 'appointments', name: 'My Appointments', icon: <FaCalendarCheck /> },
    { id: 'doctors', name: 'My Doctors', icon: <FaUserMd /> },
    { id: 'records', name: 'Medical Records', icon: <FaFileMedical /> },
    { id: 'prescriptions', name: 'Prescriptions', icon: <FaNotesMedical /> },
    { id: 'health', name: 'Health Metrics', icon: <FaHeartbeat /> },
    { id: 'wellness', name: 'Wellness Program', icon: <FaAppleAlt /> },
    { id: 'payments', name: 'Bills & Payments', icon: <FaWallet /> },
    { id: 'messages', name: 'Messages', icon: <FaComments /> },
    { id: 'settings', name: 'Settings', icon: <FaCog /> },
  ], [])

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
        return <OverViewTab patientDetails={patientDetails} />

      case 'appointments':
        return <AppoinmentsTab patientDetails={patientDetails} />

      case 'records':
        return <RecordsTab patientDetails={patientDetails} />

      case 'prescriptions':
        return <PrescriptionsTab patientDetails={patientDetails} />

      case 'health':
        return <HealthTab />

      case 'messages':
        return <MessagesTab />

      case 'settings':
        return <SettingsTab patientDetails={patientDetails} setPatientDetails={setPatientDetails} handleLogout={handleLogout} />

      case 'doctors':
        return <MyDoctorTab />

      default:
        return <div>Select a tab from the sidebar</div>;
    }
  }, [activeTab, patientDetails, handleLogout])

  return (
    <div className="flex h-full pt-20 bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
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
                  activeTab === 'doctors' ? 'My Doctors' :
                    activeTab === 'records' ? 'Medical Records' :
                      activeTab === 'prescriptions' ? 'Prescriptions' :
                        activeTab === 'health' ? 'Health Metrics' :
                          activeTab === 'wellness' ? 'Wellness Program' :
                            activeTab === 'payments' ? 'Bills & Payments' :
                              activeTab === 'messages' ? 'Messages' :
                                activeTab === 'settings' ? 'Account Settings' : 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleChatRedirect}
                className="px-4 py-2 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors flex items-center gap-2"
              >
                <FaComments />
                Chat with Doctor
              </button>
              <button className="relative p-2 text-gray-500 hover:text-[#007E85] transition-colors">
                <FaBell className="text-xl" />
                <span className="absolute -top-1 -right-1 bg-[#6EAB36] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">2</span>
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
  )
}

export default Patient_Dashboard
