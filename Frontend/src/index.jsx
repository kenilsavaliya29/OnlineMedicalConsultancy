import React from 'react';
import ReactDOM from 'react-dom/client'; // Change "react-dom" to "react-dom/client"
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/authContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Initialize the root element
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    </AuthProvider>
  </React.StrictMode>
);
