"use client";

import { useState, useEffect } from "react";
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { formatTimeForDisplay } from "@/lib/time-utils";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
}

interface Service {
  id: string;
  name: string;
  duration: number;
}

interface Business {
  id: string;
  name: string;
  profilePic: string | null;
  teamMembers: TeamMember[];
  theme?: string | null;
  brandColor?: string | null;
  slotSize?: {
    value: number;
    unit: string;
  };
  allowDoubleBooking?: boolean;
  openingHours?: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
  }>;
  timeFormat?: "12" | "24";
}

interface TimeSelectionPageClientProps {
  business: Business;
  selectedService: Service;
  selectedTeamMember?: TeamMember;
  serviceId: string;
  teamMemberId?: string;
  selectedDate?: string;
  selectedTime?: string;
  slug: string; // Add slug parameter
}

export default function TimeSelectionPageClient({ 
  business, 
  selectedService, 
  selectedTeamMember,
  serviceId,
  teamMemberId,
  selectedDate,
  selectedTime,
  slug
}: TimeSelectionPageClientProps) {
  const router = useRouter();
  const [selectedDateState, setSelectedDate] = useState<Date>(() => {
    if (selectedDate) {
      // Parse date string and ensure it's treated as local time, not UTC
      const [year, month, day] = selectedDate.split('-').map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    }
    return new Date();
  });
  const [selectedTimeState, setSelectedTime] = useState<string>(selectedTime || '');
  const [displayMonth, setDisplayMonth] = useState<Date>(() => {
    if (selectedDate) {
      // Parse date string and ensure it's treated as local time, not UTC
      const [year, month, day] = selectedDate.split('-').map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    }
    return new Date();
  });

  // Generate calendar dates
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the day of week for the first day of the month (0=Sunday, 1=Monday, ..., 6=Saturday)
    let firstDayOfWeek = firstDay.getDay();
    
    // For Monday-first calendar: if first day is Sunday (0), we need 6 previous days
    // If first day is Monday (1), we need 0 previous days, etc.
    let daysFromPreviousMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    
    // Add previous month's days
    for (let i = daysFromPreviousMonth; i > 0; i--) {
      const prevDate = new Date(year, month, -i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Add next month's days to complete the grid (6 rows * 7 days = 42 total)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} mins`;
  };



  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDateSelect = (date: Date) => {
    // Only allow selecting open days
    if (!isDayOpen(date)) {
      return;
    }
    
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    
    // Update display month to show the month of the selected date
    setDisplayMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (selectedTimeState) {
      // Format date in local timezone to avoid UTC conversion issues
      const year = selectedDateState.getFullYear();
      const month = String(selectedDateState.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDateState.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      // Debug: Log the date being sent to confirm it's correct
      console.log('Selected date state:', selectedDateState);
      console.log('Formatted date string:', dateString);
      console.log('Selected time:', selectedTimeState);
      
      const teamMemberParam = teamMemberId ? `&teamMemberId=${teamMemberId}` : '';
      router.push(`/b/${slug}/book/details?serviceId=${serviceId}${teamMemberParam}&date=${dateString}&time=${selectedTimeState}`);
    }
  };

  const days = getDaysInMonth(displayMonth);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Check if a specific day is open for business
  const isDayOpen = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return business.openingHours?.some(hour => hour.dayOfWeek === dayOfWeek) || false;
  };

  // Check if a time slot is available (no overlapping bookings)
  const checkTimeSlotAvailability = async (time: string): Promise<boolean> => {
    // If double booking is allowed, all slots are available
    if (business.allowDoubleBooking) {
      return true;
    }

    try {
      // Format date for API call
      const year = selectedDateState.getFullYear();
      const month = String(selectedDateState.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDateState.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const response = await fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: serviceId,
          date: dateString,
          time: time,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.available;
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }

    // Default to available if check fails
    return true;
  };

  // Generate time slots dynamically based on business configuration
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Get business slot size configuration with fallback to 30 minutes
    const slotSize = business.slotSize?.value || 30;
    const slotUnit = business.slotSize?.unit || 'minutes';
    
    // Convert slot size to minutes
    const slotSizeInMinutes = slotUnit === 'hours' ? slotSize * 60 : slotSize;
    
    // Debug logging
    console.log('=== TIME SLOT GENERATION DEBUG ===');
    console.log('Business data:', business);
    console.log('Business slot size:', business.slotSize);
    console.log('Business allow double booking:', business.allowDoubleBooking);
    console.log('Selected date:', selectedDateState);
    console.log('Business opening hours:', business.openingHours);
    
    // Get business hours for the selected day
    // Note: getDay() returns 0=Sunday, 1=Monday, etc.
    // But our business hours use 0=Sunday, 1=Monday, etc. (same mapping)
    const selectedDayOfWeek = selectedDateState.getDay();
    console.log('Selected day of week:', selectedDayOfWeek);
    
    const dayOfWeek = selectedDateState.getDay();
    console.log('Selected day of week:', selectedDayOfWeek);
    
    const dayHours = business.openingHours?.find(hour => hour.dayOfWeek === selectedDayOfWeek);
    console.log('Found day hours:', dayHours);
    
    // If the selected day is closed, return empty slots
    if (!dayHours) {
      console.log('Selected day is closed, no time slots available');
      return [];
    }
    
    // Parse opening and closing times
    const [openHour, openMinute] = dayHours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = dayHours.closeTime.split(':').map(Number);
    
    const openTime = openHour * 60 + openMinute; // Convert to minutes
    const closeTime = closeHour * 60 + closeMinute;
    
    console.log('Open time (minutes):', openTime, 'Close time (minutes):', closeTime);
    
    console.log('Slot size in minutes:', slotSizeInMinutes);
    
    // Check if selected date is today
    const now = new Date();
    const isToday = selectedDateState.toDateString() === now.toDateString();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    
    console.log('Is today:', isToday);
    console.log('Current time in minutes:', currentTimeInMinutes);
    
    // Generate slots from open time to close time
    for (let time = openTime; time < closeTime; time += slotSizeInMinutes) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Check if this time slot has already passed (for today only)
      const isPastTime = isToday && time <= currentTimeInMinutes;
      
      // For now, mark all slots as available
      // Availability checking will be handled separately via useEffect
      const isAvailable = !isPastTime;
      
      slots.push({
        time: timeString,
        available: isAvailable
      });
    }
    
    console.log('Generated slots:', slots);
    return slots;
  };

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Apply theme and brand color
  const theme = business.theme || 'light';
  const brandColor = business.brandColor || '#000000';

  // Effect to generate time slots and check availability when date changes
  useEffect(() => {
    const updateTimeSlots = async () => {
      const baseSlots = generateTimeSlots();
      
      // If double booking is allowed, use base slots as is
      if (business.allowDoubleBooking) {
        setTimeSlots(baseSlots);
        return;
      }

      // If double booking is not allowed, check availability for each slot
      setIsCheckingAvailability(true);
      const updatedSlots = await Promise.all(
        baseSlots.map(async (slot) => {
          if (!slot.available) return slot; // Keep past time slots as unavailable
          
          const isAvailable = await checkTimeSlotAvailability(slot.time);
          return { ...slot, available: isAvailable };
        })
      );
      
      setTimeSlots(updatedSlots);
      setIsCheckingAvailability(false);
    };

    updateTimeSlots();
  }, [selectedDateState, business.allowDoubleBooking, business.id, serviceId]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-10">
            <button
              onClick={() => router.back()}
              className={`flex items-center ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'} mr-3`}
            >
              <ArrowLeftIcon className="h-4 w-4 font-bold" />
            </button>
            <h1 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Select a time</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Calendar and Time Slots */}
          <div className="space-y-4">
            {/* Calendar */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1))}
                  className={`p-1 hover:bg-gray-100 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <ChevronLeftIcon className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
                <h2 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatMonthYear(displayMonth)}
                </h2>
                <button
                  onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1))}
                  className={`p-1 hover:bg-gray-100 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <ChevronRightIcon className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className={`text-center text-xs font-medium py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isOpen = isDayOpen(day.date);
                  const isSelected = selectedDateState.toDateString() === day.date.toDateString();
                  
                  return (
                                         <button
                       key={index}
                       onClick={() => isOpen && handleDateSelect(day.date)}
                       disabled={!isOpen}
                       className={`
                         p-1.5 text-xs rounded-lg transition-colors relative
                         ${!day.isCurrentMonth 
                           ? `${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} ${isOpen ? 'hover:bg-gray-100' : ''}`
                           : isOpen 
                             ? `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'} cursor-pointer`
                             : `${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} cursor-not-allowed`
                         }
                         ${isSelected && isOpen
                           ? 'text-white'
                           : ''
                         }
                       `}
                       style={isSelected && isOpen ? {
                         backgroundColor: brandColor !== '#000000' ? brandColor : (theme === 'dark' ? '#374151' : '#000000')
                       } : {}}
                     >
                       {day.date.getDate()}
                                               {!isOpen && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg text-gray-400">—</span>
                          </div>
                        )}
                     </button>
                  );
                })}
              </div>
            </div>

                         {/* Time Slots */}
             <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
               <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>
                 {formatDate(selectedDateState)}
               </h3>
               
               {isCheckingAvailability ? (
                 <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                   <p className="text-sm">Checking availability...</p>
                 </div>
               ) : timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && handleTimeSelect(slot.time)}
                        disabled={!slot.available}
                        className={`
                          p-2 text-xs rounded-lg transition-colors font-medium relative
                          ${!slot.available
                            ? `${theme === 'dark' ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                            : selectedTimeState === slot.time
                              ? 'text-white cursor-pointer'
                              : `${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'} cursor-pointer`
                          }
                        `}
                        style={selectedTimeState === slot.time ? {
                          backgroundColor: brandColor !== '#000000' ? brandColor : (theme === 'dark' ? '#374151' : '#000000')
                        } : {}}
                      >
                        {formatTimeForDisplay(slot.time, business.timeFormat || "24")}
                        {!slot.available && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm text-gray-400">—</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
               ) : (
                 <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                   {isDayOpen(selectedDateState) ? (
                     <>
                       <p className="text-sm">No available time slots for this date.</p>
                       <p className="text-xs mt-2">Please check business hours or try a different date.</p>
                     </>
                   ) : (
                     <>
                       <p className="text-sm">Business is closed on this day.</p>
                       <p className="text-xs mt-2">Please select a different date when the business is open.</p>
                     </>
                   )}
                 </div>
               )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-4">
            {/* Business Info */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                  {business.profilePic ? (
                    <img 
                      src={business.profilePic} 
                      alt={business.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {business.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>{business.name}</h3>
              </div>
            </div>

            {/* Summary */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
              <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>Summary</h3>
             
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Service</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedService.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Duration</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatDuration(selectedService.duration)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Provider</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedTeamMember ? selectedTeamMember.name : 'Not selected'}
                  </span>
                </div>
                                   <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Date & Time</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {!isDayOpen(selectedDateState) 
                        ? 'Business closed on selected date'
                        : selectedTimeState 
                          ? (() => {
                              const selectedSlot = timeSlots.find(slot => slot.time === selectedTimeState);
                              if (selectedSlot && !selectedSlot.available) {
                                return 'Selected time has passed';
                              }
                              return `${formatDate(selectedDateState)} at ${formatTimeForDisplay(selectedTimeState, business.timeFormat || "24")}`;
                            })()
                          : 'Not selected'
                      }
                    </span>
                  </div>

              </div>

                                             <button
                  onClick={handleContinue}
                  disabled={!selectedTimeState || !isDayOpen(selectedDateState) || !timeSlots.find(slot => slot.time === selectedTimeState)?.available}
                  className={`
                    w-full mt-4 py-2 px-3 rounded-lg font-medium transition-colors text-sm
                    ${selectedTimeState && isDayOpen(selectedDateState) && timeSlots.find(slot => slot.time === selectedTimeState)?.available
                      ? 'text-white hover:opacity-90'
                      : `${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                    }
                  `}
                  style={selectedTimeState && isDayOpen(selectedDateState) && timeSlots.find(slot => slot.time === selectedTimeState)?.available ? {
                    backgroundColor: brandColor !== '#000000' ? brandColor : (theme === 'dark' ? '#374151' : '#000000')
                  } : {}}
                >
                  Continue
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 