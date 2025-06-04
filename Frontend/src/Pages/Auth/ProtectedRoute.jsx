import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/authContext.jsx';
import MessageBox from '../../components/common/MessageBox.jsx';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading, getRedirectPath, isInitialLogin } = useContext(AuthContext);
  const location = useLocation();
  const [messageBox, setMessageBox] = React.useState({ show: false, type: '', message: '' });

  const showMessage = (type, message) => {
    setMessageBox({ show: true, type, message });
  };

  const closeMessageBox = () => {
    setMessageBox({ show: false, type: '', message: '' });
  };

  
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
    // 1. It's not an initial login/signup (user just authenticated)
    // 2. It's not a direct navigation (user typed URL or bookmark)
    // 3. It's not coming from auth pages (login/signup)
    const isDirectNavigation = !location.state?.from;
    const isFromAuthPages = location.state?.from === '/login' || 
                           location.state?.from === '/signup' ||
                           location.state?.from?.includes('/login') ||
                           location.state?.from?.includes('/signup');
    
    const shouldShowToast = !isInitialLogin && 
                           !isDirectNavigation && 
                           !isFromAuthPages;
    
    if (shouldShowToast) {
      showMessage('error', `Access denied: You don't have permission to access this page.`);
    }
    
    // Redirect to appropriate dashboard
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has the required role (if specified)
  return (
    <>
      {messageBox.show && (
        <MessageBox
          type={messageBox.type}
          message={messageBox.message}
          onClose={closeMessageBox}
        />
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;