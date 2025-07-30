"use client";

import { useState, useEffect } from "react";
import AppointmentModal from "./AppointmentModal";
import AppointmentEditModal from "./AppointmentEditModal";

interface Booking {
  id: string;
  date: Date;
  time?: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price?: number;
  };
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  teamMember?: {
    id: string;
    name: string;
  };
  note?: string;
}

interface InteractiveCalendarProps {
  startOfWeek: Date;
  endOfWeek: Date;
  today: Date;
  weekBookings: Booking[];
  bookingsByDay: Record<string, Booking[]>;
  onWeekChange?: (startDate: Date, endDate: Date) => void;
  onAppointmentCreated?: () => void;
}

export default function InteractiveCalendar({
  startOfWeek,
  endOfWeek,
  today,
  weekBookings,
  bookingsByDay,
  onWeekChange,
  onAppointmentCreated,
}: InteractiveCalendarProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; booking?: Booking } | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ date: Date; hour: number; minute: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate current time position
  const getCurrentTimePosition = () => {
    const now = currentTime;
    const startHour = 0; // Calendar starts at 12 AM (0)
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate total minutes since start of calendar
    const totalMinutes = (currentHour - startHour) * 60 + currentMinute;
    
    // Convert to pixels (24px per 15-minute slot)
    const pixelsPerMinute = 24 / 15; // 24px per 15 minutes = 1.6px per minute
    const position = totalMinutes * pixelsPerMinute;
    
    // Align with the grid line by positioning at the top of the time slot
    return position;
  };

  const currentTimePosition = getCurrentTimePosition();
  const isCurrentTimeVisible = currentTimePosition >= 0 && currentTimePosition <= 96 * 24; // Within calendar bounds

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const handleSlotClick = (date: Date, booking?: Booking) => {
    if (booking) {
      // Format time for the edit modal
      const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      const bookingWithTime = {
        ...booking,
        date: date,
        time: timeString
      };
      setSelectedBooking(bookingWithTime);
      setShowEditModal(true);
    } else {
      // Format time for the modal
      const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      setSelectedDateTime({ date, time: timeString });
      setShowAppointmentModal(true);
    }
    setSelectedSlot({ date, booking });
  };

  const handlePreviousWeek = () => {
    const newStartOfWeek = new Date(startOfWeek);
    newStartOfWeek.setDate(startOfWeek.getDate() - 7);
    const newEndOfWeek = new Date(newStartOfWeek);
    newEndOfWeek.setDate(newStartOfWeek.getDate() + 6);
    onWeekChange?.(newStartOfWeek, newEndOfWeek);
  };

  const handleNextWeek = () => {
    const newStartOfWeek = new Date(startOfWeek);
    newStartOfWeek.setDate(startOfWeek.getDate() + 7);
    const newEndOfWeek = new Date(newStartOfWeek);
    newEndOfWeek.setDate(newStartOfWeek.getDate() + 6);
    onWeekChange?.(newStartOfWeek, newEndOfWeek);
  };

  const handleToday = () => {
    const today = new Date();
    // Adjust to start week on Monday (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, subtract 6 to get to Monday
    const newStartOfWeek = new Date(today);
    newStartOfWeek.setDate(today.getDate() - daysToSubtract);
    newStartOfWeek.setHours(0, 0, 0, 0);
    const newEndOfWeek = new Date(newStartOfWeek);
    newEndOfWeek.setDate(newStartOfWeek.getDate() + 6);
    onWeekChange?.(newStartOfWeek, newEndOfWeek);
  };

  const handleAppointmentCreated = () => {
    console.log("Appointment created, refreshing data...");
    onAppointmentCreated?.();
  };

  const handleAppointmentUpdated = () => {
    console.log("Appointment updated, refreshing data...");
    onAppointmentCreated?.();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Modern Minimalistic Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        {/* Left side - Profile section */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">H</span>
          </div>
          <span className="text-sm font-medium text-gray-900">hussain aljarrah</span>
        </div>

        {/* Center - Week picker and Today button */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePreviousWeek}
            className="p-1.5 hover:bg-gray-50 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center">
            {startOfWeek.toLocaleDateString('en-US', { month: 'short' })} - {endOfWeek.toLocaleDateString('en-US', { month: 'short' })} 2025
          </span>
          <button 
            onClick={handleNextWeek}
            className="p-1.5 hover:bg-gray-50 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button 
            onClick={handleToday}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            Today
          </button>
        </div>

        {/* Right side - Share button */}
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-50 rounded-md transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium">
            Share
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Calendar Header - Days */}
          <div className="grid grid-cols-8 border-b border-gray-100">
            <div className="p-2 text-sm font-medium text-gray-500 text-center border-r border-gray-200 w-48"></div>
            {weekDays.map((day, dayIndex) => {
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div key={day.toDateString()} className={`p-3 text-center border-r border-gray-200 ${dayIndex === weekDays.length - 1 ? '' : ''}`}>
                  <div className="flex items-center justify-center space-x-1">
                    {isToday ? (
                      <>
                        <div className="bg-black text-white text-sm font-medium px-2 py-1 rounded-md">
                          {day.getDate()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-900">
                          {day.getDate()}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Calendar Grid */}
          <div className="grid grid-cols-8 relative">
            {/* Calendar Selector Column */}
            <div className="relative border-r border-gray-200 w-48">
              {/* Time labels positioned absolutely */}
              {Array.from({ length: 96 }, (_, i) => {
                const totalMinutes = i * 15;
                const hour = Math.floor(totalMinutes / 60); // Start from 12 AM (0)
                const minute = totalMinutes % 60;
                const timeString = hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
                
                return (
                  <div key={i} className={`h-6 flex items-start justify-end pr-2 absolute right-0 ${
                    minute === 0 ? '' : ''
                  }`} style={{ top: `${(i * 24) - 8}px` }}>
                    {minute === 0 && (
                      <span className="text-xs text-gray-400">
                        {timeString}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
                         {/* Day Columns */}
             {weekDays.map((day, dayIndex) => (
               <div key={day.toDateString()} className={`border-r border-gray-200 ${dayIndex === weekDays.length - 1 ? '' : ''} relative`}>
                 {/* Render individual time slots for hover effects and click handling */}
                 {Array.from({ length: 96 }, (_, i) => {
                   const totalMinutes = i * 15;
                   const hour = Math.floor(totalMinutes / 60);
                   const minute = totalMinutes % 60;
                   
                   const timeSlot = new Date(day);
                   timeSlot.setHours(hour, minute, 0, 0);
                   
                   const bookings = bookingsByDay[day.toDateString()] || [];
                   
                   // Find if this time slot is part of any booking
                   const currentBooking = bookings.find(booking => {
                     const bookingDate = new Date(booking.date);
                     const bookingStartTime = new Date(bookingDate);
                     const bookingEndTime = new Date(bookingDate);
                     bookingEndTime.setMinutes(bookingEndTime.getMinutes() + booking.service.duration);
                     
                     return bookingDate.toDateString() === timeSlot.toDateString() &&
                            timeSlot >= bookingStartTime &&
                            timeSlot < bookingEndTime;
                   });
                   
                   const hasBooking = !!currentBooking;
                   
                   const isClickable = hour >= 0 && hour < 24;
                   
                   const isHovered = hoveredSlot && 
                     hoveredSlot.date.toDateString() === timeSlot.toDateString() && 
                     hoveredSlot.hour === hour &&
                     hoveredSlot.minute === minute;
                   
                   return (
                     <div 
                       key={i} 
                       className={`h-6 relative cursor-pointer transition-all duration-200 ${
                         minute === 0 ? 'border-t border-gray-200' : 'border-t border-gray-100'
                       } ${
                         hasBooking 
                           ? "hover:bg-blue-200" 
                           : isClickable 
                             ? isHovered 
                               ? "bg-white rounded-md shadow-sm" 
                               : "hover:bg-gray-50" 
                             : "bg-gray-50"
                       }`}
                       style={isHovered && isClickable ? { border: '0.05px solid black', borderRadius: '6px' } : {}}
                       onMouseEnter={() => isClickable && setHoveredSlot({ date: timeSlot, hour, minute })}
                       onMouseLeave={() => setHoveredSlot(null)}
                       onClick={() => isClickable && handleSlotClick(timeSlot, currentBooking)}
                     >
                       {isHovered && isClickable && !hasBooking && (
                         <div className="absolute inset-0 flex items-center justify-start px-2 text-xs text-black pointer-events-none">
                           {`${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')}${hour >= 12 ? 'PM' : 'AM'}`}
                         </div>
                       )}
                     </div>
                   );
                 })}
                 
                 {/* Render appointment blocks as overlays */}
                 {bookingsByDay[day.toDateString()]?.map((booking) => {
                   const bookingDate = new Date(booking.date);
                   const startHour = bookingDate.getHours();
                   const startMinute = bookingDate.getMinutes();
                   
                   // Calculate position and height
                   const startSlot = (startHour * 60 + startMinute) / 15; // Convert to 15-minute slots
                   const durationSlots = booking.service.duration / 15; // Convert duration to 15-minute slots
                   
                   const topPosition = startSlot * 24; // 24px per slot
                   const height = durationSlots * 24; // 24px per slot
                   
                   return (
                     <div
                       key={booking.id}
                       className="absolute left-0 right-0 bg-blue-100 hover:bg-blue-200 cursor-pointer transition-colors rounded-sm border-l-4 border-blue-500"
                       style={{
                         top: `${topPosition}px`,
                         height: `${height}px`,
                         zIndex: 10
                       }}
                       onClick={() => {
                         const timeString = `${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`;
                         const bookingWithTime = {
                           ...booking,
                           date: bookingDate,
                           time: timeString
                         };
                         setSelectedBooking(bookingWithTime);
                         setShowEditModal(true);
                       }}
                     >
                       <div className="flex flex-col justify-center h-full px-2 pointer-events-none">
                         <div className="text-xs font-medium text-blue-900 truncate">
                           {booking.service.name}
                         </div>
                         <div className="text-xs text-blue-700 truncate">
                           {booking.user.name}
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             ))}
            
            {/* Current Time Indicator */}
            {isCurrentTimeVisible && (
              <div 
                className="absolute left-0 right-0 pointer-events-none z-10"
                style={{ top: `${currentTimePosition - 4}px` }}
              >
                {/* Horizontal Line - Starts at the vertical separator and extends across the grid */}
                <div className="h-px bg-black" style={{ width: 'calc(100% - 12rem)', marginLeft: '12rem' }}></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      {selectedDateTime && (
        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedDateTime(null);
          }}
          selectedDate={selectedDateTime.date}
          selectedTime={selectedDateTime.time}
          onAppointmentCreated={handleAppointmentCreated}
        />
      )}

      {/* Appointment Edit Modal */}
      {selectedBooking && (
        <AppointmentEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onAppointmentUpdated={handleAppointmentUpdated}
        />
      )}
    </div>
  );
} 