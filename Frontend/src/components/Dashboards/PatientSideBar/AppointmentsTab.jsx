import React, { useState, useEffect, useCallback, useContext } from 'react'
import { FaCalendarCheck, FaSyncAlt } from 'react-icons/fa'
import MessageBox from '../../common/MessageBox.jsx'
import { AuthContext } from '../../../contexts/authContext.jsx'

const API_URL = import.meta.env.BACKEND_URL || 'http://localhost:3000'

// Modal component for appointment details
const AppointmentDetailsModal = ({ appointment, onClose }) => {
    if (!appointment) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Appointment Details</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="font-semibold">Doctor Information</p>
                        <p>Name: {appointment.doctorId?.name || appointment.doctor || "Unknown Doctor"}</p>
                        <p>Specialization: {appointment.doctorId?.specialization || "Not specified"}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Appointment Information</p>
                        <p>Date: {new Date(appointment.dateTime).toLocaleDateString()}</p>
                        <p>Time: {new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p>Status: {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="font-semibold">Consultation Details</p>
                        <p>Reason for Visit: {appointment.reason || "Not specified"}</p>
                        <p>Additional Notes: {appointment.notes || "None provided"}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-[#007E85] text-white px-4 py-2 rounded hover:bg-[#006b6f]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const AppointmentsTab = React.memo(() => {
    const { user, logout } = useContext(AuthContext)
    const [appointments, setAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState(null)


    const fetchAppointments = useCallback(async () => {

        if (!user._id) {
            console.log("Patient details not available for appointment fetch");
            setIsLoading(false);
            return;
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
                MessageBox.error('Your session has expired. Please log in again.')
                setTimeout(() => {
                }, 3000)
                return
            }

            if (!response.ok) {
                MessageBox.error(`Server error: ${response.status} ${response.statusText}`)
                setIsLoading(false)
                return
            }

            const data = await response.json()

            if (data.success) {
                setAppointments(data.appointments || [])
            } else {
                MessageBox.error(`Failed to fetch appointments: ${data.message}`)
            }
        } catch (error) {
            MessageBox.error(`Error fetching appointments: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }, [user._id]);


    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Cancel an appointment 
    const cancelAppointment = useCallback(async (appointmentId) => {
        if (!appointmentId) {
            console.error("No appointment ID provided");
            MessageBox.error("Cannot cancel: Missing appointment ID");
            return;
        }

        // Confirmation before canceling
        if (!window.confirm("Are you sure you want to cancel this appointment?")) {
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
                body: JSON.stringify({ status: '1' }) // Use '1' for cancelled
            });

            if (response.status === 401) {
                console.error('Authentication error: Not authorized to access this resource');
                MessageBox.error('Authentication error - please try logging in again');
                setTimeout(() => {
                    logout();
                }, 3000);
                return;
            }

            const data = await response.json();

            if (data.success) {
                MessageBox.success("Appointment cancelled successfully.");
                fetchAppointments();
            } else {
                console.error("Failed to cancel appointment:", data.message);
                MessageBox.error(data.message || "Failed to cancel appointment");
            }
        } catch (error) {
            console.error("Error canceling appointment:", error);
            MessageBox.error(`Error: ${error.message || "Could not cancel appointment"}`);
        } finally {
            setIsLoading(false);
        }
    }, [fetchAppointments, logout]);


    // Replace viewAppointmentDetails with modal handling
    const handleViewDetails = (appointmentId) => {
        const appointment = appointments.find(apt => apt._id === appointmentId || apt.id === appointmentId);
        if (!appointment) {
            MessageBox.error("Appointment not found");
            return;
        }
        setSelectedAppointment(appointment);
    };

    const getDoctorName = (appointment) => {
        // Check doctorProfile's populated userId first
        if (appointment.doctorProfile?.userId) {
            const { firstName, lastName, fullName } = appointment.doctorProfile.userId;
            if (firstName && lastName) {
                return `Dr. ${firstName} ${lastName}`;
            }
            if (fullName) {
                return `Dr. ${fullName}`;
            }
        }
        
        // Fallback to doctorId
        if (appointment.doctorId) {
            const { firstName, lastName, fullName } = appointment.doctorId;
            if (firstName && lastName) {
                return `Dr. ${firstName} ${lastName}`;
            }
            if (fullName) {
                return `Dr. ${fullName}`;
            }
        }
        
        return "Doctor Not Assigned";
    };

    const getStatusDisplay = (status) => {
        switch(status) {
            case '0':
                return { text: 'Confirmed', className: 'bg-green-100 text-green-800' };
            case '1':
                return { text: 'Cancelled', className: 'bg-red-100 text-red-800' };
            case 'completed':
                return { text: 'Completed', className: 'bg-blue-100 text-blue-800' };
            case 'no-show':
                return { text: 'No Show', className: 'bg-yellow-100 text-yellow-800' };
            default:
                return { text: status, className: 'bg-gray-100 text-gray-800' };
        }
    };

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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {appointments.map(appointment => {
                                const status = getStatusDisplay(appointment.status);
                                return (
                                    <tr key={appointment.id || appointment._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={appointment.doctorProfile?.profileImage ? `${API_URL}${appointment.doctorProfile.profileImage}` : "/assets/images/profilephoto.svg"}
                                                        alt={getDoctorName(appointment)}
                                                        onError={(e) => {
                                                            e.target.src = "/assets/images/profilephoto.svg";
                                                        }}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {getDoctorName(appointment)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {appointment.doctorProfile?.specialization || "Specialization not available"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(appointment.dateTime).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                                                {status.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-4">
                                                {appointment.status === '0' && (
                                                    <button
                                                        onClick={() => cancelAppointment(appointment._id)}
                                                        className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleViewDetails(appointment._id)}
                                                    className="text-[#007E85] hover:text-[#006b6f] underline text-sm"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedAppointment && (
                <AppointmentDetailsModal
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                />
            )}
        </div>
    );
});

export default AppointmentsTab;