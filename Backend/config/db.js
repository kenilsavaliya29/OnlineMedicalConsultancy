import mongoose from "mongooese";
import dotenv from "dotenv";

// Make sure dotenv is loaded
dotenv.config();

/**
 * Connect to MongoDB
 * This function supports both MONGO_URI and MONGODB_URI environment variables
 * @returns {Promise<mongoose.Connection|null>} Mongoose connection object or null if connection fails
 */
const connectDB = async () => {
  try {
    // Support both MONGO_URI and MONGODB_URI for flexibility
    const connectionString = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!connectionString) {
      console.error('MongoDB connection string not found in environment variables');
      return null;
    }
    
    const conn = await mongoose.connect(connectionString, {
      // Configuration options
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      autoIndex: process.env.NODE_ENV !== 'production', // Disable autoIndex in production for performance
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection errors after initial connection
    conn.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    conn.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    conn.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
    
    return conn.connection;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    return null;
  }
};

export default connectDB;
