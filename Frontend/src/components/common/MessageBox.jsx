import React, { useEffect, useRef, useState } from 'react';
import { FaTimesCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

// Message container component
const MessageContainer = () => {
  const [messages, setMessages] = useState([]);

  // Function to add a new message
  const addMessage = (type, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    setMessages(prev => [...prev, { id, type, message, duration }]);
  };

  // Function to remove a message
  const removeMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  // Expose the addMessage function globally
  useEffect(() => {
    window.addMessage = addMessage;
  }, []);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] space-y-2 w-full max-w-md">
      {messages.map(msg => (
        <MessageBox 
          key={msg.id}
          type={msg.type}
          message={msg.message}
          duration={msg.duration}
          onClose={() => removeMessage(msg.id)}
        />
      ))}
    </div>
  );
};

// Individual message box component
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

  // Define styles based on message type
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-500',
          borderColor: 'border-green-400',
          hoverColor: 'hover:bg-green-200',
          focusColor: 'focus:ring-green-500',
          icon: FaCheckCircle
        };
      case 'warn':
      case 'warning':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-500',
          borderColor: 'border-yellow-400',
          hoverColor: 'hover:bg-yellow-200',
          focusColor: 'focus:ring-yellow-500',
          icon: FaExclamationTriangle
        };
      case 'error':
      default:
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          borderColor: 'border-red-400',
          hoverColor: 'hover:bg-red-200',
          focusColor: 'focus:ring-red-500',
          icon: FaTimesCircle
        };
    }
  };

  const styles = getStyles();
  const IconComponent = styles.icon;

  return (
    <div
      className={`w-full p-4 rounded-lg shadow-lg flex items-center space-x-3 border ${styles.bgColor} ${styles.borderColor} animate-in slide-in-from-top-2 duration-300`}
      role="alert"
    >
      <IconComponent className={`flex-shrink-0 w-6 h-6 ${styles.iconColor}`} />
      <div className={`flex-1 font-medium ${styles.textColor}`}>
        {message}
      </div>
      <button
        onClick={onClose}
        className={`flex-shrink-0 p-1 rounded-full ${styles.hoverColor} focus:outline-none focus:ring-2 ${styles.focusColor} ${styles.textColor}`}
        aria-label="Close alert"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
        </svg>
      </button>
    </div>
  );
};

// Message service object
const showMessage = {
  success: (message, duration = 5000) => {
    if (window.addMessage) {
      window.addMessage('success', message, duration);
    }
  },
  error: (message, duration = 5000) => {
    if (window.addMessage) {
      window.addMessage('error', message, duration);
    }
  },
  warn: (message, duration = 5000) => {
    if (window.addMessage) {
      window.addMessage('warn', message, duration);
    }
  },
  warning: (message, duration = 5000) => {
    if (window.addMessage) {
      window.addMessage('warning', message, duration);
    }
  }
};

export default MessageBox;
export { MessageContainer, showMessage }; 