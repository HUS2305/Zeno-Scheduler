"use client";

import { useState } from "react";
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

interface CalendarWrapperProps {
  weekBookings: Booking[];
  bookingsByDay: Record<string, Booking[]>;
}

export default function CalendarWrapper({ weekBookings, bookingsByDay }: CalendarWrapperProps) {
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

  const handleWeekChange = (startDate: Date, endDate: Date) => {
    setCurrentStartOfWeek(startDate);
    setCurrentEndOfWeek(endDate);
  };

  return (
    <InteractiveCalendar
      startOfWeek={currentStartOfWeek}
      endOfWeek={currentEndOfWeek}
      today={today}
      weekBookings={weekBookings}
      bookingsByDay={bookingsByDay}
      onWeekChange={handleWeekChange}
    />
  );
} 