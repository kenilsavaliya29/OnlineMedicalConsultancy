import React, { useEffect, useRef } from 'react';
import { FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

const MessageBox = ({ type, message, onClose, duration = 5000 }) => {
  const timerRef = useRef(null);

  useEffect(() => {
    if (message) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const iconColor = isSuccess ? 'text-green-500' : 'text-red-500';
  const borderColor = isSuccess ? 'border-green-400' : 'border-red-400';

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 max-w-md w-full p-4 rounded-lg shadow-lg flex items-center space-x-3 z-[9999] border ${bgColor} ${borderColor}`}
      role="alert"
    >
      {isSuccess ? (
        <FaCheckCircle className={`flex-shrink-0 w-6 h-6 ${iconColor}`} />
      ) : (
        <FaTimesCircle className={`flex-shrink-0 w-6 h-6 ${iconColor}`} />
      )}
      <div className={`flex-1 font-medium ${textColor}`}>
        {message}
      </div>
      <button
        onClick={onClose}
        className={`flex-shrink-0 p-1 rounded-full ${isSuccess ? 'hover:bg-green-200' : 'hover:bg-red-200'} focus:outline-none focus:ring-2 ${isSuccess ? 'focus:ring-green-500' : 'focus:ring-red-500'} ${textColor}`}
        aria-label="Close alert"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
        </svg>
      </button>
    </div>
  );
};

export default MessageBox; 