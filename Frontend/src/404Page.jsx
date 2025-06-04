import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col md:flex-row justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 p-5 font-sans">
            <div className="w-full md:w-1/2 max-w-lg mb-8 md:mb-0">
                <img
                    src="https://img.freepik.com/free-vector/404-error-with-doctors-nurses_23-2148497394.jpg"
                    alt="404 Medical Page Not Found Illustration"
                    className="w-full h-auto rounded-lg "
                />
            </div>
            <div className="w-full md:w-1/2 max-w-lg md:pl-12 text-center md:text-left">
                <h1 className="text-8xl font-bold text-[#007E85] mb-4">404</h1>
                <h2 className="text-4xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    We couldn't find the page you're looking for. Like a misplaced medical chart, 
                    this page seems to have gone missing.
                </p>
                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-block w-full sm:w-auto px-8 py-4 bg-[#007E85] text-white rounded-lg font-semibold hover:bg-[#006b6f] transform hover:scale-105 transition-all duration-300 shadow-md"
                    >
                        Return to Homepage
                    </Link>
                    <Link
                        to="/contactus"
                        className="inline-block w-full sm:w-auto px-8 py-4 border-2 border-[#007E85] text-[#007E85] rounded-lg font-semibold hover:bg-[#007E85] hover:text-white transform hover:scale-105 transition-all duration-300 ml-0 sm:ml-4 mt-4 sm:mt-0"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;
