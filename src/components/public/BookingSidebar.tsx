"use client";

import { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import BusinessHours from "./BusinessHours";

interface OpeningHour {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

interface Business {
  id: string;
  name: string;
  profilePic: string | null;
  openingHours: OpeningHour[];
}

interface BookingSidebarProps {
  business: Business;
}

export default function BookingSidebar({ business }: BookingSidebarProps) {
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);

  const getCurrentStatus = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const todayHours = business.openingHours.find(hour => hour.dayOfWeek === currentDay);
    
    if (!todayHours) {
      return "Closed";
    }

    if (currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime) {
      return "Open";
    } else if (currentTime < todayHours.openTime) {
      return `Closed - Opens ${todayHours.openTime}`;
    } else {
      return "Closed";
    }
  };

  const getNextOpenDay = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const dayHours = business.openingHours.find(hour => hour.dayOfWeek === checkDay);
      if (dayHours) {
        return `${dayHours.openTime} ${dayNames[checkDay]}`;
      }
    }
    return "";
  };

  const currentStatus = getCurrentStatus();
  const nextOpenDay = getNextOpenDay();

  return (
    <div className="bg-white rounded-lg p-4 sticky top-8 shadow-sm border border-gray-200">
      {/* Business Name */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">{business.name}</h2>

      {/* Book Button */}
      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-4">
        Book
      </button>

      {/* Current Status */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">
            {currentStatus}
            {currentStatus.includes("Closed") && nextOpenDay && (
              <span className="ml-1"> {nextOpenDay}</span>
            )}
          </span>
          <button
            onClick={() => setIsHoursExpanded(!isHoursExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isHoursExpanded ? (
              <ChevronUpIcon className="h-3 w-3" />
            ) : (
              <ChevronDownIcon className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Business Hours */}
      {isHoursExpanded && (
        <BusinessHours openingHours={business.openingHours} />
      )}

      {/* Time Zone */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Time zone (Central European Summer Time)
        </p>
      </div>
    </div>
  );
} 