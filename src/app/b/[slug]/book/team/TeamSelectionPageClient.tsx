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

interface TeamSelectionPageClientProps {
  business: Business;
  serviceId: string;
}

export default function TeamSelectionPageClient({ business, serviceId }: TeamSelectionPageClientProps) {
  const router = useRouter();

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
           {/* Team Members Section */}
           <div className="p-4">
             <h2 className="text-base font-semibold text-gray-900 mb-3">Team Members</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 