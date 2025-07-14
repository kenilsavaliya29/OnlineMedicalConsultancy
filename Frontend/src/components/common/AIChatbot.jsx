
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/authContext';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]); 
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    const newUserMessage = { role: 'user', parts: [{ text: inputMessage.trim() }] };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage.trim(), user: user, history: messages }), // Send current messages as history
      });

      const data = await response.json();
      
      if (data.success) {
        const botResponse = { role: 'model', parts: [{ text: data.response }] };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      } else {
        setMessages((prevMessages) => [...prevMessages, { role: 'model', parts: [{ text: 'Error: Could not get a response from the chatbot.' }] }]);
      }
    } catch (error) {
      console.error('Error sending message to chatbot backend:', error);
      setMessages((prevMessages) => [...prevMessages, { role: 'model', parts: [{ text: 'Error: Failed to connect to the chatbot service.' }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Utility to render messages and parse links
  const renderMessageContent = (text) => {
    const combinedRegex = /(\*{2}([^\*]+?)\*{2})|\[(.*?)\]\((.*?)\)/g;
    let parts = [];
    let lastIndex = 0;

    const matches = [...text.matchAll(combinedRegex)];

    matches.forEach(match => {
      // Add text before the current match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      if (match[1]) { 
        parts.push(<strong key={`bold-${match.index}`}>{match[2]}</strong>);
      } else if (match[3]) { 
        const linkText = match[3];
        const linkPath = match[4];
        parts.push(
          <Link to={linkPath} className="text-[#007E85] underline font-semibold" key={`link-${match.index}`}>
            {linkText}
          </Link>
        );
      }

      lastIndex = match.index + match[0].length;
    });


    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return <>{parts}</>;
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        {!isOpen && (
          <p className="mr-2 mb-2 text-sm text-gray-700 bg-white p-2 rounded-lg shadow-md">Talk with AI Chatbot</p>
        )}
        <button
          onClick={toggleChatbot}
          style={{ backgroundColor: '#007E85' }}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-3 right-4 z-50 w-72 h-80 bg-white rounded-lg shadow-xl flex flex-col">
          <div className="flex justify-between items-center p-4 bg-[#007E85] text-white rounded-t-lg">
            <h3 className="text-lg font-semibold">AI Chatbot</h3>
            <button onClick={toggleChatbot} className="text-white hover:text-gray-800 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-grow p-4 overflow-y-auto space-y-3" ref={messagesEndRef}>
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 p-2 rounded-lg text-sm">
                  {renderMessageContent('Hello! How can I help you today?')}
                </div>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.role === 'user'
                    ? 'bg-[#007e85] text-white'
                    : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {renderMessageContent(msg.parts[0].text)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 p-2 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#007E85] text-sm"
            />
            <button
              type="submit"
              className="bg-[#007E85] text-white px-4 py-2 rounded-r-lg hover:bg-[#006b6f] transition-colors focus:outline-none focus:ring-2 focus:ring-[#007E85]"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot; 