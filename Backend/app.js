import express from 'express';
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import cors from 'cors';
import timeslotRoutes from './routes/timeslotRoutes.js';
import patientProfileRoutes from './routes/patientProfileRoutes.js';
import wellnessRoutes from './routes/wellnessRoute.js';
import cookieParser from 'cookie-parser';
import chatbotRoutes from './routes/chatbotRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

// Create uploads directory if it doesn't exist
import fs from 'fs';
import path from 'path';
const uploadsDir = path.join(process.cwd(), 'uploads/doctors');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/timeslots', timeslotRoutes);
app.use('/api/patient-profiles', patientProfileRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);

export default app; 