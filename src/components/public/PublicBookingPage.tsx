"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, ArrowRightIcon, CalendarIcon, ShareIcon, UserIcon } from "@heroicons/react/24/outline";
import ServiceCard from "./ServiceCard";
import TeamMemberCard from "./TeamMemberCard";
import BookingSidebar from "./BookingSidebar";
import BusinessHours from "./BusinessHours";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number | null;
  colorTheme: string;
  teamLinks: Array<{
    teamMember: {
      id: string;
      name: string;
    };
  }>;
}

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
}

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
  services: Service[];
  team: TeamMember[];
  openingHours: OpeningHour[];
}

interface PublicBookingPageProps {
  business: Business;
  servicesByCategory: Record<string, Service[]>;
}

export default function PublicBookingPage({ business, servicesByCategory }: PublicBookingPageProps) {
  const [activeTab, setActiveTab] = useState("Services");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !(prev[categoryName] ?? true), // Default to true if not set
    }));
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex space-x-6">
              {["Services", "Team", "Gallery", "Reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === tab
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex space-x-3">
              <button className="p-1 text-gray-600 hover:text-gray-900">
                <ShareIcon className="h-4 w-4" />
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-900">
                <UserIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-white py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
              {business.profilePic ? (
                <img 
                  src={business.profilePic} 
                  alt={business.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-indigo-600">
                  {business.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{business.name}</h1>
            <p className="text-sm text-gray-600">Professional services at your convenience</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Services</h2>
              
              <div className="space-y-3">
                {Object.entries(servicesByCategory)
                  .filter(([categoryName, services]) => services.length > 0) // Only show categories with services
                  .map(([categoryName, services]) => (
                    <div key={categoryName}>
                      <div 
                        className="flex items-center justify-between cursor-pointer mb-2"
                        onClick={() => toggleCategory(categoryName)}
                      >
                        <h3 className="text-sm font-medium text-gray-700">{categoryName}</h3>
                        {expandedCategories[categoryName] !== false ? (
                          <ChevronUpIcon className="h-3 w-3 text-gray-500" />
                        ) : (
                          <ChevronDownIcon className="h-3 w-3 text-gray-500" />
                        )}
                      </div>
                      {expandedCategories[categoryName] !== false && (
                        <div className="space-y-2">
                          {services.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Team Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Team</h2>
              
              <div className="space-y-2">
                {business.team.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>

            {/* Good to know Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Good to know</h2>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Booking policy</span>
                  <ArrowRightIcon className="h-3 w-3 ml-auto text-gray-400" />
                </div>
              </div>
            </div>

            {/* Gallery Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Gallery</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                  <span className="text-xs text-gray-500">Gallery images coming soon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Sidebar */}
          <div className="lg:col-span-1">
            <BookingSidebar business={business} />
          </div>
        </div>
      </div>
    </div>
  );
} 