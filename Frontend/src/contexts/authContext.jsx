import { createContext, useContext, useState, useEffect } from 'react';
import MessageBox from '../components/common/MessageBox';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returnPath, setReturnPath] = useState(null);
  const [isInitialLogin, setIsInitialLogin] = useState(false);
  

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


  useEffect(() => {
    const verifyUser = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_URL}/auth/user`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error during auth verification:', err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [API_URL]);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      // Normalize email (trim and lowercase)
      const normalizedCredentials = {
        ...credentials,
        email: credentials.email.trim().toLowerCase()
      };
      
      console.log("Attempting login with:", { 
        email: normalizedCredentials.email,
        password: "********" 
      });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedCredentials),
        credentials: 'include'
      });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Failed to parse response:", e);
        throw new Error("Invalid server response");
      }
      
      console.log("Login response status:", response.status);
      
      if (!response.ok) {
        const errorMessage = data.message || `Login failed (${response.status})`;
        console.error("Login error:", errorMessage);
        setError(errorMessage);
        setLoading(false);
        return { success: false, message: errorMessage };
      }
      
      if (data.success) {
        console.log("Login successful for:", data.user?.email);
        setUser(data.user);
        setIsInitialLogin(true); 
        
        
        setTimeout(() => {
          setIsInitialLogin(false);
        }, 1000);
        
        return { success: true, message: 'Login successful!', user: data.user };
      } else {
        setError(data.message || 'Login failed');
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Server connection error';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setUser(null);
      setIsInitialLogin(false);
      return { success: true, message: 'Logged out successfully' };
    } catch (err) {
      console.error('Error during logout:', err);

      setUser(null);
      setIsInitialLogin(false); 
      return { success: true, message: 'Logged out locally' };
    } finally {
      setLoading(false);
    }
  };

  // Registration function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || `Registration failed (${response.status})`;
        return { success: false, message: errorMessage };
      }

      if (data.success) {
        setUser(data.user);
        setIsInitialLogin(true); 
        
        
        setTimeout(() => {
          setIsInitialLogin(false);
        }, 1000);
        
        MessageBox.success('Registration successful!');
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, message: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile function
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || `Profile update failed (${response.status})`;
        return { success: false, message: errorMessage };
      }

      if (data.success) {
        setUser(data.user);
        MessageBox.success('Profile updated successfully!');
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Profile update error:', err);
      return { success: false, message: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine redirect path based on user role
  const getRedirectPath = (user) => {
    if (!user) return '/login';
    
    switch(user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'patient':
        return '/patient/dashboard';
      default:
        return '/';
    }
  };

  // Set return path for redirects after login
  const setRedirectPath = (path) => {
    setReturnPath(path);
  };

  // Get the return path and clear it
  const getAndClearReturnPath = () => {
    const path = returnPath;
    setReturnPath(null);
    return path;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        login,
        logout,
        register,
        updateProfile,
        getRedirectPath,
        setRedirectPath,
        getAndClearReturnPath,
        isAuthenticated: !!user,
        isInitialLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};