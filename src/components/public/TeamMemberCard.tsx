"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
}

interface TeamMemberCardProps {
  member: TeamMember;
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
      {/* Avatar */}
      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
        <span className="text-sm font-semibold text-indigo-600">
          {member.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Member Details */}
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
        {member.email && (
          <p className="text-xs text-gray-600">{member.email}</p>
        )}
      </div>

      {/* Arrow */}
      <ArrowRightIcon className="h-4 w-4 text-gray-400" />
    </div>
  );
} 