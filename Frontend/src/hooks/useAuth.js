import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/authContext';

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    error, 
    login, 
    logout 
  } = useContext(AuthContext);
  
  // We don't need to manually add authorization headers anymore
  // as cookies will be automatically sent with each request
  
  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout
  };
};
