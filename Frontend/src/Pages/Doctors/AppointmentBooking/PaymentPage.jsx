import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../contexts/authContext';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaWallet } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const PaymentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const appointmentDetails = location.state?.appointmentDetails;

    useEffect(() => {
        if (!appointmentDetails) {
            navigate(`/doctors/${id}`);
        }
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async () => {
        try {
            setLoading(true);
            setError(null);

            // Create order
            console.log('Appointment Details:', appointmentDetails);
            const orderResponse = await fetch(`${API_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    doctorId: id,
                    appointmentDate: appointmentDetails.date,
                    appointmentTime: appointmentDetails.time
                }),
            });

            const orderData = await orderResponse.json();

            if (!orderData.success) {
                throw new Error(orderData.message);
            }

            // Initialize Razorpay payment
            const options = {
                key: orderData.key,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: "Doctor Consultation",
                description: "Consultation Fee Payment",
                order_id: orderData.order.id,
                prefill: {
                    name: user.fullName,
                    email: user.email,
                },
                handler: async function (response) {
                    try {
                        // Verify payment
                        const verifyResponse = await fetch(`${API_URL}/api/payments/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                appointmentDetails: {
                                    ...appointmentDetails,
                                    doctorId: id,
                                    amount: orderData.amount,
                                    reason: "Regular consultation"
                                }
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            navigate(`/booking-confirmation/${verifyData.appointment._id}`);
                        } else {
                            setError('Payment verification failed');
                        }
                    } catch (error) {
                        setError('Payment verification failed');
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    if (!appointmentDetails) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate(`/doctors/${id}`)}
                    className="mb-6 flex items-center text-[#007E85] hover:text-[#006b6f] transition-colors"
                >
                    <FaArrowLeft className="mr-2" />
                    <span>Back to Doctor Profile</span>
                </button>

                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Appointment Payment</h2>

                            {/* Appointment Details */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-700 mb-4">Appointment Details</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <FaCalendarAlt className="text-[#007E85] mr-3" />
                                        <span>{appointmentDetails.date}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaClock className="text-[#007E85] mr-3" />
                                        <span>{appointmentDetails.time}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaWallet className="text-[#007E85] mr-3" />
                                        <span className="font-semibold">₹{appointmentDetails.fee}</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Payment Button */}
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full bg-[#007E85] text-white py-3 rounded-lg font-medium hover:bg-[#006b6f] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Proceed to Payment'}
                            </button>

                            {/* Cancellation Policy Note */}
                            <p className="mt-4 text-sm text-gray-500 text-center">
                                By proceeding with the payment, you agree to our{' '}
                                <button 
                                    onClick={() => navigate('/cancellation-policy')}
                                    className="text-[#007E85] hover:underline"
                                >
                                    cancellation policy
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage; 