import express from 'express';
import { 
    createPaymentOrder,
    verifyPayment,
    getPaymentStatus
} from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create payment order
router.post('/create-order', verifyToken, createPaymentOrder);

// Verify payment
router.post('/verify', verifyToken, verifyPayment);

// Get payment status
router.get('/status/:appointmentId', verifyToken, getPaymentStatus);

export default router; 