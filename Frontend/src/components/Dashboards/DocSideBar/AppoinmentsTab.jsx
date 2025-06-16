import React, { useState, useEffect, useCallback, useContext } from 'react'
import { FaCalendarCheck, FaSyncAlt } from 'react-icons/fa';
import MessageBox from '../../common/MessageBox.jsx';
import { AuthContext } from '../../../contexts/authContext'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

const AppointmentsTab = () => {
    const { user, logout } = useContext(AuthContext); 
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 

    // Fetch doctor appointments
    const fetchAppointments = useCallback(async () => {
        if (!user || !user._id || user.role !== 'doctor') {
            console.log("Doctor details not available or user is not a doctor for appointment fetch");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/appointments/doctor/${user._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (response.status === 401) {
                MessageBox.error('Your session has expired. Please log in again.');
                setTimeout(() => {
                    logout();
                }, 3000);
                return;
            }

            if (!response.ok) {
                MessageBox.error(`Server error: ${response.status} ${response.statusText}`);
                setIsLoading(false);
                return;
            }

            const data = await response.json();

            if (data.success) {
                setAppointments(data.appointments || []);
            } else {
                MessageBox.error(`Failed to fetch appointments: ${data.message}`);
            }
        } catch (error) {
            MessageBox.error(`Error fetching appointments: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [user, logout]); 

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]); 
    
    // Update appointment status (for doctor to cancel)
    const updateAppointmentStatus = useCallback(async (appointmentId, status) => {
        if (!appointmentId) {
            console.error("No appointment ID provided");
            MessageBox.error("Cannot update status: Missing appointment ID");
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/status`, { // Use existing status update route
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ status: status })
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
                MessageBox.success(`Appointment status updated to ${status} successfully.`);
                fetchAppointments(); 
            } else {
                console.error("Failed to update appointment status:", data.message);
                MessageBox.error(data.message || "Failed to update appointment status");
            }
        } catch (error) {
            console.error("Error updating appointment status:", error);
            MessageBox.error(`Error: ${error.message || "Could not update appointment status"}`);
        } finally {
            setIsLoading(false);
        }
    }, [fetchAppointments, logout]);

    // View appointment details
    const viewAppointmentDetails = useCallback((appointment) => {
        if (!appointment) {
            MessageBox.error("Appointment not found");
            return;
        }

        const details = [
            `Patient: ${appointment.patientId?.fullName || appointment.patientName || "Unknown Patient"}`,
            `Email: ${appointment.patientId?.email || appointment.patientEmail || "N/A"}`,
            `Phone: ${appointment.patientId?.phoneNumber || appointment.patientPhone || "N/A"}`,
            `Date: ${new Date(appointment.dateTime).toLocaleDateString()}`,
            `Time: ${new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            `Duration: ${appointment.duration} minutes`,
            `Type: ${appointment.type ? appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1) : "N/A"}`,
            `Status: ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}`,
            `Reason: ${appointment.reason || "N/A"}`,
            `Symptoms: ${(appointment.symptoms && appointment.symptoms.length > 0) ? appointment.symptoms.join(', ') : "None"}`,
            `Doctor Notes: ${appointment.notes?.doctor || "None"}`,
            `Patient Notes: ${appointment.notes?.patient || "None"}`
        ].join("\n"); // Use \n for multiline alert

        alert(`Appointment Details:\n\n${details}`);
    }, []);

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
                                            {/* Patient profile image placeholder */}
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={
                                                        appointment.patientId?.profileImage
                                                            ? `${API_URL}${appointment.patientId.profileImage}`
                                                            : "https://randomuser.me/api/portraits/women/85.jpg" // Placeholder for patient image
                                                    }
                                                    alt="Patient"
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{appointment.patientId?.fullName || "Unknown Patient"}</div>
                                                <div className="text-sm text-gray-500">{appointment.patientId?.email || appointment.patientEmail}</div>
                                                <div className="text-xs text-gray-500">{appointment.patientId?.phoneNumber || appointment.patientPhone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{new Date(appointment.dateTime).toLocaleDateString()}</div>
                                        <div className="text-sm text-gray-500">{new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${appointment.type === 'chat' ? 'bg-blue-100 text-blue-800' :
                                                appointment.type === 'video' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-green-100 text-green-800'}`}>
                                            {appointment.type ? appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1) : "In Person"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${appointment.status === 'pending' || appointment.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {(appointment.status === 'requested' || appointment.status === 'confirmed') && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to confirm the appointment with ${appointment.patientId?.fullName || "this patient"}?`)) {
                                                                updateAppointmentStatus(appointment._id, 'confirmed');
                                                            }
                                                        }}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to cancel the appointment with ${appointment.patientId?.fullName || "this patient"}?`)) {
                                                                updateAppointmentStatus(appointment._id, 'cancelled');
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {appointment.status === 'confirmed' && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (window.confirm(`Mark appointment with ${appointment.patientId?.fullName || "this patient"} as completed?`)) {
                                                            updateAppointmentStatus(appointment._id, 'completed');
                                                        }
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => viewAppointmentDetails(appointment)}
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
}

export default AppointmentsTab