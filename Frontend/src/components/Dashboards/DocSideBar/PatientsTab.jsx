import React from 'react'
import { FaUsers } from 'react-icons/fa';

const PatientsTab = ({ appointments }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Patients</h2>

            {appointments && appointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Get unique patients from appointments */}
                    {Array.from(new Set(appointments.map(a => a.patientEmail))).map((email, index) => {
                        const patientAppointments = appointments.filter(a => a.patientEmail === email);
                        const latestAppointment = patientAppointments[0];

                        return (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt={latestAppointment.patientName} className="w-16 h-16 rounded-full" />
                                    <div>
                                        <h3 className="font-bold text-lg">{latestAppointment.patientName}</h3>
                                        <p className="text-gray-500 text-sm">{latestAppointment.patientEmail}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="font-medium">Phone:</span> {latestAppointment.patientPhone}</p>
                                    <p className="text-sm"><span className="font-medium">Last Visit:</span> {latestAppointment.appointmentDate}</p>
                                    <p className="text-sm"><span className="font-medium">Total Visits:</span> {patientAppointments.length}</p>
                                </div>
                                <button className="mt-4 w-full bg-[#007E85] text-white py-2 rounded-lg hover:bg-[#006b6f] transition-colors">
                                    View Details
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
                    <FaUsers className="text-5xl text-gray-300 mb-3" />
                    <h3 className="text-xl font-medium text-gray-600">No patients yet</h3>
                    <p className="text-gray-400 text-center max-w-md mt-2">
                        When patients schedule appointments with you, they will appear here.
                    </p>
                </div>
            )}
        </div>
    );
}

export default PatientsTab