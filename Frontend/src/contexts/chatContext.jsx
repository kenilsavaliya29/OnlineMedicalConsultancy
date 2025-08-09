import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './authContext.jsx';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [chatAppointments, setChatAppointments] = useState([]);
  
  // Debug: Log appointments when they change
  useEffect(() => {
    console.log('ChatContext: Appointments state updated:', chatAppointments.length, chatAppointments);
  }, [chatAppointments]);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const newSocket = io(API_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
        setOnlineUsers(new Set());
        setTypingUsers(new Set());
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Chat event listeners
      newSocket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('user_joined', (data) => {
        setOnlineUsers(prev => new Set([...prev, data.userId]));
        console.log(`${data.userName} joined the chat`);
      });

      newSocket.on('user_left', (data) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
        console.log(`${data.userName} left the chat`);
      });

      newSocket.on('user_typing', (data) => {
        if (data.isTyping) {
          setTypingUsers(prev => new Set([...prev, data.userId]));
        } else {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      });

      newSocket.on('message_delivered', (data) => {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, status: 'delivered', deliveredAt: data.deliveredAt }
            : msg
        ));
      });

      newSocket.on('messages_read', (data) => {
        setMessages(prev => prev.map(msg => 
          msg.receiverId === data.readBy
            ? { ...msg, status: 'read', readAt: data.readAt }
            : msg
        ));
      });

      newSocket.on('chat_unavailable', (data) => {
        console.warn('Chat unavailable:', data.message);
        // You can show a toast or notification here
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, API_URL]);

  // Fetch chat appointments
  const fetchChatAppointments = useCallback(async () => {
    if (!user) {
      console.log('ChatContext: No user available');
      return;
    }

    console.log('ChatContext: Fetching appointments for user:', user.role, user.email);
    console.log('ChatContext: API URL:', API_URL);

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/chat/appointments`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('ChatContext: Response status:', response.status);
      console.log('ChatContext: Response ok:', response.ok);

      const data = await response.json();
      console.log('ChatContext: Response data:', data);
      
      if (data.success) {
        console.log('ChatContext: Setting appointments:', data.appointments.length);
        setChatAppointments(data.appointments);
      } else {
        console.error('ChatContext: API returned error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching chat appointments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, API_URL]);

  // Join appointment chat
  const joinAppointment = useCallback((appointmentId) => {
    if (socket && appointmentId) {
      socket.emit('join_appointment', appointmentId);
      setCurrentAppointment(appointmentId);
      setMessages([]); // Clear previous messages
      fetchMessages(appointmentId);
    }
  }, [socket]);

  // Leave appointment chat
  const leaveAppointment = useCallback(() => {
    if (socket && currentAppointment) {
      socket.emit('leave_appointment', currentAppointment);
      setCurrentAppointment(null);
      setMessages([]);
      setOnlineUsers(new Set());
      setTypingUsers(new Set());
    }
  }, [socket, currentAppointment]);

  // Send message
  const sendMessage = useCallback((message, messageType = 'text') => {
    if (socket && currentAppointment && message.trim()) {
      socket.emit('send_message', {
        appointmentId: currentAppointment,
        message: message.trim(),
        messageType
      });
    }
  }, [socket, currentAppointment]);

  // Fetch message history
  const fetchMessages = useCallback(async (appointmentId) => {
    if (!user || !appointmentId) return;

    try {
      const response = await fetch(`${API_URL}/api/chat/messages/${appointmentId}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user, API_URL]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(() => {
    if (socket && currentAppointment) {
      socket.emit('mark_messages_read', currentAppointment);
    }
  }, [socket, currentAppointment]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (socket && currentAppointment) {
      socket.emit('typing_start', currentAppointment);
    }
  }, [socket, currentAppointment]);

  const stopTyping = useCallback(() => {
    if (socket && currentAppointment) {
      socket.emit('typing_stop', currentAppointment);
    }
  }, [socket, currentAppointment]);

  // Check chat availability
  const checkChatAvailability = useCallback(async (appointmentId) => {
    if (!user || !appointmentId) return null;

    try {
      const response = await fetch(`${API_URL}/api/chat/availability/${appointmentId}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      return data.success ? data : null;
    } catch (error) {
      console.error('Error checking chat availability:', error);
      return null;
    }
  }, [user, API_URL]);

  const value = {
    socket,
    isConnected,
    currentAppointment,
    messages,
    onlineUsers,
    typingUsers,
    chatAppointments,
    isLoading,
    
    // Actions
    fetchChatAppointments,
    joinAppointment,
    leaveAppointment,
    sendMessage,
    fetchMessages,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    checkChatAvailability
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 