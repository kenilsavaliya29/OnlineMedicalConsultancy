import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import User from './models/userModel.js';
import { setupSocket } from './socket/socketHandler.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// Create upload directories
const uploadsDir = path.join(process.cwd(), 'uploads');
const uploadsDoctorsDir = path.join(uploadsDir, 'doctors');
const uploadsPatientDir = path.join(uploadsDir, 'patients');

for (const dir of [
  uploadsDir,
  uploadsDoctorsDir,
  uploadsPatientDir
]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Create one Express app and one HTTP server
const app = express();
const server = http.createServer(app);
setupSocket(server);
console.log('Socket.IO initialized');

const port = Number(process.env.PORT) || 3001;

const frontendOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.PUBLIC_FRONTEND_URL,
  'https://carechat.netlify.app'
].filter(Boolean);

const allowedOrigins = [
  ...new Set(frontendOrigins)
];

// Middleware
app.use(cors({
  origin(origin, callback) {
    // Permit requests without an Origin header, such as server-to-server calls
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Make Socket.IO available to Express routes if needed
// app.set('io', io);

// Basic health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Healthcare API is running',
    timestamp: new Date().toISOString()
  });
});

// Register API routes and start only after MongoDB connects
async function createDefaultAdmin() {
  try {
    const count = await User.countDocuments();

    if (count === 0) {
      const admin = new User({
        email: 'admin@gmail.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });

      await admin.save();

      console.log('Default admin user created.');
      console.log('Change the default password immediately.');
    } else {
      console.log(`Database has ${count} users.`);
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

async function startServer() {
  try {
    const dbURI =
      process.env.MONGO_URI ||
      process.env.ATLAS_MONGO_URI ||
      'mongodb://localhost:27017/wellness-app';

    await mongoose.connect(dbURI);

    console.log('MongoDB connected');

    await createDefaultAdmin();

    // Authentication routes
    const { default: authRoutes } =
      await import('./routes/authRoutes.js');

    app.use('/auth', authRoutes);

    // Existing API routes
    const { default: appRoutes } =
      await import('./app.js');

    app.use(appRoutes);

    // 404 handler — must come after all API routes
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found'
      });
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error('Server error:', err);

      if (res.headersSent) {
        return next(err);
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error:
          process.env.NODE_ENV === 'development'
            ? err.message
            : undefined
      });
    });

    // Start the shared HTTP + Socket.IO server
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API: http://localhost:${port}`);
      console.log('Socket.IO initialized on the same HTTP server');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

startServer();
