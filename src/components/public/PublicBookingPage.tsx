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
  industry?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  country?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  theme?: string | null;
  brandColor?: string | null;
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
  const infoRef = useRef<HTMLDivElement>(null);

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
      case "Info":
        targetRef = infoRef;
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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
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

  // Apply theme and brand color
  const theme = business.theme || 'light';
  const brandColor = business.brandColor || '#000000';
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sticky Top Navigation Bar */}
      <div className={`sticky top-0 z-50 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex space-x-6">
              {["Services", "Team", "Info"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => scrollToSection(tab)}
                  className={`px-2 py-1 text-xs font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? 'border-b-2'
                      : theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'
                  }`}
                  style={activeTab === tab ? { 
                    color: brandColor, 
                    borderColor: brandColor 
                  } : {
                    color: theme === 'dark' ? 'rgb(209 213 219)' : 'rgb(75 85 99)'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className={`relative ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} py-12 border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 
              className={`${hasTagline ? 'text-4xl mb-3' : 'text-5xl mb-0'} font-bold`}
              style={{ color: brandColor !== '#000000' ? brandColor : (theme === 'dark' ? 'white' : 'rgb(17 24 39)') }}
            >
              {business.name}
            </h1>
            {hasTagline && (
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{effectiveTagline}</p>
            )}
            {business.industry && (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>{business.industry}</p>
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
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border overflow-hidden`}>
              {/* Services Section */}
              <div ref={servicesRef} className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Services</h2>
                
                <div className="space-y-3">
                  {Object.entries(servicesByCategory)
                    .filter(([categoryName, services]) => services.length > 0) // Only show categories with services
                    .map(([categoryName, services]) => (
                      <div key={categoryName}>
                        <div 
                          className="flex items-center justify-between cursor-pointer mb-2"
                          onClick={() => toggleCategory(categoryName)}
                        >
                          <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{categoryName}</h3>
                          {expandedCategories[categoryName] === true ? (
                            <ChevronUpIcon className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          ) : (
                            <ChevronDownIcon className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                        </div>
                        {expandedCategories[categoryName] === true && (
                          <div className="space-y-2">
                            {services.map((service) => (
                              <ServiceCard key={service.id} service={service} theme={theme} brandColor={brandColor} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Team Section */}
              <div ref={teamRef} className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Team</h2>
                
                <div className="space-y-2">
                  {business.team.map((member) => (
                    <TeamMemberCard key={member.id} member={member} theme={theme} brandColor={brandColor} />
                  ))}
                </div>
              </div>

              {/* Info Section */}
              <div ref={infoRef} className={`p-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>


                {/* About Section */}
                {hasAbout && (
                  <div className="mb-6">
                    <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>About</h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} whitespace-pre-line`}>{effectiveAbout}</p>
                  </div>
                )}




              </div>
            </div>
          </div>

          {/* Right Column - Booking Sidebar */}
          <div className="lg:col-span-1">
            <BookingSidebar business={business} theme={theme} brandColor={brandColor} />
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg transition-colors z-40"
          style={{ backgroundColor: brandColor, color: 'white' }}
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
} 