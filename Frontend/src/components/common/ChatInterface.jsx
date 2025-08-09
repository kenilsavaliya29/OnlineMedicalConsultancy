import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/chatContext.jsx';
import { AuthContext } from '../../contexts/authContext.jsx';

const ChatInterface = ({ appointment, onClose }) => {
  const { user } = React.useContext(AuthContext);
  const {
    messages,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    typingUsers,
    onlineUsers,
    isConnected
  } = useChat();
  
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages, markMessagesAsRead]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && isConnected) {
      sendMessage(messageInput);
      setMessageInput('');
      handleStopTyping();
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    handleStartTyping();
  };

  const handleStartTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      startTyping();
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      stopTyping();
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStatus = (message) => {
    if (message.senderId._id === user._id) {
      switch (message.status) {
        case 'sent':
          return '✓';
        case 'delivered':
          return '✓✓';
        case 'read':
          return <span className="text-blue-500">✓✓</span>;
        default:
          return '';
      }
    }
    return '';
  };

  const getOtherPersonName = () => {
    if (!appointment) return 'Chat';
    
    if (user.role === 'doctor') {
      return appointment.patientId?.fullName || 'Patient';
    } else {
      return appointment.doctorId?.fullName || 'Doctor';
    }
  };

  const isOtherPersonOnline = () => {
    if (!appointment) return false;
    
    const otherPersonId = user.role === 'doctor' 
      ? appointment.patientId?._id 
      : appointment.doctorId?._id;
    
    return onlineUsers.has(otherPersonId);
  };

  const getTypingIndicator = () => {
    const otherPersonId = user.role === 'doctor' 
      ? appointment.patientId?._id 
      : appointment.doctorId?._id;
    
    return typingUsers.has(otherPersonId);
  };

  if (!appointment) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl text-gray-300 mb-4">💬</div>
          <p className="text-gray-500">Select an appointment to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border chat-interface">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-[#007E85] rounded-full flex items-center justify-center text-white font-semibold">
              {getOtherPersonName().charAt(0).toUpperCase()}
            </div>
            {isOtherPersonOnline() && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{getOtherPersonName()}</h3>
            <p className="text-sm text-gray-500">
              {isConnected ? (
                isOtherPersonOnline() ? 'Online' : 'Offline'
              ) : (
                'Connecting...'
              )}
            </p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 chat-container"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">👋</div>
            <p>Start your conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.senderId._id === user._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId._id === user._id
                    ? 'bg-[#007E85] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <div className={`flex items-center justify-between mt-1 text-xs ${
                  message.senderId._id === user._id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span>{formatTime(message.createdAt)}</span>
                  <span className="ml-2">{getMessageStatus(message)}</span>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {getTypingIndicator() && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            onBlur={handleStopTyping}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || !isConnected}
            className="px-6 py-2 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
        
        {!isConnected && (
          <p className="text-sm text-red-500 mt-2">
            Connection lost. Attempting to reconnect...
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface; 