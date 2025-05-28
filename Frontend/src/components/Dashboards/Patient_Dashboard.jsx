import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaUserMd, FaCalendarCheck, FaFileMedical, FaWallet, FaComments, FaCog, FaChartLine, FaSignOutAlt, FaBell, FaUser, FaHeartbeat, FaNotesMedical, FaUserCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaKey, FaStar, FaDownload, FaSyncAlt, FaAppleAlt } from 'react-icons/fa'
import { AuthContext } from '../../contexts/authContext.jsx'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const Patient_Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('overview')
  const [patientDetails, setPatientDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const [appointments, setAppointments] = useState([

  ])


  const [healthMetrics, setHealthMetrics] = useState({
    weight: "68 kg",
    bloodPressure: "120/80",
    heartRate: "72 bpm",
    temperature: "98.6°F"
  })

  const [medicalRecords, setMedicalRecords] = useState([])
  const [prescriptions, setPrescriptions] = useState([])

  // Check if user is logged in and is a patient
  useEffect(() => {
    if (user && user.role === 'patient') {
      setPatientDetails(user)
    } else if (user && user.role !== 'patient') {
      // Only show toast if we've been on this page for a moment (not during initial navigation)
      const timer = setTimeout(() => {
        toast.error("You don't have permission to access the patient dashboard. Redirecting...")
        // Redirect based on role
        if (user.role === 'doctor') {
          window.location.href = '/doctor/dashboard'
        } else if (user.role === 'admin') {
          window.location.href = '/admin/dashboard'
        }
      }, 500) // Small delay to avoid toast during normal navigation

      return () => clearTimeout(timer)
    } else {
      // Only show toast if we've been on this page for a moment (not during initial navigation)
      const timer = setTimeout(() => {
        toast.error("Please log in to access the patient dashboard")
        window.location.href = '/login'
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [user])

  // Fetch patient appointments
  useEffect(() => {
    if (patientDetails && patientDetails._id) {
      fetchAppointments()
    }
  }, [patientDetails])

  const fetchAppointments = async () => {
    if (!patientDetails?._id) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/appointments/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (response.status === 401) {
        toast.error('Your session has expired. Please log in again.')
        setTimeout(() => {
          logout()
        }, 3000)
        return
      }

      if (!response.ok) {
        toast.error(`Server error: ${response.status} ${response.statusText}`)
        setIsLoading(false)
        return
      }

      const data = await response.json()

      if (data.success) {
        setAppointments(data.appointments || [])
      } else {
        toast.error(`Failed to fetch appointments: ${data.message}`)
      }
    } catch (error) {
      toast.error(`Error fetching appointments: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch patient's medical records
  const fetchMedicalRecords = async () => {
    if (!patientDetails?._id) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/medical-records/patient/${patientDetails._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (response.status === 401) {
        toast.error('Your session has expired. Please log in again.')
        setTimeout(() => {
          logout()
        }, 3000)
        return
      }

      if (!response.ok) {
        toast.error(`Server error: ${response.status} ${response.statusText}`)
        setIsLoading(false)
        return
      }

      const data = await response.json()

      if (data.success) {
        setMedicalRecords(data.medicalRecords || [])
      } else {
        toast.error(`Failed to fetch medical records: ${data.message}`)
      }
    } catch (error) {
      toast.error(`Error fetching medical records: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch patient's prescriptions
  const fetchPrescriptions = async () => {
    if (!patientDetails?._id) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/prescriptions/patient/${patientDetails._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (response.status === 401) {
        toast.error('Your session has expired. Please log in again.')
        setTimeout(() => {
          logout()
        }, 3000)
        return
      }

      if (!response.ok) {
        toast.error(`Server error: ${response.status} ${response.statusText}`)
        setIsLoading(false)
        return
      }

      const data = await response.json()

      if (data.success) {
        setPrescriptions(data.prescriptions || [])
      } else {
        toast.error(`Failed to fetch prescriptions: ${data.message}`)
      }
    } catch (error) {
      toast.error(`Error fetching prescriptions: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch all patient data when patient details are loaded
  useEffect(() => {
    if (patientDetails && patientDetails._id) {
      fetchAppointments()
      fetchMedicalRecords()
      fetchPrescriptions()
    }
  }, [patientDetails])

  // Update data when tab changes
  useEffect(() => {
    if (patientDetails?._id) {
      if (activeTab === 'appointments') {
        fetchAppointments()
      } else if (activeTab === 'records') {
        fetchMedicalRecords()
      } else if (activeTab === 'prescriptions') {
        fetchPrescriptions()
      }
    }
  }, [activeTab])

  // Helper functions
  const getPatientFullName = () => {
    if (!patientDetails) return "Patient"
    return `${patientDetails.firstname || ''} ${patientDetails.lastname || ''}`
  }

  const getProfileImage = () => {
    if (patientDetails && patientDetails.profileImage) {
      return `${API_URL}${patientDetails.profileImage}`
    }
    return "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=740&t=st=1693113479~exp=1693114079~hmac=740079bac9709276b095b4d1410b49850d0d9b1c27e95efcad33ad86ce483e26"
  }

  const handleDownload = (fileType, fileName) => {
    // This is a placeholder function - in real implementation, 
    // it would trigger the actual file download from backend
  }

  const handleChatRedirect = () => {
    navigate('/chat')
  }

  const handleLogout = async () => {
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
  }

  const sidebarLinks = [
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
  ]

  // Add navigation handler for wellness program
  const handleNavigation = (tabId) => {
    if (tabId === 'wellness') {
      navigate('/patient/wellness');
    } else {
      setActiveTab(tabId);
    }
  }

  // Render content for different tabs
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
                    <h3 className="text-2xl font-bold text-gray-800">{appointments.length || 0}</h3>
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
                    <h3 className="text-2xl font-bold text-gray-800">85</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Health and Appointments Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Health Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(healthMetrics).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-lg font-semibold text-[#007E85]">{value}</p>
                    </div>
                  ))}
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
                {patientDetails ? (
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={getProfileImage()}
                        alt="Patient Profile"
                        className="w-20 h-20 rounded-full border-2 border-[#007E85] object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold">{getPatientFullName()}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FaEnvelope className="mr-1" />
                          <span>{patientDetails.email}</span>
                        </div>
                        {patientDetails.phone && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <FaPhone className="mr-1" />
                            <span>{patientDetails.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Date of Birth</h4>
                        <p>{patientDetails.dob || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Gender</h4>
                        <p>{patientDetails.gender || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Blood Type</h4>
                        <p>{patientDetails.bloodType || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Allergies</h4>
                        <p>{patientDetails.allergies || 'None reported'}</p>
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

      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Appointments</h2>
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
                <p className="text-gray-400 text-sm">Schedule your first appointment to get started</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map(appointment => (
                      <tr key={appointment.id || appointment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={
                                  appointment.doctorId?.profileImage
                                    ? `${API_URL}${appointment.doctorId.profileImage}`
                                    : "https://randomuser.me/api/portraits/men/85.jpg"
                                }
                                alt="Doctor"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.doctorId?.name || appointment.doctor || appointment.doctorName || "Unknown Doctor"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.doctorId?.specialization || appointment.specialization || "General Physician"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.appointmentDate || appointment.date}</div>
                          <div className="text-sm text-gray-500">{appointment.appointmentTime || appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${appointment.appointmentType === 'chat' ? 'bg-blue-100 text-blue-800' :
                              appointment.appointmentType === 'video' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'}`}>
                            {appointment.appointmentType === 'inperson' ? 'In Person' :
                              (appointment.appointmentType || "In Person").charAt(0).toUpperCase() +
                              (appointment.appointmentType || "In Person").slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              appointment.status === 'confirmed' || appointment.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                                appointment.status === 'completed' || appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {(appointment.status === 'pending' || appointment.status === 'confirmed' || appointment.status === 'Upcoming') && (
                              <button
                                onClick={() => cancelAppointment(appointment._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => viewAppointmentDetails(appointment._id)}
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

      case 'records':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Medical Records</h2>
              <button
                onClick={fetchMedicalRecords}
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
            ) : medicalRecords.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center">
                <FaFileMedical className="text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No medical records found</p>
                <p className="text-gray-400 text-sm">Your medical records will appear here once your doctor uploads them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medicalRecords.map(record => (
                  <div key={record._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${record.recordType === 'lab_result' ? 'bg-blue-100 text-blue-600' :
                        record.recordType === 'imaging' ? 'bg-purple-100 text-purple-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                        <FaFileMedical className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{record.title}</p>
                        <p className="text-sm text-gray-600">
                          {record.description || 'No description provided'}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-gray-500">
                            Date: {new Date(record.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs flex items-center">
                            <FaUserMd className="mr-1 text-gray-400" />
                            {record.doctorId?.name || 'Unknown Doctor'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(record.recordType, record.title)}
                      className="w-10 h-10 flex items-center justify-center bg-[#007E85] text-white rounded-full hover:bg-[#006b6f] transition-colors"
                      disabled={!record.fileUrl}
                      title={record.fileUrl ? "Download" : "No file available"}
                    >
                      <FaDownload className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'prescriptions':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Prescriptions</h2>
              <button
                onClick={fetchPrescriptions}
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
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center">
                <FaNotesMedical className="text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No prescriptions found</p>
                <p className="text-gray-400 text-sm">Your prescriptions will appear here after a doctor's visit</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map(prescription => (
                  <div key={prescription._id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{prescription.diagnosis}</h3>
                        <p className="text-sm text-gray-600">
                          Issued: {new Date(prescription.issueDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm flex items-center mt-1">
                          <FaUserMd className="mr-1 text-gray-400" />
                          {prescription.doctorId?.name || 'Unknown Doctor'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                        prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="font-medium mb-2">Medications:</p>
                      <ul className="space-y-2">
                        {prescription.medications.map((med, idx) => (
                          <li key={idx} className="border-b border-gray-100 pb-2 last:border-b-0">
                            <div className="flex justify-between">
                              <span className="font-medium">{med.name}</span>
                              <span className="text-sm">{med.dosage}</span>
                            </div>
                            <p className="text-sm text-gray-600">{med.frequency} for {med.duration}</p>
                            {med.instructions && (
                              <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {prescription.notes && (
                      <div className="mt-3 text-sm">
                        <p><span className="font-medium">Notes:</span> {prescription.notes}</p>
                      </div>
                    )}

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleDownload('pdf', `prescription_${prescription._id}.pdf`)}
                        className="flex items-center gap-1 text-sm bg-[#007E85] text-white px-3 py-1 rounded-md hover:bg-[#006b6f] transition-colors"
                        disabled={!prescription.fileUrl}
                      >
                        <FaDownload className="h-3 w-3" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'health':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Health Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(healthMetrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-6 rounded-xl">
                    <p className="text-gray-600 capitalize mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-2xl font-semibold text-[#007E85]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Health History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-lg text-[#007E85] mb-2">Weight Tracking</h3>
                  <p className="text-gray-600 mb-4">Track your weight over time to monitor progress</p>
                  <button className="bg-[#007E85] text-white px-4 py-2 rounded-lg hover:bg-[#006b6f] transition-colors">
                    View History
                  </button>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-lg text-[#007E85] mb-2">Blood Pressure Log</h3>
                  <p className="text-gray-600 mb-4">Monitor your blood pressure readings</p>
                  <button className="bg-[#007E85] text-white px-4 py-2 rounded-lg hover:bg-[#006b6f] transition-colors">
                    View History
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Chat with Doctors</h2>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh]">
              {/* Appointment List Sidebar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold">Your Appointments</h3>
                  <p className="text-sm text-gray-500">Select to chat</p>
                </div>

                <div className="overflow-y-auto h-[calc(70vh-4rem)]">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#007E85]"></div>
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No appointments found at all</p>
                    </div>
                  ) : appointments.filter(apt => apt.status !== 'cancelled').length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No active appointments available</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {appointments
                        .filter(apt => apt.status !== 'cancelled') // Show all except cancelled appointments
                        .map(appointment => (
                          <div
                            key={appointment._id || appointment.id}
                            onClick={(e) => {
                              e.preventDefault(); // Prevent default button behavior
                              setSelectedAppointment(appointment);
                            }}
                            className={`w-full text-left p-4 transition-colors hover:bg-gray-50 cursor-pointer ${selectedAppointment?._id === appointment._id ? 'bg-[#007E85]/5 border-l-4 border-[#007E85]' : ''
                              }`}
                          >
                            <p className="font-medium truncate">
                              {appointment.doctorId?.name || appointment.doctor || appointment.doctorName || "Doctor"}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-sm text-gray-500 truncate">
                                {appointment.appointmentDate || appointment.date},
                                {appointment.appointmentTime || appointment.time}
                              </p>
                              <span className={`px-2 py-1 text-xs rounded-full ${appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                                }`}>
                                {appointment.status === 'confirmed' ? 'Chat Available' : 'Pending'}
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
                {/* Chat Interface content will be handled here */}
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
                  alt="Patient Profile"
                  className="w-24 h-24 rounded-full border-4 border-[#007E85] object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{getPatientFullName()}</h2>
                  <p className="text-gray-500">Patient</p>
                  <p className="text-sm text-gray-500 mt-1">
                    <FaEnvelope className="inline mr-2" />
                    {patientDetails ? patientDetails.email : 'Loading...'}
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
                    <FaUser className="text-2xl text-[#007E85]" />
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

      default:
        return <div>Select a tab from the sidebar</div>;
    }
  }

  // Cancel an appointment
  const cancelAppointment = async (appointmentId) => {
    if (!appointmentId) {
      console.error("No appointment ID provided")
      toast.error("Cannot cancel: Missing appointment ID")
      return
    }

    // Confirmation before canceling
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (response.status === 401) {
        console.error('Authentication error: Not authorized to access this resource')
        toast.error('Authentication error - please try logging in again')
        setTimeout(() => {
          logout()
        }, 3000)
        return
      }

      const data = await response.json()

      if (data.success) {
        toast.success("Appointment canceled successfully. This will be reflected in your appointments list.")

        // Find the canceled appointment to include in notification
        const appointment = appointments.find(apt => apt._id === appointmentId || apt.id === appointmentId)
        if (appointment) {
          const doctorName = appointment.doctorId?.name || appointment.doctor || appointment.doctorName || "your doctor"
          const date = appointment.appointmentDate || appointment.date
          const time = appointment.appointmentTime || appointment.time

          // More comprehensive notification
          toast.info(
            `Your appointment with ${doctorName} on ${date} at ${time} has been canceled. You can book a new appointment anytime.`,
            { autoClose: 6000 }
          )
        }

        fetchAppointments() // Refresh appointments
      } else {
        console.error("Failed to cancel appointment:", data.message)
        toast.error(data.message || "Failed to cancel appointment")
      }
    } catch (error) {
      console.error("Error canceling appointment:", error)
      toast.error(`Error: ${error.message || "Could not cancel appointment"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // View appointment details
  const viewAppointmentDetails = (appointmentId) => {
    // Find the appointment in the list
    const appointment = appointments.find(apt => apt._id === appointmentId || apt.id === appointmentId)

    if (!appointment) {
      toast.error("Appointment not found")
      return
    }

    // Format appointment details for display - expanded with more patient information
    const details = [
      `Doctor: ${appointment.doctorId?.name || appointment.doctor || appointment.doctorName}`,
      `Specialization: ${appointment.doctorId?.specialization || appointment.specialization || "Not specified"}`,
      `Date: ${appointment.appointmentDate || appointment.date}`,
      `Time: ${appointment.appointmentTime || appointment.time}`,
      `Type: ${appointment.appointmentType ? appointment.appointmentType.charAt(0).toUpperCase() + appointment.appointmentType.slice(1) : "In-person"}`,
      `Status: ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}`,
      `Reason for Visit: ${appointment.reason || "Not specified"}`,
      `Additional Notes: ${appointment.notes || "None provided"}`,
      `Patient Name: ${appointment.patientName || patientDetails?.firstname + " " + patientDetails?.lastname}`,
      `Patient Email: ${appointment.patientEmail || patientDetails?.email}`,
      `Patient Phone: ${appointment.patientPhone || patientDetails?.phone || "Not specified"}`
    ].join("\n")

    alert(`Appointment Details:\n\n${details}`)

    // In a real application, you would show this in a modal or navigate to a details page
    // This is just a simple implementation for demonstration purposes
  }

  return (
    <div className="flex h-full pt-20 bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={getProfileImage()}
              alt="Patient"
              className="w-12 h-12 rounded-full border-2 border-[#007E85] object-cover"
            />
            <div>
              <h3 className="font-bold text-gray-800">{getPatientFullName()}</h3>
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
