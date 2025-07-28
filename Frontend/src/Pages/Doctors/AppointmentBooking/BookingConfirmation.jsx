import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCalendarAlt, FaClock, FaUser, FaWallet } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const BookingConfirmation = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            try {
                const response = await fetch(`${API_URL}/api/appointments/${appointmentId}`, {
                    credentials: 'include'
                });

                const data = await response.json();

                if (data.success) {
                    setAppointment(data.appointment);
                } else {
                    setError(data.message);
                }
            } catch (error) {
                setError('Failed to fetch appointment details');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointmentDetails();
    }, [appointmentId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007E85]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
                            <p className="font-semibold">Error</p>
                            <p>{error}</p>
                            <button
                                onClick={() => navigate('/doctors')}
                                className="mt-4 px-4 py-2 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors"
                            >
                                Back to Doctors
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6">
                            {/* Success Header */}
                            <div className="text-center mb-8">
                                <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h2>
                                <p className="text-gray-600 mt-2">
                                    Your appointment has been successfully booked and confirmed
                                </p>
                            </div>

                            {/* Appointment Details */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-700 mb-4">Appointment Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <FaCalendarAlt className="text-[#007E85] mr-3" />
                                        <span>
                                            {new Date(appointment.dateTime).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaClock className="text-[#007E85] mr-3" />
                                        <span>
                                            {new Date(appointment.dateTime).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaUser className="text-[#007E85] mr-3" />
                                        <span>Dr. {appointment.doctorName}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaWallet className="text-[#007E85] mr-3" />
                                        <span>₹{appointment.payment.amount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                <h3 className="font-semibold text-green-700 mb-2">Payment Successful</h3>
                                <p className="text-sm text-green-600">
                                    Transaction ID: {appointment.payment.transactionId}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/patient/dashboard')}
                                    className="flex-1 bg-[#007E85] text-white py-2 rounded-lg font-medium hover:bg-[#006b6f] transition-colors"
                                >
                                    Go to Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/doctors')}
                                    className="flex-1 border border-[#007E85] text-[#007E85] py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Book Another Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation; 