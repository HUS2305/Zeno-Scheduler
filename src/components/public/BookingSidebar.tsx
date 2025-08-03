"use client";

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

  return (
    <div className="bg-white rounded-lg p-4 sticky top-8 shadow-sm border border-gray-200">
      {/* Business Name */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">{business.name}</h2>

      {/* Book Button */}
      <button 
        onClick={() => window.location.href = `/b/${business.id}/book`}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-4"
      >
        Book
      </button>

      {/* Business Hours */}
      <BusinessHours openingHours={business.openingHours} />
    </div>
  );
} 