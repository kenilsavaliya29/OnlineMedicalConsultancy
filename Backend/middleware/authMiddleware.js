import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import DoctorProfile from '../models/doctorProfileModel.js';
import PatientProfile from '../models/patientProfileModel.js';

/**
 * Get complete user data with profile information
 */
const getUserWithProfile = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const userData = user.toObject();
    delete userData.password; // Remove password for security

    // Fetch role-specific profile
    if (user.role === 'doctor') {
      const doctorProfile = await DoctorProfile.findOne({ userId: user._id });
      if (doctorProfile) {
        userData.profile = doctorProfile.toObject();
      }
    } else if (user.role === 'patient') {
      const patientProfile = await PatientProfile.findOne({ userId: user._id });
      if (patientProfile) {
        userData.profile = patientProfile.toObject();
      }
    }

    return userData;
  } catch (error) {
    console.error('Error in getUserWithProfile:', error);
    return null;
  }
};

/**
 * Authentication middleware
 * Verifies the user's token and attaches the user to the request
 */
export const verifyUser = async (req, res, next) => {
  try {
    // Get token from cookie or authorization header
    const token = req.cookies.authToken ||
      (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user data with profile
    const user = await getUserWithProfile(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to verify if the user is a doctor
 * Must be used after verifyUser
 */
export const verifyDoctor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Doctor role required'
    });
  }

  next();
};

/**
 * Middleware to verify if the user is an admin
 * Must be used after verifyUser
 */
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required'
    });
  }

  next();
};

/**
 * Middleware to verify if the user is a patient
 * Must be used after verifyUser
 */

export const verifyPatient = async (req, res, next) => {

  try {
    const token = req.cookies.authToken ||
      (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user data with profile
    const user = await getUserWithProfile(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in verifyPatient:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }

};

/**
 * Middleware to check if the user owns the resource
 * @param {Function} getResourceUserIdFn - Function to extract the owner user ID from the request
 */
export const verifyResourceOwner = (getResourceUserIdFn) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get the resource owner's user ID
      const resourceUserId = await getResourceUserIdFn(req);

      // If no resource user ID was found, allow admins to proceed (they can access any resource)
      if (!resourceUserId && req.user.role === 'admin') {
        return next();
      }

      // If no resource user ID was found and user is not admin, deny access
      if (!resourceUserId) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if the authenticated user is the resource owner or an admin
      if (resourceUserId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource'
        });
      }

      next();
    } catch (error) {
      console.error('Resource ownership verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

/**
 * Role-based access control middleware
 * @param {string[]} roles - Allowed roles
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    // verifyUser middleware should run first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions."
      });
    }

    next();
  };
};

/**
 * Unified token verification middleware
 * Verifies the user's token and attaches the user to the request
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from cookie or authorization header
    const token = req.cookies.authToken ||
      (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user data with profile
    const user = await getUserWithProfile(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {string[]} roles - Array of allowed roles
 */
export const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${roles.join(' or ')} role required`
      });
    }

    next();
  };
};

// Role-based middleware
export const verifyPatientRole = [verifyUser, checkRole(['patient'])];
export const verifyAdminOrDoctor = [verifyUser, checkRole(['admin', 'doctor'])];