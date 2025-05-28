import React from 'react'

const MessagesTab = ({ isLoading, appointments, selectedAppointment, setSelectedAppointment }) => {
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
                                            className={`w-full text-left p-4 transition-colors hover:bg-gray-50 cursor-pointer ${selectedAppointment?._id === appointment._id ? 'bg-[#007E85]/5 border-l-4 border-[#007E85]' : ''
                                                }`}
                                        >
                                            <p className="font-medium truncate">{appointment.patientName}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-sm text-gray-500 truncate">
                                                    {appointment.appointmentDate}, {appointment.appointmentTime}
                                                </p>
                                                <span className={`px-2 py-1 text-xs rounded-full ${appointment.status === 'confirmed'
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
}

export default MessagesTab