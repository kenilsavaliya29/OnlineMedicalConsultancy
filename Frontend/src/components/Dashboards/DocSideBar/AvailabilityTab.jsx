import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import MessageBox from '../../common/MessageBox';

const AvailabilityTab = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState('09:00'); 
  const [endTime, setEndTime] = useState('');   
  const [recurringDays, setRecurringDays] = useState([]);
  const [specificDailyFreeTime, setSpecificDailyFreeTime] = useState({
    start: '14:00',
    end: '16:00',
  });
  const [selectedAvailabilityType, setSelectedAvailabilityType] = useState('dateSpecific');
  const [messageBox, setMessageBox] = useState({ type: '', message: '' });

  const [dateError, setDateError] = useState('');
  const [startTimeError, setStartTimeError] = useState('');
  const [endTimeError, setEndTimeError] = useState('');
  const [recurringDaysError, setRecurringDaysError] = useState('');
  const [dailyFreeTimeStartError, setDailyFreeTimeStartError] = useState('');
  const [dailyFreeTimeEndError, setDailyFreeTimeEndError] = useState('');

  // Helper to parse time string to minutes from midnight
  const parseTimeInMinutes = (timeString) => {
    if (!timeString) return -1; // Handle empty string case for initial state
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper to format minutes from midnight back to time string
  const formatMinutesToTime = (totalMinutes) => {
    if (totalMinutes < 0) return '';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const handleAddAvailability = () => {
    // Reset all errors
    setDateError('');
    setStartTimeError('');
    setEndTimeError('');
    setRecurringDaysError('');
    setDailyFreeTimeStartError('');
    setDailyFreeTimeEndError('');
    setMessageBox({ type: '', message: '' }); 

    let hasError = false;

    if (selectedAvailabilityType === 'dateSpecific') {
      if (!selectedDate) {
        setDateError("Please select a date.");
        hasError = true;
      }

      if (!startTime) {
        setStartTimeError("Please select a start time.");
        hasError = true;
      }

      if (!endTime) {
        setEndTimeError("Please select an end time.");
        hasError = true;
      }

      if (hasError) return; 

      const totalStartMinutes = parseTimeInMinutes(startTime);
      const totalEndMinutes = parseTimeInMinutes(endTime);

      if (totalStartMinutes === -1 || totalEndMinutes === -1) {
        // This case should ideally be caught by !startTime / !endTime, but as a safeguard
        setStartTimeError("Invalid time format.");
        setEndTimeError("Invalid time format.");
        hasError = true;
      }

      if (totalStartMinutes >= totalEndMinutes) {
        setEndTimeError("End time cannot be before or the same as start time.");
        hasError = true;
      }

      const durationMinutes = totalEndMinutes - totalStartMinutes;

      if (durationMinutes < 10 || durationMinutes > 60) {
        setEndTimeError("The availability block must be between 10 minutes and 1 hour long.");
        hasError = true;
      }

      if (hasError) return; 

      const newAvailability = {
        availabilityType: 'dateSpecific',
        date: selectedDate.toISOString(), 
        startTime,
        endTime,
      };

      console.log({
        type: 'dateSpecific',
        payload: newAvailability,
      });
      setMessageBox({ type: 'success', message: 'Date specific availability added successfully!' });
    } else if (selectedAvailabilityType === 'recurringWeekly') {
      // Recurring Weekly Availability Logic
      if (recurringDays.length === 0) {
        setRecurringDaysError("Please select at least one day.");
        hasError = true;
      }

      if (!specificDailyFreeTime.start) {
        setDailyFreeTimeStartError("Please set a start time for daily free time.");
        hasError = true;
      }

      if (!specificDailyFreeTime.end) {
        setDailyFreeTimeEndError("Please set an end time for daily free time.");
        hasError = true;
      }

      if (hasError) return;

      const totalRecStartMinutes = parseTimeInMinutes(specificDailyFreeTime.start);
      const totalRecEndMinutes = parseTimeInMinutes(specificDailyFreeTime.end);

      if (totalRecStartMinutes >= totalRecEndMinutes) {
        setDailyFreeTimeEndError("Daily free time end time cannot be before or the same as start time.");
        hasError = true;
      }

      const recDurationMinutes = totalRecEndMinutes - totalRecStartMinutes;

      if (recDurationMinutes < 10 || recDurationMinutes > 60) {
        setDailyFreeTimeEndError("Daily free time block must be between 10 minutes and 1 hour long.");
        hasError = true;
      }

      if (hasError) return; // Return if any error after time validations

      const recurringAvailabilityEntries = recurringDays.map(day => ({
        availabilityType: 'recurringWeekly',
        dayOfWeek: day,
        startTime: specificDailyFreeTime.start,
        endTime: specificDailyFreeTime.end,
        // recurringFromDate and recurringToDate would go here if collected from UI
      }));

      console.log({
        type: 'recurringWeekly',
        payload: recurringAvailabilityEntries,
      });
      setMessageBox({ type: 'success', message: 'Recurring weekly availability added successfully!' });
    }
  };

  const handleDayChange = (day) => {
    setRecurringDays((prev) => {
      const newDays = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
      if (newDays.length > 0) {
        setRecurringDaysError('');
      }
      return newDays;
    });
  };

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  // Function to generate all possible 5-minute interval options for a full day
  const generateAllTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const hour = String(h).padStart(2, '0');
        const minute = String(m).padStart(2, '0');
        options.push(`${hour}:${minute}`);
      }
    }
    return options;
  };

  // Filter end time options based on startTime
  const filteredEndTimeOptions = () => {
    if (!startTime) {
      return []; // Return empty array if no start time is selected
    }
    const startMinutes = parseTimeInMinutes(startTime);
    const minEndMinutes = startMinutes + 10; // 10 minutes after start
    const maxEndMinutes = startMinutes + 60; // 60 minutes after start

    return generateAllTimeOptions().filter(time => {
      const totalMinutes = parseTimeInMinutes(time);
      return totalMinutes >= minEndMinutes && totalMinutes <= maxEndMinutes;
    });
  };

  const calculateDuration = () => {
    if (startTime && endTime && selectedAvailabilityType === 'dateSpecific') {
      const startMinutes = parseTimeInMinutes(startTime);
      const endMinutes = parseTimeInMinutes(endTime);
      return endMinutes - startMinutes;
    }
    return 0;
  };

  const duration = calculateDuration();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Set Your Availability</h2>

      {/* Availability Type Selector */}
      <div className="mb-6 flex space-x-2 p-1 bg-gray-100 rounded-lg">
        <button
          className={`flex-1 py-2 px-4 text-center rounded-md text-sm font-medium transition-colors duration-200
            ${selectedAvailabilityType === 'dateSpecific'
              ? 'bg-[#007E85] text-white shadow'
              : 'text-gray-700 hover:bg-gray-200'
            }`}
          onClick={() => { setMessageBox({ type: '', message: '' }); setSelectedAvailabilityType('dateSpecific'); }}        >
          Date Specific Availability
        </button>
        <button
          className={`flex-1 py-2 px-4 text-center rounded-md text-sm font-medium transition-colors duration-200
            ${selectedAvailabilityType === 'recurringWeekly'
              ? 'bg-[#007E85] text-white shadow'
              : 'text-gray-700 hover:bg-gray-200'
            }`}
          onClick={() => { setMessageBox({ type: '', message: '' }); setSelectedAvailabilityType('recurringWeekly'); }}
        >
          Recurring Weekly Availability
        </button>
      </div>

      {selectedAvailabilityType === 'dateSpecific' && (
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Date Specific Availability</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Select Date:<span className="text-red-500">*</span></label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {setSelectedDate(date); setDateError('');}}
                dateFormat="MMMM d, yyyy"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${dateError ? 'border-red-500' : ''}`}
                placeholderText="Click to select a date"
                minDate={new Date()}
              />
              {dateError && <p className="text-red-500 text-xs italic mt-1">{dateError}</p>}
              {selectedDate && (
                <p className="text-gray-600 text-sm mt-2">
                  Selected Day: {format(selectedDate, 'EEEE')}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Start Time:<span className="text-red-500">*</span></label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {setStartTime(e.target.value); setStartTimeError(''); setEndTime('');}} // Reset endTime when startTime changes
                min="09:00" // Limit to 9 AM
                max="17:00" // Limit to 5 PM
                step="300" // 5 minute intervals (300 seconds)
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${startTimeError ? 'border-red-500' : ''}`}
              />
              {startTimeError && <p className="text-red-500 text-xs italic mt-1">{startTimeError}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">End Time:<span className="text-red-500">*</span></label>
              <select
                value={endTime}
                onChange={(e) => {setEndTime(e.target.value); setEndTimeError('');}}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${endTimeError ? 'border-red-500' : ''}`}
                disabled={!startTime} // Disable if no start time is selected
              >
                <option value="" disabled>{!startTime ? "Select Start Time First" : "Select End Time"}</option>
                {filteredEndTimeOptions().map(timeOption => (
                  <option key={timeOption} value={timeOption}>
                    {timeOption}
                  </option>
                ))}
              </select>
              {endTimeError && <p className="text-red-500 text-xs italic mt-1">{endTimeError}</p>}
            </div>
            {startTime && endTime && duration > 0 && (
              <div className="md:col-span-2">
                <p className="text-gray-700 text-sm font-bold mb-2">Calculated Slot Duration:</p>
                <p className="text-gray-900 text-lg">{duration} minutes</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedAvailabilityType === 'recurringWeekly' && (
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Recurring Weekly Availability</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 w-full">Select Days:<span className="text-red-500">*</span></label>
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => handleDayChange(day)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${recurringDays.includes(day)
                  ? 'bg-[#007E85] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {day}
              </button>
            ))}
            {recurringDaysError && <p className="text-red-500 text-xs italic w-full mt-2">{recurringDaysError}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Daily Free Time (Start):<span className="text-red-500">*</span></label>
              <input
                type="time"
                value={specificDailyFreeTime.start}
                onChange={(e) =>
                  {setSpecificDailyFreeTime({ ...specificDailyFreeTime, start: e.target.value }); setDailyFreeTimeStartError('');}
                }
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${dailyFreeTimeStartError ? 'border-red-500' : ''}`}
              />
              {dailyFreeTimeStartError && <p className="text-red-500 text-xs italic mt-1">{dailyFreeTimeStartError}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Daily Free Time (End):<span className="text-red-500">*</span></label>
              <input
                type="time"
                value={specificDailyFreeTime.end}
                onChange={(e) =>
                  {setSpecificDailyFreeTime({ ...specificDailyFreeTime, end: e.target.value }); setDailyFreeTimeEndError('');}
                }
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${dailyFreeTimeEndError ? 'border-red-500' : ''}`}
              />
              {dailyFreeTimeEndError && <p className="text-red-500 text-xs italic mt-1">{dailyFreeTimeEndError}</p>}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleAddAvailability}
        className="bg-[#7bb644] hover:bg-[#517a29] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Add Availability
      </button>

      {messageBox.message && messageBox.type === 'success' && (
        <MessageBox
          type={messageBox.type}
          message={messageBox.message}
          onClose={() => setMessageBox({ type: '', message: '' })}
        />
      )}
    </div>
  );
};

export default AvailabilityTab;