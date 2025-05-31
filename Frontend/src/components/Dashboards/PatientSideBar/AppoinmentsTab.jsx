import React, { useState, useEffect, useCallback, useContext } from 'react'
import { FaCalendarCheck, FaSyncAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { AuthContext } from '../../../contexts/authContext'


const API_URL = import.meta.env.BACKEND_URL || 'http://localhost:3000'

const AppoinmentsTab = React.memo(() => {

    const { user } = useContext(AuthContext)
    const [appointments, setAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    // Fetch patient appointments (Moved from Patient_Dashboard)
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
                toast.error('Your session has expired. Please log in again.')
                setTimeout(() => {
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
    }, [user._id]);


    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Cancel an appointment 
    const cancelAppointment = useCallback(async (appointmentId) => {
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
    }, [appointments, fetchAppointments]);


    const viewAppointmentDetails = useCallback((appointmentId) => {

        const appointment = appointments.find(apt => apt._id === appointmentId || apt.id === appointmentId)

        if (!appointment) {
            toast.error("Appointment not found")
            return
        }

        const details = [
            `Doctor: ${appointment.doctorId?.name || appointment.doctor || appointment.doctorName}`,
            `Specialization: ${appointment.doctorId?.specialization || appointment.specialization || "Not specified"}`,
            `Date: ${appointment.appointmentDate || appointment.date}`,
            `Time: ${appointment.appointmentTime || appointment.time}`,
            `Type: ${appointment.appointmentType ? appointment.appointmentType.charAt(0).toUpperCase() + appointment.appointmentType.slice(1) : "In-person"}`,
            `Status: ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}`,
            `Reason for Visit: ${appointment.reason || "Not specified"}`,
            `Additional Notes: ${appointment.notes || "None provided"}`,
            `Patient Name: ${appointment.patientName || userfirstname + " " + userlastname}`,
            `Patient Email: ${appointment.patientEmail || useremail}`,
            `Patient Phone: ${appointment.patientPhone || userphone || "Not specified"}`
        ].join("\n")

        alert(`Appointment Details:\n\n${details}`)

        // In a real application, you would show this in a modal or navigate to a details page

    }, [appointments, user]);


    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center">
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
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
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
})

export default AppoinmentsTab