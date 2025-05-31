import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 p-5 font-sans text-gray-800">
            <img
                src="https://stories.freepiklabs.com/storage/8198/Error-404-01.svg"
                alt="404 Page Not Found Illustration"
                className="w-2/5 max-w-md h-auto mb-8 rounded-lg "
            />
            <div className=''>
                <h1 className="text-7xl text-[#007E85] m-0 leading-tight text-center">404</h1>
                <h2 className="text-4xl text-gray-600 mt-2 mb-5 text-center">Page Not Found</h2>
                <p className="text-xl text-gray-700 mb-8 max-w-xl text-center leading-relaxed">
                    Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
                </p>
                <Link
                    to="/"
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-[#007E85] text-white rounded-lg font-lexend hover:bg-[#006b6f] transform hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    Go to Homepage
                </Link>
            </div>
        </div>
    );
}

export default NotFoundPage;
