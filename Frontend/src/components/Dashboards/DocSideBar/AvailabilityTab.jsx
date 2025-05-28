import React from 'react'
import { FaClock, FaPlus, FaTrash } from 'react-icons/fa';

const AvailabilityTab = ({ renderAppointmentInfo, selectedDay, setSelectedDay, newSlot, setNewSlot, handleAddTimeSlot, isLoading, timeSlots, handleDeleteTimeSlot }) => {
    return (
        <div className="space-y-6">
            {renderAppointmentInfo()}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Manage Your Availability</h2>

                    <div className="flex flex-wrap gap-4 mb-6">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`px-4 py-2 rounded-lg transition ${selectedDay === day
                                    ? 'bg-[#007E85] text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-medium mb-3">Add Time Slot</h3>
                        <div className="flex flex-wrap gap-4">
                            <div className="w-full md:w-auto">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={newSlot.startTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#007E85] focus:border-[#007E85]"
                                />
                            </div>
                            <div className="w-full md:w-auto">
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={newSlot.endTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#007E85] focus:border-[#007E85]"
                                />
                            </div>
                            <div className="w-full md:w-auto flex items-end">
                                <button
                                    onClick={handleAddTimeSlot}
                                    disabled={isLoading}
                                    className="h-[42px] bg-[#007E85] text-white py-2 px-4 rounded-lg hover:bg-[#006b6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus />
                                            <span>Add Slot</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-3">Time Slots for {selectedDay}</h3>

                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#007E85]"></div>
                            </div>
                        ) : timeSlots[selectedDay] && timeSlots[selectedDay].length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {timeSlots[selectedDay].map(slot => (
                                    <div
                                        key={slot._id}
                                        className={`rounded-lg border p-4 ${slot.isAvailable
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-red-200 bg-red-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-lg font-medium">
                                                {slot.startTime} - {slot.endTime}
                                            </span>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${slot.isAvailable
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {slot.isAvailable ? 'Available' : 'Booked'}
                                            </span>
                                        </div>

                                        <div className="flex mt-2 space-x-2">
                                            {slot.isAvailable && (
                                                <button
                                                    onClick={() => handleDeleteTimeSlot(slot._id)}
                                                    className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1 rounded"
                                                >
                                                    <FaTrash className="inline mr-1" />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
                                <FaClock className="text-4xl text-gray-300 mb-2" />
                                <p className="text-gray-500 font-medium">No time slots set for {selectedDay}</p>
                                <p className="text-gray-400 text-sm text-center mt-1">
                                    Add time slots above to make yourself available for appointments
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AvailabilityTab