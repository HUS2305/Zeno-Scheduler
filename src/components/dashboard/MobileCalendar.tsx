"use client";

import { useState, useEffect, useRef } from "react";
import AppointmentModal from "./AppointmentModal";
import AppointmentEditModal from "./AppointmentEditModal";
import { formatTimeForDisplay } from "@/lib/time-utils";

// Color theme options (same as main calendar)
const colorOptions = [
  { name: "blue", value: "#3B82F6", light: "#DBEAFE", medium: "#93C5FD", dark: "#1E40AF" },
  { name: "red", value: "#EF4444", light: "#FEE2E2", medium: "#FCA5A5", dark: "#B91C1C" },
  { name: "green", value: "#10B981", light: "#D1FAE5", medium: "#6EE7B7", dark: "#047857" },
  { name: "purple", value: "#8B5CF6", light: "#EDE9FE", medium: "#C4B5FD", dark: "#5B21B6" },
  { name: "orange", value: "#F97316", light: "#FED7AA", medium: "#FDBA74", dark: "#C2410C" },
  { name: "pink", value: "#EC4899", light: "#FCE7F3", medium: "#F9A8D4", dark: "#BE185D" },
  { name: "yellow", value: "#EAB308", light: "#FEF3C7", medium: "#FDE047", dark: "#A16207" },
  { name: "teal", value: "#14B8A6", light: "#CCFBF1", medium: "#5EEAD4", dark: "#0F766E" },
  { name: "gray", value: "#6B7280", light: "#F3F4F6", medium: "#D1D5DB", dark: "#374151" },
];

// Helper function to get color values
const getColorValues = (colorName: string) => {
  const color = colorOptions.find(c => c.name === colorName);
  return color ? { main: color.value, light: color.light, medium: color.medium, dark: color.dark } : { main: "#3B82F6", light: "#DBEAFE", medium: "#93C5FD", dark: "#1E40AF" };
};

interface Booking {
  id: string;
  date: Date;
  time?: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price?: number;
    colorTheme?: string;
  };
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  teamMember?: {
    id: string;
    name: string;
  };
  customerNote?: string;
}

interface MobileCalendarProps {
  startOfWeek: Date;
  endOfWeek: Date;
  today: Date;
  weekBookings: Booking[];
  bookingsByDay: Record<string, Booking[]>;
  onWeekChange?: (startDate: Date, endDate: Date) => void;
  onAppointmentCreated?: () => void;
  userProfileName?: string;
  timeFormat?: string;
}

export default function MobileCalendar({
  startOfWeek,
  endOfWeek,
  today,
  weekBookings,
  bookingsByDay,
  onWeekChange,
  onAppointmentCreated,
  userProfileName,
  timeFormat = "24",
}: MobileCalendarProps) {
  

  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; booking?: Booking } | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ date: Date; hour: number; minute: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Mobile-specific state for single day view
  const [currentMobileDay, setCurrentMobileDay] = useState(today);
  
  // Ref for the calendar grid to enable auto-scrolling
  const calendarGridRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to current time on mount and when current time changes
  useEffect(() => {
    if (calendarGridRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Calculate total minutes since start of calendar (12 AM = 0)
      const totalMinutes = currentHour * 60 + currentMinute;
      
      // Convert to pixels (24px per 15-minute slot)
      const pixelsPerMinute = 24 / 15; // 24px per 15 minutes = 1.6px per minute
      const scrollPosition = totalMinutes * pixelsPerMinute;
      
      // Scroll to current time with some offset to center it
      const containerHeight = 600; // Height of the calendar container
      const finalScrollPosition = Math.max(0, scrollPosition - (containerHeight / 2));
      
      calendarGridRef.current.scrollTop = finalScrollPosition;
    }
  }, [currentTime]);

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

  // Mobile navigation functions
  const nextMobileDay = () => {
    const nextDay = new Date(currentMobileDay);
    nextDay.setDate(currentMobileDay.getDate() + 1);
    setCurrentMobileDay(nextDay);
  };

  const prevMobileDay = () => {
    const prevDay = new Date(currentMobileDay);
    prevDay.setDate(currentMobileDay.getDate() - 1);
    setCurrentMobileDay(prevDay);
  };

  const goToToday = () => {
    setCurrentMobileDay(today);
  };

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

      
             {/* Mobile Calendar Header */}
       <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
         {/* Left side - Day picker */}
         <div className="flex items-center space-x-3">
           <button 
             onClick={prevMobileDay}
             className="p-1.5 hover:bg-gray-50 rounded-md transition-colors"
           >
             <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
             </svg>
           </button>
           <span className={`text-sm font-medium px-2 py-1 rounded-md ${
             currentMobileDay.toDateString() === today.toDateString()
               ? 'bg-black text-white'
               : 'text-gray-700'
           }`}>
             {currentMobileDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
           </span>
           <button 
             onClick={nextMobileDay}
             className="p-1.5 hover:bg-gray-50 rounded-md transition-colors"
           >
             <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
             </svg>
           </button>
         </div>

         {/* Right side - Book appointment button */}
         <button 
           onClick={() => setShowAppointmentModal(true)}
           className="px-3 py-1.5 bg-black text-white rounded-xl text-xs font-medium hover:bg-gray-800 transition-colors"
         >
           Book appointment
         </button>
       </div>
      
             {/* Mobile Calendar Grid */}
       <div className="grid grid-cols-[auto_1fr] relative h-[600px] overflow-y-auto" ref={calendarGridRef}>
         {/* Calendar Selector Column - Time labels */}
         <div className="relative border-r border-gray-200 w-16">
           {/* Time labels positioned absolutely */}
           {Array.from({ length: 96 }, (_, i) => {
             const totalMinutes = i * 15;
             const hour = Math.floor(totalMinutes / 60);
             const minute = totalMinutes % 60;
             const timeString = formatTimeForDisplay(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`, timeFormat);
             
             return (
               <div key={i} className={`h-6 flex items-start justify-end pr-1 absolute right-0 ${
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
         
         {/* Single Day Column */}
         <div className="relative -ml-1">
          {/* Render individual time slots for hover effects and click handling */}
          {Array.from({ length: 96 }, (_, i) => {
            const totalMinutes = i * 15;
            const hour = Math.floor(totalMinutes / 60);
            const minute = totalMinutes % 60;
            
            const timeSlot = new Date(currentMobileDay);
            timeSlot.setHours(hour, minute, 0, 0);
            
            const bookings = bookingsByDay[currentMobileDay.toDateString()] || [];
            
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
                     {formatTimeForDisplay(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`, timeFormat)}
                   </div>
                 )}
                 {hasBooking && (
                   <div className="absolute inset-0 flex items-center justify-start px-2 text-xs text-black pointer-events-none">
                     {currentBooking.service.name}
                   </div>
                 )}
               </div>
             );
          })}
          
          {/* Render appointment blocks as overlays */}
          {(() => {
            const dayBookings = bookingsByDay[currentMobileDay.toDateString()] || [];
            
            return dayBookings.map((booking, bookingIndex) => {
              const bookingDate = new Date(booking.date);
              const startTime = new Date(bookingDate);
              const endTime = new Date(bookingDate);
              endTime.setMinutes(endTime.getMinutes() + booking.service.duration);
              
              const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
              const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
              const duration = endMinutes - startMinutes;
              
              const top = (startMinutes / 15) * 24;
              const height = (duration / 15) * 24;
              
              const colors = getColorValues(booking.service.colorTheme || "blue");
              
              return (
                <div
                  key={booking.id}
                  className="absolute cursor-pointer transition-colors rounded-sm border border-white"
                  style={{
                    top: `${top}px`,
                    left: '0px',
                    right: '0px',
                    height: `${height}px`,
                    backgroundColor: colors.light,
                    zIndex: 10 + bookingIndex
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.medium;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.light;
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
                  {/* Colored left border overlay */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-sm"
                    style={{ backgroundColor: colors.main }}
                  ></div>
                  
                  <div className="flex flex-col justify-center h-full px-2 pointer-events-none">
                    <div className="text-xs font-medium truncate" style={{ color: colors.dark }}>
                      {booking.service.name}
                    </div>
                    <div className="text-xs truncate" style={{ color: colors.main }}>
                      {booking.customer.name}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
          
                     {/* Current Time Indicator */}
           {isCurrentTimeVisible && (
             <div 
               className="absolute left-0 right-0 pointer-events-none z-10"
               style={{ top: `${currentTimePosition - 4}px` }}
             >
               {/* Horizontal Line - Full width across the day column */}
               <div className="h-px bg-black w-full"></div>
             </div>
           )}
        </div>
      </div>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedDateTime(null);
          }}
          selectedDate={selectedDateTime?.date || new Date()}
          selectedTime={selectedDateTime?.time || "09:00"}
          onAppointmentCreated={handleAppointmentCreated}
          timeFormat={timeFormat}
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
          timeFormat={timeFormat}
        />
      )}
    </div>
  );
}
