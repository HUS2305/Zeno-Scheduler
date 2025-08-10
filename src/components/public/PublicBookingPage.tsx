"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon, ArrowRightIcon, CalendarIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
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
  tagline?: string | null;
  about?: string | null;
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [liveTagline, setLiveTagline] = useState<string | null | undefined>(business.tagline);
  const [liveAbout, setLiveAbout] = useState<string | null | undefined>(business.about);

  // Refs for smooth scrolling
  const servicesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !(prev[categoryName] ?? false), // Default to false if not set
    }));
  };

  const scrollToSection = (sectionName: string) => {
    setActiveTab(sectionName);
    
    let targetRef: React.RefObject<HTMLDivElement | null> | null = null;
    switch (sectionName) {
      case "Services":
        targetRef = servicesRef;
        break;
      case "Team":
        targetRef = teamRef;
        break;
    }

    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle scroll events for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // On mount, read cookies (set by Settings save) to hydrate tagline/about after a full refresh
  useEffect(() => {
    try {
      const readCookie = (name: string) => {
        const match = document.cookie
          .split('; ')
          .find((row) => row.startsWith(name + '='));
        if (!match) return null;
        const value = decodeURIComponent(match.split('=')[1] || '');
        return value && value.trim().length > 0 ? value : null;
      };
      const cookieTagline = readCookie('brand_tagline');
      const cookieAbout = readCookie('brand_about');
      if (cookieTagline !== null) setLiveTagline(cookieTagline);
      if (cookieAbout !== null) setLiveAbout(cookieAbout);
    } catch {}
  }, []);

  // Removed live cross-tab updates to require explicit refresh for changes to appear

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const effectiveTagline = (liveTagline ?? business.tagline)?.trim() || null;
  const effectiveAbout = (liveAbout ?? business.about)?.trim() || null;
  const hasTagline = Boolean(effectiveTagline);
  const hasAbout = Boolean(effectiveAbout);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Sticky Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex space-x-6">
              {["Services", "Team"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => scrollToSection(tab)}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    activeTab === tab
                      ? "text-black border-b-2 border-black"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

             {/* Hero Section */}
       <div className="relative bg-white py-12 border-b border-gray-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className={`${hasTagline ? 'text-4xl mb-3' : 'text-5xl mb-0'} font-bold text-gray-900`}>{business.name}</h1>
              {hasTagline && (
                <p className="text-lg text-gray-600">{effectiveTagline}</p>
              )}
            </div>
         </div>
       </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Combined Content Block */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Services Section */}
              <div ref={servicesRef} className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
                
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
                          {expandedCategories[categoryName] === true ? (
                            <ChevronUpIcon className="h-3 w-3 text-gray-500" />
                          ) : (
                            <ChevronDownIcon className="h-3 w-3 text-gray-500" />
                          )}
                        </div>
                        {expandedCategories[categoryName] === true && (
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
              <div ref={teamRef} className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Team</h2>
                
                <div className="space-y-2">
                  {business.team.map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>

              {/* Policies Section */}
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Policies</h2>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Booking policy</span>
                    <ArrowRightIcon className="h-3 w-3 ml-auto text-gray-400" />
                  </div>
                </div>
              </div>

              {/* About Section */}
              {hasAbout && (
                <div className="p-6 pt-0">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{effectiveAbout}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Sidebar */}
          <div className="lg:col-span-1">
            <BookingSidebar business={business} />
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
                 <button
           onClick={scrollToTop}
           className="fixed bottom-6 right-6 p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors z-40"
         >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
} 