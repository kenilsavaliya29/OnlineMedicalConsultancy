import React from 'react';
import { FaStar, FaComments } from 'react-icons/fa';

const ReviewsSection = ({ reviews, isLoading }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Patient Reviews</h2>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#007E85]"></div>
                </div>
            ) : reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review._id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold">{review.patientName || 'Anonymous'}</p>
                                {/* Display star rating - assuming review has a 'rating' property */}
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={`text-yellow-400 ${i < review.rating ? '' : 'opacity-50'}`}
                                        />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600">{review.rating?.toFixed(1) || 'N/A'}</span>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm">{review.comment || 'No comment provided.'}</p>
                        </div>
                    ))}
                </div>
            ) : ( !isLoading &&
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaComments className="text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No reviews yet</p>
                    <p className="text-gray-400 text-sm text-center mt-1">
                        Reviews will appear here once patients have shared their feedback.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReviewsSection; 