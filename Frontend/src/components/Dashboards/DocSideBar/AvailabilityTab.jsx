import React, { useContext } from 'react'
import { AuthContext } from '../../../contexts/authContext'

const AvailabilityTab = () => {
  const { user } = useContext(AuthContext);
  console.log(user.profile.availability);

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h2 className='text-3xl font-extrabold text-gray-800 mb-8'>Your Availability</h2>

      {user.profile.availability ? (
        <>
          <div className='mb-10 bg-white shadow-lg rounded-xl p-6'>
            <h3 className='text-2xl font-bold text-gray-700 mb-6 border-b pb-3'>Date Specific Availability</h3>
            {user.profile.availability.dateSpecific.map((slot, index) => (
              <div key={index} className='flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-sm mb-4 border border-gray-200'>
                <div className='flex items-center space-x-4'>
                  <span className='text-blue-500 text-xl'>🗓️</span> {/* Calendar icon */}
                  <div>
                    <p className='text-lg font-semibold text-gray-900'>Date: {new Date(slot.date).toLocaleDateString()}</p>
                    <p className='text-gray-600'>Time: {slot.startTime} - {slot.endTime}</p>
                  </div>
                </div>
                <button className='text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors duration-200'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {user.profile.availability.dateSpecific.length === 0 && (
              <p className='text-gray-500 italic'>No date specific availability set yet. Add some to get started!</p>
            )}
          </div>

          <div className='bg-white shadow-lg rounded-xl p-6'>
            <h3 className='text-2xl font-bold text-gray-700 mb-6 border-b pb-3'>Recurring Weekly Availability</h3>
            {user.profile.availability.recurringWeekly.map((slot, index) => (
              <div key={index} className='flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-sm mb-4 border border-gray-200'>
                <div className='flex items-center space-x-4'>
                  <span className='text-green-500 text-xl'>📅</span> {/* Calendar icon */}
                  <div>
                    <p className='text-lg font-semibold text-gray-900'>Day: {slot.dayOfWeek}</p>
                    <p className='text-gray-600'>Time: {slot.startTime} - {slot.endTime}</p>
                  </div>
                </div>
                <button className='text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors duration-200'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {user.profile.availability.recurringWeekly?.length === 0 && (
              <p className='text-gray-500 italic'>No recurring weekly availability set yet. Add some to get started!</p>
            )}
          </div>
        </>
      ) : (
        <div className='bg-white shadow-lg rounded-xl p-8 text-center text-gray-700'>
          <p className='text-xl font-semibold mb-4'>No Availability Set</p>
          <p>It looks like you haven't set any availability yet. Please add your available time slots so patients can book appointments with you.</p>
        </div>
      )}
    </div>
  )
}

export default AvailabilityTab