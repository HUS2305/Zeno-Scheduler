"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
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
  tagline?: string | null;
  about?: string | null;
  industry?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  country?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  openingHours: OpeningHour[];
}

interface BookingSidebarProps {
  business: Business;
  theme: string;
  brandColor: string;
}

export default function BookingSidebar({ business, theme, brandColor }: BookingSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    businessHours: true,
    contactUs: true,
    findUs: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={`rounded-lg p-4 sticky top-8 shadow-sm border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Business Name */}
      <h2 className={`text-lg font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>{business.name}</h2>

      {/* Book Button */}
      <button 
        onClick={() => window.location.href = `/b/${business.id}/book`}
        className="w-full font-semibold py-2 px-4 rounded-lg transition-colors mb-4 text-white hover:opacity-90"
        style={{ backgroundColor: brandColor }}
      >
        Book
      </button>

      {/* Business Hours */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer mb-4"
          onClick={() => toggleSection('businessHours')}
        >
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Business Hours</h2>
          {expandedSections.businessHours ? (
            <ChevronUpIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          ) : (
            <ChevronDownIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          )}
        </div>
        {expandedSections.businessHours && (
          <BusinessHours openingHours={business.openingHours} theme={theme} brandColor={business.brandColor} />
        )}
      </div>

      {/* Contact Us Section */}
      {(business.contactEmail || business.contactPhone) && (
        <div className="mb-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => toggleSection('contactUs')}
          >
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contact Us</h2>
            {expandedSections.contactUs ? (
              <ChevronUpIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <ChevronDownIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </div>
          {expandedSections.contactUs && (
          <div className="space-y-3">
            {business.contactEmail && (
              <div className="flex items-center space-x-2">
                <svg className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{business.contactEmail}</span>
              </div>
            )}
            {business.contactPhone && (
              <div className="flex items-center space-x-2">
                <svg className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{business.contactPhone}</span>
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {/* Find Us Section */}
      {(business.address || business.city || business.state || business.zipCode || business.country) && (
        <div className="mb-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => toggleSection('findUs')}
          >
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Find Us</h2>
            {expandedSections.findUs ? (
              <ChevronUpIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <ChevronDownIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </div>
          {expandedSections.findUs && (
          <div className="flex items-start space-x-2">
            <svg className={`h-4 w-4 mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {[
                business.address,
                business.city,
                business.state,
                business.zipCode,
                business.country
              ].filter(Boolean).join(', ')}
            </span>
          </div>
          )}
        </div>
      )}
    </div>
  );
} 