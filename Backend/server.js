import mongoose from 'mongoose';
import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import User from './models/userModel.js';

// Load environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// Create necessary directories if they don't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadsDoctorsDir = path.join(uploadsDir, 'doctors');
if (!fs.existsSync(uploadsDoctorsDir)) {
  fs.mkdirSync(uploadsDoctorsDir, { recursive: true });
}

const uploadsPatientDir = path.join(uploadsDir, 'patients');
if (!fs.existsSync(uploadsPatientDir)) {
  fs.mkdirSync(uploadsPatientDir, { recursive: true });
}

// Initialization
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001;

/**
 * Connect to MongoDB
 */
// Ensure a database name is specified
const dbURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/wellness-app';
mongoose.connect(dbURI)
  .then(() => {
    console.log('MongoDB Connected to database:', dbURI.split('/').pop().split('?')[0]);
    createDefaultAdmin();
    setupServer();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Retry connection after delay or exit based on configuration
    const shouldRetry = process.env.MONGO_RETRY_CONNECT === 'true';
    
    if (shouldRetry) {
      console.log('Retrying MongoDB connection in 5 seconds...');
      setTimeout(() => {
        console.log('Attempting to reconnect to MongoDB...');
        mongoose.connect(dbURI)
          .then(() => {
            console.log('MongoDB Connected on retry');
            createDefaultAdmin();
            setupServer();
          })
          .catch(retryErr => {
            console.error('MongoDB connection retry failed:', retryErr);
            process.exit(1);
          });
      }, 5000);
    } else {
      process.exit(1);
    }
  });

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // For now, just log this, but in production you might want to exit
  // process.exit(1);
});

// Setup function to initialize server after DB connection attempt
function setupServer() {
  // CORS configuration
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL] 
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true, 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204
  };
  app.use(cors(corsOptions));

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Serve static files from uploads directory
  app.use('/uploads', express.static('uploads'));

  // Routes
  import('./routes/authRoutes.js')
    .then(({ default: authRoutes }) => {
      app.use("/auth", authRoutes);
      
      // Import app.js with other routes
      return import('./app.js');
    })
    .then(({ default: appRoutes }) => {
      // Mount app routes
      app.use(appRoutes);
      
      // Root route for API health check
      app.get('/', (req, res) => {
        res.json({ 
          status: 'online',
          message: 'Healthcare API is running', 
          environment: process.env.NODE_ENV,
          version: '2.0.0', // New version with improved architecture
          timestamp: new Date().toISOString()
        });
      });
      
      // 404 handler
      app.use((req, res) => {
        res.status(404).json({ 
          success: false, 
          message: 'Endpoint not found'
        });
      });
      
      // Error handling middleware
      app.use((err, req, res, next) => {
        console.error('Server error:', err);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      });
      
      // Start server
      server.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`API available at http://localhost:${port}`);
      });
    })
    .catch(err => {
      console.error('Failed to import routes:', err);
      process.exit(1);
    });
}

// Function to create default admin user if none exists
async function createDefaultAdmin() {
  try {
    // Check if any users exist
    const count = await User.countDocuments();
    
    if (count === 0) {
      console.log('No users found. Creating default admin user...');
      
      // Create admin user
      const admin = new User({
        email: 'admin@gmail.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
      
      await admin.save();
      console.log('Default admin created:');
      console.log('  Email: admin@example.com');
      console.log('  Password: admin123');
      console.log('Please change this password after logging in!');
    } else {
      console.log(`Database has ${count} users.`);
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}
