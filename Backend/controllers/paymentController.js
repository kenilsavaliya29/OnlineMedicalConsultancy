import Razorpay from 'razorpay';
import crypto from 'crypto';
import DoctorProfile from '../models/doctorProfileModel.js';
import Appointment from '../models/appointmentModel.js';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a new payment order
 */
export const createPaymentOrder = async (req, res) => {
    try {
        const { doctorId, appointmentDate, appointmentTime } = req.body;

        // Get doctor's consultation fee
        const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });
        if (!doctorProfile) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        const amount = doctorProfile.consultationPrice;

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                doctorId,
                patientId: req.user._id,
                appointmentDate,
                appointmentTime
            }
        });

        res.json({
            success: true,
            order,
            amount,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating payment order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
};

/**
 * Verify payment signature
 */
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            appointmentDetails
        } = req.body;

        // Verify signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Create appointment with payment details
        const appointment = new Appointment({
            patientId: req.user._id,
            doctorId: appointmentDetails.doctorId,
            dateTime: new Date(`${appointmentDetails.date}T${appointmentDetails.time}`),
            reason: appointmentDetails.reason || "Regular consultation",
            status: '0',
            payment: {
                amount: appointmentDetails.amount,
                status: 'completed',
                method: 'credit_card',
                transactionId: razorpay_payment_id,
                paidAt: new Date()
            }
        });

        await appointment.save();

        res.json({
            success: true,
            message: 'Payment verified and appointment created successfully',
            appointment
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message
        });
    }
};

/**
 * Get payment status for an appointment
 */
export const getPaymentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check if user has permission to view this appointment
        if (
            req.user.role !== 'admin' &&
            appointment.patientId.toString() !== req.user._id.toString() &&
            appointment.doctorId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this payment status'
            });
        }

        res.json({
            success: true,
            payment: appointment.payment
        });
    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment status',
            error: error.message
        });
    }
}; 