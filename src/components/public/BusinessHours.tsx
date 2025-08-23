"use client";

import { formatTime } from "@/lib/time-utils";

interface BusinessHoursProps {
  openingHours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
  }>;
  theme?: 'light' | 'dark';
  timeFormat?: string;
}

export default function BusinessHours({ openingHours, theme = 'light', timeFormat = "24" }: BusinessHoursProps) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const formatTimeDisplay = (time: string) => {
    return formatTime(time, timeFormat);
  };

  const getDayHours = (dayIndex: number) => {
    return openingHours.find(hour => hour.dayOfWeek === dayIndex);
  };

  return (
    <div className="space-y-3">
      {dayNames.map((dayName, index) => {
        const dayHours = getDayHours(index);
        const isToday = new Date().getDay() === index;

        return (
          <div key={dayName} className="flex justify-between items-center text-xs">
            <span className={`${isToday ? 'font-medium' : ''} ${
              isToday 
                ? (theme === 'dark' ? 'text-white' : 'text-black')
                : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')
            }`}>
              {dayName}
            </span>
            <span className={`${isToday ? 'font-medium' : ''} ${
              isToday 
                ? (theme === 'dark' ? 'text-white' : 'text-black')
                : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')
            }`}>
              {dayHours ? `${formatTimeDisplay(dayHours.openTime)} - ${formatTimeDisplay(dayHours.closeTime)}` : 'Closed'}
            </span>
          </div>
        );
      })}
    </div>
  );
} 