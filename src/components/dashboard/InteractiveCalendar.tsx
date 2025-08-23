"use client";

import { useState, useEffect, useRef } from "react";
import AppointmentModal from "./AppointmentModal";
import AppointmentEditModal from "./AppointmentEditModal";
import { formatTimeForDisplay } from "@/lib/time-utils";

// Color theme options
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

interface InteractiveCalendarProps {
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

export default function InteractiveCalendar({
  startOfWeek,
  endOfWeek,
  today,
  weekBookings,
  bookingsByDay,
  onWeekChange,
  onAppointmentCreated,
  userProfileName,
  timeFormat = "24",
}: InteractiveCalendarProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; booking?: Booking } | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ date: Date; hour: number; minute: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
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

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  // Ensure days are in Monday to Sunday order
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
          <span className="text-sm font-medium text-gray-900">{userProfileName || 'HEJ'}</span>
        </div>

        {/* Center - Week picker */}
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
            {startOfWeek.toLocaleDateString('en-US', { month: 'short' })} - {endOfWeek.toLocaleDateString('en-US', { month: 'short' })} {startOfWeek.getFullYear()}
          </span>
          <button 
            onClick={handleNextWeek}
            className="p-1.5 hover:bg-gray-50 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Right side - Book appointment button */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAppointmentModal(true)}
            className="px-3 py-1.5 bg-black text-white rounded-xl text-xs font-medium hover:bg-gray-800 transition-colors"
          >
            Book appointment
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
                          {dayNames[dayIndex]}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-900">
                          {day.getDate()}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {dayNames[dayIndex]}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Calendar Grid */}
          <div ref={calendarGridRef} className="grid grid-cols-8 relative h-[600px] overflow-y-auto">
            {/* Calendar Selector Column */}
            <div className="relative border-r border-gray-200 w-48">
              {/* Time labels positioned absolutely */}
              {Array.from({ length: 96 }, (_, i) => {
                const totalMinutes = i * 15;
                const hour = Math.floor(totalMinutes / 60); // Start from 12 AM (0)
                const minute = totalMinutes % 60;
                const timeString = formatTimeForDisplay(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`, timeFormat);
                
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
                           {formatTimeForDisplay(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`, timeFormat)}
                         </div>
                       )}
                     </div>
                   );
                 })}
                 
                 {/* Render appointment blocks as overlays */}
                 {(() => {
                   const dayBookings = bookingsByDay[day.toDateString()] || [];
                   
                   // Group overlapping appointments
                   const overlappingGroups: Booking[][] = [];
                   const processedBookings = new Set<string>();
                   
                   dayBookings.forEach((booking) => {
                     if (processedBookings.has(booking.id)) return;
                     
                     const bookingDate = new Date(booking.date);
                     const bookingStart = bookingDate.getTime();
                     const bookingEnd = bookingStart + (booking.service.duration * 60 * 1000);
                     
                     const overlappingGroup = [booking];
                     processedBookings.add(booking.id);
                     
                     // Find all overlapping appointments
                     dayBookings.forEach((otherBooking) => {
                       if (processedBookings.has(otherBooking.id)) return;
                       
                       const otherBookingDate = new Date(otherBooking.date);
                       const otherBookingStart = otherBookingDate.getTime();
                       const otherBookingEnd = otherBookingStart + (otherBooking.service.duration * 60 * 1000);
                       
                       // Check if appointments overlap
                       if (bookingStart < otherBookingEnd && bookingEnd > otherBookingStart) {
                         overlappingGroup.push(otherBooking);
                         processedBookings.add(otherBooking.id);
                       }
                     });
                     
                     if (overlappingGroup.length > 0) {
                       // Sort by creation time (using ID as proxy for creation order)
                       overlappingGroup.sort((a, b) => a.id.localeCompare(b.id));
                       overlappingGroups.push(overlappingGroup);
                     }
                   });
                   
                   return overlappingGroups.map((group, groupIndex) => 
                     group.map((booking, bookingIndex) => {
                       const bookingDate = new Date(booking.date);
                       const startHour = bookingDate.getHours();
                       const startMinute = bookingDate.getMinutes();
                       
                       // Calculate position and height
                       const startSlot = (startHour * 60 + startMinute) / 15; // Convert to 15-minute slots
                       const durationSlots = booking.service.duration / 15; // Convert duration to 15-minute slots
                       
                       const topPosition = startSlot * 24; // 24px per slot
                       const height = durationSlots * 24; // 24px per slot
                       
                       // Calculate dynamic width and offset for cascading effect
                       const totalOverlaps = group.length;
                       
                       let appointmentStyle: React.CSSProperties = {
                         top: `${topPosition}px`,
                         height: `${height}px`,
                         zIndex: 10 + bookingIndex
                       };
                       
                       if (totalOverlaps === 1) {
                         // Single appointment: full width
                         appointmentStyle.left = '0px';
                         appointmentStyle.right = '0px';
                       } else {
                         // Multiple overlapping appointments: all aligned to the right, progressively narrower
                         const offset = 100 / totalOverlaps; // Offset based on total number of appointments
                         const width = 100 - (bookingIndex * offset); // Each appointment gets narrower
                         
                         appointmentStyle.left = 'auto';
                         appointmentStyle.right = '0px';
                         appointmentStyle.width = `${width}%`;
                       }
                       
                       const colors = getColorValues(booking.service.colorTheme || "blue");
                       
                       return (
                         <div
                           key={booking.id}
                           className="absolute cursor-pointer transition-colors rounded-sm border border-white"
                           style={{
                             ...appointmentStyle,
                             backgroundColor: colors.light,
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
                     })
                   );
                 })()}
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