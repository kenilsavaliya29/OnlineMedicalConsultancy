import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/authContext.jsx';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading, getRedirectPath } = useContext(AuthContext);
  const location = useLocation();


  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007E85]"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login page
  if (!user) {
    // Store the full path including any query parameters
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  // If role is required but user doesn't have it
  if (user && allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Get the appropriate redirect path based on user role
    const redirectPath = getRedirectPath(user);
    
    // Only show access denied toast when:
    // 1. It's not an immediate post-login redirect
    // 2. It's not a logout redirect
    // 3. The user is actually trying to access a protected route
    const isPostLoginRedirect = location.state?.postLogin;
    const isLogoutRedirect = location.pathname === '/login' && !location.state?.from;
    const isProtectedRouteAccess = !isPostLoginRedirect && !isLogoutRedirect;
    
    if (isProtectedRouteAccess) {
      toast.error(`Access denied: You don't have permission to access this page.`);
    }
    
    // Redirect without passing a message in state
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has the required role (if specified)
  return children;
};

export default ProtectedRoute; 