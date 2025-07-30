"use client";

import { useState, useEffect } from "react";
import InteractiveCalendar from "./InteractiveCalendar";

interface Booking {
  id: string;
  date: Date;
  service: {
    name: string;
    duration?: number;
  };
  user: {
    email: string;
  };
}

export default function CalendarWrapper() {
  const [weekBookings, setWeekBookings] = useState<Booking[]>([]);
  const [bookingsByDay, setBookingsByDay] = useState<Record<string, Booking[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date();
  const [currentStartOfWeek, setCurrentStartOfWeek] = useState(() => {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
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
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const bookings = await response.json();
        
        // Filter bookings for current week
        const weekBookings = bookings.filter((booking: any) => {
          const bookingDate = new Date(booking.date);
          return bookingDate >= currentStartOfWeek && bookingDate <= currentEndOfWeek;
        });
        
        // Group bookings by day
        const bookingsByDay: Record<string, Booking[]> = {};
        weekBookings.forEach((booking: any) => {
          const dateKey = new Date(booking.date).toDateString();
          if (!bookingsByDay[dateKey]) {
            bookingsByDay[dateKey] = [];
          }
          bookingsByDay[dateKey].push(booking);
        });
        
        setWeekBookings(weekBookings);
        setBookingsByDay(bookingsByDay);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
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
    />
  );
} 