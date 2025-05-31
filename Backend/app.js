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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],  // Add your frontend URLs
  credentials: true  // Allow credentials (cookies)
}));

// Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use('/api/timeslots', timeslotRoutes);
app.use('/api/patient', patientProfileRoutes);
app.use('/api/wellness', wellnessRoutes);

export default app; 