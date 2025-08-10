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
  team: TeamMember[];
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
}

export default function TeamSelectionPageClient({ business, serviceId, selectedService }: TeamSelectionPageClientProps) {
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
             <h1 className="text-base font-semibold text-gray-900">Select a team member</h1>
           </div>
         </div>
       </div>

       

               {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {/* Left Column - Team Members */}
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             {/* Team Members Section */}
             <div className="p-4">
               <h2 className="text-base font-semibold text-gray-900 mb-3">Team Members</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {business.team.map((member) => (
                                     <div
                       key={member.id}
                       onClick={() => handleTeamMemberSelect(member)}
                       className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                     >
                       <div className="text-center">
                         <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                           {member.profilePic ? (
                             <img
                               src={member.profilePic}
                               alt={member.name}
                               className="w-full h-full rounded-full object-cover"
                             />
                           ) : (
                             <span className="text-lg font-bold text-gray-600">
                               {member.name.charAt(0).toUpperCase()}
                             </span>
                           )}
                         </div>
                         <h3 className="text-xs font-medium text-gray-900 mb-2">{member.name}</h3>
                         <button className="w-full bg-black text-white text-xs font-medium py-1.5 px-3 rounded-lg hover:bg-gray-800 transition-colors">
                           Book
                         </button>
                       </div>
                     </div>
                ))}
                
                {/* Skip option */}
                <div
                  onClick={() => router.push(`/b/${business.id}/book/time?serviceId=${serviceId}`)}
                  className="bg-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">?</span>
                    </div>
                    <h3 className="text-xs font-medium text-gray-900 mb-2">No preference</h3>
                    <button className="w-full bg-gray-600 text-white text-xs font-medium py-1.5 px-3 rounded-lg hover:bg-gray-700 transition-colors">
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
                  <span className="text-sm font-medium text-gray-900">{selectedService.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="text-sm font-medium text-gray-900">{formatDuration(selectedService.duration)}</span>
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
                  <span className="text-sm font-medium text-gray-900">{formatPrice(selectedService.price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 