import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useContext } from 'react'
import { AuthContext } from '../contexts/authContext.jsx'
import { useLocation } from 'react-router-dom'

// Component to display access denied message
const AccessDeniedAlert = ({ message, onClose }) => {
    return (
        <div className="fixed top-20 right-4 z-50 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md rounded shadow-md" role="alert">
            <div className="flex">
                <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm1.41-1.41A8 8 0 1 0 15.66 4.34 8 8 0 0 0 4.34 15.66zm9.9-8.49L11.41 10l2.83 2.83-1.41 1.41L10 11.41l-2.83 2.83-1.41-1.41L8.59 10 5.76 7.17l1.41-1.41L10 8.59l2.83-2.83 1.41 1.41z" />
                    </svg>
                </div>
                <div>
                    <p>{message}</p>
                </div>
                <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 bg-red-100 text-red-500 rounded-lg p-1.5 hover:bg-red-200 inline-flex h-8 w-8">
                    <span className="sr-only">Close</span>
                    <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                </button>
            </div>
        </div>
    )
}

const Layout = ({ children }) => {
    const { loading } = useContext(AuthContext);
    const location = useLocation();
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        
        if (location.state?.accessDenied) {
            setAlert(location.state.message);
            // Clear the location state to prevent the message from showing again after navigation
            window.history.replaceState({}, document.title);
        }

        // Scroll to the top of the page on route change
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }, [location]);

    const handleCloseAlert = () => {
        setAlert(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007E85]"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            {alert && <AccessDeniedAlert message={alert} onClose={handleCloseAlert} />}
            {children}
            <Footer />
        </>
    )
}

export default Layout
