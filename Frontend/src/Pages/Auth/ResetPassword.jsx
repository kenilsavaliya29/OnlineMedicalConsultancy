import React, { useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import MessageBox from '../../components/common/MessageBox.jsx';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageBox, setMessageBox] = useState({ show: false, type: '', message: '' });

  const showMessage = (type, msg) => {
    setMessageBox({ show: true, type, message: msg });
  };

  const closeMessageBox = () => {
    setMessageBox({ show: false, type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      showMessage('error', 'Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        showMessage('success', data.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Something went wrong');
        showMessage('error', data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
      showMessage('error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#007E85] to-[#00565c]">
      {messageBox.show && (
        <MessageBox
          type={messageBox.type}
          message={messageBox.message}
          onClose={closeMessageBox}
        />
      )}
      <div className="container mx-auto flex h-screen items-center justify-center px-4">
        <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl flex overflow-hidden">

          {/* Left Side - Image */}
          <div className="hidden lg:block w-5/12 relative">
            <img
              src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80"
              alt="Medical Professional"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[#007E85] bg-opacity-30 flex items-center justify-center">
              <div className="text-white text-center p-8">
                <h2 className="text-3xl font-bold mb-3">Reset Your Password</h2>
                <p className="text-lg">Enter your new password below</p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-7/12 p-8 md:p-12">
            <div className="mb-8">
              <NavLink to="/" className="block">
                <img src="https://cdn-icons-png.flaticon.com/512/4807/4807695.png" alt="CareChat Logo" className="h-12 mx-auto mb-6 hover:opacity-80 transition-opacity" />
              </NavLink>
              <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Reset Your Password
              </h1>
              <p className="text-center text-gray-600 text-sm">
                Please enter your new password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
              <div>
                <label htmlFor="newPassword" className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#007E85] focus:outline-none focus:ring-0 transition-colors text-sm"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#007E85] focus:outline-none focus:ring-0 transition-colors text-sm"
                />
              </div>
              {message && <p className="mt-1 text-green-600 text-sm text-center">{message}</p>}
              {error && <p className="mt-1 text-red-600 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#007E85] text-white py-2.5 rounded-xl font-medium hover:bg-[#006b6f] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#007E85] text-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
              <div className="text-center">
                <NavLink
                  to="/Login"
                  className="text-[#007E85] hover:text-[#006b6f] text-sm font-medium inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Login
                </NavLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 