import React from 'react'
import { FaCalendarCheck, FaSyncAlt } from 'react-icons/fa';
import MessageBox from '../../common/MessageBox.jsx';

const AppointmentsTab = ({ appointments, isLoading, fetchAppointments, updateAppointmentStatus, viewAppointmentDetails }) => {
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
                                                                MessageBox.error("An error occurred while canceling");
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
                                                        MessageBox.error("An error occurred while viewing details");
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
}

export default AppointmentsTab