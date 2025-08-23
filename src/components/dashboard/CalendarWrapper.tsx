"use client";

import { useState, useEffect } from "react";
import InteractiveCalendar from "./InteractiveCalendar";

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

export default function CalendarWrapper({ userProfileName }: { userProfileName?: string }) {
  const [weekBookings, setWeekBookings] = useState<Booking[]>([]);
  const [bookingsByDay, setBookingsByDay] = useState<Record<string, Booking[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const today = new Date();
  
  // Profile updates are handled by the SettingsClient which forces a complete session refresh
  const [currentStartOfWeek, setCurrentStartOfWeek] = useState(() => {
    const startOfWeek = new Date(today);
    // Adjust to start week on Monday (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, subtract 6 to get to Monday
    startOfWeek.setDate(today.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  });

  const [currentEndOfWeek, setCurrentEndOfWeek] = useState(() => {
    const endOfWeek = new Date(currentStartOfWeek);
    endOfWeek.setDate(currentStartOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  });

  const fetchBookings = async () => {
    try {
      // Format dates for API call
      const startDate = currentStartOfWeek.toISOString().split('T')[0];
      const endDate = currentEndOfWeek.toISOString().split('T')[0];
      
      console.log('Fetching bookings for week:', { startDate, endDate, currentStartOfWeek, currentEndOfWeek });
      
      const response = await fetch(`/api/bookings?startDate=${startDate}&endDate=${endDate}`);
      if (response.ok) {
        const bookings = await response.json();
        
        console.log('Received bookings:', bookings.length);
        
        // Group bookings by day
        const bookingsByDay: Record<string, Booking[]> = {};
        bookings.forEach((booking: any) => {
          const dateKey = new Date(booking.date).toDateString();
          if (!bookingsByDay[dateKey]) {
            bookingsByDay[dateKey] = [];
          }
          bookingsByDay[dateKey].push(booking);
        });
        
        console.log('Bookings by day:', Object.keys(bookingsByDay).length);
        
        setWeekBookings(bookings);
        setBookingsByDay(bookingsByDay);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBusiness = async () => {
    try {
      const response = await fetch('/api/business');
      if (response.ok) {
        const businessData = await response.json();
        setBusiness(businessData);
      }
    } catch (error) {
      console.error("Error fetching business:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchBusiness();
  }, [currentStartOfWeek, currentEndOfWeek]);

  const handleWeekChange = (startDate: Date, endDate: Date) => {
    setCurrentStartOfWeek(startDate);
    setCurrentEndOfWeek(endDate);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <InteractiveCalendar
      startOfWeek={currentStartOfWeek}
      endOfWeek={currentEndOfWeek}
      today={today}
      weekBookings={weekBookings}
      bookingsByDay={bookingsByDay}
      onWeekChange={handleWeekChange}
      onAppointmentCreated={fetchBookings}
      userProfileName={userProfileName}
      timeFormat={business?.timeFormat || "24"}
    />
  );
} 