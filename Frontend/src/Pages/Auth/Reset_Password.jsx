import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const Reset_Password = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get('token'); // Get the token from the URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center h-screen py-10 w-1/3"
      >
        <div className="custom-box-shadow rounded-2xl py-10 px-7">
          <h1 className="py-3 font-dm text-2xl">Reset Password</h1>
          <input
            type="password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-lg p-4 w-full font-light border-2 border-[#007E85] custom-shadow focus:border-[#007E85] focus:ring-0 focus:outline-none"
            required
          />
          <div className="flex py-5">
            <button className="border-2 border-[#007E85] text-[#007E85] mx-auto p-8 py-3 rounded-lg font-lato transition-all hover:bg-neutral-100">
              Reset Password
            </button>
          </div>
          {message && <p className="text-red-600">{message}</p>}
        </div>
      </form>
    </div>
  );
};

export default Reset_Password;
