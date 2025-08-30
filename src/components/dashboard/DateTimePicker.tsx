"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { formatTimeForDisplay } from "@/lib/time-utils";

interface DateTimePickerProps {
  selectedDate: Date;
  selectedTime: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  timeFormat?: string;
}

export default function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  timeFormat = "24",
}: DateTimePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const calendarRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  // Update currentMonth when selectedDate changes
  useEffect(() => {
    setCurrentMonth(new Date(selectedDate));
  }, [selectedDate]);

  // Close calendar and time picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      // Close time picker when clicking outside
      const target = event.target as Element;
      if (!target.closest('.time-picker-container')) {
        setShowTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate time options (15-minute intervals from 00:00 to 23:45)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTimeForDisplay(timeString, timeFormat);
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate start date to show Monday as first day of week
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    // Adjust to start week on Monday (0 = Sunday, 1 = Monday, etc.)
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    const days = [];
    const endDate = new Date(lastDay);
    // Calculate end date to complete the week grid
    const lastDayOfWeek = lastDay.getDay();
    const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    endDate.setDate(endDate.getDate() + daysToAdd);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const handleDateSelect = (date: Date) => {
    console.log('DateTimePicker: handleDateSelect called with date:', date);
    const newDate = new Date(date);
    newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    console.log('DateTimePicker: calling onDateChange with:', newDate);
    onDateChange(newDate);
    setShowCalendar(false);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  // Scroll to selected time when time picker opens
  const scrollToSelectedTime = () => {
    if (timePickerRef.current) {
      const selectedIndex = timeOptions.findIndex(opt => opt.value === selectedTime);
      if (selectedIndex !== -1) {
        const optionHeight = 32; // Approximate height of each option (py-2 = 8px top + 8px bottom + ~16px text)
        const scrollTop = selectedIndex * optionHeight - 64; // Center the selected option (64px = 2 * optionHeight)
        timePickerRef.current.scrollTop = Math.max(0, scrollTop);
      }
    }
  };

  const handleTimePickerToggle = () => {
    const newState = !showTimePicker;
    setShowTimePicker(newState);
    if (newState) {
      // Scroll to selected time after the dropdown is rendered
      setTimeout(scrollToSelectedTime, 0);
    }
  };

  return (
    <div className="relative">
      {/* Date and Time Display */}
      <div className="flex items-center space-x-2">
        {/* Date Picker */}
        <div className="relative">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
                         className="px-2 py-1.5 border border-gray-300 rounded-full text-xs text-left focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white flex items-center justify-between min-w-[100px]"
          >
            <span className="text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              })}
            </span>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Calendar Popup */}
          {showCalendar && (
            <div
              ref={calendarRef}
              className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[280px]"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => handleMonthChange('prev')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => handleMonthChange('next')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                  <div key={day} className="text-xs text-gray-500 text-center py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`text-xs py-1 px-1 rounded hover:bg-gray-100 transition-colors ${
                      isSelected(date)
                        ? 'bg-black text-white hover:bg-gray-800'
                        : isToday(date)
                        ? 'bg-gray-100 text-gray-900'
                        : isCurrentMonth(date)
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

                 {/* Time Picker */}
         <div className="relative time-picker-container">
                       <button
              onClick={handleTimePickerToggle}
              className="px-2 py-1.5 border border-gray-300 rounded-full text-xs text-left focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white flex items-center justify-between min-w-[100px]"
            >
             <span className="text-gray-900">
               {timeOptions.find(opt => opt.value === selectedTime)?.display || selectedTime}
             </span>
             <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
             </svg>
           </button>

                       {/* Time Picker Dropdown */}
            {showTimePicker && (
              <div 
                ref={timePickerRef}
                className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto"
              >
               {timeOptions.map((option) => (
                 <button
                   key={option.value}
                   onClick={() => {
                     onTimeChange(option.value);
                     setShowTimePicker(false);
                   }}
                   className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors ${
                     option.value === selectedTime ? 'bg-black text-white hover:bg-gray-800' : 'text-gray-900'
                   }`}
                 >
                   {option.display}
                 </button>
               ))}
             </div>
           )}
         </div>
      </div>
    </div>
  );
} 