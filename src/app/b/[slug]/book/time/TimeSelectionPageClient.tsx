"use client";

import { useState } from "react";
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

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
  price: number | null;
}

interface Business {
  id: string;
  name: string;
  profilePic: string | null;
  team: TeamMember[];
}

interface TimeSelectionPageClientProps {
  business: Business;
  selectedService: Service;
  selectedTeamMember?: TeamMember;
  serviceId: string;
  teamMemberId?: string;
}

export default function TimeSelectionPageClient({ 
  business, 
  selectedService, 
  selectedTeamMember,
  serviceId,
  teamMemberId
}: TimeSelectionPageClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Generate calendar dates
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
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
      day: 'numeric' 
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

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Free';
    return `kr ${price}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (selectedTime) {
      const params = new URLSearchParams({
        serviceId: serviceId,
        date: selectedDate.toISOString(),
        time: selectedTime
      });
      
      if (teamMemberId) {
        params.append('teamMemberId', teamMemberId);
      }
      
      const url = `/b/${business.id}/book/details?${params.toString()}`;
      console.log("Navigating to:", url);
      console.log("Parameters:", { serviceId, date: selectedDate.toISOString(), time: selectedTime, teamMemberId });
      
      router.push(url);
    }
  };

  const days = getDaysInMonth(selectedDate);
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Mock time slots - this would come from the backend based on business hours
  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: false },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '12:00', available: false },
    { time: '12:30', available: true },
    { time: '13:00', available: true },
    { time: '13:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
             {/* Header */}
       <div className="bg-white border-b border-gray-200 shadow-sm">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center h-10">
                           <button
                onClick={() => router.back()}
                className="flex items-center text-black hover:text-gray-700 mr-3"
              >
                <ArrowLeftIcon className="h-4 w-4 font-bold" />
              </button>
             <h1 className="text-base font-semibold text-gray-900">Select a time</h1>
           </div>
         </div>
       </div>

       

               {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     {/* Left Column - Calendar and Time Slots */}
           <div className="space-y-4">
             {/* Calendar */}
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
               <div className="flex items-center justify-between mb-3">
                 <button
                   onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                   className="p-1 hover:bg-gray-100 rounded"
                 >
                   <ChevronLeftIcon className="h-3 w-3" />
                 </button>
                 <h2 className="text-base font-semibold text-gray-900">
                   {formatMonthYear(selectedDate)}
                 </h2>
                 <button
                   onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                   className="p-1 hover:bg-gray-100 rounded"
                 >
                   <ChevronRightIcon className="h-3 w-3" />
                 </button>
               </div>

                             {/* Day names */}
               <div className="grid grid-cols-7 gap-1 mb-2">
                 {dayNames.map((day) => (
                   <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                     {day}
                   </div>
                 ))}
               </div>

               {/* Calendar grid */}
               <div className="grid grid-cols-7 gap-1">
                 {days.map((day, index) => (
                   <button
                     key={index}
                     onClick={() => day.isCurrentMonth && handleDateSelect(day.date)}
                     disabled={!day.isCurrentMonth}
                     className={`
                       p-1.5 text-xs rounded-lg transition-colors
                       ${!day.isCurrentMonth 
                         ? 'text-gray-300 cursor-default' 
                         : 'hover:bg-gray-100 cursor-pointer'
                       }
                       ${day.isCurrentMonth && selectedDate.toDateString() === day.date.toDateString()
                         ? 'bg-black text-white'
                         : 'text-gray-900'
                       }
                     `}
                   >
                     {day.date.getDate()}
                   </button>
                 ))}
               </div>
             </div>

             {/* Time Slots */}
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
               <h3 className="text-base font-semibold text-gray-900 mb-3">
                 {formatDate(selectedDate)}
               </h3>
               
               <div className="grid grid-cols-3 gap-2">
                                 {timeSlots.map((slot) => (
                   <button
                     key={slot.time}
                     onClick={() => slot.available && handleTimeSelect(slot.time)}
                     disabled={!slot.available}
                     className={`
                       p-2 text-xs rounded-lg transition-colors
                       ${!slot.available
                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                         : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                       }
                       ${selectedTime === slot.time
                         ? 'bg-black text-white'
                         : 'text-gray-900'
                       }
                     `}
                   >
                     {slot.time}
                   </button>
                 ))}
               </div>
             </div>
           </div>

           {/* Right Column - Summary */}
           <div className="space-y-4">
             {/* Business Info */}
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
               <div className="text-center">
                 <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                   {business.profilePic ? (
                     <img 
                       src={business.profilePic} 
                       alt={business.name}
                       className="w-full h-full rounded-full object-cover"
                     />
                   ) : (
                     <span className="text-lg font-bold text-gray-600">
                       {business.name.charAt(0).toUpperCase()}
                     </span>
                   )}
                 </div>
                 <h3 className="text-base font-semibold text-gray-900 mb-1">{business.name}</h3>
                 <p className="text-xs text-gray-600">5.0 ⭐ 7 reviews</p>
               </div>
             </div>

             {/* Summary */}
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
               <h3 className="text-base font-semibold text-gray-900 mb-3">Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Service</span>
                  <span className="text-sm font-medium text-gray-900">{selectedService.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="text-sm font-medium text-gray-900">{formatDuration(selectedService.duration)}</span>
                </div>
                                 {selectedTeamMember && (
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Provider</span>
                     <span className="text-sm font-medium text-gray-900">{selectedTeamMember.name}</span>
                   </div>
                 )}
                                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600">Price</span>
                   <span className="text-sm font-medium text-gray-900">{formatPrice(selectedService.price)}</span>
                 </div>
              </div>

                             <button
                 onClick={handleContinue}
                 disabled={!selectedTime}
                 className={`
                   w-full mt-4 py-2 px-3 rounded-lg font-medium transition-colors text-sm
                   ${selectedTime
                     ? 'bg-black text-white hover:bg-gray-800'
                     : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                   }
                 `}
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