"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import ServiceCard from "@/components/public/ServiceCard";

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

interface Business {
  id: string;
  name: string;
  profilePic: string | null;
  services: Service[];
  team: TeamMember[];
  openingHours: any[];
}

interface BookingPageClientProps {
  business: Business;
  servicesByCategory: Record<string, Service[]>;
}

export default function BookingPageClient({ business, servicesByCategory }: BookingPageClientProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !(prev[categoryName] ?? false),
    }));
  };

  const handleServiceSelect = (service: Service) => {
    // Navigate to team member selection or time selection based on team size
    if (business.team.length === 1) {
      // Skip team selection if only one member
      router.push(`/b/${business.id}/book/time?serviceId=${service.id}&teamMemberId=${business.team[0].id}`);
    } else if (business.team.length > 1) {
      router.push(`/b/${business.id}/book/team?serviceId=${service.id}`);
    } else {
      // No team members - this shouldn't happen but handle it gracefully
      router.push(`/b/${business.id}/book/time?serviceId=${service.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
             {/* Header */}
       <div className="bg-white border-b border-gray-200 shadow-sm">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center h-10">
                           <button
                onClick={() => router.back()}
                className="flex items-center text-black hover:text-gray-700 mr-3"
              >
                <ArrowLeftIcon className="h-4 w-4 font-bold" />
              </button>
             <h1 className="text-base font-semibold text-gray-900">Select a service</h1>
           </div>
         </div>
       </div>

       

                             {/* Main Content */}
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Services */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Services</h2>
               
               <div className="space-y-3">
                 {Object.entries(servicesByCategory)
                   .filter(([categoryName, services]) => services.length > 0)
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
                             <div
                               key={service.id}
                               onClick={() => handleServiceSelect(service)}
                               className="cursor-pointer"
                             >
                               <ServiceCard service={service} />
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   ))}
               </div>
             </div>
           </div>

                       {/* Right Column - Business Info and Summary */}
            <div className="space-y-4">
              {/* Business Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                    {business.profilePic ? (
                      <img 
                        src={business.profilePic} 
                        alt={business.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-600">
                        {business.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{business.name}</h3>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Summary</h3>
               
               <div className="space-y-3">
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600">Service</span>
                   <span className="text-sm font-medium text-gray-900">Not selected</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600">Duration</span>
                   <span className="text-sm font-medium text-gray-900">Not selected</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600">Provider</span>
                   <span className="text-sm font-medium text-gray-900">Not selected</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600">Date & Time</span>
                   <span className="text-sm font-medium text-gray-900">Not selected</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600">Price</span>
                   <span className="text-sm font-medium text-gray-900">Not selected</span>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
    </div>
  );
} 