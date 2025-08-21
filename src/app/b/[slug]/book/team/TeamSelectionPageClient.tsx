"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  profilePic?: string | null;
}

interface Business {
  id: string;
  name: string;
  profilePic: string | null;
  teamMembers: TeamMember[];
  theme?: string | null;
  brandColor?: string | null;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface TeamSelectionPageClientProps {
  business: Business;
  serviceId: string;
  selectedService: Service;
  slug: string;
}

export default function TeamSelectionPageClient({ business, serviceId, selectedService, slug }: TeamSelectionPageClientProps) {
  const router = useRouter();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} mins`;
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Free';
    return `kr ${price}`;
  };

  const handleTeamMemberSelect = (teamMember: TeamMember) => {
    router.push(`/b/${business.id}/book/time?serviceId=${serviceId}&teamMemberId=${teamMember.id}`);
  };

  // Apply theme and brand color
  const theme = business.theme || 'light';
  const brandColor = business.brandColor || '#000000';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
             {/* Header */}
       <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center h-10">
                           <button
                onClick={() => router.back()}
                className={`flex items-center ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'} mr-3`}
              >
                <ArrowLeftIcon className="h-4 w-4 font-bold" />
              </button>
             <h1 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Select a team member</h1>
           </div>
         </div>
       </div>

       

               {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {/* Left Column - Team Members */}
           <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border overflow-hidden`}>
             {/* Team Members Section */}
             <div className="p-4">
               <h2 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>Team Members</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {business.teamMembers.map((member) => (
                                     <div
                       key={member.id}
                       onClick={() => handleTeamMemberSelect(member)}
                       className={`${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'} rounded-lg p-3 cursor-pointer transition-colors border`}
                       style={{
                         borderColor: theme === 'dark' ? undefined : (brandColor !== '#000000' ? `${brandColor}20` : undefined),
                       }}
                     >
                       <div className="text-center">
                         <div className={`w-12 h-12 mx-auto mb-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                           {member.profilePic ? (
                             <img
                               src={member.profilePic}
                               alt={member.name}
                               className="w-full h-full rounded-full object-cover"
                             />
                           ) : (
                             <span className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                               {member.name.charAt(0).toUpperCase()}
                             </span>
                           )}
                         </div>
                         <h3 className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} mb-2`}>{member.name}</h3>
                         <button 
                           className={`w-full text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors ${
                             theme === 'dark' ? 'hover:bg-gray-600' : 'hover:opacity-90'
                           }`}
                           style={{
                             backgroundColor: brandColor,
                           }}
                         >
                           Book
                         </button>
                       </div>
                     </div>
                ))}
                
                                 {/* Skip option */}
                 <div
                   onClick={() => router.push(`/b/${business.id}/book/time?serviceId=${serviceId}`)}
                   className={`${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'} rounded-lg p-3 cursor-pointer transition-colors border`}
                 >
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} rounded-full flex items-center justify-center`}>
                      <span className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>?</span>
                    </div>
                    <h3 className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} mb-2`}>No preference</h3>
                    <button className={`w-full ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-600 hover:bg-gray-700'} text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors`}>
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-4">
            {/* Business Info */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                  {business.profilePic ? (
                    <img 
                      src={business.profilePic} 
                      alt={business.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {business.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>{business.name}</h3>
              </div>
            </div>

            {/* Summary */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
              <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Service</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedService.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Duration</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatDuration(selectedService.duration)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Provider</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Not selected</span>
                </div>
                                 <div className="flex justify-between items-center">
                   <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Date & Time</span>
                   <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Not selected</span>
                 </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Price</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatPrice(selectedService.price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 